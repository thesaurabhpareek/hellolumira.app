/**
 * @module CheckinConversationAPI
 * @description POST /api/checkin-conversation — Conversational daily check-in.
 *   Manages the multi-turn check-in flow, calling Claude for conversational
 *   responses with structured field extraction, and upserting daily check-in
 *   records. Detects emotional signals and updates parent profile state.
 * @version 1.0.0
 * @since March 2026
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { MASTER_SYSTEM_PROMPT, callClaudeJSON } from '@/lib/claude'
import { buildContextBlock } from '@/lib/context-builder'
import { getBabyAgeInfo } from '@/lib/baby-age'
import { inferEmotionalSignal } from '@/lib/emotional-signals'
import { checkRateLimit } from '@/lib/rate-limit'
import { isValidUUID, validateArray, verifyBabyOwnership } from '@/lib/validation'
import { sanitizeForPrompt } from '@/lib/sanitize-prompt'
import { SECURITY_HEADERS } from '@/lib/utils'
import type { Stage, ConversationMessage, EmotionalSignal, BabyProfile } from '@/types/app'

const CHECKIN_SYSTEM_PROMPT = `You are conducting a warm, brief daily check-in. Ask ONE question at a time. Keep messages short (1-3 sentences). Be genuinely curious.

When you have enough context, return structured fields for quick data capture.

Respond ONLY with valid JSON (no markdown fences):
{
  "message": "your conversational response",
  "structured_fields": [
    {
      "id": "field_id",
      "label": "Field label",
      "options": [{"value": "val", "label": "Label", "emoji": "optional"}]
    }
  ] | null,
  "emotional_signal": "ok" | "tired" | "struggling" | "distressed" | null,
  "checkin_complete": true | false
}

Only include structured_fields when you have gathered enough conversational context to warrant a quick log. The fields should match what's relevant for this stage (pregnancy: nausea_level, energy_level, kept_food_down; infant: sleep_quality, night_wakings, feeding, mood, diapers).`

interface CheckinRequest {
  baby_id: string
  profile_id: string
  stage: Stage
  message: string
  is_opening: boolean
  conversation_so_far: ConversationMessage[]
}

export async function POST(request: NextRequest) {
  try {
    let body: CheckinRequest
    try {
      body = (await request.json()) as CheckinRequest
    } catch {
      return NextResponse.json({ error: true, message: 'Invalid JSON body' }, { status: 400, headers: SECURITY_HEADERS })
    }

    // Validate required fields
    if (!body.baby_id || typeof body.baby_id !== 'string') {
      return NextResponse.json({ error: true, message: 'Missing required field: baby_id' }, { status: 400, headers: SECURITY_HEADERS })
    }
    if (!isValidUUID(body.baby_id)) {
      return NextResponse.json({ error: true, message: 'Invalid baby_id format' }, { status: 400, headers: SECURITY_HEADERS })
    }
    if (!body.profile_id || typeof body.profile_id !== 'string') {
      return NextResponse.json({ error: true, message: 'Missing required field: profile_id' }, { status: 400, headers: SECURITY_HEADERS })
    }
    if (!isValidUUID(body.profile_id)) {
      return NextResponse.json({ error: true, message: 'Invalid profile_id format' }, { status: 400, headers: SECURITY_HEADERS })
    }
    const VALID_STAGES: Stage[] = ['pregnancy', 'infant', 'toddler']
    if (!body.stage || !VALID_STAGES.includes(body.stage)) {
      return NextResponse.json({ error: true, message: 'Invalid or missing stage' }, { status: 400, headers: SECURITY_HEADERS })
    }
    if (typeof body.is_opening !== 'boolean') {
      return NextResponse.json({ error: true, message: 'is_opening must be a boolean' }, { status: 400, headers: SECURITY_HEADERS })
    }
    if (!body.is_opening && (!body.message || typeof body.message !== 'string')) {
      return NextResponse.json({ error: true, message: 'Missing required field: message' }, { status: 400, headers: SECURITY_HEADERS })
    }
    const convArrayError = validateArray(body.conversation_so_far, 'conversation_so_far', { maxLength: 100 })
    if (convArrayError) {
      return NextResponse.json({ error: true, message: convArrayError }, { status: 400, headers: SECURITY_HEADERS })
    }

    const { baby_id, profile_id, stage, is_opening, conversation_so_far } = body
    // Sanitize message: trim and enforce max length
    const message = body.message ? sanitizeForPrompt(body.message.trim().slice(0, 5000)) : ''

    const supabase = await createClient()

    // Verify auth
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user || user.id !== profile_id) {
      return NextResponse.json({ error: true, message: 'Unauthorized' }, { status: 401, headers: SECURITY_HEADERS })
    }

    // Verify user is a member of this baby profile (IDOR prevention)
    const isMember = await verifyBabyOwnership(supabase, user.id, baby_id)
    if (!isMember) {
      return NextResponse.json({ error: true, message: 'Access denied' }, { status: 403, headers: SECURITY_HEADERS })
    }

    // Fetch baby and profile in parallel with specific columns
    const [{ data: babyData }, { data: profileData }] = await Promise.all([
      supabase.from('baby_profiles').select('id, name, due_date, date_of_birth, stage, pending_proactive_type, pending_proactive_set_at, created_by_profile_id, created_at').eq('id', baby_id).single(),
      supabase.from('profiles').select('id, first_name, first_time_parent, first_checkin_complete, emotional_state_latest').eq('id', profile_id).single(),
    ])

    if (!babyData || !profileData) {
      return NextResponse.json(
        { error: true, message: 'Lumira is taking a moment. Try again.' },
        { status: 404, headers: SECURITY_HEADERS }
      )
    }

    const baby = babyData as BabyProfile
    const ageInfo = getBabyAgeInfo(baby)

    // Build context
    let contextBlock = ''
    try {
      contextBlock = await buildContextBlock(supabase, baby_id, profile_id)
    } catch {
      // Non-fatal
    }

    // Build master system prompt
    const masterPrompt = MASTER_SYSTEM_PROMPT({
      parent_first_name: profileData.first_name,
      stage,
      baby_name: baby.name ?? undefined,
      pregnancy_week: ageInfo.pregnancy_week,
      due_date: baby.due_date ?? undefined,
      age_in_weeks: ageInfo.age_in_weeks,
      age_display_string: ageInfo.age_display_string,
    })

    const fullSystemPrompt = `${masterPrompt}\n\n---\n\nCONTEXT:\n${contextBlock}\n\n---\n\n${CHECKIN_SYSTEM_PROMPT}`

    // Build user message with conversation history
    const historyText =
      conversation_so_far.length > 0
        ? conversation_so_far
            .map((m) => `${m.role === 'lumira' ? 'Lumira' : profileData.first_name}: ${sanitizeForPrompt(String(m.content || ''))}`)
            .join('\n')
        : ''

    const userMessage = is_opening
      ? `Start the daily check-in. Stage: ${stage}. Time of day context included in system prompt.`
      : `${historyText}\n${profileData.first_name}: ${message}\n\nRespond as Lumira.`

    // Rate limiting — max 20 requests per minute per user
    const rateLimit = await checkRateLimit(user.id)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: true, message: 'You\'re sending messages too quickly. Please wait a moment and try again.' },
        { status: 429, headers: { ...SECURITY_HEADERS, 'Retry-After': String(rateLimit.retryAfter) } }
      )
    }

    // Call Claude
    const response = await callClaudeJSON<{
      message: string
      structured_fields?: Array<{
        id: string
        label: string
        options: Array<{ value: string; label: string; emoji?: string }>
      }> | null
      emotional_signal?: EmotionalSignal | null
      checkin_complete?: boolean
    }>(fullSystemPrompt, userMessage, 1000)

    // Infer emotional signal from parent message
    const inferredSignal = message ? inferEmotionalSignal(message) : null
    const finalSignal = response.emotional_signal || inferredSignal

    // Build updated conversation log
    const today = new Date().toISOString().split('T')[0]
    const now = new Date().toISOString()

    const newMessages: ConversationMessage[] = [...conversation_so_far]
    if (!is_opening && message) {
      newMessages.push({ role: 'parent', content: message, timestamp: now })
    }
    newMessages.push({ role: 'lumira', content: response.message, timestamp: now })

    // UPSERT daily checkin
    const { data: existingCheckin } = await supabase
      .from('daily_checkins')
      .select('id')
      .eq('baby_id', baby_id)
      .eq('checkin_date', today)
      .maybeSingle()

    const upsertData: Record<string, unknown> = {
      baby_id,
      profile_id,
      stage,
      checkin_date: today,
      conversation_log: newMessages,
      updated_at: now,
    }

    if (finalSignal) {
      upsertData.emotional_signal = finalSignal
    }

    if (existingCheckin?.id) {
      await supabase
        .from('daily_checkins')
        .update(upsertData)
        .eq('id', existingCheckin.id)
    } else {
      await supabase.from('daily_checkins').insert(upsertData)
    }

    // Run non-critical profile updates in parallel
    const profileUpdates: Promise<unknown>[] = []

    // Update profile emotional state if changed
    if (finalSignal && finalSignal !== profileData.emotional_state_latest) {
      profileUpdates.push(
        Promise.resolve(
          supabase
            .from('profiles')
            .update({ emotional_state_latest: finalSignal, emotional_state_updated_at: now })
            .eq('id', profile_id)
        ).then(({ error }) => {
          if (error) console.error('[checkin-conversation] Failed to update emotional state:', error.message)
        })
      )
    }

    // Mark first_checkin_complete if not already
    if (!profileData.first_checkin_complete && response.checkin_complete) {
      profileUpdates.push(
        Promise.resolve(
          supabase
            .from('profiles')
            .update({ first_checkin_complete: true })
            .eq('id', profile_id)
        ).then(({ error }) => {
          if (error) console.error('[checkin-conversation] Failed to mark first_checkin_complete:', error.message)
        })
      )
    }

    // Fire all profile updates in parallel (non-critical — never block response)
    if (profileUpdates.length > 0) {
      await Promise.all(profileUpdates).catch((err) => {
        console.error('[checkin-conversation] Profile update error (non-fatal):', err)
      })
    }

    return NextResponse.json({
      message: response.message,
      structured_fields: response.structured_fields || null,
      emotional_signal: finalSignal,
      checkin_complete: response.checkin_complete || false,
      conversation_log: newMessages,
    }, { headers: SECURITY_HEADERS })
  } catch (err) {
    console.error('[checkin-conversation] Error:', err)
    return NextResponse.json(
      { error: true, message: 'Lumira is taking a moment. Try again.' },
      { status: 500, headers: SECURITY_HEADERS }
    )
  }
}

/**
 * @module ChatAPI
 * @description POST /api/chat — General conversational chat with Lumira.
 *   Pipeline: validate -> auth -> fetch baby+profile (parallel) -> red flag scan
 *   -> emotional signal detection -> concern classification -> build context
 *   -> call Claude -> store messages -> update emotional state -> fire pattern
 *   detection (async). Emergency red flags short-circuit the pipeline and return
 *   a pre-authored response without calling Claude.
 * @version 1.0.0
 * @since March 2026
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import anthropic, { MASTER_SYSTEM_PROMPT } from '@/lib/claude'
import { buildContextBlock } from '@/lib/context-builder'
import { getBabyAgeInfo } from '@/lib/baby-age'
import { inferEmotionalSignal } from '@/lib/emotional-signals'
import { scanForRedFlags } from '@/lib/red-flag-scanner'
import { classifyConcern } from '@/lib/chat/classifier'
import { checkRateLimit } from '@/lib/rate-limit'
import { sanitizeInput, SECURITY_HEADERS } from '@/lib/utils'
import { sanitizeForPrompt } from '@/lib/sanitize-prompt'
import { isValidUUID, validateArray, verifyBabyOwnership } from '@/lib/validation'
import { logAudit } from '@/lib/audit'
import type { BabyProfile, Profile, EmotionalSignal } from '@/types/app'
import type { EscalationLevel, ConcernCategory } from '@/types/chat'

const CHAT_SYSTEM_ADDON = `
You are in a general conversation with the parent. This is NOT the daily check-in.
The parent is asking you a question or wants to talk about something.
Use MODE 1 or MODE 2 response format as defined in the system prompt above — choose the right one for the question.

Respond ONLY with valid JSON (no markdown fences):
{
  "message": "your conversational response (may include markdown)",
  "emotional_signal": "ok" | "tired" | "struggling" | "distressed" | null,
  "escalation_level": "none" | "monitor" | "call_doctor" | "urgent",
  "suggested_prompts": ["prompt1", "prompt2"] | null
}

Only include suggested_prompts for the FIRST message in a new conversation (when conversation history is empty).
`

interface ChatRequest {
  baby_id: string
  profile_id: string
  thread_id?: string
  message: string
  conversation_history: Array<{ role: 'user' | 'assistant'; content: string }>
}

export async function POST(request: NextRequest) {
  try {
    let body: ChatRequest
    try {
      body = (await request.json()) as ChatRequest
    } catch {
      return NextResponse.json(
        { error: true, message: 'Invalid JSON body' },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }

    const { baby_id, profile_id, thread_id, conversation_history } = body
    const message = sanitizeForPrompt(sanitizeInput(body.message || '', 5000))

    if (!baby_id || typeof baby_id !== 'string') {
      return NextResponse.json(
        { error: true, message: 'Missing required field: baby_id' },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }
    if (!isValidUUID(baby_id)) {
      return NextResponse.json(
        { error: true, message: 'Invalid baby_id format' },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }
    if (!profile_id || typeof profile_id !== 'string') {
      return NextResponse.json(
        { error: true, message: 'Missing required field: profile_id' },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }
    if (!isValidUUID(profile_id)) {
      return NextResponse.json(
        { error: true, message: 'Invalid profile_id format' },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }
    if (thread_id !== undefined && !isValidUUID(thread_id)) {
      return NextResponse.json(
        { error: true, message: 'Invalid thread_id format' },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }
    if (!message) {
      return NextResponse.json(
        { error: true, message: 'Missing required field: message' },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }
    const historyError = validateArray(conversation_history, 'conversation_history', {
      maxLength: 100,
    })
    if (historyError) {
      return NextResponse.json(
        { error: true, message: historyError },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }

    const supabase = await createClient()

    // 1. Verify auth
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user || user.id !== profile_id) {
      return NextResponse.json({ error: true, message: 'Unauthorized' }, { status: 401, headers: SECURITY_HEADERS })
    }

    // 2. Verify user is a member of this baby profile (IDOR prevention)
    const isMember = await verifyBabyOwnership(supabase, user.id, baby_id)
    if (!isMember) {
      return NextResponse.json({ error: true, message: 'Access denied' }, { status: 403, headers: SECURITY_HEADERS })
    }

    // 3. Fetch baby and profile in parallel with specific columns
    const [{ data: babyData }, { data: profileData }] = await Promise.all([
      supabase.from('baby_profiles').select('id, name, due_date, date_of_birth, stage, pending_proactive_type, planning_sub_option, planning_expected_month').eq('id', baby_id).single(),
      supabase.from('profiles').select('id, first_name, first_time_parent, emotional_state_latest').eq('id', profile_id).single(),
    ])

    if (!babyData || !profileData) {
      return NextResponse.json(
        { error: true, message: 'Lumira is taking a moment. Try again.' },
        { status: 404, headers: SECURITY_HEADERS }
      )
    }

    const baby = babyData as BabyProfile
    const profile = profileData as Profile
    const ageInfo = getBabyAgeInfo(baby)
    const babyAgeWeeks = ageInfo.age_in_weeks ?? 0

    // 3. RED FLAG SCANNER — runs BEFORE Claude, always
    const redFlagResult = scanForRedFlags(message, babyAgeWeeks, baby.stage)

    // 4. If emergency red flag detected → return pre-authored card, NEVER call Claude
    if (redFlagResult.level === 'emergency' && redFlagResult.preAuthoredMessage) {
      // Store in thread if thread_id exists
      if (thread_id) {
        await supabase.from('chat_messages').insert([
          {
            thread_id,
            role: 'user',
            content: message,
            escalation_level: 'emergency',
            red_flag_detected: true,
            red_flag_pattern: redFlagResult.pattern,
          },
          {
            thread_id,
            role: 'assistant',
            content: redFlagResult.preAuthoredMessage,
            escalation_level: 'emergency',
            is_structured_response: false,
            model_version: 'pre_authored',
          },
        ])

        // Update thread escalation level
        await supabase
          .from('chat_threads')
          .update({
            highest_escalation_level: 'emergency',
            last_message_at: new Date().toISOString(),
          })
          .eq('id', thread_id)
      }

      // Audit: log emergency escalation trigger (GDPR + safety compliance)
      logAudit('escalation_triggered', user.id, {
        level: 'emergency',
        pattern: redFlagResult.pattern,
        category: redFlagResult.category,
        baby_id,
        thread_id: thread_id || null,
      }, request).catch(() => {})

      return NextResponse.json({
        message: redFlagResult.preAuthoredMessage,
        thread_id: thread_id || null,
        escalation: {
          level: 'emergency' as EscalationLevel,
          category: redFlagResult.category,
          // snake_case canonical names
          immediate_action: redFlagResult.immediate_action,
          action_url: redFlagResult.action_url,
          // deprecated camelCase aliases — remove after clients migrate
          immediateAction: redFlagResult.immediateAction,
          actionUrl: redFlagResult.actionUrl,
        },
        emotional_signal: null,
        suggested_prompts: null,
      })
    }

    // 5. Emotional signal detection on every user message
    const emotionalSignal = inferEmotionalSignal(message)

    // 6. Classify concern category
    const concernCategory = classifyConcern(message)

    // 7. Build context
    let contextBlock = ''
    try {
      contextBlock = await buildContextBlock(supabase, baby_id, profile_id)
    } catch {
      // Non-fatal — continue without context
    }

    // 8. Build system prompt
    const masterPrompt = MASTER_SYSTEM_PROMPT({
      parent_first_name: profile.first_name,
      stage: baby.stage,
      baby_name: baby.name ?? undefined,
      pregnancy_week: ageInfo.pregnancy_week,
      due_date: baby.due_date ?? undefined,
      age_in_weeks: ageInfo.age_in_weeks,
      age_display_string: ageInfo.age_display_string,
    })

    // Add escalation guidance for non-emergency red flags
    let escalationGuidance = ''
    if (redFlagResult.level === 'urgent') {
      escalationGuidance = '\nIMPORTANT: The safety scanner has flagged this message as URGENT. Recommend same-day medical assessment clearly but calmly. Include: "this warrants being seen today".'
    } else if (redFlagResult.level === 'call_doctor') {
      escalationGuidance = '\nIMPORTANT: The safety scanner has flagged this message. Recommend pediatrician contact clearly: "worth a call to your pediatrician today or tomorrow".'
    }

    // Add distress acknowledgement guidance
    let distressGuidance = ''
    if (emotionalSignal === 'distressed') {
      distressGuidance = '\nIMPORTANT: The parent appears distressed. Acknowledge their emotional state FIRST before any content. Surface one support resource (PSI: 1-800-944-4773).'
    }

    const fullSystemPrompt = `${masterPrompt}\n\n---\n\nCONTEXT:\n${contextBlock}\n\nConcern category: ${concernCategory}\nEscalation level from scanner: ${redFlagResult.level}${escalationGuidance}${distressGuidance}\n\n---\n\n${CHAT_SYSTEM_ADDON}`

    // 9. Build messages array for multi-turn conversation
    // Filter to only allow 'user' and 'assistant' roles to prevent prompt injection
    // via maliciously crafted role values (e.g. 'system').
    // Keep only last 20 messages to prevent context bloat
    const windowedHistory = conversation_history.slice(-20)
    const safeHistory = Array.isArray(windowedHistory)
      ? windowedHistory.filter(
          (m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string'
        )
      : []
    const historyForClaude = safeHistory.length > 0
      ? safeHistory
          .map(m => `${m.role === 'user' ? profile.first_name : 'Lumira'}: ${sanitizeForPrompt(String(m.content || ''))}`)
          .join('\n\n')
      : ''

    const isNewThread = safeHistory.length === 0
    const userMessage = isNewThread
      ? `${profile.first_name}: ${message}\n\nRespond as Lumira. This is a new conversation — include suggested_prompts in your response.`
      : `${historyForClaude}\n\n${profile.first_name}: ${message}\n\nRespond as Lumira.`

    // Rate limiting — max 20 requests per minute per user
    const rateLimit = await checkRateLimit(user.id)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: true, message: 'You\'re sending messages too quickly. Please wait a moment and try again.' },
        { status: 429, headers: { ...SECURITY_HEADERS, 'Retry-After': String(rateLimit.retryAfter) } }
      )
    }

    // 10. Call Claude with temperature 0.4 and timeout
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('[chat] ANTHROPIC_API_KEY is not configured — set this environment variable to enable AI features')
      return NextResponse.json(
        { error: true, message: 'Chat service is temporarily unavailable. Please try again later.' },
        { status: 503, headers: SECURITY_HEADERS }
      )
    }
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000) // 30s timeout
    let response: Awaited<ReturnType<typeof anthropic.messages.create>>
    try {
      response = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 800,
        temperature: 0.4,
        system: fullSystemPrompt,
        // Prefill the assistant turn with '{' — Claude MUST continue from here,
        // making code fences structurally impossible.
        messages: [
          { role: 'user', content: userMessage },
          { role: 'assistant', content: '{' },
        ],
      }, { signal: controller.signal })
    } catch (claudeErr) {
      clearTimeout(timeout)
      const isTimeout = claudeErr instanceof Error && claudeErr.name === 'AbortError'
      if (isTimeout) {
        console.error('[chat] Claude API request timed out after 30s')
        return NextResponse.json(
          { error: true, message: 'Lumira took too long to respond. Please try again.' },
          { status: 503, headers: SECURITY_HEADERS }
        )
      }
      const isAuthError = claudeErr instanceof Error && claudeErr.message.includes('401')
      if (isAuthError) {
        console.error('[chat] Claude API authentication failed — check ANTHROPIC_API_KEY validity')
        return NextResponse.json(
          { error: true, message: 'Chat service is temporarily unavailable. Please try again later.' },
          { status: 503, headers: SECURITY_HEADERS }
        )
      }
      throw claudeErr
    } finally {
      clearTimeout(timeout)
    }

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }

    // Parse JSON response.
    // The assistant prefill starts with '{' so we prepend it back before parsing.
    // We also apply robust fence-stripping as a safety net for any edge cases.
    const rawText = '{' + content.text
    const cleaned = rawText
      .trim()
      .replace(/^```\s*(?:json|JSON)?\s*\n?/, '')
      .replace(/\n?\s*```\s*$/, '')
      .trim()

    let parsed: {
      message: string
      emotional_signal?: EmotionalSignal | null
      escalation_level?: EscalationLevel
      suggested_prompts?: string[] | null
    }

    try {
      parsed = JSON.parse(cleaned)
    } catch {
      // Fallback: extract the first JSON object from anywhere in the response
      const jsonMatch = rawText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0])
        } catch {
          // Last resort: extract just the message field value if present
          const msgMatch = rawText.match(/"message"\s*:\s*"((?:[^"\\]|\\.)*)"/)
          parsed = { message: msgMatch ? msgMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') : 'I had trouble forming a response. Please try again.' }
        }
      } else {
        parsed = { message: 'I had trouble forming a response. Please try again.' }
      }
    }

    // Combine AI emotional signal with our inferred one
    const finalSignal = emotionalSignal || parsed.emotional_signal || null

    // 11. Store messages in thread if thread_id exists (non-critical — never crash parent request)
    if (thread_id) {
      try {
        const now = new Date().toISOString()
        const { error: insertError } = await supabase.from('chat_messages').insert([
          {
            thread_id,
            role: 'user',
            content: message,
            concern_category: concernCategory,
            escalation_level: redFlagResult.level,
            red_flag_detected: redFlagResult.level !== 'none',
            red_flag_pattern: redFlagResult.pattern,
          },
          {
            thread_id,
            role: 'assistant',
            content: parsed.message,
            concern_category: concernCategory,
            escalation_level: parsed.escalation_level || redFlagResult.level,
            is_structured_response: true,
            model_version: 'claude-sonnet-4-6',
            input_tokens: response.usage?.input_tokens || null,
            output_tokens: response.usage?.output_tokens || null,
          },
        ])
        if (insertError) {
          console.error('[chat] Failed to store messages:', insertError.message)
        }

        // Update thread metadata
        const updateData: Record<string, unknown> = {
          last_message_at: now,
        }

        // Set escalation level if higher than current
        if (redFlagResult.level !== 'none') {
          updateData.highest_escalation_level = redFlagResult.level
        }

        // Auto-generate title on first exchange
        const { data: thread } = await supabase
          .from('chat_threads')
          .select('message_count, title')
          .eq('id', thread_id)
          .single()

        if (!thread?.title && (thread?.message_count || 0) <= 2) {
          const title = generateThreadTitle(message)
          updateData.title = title
          updateData.primary_concern_category = concernCategory
        }

        const { error: updateError } = await supabase
          .from('chat_threads')
          .update(updateData)
          .eq('id', thread_id)
        if (updateError) {
          console.error('[chat] Failed to update thread:', updateError.message)
        }
      } catch (threadErr) {
        console.error('[chat] Thread storage error (non-fatal):', threadErr)
      }
    }

    // 11b. Audit non-emergency escalations and distress signals
    if (redFlagResult.level === 'urgent' || redFlagResult.level === 'call_doctor') {
      logAudit('escalation_triggered', user.id, {
        level: redFlagResult.level,
        pattern: redFlagResult.pattern,
        category: redFlagResult.category,
        baby_id,
        thread_id: thread_id || null,
      }, request).catch(() => {})
    }
    if (finalSignal === 'distressed') {
      logAudit('distressed_signal_detected', user.id, {
        signal: finalSignal,
        baby_id,
        thread_id: thread_id || null,
      }, request).catch(() => {})
    }

    // 12. Update profile emotional state if changed (non-critical)
    if (finalSignal && finalSignal !== profile.emotional_state_latest) {
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            emotional_state_latest: finalSignal,
            emotional_state_updated_at: new Date().toISOString(),
          })
          .eq('id', profile_id)
        if (profileError) {
          console.error('[chat] Failed to update emotional state:', profileError.message)
        }
      } catch (profileErr) {
        console.error('[chat] Emotional state update error (non-fatal):', profileErr)
      }
    }

    // 13. Fire and forget pattern detection (non-critical)
    fetch(`${request.nextUrl.origin}/api/detect-patterns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': request.headers.get('cookie') || '' },
      body: JSON.stringify({
        baby_id,
        profile_id,
        stage: baby.stage,
      }),
    }).catch(() => {})

    return NextResponse.json({
      message: parsed.message,
      thread_id: thread_id || null,
      suggested_prompts: parsed.suggested_prompts || null,
      escalation: redFlagResult.level !== 'none'
        ? {
            level: redFlagResult.level as EscalationLevel,
            category: redFlagResult.category,
            // snake_case canonical names
            immediate_action: redFlagResult.immediate_action,
            action_url: redFlagResult.action_url,
            // deprecated camelCase aliases — remove after clients migrate
            immediateAction: redFlagResult.immediateAction,
            actionUrl: redFlagResult.actionUrl,
          }
        : null,
      emotional_signal: finalSignal,
      concern_category: concernCategory as ConcernCategory,
    })
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err)
    console.error('[chat] Error:', errMsg)
    return NextResponse.json(
      { error: true, message: 'Lumira is taking a moment. Try again.' },
      { status: 500, headers: SECURITY_HEADERS }
    )
  }
}

function generateThreadTitle(firstMessage: string): string {
  const clean = firstMessage.replace(/[^a-zA-Z0-9 ]/g, '').trim()
  return clean.length > 40 ? clean.slice(0, 40) + '...' : clean
}

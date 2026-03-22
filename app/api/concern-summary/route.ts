/**
 * @module ConcernSummaryAPI
 * @description POST /api/concern-summary — Generates a structured AI concern
 *   summary from parent Q&A answers. Returns likely causes, recommended actions,
 *   monitoring guidance, and escalation thresholds. Creates a concern session
 *   record with a 2-day follow-up date.
 * @version 1.0.0
 * @since March 2026
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { MASTER_SYSTEM_PROMPT, callClaudeJSON } from '@/lib/claude'
import { buildContextBlock } from '@/lib/context-builder'
import { getBabyAgeInfo } from '@/lib/baby-age'
import { checkRateLimit } from '@/lib/rate-limit'
import { isValidUUID, isValidEnum, validateArray, verifyBabyOwnership } from '@/lib/validation'
import { sanitizeForPrompt } from '@/lib/sanitize-prompt'
import { SECURITY_HEADERS } from '@/lib/utils'
import type { Stage, AISummary, ConcernAnswer, BabyProfile } from '@/types/app'

const CONCERN_SUMMARY_PROMPT = `You are generating a structured concern summary for a parent. Be honest, warm, and specific. Never alarming, but never dismissive.

Respond ONLY with valid JSON (no markdown fences):
{
  "likely_causes": ["brief, specific cause 1", "...2", "...3 optional"],
  "try_first": ["specific, actionable step 1", "...2", "...3 optional"],
  "monitor": ["what to watch for 1", "...2 optional"],
  "escalate_when": ["exact threshold or symptom to call doctor 1", "...2 optional"]
}`

interface ConcernSummaryRequest {
  baby_id: string
  profile_id: string
  stage: Stage
  concern_type: string
  answers: ConcernAnswer[]
}

export async function POST(request: NextRequest) {
  try {
    let body: ConcernSummaryRequest
    try {
      body = (await request.json()) as ConcernSummaryRequest
    } catch {
      return NextResponse.json(
        { error: true, message: 'Invalid JSON body' },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }

    const { baby_id, profile_id, stage, concern_type, answers } = body

    // Validate required fields
    if (!baby_id || typeof baby_id !== 'string') {
      return NextResponse.json({ error: true, message: 'Missing required field: baby_id' }, { status: 400, headers: SECURITY_HEADERS })
    }
    if (!isValidUUID(baby_id)) {
      return NextResponse.json({ error: true, message: 'Invalid baby_id format' }, { status: 400, headers: SECURITY_HEADERS })
    }
    if (!profile_id || typeof profile_id !== 'string') {
      return NextResponse.json({ error: true, message: 'Missing required field: profile_id' }, { status: 400, headers: SECURITY_HEADERS })
    }
    if (!isValidUUID(profile_id)) {
      return NextResponse.json({ error: true, message: 'Invalid profile_id format' }, { status: 400, headers: SECURITY_HEADERS })
    }
    const VALID_STAGES = ['pregnancy', 'infant', 'toddler'] as const
    if (!isValidEnum(stage, VALID_STAGES)) {
      return NextResponse.json({ error: true, message: 'Invalid or missing stage' }, { status: 400, headers: SECURITY_HEADERS })
    }
    if (!concern_type || typeof concern_type !== 'string') {
      return NextResponse.json({ error: true, message: 'Missing required field: concern_type' }, { status: 400, headers: SECURITY_HEADERS })
    }
    // Sanitize concern_type length
    if (concern_type.length > 100) {
      return NextResponse.json({ error: true, message: 'concern_type exceeds maximum length' }, { status: 400, headers: SECURITY_HEADERS })
    }
    const answersError = validateArray(answers, 'answers', { maxLength: 50, required: true })
    if (answersError) {
      return NextResponse.json({ error: true, message: answersError }, { status: 400, headers: SECURITY_HEADERS })
    }

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

    // Rate limiting — max 20 requests per minute per user
    const rateLimit = await checkRateLimit(user.id)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: true, message: 'You\'re sending messages too quickly. Please wait a moment and try again.' },
        { status: 429, headers: { ...SECURITY_HEADERS, 'Retry-After': String(rateLimit.retryAfter) } }
      )
    }

    // Fetch baby and profile in parallel with specific columns
    const [{ data: babyData }, { data: profileData }] = await Promise.all([
      supabase.from('baby_profiles').select('id, name, due_date, date_of_birth, stage, pending_proactive_type, pending_proactive_set_at, created_by_profile_id, created_at, planning_sub_option, planning_expected_month').eq('id', baby_id).single(),
      supabase.from('profiles').select('id, first_name, first_time_parent').eq('id', profile_id).single(),
    ])

    if (!babyData || !profileData) {
      return NextResponse.json({ error: true }, { status: 404, headers: SECURITY_HEADERS })
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

    const masterPrompt = MASTER_SYSTEM_PROMPT({
      parent_first_name: profileData.first_name,
      stage,
      baby_name: baby.name ?? undefined,
      pregnancy_week: ageInfo.pregnancy_week,
      due_date: baby.due_date ?? undefined,
      age_in_weeks: ageInfo.age_in_weeks,
      age_display_string: ageInfo.age_display_string,
    })

    const fullSystemPrompt = `${masterPrompt}\n\n---\n\nCONTEXT:\n${contextBlock}\n\n---\n\n${CONCERN_SUMMARY_PROMPT}`

    // Format Q&A for Claude
    const answersText = answers
      .map((a) => {
        const answerStr = Array.isArray(a.answer) ? a.answer.join(', ') : a.answer
        return `Q: ${a.question_text}\nA: ${sanitizeForPrompt(String(answerStr))}`
      })
      .join('\n\n')

    const userMessage = `Concern type: ${sanitizeForPrompt(concern_type)}\nStage: ${stage}\n\nParent's answers:\n${answersText}\n\nGenerate a structured concern summary.`

    let aiSummary: AISummary
    let isFallback = false

    if (!process.env.ANTHROPIC_API_KEY) {
      // No API key configured — use static fallback
      aiSummary = getStaticFallbackSummary(stage, concern_type, baby.name ?? undefined)
      isFallback = true
    } else {
      try {
        aiSummary = await callClaudeJSON<AISummary>(fullSystemPrompt, userMessage, 1200)
      } catch (aiErr) {
        const aiErrMsg = aiErr instanceof Error ? aiErr.message : String(aiErr)
        console.error('[concern-summary] Claude generation failed:', aiErrMsg)
        aiSummary = getStaticFallbackSummary(stage, concern_type, baby.name ?? undefined)
        isFallback = true
      }
    }

    // Calculate follow-up date (today + 2 days)
    const followUpDate = new Date()
    followUpDate.setDate(followUpDate.getDate() + 2)
    const followUpStr = followUpDate.toISOString().split('T')[0]

    // INSERT concern session
    const { data: session, error: insertError } = await supabase
      .from('concern_sessions')
      .insert({
        baby_id,
        profile_id,
        stage,
        concern_type,
        answers,
        ai_summary: aiSummary,
        follow_up_due: followUpStr,
        follow_up_sent: false,
      })
      .select()
      .single()

    if (insertError) throw insertError

    return NextResponse.json({
      session_id: session.id,
      ai_summary: aiSummary,
      ...(isFallback && { fallback: true }),
    }, { headers: SECURITY_HEADERS })
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err)
    console.error('[concern-summary] Error:', errMsg)
    return NextResponse.json(
      { error: true, message: 'Failed to generate summary. Please try again.' },
      { status: 500, headers: SECURITY_HEADERS }
    )
  }
}

/**
 * Returns a static, science-backed fallback summary when Claude API is unavailable.
 * Content follows AAP/WHO guidelines and uses warm, culturally sensitive language.
 */
function getStaticFallbackSummary(stage: Stage, concernType: string, babyName?: string): AISummary {
  const childRef = babyName ?? (stage === 'pregnancy' ? 'your baby' : 'your little one')

  // Stage-specific general guidance aligned with AAP/WHO recommendations
  const stageGuidance: Record<string, { trySuggestions: string[]; monitorTips: string[] }> = {
    pregnancy: {
      trySuggestions: [
        'Rest when your body asks for it — growing a baby is demanding work',
        'Stay hydrated with small, frequent sips of water throughout the day',
        'Jot down your questions so you can discuss them at your next prenatal visit',
      ],
      monitorTips: [
        'Note any changes in how you feel and when they happen',
        'Track fetal movement patterns if you are in your third trimester',
      ],
    },
    infant: {
      trySuggestions: [
        `Watch ${childRef}'s cues — babies often communicate needs before crying`,
        'Offer comfort through gentle holding, skin-to-skin, or a calm voice',
        'Keep a brief log of feeding, sleep, and any changes you notice for your next check-up',
      ],
      monitorTips: [
        `Watch for changes in ${childRef}'s feeding, wet diapers, and alertness`,
        'Note how long the concern persists and whether it worsens, stays the same, or improves',
      ],
    },
    toddler: {
      trySuggestions: [
        `Maintain a consistent daily routine — predictability helps ${childRef} feel secure`,
        'Offer simple choices to support growing independence',
        'Make a note of what you observe so you can share specifics with your care provider',
      ],
      monitorTips: [
        'Track whether the concern follows a pattern (time of day, after meals, etc.)',
        `Notice if ${childRef}'s energy, appetite, or mood changes alongside the concern`,
      ],
    },
  }

  const guidance = stageGuidance[stage] ?? stageGuidance.infant

  return {
    likely_causes: [
      `There are several common reasons ${stage === 'pregnancy' ? 'this can happen during pregnancy' : 'this occurs at this age'} — most are a normal part of development`,
      'Our AI analysis is temporarily unavailable, so we cannot provide a personalised assessment right now',
      'Your care provider can give you the most accurate explanation based on your specific situation',
    ],
    try_first: guidance.trySuggestions,
    monitor: guidance.monitorTips,
    escalate_when: [
      'You notice a sudden change that feels different from what you have been seeing',
      `Trust your instincts — if something feels wrong, contact your ${stage === 'pregnancy' ? 'midwife or OB' : 'paediatrician'} without hesitation`,
    ],
  }
}

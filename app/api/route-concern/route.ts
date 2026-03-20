/**
 * @module RouteConcernAPI
 * @description POST /api/route-concern — Classifies free-text parent concerns
 *   into a specific concern type using Claude. Returns 'other' as a safe
 *   fallback if classification fails or produces an invalid type.
 * @version 1.0.0
 * @since March 2026
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { callClaudeJSON } from '@/lib/claude'
import { sanitizeForPrompt } from '@/lib/sanitize-prompt'
import { SECURITY_HEADERS } from '@/lib/utils'
import type { Stage, ConcernType } from '@/types/app'

const VALID_CONCERN_TYPES: ConcernType[] = [
  'morning_sickness',
  'prenatal_symptoms',
  'reduced_fetal_movement',
  'prenatal_anxiety',
  'birth_preparation',
  'feeding_drop',
  'crying_increase',
  'sleep_regression',
  'constipation',
  'fever',
  'teething',
  'other',
]

const ROUTE_CONCERN_PROMPT = `You classify parent concerns into specific concern types. Respond ONLY with valid JSON (no markdown fences): { "concern_type": "the_type" }

Valid types for pregnancy: morning_sickness, prenatal_symptoms, reduced_fetal_movement, prenatal_anxiety, birth_preparation, other
Valid types for infant/toddler: feeding_drop, crying_increase, sleep_regression, constipation, fever, teething, other

Choose the single most relevant type. If nothing fits, use "other".`

interface RouteConcernRequest {
  free_text: string
  stage: Stage
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: SECURITY_HEADERS })
    }

    let body: RouteConcernRequest
    try {
      body = (await request.json()) as RouteConcernRequest
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400, headers: SECURITY_HEADERS })
    }

    const { stage } = body

    // Validate stage
    const VALID_STAGES: Stage[] = ['pregnancy', 'infant', 'toddler']
    if (!stage || !VALID_STAGES.includes(stage)) {
      return NextResponse.json({ error: 'Invalid or missing stage' }, { status: 400, headers: SECURITY_HEADERS })
    }

    // Sanitize and validate free_text
    const free_text = typeof body.free_text === 'string' ? sanitizeForPrompt(body.free_text.trim().slice(0, 2000)) : ''
    if (!free_text) {
      return NextResponse.json({ concern_type: 'other' })
    }

    // Rate limiting — max 20 requests per minute per user
    const rateLimit = await checkRateLimit(user.id)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'You\'re sending messages too quickly. Please wait a moment and try again.' },
        { status: 429, headers: { ...SECURITY_HEADERS, 'Retry-After': String(rateLimit.retryAfter) } }
      )
    }

    const userMessage = `Stage: ${stage}\nParent's concern: "${free_text}"\n\nClassify this concern.`

    let concernType: string = 'other'
    let isFallback = false

    if (!process.env.ANTHROPIC_API_KEY) {
      // No API key configured — use safe default routing
      concernType = getStaticRouting(stage, free_text)
      isFallback = true
    } else {
      try {
        const result = await callClaudeJSON<{ concern_type: string }>(
          ROUTE_CONCERN_PROMPT,
          userMessage,
          100
        )

        // Validate the returned type
        concernType = VALID_CONCERN_TYPES.includes(result.concern_type as ConcernType)
          ? result.concern_type
          : 'other'
      } catch (aiErr) {
        const aiErrMsg = aiErr instanceof Error ? aiErr.message : String(aiErr)
        console.error('[route-concern] Claude classification failed:', aiErrMsg)
        concernType = getStaticRouting(stage, free_text)
        isFallback = true
      }
    }

    return NextResponse.json({
      concern_type: concernType,
      category: 'general',
      urgency: 'low',
      suggested_action: 'monitor',
      ...(isFallback && { fallback: true }),
    }, { headers: SECURITY_HEADERS })
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err)
    console.error('[route-concern] Error:', errMsg)
    return NextResponse.json({
      concern_type: 'other',
      category: 'general',
      urgency: 'low',
      suggested_action: 'monitor',
      fallback: true,
    }, { headers: SECURITY_HEADERS })
  }
}

/**
 * Performs simple keyword-based routing when Claude is unavailable.
 * Maps common concern keywords to known concern types so the concern
 * still gets saved with a reasonable classification.
 */
function getStaticRouting(stage: Stage, freeText: string): string {
  const text = freeText.toLowerCase()

  if (stage === 'pregnancy') {
    if (text.includes('nausea') || text.includes('vomit') || text.includes('morning sick') || text.includes('throwing up')) return 'morning_sickness'
    if (text.includes('movement') || text.includes('kick') || text.includes('not moving')) return 'reduced_fetal_movement'
    if (text.includes('anxi') || text.includes('worried') || text.includes('stress') || text.includes('scared')) return 'prenatal_anxiety'
    if (text.includes('birth') || text.includes('labor') || text.includes('labour') || text.includes('deliver') || text.includes('hospital bag')) return 'birth_preparation'
    if (text.includes('pain') || text.includes('cramp') || text.includes('bleed') || text.includes('swell') || text.includes('headache')) return 'prenatal_symptoms'
  } else {
    if (text.includes('feed') || text.includes('eat') || text.includes('bottle') || text.includes('breast') || text.includes('milk') || text.includes('formula')) return 'feeding_drop'
    if (text.includes('cry') || text.includes('fuss') || text.includes('colic') || text.includes('scream')) return 'crying_increase'
    if (text.includes('sleep') || text.includes('wake') || text.includes('nap') || text.includes('night')) return 'sleep_regression'
    if (text.includes('poop') || text.includes('constipat') || text.includes('bowel') || text.includes('stool') || text.includes('hard stool')) return 'constipation'
    if (text.includes('fever') || text.includes('temperature') || text.includes('hot') || text.includes('warm')) return 'fever'
    if (text.includes('teeth') || text.includes('teething') || text.includes('drool') || text.includes('gum')) return 'teething'
  }

  return 'other'
}

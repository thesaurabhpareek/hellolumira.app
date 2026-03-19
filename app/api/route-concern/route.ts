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

    const result = await callClaudeJSON<{ concern_type: string }>(
      ROUTE_CONCERN_PROMPT,
      userMessage,
      100
    )

    // Validate the returned type
    const concernType = VALID_CONCERN_TYPES.includes(result.concern_type as ConcernType)
      ? result.concern_type
      : 'other'

    return NextResponse.json({ concern_type: concernType }, { headers: SECURITY_HEADERS })
  } catch (err) {
    console.error('[route-concern] Error:', err)
    return NextResponse.json({ concern_type: 'other' }, { headers: SECURITY_HEADERS })
  }
}

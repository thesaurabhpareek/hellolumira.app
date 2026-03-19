/**
 * @module DetectPatternsAPI
 * @description POST /api/detect-patterns — Background pattern detection.
 *   Analyses the last 7 daily check-ins for sleep, feeding, mood, nausea, and
 *   anxiety patterns. Respects cooldown windows to avoid duplicate alerts.
 *   Always returns 200 (silent fail) since this is fired as a background task.
 * @version 1.0.0
 * @since March 2026
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { detectPatterns, checkCooldown } from '@/lib/pattern-rules'
import { checkRateLimit } from '@/lib/rate-limit'
import { isValidUUID, verifyBabyOwnership } from '@/lib/validation'
import { SECURITY_HEADERS } from '@/lib/utils'
import type { Stage, DailyCheckin } from '@/types/app'

interface DetectPatternsRequest {
  baby_id: string
  profile_id: string
  stage: Stage
}

export async function POST(request: NextRequest) {
  try {
    let body: DetectPatternsRequest
    try {
      body = (await request.json()) as DetectPatternsRequest
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400, headers: SECURITY_HEADERS })
    }

    const { baby_id, profile_id, stage } = body

    // Validate required fields
    if (!baby_id || typeof baby_id !== 'string') {
      return NextResponse.json({ error: 'Missing required field: baby_id' }, { status: 400, headers: SECURITY_HEADERS })
    }
    if (!isValidUUID(baby_id)) {
      return NextResponse.json({ error: 'Invalid baby_id format' }, { status: 400, headers: SECURITY_HEADERS })
    }
    if (!profile_id || typeof profile_id !== 'string') {
      return NextResponse.json({ error: 'Missing required field: profile_id' }, { status: 400, headers: SECURITY_HEADERS })
    }
    if (!isValidUUID(profile_id)) {
      return NextResponse.json({ error: 'Invalid profile_id format' }, { status: 400, headers: SECURITY_HEADERS })
    }
    const VALID_STAGES: Stage[] = ['pregnancy', 'infant', 'toddler']
    if (!stage || !VALID_STAGES.includes(stage)) {
      return NextResponse.json({ error: 'Invalid or missing stage' }, { status: 400, headers: SECURITY_HEADERS })
    }

    const supabase = await createClient()

    // Verify auth
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user || user.id !== profile_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: SECURITY_HEADERS })
    }

    // Verify user is a member of this baby profile (IDOR prevention)
    const isMember = await verifyBabyOwnership(supabase, user.id, baby_id)
    if (!isMember) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403, headers: SECURITY_HEADERS })
    }

    // Rate limiting — max 20 requests per minute per user
    const rateLimit = await checkRateLimit(user.id)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'You\'re sending messages too quickly. Please wait a moment and try again.' },
        { status: 429, headers: { ...SECURITY_HEADERS, 'Retry-After': String(rateLimit.retryAfter) } }
      )
    }

    // Parallelise all three data fetches to reduce latency
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 7)

    const [checkinsRes, babyRes, patternsRes] = await Promise.all([
      // Fetch last 7 checkins with only needed columns
      supabase
        .from('daily_checkins')
        .select('id, baby_id, profile_id, stage, checkin_date, sleep_quality, feeding, mood, nausea_level, energy_level, emotional_signal')
        .eq('baby_id', baby_id)
        .order('checkin_date', { ascending: false })
        .limit(7),
      // Fetch baby name
      supabase
        .from('baby_profiles')
        .select('name')
        .eq('id', baby_id)
        .single(),
      // Fetch recent pattern observations for cooldown check (last 7 days)
      supabase
        .from('pattern_observations')
        .select('pattern_type, triggered_at')
        .eq('baby_id', baby_id)
        .gte('triggered_at', cutoff.toISOString()),
    ])

    const checkins = (checkinsRes.data || []) as DailyCheckin[]

    if (checkins.length === 0) {
      return NextResponse.json({ patterns_detected: [], patterns_skipped: [] })
    }

    const babyName = babyRes.data?.name ?? null
    const recent = patternsRes.data || []

    // Detect patterns
    const detected = detectPatterns(checkins, stage, babyName)

    const detectedTypes: string[] = []
    const skippedTypes: string[] = []

    for (const pattern of detected) {
      const allowed = checkCooldown(
        recent.map((r) => ({ pattern_type: r.pattern_type, triggered_at: r.triggered_at })),
        pattern.type
      )

      if (!allowed) {
        skippedTypes.push(pattern.type)
        continue
      }

      // Insert pattern observation + update baby profile in parallel
      const now = new Date().toISOString()
      const [{ error: insertErr }, { error: updateErr }] = await Promise.all([
        supabase.from('pattern_observations').insert({
          baby_id,
          profile_id,
          pattern_type: pattern.type,
          message_text: pattern.message,
          triggered_at: now,
        }),
        // Update pending_proactive_type only if not already set
        supabase
          .from('baby_profiles')
          .update({
            pending_proactive_type: pattern.type,
            pending_proactive_set_at: now,
          })
          .eq('id', baby_id)
          .is('pending_proactive_type', null),
      ])
      if (insertErr) {
        console.error('[detect-patterns] DB insert error:', insertErr.message)
      }
      if (updateErr) {
        console.error('[detect-patterns] DB update error:', updateErr.message)
      }

      detectedTypes.push(pattern.type)
    }

    return NextResponse.json({
      patterns_detected: detectedTypes,
      patterns_skipped: skippedTypes,
    }, { headers: SECURITY_HEADERS })
  } catch (err) {
    // Silent fail — always return 200
    console.error('[detect-patterns] Error (silent):', err)
    return NextResponse.json({ patterns_detected: [], patterns_skipped: [] }, { headers: SECURITY_HEADERS })
  }
}

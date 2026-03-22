/**
 * @module GenerateWeeklySummaryAPI
 * @description POST /api/generate-weekly-summary — Generates an AI-powered
 *   weekly journal summary from check-in data and concern sessions. Upserts
 *   the result into the weekly_summaries table keyed by baby_id + week + year.
 * @version 1.0.0
 * @since March 2026
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { MASTER_SYSTEM_PROMPT, callClaudeJSON } from '@/lib/claude'
import { getBabyAgeInfo } from '@/lib/baby-age'
import { checkRateLimit } from '@/lib/rate-limit'
import { isValidUUID, verifyBabyOwnership } from '@/lib/validation'
import { sanitizeForPrompt } from '@/lib/sanitize-prompt'
import { SECURITY_HEADERS } from '@/lib/utils'
import type { BabyProfile, DailyCheckin } from '@/types/app'

const WEEKLY_SUMMARY_PROMPT = `You generate a concise weekly summary for a parent's journal. Warm, observational, supportive. Respond ONLY with valid JSON (no markdown fences):
{
  "headline": "One sentence capturing the week's theme",
  "patterns": "2-3 sentences on what you noticed across the week",
  "wins": "1-2 things that went well or improved",
  "watch_next_week": "1 thing worth keeping an eye on",
  "lumira_note": "A warm, personal closing sentence from Lumira"
}`

interface WeeklySummaryRequest {
  baby_id: string
  week_number: number
  year: number
}

export async function POST(request: NextRequest) {
  try {
    let body: WeeklySummaryRequest
    try {
      body = (await request.json()) as WeeklySummaryRequest
    } catch {
      return NextResponse.json({ error: true, message: 'Invalid JSON body' }, { status: 400, headers: SECURITY_HEADERS })
    }

    const { baby_id, week_number, year } = body

    // Validate required fields
    if (!baby_id || typeof baby_id !== 'string') {
      return NextResponse.json({ error: true, message: 'Missing required field: baby_id' }, { status: 400, headers: SECURITY_HEADERS })
    }
    if (!isValidUUID(baby_id)) {
      return NextResponse.json({ error: true, message: 'Invalid baby_id format' }, { status: 400, headers: SECURITY_HEADERS })
    }
    if (typeof week_number !== 'number' || week_number < 1 || week_number > 53 || !Number.isInteger(week_number)) {
      return NextResponse.json({ error: true, message: 'week_number must be an integer between 1 and 53' }, { status: 400, headers: SECURITY_HEADERS })
    }
    if (typeof year !== 'number' || year < 2020 || year > 2100 || !Number.isInteger(year)) {
      return NextResponse.json({ error: true, message: 'year must be a valid integer' }, { status: 400, headers: SECURITY_HEADERS })
    }

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
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
    const [babyResult, profileResult] = await Promise.all([
      supabase.from('baby_profiles').select('id, name, due_date, date_of_birth, stage, pending_proactive_type, pending_proactive_set_at, created_by_profile_id, created_at, planning_sub_option, planning_expected_month').eq('id', baby_id).single(),
      supabase.from('profiles').select('id, first_name').eq('id', user.id).single(),
    ])

    if (babyResult.error) {
      console.error('[generate-weekly-summary] DB error fetching baby:', babyResult.error.message)
    }
    if (profileResult.error) {
      console.error('[generate-weekly-summary] DB error fetching profile:', profileResult.error.message)
    }

    const babyData = babyResult.data
    const profileData = profileResult.data

    if (!babyData || !profileData) {
      return NextResponse.json({ error: true, message: 'Baby or profile not found' }, { status: 404, headers: SECURITY_HEADERS })
    }

    const baby = babyData as BabyProfile
    const ageInfo = getBabyAgeInfo(baby)

    // Fetch the week's checkins
    // ISO week calculation: find start and end of that week
    const startOfWeek = getISOWeekStart(year, week_number)
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(endOfWeek.getDate() + 6)

    const startStr = startOfWeek.toISOString().split('T')[0]
    const endStr = endOfWeek.toISOString().split('T')[0]

    const { data: checkinsData } = await supabase
      .from('daily_checkins')
      .select('id, checkin_date, sleep_quality, feeding, mood, nausea_level, energy_level, emotional_signal')
      .eq('baby_id', baby_id)
      .gte('checkin_date', startStr)
      .lte('checkin_date', endStr)
      .order('checkin_date', { ascending: true })

    const checkins = (checkinsData || []) as DailyCheckin[]

    // Fetch concern sessions this week
    const { data: concerns } = await supabase
      .from('concern_sessions')
      .select('concern_type, ai_summary')
      .eq('baby_id', baby_id)
      .gte('created_at', `${startStr}T00:00:00Z`)
      .lte('created_at', `${endStr}T23:59:59Z`)

    const masterPrompt = MASTER_SYSTEM_PROMPT({
      parent_first_name: profileData.first_name,
      stage: baby.stage,
      baby_name: baby.name ?? undefined,
      pregnancy_week: ageInfo.pregnancy_week,
      due_date: baby.due_date ?? undefined,
      age_in_weeks: ageInfo.age_in_weeks,
      age_display_string: ageInfo.age_display_string,
    })

    const fullSystemPrompt = `${masterPrompt}\n\n---\n\n${WEEKLY_SUMMARY_PROMPT}`

    // Build data summary for Claude
    const checkinSummary = checkins
      .map((c) => {
        if (baby.stage === 'pregnancy') {
          return `${c.checkin_date}: nausea=${c.nausea_level || 'n/a'}, energy=${c.energy_level || 'n/a'}, emotional=${c.emotional_signal || 'n/a'}`
        }
        return `${c.checkin_date}: sleep=${c.sleep_quality || 'n/a'}, feeding=${c.feeding || 'n/a'}, mood=${c.mood || 'n/a'}, emotional=${c.emotional_signal || 'n/a'}`
      })
      .join('\n')

    const concernSummary =
      (concerns || []).length > 0
        ? `Concerns this week: ${(concerns || []).map((c) => sanitizeForPrompt(c.concern_type)).join(', ')}`
        : 'No specific concerns logged this week.'

    const userMessage = `Generate a weekly summary for week ${week_number} of ${year}.\n\nCheck-ins:\n${checkinSummary || 'No check-ins this week.'}\n\n${concernSummary}`

    const summary = await callClaudeJSON<Record<string, string>>(fullSystemPrompt, userMessage, 800)

    // INSERT or UPSERT weekly summary
    const { error: insertError } = await supabase.from('weekly_summaries').upsert({
      baby_id,
      week_number,
      year,
      content: summary,
      generated_at: new Date().toISOString(),
    })

    if (insertError) throw insertError

    return NextResponse.json({ success: true, summary }, { headers: SECURITY_HEADERS })
  } catch (err) {
    console.error('[generate-weekly-summary] Error:', err)
    return NextResponse.json({ error: true }, { status: 500, headers: SECURITY_HEADERS })
  }
}

function getISOWeekStart(year: number, week: number): Date {
  // Jan 4 is always in week 1
  const jan4 = new Date(Date.UTC(year, 0, 4))
  const dayOfWeek = jan4.getUTCDay() || 7
  const week1Monday = new Date(jan4)
  week1Monday.setUTCDate(jan4.getUTCDate() - dayOfWeek + 1)
  const result = new Date(week1Monday)
  result.setUTCDate(week1Monday.getUTCDate() + (week - 1) * 7)
  return result
}

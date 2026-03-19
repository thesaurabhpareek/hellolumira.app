/**
 * @module CronWeeklySummary
 * @description GET /api/cron/weekly-summary — Vercel cron job that runs every
 *   Sunday at 6am UTC. Fetches all active baby profiles and generates a weekly
 *   summary for each by invoking the generate-weekly-summary logic directly.
 *   Validates CRON_SECRET from the Authorization header.
 * @version 1.0.0
 * @since March 2026
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { SECURITY_HEADERS } from '@/lib/utils'
import { MASTER_SYSTEM_PROMPT, callClaudeJSON } from '@/lib/claude'
import { getBabyAgeInfo } from '@/lib/baby-age'
import { sanitizeForPrompt } from '@/lib/sanitize-prompt'
import type { BabyProfile, DailyCheckin } from '@/types/app'

const WEEKLY_SUMMARY_PROMPT = `You generate a concise weekly summary for a parent's journal. Warm, observational, supportive. Respond ONLY with valid JSON (no markdown fences):
{
  "headline": "One sentence capturing the week's theme",
  "patterns": "2-3 sentences on what you noticed across the week",
  "wins": "1-2 things that went well or improved",
  "watch_next_week": "1 thing worth keeping an eye on",
  "lumira_note": "A warm, personal closing sentence from Lumira"
}`

export async function GET(request: NextRequest) {
  try {
    // Validate CRON_SECRET
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      console.error('[cron/weekly-summary] Unauthorized: invalid or missing CRON_SECRET')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: SECURITY_HEADERS })
    }

    // Use service role client (bypasses RLS, no cookies needed)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Fetch all active baby profiles with their parent profiles
    const { data: babies, error: babiesError } = await supabase
      .from('baby_profiles')
      .select('id, name, due_date, date_of_birth, stage, pending_proactive_type, pending_proactive_set_at, created_by_profile_id, created_at')

    if (babiesError) {
      console.error('[cron/weekly-summary] Failed to fetch baby profiles:', babiesError.message)
      return NextResponse.json({ error: 'Failed to fetch baby profiles' }, { status: 500, headers: SECURITY_HEADERS })
    }

    if (!babies || babies.length === 0) {
      console.log('[cron/weekly-summary] No baby profiles found')
      return NextResponse.json({ success: true, summaries_generated: 0 }, { headers: SECURITY_HEADERS })
    }

    // Calculate current ISO week number and year
    const now = new Date()
    // Go back to cover last week (since this runs on Sunday)
    const lastWeek = new Date(now)
    lastWeek.setDate(lastWeek.getDate() - 7)
    const { week: weekNumber, year } = getISOWeekNumber(lastWeek)

    let summariesGenerated = 0
    let errors = 0

    for (const babyData of babies) {
      try {
        const baby = babyData as BabyProfile

        // Fetch the parent profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, first_name')
          .eq('id', baby.created_by_profile_id)
          .single()

        if (!profileData) {
          console.warn(`[cron/weekly-summary] No profile found for baby ${baby.id}`)
          continue
        }

        const ageInfo = getBabyAgeInfo(baby)

        // Calculate week date range
        const startOfWeek = getISOWeekStart(year, weekNumber)
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(endOfWeek.getDate() + 6)

        const startStr = startOfWeek.toISOString().split('T')[0]
        const endStr = endOfWeek.toISOString().split('T')[0]

        // Check if summary already exists for this week
        const { data: existing } = await supabase
          .from('weekly_summaries')
          .select('id')
          .eq('baby_id', baby.id)
          .eq('week_number', weekNumber)
          .eq('year', year)
          .maybeSingle()

        if (existing) {
          console.log(`[cron/weekly-summary] Summary already exists for baby ${baby.id}, week ${weekNumber}/${year}`)
          continue
        }

        // Fetch the week's checkins
        const { data: checkinsData } = await supabase
          .from('daily_checkins')
          .select('id, checkin_date, sleep_quality, feeding, mood, nausea_level, energy_level, emotional_signal')
          .eq('baby_id', baby.id)
          .gte('checkin_date', startStr)
          .lte('checkin_date', endStr)
          .order('checkin_date', { ascending: true })

        const checkins = (checkinsData || []) as DailyCheckin[]

        // Skip if no checkins this week
        if (checkins.length === 0) {
          console.log(`[cron/weekly-summary] No checkins for baby ${baby.id}, week ${weekNumber}/${year}`)
          continue
        }

        // Fetch concern sessions this week
        const { data: concerns } = await supabase
          .from('concern_sessions')
          .select('concern_type, ai_summary')
          .eq('baby_id', baby.id)
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
              return `${c.checkin_date}: nausea=${sanitizeForPrompt(String(c.nausea_level || 'n/a'))}, energy=${sanitizeForPrompt(String(c.energy_level || 'n/a'))}, emotional=${sanitizeForPrompt(String(c.emotional_signal || 'n/a'))}`
            }
            return `${c.checkin_date}: sleep=${sanitizeForPrompt(String(c.sleep_quality || 'n/a'))}, feeding=${sanitizeForPrompt(String(c.feeding || 'n/a'))}, mood=${sanitizeForPrompt(String(c.mood || 'n/a'))}, emotional=${sanitizeForPrompt(String(c.emotional_signal || 'n/a'))}`
          })
          .join('\n')

        const concernSummary =
          (concerns || []).length > 0
            ? `Concerns this week: ${(concerns || []).map((c) => sanitizeForPrompt(c.concern_type)).join(', ')}`
            : 'No specific concerns logged this week.'

        const userMessage = `Generate a weekly summary for week ${weekNumber} of ${year}.\n\nCheck-ins:\n${checkinSummary}\n\n${concernSummary}`

        const summary = await callClaudeJSON<Record<string, string>>(fullSystemPrompt, userMessage, 800)

        // Upsert weekly summary
        const { error: insertError } = await supabase.from('weekly_summaries').upsert({
          baby_id: baby.id,
          week_number: weekNumber,
          year,
          content: summary,
          generated_at: new Date().toISOString(),
        })

        if (insertError) {
          console.error(`[cron/weekly-summary] Failed to insert summary for baby ${baby.id}:`, insertError.message)
          errors++
          continue
        }

        summariesGenerated++
        console.log(`[cron/weekly-summary] Generated summary for baby ${baby.id}, week ${weekNumber}/${year}`)
      } catch (babyErr) {
        console.error(`[cron/weekly-summary] Error processing baby ${babyData.id}:`, babyErr)
        errors++
      }
    }

    console.log(`[cron/weekly-summary] Complete: ${summariesGenerated} generated, ${errors} errors`)
    return NextResponse.json({
      success: true,
      summaries_generated: summariesGenerated,
      errors,
    }, { headers: SECURITY_HEADERS })
  } catch (err) {
    console.error('[cron/weekly-summary] Fatal error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: SECURITY_HEADERS })
  }
}

function getISOWeekStart(year: number, week: number): Date {
  const jan4 = new Date(Date.UTC(year, 0, 4))
  const dayOfWeek = jan4.getUTCDay() || 7
  const week1Monday = new Date(jan4)
  week1Monday.setUTCDate(jan4.getUTCDate() - dayOfWeek + 1)
  const result = new Date(week1Monday)
  result.setUTCDate(week1Monday.getUTCDate() + (week - 1) * 7)
  return result
}

function getISOWeekNumber(date: Date): { week: number; year: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return { week: weekNo, year: d.getUTCFullYear() }
}

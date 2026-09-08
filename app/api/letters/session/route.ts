/**
 * @module LettersSessionAPI
 * @description POST /api/letters/session — Starts tonight's Letters session.
 *   Loads the baby profile, today's milestones, today's check-in, days since
 *   the last nightly log, open threads from recent logs, the voice
 *   profile, and seeded/learned name corrections, assembles them into a
 *   LetterPromptContext, and asks lib/letters/prompt-selection.ts (lane BE4)
 *   for the deterministic opening prompt. Also returns the seeded/learned
 *   name-correction list so the client can pass it to on-device STT as
 *   contextualStrings.
 *
 *   Flag-gated: returns 404 (not 403) when Letters is disabled for this
 *   user, so the feature is invisible when off (per the engineering
 *   contract, §1.1).
 * @version 1.0.0
 * @since September 2026
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SECURITY_HEADERS } from '@/lib/utils'
import { checkRateLimit } from '@/lib/rate-limit'
import { isValidUUID, verifyBabyOwnership } from '@/lib/validation'
import { getBabyAgeInfo } from '@/lib/baby-age'
import { isLettersEnabled } from '@/lib/letters/flags'
import { selectOpeningPrompt } from '@/lib/letters/prompt-selection'
import { ageBandPrompts } from '@/lib/letters/prompts/age-bands'
import type { BabyProfile } from '@/types/app'
import type {
  LetterPromptContext,
  OpeningPrompt,
  VoiceProfile,
  NameCorrection,
} from '@/types/letters'

interface SessionRequest {
  baby_id: string
}

/** How far back to look for entries that might still be "open threads". */
const RECENT_ENTRY_LOOKBACK_DAYS = 14
const RECENT_ENTRY_LIMIT = 5

export async function POST(request: NextRequest) {
  try {
    let body: SessionRequest
    try {
      body = (await request.json()) as SessionRequest
    } catch {
      return NextResponse.json(
        { error: true, message: 'Invalid JSON body' },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }

    if (!body.baby_id || typeof body.baby_id !== 'string') {
      return NextResponse.json(
        { error: true, message: 'Missing required field: baby_id' },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }
    if (!isValidUUID(body.baby_id)) {
      return NextResponse.json(
        { error: true, message: 'Invalid baby_id format' },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }
    const babyId = body.baby_id

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: true, message: 'Unauthorized' },
        { status: 401, headers: SECURITY_HEADERS }
      )
    }

    // Rate limit — max 20 requests/min per user
    const rateLimit = await checkRateLimit(user.id)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: true, message: 'Too many requests. Please wait a moment and try again.' },
        { status: 429, headers: { ...SECURITY_HEADERS, 'Retry-After': String(rateLimit.retryAfter) } }
      )
    }

    // Feature flag gate — 404, never 403, so the feature is invisible when off.
    const { data: settingsRow } = await supabase
      .from('letters_settings')
      .select('nightly_enabled')
      .eq('profile_id', user.id)
      .maybeSingle()

    const userEnabled = settingsRow ? (settingsRow.nightly_enabled as boolean) : null
    if (!isLettersEnabled({ profileId: user.id, userEnabled })) {
      return NextResponse.json(
        { error: true, message: 'Not found' },
        { status: 404, headers: SECURITY_HEADERS }
      )
    }

    // IDOR protection — caller must be a member of this baby profile.
    const isMember = await verifyBabyOwnership(supabase, user.id, babyId)
    if (!isMember) {
      return NextResponse.json(
        { error: true, message: 'Access denied' },
        { status: 403, headers: SECURITY_HEADERS }
      )
    }

    const today = new Date().toISOString().split('T')[0]
    const lookbackDate = new Date(Date.now() - RECENT_ENTRY_LOOKBACK_DAYS * 86_400_000)
      .toISOString()
      .split('T')[0]

    const [
      { data: babyData },
      { data: milestonesData },
      { data: checkinData },
      { data: lastEntryData },
      { data: recentEntriesData },
      { data: voiceProfileData },
      { data: nameCorrectionsData },
    ] = await Promise.all([
      supabase
        .from('baby_profiles')
        .select(
          'id, name, due_date, date_of_birth, stage, pending_proactive_type, pending_proactive_set_at, created_by_profile_id, created_at, planning_sub_option, planning_expected_month'
        )
        .eq('id', babyId)
        .single(),
      supabase
        .from('baby_milestones')
        .select('milestone_type, description, celebrated_at')
        .eq('baby_id', babyId)
        .gte('celebrated_at', `${today}T00:00:00.000Z`)
        .lte('celebrated_at', `${today}T23:59:59.999Z`),
      supabase
        .from('daily_checkins')
        .select('sleep_quality, mood')
        .eq('baby_id', babyId)
        .eq('checkin_date', today)
        .maybeSingle(),
      supabase
        .from('journal_entries')
        .select('entry_date')
        .eq('profile_id', user.id)
        .eq('baby_id', babyId)
        .eq('entry_kind', 'log')
        .order('entry_date', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('journal_entries')
        .select('id, body, edited_body, composed_body, entry_date')
        .eq('profile_id', user.id)
        .eq('baby_id', babyId)
        .eq('entry_kind', 'log')
        .neq('entry_date', today)
        .gte('entry_date', lookbackDate)
        .order('entry_date', { ascending: false })
        .limit(RECENT_ENTRY_LIMIT),
      supabase
        .from('voice_profiles')
        .select('*')
        .eq('profile_id', user.id)
        .or(`baby_id.eq.${babyId},baby_id.is.null`)
        .order('baby_id', { ascending: true, nullsFirst: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('name_corrections')
        .select('heard, correct, hit_count, source')
        .eq('profile_id', user.id),
    ])

    if (!babyData) {
      return NextResponse.json(
        { error: true, message: 'Lumira is taking a moment. Try again.' },
        { status: 404, headers: SECURITY_HEADERS }
      )
    }

    const baby = babyData as BabyProfile
    const ageInfo = getBabyAgeInfo(baby)

    let daysSinceLastEntry: number | null = null
    if (lastEntryData?.entry_date) {
      const last = new Date(`${lastEntryData.entry_date as string}T00:00:00.000Z`)
      const now = new Date(`${today}T00:00:00.000Z`)
      daysSinceLastEntry = Math.max(0, Math.round((now.getTime() - last.getTime()) / 86_400_000))
    }

    const openThreads = (recentEntriesData || []).map((e) => ({
      entryId: e.id as string,
      // Prefer the reader-facing text the parent actually kept.
      text: ((e.edited_body || e.composed_body || e.body || '') as string),
      entryDate: e.entry_date as string,
    }))

    // NOTE: daily_checkins stores `sleep_quality` ('poor'|'ok'|'good'), not a
    // numeric hour count. LetterPromptContext.todaysCheckin.sleep_hours is a
    // number — there is no real numeric field to populate it from, and we
    // never fabricate data (see the type's own doc comment), so it is left
    // null here. See REQUEST in the final report.
    const promptContext: LetterPromptContext = {
      babyName: baby.name ?? null,
      ageInMonths: ageInfo.age_in_months ?? null,
      ageInWeeks: ageInfo.age_in_weeks ?? null,
      todaysMilestones: (milestonesData || []).map((m) => ({
        type: m.milestone_type as string,
        note: (m.description as string | null) ?? null,
      })),
      todaysCheckin: checkinData
        ? { sleep_hours: null, mood: (checkinData.mood as string | null) ?? null }
        : null,
      daysSinceLastEntry,
      openThreads,
    }

    // recentPromptTexts: no column/table currently persists which opening
    // prompt text was shown on a prior night, so repeat suppression across
    // nights cannot be sourced from real data yet. Passing [] here means
    // selectOpeningPrompt still repeat-suppresses within tonight's own
    // candidate list, just not against prior nights. See REQUEST in the
    // final report.
    const openingPrompt: OpeningPrompt = selectOpeningPrompt(promptContext, ageBandPrompts, [])

    const voiceProfile = (voiceProfileData as VoiceProfile | null) ?? null
    const nameCorrections = (nameCorrectionsData || []) as NameCorrection[]
    const contextualStrings = Array.from(
      new Set(nameCorrections.map((c) => c.correct).filter((v): v is string => Boolean(v)))
    )

    return NextResponse.json(
      {
        babyId,
        entryDate: today,
        openingPrompt,
        promptContext,
        voiceProfile,
        nameCorrections,
        contextualStrings,
      },
      { headers: SECURITY_HEADERS }
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[letters/session] Unexpected error:', msg)
    return NextResponse.json(
      { error: true, message: 'Lumira is taking a moment. Try again.' },
      { status: 500, headers: SECURITY_HEADERS }
    )
  }
}

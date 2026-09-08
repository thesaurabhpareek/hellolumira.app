/**
 * @module LettersLetterAPI
 * @description POST /api/letters/letter — composes a LETTER from one or more
 *   saved LOGS.
 *
 *   The log is the habit; the letter is the artifact. Logs are written by
 *   /api/letters/transcript and are complete on their own — a letter is opt-in,
 *   made on demand, and never required to finish a night. This route therefore
 *   only ever READS logs and INSERTS a new row (entry_kind='letter'). It never
 *   updates or deletes a source log, so no failure here can cost a parent an
 *   entry (PRD §15.5, entry loss is P0).
 *
 *   A letter must cite at least one real log (`source_entry_ids`, enforced by
 *   journal_entries_sources_chk). Sources are either passed explicitly or
 *   derived from `span` + `anchor_date`. If the resolved set is empty the
 *   request fails — a source is never invented.
 *
 *   Flag-gated: returns 404 (not 403) when Letters is disabled for this user.
 *
 *   Span → sources resolution is delegated to lib/letters/compose-letter.ts
 *   (lane BE11): this route fetches a bounded candidate window and
 *   selectSourceLogs makes the deterministic choice. `custom` is caller-scoped
 *   and therefore requires explicit source_entry_ids.
 * @version 1.0.0
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SECURITY_HEADERS } from '@/lib/utils'
import { isValidUUID, isValidEnum, verifyBabyOwnership } from '@/lib/validation'
import { checkRateLimit } from '@/lib/rate-limit'
import { sanitizeForPrompt } from '@/lib/sanitize-prompt'
import { getBabyAgeInfo } from '@/lib/baby-age'
import anthropicClient from '@/lib/claude'
import { isLettersEnabled, isSubFlagEnabled, type LettersFlagContext } from '@/lib/letters/flags'
import { deslop } from '@/lib/letters/deslop'
import {
  composeLetter,
  calendarMonthRange,
  isoWeekRange,
  selectSourceLogs,
  MAX_SOURCE_LOGS,
  MILESTONE_WINDOW_DAYS,
  NoSourceLogsError,
} from '@/lib/letters/compose-letter'
import type { BabyProfile } from '@/types/app'
import type {
  ComposeMode,
  FollowUp,
  Letter,
  LetterCompositionInput,
  LetterSpan,
  SafetyCategory,
  SlopReport,
  VoiceProfile,
} from '@/types/letters'

const COMPOSE_TIMEOUT_MS = 30_000
const VALID_SPANS: readonly LetterSpan[] = ['single', 'week', 'month', 'milestone', 'custom'] as const
/** 'custom' has no derivable window — its range lives in the UI, so it must be named. */
const EXPLICIT_ONLY_SPANS: readonly LetterSpan[] = ['custom'] as const
/** Rows fetched before selection. A superset of every span window, still bounded. */
const CANDIDATE_LIMIT = 120
/** Days of slack around a span window, so an empty week can still fall back to a real log. */
const WINDOW_SLACK_DAYS = 7
/** Total source text a single letter may be composed from. */
const MAX_SOURCE_CHARS = 80_000
const MAX_BODY_BYTES = 20_000
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

const FLAG_TIER: Record<string, 2> = {
  infant_safety: 2,
  self_harm: 2,
  harm_to_child: 2,
  domestic_violence: 2,
  severe_maternal_distress: 2,
}

const ENTRY_COLUMNS =
  'id, profile_id, baby_id, entry_kind, entry_date, body, raw_transcript, composed_body, edited_body, compose_mode, capture_mode, visibility, child_safe, voice_profile_version, slop_audit, followups, word_count, duration_seconds, covers_from, covers_to, source_entry_ids, letter_span, composed_at, created_at, updated_at'

type JournalEntryRow = {
  id: string
  profile_id: string
  baby_id: string | null
  entry_kind: string
  entry_date: string
  body: string
  raw_transcript: string | null
  composed_body: string | null
  edited_body: string | null
  compose_mode: string | null
  capture_mode: string | null
  visibility: string
  child_safe: boolean
  voice_profile_version: number | null
  slop_audit: SlopReport | null
  followups: FollowUp[] | null
  word_count: number | null
  duration_seconds: number | null
  covers_from: string | null
  covers_to: string | null
  source_entry_ids: string[] | null
  letter_span: string | null
  composed_at: string | null
  created_at: string
  updated_at: string
}

function rowToLetter(row: JournalEntryRow): Letter {
  return {
    id: row.id,
    profile_id: row.profile_id,
    baby_id: row.baby_id,
    entry_kind: row.entry_kind as Letter['entry_kind'],
    entry_date: row.entry_date,
    body: row.body,
    raw_transcript: row.raw_transcript,
    composed_body: row.composed_body,
    edited_body: row.edited_body,
    compose_mode: row.compose_mode as ComposeMode | null,
    capture_mode: row.capture_mode as Letter['capture_mode'],
    visibility: row.visibility as Letter['visibility'],
    child_safe: row.child_safe,
    voice_profile_version: row.voice_profile_version,
    slop_audit: row.slop_audit,
    followups: row.followups ?? [],
    word_count: row.word_count,
    duration_seconds: row.duration_seconds,
    covers_from: row.covers_from,
    covers_to: row.covers_to,
    source_entry_ids: row.source_entry_ids ?? [],
    letter_span: row.letter_span as Letter['letter_span'],
    composed_at: row.composed_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

function wordCount(text: string): number {
  const trimmed = text.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).length
}

class ComposeTimeoutError extends Error {
  constructor() {
    super('compose_timeout')
    this.name = 'ComposeTimeoutError'
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new ComposeTimeoutError()), ms)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (err) => {
        clearTimeout(timer)
        reject(err instanceof Error ? err : new Error(String(err)))
      }
    )
  })
}

/** UTC day arithmetic on a YYYY-MM-DD string. Never touches local time. */
function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00.000Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().split('T')[0]
}

/**
 * The candidate window to fetch — deliberately a SUPERSET of the exact span
 * range. selectSourceLogs applies the exact range; the slack only feeds its
 * nearest-log fallback so a week with no writing still cites something real.
 */
function candidateWindow(span: LetterSpan, anchorDate: string): { from: string; to: string } | null {
  const range =
    span === 'week' ? isoWeekRange(anchorDate)
    : span === 'month' ? calendarMonthRange(anchorDate)
    : span === 'milestone'
      ? { from: addDays(anchorDate, -MILESTONE_WINDOW_DAYS), to: addDays(anchorDate, MILESTONE_WINDOW_DAYS) }
      : span === 'single' ? { from: anchorDate, to: anchorDate }
      : null
  if (!range) return null
  return { from: addDays(range.from, -WINDOW_SLACK_DAYS), to: addDays(range.to, WINDOW_SLACK_DAYS) }
}

interface LetterRequestBody {
  baby_id: string
  span: LetterSpan
  source_entry_ids?: string[]
  anchor_date?: string
}

export async function POST(request: NextRequest) {
  try {
    const contentLength = request.headers.get('content-length')
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_BYTES) {
      return NextResponse.json(
        { error: true, message: 'Payload too large' },
        { status: 413, headers: SECURITY_HEADERS }
      )
    }

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: true, message: 'Unauthorized' }, { status: 401, headers: SECURITY_HEADERS })
    }

    // Tighter than /compose: a letter can read a month of logs in one LLM call.
    const rateLimit = await checkRateLimit(`letters-letter:${user.id}`, 5, 60_000)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: true, message: "You're making letters too quickly. Please wait a moment." },
        { status: 429, headers: { ...SECURITY_HEADERS, 'Retry-After': String(rateLimit.retryAfter) } }
      )
    }

    let body: LetterRequestBody
    try {
      body = (await request.json()) as LetterRequestBody
    } catch {
      return NextResponse.json({ error: true, message: 'Invalid JSON body' }, { status: 400, headers: SECURITY_HEADERS })
    }

    if (!body.baby_id || !isValidUUID(body.baby_id)) {
      return NextResponse.json({ error: true, message: 'Missing or invalid baby_id' }, { status: 400, headers: SECURITY_HEADERS })
    }
    if (!isValidEnum(body.span, VALID_SPANS)) {
      return NextResponse.json(
        { error: true, message: 'Invalid span — expected single, week, month, milestone or custom' },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }
    const span: LetterSpan = body.span

    let explicitIds: string[] | null = null
    if (body.source_entry_ids !== undefined) {
      if (!Array.isArray(body.source_entry_ids)) {
        return NextResponse.json({ error: true, message: 'source_entry_ids must be an array' }, { status: 400, headers: SECURITY_HEADERS })
      }
      const unique = Array.from(new Set(body.source_entry_ids))
      if (unique.length === 0) {
        return NextResponse.json({ error: true, message: 'source_entry_ids must not be empty' }, { status: 400, headers: SECURITY_HEADERS })
      }
      if (unique.length > MAX_SOURCE_LOGS) {
        return NextResponse.json(
          { error: true, message: `A letter can be composed from at most ${MAX_SOURCE_LOGS} entries.` },
          { status: 400, headers: SECURITY_HEADERS }
        )
      }
      if (!unique.every((id) => isValidUUID(id))) {
        return NextResponse.json({ error: true, message: 'source_entry_ids must all be UUIDs' }, { status: 400, headers: SECURITY_HEADERS })
      }
      explicitIds = unique
    }

    if (body.anchor_date !== undefined && (typeof body.anchor_date !== 'string' || !DATE_RE.test(body.anchor_date))) {
      return NextResponse.json(
        { error: true, message: 'Invalid anchor_date format — expected YYYY-MM-DD' },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }
    const anchorDate = body.anchor_date ?? new Date().toISOString().split('T')[0]

    if (!explicitIds && EXPLICIT_ONLY_SPANS.includes(span)) {
      return NextResponse.json(
        { error: true, code: 'sources_required', message: `A ${span} letter must name its source entries.` },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }

    const { data: settings } = await supabase
      .from('letters_settings')
      .select('nightly_enabled, default_compose_mode')
      .eq('profile_id', user.id)
      .maybeSingle()

    const ctx: LettersFlagContext = {
      profileId: user.id,
      userEnabled: settings ? (settings.nightly_enabled as boolean) : null,
    }
    if (!isLettersEnabled(ctx)) {
      return NextResponse.json({ error: true, message: 'Not found' }, { status: 404, headers: SECURITY_HEADERS })
    }

    // IDOR protection — caller must be a member of this baby profile.
    const isMember = await verifyBabyOwnership(supabase, user.id, body.baby_id)
    if (!isMember) {
      return NextResponse.json({ error: true, message: 'Access denied' }, { status: 403, headers: SECURITY_HEADERS })
    }

    // Candidates are always logs, always this parent's, always this baby's.
    // A letter is never composed from another letter or from an ai_summary row.
    let candidateQuery = supabase
      .from('journal_entries')
      .select(ENTRY_COLUMNS)
      .eq('profile_id', user.id)
      .eq('baby_id', body.baby_id)
      .eq('entry_kind', 'log')

    if (explicitIds) {
      candidateQuery = candidateQuery.in('id', explicitIds)
    } else {
      const window = candidateWindow(span, anchorDate)
      if (window) {
        candidateQuery = candidateQuery.gte('entry_date', window.from).lte('entry_date', window.to)
      }
    }

    const { data: candidateRows, error: sourceError } = await candidateQuery
      .order('entry_date', { ascending: true })
      .limit(CANDIDATE_LIMIT)

    if (sourceError) {
      console.error('[letters/letter] source fetch failed', { error: sourceError.message })
      return NextResponse.json(
        { error: true, message: 'Could not load your entries. Please try again.' },
        { status: 500, headers: SECURITY_HEADERS }
      )
    }

    const candidates = (candidateRows ?? []).map((r) => rowToLetter(r as JournalEntryRow))

    if (explicitIds && candidates.length !== explicitIds.length) {
      // Never silently compose from a subset — the citation would be wrong.
      return NextResponse.json(
        { error: true, code: 'invalid_sources', message: 'Some of those entries could not be found.' },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }

    // Named sources are used as given; a derived span is resolved by BE11's
    // deterministic selector, which never returns zero and never invents a log.
    let selected: Letter[]
    try {
      selected = explicitIds ? candidates : selectSourceLogs(candidates, span, anchorDate)
    } catch (selectErr) {
      if (selectErr instanceof NoSourceLogsError) {
        return NextResponse.json(
          { error: true, code: 'no_source_logs', message: 'There are no entries in that range to make a letter from yet.' },
          { status: 400, headers: SECURITY_HEADERS }
        )
      }
      throw selectErr
    }

    const sources = selected.map((row) => ({
      id: row.id,
      entry_date: row.entry_date,
      // The text the parent actually kept: edited > composed > body.
      body: ((row.edited_body ?? row.composed_body ?? row.body ?? '') as string).trim(),
    }))

    if (sources.length === 0) {
      return NextResponse.json(
        { error: true, code: 'no_source_logs', message: 'There are no entries in that range to make a letter from yet.' },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }

    const totalChars = sources.reduce((n, s) => n + s.body.length, 0)
    if (totalChars > MAX_SOURCE_CHARS) {
      return NextResponse.json(
        { error: true, code: 'sources_too_large', message: 'That is too much writing for one letter. Try a shorter span.' },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }

    // Facts only, all from real rows.
    let babyName: string | null = null
    let ageInMonths: number | null = null
    const { data: babyRow } = await supabase
      .from('baby_profiles')
      .select(
        'id, name, due_date, date_of_birth, stage, pending_proactive_type, pending_proactive_set_at, created_by_profile_id, created_at, planning_sub_option, planning_expected_month'
      )
      .eq('id', body.baby_id)
      .maybeSingle()
    if (babyRow) {
      babyName = (babyRow.name as string | null) ?? null
      ageInMonths = getBabyAgeInfo(babyRow as BabyProfile).age_in_months ?? null
    }

    const { data: vp } = await supabase
      .from('voice_profiles')
      .select('*')
      .eq('profile_id', user.id)
      .eq('baby_id', body.baby_id)
      .maybeSingle()
    const voiceProfile = (vp as VoiceProfile | null) ?? null

    // A letter is model-composed by definition; shaped_compose decides whether it
    // may be re-voiced or must stay close to the parent's own words.
    const composeMode: ComposeMode = isSubFlagEnabled('shaped_compose', ctx) ? 'shaped' : 'keep_words'

    const input: LetterCompositionInput = {
      span,
      sources: sources.map((s) => ({
        id: s.id,
        entry_date: s.entry_date,
        body: sanitizeForPrompt(s.body),
        // The kept text is the source of truth for a letter; the raw transcript
        // is deliberately not re-surfaced here.
        raw_transcript: null,
      })),
      voiceProfile,
      babyName,
      ageInMonths,
    }

    let composedText: string
    let safetyCategory: SafetyCategory | null = null
    let citedIds: string[] = sources.map((s) => s.id)
    try {
      const result = await withTimeout(composeLetter(anthropicClient, input), COMPOSE_TIMEOUT_MS)
      composedText = (result.body ?? '').trim()
      safetyCategory = result.flag ?? null
      // Cite exactly what the model was shown: composeLetter drops empty logs
      // and bounds the set, so this can be narrower than `selected`.
      if (result.sourceEntryIds && result.sourceEntryIds.length > 0) {
        citedIds = result.sourceEntryIds
      }
    } catch (composeErr) {
      if (composeErr instanceof NoSourceLogsError) {
        return NextResponse.json(
          { error: true, code: 'no_source_logs', message: 'There are no entries in that range to make a letter from yet.' },
          { status: 400, headers: SECURITY_HEADERS }
        )
      }
      // Nothing was written. Every source log is exactly as it was.
      if (composeErr instanceof ComposeTimeoutError) {
        console.warn('[letters/letter] timeout', { baby_id: body.baby_id, span, source_count: sources.length })
        return NextResponse.json(
          { error: true, code: 'compose_timeout', message: 'Making this letter took too long. Your entries are safe — try again in a moment.' },
          { status: 504, headers: SECURITY_HEADERS }
        )
      }
      const msg = composeErr instanceof Error ? composeErr.message : String(composeErr)
      console.error('[letters/letter] compose failed', { baby_id: body.baby_id, span, source_count: sources.length, error: msg })
      return NextResponse.json(
        { error: true, code: 'compose_failed', message: 'We could not write this letter right now. Your entries are safe.' },
        { status: 502, headers: SECURITY_HEADERS }
      )
    }

    if (composedText.length === 0) {
      console.error('[letters/letter] empty composition', { baby_id: body.baby_id, span, source_count: sources.length })
      return NextResponse.json(
        { error: true, code: 'compose_failed', message: 'We could not write this letter right now. Your entries are safe.' },
        { status: 502, headers: SECURITY_HEADERS }
      )
    }

    // Deterministic slop pass. Never block the save on a failed check.
    let slopAudit: SlopReport | null = null
    let finalBody = composedText
    try {
      const report = deslop(composedText)
      slopAudit = report
      finalBody = report.clean
    } catch (deslopErr) {
      const msg = deslopErr instanceof Error ? deslopErr.message : String(deslopErr)
      console.warn('[letters/letter] deslop failed, degrading silently', { error: msg })
      slopAudit = null
      finalBody = composedText
    }

    const citedSet = new Set(citedIds)
    const citedDates = sources.filter((s) => citedSet.has(s.id)).map((s) => s.entry_date).sort()
    const coversFrom = citedDates[0] ?? sources[0].entry_date
    const coversTo = citedDates[citedDates.length - 1] ?? sources[sources.length - 1].entry_date
    const now = new Date().toISOString()

    // INSERT only. A letter is a new row; the logs it cites are never touched.
    const { data: inserted, error: insertError } = await supabase
      .from('journal_entries')
      .insert({
        profile_id: user.id,
        baby_id: body.baby_id,
        entry_kind: 'letter',
        entry_date: body.anchor_date ?? coversTo,
        source_entry_ids: citedIds, // >=1, per journal_entries_sources_chk
        letter_span: span,
        body: finalBody,
        composed_body: finalBody,
        compose_mode: composeMode,
        slop_audit: slopAudit,
        word_count: wordCount(finalBody),
        voice_profile_version: voiceProfile?.version ?? null,
        covers_from: span === 'single' ? null : coversFrom,
        covers_to: span === 'single' ? null : coversTo,
        composed_at: now,
        updated_at: now,
      })
      .select(ENTRY_COLUMNS)
      .single()

    if (insertError || !inserted) {
      console.error('[letters/letter] persist failed', { baby_id: body.baby_id, span, error: insertError?.message ?? 'unknown' })
      return NextResponse.json(
        { error: true, code: 'letter_save_failed', message: 'Your letter could not be saved. Your entries are safe.' },
        { status: 500, headers: SECURITY_HEADERS }
      )
    }

    const letter = rowToLetter(inserted as JournalEntryRow)

    // Tier + category ONLY. Never the triggering text, never blocking the response.
    if (safetyCategory) {
      const { error: flagError } = await supabase.from('safety_flags').insert({
        profile_id: user.id,
        entry_id: letter.id,
        tier: FLAG_TIER[safetyCategory] ?? 2,
        category: safetyCategory,
        surfaced: false,
        resource_tapped: false,
      })
      if (flagError) {
        console.error('[letters/letter] failed to record safety flag', { entry_id: letter.id, error: flagError.message })
      }
    }

    console.log('[letters/letter] composed', {
      entry_id: letter.id,
      span,
      source_count: citedIds.length,
      mode_used: composeMode,
      flagged: safetyCategory !== null,
    })

    return NextResponse.json(
      {
        entry: letter,
        span,
        source_count: citedIds.length,
        source_entry_ids: citedIds,
        compose_mode_used: composeMode,
      },
      { headers: SECURITY_HEADERS }
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[letters/letter] Unexpected error:', msg)
    return NextResponse.json(
      { error: true, message: 'An unexpected error occurred. Your entries are safe.' },
      { status: 500, headers: SECURITY_HEADERS }
    )
  }
}

/**
 * @module LettersEntriesAPI
 * @description GET /api/letters/entries — the Journal timeline feed. Paginated,
 *   reverse-chronological, scoped to the authenticated parent's own rows only
 *   (belt-and-suspenders on top of RLS — every query filters on profile_id
 *   explicitly).
 *
 *   The tab names the habit, not the artifact: logs (entry_kind='log') and
 *   letters (entry_kind='letter') live in the same feed and the segmented
 *   control picks a view. So this route returns BOTH by default and accepts
 *   `entry_kind=log|letter|all` to render Entries and Letters separately.
 *   Pass include_ai_summary=true to also surface the pre-existing AI
 *   weekly-summary rows (entry_kind='ai_summary') in the same feed.
 *
 *   Search uses Postgres full-text search (idx_journal_entries_body_fts, the
 *   GIN index added in lumira_v48_letters.sql) rather than fetching rows and
 *   filtering client-side.
 * @version 1.0.0
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SECURITY_HEADERS } from '@/lib/utils'
import { isValidUUID, isValidEnum, sanitizeString } from '@/lib/validation'
import { checkRateLimit } from '@/lib/rate-limit'
import { isLettersEnabled, type LettersFlagContext } from '@/lib/letters/flags'
import type { Letter, ComposeMode, SlopReport, FollowUp } from '@/types/letters'

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 50
const MAX_OFFSET = 10_000
const MAX_SEARCH_LEN = 200
const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/
/** Views the Journal tab can ask for. 'all' = the habit and the artifact together. */
const VALID_KIND_FILTERS = ['log', 'letter', 'all'] as const
type KindFilter = (typeof VALID_KIND_FILTERS)[number]

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

/** Clamps a caller-supplied integer query param into a safe, bounded range. */
function boundedInt(raw: string | null, fallback: number, min: number, max: number): number {
  if (raw === null) return fallback
  const n = Number.parseInt(raw, 10)
  if (!Number.isFinite(n)) return fallback
  return Math.min(Math.max(n, min), max)
}

const ENTRY_COLUMNS =
  'id, profile_id, baby_id, entry_kind, entry_date, body, raw_transcript, composed_body, edited_body, compose_mode, capture_mode, visibility, child_safe, voice_profile_version, slop_audit, followups, word_count, duration_seconds, covers_from, covers_to, source_entry_ids, letter_span, composed_at, created_at, updated_at'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: true, message: 'Unauthorized' }, { status: 401, headers: SECURITY_HEADERS })
    }

    const rateLimit = await checkRateLimit(`letters-entries:${user.id}`, 60, 60_000)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: true, message: "You're loading letters too quickly. Please wait a moment." },
        { status: 429, headers: { ...SECURITY_HEADERS, 'Retry-After': String(rateLimit.retryAfter) } }
      )
    }

    const { data: settings } = await supabase
      .from('letters_settings')
      .select('nightly_enabled')
      .eq('profile_id', user.id)
      .maybeSingle()

    const ctx: LettersFlagContext = {
      profileId: user.id,
      userEnabled: settings ? (settings.nightly_enabled as boolean) : null,
    }
    if (!isLettersEnabled(ctx)) {
      return NextResponse.json({ error: true, message: 'Not found' }, { status: 404, headers: SECURITY_HEADERS })
    }

    const params = request.nextUrl.searchParams

    const babyId = params.get('baby_id')
    if (babyId !== null && !isValidUUID(babyId)) {
      return NextResponse.json({ error: true, message: 'Invalid baby_id format' }, { status: 400, headers: SECURITY_HEADERS })
    }

    const month = params.get('month')
    if (month !== null && !MONTH_RE.test(month)) {
      return NextResponse.json({ error: true, message: 'Invalid month — expected YYYY-MM' }, { status: 400, headers: SECURITY_HEADERS })
    }

    const rawQuery = params.get('q')
    const searchQuery = rawQuery !== null ? sanitizeString(rawQuery, MAX_SEARCH_LEN) : null
    if (rawQuery !== null && searchQuery === '') {
      return NextResponse.json({ error: true, message: 'q must not be empty' }, { status: 400, headers: SECURITY_HEADERS })
    }

    const rawKind = params.get('entry_kind')
    if (rawKind !== null && !isValidEnum(rawKind, VALID_KIND_FILTERS)) {
      return NextResponse.json(
        { error: true, message: 'Invalid entry_kind — expected log, letter or all' },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }
    const kindFilter: KindFilter = (rawKind as KindFilter | null) ?? 'all'

    const includeAiSummary = params.get('include_ai_summary') === 'true'
    const limit = boundedInt(params.get('limit'), DEFAULT_LIMIT, 1, MAX_LIMIT)
    const offset = boundedInt(params.get('offset'), 0, 0, MAX_OFFSET)

    let query = supabase
      .from('journal_entries')
      .select(ENTRY_COLUMNS, { count: 'exact' })
      .eq('profile_id', user.id) // explicit — never rely on RLS alone

    // Both kinds by default; the segmented control narrows to one view.
    const kinds: string[] = kindFilter === 'all' ? ['log', 'letter'] : [kindFilter]
    if (includeAiSummary) kinds.push('ai_summary')
    query = query.in('entry_kind', kinds)

    if (babyId) {
      query = query.eq('baby_id', babyId)
    }

    if (month) {
      const [y, m] = month.split('-').map(Number)
      const from = `${month}-01`
      const lastDay = new Date(y, m, 0).getDate() // m is 1-indexed; day 0 of next month = last day of this month
      const to = `${month}-${String(lastDay).padStart(2, '0')}`
      query = query.gte('entry_date', from).lte('entry_date', to)
    }

    if (searchQuery) {
      // Server-side full-text search via the GIN index on to_tsvector('english', body).
      query = query.textSearch('body', searchQuery, { type: 'websearch', config: 'english' })
    }

    query = query
      .order('entry_date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: rows, error, count } = await query
    if (error) throw error

    const entries = (rows ?? []).map((r) => rowToLetter(r as JournalEntryRow))
    const total = count ?? entries.length

    return NextResponse.json(
      {
        entries,
        total,
        limit,
        offset,
        entry_kind: kindFilter,
        has_more: offset + entries.length < total,
      },
      { headers: SECURITY_HEADERS }
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[letters/entries] Error:', msg)
    return NextResponse.json(
      { error: true, message: 'Failed to load letters. Please try again.' },
      { status: 500, headers: SECURITY_HEADERS }
    )
  }
}

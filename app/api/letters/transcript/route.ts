/**
 * @module LettersTranscriptAPI
 * @description POST /api/letters/transcript — Persists tonight's raw
 *   transcript IMMEDIATELY, before any composition. This is the P0
 *   durability guarantee from PRD §15.5: the transcript must be saved
 *   before anything else — including composition — can fail. Composition
 *   happens in a separate request (POST /api/letters/compose) so a
 *   composition failure can never touch what was just saved here.
 *
 *   The nightly unit is a LOG (entry_kind='log'), not a letter. The night is
 *   COMPLETE the moment this route returns success. Composition is optional
 *   and never a gate: a letter is a separate, opt-in artifact composed later
 *   from one or more logs (POST /api/letters/letter).
 *
 *   Order of operations:
 *     1. Validate input, authenticate, flag-gate (404 when disabled).
 *     2. Apply learned/seeded name corrections to the transcript.
 *     3. Upsert journal_entries (entry_kind='log'): the write that must
 *        never be lost. `body` is set to the corrected transcript as a safe
 *        fallback so the log is never blank, even if composition never runs.
 *     4. Run deterministic safety classification and write only the tier
 *        and category to safety_flags — never the triggering text.
 *
 *   Idempotent: retrying this call for the same profile/baby/date updates
 *   the existing row rather than creating a duplicate. This is enforced in
 *   the database by the partial unique index uniq_journal_log_per_day
 *   (profile_id, baby_id, entry_date) WHERE entry_kind = 'log', so two
 *   concurrent POSTs cannot both insert: the loser gets 23505 and is
 *   converted into an update of the winner's row.
 * @version 1.0.0
 * @since September 2026
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SECURITY_HEADERS } from '@/lib/utils'
import { checkRateLimit } from '@/lib/rate-limit'
import { isValidUUID, verifyBabyOwnership } from '@/lib/validation'
import { isLettersEnabled } from '@/lib/letters/flags'
import { applyCorrections } from '@/lib/letters/names'
import { classify } from '@/lib/letters/safety'
import type { CaptureMode, NameCorrection } from '@/types/letters'

interface TranscriptRequest {
  baby_id: string
  entry_date?: string
  raw_transcript: string
  capture_mode: CaptureMode
  duration_seconds?: number | null
}

/** Generous cap for a ~few-minute nightly monologue transcript. */
const MAX_TRANSCRIPT_CHARS = 20_000
/** Reject the request body outright above this size, before parsing. */
const MAX_BODY_BYTES = 100_000
const MAX_DURATION_SECONDS = 3_600
const VALID_CAPTURE_MODES: CaptureMode[] = ['spoken', 'typed', 'mixed', 'not_much']
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
/** Postgres unique_violation. Raised by uniq_journal_log_per_day on a same-day race. */
const UNIQUE_VIOLATION = '23505'

export async function POST(request: NextRequest) {
  try {
    const contentLength = request.headers.get('content-length')
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_BYTES) {
      return NextResponse.json(
        { error: true, message: 'Payload too large' },
        { status: 413, headers: SECURITY_HEADERS }
      )
    }

    let body: TranscriptRequest
    try {
      body = (await request.json()) as TranscriptRequest
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
    if (typeof body.raw_transcript !== 'string') {
      return NextResponse.json(
        { error: true, message: 'Missing required field: raw_transcript' },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }
    const rawTranscript = body.raw_transcript.replace(/\0/g, '').trim()
    if (rawTranscript.length === 0) {
      return NextResponse.json(
        { error: true, message: 'raw_transcript must not be empty' },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }
    if (rawTranscript.length > MAX_TRANSCRIPT_CHARS) {
      return NextResponse.json(
        { error: true, message: `raw_transcript exceeds maximum length of ${MAX_TRANSCRIPT_CHARS} characters` },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }
    if (!body.capture_mode || !VALID_CAPTURE_MODES.includes(body.capture_mode)) {
      return NextResponse.json(
        { error: true, message: 'Invalid or missing capture_mode' },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }

    let entryDate: string
    if (body.entry_date !== undefined) {
      if (typeof body.entry_date !== 'string' || !DATE_RE.test(body.entry_date)) {
        return NextResponse.json(
          { error: true, message: 'Invalid entry_date format — expected YYYY-MM-DD' },
          { status: 400, headers: SECURITY_HEADERS }
        )
      }
      entryDate = body.entry_date
    } else {
      entryDate = new Date().toISOString().split('T')[0]
    }

    let durationSeconds: number | null = null
    if (body.duration_seconds !== undefined && body.duration_seconds !== null) {
      if (
        typeof body.duration_seconds !== 'number' ||
        !Number.isFinite(body.duration_seconds) ||
        body.duration_seconds < 0 ||
        body.duration_seconds > MAX_DURATION_SECONDS
      ) {
        return NextResponse.json(
          { error: true, message: `duration_seconds must be a number between 0 and ${MAX_DURATION_SECONDS}` },
          { status: 400, headers: SECURITY_HEADERS }
        )
      }
      durationSeconds = Math.round(body.duration_seconds)
    }

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
    const isMember = await verifyBabyOwnership(supabase, user.id, body.baby_id)
    if (!isMember) {
      return NextResponse.json(
        { error: true, message: 'Access denied' },
        { status: 403, headers: SECURITY_HEADERS }
      )
    }

    // Name corrections applied before storing, so raw_transcript is already
    // correct by the time composition (BE10) or anything else reads it.
    const { data: correctionsData } = await supabase
      .from('name_corrections')
      .select('heard, correct, hit_count, source')
      .eq('profile_id', user.id)
    const nameCorrections = (correctionsData || []) as NameCorrection[]
    const { text: correctedTranscript } = applyCorrections(rawTranscript, nameCorrections)

    // Deterministic safety classification, pre-composition. Only tier and
    // category ever leave this function — never the transcript text.
    const safetyResult = classify(correctedTranscript)

    // Idempotent upsert: a retried POST for the same profile/baby/date
    // updates the existing row instead of creating a duplicate.
    const { data: existing } = await supabase
      .from('journal_entries')
      .select('id, composed_body, edited_body')
      .eq('profile_id', user.id)
      .eq('baby_id', body.baby_id)
      .eq('entry_kind', 'log')
      .eq('entry_date', entryDate)
      .maybeSingle()

    const now = new Date().toISOString()
    const entryRow: Record<string, unknown> = {
      profile_id: user.id,
      baby_id: body.baby_id,
      entry_kind: 'log',
      entry_date: entryDate,
      raw_transcript: correctedTranscript,
      // Safe fallback so the entry is never blank, even if composition
      // never runs (PRD §15.5, P0).
      body: correctedTranscript,
      capture_mode: body.capture_mode,
      duration_seconds: durationSeconds,
      updated_at: now,
    }

    /**
     * Updates today's existing log in place. Returns null when the row is gone.
     *
     * `body` is only overwritten while the log is still raw. Once the parent has
     * composed or edited it, a retried transcript POST must not roll the visible
     * text back to the transcript — that reads as losing the entry (PRD §15.5).
     * raw_transcript is always refreshed; it is never cleared.
     */
    const updateExisting = async (id: string, hasKeptText: boolean): Promise<string | null> => {
      const payload = { ...entryRow }
      if (hasKeptText) delete payload.body
      const { data: updated, error: updateError } = await supabase
        .from('journal_entries')
        .update(payload)
        .eq('id', id)
        .eq('profile_id', user.id)
        .select('id')
        .maybeSingle()
      if (updateError) {
        console.error('[letters/transcript] Update failed:', updateError.message)
        return null
      }
      return (updated?.id as string | undefined) ?? null
    }

    let entryId: string | null = null
    if (existing?.id) {
      entryId = await updateExisting(
        existing.id as string,
        Boolean(existing.composed_body || existing.edited_body)
      )
    } else {
      const { data: inserted, error: insertError } = await supabase
        .from('journal_entries')
        .insert(entryRow)
        .select('id')
        .single()

      if (insertError && insertError.code === UNIQUE_VIOLATION) {
        // Lost the race against a concurrent POST for the same day. The
        // partial unique index uniq_journal_log_per_day already guarantees
        // exactly one log exists — adopt it and update it in place rather
        // than retrying the insert.
        const { data: winner } = await supabase
          .from('journal_entries')
          .select('id, composed_body, edited_body')
          .eq('profile_id', user.id)
          .eq('baby_id', body.baby_id)
          .eq('entry_kind', 'log')
          .eq('entry_date', entryDate)
          .maybeSingle()
        if (winner?.id) {
          entryId = await updateExisting(
            winner.id as string,
            Boolean(winner.composed_body || winner.edited_body)
          )
        }
      } else if (insertError || !inserted) {
        console.error('[letters/transcript] Insert failed:', insertError?.message)
      } else {
        entryId = inserted.id as string
      }
    }

    if (!entryId) {
      return NextResponse.json(
        { error: true, message: 'Failed to save entry. Please try again.' },
        { status: 500, headers: SECURITY_HEADERS }
      )
    }

    // Safety flag: tier + category ONLY. Never the triggering text.
    const { error: safetyError } = await supabase.from('safety_flags').insert({
      profile_id: user.id,
      entry_id: entryId,
      tier: safetyResult.tier,
      category: safetyResult.category,
    })
    if (safetyError) {
      // Non-fatal: the transcript is already durably persisted, which is
      // the P0 guarantee. Log ids/tier only, never transcript content.
      console.error(
        '[letters/transcript] Safety flag write failed:',
        safetyError.message,
        'entryId:',
        entryId,
        'tier:',
        safetyResult.tier
      )
    }

    console.log(
      '[letters/transcript] Saved entry',
      entryId,
      'captureMode:',
      body.capture_mode,
      'durationSeconds:',
      durationSeconds,
      'safetyTier:',
      safetyResult.tier
    )

    return NextResponse.json(
      {
        success: true,
        entryId,
        entryDate,
        entryKind: 'log' as const,
        safety: {
          tier: safetyResult.tier,
          category: safetyResult.category,
          templateKey: safetyResult.templateKey,
        },
      },
      { headers: SECURITY_HEADERS }
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[letters/transcript] Unexpected error:', msg)
    return NextResponse.json(
      { error: true, message: 'Lumira is taking a moment. Try again.' },
      { status: 500, headers: SECURITY_HEADERS }
    )
  }
}

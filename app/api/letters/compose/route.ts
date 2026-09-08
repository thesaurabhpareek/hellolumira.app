/**
 * @module LettersComposeAPI
 * @description POST /api/letters/compose — turns a saved transcript (written by
 *   /api/letters/transcript) into the reader-facing body of that LOG
 *   (entry_kind='log').
 *
 *   This route does NOT produce letters. A letter is a separate artifact
 *   composed from one or more logs by POST /api/letters/letter. Composition
 *   here is optional polish on a log that is already saved and already
 *   complete — the night ended when /transcript returned.
 *
 *   Non-negotiable per docs/LETTERS-ENGINEERING-CONTRACT.md and the Letters PRD
 *   (§15.5, entry-loss prevention is P0): the transcript is already persisted
 *   before this route ever runs. Nothing in this handler may destroy it. Every
 *   failure path either (a) returns a typed error while leaving the row exactly
 *   as it was, or (b) — timeout only — degrades to compose_mode='raw' with the
 *   transcript itself as the body, so the parent always has something real.
 *
 *   ASSUMED CONTRACT (lanes BE1/BE6/BE7 were not yet built at the time this
 *   route was written — see final report REQUEST lines for the exact shapes
 *   this file expects):
 *     - lib/letters/compose-keep-words.ts  → composeKeepWords(params): string
 *     - lib/letters/compose-shaped.ts      → composeShaped(anthropic, params): Promise<string>
 *     - lib/letters/deslop.ts              → deslop(input: string): SlopReport
 * @version 1.0.0
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SECURITY_HEADERS } from '@/lib/utils'
import { isValidUUID, isValidEnum } from '@/lib/validation'
import { checkRateLimit } from '@/lib/rate-limit'
import { sanitizeForPrompt } from '@/lib/sanitize-prompt'
import anthropicClient from '@/lib/claude'
import { isLettersEnabled, isSubFlagEnabled, type LettersFlagContext } from '@/lib/letters/flags'
import { deslop } from '@/lib/letters/deslop'
import { composeKeepWords } from '@/lib/letters/compose-keep-words'
import { composeShaped, type ExemplarCandidate } from '@/lib/letters/compose-shaped'
import { getBabyAgeInfo } from '@/lib/baby-age'
import type { BabyProfile } from '@/types/app'
import type {
  Letter,
  ComposeMode,
  LetterPromptContext,
  SafetyCategory,
  SlopReport,
  VoiceProfile,
  FollowUp,
} from '@/types/letters'

const COMPOSE_TIMEOUT_MS = 20_000
const VALID_MODES: readonly ComposeMode[] = ['keep_words', 'shaped'] as const

// Every category compose can emit via [[LUMIRA_FLAG: ...]] is a PRD §18.4 Tier-2
// (active risk) category — the flag exists precisely to stop composition cold.
const FLAG_TIER: Record<string, 2> = {
  infant_safety: 2,
  self_harm: 2,
  harm_to_child: 2,
  domestic_violence: 2,
  severe_maternal_distress: 2,
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

/**
 * Parses a trailing `[[LUMIRA_FLAG: <category>]]` line out of composed text.
 * Per PRD §17.4 the model returns this on its own final line. It must never
 * reach storage or render in the journal.
 */
function extractSafetyFlag(text: string): { body: string; category: SafetyCategory | null } {
  const match = text.match(/\n?\s*\[\[LUMIRA_FLAG:\s*([a-z_]+)\s*\]\]\s*$/i)
  if (!match) return { body: text.trim(), category: null }
  const raw = match[1].toLowerCase()
  const known: SafetyCategory[] = [
    'infant_safety',
    'self_harm',
    'harm_to_child',
    'domestic_violence',
    'severe_maternal_distress',
  ]
  const category = (known as string[]).includes(raw) ? (raw as SafetyCategory) : null
  const body = text.slice(0, match.index).trim()
  return { body, category }
}

function wordCount(text: string): number {
  const trimmed = text.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).length
}

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

interface ComposeRequestBody {
  entry_id: string
  mode?: ComposeMode
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: true, message: 'Unauthorized' }, { status: 401, headers: SECURITY_HEADERS })
    }

    // Rate limit — composition invokes an LLM call, so keep this tighter than a read.
    const rateLimit = await checkRateLimit(`letters-compose:${user.id}`, 10, 60_000)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: true, message: "You're composing letters too quickly. Please wait a moment." },
        { status: 429, headers: { ...SECURITY_HEADERS, 'Retry-After': String(rateLimit.retryAfter) } }
      )
    }

    let body: ComposeRequestBody
    try {
      body = (await request.json()) as ComposeRequestBody
    } catch {
      return NextResponse.json({ error: true, message: 'Invalid JSON body' }, { status: 400, headers: SECURITY_HEADERS })
    }

    if (!body.entry_id || !isValidUUID(body.entry_id)) {
      return NextResponse.json({ error: true, message: 'Missing or invalid entry_id' }, { status: 400, headers: SECURITY_HEADERS })
    }
    if (body.mode !== undefined && !isValidEnum(body.mode, VALID_MODES)) {
      return NextResponse.json({ error: true, message: 'Invalid mode — expected keep_words or shaped' }, { status: 400, headers: SECURITY_HEADERS })
    }

    // Per-user Letters settings drive both the flag-gate context and the default mode.
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

    // Fetch + ownership-scope the entry in one query (never trust entry_id alone).
    const { data: entryRow, error: fetchError } = await supabase
      .from('journal_entries')
      .select(
        'id, profile_id, baby_id, entry_kind, entry_date, body, raw_transcript, composed_body, edited_body, compose_mode, capture_mode, visibility, child_safe, voice_profile_version, slop_audit, followups, word_count, duration_seconds, covers_from, covers_to, source_entry_ids, letter_span, composed_at, created_at, updated_at'
      )
      .eq('id', body.entry_id)
      .eq('profile_id', user.id)
      .eq('entry_kind', 'log')
      .maybeSingle()

    if (fetchError) throw fetchError
    if (!entryRow) {
      return NextResponse.json({ error: true, message: 'Entry not found' }, { status: 404, headers: SECURITY_HEADERS })
    }
    const entry = entryRow as JournalEntryRow

    const transcript = (entry.raw_transcript ?? '').trim()
    if (!transcript) {
      return NextResponse.json(
        { error: true, message: 'This entry has no transcript to compose from yet.' },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }

    // Resolve requested mode → actual mode. A disabled sub-flag NEVER fails the
    // request — it silently falls back to keep_words and the fallback is recorded.
    const requestedMode: ComposeMode = body.mode ?? (settings?.default_compose_mode as ComposeMode | undefined) ?? 'keep_words'
    let actualMode: ComposeMode = requestedMode
    let fallbackReason: 'shaped_compose_disabled' | 'no_voice_profile' | 'timeout' | null = null

    if (requestedMode === 'shaped' && !isSubFlagEnabled('shaped_compose', ctx)) {
      actualMode = 'keep_words'
      fallbackReason = 'shaped_compose_disabled'
    }

    // Shaped composition writes in the parent's voice, so it requires a voice
    // profile. Without one we degrade to keep_words rather than invent a voice.
    let voiceProfile: VoiceProfile | null = null
    if (actualMode === 'shaped' && entry.baby_id) {
      const { data: vp } = await supabase
        .from('voice_profiles')
        .select('*')
        .eq('profile_id', user.id)
        .eq('baby_id', entry.baby_id)
        .maybeSingle()
      voiceProfile = (vp as VoiceProfile | null) ?? null
    }
    if (actualMode === 'shaped' && !voiceProfile) {
      actualMode = 'keep_words'
      fallbackReason = 'no_voice_profile'
    }

    let babyName: string | null = null
    let ageInMonths: number | null = null
    let ageInWeeks: number | null = null
    if (actualMode === 'shaped' && entry.baby_id) {
      const { data: babyRow } = await supabase
        .from('baby_profiles')
        .select(
          'id, name, due_date, date_of_birth, stage, pending_proactive_type, pending_proactive_set_at, created_by_profile_id, created_at, planning_sub_option, planning_expected_month'
        )
        .eq('id', entry.baby_id)
        .maybeSingle()
      if (babyRow) {
        const ageInfo = getBabyAgeInfo(babyRow as BabyProfile)
        babyName = (babyRow.name as string | null) ?? null
        ageInMonths = ageInfo.age_in_months ?? null
        ageInWeeks = ageInfo.age_in_weeks ?? null
      }
    }

    let composedText: string
    let safetyCategory: SafetyCategory | null = null

    try {
      if (actualMode === 'shaped' && voiceProfile) {
        // Up to three of the parent's own previous final logs as style exemplars
        // (PRD §17.3). Best-available final text per entry: edited > composed > body.
        const { data: priorRows } = await supabase
          .from('journal_entries')
          .select('id, entry_date, composed_body, edited_body, body')
          .eq('profile_id', user.id)
          .eq('entry_kind', 'log')
          .neq('id', entry.id)
          .order('entry_date', { ascending: false })
          .limit(3)

        // authenticity_score is not persisted anywhere yet, so it is 0 for every
        // candidate — unknown, never guessed. See REQUEST in the final report.
        const exemplars: ExemplarCandidate[] = (priorRows ?? [])
          .map((r) => ({
            entry_id: r.id as string,
            text: ((r.edited_body ?? r.composed_body ?? r.body ?? '') as string).trim(),
            authenticity_score: 0,
            entry_date: r.entry_date as string,
            valence: null,
            source: 'entry' as const,
          }))
          .filter((c) => c.text.length > 0)

        // Only facts we actually hold at this boundary. Nothing is fabricated:
        // fields with no source row stay empty/null.
        const composeContext: LetterPromptContext = {
          babyName: babyName,
          ageInMonths: ageInMonths,
          ageInWeeks: ageInWeeks,
          todaysMilestones: [],
          todaysCheckin: null,
          daysSinceLastEntry: null,
          openThreads: [],
        }

        const result = await withTimeout(
          composeShaped(anthropicClient, {
            transcript: sanitizeForPrompt(transcript),
            voiceProfile,
            exemplars,
            entryDate: entry.entry_date,
            context: composeContext,
          }),
          COMPOSE_TIMEOUT_MS
        )

        // Second, redundant strip. The library already removes the flag line;
        // this guarantees it can never reach storage even if that changes.
        const extracted = extractSafetyFlag(result.body)
        composedText = extracted.body
        safetyCategory = result.flag ?? extracted.category
      } else {
        const keepWordsResult = await withTimeout(
          Promise.resolve(
            composeKeepWords({
              transcript,
              followups: Array.isArray(entry.followups) ? entry.followups : [],
              voiceProfile,
            })
          ),
          COMPOSE_TIMEOUT_MS
        )
        // slop_audit is recomputed downstream from composedText, so the
        // module's own report is not carried forward here.
        composedText = keepWordsResult.body
      }
    } catch (composeErr) {
      if (composeErr instanceof ComposeTimeoutError) {
        // Hard timeout — never lose the night. Degrade to the raw transcript as
        // the reader-facing body and save it. The transcript column is untouched.
        const fallbackBody = transcript
        const { data: saved, error: saveError } = await supabase
          .from('journal_entries')
          .update({
            body: fallbackBody,
            compose_mode: 'raw',
            composed_body: null,
            slop_audit: null,
            word_count: wordCount(fallbackBody),
            composed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', entry.id)
          .eq('profile_id', user.id)
          .select(
            'id, profile_id, baby_id, entry_kind, entry_date, body, raw_transcript, composed_body, edited_body, compose_mode, capture_mode, visibility, child_safe, voice_profile_version, slop_audit, followups, word_count, duration_seconds, covers_from, covers_to, source_entry_ids, letter_span, composed_at, created_at, updated_at'
          )
          .single()

        console.warn('[letters/compose] timeout fallback to raw', { entry_id: entry.id, mode_requested: requestedMode })

        if (saveError || !saved) {
          // Could not even persist the raw fallback — the original row (with its
          // transcript intact) is still there. Report failure, do not throw past
          // the boundary.
          return NextResponse.json(
            { error: true, code: 'compose_timeout', message: 'Composing took too long. Your recording is safe — try again in a moment.' },
            { status: 504, headers: SECURITY_HEADERS }
          )
        }

        return NextResponse.json(
          {
            entry: rowToLetter(saved as JournalEntryRow),
            compose_mode_used: 'raw' as ComposeMode,
            fallback: true,
            fallback_reason: 'timeout' as const,
          },
          { headers: SECURITY_HEADERS }
        )
      }

      // Any other failure — API error, malformed response. The transcript row is
      // untouched; return a typed error the client can show.
      const msg = composeErr instanceof Error ? composeErr.message : String(composeErr)
      console.error('[letters/compose] compose failed', { entry_id: entry.id, mode: actualMode, error: msg })
      return NextResponse.json(
        {
          error: true,
          code: 'compose_failed',
          message: 'We could not shape this entry right now. Your recording is safe.',
          entry_id: entry.id,
        },
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
      console.warn('[letters/compose] deslop failed, degrading silently', { entry_id: entry.id, error: msg })
      slopAudit = null
      finalBody = composedText
    }

    const updatePayload: Record<string, unknown> = {
      body: finalBody,
      composed_body: actualMode === 'shaped' ? finalBody : entry.composed_body,
      compose_mode: actualMode,
      slop_audit: slopAudit,
      word_count: wordCount(finalBody),
      composed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    if (actualMode === 'shaped') {
      const { data: vp } = entry.baby_id
        ? await supabase
            .from('voice_profiles')
            .select('version')
            .eq('profile_id', user.id)
            .eq('baby_id', entry.baby_id)
            .maybeSingle()
        : { data: null }
      updatePayload.voice_profile_version = (vp?.version as number | undefined) ?? null
    }

    const { data: updated, error: updateError } = await supabase
      .from('journal_entries')
      .update(updatePayload)
      .eq('id', entry.id)
      .eq('profile_id', user.id)
      .select(
        'id, profile_id, baby_id, entry_kind, entry_date, body, raw_transcript, composed_body, edited_body, compose_mode, capture_mode, visibility, child_safe, voice_profile_version, slop_audit, followups, word_count, duration_seconds, covers_from, covers_to, source_entry_ids, letter_span, composed_at, created_at, updated_at'
      )
      .single()

    if (updateError || !updated) {
      // The composed text exists in memory but failed to persist. The original
      // row (transcript intact, prior body untouched) is unaffected.
      console.error('[letters/compose] persist failed', { entry_id: entry.id, error: updateError?.message ?? 'unknown' })
      return NextResponse.json(
        { error: true, code: 'compose_save_failed', message: 'Your entry composed but could not be saved. Please try again.', entry_id: entry.id },
        { status: 500, headers: SECURITY_HEADERS }
      )
    }

    // Write the safety flag (tier + category only — never the triggering text)
    // and never let it block the response the parent sees.
    if (safetyCategory) {
      try {
        await supabase.from('safety_flags').insert({
          profile_id: user.id,
          entry_id: entry.id,
          tier: FLAG_TIER[safetyCategory] ?? 2,
          category: safetyCategory,
          surfaced: false,
          resource_tapped: false,
          model_version: 'claude-sonnet-4-6',
        })
      } catch (flagErr) {
        const msg = flagErr instanceof Error ? flagErr.message : String(flagErr)
        console.error('[letters/compose] failed to record safety flag', { entry_id: entry.id, error: msg })
      }
    }

    console.log('[letters/compose] composed', {
      entry_id: entry.id,
      mode_requested: requestedMode,
      mode_used: actualMode,
      fallback: fallbackReason !== null,
      flagged: safetyCategory !== null,
    })

    return NextResponse.json(
      {
        entry: rowToLetter(updated as JournalEntryRow),
        compose_mode_used: actualMode,
        fallback: fallbackReason !== null,
        ...(fallbackReason ? { fallback_reason: fallbackReason } : {}),
      },
      { headers: SECURITY_HEADERS }
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[letters/compose] Unexpected error:', msg)
    return NextResponse.json(
      { error: true, message: 'An unexpected error occurred. Your recording is safe.' },
      { status: 500, headers: SECURITY_HEADERS }
    )
  }
}

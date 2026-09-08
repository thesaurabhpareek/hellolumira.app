/**
 * @module letters/compose-letter
 * @description Composition of a LETTER from one or more LOGS (docs/LETTERS-MODEL-CHANGE.md).
 *
 *   The model change: the nightly unit is a `log`, always saved, low ceremony. A
 *   `letter` is an opt-in artifact assembled from one or more of those logs, addressed
 *   to the child, and it cites `source_entry_ids`. This module is the composition half
 *   of that: which logs go in, what the model is asked, and what may come out.
 *
 *   Four pure responsibilities and no others:
 *     1. selectSourceLogs    - which logs a span covers. Deterministic, no clock.
 *     2. buildLetterRequest  - the Messages API body, reusing compose-shaped's prompt.
 *     3. parseLetterResponse - strip [[LUMIRA_FLAG: ...]], then cap length.
 *     4. composeLetter       - thin orchestration over an INJECTED client.
 *
 *   No client is constructed here and no client exists at module scope. The route
 *   (BE10) owns the network, retries, rate limiting and persistence.
 *
 *   TWO CONSTRAINTS DRIVE EVERY DECISION BELOW.
 *
 *   (a) A LETTER MAY CONTAIN ONLY MATERIAL PRESENT IN ITS SOURCE LOGS. Multi-source
 *       composition is precisely where a model invents connective tissue: a causal
 *       link between Tuesday and Friday, a narrative arc, an emotional resolution
 *       nobody wrote down. That invention is indistinguishable from memory to a
 *       reader at eighteen, which makes it the most damaging failure this product
 *       has. It is forbidden in the prompt extension below and it is why the source
 *       ids are returned: the reading view shows what the letter was built from so
 *       the claim is auditable.
 *
 *   (b) LENGTH IS CAPPED HARD. PRD 17.5: few-shot voice imitation holds at roughly
 *       200-300 words and drifts toward the model's mean beyond that. Seven logs
 *       supply far more material than one thin night - that is the point of the
 *       model change, it fixes the sparse-transcript padding problem - but more
 *       material must buy density, not length. The ceiling does not move.
 *
 *   This module logs nothing. Never log transcript text or entry bodies (contract 1.5).
 */

import type { Anthropic } from '@anthropic-ai/sdk'
import type {
  JournalEntryRow,
  LetterCompositionInput,
  LetterSpan,
  SafetyCategory,
  VoiceProfile,
} from '@/types/letters'
import {
  COMPOSE_MAX_TOKENS,
  COMPOSE_MODEL,
  COMPOSE_TEMPERATURE,
  COMPOSE_TIMEOUT_MS,
  COMPOSITION_SYSTEM_PROMPT,
  DEFAULT_PREFILL,
  parseComposeResponse,
  renderVoiceProfileBlock,
  type ComposeClient,
  type ComposeRequest,
  type ComposeResult,
} from '@/lib/letters/compose-shaped'
import { splitSentences } from '@/lib/letters/deslop'

/** PRD 17.5. Voice holds here and drifts badly past it. Do not raise. */
export const LETTER_MAX_WORDS = 300
/** Multi-source letters have the material to reach this. Single-source may not. */
export const LETTER_TARGET_MIN_WORDS = 200
/** Days either side of the anchor that a 'milestone' letter draws on. */
export const MILESTONE_WINDOW_DAYS = 3
/**
 * Upper bound on sources in one request. A 'month' cannot exceed 31 (one log per
 * baby per day, DB-enforced); 'custom' has no such bound. When the pool is larger
 * the most recent are kept, and only the kept ids are cited - citations always
 * describe what the model actually saw.
 */
export const MAX_SOURCE_LOGS = 40

/** Raised when a span resolves to nothing. A letter with zero sources violates the DB check. */
export class NoSourceLogsError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NoSourceLogsError'
  }
}

export type LetterComposeResult = ComposeResult & {
  /** The logs this letter was built from, in the order shown to the model. */
  sourceEntryIds: string[]
  span: LetterSpan
  wordCount: number
}

type SourceLog = LetterCompositionInput['sources'][number]

/**
 * The multi-source framing. This EXTENDS the PRD 17.4 prompt rather than replacing
 * it; every hard rule there still binds (no em dash, sentence-length variance, no
 * summarizing final paragraph, no sentimental closer, never invent a detail).
 * Static, so it carries its own cache breakpoint.
 */
export const LETTER_COMPOSITION_EXTENSION = `ADDITIONAL RULES FOR THIS REQUEST. A LETTER, NOT A NIGHTLY ENTRY.

Everything above still applies without exception. What follows narrows it.

He is not speaking tonight. What you are given is one or more journal logs he already
wrote, each dated. You are setting them down as one letter to his child.

WHAT YOU PRODUCE
One letter, ${LETTER_TARGET_MIN_WORDS} to ${LETTER_MAX_WORDS} words, addressed directly to the child in second
person, as "you". Plain text. No title, no date line, no salutation, no sign-off unless
his logs carry one. If the logs are thin, write less. Never write more than ${LETTER_MAX_WORDS} words.

WHAT YOU MAY USE
Only what is in the logs. Every detail, name, place, object, action, and feeling must
appear in a log. The logs are also the only style reference you have: they are his own
sentences, so imitate them.

WHAT YOU MUST NOT DO WITH MULTIPLE LOGS
1. Do not invent connective tissue. If Tuesday and Friday are unrelated, leave them
   unrelated. Do not write a bridge sentence to make them flow.
2. Do not build an arc. No setup, no turn, no resolution. These are days, not a story.
3. Do not assert cause. Never write that one day led to another, taught him something,
   or changed anything, unless a log says so in those terms.
4. Do not generalize across the logs. No "all week", "every night", "she kept",
   "more and more", or any claim of a pattern he did not state.
5. Do not fill a gap. Days with no log did not happen for the purposes of this letter.
6. Do not resolve the letter. If the last log ends unsettled, the letter ends unsettled.
7. Do not average his moods into one tone. A funny day next to a frightened one stays
   two things.
8. Where the logs disagree or repeat, keep it. Contradiction is truer than a tidy merge.

You may place material in the order the dates give you, and you may leave a log out if
including it would only pad. Leaving something out is always safer than adding.
`

function isNonEmpty(text: string | null | undefined): text is string {
  return typeof text === 'string' && text.trim().length > 0
}

/** The parent's kept text. `body` is post-edit and approved; the transcript is the fallback. */
function textOf(source: SourceLog): string {
  if (isNonEmpty(source.body)) return source.body.trim()
  if (isNonEmpty(source.raw_transcript)) return source.raw_transcript.trim()
  return ''
}

function countWords(text: string): number {
  const trimmed = text.trim()
  return trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length
}

/** YYYY-MM-DD to a UTC timestamp. Null on anything malformed. No local timezone anywhere. */
function toUtcMs(date: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec((date ?? '').trim())
  if (!m) return null
  const y = Number(m[1])
  const mo = Number(m[2])
  const d = Number(m[3])
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null
  const ms = Date.UTC(y, mo - 1, d)
  const back = new Date(ms)
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== mo - 1 || back.getUTCDate() !== d) {
    return null
  }
  return ms
}

function toIsoDate(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10)
}

const DAY_MS = 86_400_000

/** ISO-8601 week: Monday through Sunday, inclusive. Both bounds are YYYY-MM-DD. */
export function isoWeekRange(anchorDate: string): { from: string; to: string } | null {
  const ms = toUtcMs(anchorDate)
  if (ms === null) return null
  const dow = new Date(ms).getUTCDay() // 0 Sun .. 6 Sat
  const backToMonday = dow === 0 ? 6 : dow - 1
  const start = ms - backToMonday * DAY_MS
  return { from: toIsoDate(start), to: toIsoDate(start + 6 * DAY_MS) }
}

/** Calendar month containing the anchor, inclusive of both bounds. */
export function calendarMonthRange(anchorDate: string): { from: string; to: string } | null {
  const ms = toUtcMs(anchorDate)
  if (ms === null) return null
  const d = new Date(ms)
  const first = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)
  const last = Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)
  return { from: toIsoDate(first), to: toIsoDate(last) }
}

function milestoneRange(anchorDate: string): { from: string; to: string } | null {
  const ms = toUtcMs(anchorDate)
  if (ms === null) return null
  return {
    from: toIsoDate(ms - MILESTONE_WINDOW_DAYS * DAY_MS),
    to: toIsoDate(ms + MILESTONE_WINDOW_DAYS * DAY_MS),
  }
}

/** Chronological, then id, so the same inputs always produce the same letter. */
function byDateThenId(a: JournalEntryRow, b: JournalEntryRow): number {
  return a.entry_date.localeCompare(b.entry_date) || a.id.localeCompare(b.id)
}

/** Closest to the anchor; on a tie the earlier date wins, then the lower id. */
function nearestTo(pool: JournalEntryRow[], anchorMs: number): JournalEntryRow {
  let best = pool[0]
  let bestDist = Number.POSITIVE_INFINITY
  for (const row of pool) {
    const ms = toUtcMs(row.entry_date)
    const dist = ms === null ? Number.POSITIVE_INFINITY : Math.abs(ms - anchorMs)
    if (dist < bestDist || (dist === bestDist && byDateThenId(row, best) < 0)) {
      best = row
      bestDist = dist
    }
  }
  return best
}

/**
 * Which logs a span covers. Pure: no clock, no randomness, no I/O - the anchor is
 * injected. Only `entry_kind === 'log'` rows are eligible; a letter is never composed
 * from another letter or from the pre-existing ai_summary rows.
 *
 * NEVER RETURNS ZERO. `journal_entries` requires at least one id in `source_entry_ids`
 * on a letter, so an empty result would produce an insert that fails at the database
 * or, worse, a letter with no provenance. When a window is empty but logs exist, the
 * nearest single log is used instead. When no eligible log exists at all there is
 * nothing honest to compose from, so this throws NoSourceLogsError rather than
 * inventing a source.
 */
export function selectSourceLogs(
  logs: JournalEntryRow[],
  span: LetterSpan,
  anchorDate: string,
): JournalEntryRow[] {
  const pool = (logs ?? [])
    .filter((row) => row && row.entry_kind === 'log' && toUtcMs(row.entry_date) !== null)
    .slice()
    .sort(byDateThenId)

  if (pool.length === 0) {
    throw new NoSourceLogsError(
      `selectSourceLogs: no eligible logs for span "${span}". A letter must cite at least one source.`,
    )
  }

  const anchorMs = toUtcMs(anchorDate)
  // 'custom' is caller-scoped: the range lives in the UI, so the pool is taken as given.
  const range =
    span === 'week' ? isoWeekRange(anchorDate)
    : span === 'month' ? calendarMonthRange(anchorDate)
    : span === 'milestone' ? milestoneRange(anchorDate)
    : null

  if (span === 'single') {
    if (anchorMs === null) return [pool[pool.length - 1]]
    const exact = pool.filter((row) => row.entry_date === anchorDate)
    if (exact.length > 0) return [exact[0]]
    return [nearestTo(pool, anchorMs)]
  }

  if (span === 'custom') {
    return pool.length > MAX_SOURCE_LOGS ? pool.slice(-MAX_SOURCE_LOGS) : pool
  }
  // A windowed span with an unusable anchor has no window. The most recent log is the
  // only defensible source; guessing a range would silently letter the wrong week.
  if (range === null) return [pool[pool.length - 1]]

  const windowed = pool.filter(
    (row) => row.entry_date >= range.from && row.entry_date <= range.to,
  )
  // Empty window (a week he did not write in) still has to yield a real source.
  if (windowed.length === 0) {
    return anchorMs === null ? [pool[pool.length - 1]] : [nearestTo(pool, anchorMs)]
  }
  return windowed.length > MAX_SOURCE_LOGS ? windowed.slice(-MAX_SOURCE_LOGS) : windowed
}

/** Sources with usable text, in order, bounded. These and only these are cited. */
export function usableSources(sources: SourceLog[]): SourceLog[] {
  const usable = (sources ?? []).filter((s) => s && textOf(s).length > 0)
  return usable.length > MAX_SOURCE_LOGS ? usable.slice(-MAX_SOURCE_LOGS) : usable
}

function spanFraming(span: LetterSpan, count: number, from: string, to: string): string {
  const range = from === to ? `on ${from}` : `between ${from} and ${to}`
  switch (span) {
    case 'single':
      return `This letter is built from one log, written ${from}.`
    case 'week':
      return `This letter is built from ${count} logs he wrote in one week, ${range}. Days he did not write are absent, not empty.`
    case 'month':
      return `This letter is built from ${count} logs he wrote in one month, ${range}. Days he did not write are absent, not empty.`
    case 'milestone':
      return `This letter is built from ${count} logs written around one milestone, ${range}.`
    default:
      return `This letter is built from ${count} logs he selected himself, ${range}.`
  }
}

/** The user turn: what the letter is, the child's facts, then the logs verbatim. */
export function renderLetterUserTurn(input: LetterCompositionInput): string {
  const sources = usableSources(input.sources)
  if (sources.length === 0) {
    throw new NoSourceLogsError('renderLetterUserTurn: every source log is empty.')
  }
  const dates = sources.map((s) => s.entry_date).sort()
  const facts = [
    'THIS LETTER',
    spanFraming(input.span, sources.length, dates[0], dates[dates.length - 1]),
    input.babyName ? `Her name: ${input.babyName}` : null,
    input.ageInMonths !== null && input.ageInMonths !== undefined
      ? `Her age in months across these logs: ${input.ageInMonths}`
      : null,
  ]
    .filter((line): line is string => line !== null)
    .join('\n')

  const blocks = sources.map((s, i) => `LOG ${i + 1} of ${sources.length}, ${s.entry_date}\n${textOf(s)}`)

  return [
    facts,
    'HIS LOGS, VERBATIM. Use nothing that is not here.',
    ...blocks,
  ].join('\n\n')
}

/**
 * Assembles the Messages API call. Pure: no clock, no randomness, no I/O.
 *
 * Block order is load bearing. The PRD 17.4 preamble is first and unchanged, so it
 * shares a cached prefix with the nightly shaped path; the letter extension is second
 * and carries its own breakpoint because it is static too. The voice profile follows
 * both, since it changes as the profile learns and must not invalidate either cache.
 * The source logs live in the user turn, never in the system blocks.
 */
export function buildLetterRequest(input: LetterCompositionInput): ComposeRequest {
  const system: Anthropic.TextBlockParam[] = [
    { type: 'text', text: COMPOSITION_SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } },
    { type: 'text', text: LETTER_COMPOSITION_EXTENSION, cache_control: { type: 'ephemeral' } },
  ]
  const vp: VoiceProfile | null = input.voiceProfile ?? null
  if (vp) system.push({ type: 'text', text: renderVoiceProfileBlock(vp) })

  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: renderLetterUserTurn(input) },
  ]
  // Prefilling the assistant turn structurally prevents a "Here is the letter:" preamble
  // and forces the second-person address the letter is required to open in.
  const prefill = DEFAULT_PREFILL.replace(/\s+$/, '')
  if (prefill.length > 0) messages.push({ role: 'assistant', content: prefill })

  return {
    model: COMPOSE_MODEL,
    max_tokens: COMPOSE_MAX_TOKENS,
    temperature: COMPOSE_TEMPERATURE,
    system,
    messages,
  }
}

/**
 * Hard length ceiling (PRD 17.5), applied after generation because a prompt ceiling is
 * probabilistic and this one is not. Truncation lands on a sentence boundary: a letter
 * cut mid-clause reads as a bug, and a run-on first sentence longer than the cap is
 * kept whole rather than mangled.
 */
export function enforceLetterLength(body: string, maxWords: number = LETTER_MAX_WORDS): string {
  const text = (body ?? '').trim()
  if (text.length === 0 || countWords(text) <= maxWords) return text

  const kept: string[] = []
  let total = 0
  for (const sentence of splitSentences(text)) {
    const n = countWords(sentence)
    if (kept.length > 0 && total + n > maxWords) break
    kept.push(sentence)
    total += n
    if (total >= maxWords) break
  }
  return kept.length > 0 ? kept.join(' ').trim() : text
}

/**
 * Splits the model output into the storable body and the escalation flag, then caps
 * length. Flag stripping is delegated to compose-shaped's parser on purpose: there is
 * exactly one implementation of that contract in the codebase, and a second one would
 * drift. The returned body is the ONLY value that may be written to journal_entries
 * or rendered. [[LUMIRA_FLAG: ...]] must never reach a letter a child reads.
 */
export function parseLetterResponse(
  raw: string,
  maxWords: number = LETTER_MAX_WORDS,
): { body: string; flag: SafetyCategory | null } {
  const parsed = parseComposeResponse(typeof raw === 'string' ? raw : '')
  return { body: enforceLetterLength(parsed.body, maxWords), flag: parsed.flag }
}

function prefillOf(request: ComposeRequest): string {
  const last = request.messages[request.messages.length - 1]
  if (!last || last.role !== 'assistant') return ''
  return typeof last.content === 'string' ? last.content : ''
}

/**
 * Thin orchestration over an injected client. The route (BE10) owns retries, rate
 * limiting, persistence and the safety_flags write; this calls, parses, and hands back
 * values including the source ids the reading view cites ("built from 7 entries").
 * Throws on an unusable response - the route catches and returns a typed error.
 */
export async function composeLetter(
  client: ComposeClient,
  input: LetterCompositionInput,
  options: { signal?: AbortSignal } = {},
): Promise<LetterComposeResult> {
  const sources = usableSources(input.sources)
  if (sources.length === 0) {
    throw new NoSourceLogsError('composeLetter: a letter must be composed from at least one log.')
  }
  const request = buildLetterRequest(input)
  const controller = options.signal ? null : new AbortController()
  const timer = controller ? setTimeout(() => controller.abort(), COMPOSE_TIMEOUT_MS) : null

  let response: Anthropic.Message
  try {
    response = await client.messages.create(request, {
      signal: options.signal ?? controller?.signal,
    })
  } finally {
    if (timer) clearTimeout(timer)
  }

  if (response.stop_reason === 'refusal') {
    throw new Error('Claude refused to compose this letter')
  }
  const text = (response.content ?? []).map((b) => (b.type === 'text' ? b.text : '')).join('')
  if (text.trim().length === 0) {
    throw new Error('Empty response from Claude API - no text content returned')
  }

  const parsed = parseLetterResponse(prefillOf(request) + text)
  const usage = response.usage
  return {
    body: parsed.body,
    flag: parsed.flag,
    stopReason: response.stop_reason ?? null,
    usage: usage
      ? {
          input_tokens: usage.input_tokens,
          output_tokens: usage.output_tokens,
          cache_read_input_tokens: usage.cache_read_input_tokens ?? null,
          cache_creation_input_tokens: usage.cache_creation_input_tokens ?? null,
        }
      : null,
    sourceEntryIds: sources.map((s) => s.id),
    span: input.span,
    wordCount: countWords(parsed.body),
  }
}

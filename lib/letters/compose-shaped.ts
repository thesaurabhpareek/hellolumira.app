/**
 * @module letters/compose-shaped
 * @description "Shape it for me" composition (PRD 17.4). Opt-in only: this path is
 *   gated by the `shaped_compose` sub-flag, which defaults OFF pending PRD 0.3-A.
 *   Callers must pass `isSubFlagEnabled('shaped_compose', ctx)` before reaching here.
 *
 *   Three pure responsibilities and no others:
 *     1. buildComposeRequest  - assemble the Messages API body (cached preamble first)
 *     2. selectExemplars      - PRD 17.3 few-shot selection, fully deterministic
 *     3. parseComposeResponse - strip [[LUMIRA_FLAG: ...]] before anything is stored
 *
 *   The network call lives in the API route (BE10). `composeShaped` takes an injected
 *   client so nothing here constructs an SDK client or reads process.env.
 *
 *   THE FLAG MUST NEVER REACH THE JOURNAL BODY. A letter a child reads at eighteen
 *   containing a machine escalation token is a serious defect, so the stripping below
 *   is deliberately paranoid: any line carrying the marker in any shape - well formed,
 *   unclosed, lower case, hyphenated, repeated - is dropped whole.
 *
 *   This module logs nothing. Never log transcript text or entry bodies (contract 1.5).
 */

import type { Anthropic } from '@anthropic-ai/sdk'
import type {
  FollowUp,
  LetterPromptContext,
  SafetyCategory,
  VoiceProfile,
} from '@/types/letters'

/** Sonnet, per PRD 21.3 model routing. Same id lib/claude.ts already uses. */
export const COMPOSE_MODEL = 'claude-sonnet-4-6'
/** 300-word ceiling (PRD 17.4) plus headroom for the flag line. */
export const COMPOSE_MAX_TOKENS = 1024
/** PRD 17.4: prose variance. Do not lower without a founder decision. */
export const COMPOSE_TEMPERATURE = 1.0
export const COMPOSE_TIMEOUT_MS = 30_000
/** PRD 17.3: exactly three exemplars. */
export const EXEMPLAR_COUNT = 3
/** What counts as a "high scorer" for the most-recent slot. */
export const HIGH_AUTHENTICITY_THRESHOLD = 0.7
/** PRD 17.5: under this, ask for one more detail rather than compose. */
export const MIN_TRANSCRIPT_WORDS = 60
/**
 * PRD 17.4 says "prefill the assistant turn with the entry's first character".
 * The first character is not knowable before generation, so the caller may supply
 * one; the default is a second-person opener, which the prompt already mandates.
 * Whatever is used is prepended back verbatim before parsing. See the final report.
 */
export const DEFAULT_PREFILL = 'You'

/**
 * PRD 17.4, verbatim. Do not edit, reflow, or "improve" this string. It is the
 * static preamble and the only block that carries cache_control.
 */
export const COMPOSITION_SYSTEM_PROMPT = `You are helping a father write tonight's entry in a journal his daughter will read when
she is eighteen. You are not the author. He is. You are taking what he said out loud and
setting it down the way he would have written it if he had the patience to type.

INPUT
- A raw transcript of him speaking tonight. It is unstructured, repetitive, and contains
  false starts. That is normal.
- His voice profile.
- Two or three entries he has written or approved before. Imitate these above all else.
- Basic facts about the child tonight.

WHAT YOU PRODUCE
One entry, 120 to 300 words, addressed directly to the child in second person. Plain
text. No title, no headings, no sign-off unless his examples have one.

HARD RULES
1. Use only what is in the transcript. Never invent a detail, a quote, a gesture, or a
   feeling he did not express. If the transcript is thin, the entry is short. A short
   true entry is the goal; a padded one is a failure.
2. Every proper noun and endearment comes from the voice profile or the transcript.
   Never substitute a generic pet name.
3. Preserve his non-English words exactly as spoken. Do not translate, italicize, gloss.
4. Punctuation: only . , ? ! : ; ' " ( ) and the hyphen. Never an em dash, en dash,
   curly quote, or ellipsis character. Write "..." as three periods.
5. Sentence lengths must vary hard. At least one under six words. At least one over
   twenty-five. Never three sentences of similar length in a row.
6. At most one "not X, but Y" in the whole entry, and only if he said both halves.
   Never "it's not just X, it's Y."
7. At most one three-item list. The final sentence must not be a three-beat rhythm.
8. Do not summarize at the end. Do not restate the entry in more abstract language. End
   on something concrete he actually said, or on a direct address to her. The final
   fifteen words must not contain: love, joy, journey, moment, grateful, blessed.
9. At most one sentence assigning meaning to the day, attributed to him ("I keep
   thinking", "I don't know why"), never asserted as truth.
10. Never: delve, tapestry, testament, navigate, resonate, beacon, realm, myriad,
    embark, unwavering, chapter, whirlwind, firstly, moreover, ultimately.
11. Match his profanity ceiling exactly.
12. Do not be more articulate than he is. If he trails off, let the sentence be plain.
    Fragments are allowed and welcome.

WHAT NEVER APPEARS IN AN ENTRY
Medical interpretation, developmental assessment, reassurance about whether something is
normal, comparison to milestones, or advice. This is a journal, not a consultation. If
the transcript contains a medical worry, record only what he said he felt and observed,
in his words, and stop there.

SAFETY ESCALATION
If the transcript contains any of the following, still write the entry, but omit the
material entirely and return the flag on its own final line, exactly:
[[LUMIRA_FLAG: <infant_safety | self_harm | harm_to_child | domestic_violence |
severe_maternal_distress>]]
Triggers: statements suggesting the child was or may be harmed; the parent describing
wanting to hurt himself, the child, or another person; violence in the home;
hopelessness, not wanting to be here, or being unable to keep the child safe.
Never quote this material back. Never counsel, diagnose, or reassure in the entry.
Ambiguity resolves toward flagging. A flag is cheap; a miss is not.
`

/** Emotional valence, classified cheaply at ingest (PRD 17.3). */
export type Valence = 'tender' | 'funny' | 'exhausted' | 'worried'

/**
 * A past entry (or onboarding sample) eligible to be imitated.
 * `authenticity_score` = 1 - normalized_levenshtein(composed_body, edited_body).
 */
export type ExemplarCandidate = {
  entry_id: string
  /** The final, post-edit text the parent kept. Never the pre-edit draft. */
  text: string
  /** 0..1. Higher means the parent changed less of what was composed. */
  authenticity_score: number
  entry_date: string // YYYY-MM-DD
  valence: Valence | null
  /** Cold start draws on the onboarding interview rather than real entries. */
  source: 'entry' | 'onboarding'
}

/** Everything composition is allowed to see. Nothing here may be fabricated. */
export type ShapedInput = {
  /** Name-corrected transcript. Already through lib/letters/names.ts. */
  transcript: string
  entryDate: string // YYYY-MM-DD
  voiceProfile: VoiceProfile
  /** Already narrowed by selectExemplars. At most EXEMPLAR_COUNT. */
  exemplars: ExemplarCandidate[]
  context: LetterPromptContext
  followups?: FollowUp[]
  /** Overrides DEFAULT_PREFILL. Trailing whitespace is stripped (API requirement). */
  prefill?: string
}

/** The Messages API body. Structurally a valid non-streaming create() param. */
export type ComposeRequest = Omit<
  Anthropic.MessageCreateParamsNonStreaming,
  'system' | 'messages'
> & {
  system: Anthropic.TextBlockParam[]
  messages: Anthropic.MessageParam[]
}

/** The narrowest client surface this module needs. Injected, never constructed here. */
export type ComposeClient = {
  messages: {
    create(
      body: Anthropic.MessageCreateParamsNonStreaming,
      options?: { signal?: AbortSignal },
    ): Promise<Anthropic.Message>
  }
}

export type ComposeResult = {
  /** Flag-stripped. This is the only value that may be stored or rendered. */
  body: string
  /** Routed to safety_flags and the escalation UI. Never rendered. */
  flag: SafetyCategory | null
  stopReason: Anthropic.StopReason | null
  usage: {
    input_tokens: number
    output_tokens: number
    cache_read_input_tokens: number | null
    cache_creation_input_tokens: number | null
  } | null
}

/** PRD 17.5: sparse transcripts make the model pad, and padding is where slop enters. */
export function isTranscriptTooThin(transcript: string): boolean {
  return countWords(transcript) < MIN_TRANSCRIPT_WORDS
}

function countWords(text: string): number {
  const trimmed = text.trim()
  return trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length
}

function labelled(label: string, value: string | number | null | undefined): string | null {
  if (value === null || value === undefined) return null
  const s = String(value).trim()
  return s.length > 0 ? `${label}: ${s}` : null
}

function compact(parts: Array<string | null>): string {
  return parts.filter((p): p is string => p !== null && p.length > 0).join('\n')
}

/** Volatile block. Goes AFTER the cached preamble so it never invalidates the cache. */
export function renderVoiceProfileBlock(vp: VoiceProfile): string {
  return compact([
    `HIS VOICE PROFILE (version ${vp.version})`,
    labelled('Endearments he uses for her', (vp.endearments ?? []).join(', ')),
    labelled('What he calls her mother when talking to her', vp.partner_name_for_child),
    labelled('What he calls himself when talking to her', vp.self_name_for_child),
    labelled('Mean sentence length in words', vp.mean_sentence_len),
    labelled('Sentence length standard deviation', vp.sentence_len_stdev),
    labelled('Contraction rate, 0 to 1', vp.contraction_rate),
    labelled('Question rate, 0 to 1', vp.question_rate),
    labelled('Formality, 1 very casual to 5 very formal', vp.formality),
    labelled('Humor', vp.humor_mode),
    labelled('Profanity ceiling, 0 none 1 mild 2 unrestricted', vp.profanity_ceiling),
    labelled(
      'Words from home. Preserve exactly. Do not translate, italicize, or gloss',
      (vp.code_switch_terms ?? []).map((t) => `${t.term} (${t.gloss})`).join(', '),
    ),
    labelled('Register notes', vp.register_notes),
    labelled('Words he has deleted from past entries. Never use them', (vp.banned_words ?? []).join(', ')),
    labelled('Words he reaches for. Prefer them', (vp.preferred_words ?? []).join(', ')),
  ])
}

/** Volatile block. Full verbatim entries, never summarized style notes (PRD 17.3). */
export function renderExemplarsBlock(exemplars: ExemplarCandidate[]): string {
  const usable = exemplars.filter((e) => e.text.trim().length > 0)
  if (usable.length === 0) {
    return [
      'ENTRIES HE HAS WRITTEN BEFORE',
      'None yet. This is one of his first. Follow the voice profile and the transcript',
      'only. A short entry is correct here. Do not fill space.',
    ].join('\n')
  }
  const blocks = usable.map((e, i) => {
    const origin =
      e.source === 'onboarding'
        ? 'spoken in his onboarding interview, not written'
        : `written ${e.entry_date}`
    const valence = e.valence ? `, ${e.valence}` : ''
    return `EXAMPLE ${i + 1} (${origin}${valence})\n${e.text.trim()}`
  })
  return [
    'ENTRIES HE HAS WRITTEN OR APPROVED BEFORE. Imitate these above all else.',
    ...blocks,
  ].join('\n\n')
}

/** The user turn: tonight's facts, the transcript, and any answered follow-ups. */
export function renderUserTurn(input: ShapedInput): string {
  const c = input.context
  const facts = compact([
    'TONIGHT',
    labelled('Date', input.entryDate),
    labelled('Her name', c.babyName),
    labelled('Her age in months', c.ageInMonths),
    labelled('Her age in weeks', c.ageInWeeks),
    labelled(
      'Logged today',
      (c.todaysMilestones ?? []).map((m) => (m.note ? `${m.type}: ${m.note}` : m.type)).join('; '),
    ),
    labelled('Hours he slept', c.todaysCheckin?.sleep_hours ?? null),
    labelled('His mood at check-in', c.todaysCheckin?.mood ?? null),
    labelled('Days since his last entry', c.daysSinceLastEntry),
  ])
  const answered = (input.followups ?? []).filter(
    (f) => !f.skipped && f.answer !== null && f.answer.trim().length > 0,
  )
  const sections = [facts, `WHAT HE SAID TONIGHT\n${input.transcript.trim()}`]
  if (answered.length > 0) {
    sections.push(
      'FOLLOW-UP QUESTIONS HE ANSWERED\n' +
        answered.map((f) => `Q: ${f.question}\nA: ${(f.answer ?? '').trim()}`).join('\n\n'),
    )
  }
  return sections.join('\n\n')
}

/**
 * Assembles the Messages API call. Pure: no clock, no randomness, no I/O.
 * Block order is load bearing - the static preamble is first and is the only
 * cache_control breakpoint, so the volatile voice profile and exemplars that
 * follow it can change nightly without invalidating the cached prefix.
 */
export function buildComposeRequest(input: ShapedInput): ComposeRequest {
  const prefill = (input.prefill ?? DEFAULT_PREFILL).replace(/\s+$/, '')
  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: renderUserTurn(input) },
  ]
  // Prefilling the assistant turn structurally prevents "Here is the entry:" preamble.
  if (prefill.length > 0) messages.push({ role: 'assistant', content: prefill })
  return {
    model: COMPOSE_MODEL,
    max_tokens: COMPOSE_MAX_TOKENS,
    temperature: COMPOSE_TEMPERATURE,
    system: [
      {
        type: 'text',
        text: COMPOSITION_SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
      { type: 'text', text: renderVoiceProfileBlock(input.voiceProfile) },
      { type: 'text', text: renderExemplarsBlock(input.exemplars) },
    ],
    messages,
  }
}

function compareByScore(a: ExemplarCandidate, b: ExemplarCandidate): number {
  return (
    b.authenticity_score - a.authenticity_score ||
    b.entry_date.localeCompare(a.entry_date) ||
    a.entry_id.localeCompare(b.entry_id)
  )
}

function compareByRecency(a: ExemplarCandidate, b: ExemplarCandidate): number {
  return (
    b.entry_date.localeCompare(a.entry_date) ||
    b.authenticity_score - a.authenticity_score ||
    a.entry_id.localeCompare(b.entry_id)
  )
}

/**
 * PRD 17.3. Picks exactly three, in this order:
 *   1. highest authenticity score overall
 *   2. the most recent high scorer
 *   3. the highest scorer whose valence matches tonight
 * Each slot falls back to the best remaining candidate rather than returning a
 * short list, so callers get three whenever three exist. Cold start (0, 1 or 2
 * candidates) returns what there is. Deterministic: ties break on date then id.
 */
export function selectExemplars(
  candidates: ExemplarCandidate[],
  todayValence: Valence,
): ExemplarCandidate[] {
  const pool = candidates.filter((c) => typeof c.text === 'string' && c.text.trim().length > 0)
  const byScore = [...pool].sort(compareByScore)
  const highScorers = byScore.filter((c) => c.authenticity_score >= HIGH_AUTHENTICITY_THRESHOLD)
  const byRecency = [...(highScorers.length > 0 ? highScorers : byScore)].sort(compareByRecency)
  const byValence = byScore.filter((c) => c.valence === todayValence)

  const used = new Set<string>()
  const picked: ExemplarCandidate[] = []
  const take = (ordered: ExemplarCandidate[]): void => {
    const next = ordered.find((c) => !used.has(c.entry_id))
    if (next) {
      used.add(next.entry_id)
      picked.push(next)
    }
  }

  take(byScore)
  take([...byRecency, ...byScore])
  take([...byValence, ...byScore])
  return picked.slice(0, EXEMPLAR_COUNT)
}

/** Matches the marker however mangled: LUMIRA_FLAG, lumira flag, LUMIRA-FLAG. */
const FLAG_MARKER = /LUMIRA[\s_-]*FLAG/i
/** A well-formed [[...LUMIRA...]] token anywhere on a line. */
const FLAG_TOKEN = /\[\[[^\]\n]*LUMIRA[^\]\n]*\]\]/gi
/** Marker plus whatever category text follows, closing bracket or not. */
const FLAG_CAPTURE = /LUMIRA[\s_-]*FLAG\s*:?\s*([A-Za-z_ -]{0,64})/gi
/** A line left holding nothing but bracket or colon debris. */
const DEBRIS_ONLY = /^[\s[\]:|<>-]*$/

const KNOWN_CATEGORIES: ReadonlySet<string> = new Set<SafetyCategory>([
  'distress',
  'intrusive_thoughts',
  'bonding_difficulty',
  'self_harm',
  'harm_to_child',
  'infant_safety',
  'domestic_violence',
  'severe_maternal_distress',
])

function normalizeCategory(token: string | undefined): SafetyCategory | null {
  if (!token) return null
  const t = token
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
    .replace(/[^a-z_]/g, '')
    .replace(/^_+|_+$/g, '')
  return KNOWN_CATEGORIES.has(t) ? (t as SafetyCategory) : null
}

function extractFlag(raw: string): SafetyCategory | null {
  FLAG_CAPTURE.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = FLAG_CAPTURE.exec(raw)) !== null) {
    const category = normalizeCategory(match[1])
    if (category) return category
  }
  return null
}

/**
 * Splits the model output into the storable body and the escalation flag.
 *
 * The body returned here is the ONLY value allowed to be written to
 * journal_entries or rendered. Stripping is line-oriented and paranoid: a line
 * that still carries the marker after inline token removal is dropped whole,
 * because a partly-stripped escalation token is worse than a missing sentence.
 *
 * Returns the first recognisable category when several are present. An
 * unrecognised category still gets stripped from the body but yields null - the
 * deterministic server-side classifier (BE3) is the primary safety net, this is
 * the secondary one.
 */
export function parseComposeResponse(raw: string): { body: string; flag: SafetyCategory | null } {
  const input = typeof raw === 'string' ? raw : ''
  const flag = extractFlag(input)

  const kept: string[] = []
  for (const line of input.split(/\r?\n/)) {
    const hadMarker = FLAG_MARKER.test(line)
    const cleaned = line.replace(FLAG_TOKEN, '')
    if (FLAG_MARKER.test(cleaned)) continue
    if (hadMarker && DEBRIS_ONLY.test(cleaned)) continue
    kept.push(cleaned)
  }

  const body = kept.join('\n').replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n').trim()
  return { body, flag }
}

function prefillOf(request: ComposeRequest): string {
  const last = request.messages[request.messages.length - 1]
  if (!last || last.role !== 'assistant') return ''
  return typeof last.content === 'string' ? last.content : ''
}

/**
 * Thin orchestration over an injected client. The route (BE10) owns retries,
 * rate limiting, persistence and the safety_flags write; this only calls, parses
 * and hands back values. Throws on an unusable response - the route catches.
 */
export async function composeShaped(
  client: ComposeClient,
  input: ShapedInput,
  options: { signal?: AbortSignal } = {},
): Promise<ComposeResult> {
  const request = buildComposeRequest(input)
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
    throw new Error('Claude refused to compose this entry')
  }
  const text = (response.content ?? []).map((b) => (b.type === 'text' ? b.text : '')).join('')
  if (text.trim().length === 0) {
    throw new Error('Empty response from Claude API - no text content returned')
  }

  const parsed = parseComposeResponse(prefillOf(request) + text)
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
  }
}

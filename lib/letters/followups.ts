/**
 * @module lib/letters/followups
 * @description Deterministic follow-up SLOT selection for a nightly Letters entry.
 *
 *   Architectural rule (PRD §14.3, §17; docs/LETTERS-ENGINEERING-CONTRACT.md):
 *   **Claude phrases the chosen slot. Claude does not choose the slot.** This
 *   module decides WHICH archetype (if any) applies, using plain string
 *   heuristics — no LLM call, no I/O, no randomness, no clock. Same inputs,
 *   same output. That is what makes it auditable, testable, and structurally
 *   incapable of asking a cheerful question about a sick baby.
 *
 *   Returns SLOTS (archetype + templateKey + sourceRef), never question text.
 *   Final wording is Claude's job (Haiku), constrained by the template CT2
 *   owns in lib/letters/prompts/followup-templates.ts.
 *
 * @see docs/Lumira-Letters-PRD.md §14.3 (follow-up archetypes)
 * @see docs/Lumira-Letters-PRD.md §17 (AI vs. structured logic boundaries)
 */

import type { FollowUpArchetype, LetterPromptContext, SafetyResult } from '@/types/letters'

/**
 * The one non-archetype slot: routes to the private layer instead of a
 * normal follow-up (PRD §14.3, §18.3). `archetype` widens the frozen
 * `FollowUpArchetype` union with this extra case — it does not redefine or
 * duplicate it, same pattern as `OpeningPrompt.sourceRef` in types/letters.ts.
 */
export type ContainingSlotArchetype = 'containing'

export type FollowUpSlot = {
  archetype: FollowUpArchetype | ContainingSlotArchetype
  /** Key into followup-templates.ts (CT2). NEVER final wording. */
  templateKey: string
  /** Source row for auditability (e.g. matched thread's entryId). Null if none. */
  sourceRef: string | null
}

/** Below this word count we do not badger an exhausted parent. */
const MIN_WORDS_FOR_FOLLOWUP = 25
/** Hard product rule: never more than two follow-ups in one night. */
const MAX_SLOTS = 2

const TEMPLATE_KEYS = {
  anchor: 'anchor.default',
  thread: 'thread.default',
  you: 'you.default',
  containing: 'containing.private_layer',
} as const

/**
 * Concrete sensory nouns a parent uses when describing a remembered detail
 * rather than summarizing an event in the abstract.
 *
 * HONESTY NOTE: closed English-only word list, not real NLP. Misses
 * synonyms, non-English/code-switched words (e.g. Hindi "chappal",
 * "katori" — a real gap for this user base), and metaphor ("she was a
 * little tornado" correctly won't count; "tornado costume" incorrectly
 * won't either). Does not verify the noun belongs to *tonight's* event
 * vs. a passing mention of yesterday. Good enough to force detail most
 * of the time; not a substitute for language understanding.
 */
const SENSORY_NOUN_WORDS = [
  'onesie', 'romper', 'pajama', 'pajamas', 'pyjama', 'pyjamas', 'sock', 'socks',
  'mitten', 'mittens', 'hat', 'bib', 'dress', 'shoe', 'shoes', 'blanket', 'swaddle',
  'jacket', 'sweater', 'diaper', 'nappy',
  'red', 'blue', 'green', 'yellow', 'pink', 'purple', 'orange', 'white', 'black', 'gray', 'grey', 'brown',
  'cheek', 'cheeks', 'toe', 'toes', 'finger', 'fingers', 'fist', 'fists', 'hair',
  'curl', 'curls', 'drool', 'tooth', 'teeth', 'gum', 'gums', 'fuzzy', 'soft', 'sticky', 'crumbs',
  'banana', 'yogurt', 'yoghurt', 'puree', 'milk', 'bottle', 'cracker', 'crackers',
  'avocado', 'apple', 'rice', 'cereal', 'spoon', 'bowl', 'sippy',
  'crib', 'stroller', 'pram', 'blocks', 'teddy', 'rattle', 'book', 'rug',
  'grass', 'sand', 'bath', 'tub', 'water', 'window', 'porch', 'car seat', 'swing',
  'giggle', 'giggled', 'squeal', 'squealed', 'babble', 'babbled', 'smell', 'smelled', 'song', 'lullaby',
  'sunlight', 'sunset', 'rain', 'breeze', 'moonlight',
] as const

/**
 * First-person affect vocabulary, combined with a first-person pronoun
 * elsewhere in the text (see hasFirstPersonAffect) as a cheap proxy for
 * "the parent said how THEY felt", not just what happened.
 *
 * HONESTY NOTE: pronoun-proximity is not checked, so "She felt proud of
 * me" false-positives. Accepted for MVP: the cost of a false positive is
 * one extra gentle question, not a safety issue. A false negative (real
 * affect phrased unusually, e.g. "ugh, today") is more likely and more
 * benign than the alternative of missing it silently.
 */
const AFFECT_WORDS = [
  'feel', 'feels', 'felt', 'feeling', 'love', 'loved', 'proud', 'scared', 'terrified',
  'worried', 'worry', 'worries', 'anxious', 'overwhelmed', 'exhausted', 'grateful',
  'gratitude', 'relieved', 'relief', 'heartbroken', 'joy', 'joyful', 'happy', 'sad',
  'nervous', 'hope', 'hopeful', 'hopeless', 'guilt', 'guilty', 'ashamed', 'tender',
  'tenderness', 'moved', 'teared', 'cried', 'tears', 'melt', 'melted', 'proudest',
] as const

const FIRST_PERSON_PRONOUNS = ['i', "i'm", "i've", "i'd", "i'll", 'my', 'me', 'myself'] as const

/**
 * Padded "nothing happened" phrases. Word count (MIN_WORDS_FOR_FOLLOWUP)
 * already catches most skipped nights; this is belt-and-suspenders for
 * filler padded past the floor. NOTE: CaptureMode ('not_much' in
 * types/letters.ts) is NOT a parameter of this function — see REQUEST
 * line in the final report.
 */
const NOT_MUCH_PHRASES = [
  'not much today', 'nothing much today', 'nothing much to report', 'nothing new today',
  'nothing to report', 'same as usual', 'same as always', 'no updates today',
  'uneventful day', 'uneventful today',
] as const

function normalize(text: string): string {
  return text.toLowerCase()
}

/** Whitespace-delimited word count. Simple, not locale-aware. */
function countWords(text: string): number {
  const trimmed = text.trim()
  return trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length
}

/** Whole-word regex for a lexicon term, allowing a trailing s/es. Multi-word terms match as a phrase. */
function wordBoundaryPattern(term: string): RegExp {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return term.includes(' ')
    ? new RegExp(`\\b${escaped}\\b`, 'i')
    : new RegExp(`\\b${escaped}(?:e?s)?\\b`, 'i')
}

/**
 * Exact whole-word match, no plural/suffix guessing. FIRST_PERSON_PRONOUNS
 * must use this, not wordBoundaryPattern: the bare pronoun "i" combined
 * with wordBoundaryPattern's `(?:e?s)?` suffix produces `\bi(?:e?s)?\b`,
 * which matches the extremely common word "is" (and "ies") as if it were
 * the pronoun "I". That false-positives hasFirstPersonAffect on almost any
 * transcript, silently suppressing the "you" archetype it exists to fire.
 * Pronouns are a closed set and never take a plural "s", so no suffix
 * matching is needed or safe here.
 */
function exactWordPattern(term: string): RegExp {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`\\b${escaped}\\b`, 'i')
}

/** True when the transcript contains at least one concrete sensory noun. See SENSORY_NOUN_WORDS note. */
function hasSensoryNoun(text: string): boolean {
  const normalized = normalize(text)
  return SENSORY_NOUN_WORDS.some((word) => wordBoundaryPattern(word).test(normalized))
}

/** True when a first-person pronoun AND an affect word both appear. See AFFECT_WORDS note. */
function hasFirstPersonAffect(text: string): boolean {
  const normalized = normalize(text)
  const hasPronoun = FIRST_PERSON_PRONOUNS.some((p) => exactWordPattern(p).test(normalized))
  return hasPronoun && AFFECT_WORDS.some((word) => wordBoundaryPattern(word).test(normalized))
}

function isNotMuchPhraseOnly(text: string): boolean {
  const normalized = normalize(text)
  return NOT_MUCH_PHRASES.some((phrase) => normalized.includes(phrase))
}

/**
 * Deterministic lookup for "thread". NEVER invents one — only ever returns
 * a row already in `openThreads`. Among candidates whose topic is NOT
 * already mentioned tonight (asking about something just described would
 * be redundant, not genuine continuity), picks the earliest `entryDate`
 * (most stale, most likely to feel forgotten; a stable tie-breaker
 * independent of array order).
 *
 * HONESTY NOTE: "already mentioned" is substring containment of a
 * thread's 4+-letter words against the transcript — crude, can miss a
 * real mention (different phrasing) or skip on a superficial word
 * overlap. Given the alternative is re-asking an answered question, we
 * bias toward skipping.
 */
function selectMatchingThread(
  transcript: string,
  openThreads: LetterPromptContext['openThreads']
): LetterPromptContext['openThreads'][number] | null {
  if (!openThreads || openThreads.length === 0) return null
  const normalizedTranscript = normalize(transcript)

  const candidates = openThreads.filter((thread) => {
    if (!thread || !thread.text || thread.text.trim().length === 0) return false
    const significantWords = normalize(thread.text).split(/\W+/).filter((w) => w.length >= 4)
    if (significantWords.length === 0) return true
    return !significantWords.some((w) => normalizedTranscript.includes(w))
  })
  if (candidates.length === 0) return null

  const sorted = [...candidates].sort((a, b) => {
    const dateA = new Date(a.entryDate).getTime()
    const dateB = new Date(b.entryDate).getTime()
    // Invalid dates sort last so a bad row can't win the tie-break.
    const safeA = Number.isNaN(dateA) ? Number.POSITIVE_INFINITY : dateA
    const safeB = Number.isNaN(dateB) ? Number.POSITIVE_INFINITY : dateB
    return safeA - safeB
  })
  return sorted[0] ?? null
}

/**
 * Selects at most two follow-up slots for tonight's entry, deterministically.
 *
 * 1. `safety.tier >= 1` overrides everything: return the single "containing"
 *    slot and stop — BEFORE the short-transcript check, because a short but
 *    distressing entry ("I don't know what's wrong") must still route to
 *    the private layer, not be silently dropped.
 * 2. Too little material (short transcript, or padded "nothing much") ->
 *    zero slots. Do not badger an exhausted parent.
 * 3. Otherwise evaluate the three archetypes, cap at two, priority
 *    thread > anchor > you. Thread first because continuity is the
 *    retention engine (PRD §14.3); anchor before you is a product judgment
 *    call (cheaper, lower-risk ask), not a PRD mandate — see REQUEST line.
 *
 * Pure: no I/O, no clock, no randomness.
 */
export function selectFollowUps(
  transcript: string,
  ctx: LetterPromptContext,
  safety: SafetyResult
): FollowUpSlot[] {
  const text = typeof transcript === 'string' ? transcript : ''

  if (safety && safety.tier >= 1) {
    return [{ archetype: 'containing', templateKey: TEMPLATE_KEYS.containing, sourceRef: null }]
  }

  if (countWords(text) < MIN_WORDS_FOR_FOLLOWUP) return []
  if (isNotMuchPhraseOnly(text)) return []

  const slots: FollowUpSlot[] = []

  const matchedThread = selectMatchingThread(text, ctx?.openThreads ?? [])
  if (matchedThread) {
    slots.push({ archetype: 'thread', templateKey: TEMPLATE_KEYS.thread, sourceRef: matchedThread.entryId })
  }
  if (!hasSensoryNoun(text)) {
    slots.push({ archetype: 'anchor', templateKey: TEMPLATE_KEYS.anchor, sourceRef: null })
  }
  if (!hasFirstPersonAffect(text)) {
    slots.push({ archetype: 'you', templateKey: TEMPLATE_KEYS.you, sourceRef: null })
  }

  return slots.slice(0, MAX_SLOTS)
}

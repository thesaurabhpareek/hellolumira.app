/**
 * @module EmotionalSignals
 * @description Keyword-based emotional state inference for parent messages.
 *   Uses pre-compiled RegExp patterns and Set-based lookups for O(1) single-word
 *   matching, falling back to phrase scanning only when necessary.
 * @version 1.0.0
 * @since March 2026
 */

/** Single-word keywords for each emotional tier (O(1) Set lookup). */
const TIRED_WORDS = new Set([
  'tired', 'exhausted', 'shattered', 'knackered', 'drained',
  'fatigued', 'bleary',
])

/** Multi-word phrases for the "tired" tier that require substring matching. */
const TIRED_PHRASES = [
  'worn out', 'running on empty', 'no sleep', 'barely slept',
  "didn't sleep", 'sleep deprived', 'dead on my feet', 'so tired',
  'really tired', "haven't slept", 'up all night', 'no rest', 'need sleep',
  'wiped out', 'running low', 'barely functioning',
]

const STRUGGLING_WORDS = new Set([
  'struggling', 'overwhelming', 'overwhelmed', 'burnout', 'anxious',
  'anxiety', 'panicking', 'failing', 'terrified', 'dread', 'dreading',
])

const STRUGGLING_PHRASES = [
  "can't cope", 'losing it', 'at my limit', 'breaking point',
  "can't do this", "don't know how", 'falling apart', 'burned out',
  'burnt out', 'too much', "can't keep up", 'barely managing', 'hard week', 'really hard',
  'not okay', 'not doing well', 'feeling low', 'so stressed', 'worried sick',
  "can't handle", 'feel like a failure', 'bad parent', 'so scared',
]

const DISTRESSED_WORDS = new Set([
  'depressed', 'depression', 'postpartum', 'postnatal',
  'suicidal', 'disappear',
])

const DISTRESSED_PHRASES = [
  "can't go on", "don't want to do this anymore", 'want to give up',
  'hate this', 'hate being a parent', 'hate my life', 'breaking down', 'having a breakdown',
  'fell apart', 'crying all day', "can't stop crying", 'hurting myself', 'hurt myself', 'not safe',
  "don't want to be here", "can't be here",
  'end it', 'no way out', "can't take this anymore", "wish i wasn't here",
]

/**
 * Pre-compiled RegExp cache for phrase boundary matching.
 * Built once at module load to avoid repeated RegExp construction per call.
 */
const PHRASE_REGEX_CACHE = new Map<string, RegExp>()

/** Returns a cached word-boundary RegExp for the given phrase. */
function getPhraseRegex(phrase: string): RegExp {
  let re = PHRASE_REGEX_CACHE.get(phrase)
  if (!re) {
    // Apostrophes are not regex metacharacters, no escaping needed
    re = new RegExp(`\\b${phrase}\\b`)
    PHRASE_REGEX_CACHE.set(phrase, re)
  }
  return re
}

/**
 * Checks if any single word from the Set appears in the tokenised input,
 * or if any multi-word phrase matches via pre-compiled regex.
 */
function matchesTier(
  words: string[],
  wordSet: Set<string>,
  phrases: string[],
  lower: string
): boolean {
  // O(1) check for each token against the Set — fast path for single-word matches
  for (const word of words) {
    if (wordSet.has(word)) return true
  }
  // Phrase matching only when single-word lookup misses
  for (const phrase of phrases) {
    if (getPhraseRegex(phrase).test(lower)) return true
  }
  return false
}

/**
 * Infers the parent's emotional state from free-text input.
 *
 * Priority order (highest severity wins): distressed > struggling > tired.
 * Returns null if no emotional signal is detected.
 *
 * @param text - The parent's raw message text.
 * @returns The detected emotional signal tier, or null if none detected.
 */
export function inferEmotionalSignal(
  text: string
): 'ok' | 'tired' | 'struggling' | 'distressed' | null {
  // Guard: null, undefined, or non-string input
  if (!text || typeof text !== 'string') return null
  // Guard: whitespace-only input
  const trimmed = text.trim()
  if (!trimmed) return null
  // Truncate before processing to avoid scanning huge strings
  const lower = trimmed.slice(0, 10000).toLowerCase()
  // Tokenise once for O(1) Set lookups (split on whitespace and common delimiters)
  const words = lower.split(/[\s,;.!?()\[\]{}<>\\/:"]+/).filter(Boolean)

  // Check tiers in severity order — distressed first for early exit on critical signals
  if (matchesTier(words, DISTRESSED_WORDS, DISTRESSED_PHRASES, lower)) return 'distressed'
  if (matchesTier(words, STRUGGLING_WORDS, STRUGGLING_PHRASES, lower)) return 'struggling'
  if (matchesTier(words, TIRED_WORDS, TIRED_PHRASES, lower)) return 'tired'
  return null
}

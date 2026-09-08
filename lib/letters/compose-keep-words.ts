/**
 * @module letters/compose-keep-words
 * @description "Keep the words" composition — the DEFAULT mode, near-zero AI, no
 *   LLM call, no network. This is the module the product's authenticity claim
 *   rests on: every sentence in the output must be one the parent actually said.
 *
 *   Per docs/LETTERS-MODEL-CHANGE.md this now primarily produces a LOG, not a
 *   letter. A log is allowed to be short, plain and unpolished — that is correct
 *   output, not a failure. This module never pads, never invents a transition,
 *   never adds a closing line. If the transcript is three words, the body is
 *   three words (capitalized, punctuated).
 *
 *   Pipeline, per paragraph (transcript paragraphs, then answered follow-ups,
 *   each their own paragraph, in ask order — never rendered as "Q: ... A: ..."):
 *     1. trim false starts / self-corrections (dash-marked)
 *     2. remove filler & disfluency (um, uh, "like"/"you know"/"I mean" as
 *        filler only, stammered word repeats)
 *     3. apply the voice profile's profanity ceiling
 *     4. fix capitalization and terminal punctuation, sentence by sentence
 *   The cleaned paragraphs are joined with a blank line and run through
 *   deslop() (lib/letters/deslop.ts, BE1's module — imported, never edited)
 *   for character/structural normalization and the audit trail.
 *
 *   HONESTY: every heuristic below is a lexical/structural approximation, not
 *   language understanding. Each function documents exactly what it catches
 *   and what it misses. Where a heuristic could go either way, this module
 *   always resolves toward UNDER-cleaning rather than over-cleaning: a
 *   leftover "um" is a cosmetic miss, but stripping a real word the parent
 *   said (a false positive) breaks the product's core promise. See the
 *   authenticity property test in the colocated spec for the invariant this
 *   is designed to uphold: no word appears in the output that was not in the
 *   transcript or an answered follow-up.
 */

import type { FollowUp, SlopReport, VoiceProfile } from '@/types/letters'
import { deslop, splitSentences } from './deslop'

/** Everything keep_words composition is allowed to see. Nothing here is fabricated. */
export type KeepWordsInput = {
  /** Tonight's transcript. Assumed already name-corrected (lib/letters/names.ts
   *  runs before this module, per the compose pipeline) — this module does not
   *  re-run name correction, only word-preserving cleanup. */
  transcript: string
  /** Answered follow-ups. Array order IS ask order — that order is preserved
   *  verbatim into the merged body. A skipped or empty-answer slot is ignored. */
  followups?: FollowUp[]
  /** Governs profanity handling only (rule 6, docs/LETTERS-ENGINEERING-CONTRACT.md
   *  is silent on this; see PRD voice-profile fields). A missing profile means
   *  preserve exactly as said — see applyProfanityCeiling. */
  voiceProfile?: VoiceProfile | null
}

export type KeepWordsResult = {
  /** Final reader-facing text. The only value this module produces that may be
   *  stored as `body` / `composed_body`. Short and plain is a valid result. */
  body: string
  wordCount: number
  /** deslop()'s report on `body`. Telemetry only: since this module invents
   *  nothing, a structural violation here says something about deslop's own
   *  variance heuristics on short/rough text, not about this module. */
  slopAudit: SlopReport
}

// ---------------------------------------------------------------------------
// Small pure helpers
// ---------------------------------------------------------------------------

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Turns a literal phrase into a pattern where internal spaces match any run
 *  of whitespace (so "you know" also matches "you   know" from odd STT gaps). */
function phrasePattern(phrase: string): string {
  return escapeRegExp(phrase).replace(/ /g, '\\s+')
}

function countWords(text: string): number {
  const trimmed = text.trim()
  return trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length
}

function splitIntoParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
}

// ---------------------------------------------------------------------------
// 1. False starts and self-corrections — the hardest part.
//
// Signal: an em dash (—), en dash (–) used mid-utterance, or a double hyphen
// (--) — the characters STT services actually emit for a cut-off, not a bare
// single hyphen (indistinguishable from a compound word like "well-behaved").
//
// Rule: within one sentence-ish chunk, keep only the text AFTER the LAST such
// dash (trimmed of a leading stray comma/space), discarding everything from
// the start of the chunk up to and including that dash. Example:
//   "she went to the— she crawled to the door" -> "she crawled to the door"
//
// LIMITS (documented honestly, not fixed):
//  - Always discards back to the start of the current sentence-ish chunk,
//    never to a sub-clause boundary. A self-correction that only replaces one
//    word deep inside a long sentence loses the whole lead-in, not just the
//    corrected word. Over-discarding is the accepted tradeoff: a false start
//    is material the parent themselves signaled they didn't mean, and
//    over-discarding can never leave two contradictory clauses standing or
//    require inventing a word to reconnect what's kept — under-discarding
//    would risk both.
//  - A dash flanked by digits on both sides ("she slept 7—8 hours") is left
//    alone — treated as a number range, not a restart — so real data isn't
//    eaten. This is the one deliberate exception to "keep everything after
//    the last dash".
//  - Chunk boundaries here are a simple split on [.!?]+ followed by
//    whitespace, not deslop's abbreviation-aware splitSentences — adequate
//    for locating "the current sentence" for this heuristic; the accurate
//    version runs later, in fixSentenceMechanics, on the already-trimmed text.
// ---------------------------------------------------------------------------

const DASH_RE = /—|–|--/g

function isNumericRangeDash(sentence: string, index: number, length: number): boolean {
  const before = sentence.slice(0, index).trimEnd()
  const after = sentence.slice(index + length).trimStart()
  return /\d$/.test(before) && /^\d/.test(after)
}

function trimFalseStartsInChunk(sentence: string): string {
  let lastCutEnd = -1
  const re = new RegExp(DASH_RE.source, 'g')
  let m: RegExpExecArray | null
  while ((m = re.exec(sentence)) !== null) {
    if (!isNumericRangeDash(sentence, m.index, m[0].length)) {
      lastCutEnd = m.index + m[0].length
    }
  }
  if (lastCutEnd === -1) return sentence
  return sentence.slice(lastCutEnd).replace(/^[\s,]+/, '')
}

function splitKeepingDelimiter(text: string, re: RegExp): string[] {
  const global = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g')
  const out: string[] = []
  let last = 0
  let m: RegExpExecArray | null
  while ((m = global.exec(text)) !== null) {
    out.push(text.slice(last, m.index + m[0].length))
    last = m.index + m[0].length
    if (m[0].length === 0) global.lastIndex++
  }
  out.push(text.slice(last))
  return out.filter((s) => s.length > 0)
}

function trimFalseStarts(text: string): string {
  const chunks = splitKeepingDelimiter(text, /[.!?]+\s+/)
  return chunks.map(trimFalseStartsInChunk).join('')
}

// ---------------------------------------------------------------------------
// 2. Filler and disfluency.
//
// "um" / "uh" / "erm" (with repeated letters, "ummm") are removed unconditionally
// — there is no non-filler use of these tokens in transcribed speech.
//
// "like", "you know" and "I mean" are removed ONLY when a pause comma marks
// them as a discourse tag: flanked by commas ("it was, like, loud") or at the
// very start of a clause with a comma right after ("Like, she started
// crawling."). Rule 1 is explicit that "she looks like her mother" must
// survive intact — "like" there has no comma cue, so it is left alone.
//
// LIMIT: this under-removes filler that has no comma cue at all (an STT
// transcript that ran the disfluency straight into the next word with no
// pause marked). Accepted deliberately: a missed filler word is a cosmetic
// rough edge; the alternative (matching "like"/"you know"/"I mean" on bare
// word boundary) would strip real comparisons, real questions ("do you know
// what happened") and the literal "I mean it" — corrupting the parent's
// actual words, which this module exists to never do.
//
// Repeated-word stammers ("the the dog", "I I think") are collapsed, but only
// for a small closed set of function words. A real word repeated for emphasis
// ("very very tired", "no no no") is far more likely to be intentional than a
// stammer, and is NOT in this list — preserved on purpose.
// ---------------------------------------------------------------------------

const FLANKED_FILLER_PHRASES = ['like', 'you know', 'I mean']

const STAMMER_WORDS = [
  'i', 'a', 'the', 'is', 'was', 'to', 'and', 'so', 'but', 'in', 'on', 'at',
  'of', 'he', 'she', 'we', 'they', 'you', 'it', 'that', 'this', 'do', 'did',
]

function stripPureFiller(text: string): string {
  return text.replace(/\b(um+|uh+|erm+)\b[,]?\s*/gi, '')
}

function stripFlankedOrLeadingFiller(text: string, phrase: string): string {
  const p = phrasePattern(phrase)
  // Mid-clause, framed by a pause comma on both sides -> collapse to one comma.
  let out = text.replace(new RegExp(',\\s*' + p + '\\s*,', 'gi'), ',')
  // Clause-initial, followed by a pause comma.
  out = out.replace(new RegExp('(^|[.!?]\\s+)' + p + '\\s*,\\s*', 'gi'), '$1')
  return out
}

function collapseStammers(text: string): string {
  let out = text
  for (const w of STAMMER_WORDS) {
    const p = escapeRegExp(w)
    out = out.replace(new RegExp('\\b(' + p + ')\\b(?:[\\s,]+\\1\\b)+', 'gi'), '$1')
  }
  return out
}

function removeDisfluency(text: string): string {
  let s = stripPureFiller(text)
  for (const phrase of FLANKED_FILLER_PHRASES) {
    s = stripFlankedOrLeadingFiller(s, phrase)
  }
  return collapseStammers(s)
}

// ---------------------------------------------------------------------------
// 3. Profanity ceiling.
//
// profanity_ceiling: 0 none, 1 mild, 2 unrestricted (types/letters.ts).
// A word above the ceiling is REMOVED entirely, the same way filler is
// removed — never masked ("f**k"), because masking manufactures a token that
// was never in the transcript, which is exactly what the authenticity
// invariant forbids. Removal can leave a grammatically rough sentence
// ("what the was that") — accepted: roughness is the product, and it is a
// smaller defect than inventing or disguising a word.
//
// Absent voice profile = ceiling 2 (preserve exactly as said). This module
// does not guess an unstated preference; onboarding (voice-profile.ts) sets a
// real ceiling once complete, so most calls will have one.
// ---------------------------------------------------------------------------

const MILD_PROFANITY = ['damn', 'goddamn', 'hell', 'crap', 'ass', 'piss', 'bloody', 'bastard']
const STRONG_PROFANITY = [
  'fuck', 'fucking', 'fucked', 'fucker', 'motherfucker', 'shit', 'shitty',
  'bullshit', 'bitch', 'asshole', 'cunt', 'dick', 'dickhead', 'twat', 'prick', 'pussy',
]

function removeWholeWord(text: string, word: string): string {
  const p = escapeRegExp(word)
  return text.replace(new RegExp('\\b' + p + '\\b[,]?\\s*', 'gi'), '')
}

function applyProfanityCeiling(text: string, ceiling: 0 | 1 | 2): string {
  if (ceiling >= 2) return text
  let out = text
  for (const w of STRONG_PROFANITY) out = removeWholeWord(out, w)
  if (ceiling === 0) {
    for (const w of MILD_PROFANITY) out = removeWholeWord(out, w)
  }
  return out
}

// ---------------------------------------------------------------------------
// 4. Capitalization and terminal punctuation.
//
// Uses deslop's abbreviation-aware splitSentences so "Dr." / "8 a.m." / "4.5"
// aren't misread as sentence breaks. Only the FIRST letter of each sentence
// is touched (capitalized) and a terminal mark is appended only when one is
// genuinely missing — nothing mid-sentence is ever altered.
//
// LIMIT: when a chunk of transcript has no terminal punctuation anywhere,
// splitSentences returns it as one long sentence, and that is what this
// module leaves it as. Inserting periods into a run-on transcript would mean
// guessing where the parent's sentences actually broke — a judgment call this
// module has no basis for, and rule 7 forbids inventing content to make it.
// A punctuation-free ramble stays one long, honestly-labeled sentence.
// ---------------------------------------------------------------------------

const TERMINAL_RE = /[.!?]["')\]]*$/

function capitalizeFirst(s: string): string {
  return s.replace(/^(\s*)([a-zA-Z])/, (_m, pre: string, c: string) => pre + c.toUpperCase())
}

function ensureTerminalPunctuation(s: string): string {
  return TERMINAL_RE.test(s) ? s : s + '.'
}

function fixSentenceMechanics(paragraph: string): string {
  const trimmed = paragraph.trim()
  if (trimmed.length === 0) return ''
  const sentences = splitSentences(trimmed)
  if (sentences.length === 0) return ''
  return sentences.map((s) => ensureTerminalPunctuation(capitalizeFirst(s))).join(' ')
}

// ---------------------------------------------------------------------------
// Per-paragraph pipeline and entry point
// ---------------------------------------------------------------------------

function cleanParagraph(raw: string, ceiling: 0 | 1 | 2): string {
  let s = trimFalseStarts(raw)
  s = removeDisfluency(s)
  s = applyProfanityCeiling(s, ceiling)
  s = s.replace(/[ \t]{2,}/g, ' ').trim()
  return fixSentenceMechanics(s)
}

/**
 * Composes a log (or letter) body that keeps every word the parent said.
 * Pure: no I/O, no clock, no randomness. Paragraph breaks fall at the two
 * natural topic boundaries this module can locate without guessing —
 * blank lines already present in the transcript (preserved as-is), and the
 * boundary between the main transcript and each answered follow-up, which is
 * always a real topic shift (a different question). Follow-up answers are
 * merged in ask order, as their own paragraphs of plain prose — never
 * rendered as "Q: ... A: ...".
 */
export function composeKeepWords(input: KeepWordsInput): KeepWordsResult {
  const ceiling = input.voiceProfile?.profanity_ceiling ?? 2

  const transcriptParagraphs = splitIntoParagraphs(input.transcript ?? '')
    .map((p) => cleanParagraph(p, ceiling))
    .filter((p) => p.length > 0)

  const followupParagraphs = (input.followups ?? [])
    .filter(
      (f): f is FollowUp & { answer: string } =>
        !f.skipped && typeof f.answer === 'string' && f.answer.trim().length > 0
    )
    .flatMap((f) => splitIntoParagraphs(f.answer))
    .map((p) => cleanParagraph(p, ceiling))
    .filter((p) => p.length > 0)

  const assembled = [...transcriptParagraphs, ...followupParagraphs].join('\n\n')
  const audit = deslop(assembled)

  return {
    body: audit.clean,
    wordCount: countWords(audit.clean),
    slopAudit: audit,
  }
}

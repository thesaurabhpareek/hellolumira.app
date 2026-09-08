/**
 * @module letters/deslop
 * @description Deterministic AI-slop removal. Runs AFTER generation, BEFORE storage.
 *
 * Why this is code and not a prompt instruction (PRD 16.6):
 *  1. Asking a model to police its own priors is asking a distribution to sample
 *     outside itself. It regresses silently over long contexts.
 *  2. The requirement is absolute. One em dash in a letter to a child falsifies the
 *     product's premise. Probabilistic compliance is not compliance.
 *  3. Character substitution and variance are trivially computable. Spending tokens
 *     and non-determinism on them is malpractice.
 *
 * Prompt for STRUCTURE. Code for CHARACTERS and COUNTS.
 *
 * Calibration note: lexical tells (em dash, "delve") are correlated markers that also
 * appear constantly in good human prose. Structural tells are the diagnostic ones.
 * So: ban tokens hard, ban structures by QUOTA. Stripping every rhetorical move takes
 * the life out of real writing, which is the opposite of the goal.
 */
import type { SlopReport } from '@/types/letters'

/** Unicode punctuation a phone keyboard does not produce mid-sentence at 10pm. */
const CHAR_MAP: Array<[string, string]> = [
  ['–', '-'],    // en dash
  ['‘', "'"], ['’', "'"],
  ['“', '"'], ['”', '"'],
  ['…', '...'],
  [' ', ' '],
  ['′', "'"], ['″', '"'],
  ['­', ''],
  ['−', '-'],
]

const BANNED: Array<[RegExp, string]> = [
  [/\bdelv(e|es|ed|ing)\b/gi, 'delve'],
  [/\btapestry\b/gi, 'tapestry'],
  [/\btestament to\b/gi, 'testament to'],
  [/\bnavigat(e|es|ing) (the|this)\b/gi, 'navigate the'],
  [/\bresonat(e|es|ed|ing)\b/gi, 'resonate'],
  [/\bbeacon\b/gi, 'beacon'],
  [/\brealm\b/gi, 'realm'],
  [/\bmyriad\b/gi, 'myriad'],
  [/\bembark\b/gi, 'embark'],
  [/\bunwavering\b/gi, 'unwavering'],
  [/\bwhirlwind\b/gi, 'whirlwind'],
  [/\bin that moment\b/gi, 'in that moment'],
  [/\blittle did (i|we) know\b/gi, 'little did i know'],
  [/\bit'?s not just [^.!?]{1,60}?[,;-] it'?s\b/gi, "it's not just X it's Y"],
  [/\b(firstly|moreover|furthermore|ultimately|in conclusion)\b/gi, 'essay connective'],
  [/\bthis (isn'?t|is not) (just )?about\b/gi, "this is not about"],
]

/** Abbreviations whose trailing period does not end a sentence. */
const ABBREV = [
  'mr', 'mrs', 'ms', 'dr', 'prof', 'sr', 'jr', 'st', 'vs', 'etc', 'approx',
  'jan', 'feb', 'mar', 'apr', 'jun', 'jul', 'aug', 'sep', 'sept', 'oct', 'nov', 'dec',
  'a.m', 'p.m', 'i.e', 'e.g', 'u.s', 'oz', 'lb', 'kg', 'ml',
]

/**
 * Sentence splitter that survives "Dr.", "8 a.m.", "4.5 oz", "U.S." and "...".
 * Deliberately hand-rolled: no lookbehind (this repo's tsconfig has no `target`,
 * so it defaults to ES3 and rejects several modern regex features).
 */
export function splitSentences(text: string): string[] {
  const out: string[] = []
  let buf = ''
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    buf += ch
    if (ch !== '.' && ch !== '!' && ch !== '?') continue

    // Run of terminators ("...", "?!") consumed together.
    let j = i
    while (j + 1 < text.length && '.!?'.indexOf(text[j + 1]) !== -1) {
      buf += text[j + 1]
      j++
    }
    const next = text[j + 1]
    if (next !== undefined && next !== ' ' && next !== '\n' && next !== '\t') { i = j; continue }

    const trimmed = buf.trim()
    // Decimal like "4.5" — a digit sat either side of a single period.
    if (ch === '.' && /\d\.$/.test(trimmed) && /^\s*\d/.test(text.slice(j + 1))) { i = j; continue }
    // Known abbreviation immediately before the period.
    const tail = trimmed.replace(/[.!?]+$/, '').toLowerCase()
    const lastWord = tail.split(/[\s(]/).pop() || ''
    if (ch === '.' && ABBREV.indexOf(lastWord) !== -1) { i = j; continue }
    // Single capital initial ("J. Smith").
    if (ch === '.' && /(^|\s)[a-z]$/i.test(tail)) { i = j; continue }

    out.push(trimmed)
    buf = ''
    i = j
  }
  if (buf.trim()) out.push(buf.trim())
  return out.filter((s) => s.length > 0)
}

function words(s: string): string[] {
  return s.trim().split(/\s+/).filter((w) => w.length > 0)
}

const ABSTRACT_CLOSERS = /\b(love|joy|journey|moment|grateful|blessed|always know|forever|treasure|precious)\b/i

/** Replace em dashes contextually, not blindly. */
function fixEmDashes(text: string): string {
  // "word — Word" where the tail is a full clause -> sentence break.
  let s = text.replace(/\s*—\s*(?=[A-Z])/g, '. ')
  // Everything else -> comma, unless already adjacent to punctuation.
  s = s.replace(/\s*—\s*/g, ', ')
  return s
}

function tidy(text: string): string {
  return text
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/,\s*([.;:!?])/g, '$1')
    .replace(/,{2,}/g, ',')
    .replace(/[,;]+[ \t]*(?=\n|$)/g, '')
    .replace(/\.{4,}/g, '...')
    .replace(/(^|\n)[ \t]+/g, '$1')
    .replace(/[ \t]+(\n|$)/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** Minimum sentences before variance rules apply. A short true entry is a GOAL (PRD 9.4). */
const VARIANCE_MIN_SENTENCES = 4

export function deslop(input: string): SlopReport {
  if (!input || !input.trim()) {
    return { clean: '', violations: [], stdev: 0, passed: true }
  }

  let s = fixEmDashes(input)
  for (let i = 0; i < CHAR_MAP.length; i++) {
    s = s.split(CHAR_MAP[i][0]).join(CHAR_MAP[i][1])
  }
  s = tidy(s)

  const violations: string[] = []

  for (let i = 0; i < BANNED.length; i++) {
    if (BANNED[i][0].test(s)) violations.push('banned:' + BANNED[i][1])
    BANNED[i][0].lastIndex = 0
  }

  const sents = splitSentences(s)
  const lens = sents.map((x) => words(x).length)
  const n = lens.length
  const mean = n ? lens.reduce((a, b) => a + b, 0) / n : 0
  const stdev = n
    ? Math.sqrt(lens.reduce((a, b) => a + (b - mean) * (b - mean), 0) / n)
    : 0

  // Variance rules only bite on entries long enough for variance to mean anything.
  if (n >= VARIANCE_MIN_SENTENCES) {
    if (stdev < 6.0) violations.push('uniform_sentence_length')
    if (!lens.some((l) => l <= 5)) violations.push('no_short_sentence')
    if (!lens.some((l) => l >= 25)) violations.push('no_long_sentence')
  }

  // "not X, but Y" — quota 1, not a ban.
  const anti = s.match(/\b(isn'?t|wasn'?t|not)\b[^.!?]{2,60}?[,;]?\s+(but|it'?s)\b/gi)
  if (anti && anti.length > 1) violations.push('antithesis_x' + anti.length)

  // Tricolon closer: final sentence as three comma-separated beats.
  const last = sents.length ? sents[sents.length - 1] : ''
  const beats = last.split(',').filter((x) => x.trim().length > 0)
  if (beats.length >= 3 && words(last).length <= 20) violations.push('tricolon_closer')

  // Sentimental register shift in the final 15 words.
  const tailWords = words(s).slice(-15).join(' ')
  if (ABSTRACT_CLOSERS.test(tailWords)) violations.push('sentimental_closer')

  // Summarizing final paragraph: >40% content-word overlap with everything before it.
  const paras = s.split(/\n{2,}/).map((p) => p.trim()).filter((p) => p.length > 0)
  if (paras.length >= 2) {
    const contentOf = (t: string): string[] =>
      words(t.toLowerCase().replace(/[^a-z0-9\s']/g, ' '))
        .filter((w) => w.length > 3)
    const tailSet = contentOf(paras[paras.length - 1])
    const headSet: Record<string, true> = {}
    for (const p of paras.slice(0, -1)) for (const w of contentOf(p)) headSet[w] = true
    if (tailSet.length >= 5) {
      const overlap = tailSet.filter((w) => headSet[w] === true).length / tailSet.length
      if (overlap > 0.4) violations.push('summarizing_final_paragraph')
    }
  }

  return { clean: s, violations, stdev, passed: violations.length === 0 }
}

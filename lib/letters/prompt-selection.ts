/**
 * @module letters/prompt-selection
 * @description Chooses tonight's opening prompt for a Letters session.
 *
 *   This is the module PRD §16.1 calls "the entire product advantage": Letters
 *   never opens on a blank "how was your day?" It reads today's structured
 *   rows (milestones, check-in) and the gap since the last entry, and turns
 *   that into a specific opening question. Priority order (PRD §14.4, §16.4):
 *
 *     1. Gap recovery   — daysSinceLastEntry >= 5 (§14.4). Fires before
 *                          anything else; debt is cancelled by redefining
 *                          the unit, not by catching up.
 *     2. Milestone      — something was logged today. Open on it specifically.
 *     3. Check-in       — today's numbers show something notable.
 *     4. Age band       — texture prompt from the CDC-Feb-2022-aligned bank
 *                          (§16.4). Ages are prompt timing, never a scorecard.
 *     5. Evergreen      — fallback, always available.
 *
 *   Pure and deterministic: same inputs -> same output. No I/O, no clock,
 *   no randomness. `recentPromptTexts` is passed in by the caller (the API
 *   route reads that from the DB); this module never reads it itself.
 *
 *   sourceRef design note (see final report REQUEST): `LetterPromptContext`
 *   (types/letters.ts) does not carry a row id for `todaysMilestones` entries
 *   or for `todaysCheckin` — only `openThreads` entries carry `entryId`, and
 *   this selector's priority order does not consult `openThreads`. Absent a
 *   real row id, `sourceRef` below is built from the real context fields
 *   that produced the prompt (the milestone's own `type`, the check-in
 *   signal that fired, the resolved age band, or the real gap length) so it
 *   is deterministic and traceable to real data — never a fabricated value —
 *   but it is not a database row id. See the REQUEST line in the final report.
 */

import type { LetterPromptContext, OpeningPrompt } from '@/types/letters'

/** CDC Feb-2022-aligned age bands (PRD §16.4). Contiguous, inclusive months. */
export type AgeBandKey = '0-3' | '4-6' | '7-9' | '10-12' | '13-15' | '16-24'

export type AgeBandPromptSet = {
  band: AgeBandKey
  /** Inclusive lower bound, in whole months. */
  minMonths: number
  /** Inclusive upper bound, in whole months. */
  maxMonths: number
  /** Texture prompts for this band. Needs 2+ so repeat suppression has a fallback. */
  prompts: string[]
}

/**
 * REQUEST for CT1 (lib/letters/prompts/age-bands.ts): export a named
 * `ageBandPrompts: AgeBandPrompts` conforming to this shape. Bands per PRD
 * §16.4: 0-3, 4-6, 7-9, 10-12, 13-15, 16-24 (post-2022 CDC ages — walking and
 * first word live in 13-15, not 10-12). Give every band and `evergreen` at
 * least 2 prompts so repeat suppression has somewhere to fall back to.
 */
export type AgeBandPrompts = {
  bands: AgeBandPromptSet[]
  /** Always-available fallback prompts, also used for ages outside every band. */
  evergreen: string[]
}

/** Below this many hours, a night's sleep is "notable" (PRD §16.1 example). */
const LOW_SLEEP_THRESHOLD_HOURS = 5

/** Moods treated as "difficult" for opening-prompt purposes. Deliberately strict:
 *  'fussy' alone is common and not treated as notable; only 'very_fussy' is. */
const DIFFICULT_MOODS = new Set(['very_fussy'])

const MAX_EMBEDDED_TEXT_LENGTH = 80

/** Human-readable phrase per known milestone_type (types/app.ts MilestoneType). */
const MILESTONE_LABELS: Record<string, string> = {
  rolling: 'rolling over',
  sitting: 'sitting up',
  crawling: 'crawling',
  pulling_to_stand: 'pulling up to stand',
  first_word: 'a first word',
  pincer_grip: 'the pincer grasp',
  walking: 'first steps',
}

function truncate(text: string, max: number = MAX_EMBEDDED_TEXT_LENGTH): string {
  const trimmed = text.trim()
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max).trimEnd()}…`
}

/** Picks the first candidate not present in `recentPromptTexts`, falling back
 *  to the first candidate if every one of them was recently shown. */
function pickNonRepeating(candidates: string[], recentPromptTexts: string[]): string | null {
  if (candidates.length === 0) return null
  const fresh = candidates.find((c) => !recentPromptTexts.includes(c))
  return fresh ?? candidates[0]
}

function selectGapRecovery(ctx: LetterPromptContext): OpeningPrompt | null {
  if (ctx.daysSinceLastEntry === null || ctx.daysSinceLastEntry < 5) return null
  // Deliberately NOT subject to repeat suppression: while the gap persists,
  // this is meant to keep showing unchanged (PRD §14.4), not vary night to
  // night. Suppressing it would defeat its purpose.
  return {
    text: 'The last few days, as one.',
    source: 'gap_recovery',
    sourceRef: `gap:${ctx.daysSinceLastEntry}`,
  }
}

function selectMilestone(
  ctx: LetterPromptContext,
  recentPromptTexts: string[]
): OpeningPrompt | null {
  if (ctx.todaysMilestones.length === 0) return null
  const milestone = ctx.todaysMilestones[0]
  const label =
    MILESTONE_LABELS[milestone.type] ??
    (milestone.note && milestone.note.trim().length > 0
      ? truncate(milestone.note)
      : 'something new')
  // Graceful null-babyName handling: fall back to a name-free phrasing
  // rather than rendering "undefined" or an empty possessive slot.
  const text = ctx.babyName
    ? `You logged ${ctx.babyName}'s ${label} today. Tell me about the moment.`
    : `You logged ${label} today. Tell me about the moment.`
  if (recentPromptTexts.includes(text)) return null
  return {
    text,
    source: 'milestone',
    sourceRef: `milestone:${milestone.type || 'other'}`,
  }
}

function formatHours(hours: number): string {
  const rounded = Math.round(hours * 10) / 10
  return `${rounded}`
}

function selectCheckin(
  ctx: LetterPromptContext,
  recentPromptTexts: string[]
): OpeningPrompt | null {
  const checkin = ctx.todaysCheckin
  if (!checkin) return null

  const hours = checkin.sleep_hours
  if (hours !== null && hours >= 0 && hours < LOW_SLEEP_THRESHOLD_HOURS) {
    const text = `${formatHours(hours)} hours of sleep. What's it actually like right now?`
    if (!recentPromptTexts.includes(text)) {
      return { text, source: 'checkin', sourceRef: 'checkin:sleep' }
    }
  }

  if (checkin.mood !== null && DIFFICULT_MOODS.has(checkin.mood)) {
    const text = "A hard day today. What's it actually like right now?"
    if (!recentPromptTexts.includes(text)) {
      return { text, source: 'checkin', sourceRef: 'checkin:mood' }
    }
  }

  return null
}

function selectAgeBand(
  ctx: LetterPromptContext,
  bank: AgeBandPrompts,
  recentPromptTexts: string[]
): OpeningPrompt | null {
  const ageInMonths = ctx.ageInMonths
  if (ageInMonths === null) return null
  const band = bank.bands.find((b) => ageInMonths >= b.minMonths && ageInMonths <= b.maxMonths)
  if (!band || band.prompts.length === 0) return null
  const text = pickNonRepeating(band.prompts, recentPromptTexts)
  if (!text) return null
  return { text, source: 'age_band', sourceRef: `age_band:${band.band}` }
}

function selectEvergreen(bank: AgeBandPrompts, recentPromptTexts: string[]): OpeningPrompt {
  // Defensive-only fallback if the bank ships with an empty evergreen list.
  // Deliberately name/pronoun-free and content-neutral: real evergreen copy
  // is CT1's (lib/letters/prompts/age-bands.ts), not this module's, to write.
  const fallbackText = 'What do you want to remember about today?'
  const text = pickNonRepeating(bank.evergreen, recentPromptTexts) ?? fallbackText
  return { text, source: 'evergreen', sourceRef: null }
}

/**
 * Selects tonight's opening prompt. Pure and deterministic — never asserts a
 * developmental judgment, only selects a question. See module doc for the
 * priority order and the sourceRef design note.
 *
 * @param ctx                Structured context read from real rows (never fabricated).
 * @param bank                Age-banded + evergreen prompt inventory (owned by CT1).
 * @param recentPromptTexts   Prompt texts shown on recent nights, used to avoid
 *                             repeating the same prompt two nights running.
 *                             Caller-supplied; this function never reads the DB.
 */
export function selectOpeningPrompt(
  ctx: LetterPromptContext,
  bank: AgeBandPrompts,
  recentPromptTexts: string[] = []
): OpeningPrompt {
  return (
    selectGapRecovery(ctx) ??
    selectMilestone(ctx, recentPromptTexts) ??
    selectCheckin(ctx, recentPromptTexts) ??
    selectAgeBand(ctx, bank, recentPromptTexts) ??
    selectEvergreen(bank, recentPromptTexts)
  )
}

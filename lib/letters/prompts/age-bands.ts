/**
 * @module lib/letters/prompts/age-bands
 * @description Age-banded texture prompts for tonight's opening question
 *   (PRD S16.3-S16.4). Pure data only — no selection logic lives here.
 *   `selectOpeningPrompt` (lib/letters/prompt-selection.ts, frozen, BE4) picks
 *   from this bank when nothing more specific fired today (no gap recovery,
 *   no milestone, no notable check-in): it matches `ctx.ageInMonths` against
 *   `bands[].minMonths`/`maxMonths` and falls back to `evergreen` when no
 *   band matches or age is unknown.
 *
 *   CDC/AAP ages (Zubler et al. 2022, Pediatrics 149(3)) are prompt TIMING,
 *   never a scorecard: the milestone is the invitation, the texture prompt
 *   is the payload (PRD S16.3). "First step: 14 Mar" teaches a grown child
 *   nothing; "what did the room feel like when she walked" does.
 *
 *   Every band's `prompts` array carries the two evergreens (PRD S16.4):
 *   "what did she do today you want to remember" and "what were you
 *   feeling today" — the second is the one nobody else asks — alongside
 *   6-10 age-specific texture prompts, for 8-12 total per band.
 *
 *   Band boundaries (frozen `AgeBandKey`, post-Feb-2022 CDC ages, verified
 *   against cdc.gov — see final report):
 *     0-3    newborn through 3mo. Folds in the newborn edge case (no
 *            standalone "newborn" band exists in the frozen AgeBandKey
 *            union — see REQUEST in final report) — the 3am/exhaustion/
 *            identity-shift texture that is specific to the first weeks
 *            lives here, alongside the rest of the band.
 *     4-6    rolling now anchors at 6mo, not 4mo (CDC Feb 2022 revision).
 *     7-9    sitting, babbling, stranger wariness.
 *     10-12  pulls to stand, waves, "mama"/"dada" (non-specific), pincer
 *            grasp. Crawling is NOT a CDC milestone as of Feb 2022 and is
 *            deliberately absent from every prompt in this file.
 *     13-15  first steps and first word both anchor here now, not 12mo
 *            (CDC Feb 2022 revision — this is the band that changed most).
 *     16-24  two words together (24mo anchor), running.
 *
 *   `evergreen` is the always-available fallback (used when `ageInMonths`
 *   is null, and — per `selectEvergreen`'s own doc comment in
 *   prompt-selection.ts — "also used for ages outside every band"). Since
 *   the frozen `AgeBandKey` union tops out at 16-24, this array is also
 *   the de facto over-24-month fallback (see REQUEST in final report): its
 *   content is written to read naturally for an older toddler as well as
 *   for a night when age is simply unknown.
 *
 *   Slot: {babyName} — replaced by the caller with the baby's name, or with
 *   AGE_BAND_BABY_NAME_FALLBACK when no name is set in-app. Same single-
 *   brace token and "replaced by the caller" convention as
 *   FOLLOWUP_BABY_NAME_FALLBACK in ./followup-templates.ts — see REQUEST in
 *   final report regarding where that substitution currently happens.
 *
 *   Style rules followed throughout (per brief): second person where the
 *   question is about the parent, warm, short, specific, never clinical,
 *   never twee, no exclamation marks. Banned outright: "journey", "moment",
 *   "precious", "treasure", "magical", "amazing". Never an upward
 *   counterfactual, regret-framing, or day-rating prompt (PRD S6.3 — "what
 *   could you have done differently" must never ship, in any wording, in
 *   any band) — every prompt below asks what happened or what was felt,
 *   never what should have gone differently.
 */

import type { AgeBandKey, AgeBandPromptSet, AgeBandPrompts } from '@/lib/letters/prompt-selection'

/** Used by the caller in place of {babyName} when no name is set in-app.
 *  Matches FOLLOWUP_BABY_NAME_FALLBACK (./followup-templates.ts) exactly —
 *  one fallback string across the Letters content lanes, per the brief's
 *  instruction not to invent a third convention. */
export const AGE_BAND_BABY_NAME_FALLBACK = 'your baby' as const

/** PRD S16.4: present, reused verbatim, in every band. */
const EVERGREEN_WHAT_TO_REMEMBER = 'What did {babyName} do today that you want to remember?'
const EVERGREEN_WHAT_YOU_FELT = 'What were you feeling today?'

// ---------------------------------------------------------------------------
// 0-3 months — newborn through the end of the third month. Folds in the
// newborn edge case: the first weeks are less about the baby's texture and
// more about the parent's disorientation, so several prompts here are
// deliberately about the parent's own state rather than the baby's.
// ---------------------------------------------------------------------------
const BAND_0_3: readonly string[] = [
  'What woke you at 3am, and what did you do about it?',
  'Who does {babyName} look like right now?',
  "What sound does {babyName} make right before the real cry — the one only you'd notice?",
  "What's the smell you didn't expect to love?",
  'Describe the real smile today, not the gas one.',
  "What's the hardest hour of the day right now, and what gets you through it?",
  'What are you most afraid of, right now, that you have not said out loud?',
  'What does {babyName} weigh in your arms tonight, compared to the day you left the hospital?',
  "What's changed about your own face since {babyName} arrived?",
  EVERGREEN_WHAT_TO_REMEMBER,
  EVERGREEN_WHAT_YOU_FELT,
]

// ---------------------------------------------------------------------------
// 4-6 months — rolling anchors at 6mo (CDC Feb 2022), solids typically start.
// ---------------------------------------------------------------------------
const BAND_4_6: readonly string[] = [
  'What noise is {babyName} making constantly right now?',
  'What is the first thing {babyName} reaches for?',
  'What did {babyName} do with the first bite of real food?',
  "What's the one toy winning this month, and what lost?",
  'Where does {babyName} like to be held, and where does it fight you?',
  'What is the funniest sound {babyName} makes on purpose?',
  'Who makes {babyName} laugh the hardest?',
  "What's different about the nights this month?",
  'What do you say to {babyName} that no one else hears?',
  EVERGREEN_WHAT_TO_REMEMBER,
  EVERGREEN_WHAT_YOU_FELT,
]

// ---------------------------------------------------------------------------
// 7-9 months — sitting, babbling, stranger wariness. PRD's own examples.
// ---------------------------------------------------------------------------
const BAND_7_9: readonly string[] = [
  'What is {babyName} afraid of right now?',
  'What makes {babyName} laugh so hard it stops?',
  "Describe {babyName}'s hands today.",
  'Who is {babyName} suspicious of lately?',
  'What sound does {babyName} repeat over and over?',
  "What has {babyName} figured out how to do that you didn't teach?",
  'What food does {babyName} refuse outright?',
  "What's the game that never gets old?",
  'What does {babyName} do the second you walk into the room?',
  EVERGREEN_WHAT_TO_REMEMBER,
  EVERGREEN_WHAT_YOU_FELT,
]

// ---------------------------------------------------------------------------
// 10-12 months — pulls to stand, waves, "mama"/"dada" (non-specific per
// CDC), pincer grasp. Crawling is deliberately absent — not a CDC milestone
// as of Feb 2022.
// ---------------------------------------------------------------------------
const BAND_10_12: readonly string[] = [
  "What's {babyName}'s opinion today — a food, a person, a place?",
  'What are you scared of for {babyName}, lately?',
  'What did {babyName} pull up on today?',
  'Who got the wave today, and who did not?',
  "What's the word {babyName} says that isn't really a word yet, but you know exactly what it means?",
  'What did {babyName} pick up with just two fingers today?',
  "What's the one thing {babyName} won't let go of right now?",
  'Who does {babyName} go to first these days?',
  'What has changed about how {babyName} looks at you?',
  EVERGREEN_WHAT_TO_REMEMBER,
  EVERGREEN_WHAT_YOU_FELT,
]

// ---------------------------------------------------------------------------
// 13-15 months — first steps AND first word both anchor here now (CDC Feb
// 2022 moved both from 12mo). The band that changed most in the revision.
// ---------------------------------------------------------------------------
const BAND_13_15: readonly string[] = [
  'What did the room feel like when {babyName} walked?',
  'Who did you call first?',
  "What's the word {babyName} says clearly now that wasn't there last month?",
  "What does {babyName} do that no one else's baby does?",
  'Where did {babyName} fall today, and what happened right after?',
  "What does {babyName} point at and refuse to stop pointing at?",
  'What did {babyName} get into today that you did not expect?',
  "What's {babyName}'s new favorite way to say no?",
  'What surprised you about watching {babyName} work something out today?',
  EVERGREEN_WHAT_TO_REMEMBER,
  EVERGREEN_WHAT_YOU_FELT,
]

// ---------------------------------------------------------------------------
// 16-24 months — two words together anchors at 24mo, running.
// ---------------------------------------------------------------------------
const BAND_16_24: readonly string[] = [
  'What does {babyName} call something wrong, and will you miss it when it is right?',
  'What do you hope {babyName} never inherits from you?',
  'What two words did {babyName} put together today?',
  'What did {babyName} run toward, or away from, today?',
  'What opinion does {babyName} have strongly now that would have been unthinkable six months ago?',
  'What is {babyName} insisting on doing alone now?',
  'Who is {babyName} becoming that you did not expect?',
  'What did {babyName} say today that you are going to keep repeating?',
  "What was today's tantrum actually about?",
  EVERGREEN_WHAT_TO_REMEMBER,
  EVERGREEN_WHAT_YOU_FELT,
]

/**
 * Always-available fallback. Used when `ageInMonths` is null, and — per
 * `selectEvergreen`'s doc comment in prompt-selection.ts — also for ages
 * outside every band, which today means over 24 months (see module doc and
 * REQUEST in final report). Written to read naturally at either extreme.
 */
const EVERGREEN: readonly string[] = [
  EVERGREEN_WHAT_TO_REMEMBER,
  EVERGREEN_WHAT_YOU_FELT,
  "What is {babyName} into lately that wasn't a thing last month?",
  'What made you laugh today?',
  'What did {babyName} say or do that surprised you?',
  "What's the running joke in your house right now?",
  "What's {babyName}'s current opinion on the world?",
  'What do you want {babyName} to know about today?',
  'What has changed about {babyName} in just the last week?',
  'What are you proud of tonight, about either of you?',
]

function band(key: AgeBandKey, minMonths: number, maxMonths: number, prompts: readonly string[]): AgeBandPromptSet {
  return { band: key, minMonths, maxMonths, prompts: [...prompts] }
}

/** The bank `selectOpeningPrompt` (BE4) reads. Contiguous, inclusive months,
 *  matching `AgeBandKey` exactly. */
export const ageBandPrompts: AgeBandPrompts = {
  bands: [
    band('0-3', 0, 3, BAND_0_3),
    band('4-6', 4, 6, BAND_4_6),
    band('7-9', 7, 9, BAND_7_9),
    band('10-12', 10, 12, BAND_10_12),
    band('13-15', 13, 15, BAND_13_15),
    band('16-24', 16, 24, BAND_16_24),
  ],
  evergreen: [...EVERGREEN],
}

/**
 * @module letters/prompts/microcopy
 * @description Every player-facing string in the Letters flow except the four other
 *   content modules (age-bands, followup-templates, notifications, safety-copy).
 *   Pure data. No I/O, no `Date.now()`, no `Math.random()` — anything that varies
 *   (weekday, a rotation seed, a formatted date) is a parameter, injected by the
 *   caller, per the engineering contract §2.
 *
 *   Owner: CT5. Lane: content. Do not import this module's exports and redeclare
 *   them elsewhere — this file is the only source for this copy.
 *
 *   Reading level: 6th-8th grade throughout. No exclamation marks anywhere in this
 *   file. Banned words: journey, moment, precious, treasure, magical, amazing,
 *   beautiful chaos.
 *
 *   References:
 *   - docs/Lumira-Letters-PRD.md §14.2 (the nightly flow), §14.6 (no gamification),
 *     §15 (UX principles), §16.5 (slop inventory — informs tone, not applied here)
 *   - docs/Lumira-Design-System-iOS.md §8.2 (VoiceOver strings, reproduced exactly),
 *     §8.6 (cognitive accessibility, undo-over-confirm)
 *   - types/letters.ts (the frozen contract)
 */

// -----------------------------------------------------------------------------
// 1. Empty state, night one — PRD §15.6
// -----------------------------------------------------------------------------
// Rejects the old "Your journal is waiting" pattern. Addresses the reader, not
// the feature. Rendered in reading-view typography (PRD §15.3); the tap target
// is the idle-breathing aura itself, not a button under this text.

/**
 * Candidates keyed by nothing in particular — the caller picks one (e.g. by a
 * stable hash of profile id) so a given parent sees the same line on repeat
 * visits to an empty timeline rather than a new one each time.
 * `{name}` is a token; substitute with the baby's name.
 */
export const EMPTY_STATE_NIGHT_ONE_CANDIDATES: readonly string[] = [
  "Some day, {name} might ask what tonight was like. Tell the story now, while it's still yours.",
  "Some day, {name} will want to know what these nights were like. This is where you start.",
  "{name} won't remember tonight. You will, if you write it down.",
  "One day {name} might ask about nights like this one. Here is where you answer.",
] as const

/** Used when the baby's name is not available to this screen. No pronoun assumed. */
export const EMPTY_STATE_NIGHT_ONE_NO_NAME =
  "Some day, your child might ask what these early nights were like. This is where you start telling it."

/** Accessible label for the empty-state tap target (the idle-breathing aura). */
export const EMPTY_STATE_NIGHT_ONE_A11Y_LABEL = 'Start tonight’s letter'
export const EMPTY_STATE_NIGHT_ONE_A11Y_HINT =
  'Double tap to begin. You can speak or type.'

/**
 * Pure selector: given a rotation seed (caller supplies, e.g. day-of-month or a
 * hash of profile id) and an optional baby name, returns the finished string.
 */
export function buildEmptyStateNightOneCopy(
  seed: number,
  babyName: string | null,
): string {
  if (!babyName) return EMPTY_STATE_NIGHT_ONE_NO_NAME
  const candidates = EMPTY_STATE_NIGHT_ONE_CANDIDATES
  const index = ((seed % candidates.length) + candidates.length) % candidates.length
  return candidates[index].replaceAll('{name}', babyName)
}

// -----------------------------------------------------------------------------
// 2. Listening states — PRD §15.1, §14.2
// -----------------------------------------------------------------------------
// Visible captions only. These are distinct from the VoiceOver announcements in
// section 8 below, which fire once per transition rather than sitting on screen.
// Must read calmly in a dark room and never sound like a recorder is running.

export const LISTENING_COPY = {
  /** Shown on the aura before the parent has tapped to start. */
  armedCaption: 'Tap to begin',
  /** Shown while listening, before any silence threshold is hit. No caption is
   *  also a valid choice here — the aura's amplitude is the feedback. */
  activeCaption: 'Tap when you’re done',
  /** Fires at 6s of silence (PRD §15.1). Low-contrast, does not imply a problem. */
  silenceAt6s: 'Take your time.',
  /** Fires at 90s of silence (PRD §14.2). Pairs with one soft haptic tick. Never
   *  auto-stops the recording. */
  silenceAt90s: 'Still here.',
} as const

// -----------------------------------------------------------------------------
// 3. Composing states — PRD §14.2
// -----------------------------------------------------------------------------
// Never a spinner label, never "Loading", never "Processing". The wait is short
// and emotionally loaded; the copy should feel like someone taking care, not a
// progress bar. `initial` is intentionally null — for the first 8 seconds the
// aura carries the state alone, matching "visual continuity, not a spinner."

export const COMPOSING_COPY = {
  /** 0-8s. No caption. */
  initial: null as string | null,
  /** From 8s. */
  at8Seconds: 'Finding the words...',
  /** From 12s. */
  at12Seconds: 'Almost there.',
  /** Shown briefly at the 20s hard timeout, just before the failure state
   *  (COMPOSE_FAILURE_COPY below) takes over. */
  at20SecondsTimeout: 'That’s taking longer than it should.',
} as const

// -----------------------------------------------------------------------------
// 4. Compose failure — PRD §15.5 (entry-loss prevention is P0)
// -----------------------------------------------------------------------------
// The transcript is already persisted locally and to Supabase before compose
// ever runs (§14.2: "Transcript persisted NOW... before anything else"). This
// copy exists to make sure the parent believes that, not just to state it once.

export const COMPOSE_FAILURE_COPY = {
  heading: 'We couldn’t write it just yet, but nothing is lost.',
  body: 'What you said is saved. You can try again, or keep it exactly as you said it.',
  /** Retries the compose step against the already-saved transcript. */
  tryAgainLabel: 'Try again',
  /** Saves the raw transcript as the entry body, skipping composition.
   *  Deliberately reuses the "Keep my words" vocabulary from the compose-mode
   *  choice (PRD §14.2) so the parent is not asked to learn a new phrase under
   *  stress. */
  saveAsIsLabel: 'Keep my words',
} as const

// -----------------------------------------------------------------------------
// 5. "Not much today" — PRD §14.2, §14.6
// -----------------------------------------------------------------------------
// The most important path in the feature: it keeps the record unbroken without
// demanding performance. The generated entry must read as a real, dignified
// sentence, not a placeholder. Variants are keyed by weekday (0 = Sunday, per
// JS Date#getDay) so the line does not repeat verbatim week over week; days
// with more than one variant rotate on a caller-supplied seed.

export const NOT_MUCH_TODAY_BUTTON_LABEL = 'Not much today'
export const NOT_MUCH_TODAY_A11Y_HINT =
  'Saves a short entry for today without recording or typing.'

type NotMuchTodayVariant = {
  /** Contains the `{name}` token. */
  withName: string
  /** No pronoun, no name required. */
  noName: string
}

/** 10 variants total across the week. Keys match `Date#getDay()`. */
export const NOT_MUCH_TODAY_ENTRIES: Readonly<Record<number, readonly NotMuchTodayVariant[]>> = {
  0: [
    { withName: 'Sunday. Quiet, and {name} was here for it.', noName: 'Sunday. Quiet. That’s the whole entry, and it’s enough.' },
  ],
  1: [
    { withName: 'Monday. Back to the week, and {name} was part of it.', noName: 'Monday. Back to the week. Nothing more to say, and that’s fine.' },
    { withName: 'Monday, and nothing much happened. {name} was here anyway.', noName: 'Monday, and nothing much happened. That counts too.' },
  ],
  2: [
    { withName: 'Tuesday. An ordinary day, and {name} was here for it.', noName: 'Tuesday. An ordinary day, and that’s still worth keeping.' },
  ],
  3: [
    { withName: 'Wednesday. Halfway through, nothing to report, and {name} was here for all of it.', noName: 'Wednesday. Halfway through, nothing to report, and that’s the truth of most days.' },
  ],
  4: [
    { withName: 'Thursday. A plain day. {name} got through it, same as always.', noName: 'Thursday. A plain day, and that’s most of them.' },
    { withName: 'Thursday, and not much to write. {name} was here the whole time.', noName: 'Thursday, and not much to write. Still a day worth having.' },
  ],
  5: [
    { withName: 'Friday. The week wound down, and {name} wound down with it.', noName: 'Friday. The week wound down, and so did the day.' },
  ],
  6: [
    { withName: 'Saturday. Slow, unremarkable, and {name} was there for every bit of it.', noName: 'Saturday. Slow and unremarkable. Still worth a line.' },
    { withName: 'Saturday, and nothing needed fixing or noting. {name} just had a day.', noName: 'Saturday, and nothing needed fixing or noting. Just a day.' },
  ],
} as const

/**
 * Pure selector for the "Not much today" entry body. `weekday` is
 * `Date#getDay()` (0-6, Sunday first) supplied by the caller — this module
 * never reads the clock. `seed` picks among a weekday's variants when there
 * is more than one.
 */
export function buildNotMuchTodayEntry(
  weekday: number,
  babyName: string | null,
  seed: number,
): string {
  const variants = NOT_MUCH_TODAY_ENTRIES[weekday] ?? NOT_MUCH_TODAY_ENTRIES[0]
  const index = ((seed % variants.length) + variants.length) % variants.length
  const variant = variants[index]
  return babyName ? variant.withName.replaceAll('{name}', babyName) : variant.noName
}

// -----------------------------------------------------------------------------
// 6. Transcript review — PRD §14.2 ("REVIEW: transcript editable. Names
//    pre-corrected.")
// -----------------------------------------------------------------------------

export const TRANSCRIPT_REVIEW_COPY = {
  heading: 'Read it over',
  subheading: 'Fix anything before you save it.',
  editHint: 'Tap any word to fix it.',
  /** Shown near a name the transcriber may have misheard (TranscriptEditor's
   *  `knownNames` / `onLearnName`). Framing makes the correction feel like
   *  teaching, not fixing a broken tool. */
  nameCorrectionHint: 'Did we get a name wrong? Tap it to fix it, and we’ll remember next time.',
  saveLabel: 'Save',
  discardLabel: 'Discard',
  discardA11yHint: 'This will not save tonight’s letter.',
} as const

// -----------------------------------------------------------------------------
// 7. Typed path — PRD §15.4, design spec §8.3 (accessibility correctness, not a
//    nicety)
// -----------------------------------------------------------------------------
// The mic and the keyboard are offered as two equally weighted ways in, never
// as a primary path and its fallback.

export const MODALITY_CHOICE_COPY = {
  speakActionLabel: 'Speak',
  typeActionLabel: 'Type',
  speakActionA11yHint: 'Record tonight’s letter out loud.',
  typeActionA11yHint: 'Write tonight’s letter instead of speaking it.',
} as const

export const TYPED_ENTRY_COPY = {
  placeholderWithName: 'What should {name} know about today?',
  placeholderNoName: 'What should today’s letter say?',
  /** Follow-up questions render as text either way (PRD §14.3); this labels the
   *  text-entry affordance when the parent answers by typing rather than
   *  speaking the answer. */
  typedAnswerLabel: 'Type your answer',
} as const

/** Pure helper: fills the typed-entry placeholder with the baby's name if known. */
export function buildTypedEntryPlaceholder(babyName: string | null): string {
  return babyName
    ? TYPED_ENTRY_COPY.placeholderWithName.replaceAll('{name}', babyName)
    : TYPED_ENTRY_COPY.placeholderNoName
}

// -----------------------------------------------------------------------------
// 8. VoiceOver announcements — design spec §8.2, reproduced exactly
// -----------------------------------------------------------------------------
// "Every transition needs an explicit announceForAccessibility() call."
// The failure string is the highest-stakes string in the app: it must never
// let the user believe the entry is gone.

export const VOICEOVER_COPY = {
  micButton: {
    role: 'button',
    label: 'Record tonight’s letter',
    hint: 'Double tap to start recording. You can also type instead.',
  },
  onRecordingStart: 'Recording. Tap again to stop.',
  onRecordingStop: 'Recording stopped. Transcribing.',
  onTranscriptReady: 'Transcription ready. Review your letter before saving.',
  /** Template — never a bare "Saved". Caller supplies a formatted date label,
   *  e.g. "March 14". */
  onSaveTemplate: 'Letter saved for {date}.',
  /** The highest-stakes string in the app. Must never let the user believe the
   *  entry is gone. */
  onTranscriptionFailure:
    'Transcription failed. Your recording is saved. Try again or type your letter.',
} as const

/** Pure helper for the save announcement template above. */
export function buildVoiceOverSaveAnnouncement(dateLabel: string): string {
  return VOICEOVER_COPY.onSaveTemplate.replace('{date}', dateLabel)
}

// -----------------------------------------------------------------------------
// 9. Delete undo toast — design spec §8.6 ("Undo over confirm... never a
//    confirm dialog.")
// -----------------------------------------------------------------------------

export const DELETE_UNDO_TOAST = {
  message: 'Letter deleted.',
  actionLabel: 'Undo',
  durationSeconds: 10,
} as const

// -----------------------------------------------------------------------------
// 10. Letter count label — PRD §14.6 (accumulation only, never a streak)
// -----------------------------------------------------------------------------
// "47 letters to Meera." Only ever goes up. No target, no red state, no
// implied consecutiveness.

/** Pure pluralizer/interpolator. `count` should never be negative; callers
 *  typically hide this label entirely at count 0 rather than render it. */
export function buildLetterCountLabel(count: number, babyName: string | null): string {
  const noun = count === 1 ? 'letter' : 'letters'
  return babyName ? `${count} ${noun} to ${babyName}` : `${count} ${noun}, and counting`
}

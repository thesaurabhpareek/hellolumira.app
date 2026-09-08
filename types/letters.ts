/**
 * @module types/letters
 * @description THE CONTRACT. Every Letters module depends on these types and
 *   no module may redefine them. Changing a type here is a breaking change and
 *   requires updating every consumer in the same PR.
 */

/**
 * The capture is one thing; the output is a choice made after it.
 *   'log'        — the nightly journal entry. THE HABIT. Low ceremony, always created.
 *   'letter'     — an artifact composed from one or more logs. Opt-in, on demand.
 *   'ai_summary' — the pre-existing Lumira weekly summary. Untouched by this feature.
 */
export type EntryKind = 'ai_summary' | 'log' | 'letter'

/** What a letter was built from. Null on logs. */
export type LetterSpan = 'single' | 'week' | 'month' | 'milestone' | 'custom'
export type ComposeMode = 'keep_words' | 'shaped' | 'raw'
export type CaptureMode = 'spoken' | 'typed' | 'mixed' | 'not_much'
export type Visibility = 'private' | 'partner' | 'child_safe'
export type SafetyTier = 0 | 1 | 2
export type SafetyCategory =
  | 'none'
  | 'distress'
  | 'intrusive_thoughts'
  | 'bonding_difficulty'
  | 'self_harm'
  | 'harm_to_child'
  | 'infant_safety'
  | 'domestic_violence'
  | 'severe_maternal_distress'

export type FollowUpArchetype = 'anchor' | 'thread' | 'you'

export type FollowUp = {
  archetype: FollowUpArchetype
  question: string
  answer: string | null
  skipped: boolean
}

/** A journal entry — either a nightly log or a composed letter. Mirrors journal_entries after v48. */
export type JournalEntryRow = {
  id: string
  profile_id: string
  baby_id: string | null
  entry_kind: EntryKind
  entry_date: string           // YYYY-MM-DD
  /** Logs this letter was composed from. Empty on logs; >=1 on letters. */
  source_entry_ids: string[]
  letter_span: LetterSpan | null
  /** Reader-facing text. Always populated. This is what the timeline renders. */
  body: string
  raw_transcript: string | null
  composed_body: string | null
  edited_body: string | null
  compose_mode: ComposeMode | null
  capture_mode: CaptureMode | null
  visibility: Visibility
  child_safe: boolean
  voice_profile_version: number | null
  slop_audit: SlopReport | null
  followups: FollowUp[]
  word_count: number | null
  duration_seconds: number | null
  covers_from: string | null   // set when one entry covers a multi-day gap
  covers_to: string | null
  composed_at: string | null
  created_at: string
  updated_at: string
}

export type VoiceProfile = {
  id: string
  profile_id: string
  baby_id: string | null
  endearments: string[]
  partner_name_for_child: string | null
  self_name_for_child: string | null
  mean_sentence_len: number | null
  sentence_len_stdev: number | null
  contraction_rate: number | null
  question_rate: number | null
  formality: 1 | 2 | 3 | 4 | 5 | null
  humor_mode: 'dry' | 'absurd' | 'self_deprecating' | 'warm' | 'none' | null
  profanity_ceiling: 0 | 1 | 2
  code_switch_terms: Array<{ term: string; gloss: string }>
  register_notes: string | null
  banned_words: string[]
  preferred_words: string[]
  onboarding_complete: boolean
  version: number
}

export type NameCorrection = {
  heard: string
  correct: string
  hit_count: number
  source: 'seeded' | 'learned'
}

export type SlopReport = {
  clean: string
  violations: string[]
  stdev: number
  passed: boolean
}

export type SafetyResult = {
  tier: SafetyTier
  category: SafetyCategory
  /** Fixed template copy for tier 2. NEVER model-generated. */
  templateKey: string | null
}

/** Context the question selector reads. Never fabricated — all from real rows. */
export type LetterPromptContext = {
  babyName: string | null
  ageInMonths: number | null
  ageInWeeks: number | null
  todaysMilestones: Array<{ type: string; note: string | null }>
  todaysCheckin: { sleep_hours: number | null; mood: string | null } | null
  daysSinceLastEntry: number | null
  openThreads: Array<{ entryId: string; text: string; entryDate: string }>
}

export type OpeningPrompt = {
  text: string
  source: 'milestone' | 'checkin' | 'age_band' | 'evergreen' | 'gap_recovery'
  /** Traceable back to the row that produced it. Null for evergreen. */
  sourceRef: string | null
}

/** Back-compat alias. A "Letter" is a JournalEntryRow with entry_kind === 'letter'. */
export type Letter = JournalEntryRow

/** Input for composing a letter from one or more existing logs. */
export type LetterCompositionInput = {
  span: LetterSpan
  /** The log rows being turned into a letter. Never empty. */
  sources: Array<Pick<JournalEntryRow, 'id' | 'entry_date' | 'body' | 'raw_transcript'>>
  voiceProfile: VoiceProfile | null
  babyName: string | null
  ageInMonths: number | null
}

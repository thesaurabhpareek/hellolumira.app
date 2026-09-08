/**
 * ==========================================================================
 *  STOP. READ THIS BEFORE CHANGING ONE WORD IN THIS FILE.
 * ==========================================================================
 *
 *  THIS COPY REQUIRES REVIEW AND WRITTEN SIGN-OFF BY A LICENSED PERINATAL
 *  MENTAL HEALTH CLINICIAN BEFORE LAUNCH. It has not been signed off yet.
 *  Until it has, Letters must not ship to any user (PRD 18.4, 18.7).
 *
 *  NO ONE MAY EDIT, REWORD, TRIM, OR "TIGHTEN" ANYTHING BELOW WITHOUT THAT
 *  SAME REVIEW. Not for tone. Not for brand voice. Not for length. A word
 *  change here is a clinical change, not a copy change.
 *
 *  THIS IS NOT CLINICAL ADVICE, DIAGNOSIS, TREATMENT, OR SCREENING. Lumira
 *  does not assess anyone. This copy exists only to (a) stay out of the way
 *  at tier 0, (b) say one true, ordinary thing at tier 1, and (c) put a
 *  human being one tap away at tier 2.
 *
 *  NEVER MODEL-GENERATED. Every string here is fixed. No runtime model call
 *  may produce, rewrite, summarise, translate, or "personalise" any of it.
 *  That constraint is the entire reason this file exists. If you find
 *  yourself passing these strings to a model, you have broken the feature.
 *
 *  CALIBRATION, IN ONE SENTENCE: tier 1 is the whole game, and treating a
 *  tier 1 disclosure as an emergency is the failure that ends the
 *  relationship and stops the parent ever speaking again (PRD 18.4).
 *
 *  Crisis numbers were verified against primary sources on 2026-09-08; see
 *  `verified` on each resource. RE-VERIFY BEFORE EVERY RELEASE. A wrong
 *  crisis number is worse than no number at all.
 *
 * @module letters/prompts/safety-copy
 * @owner CT4 (content) — file ownership per LETTERS-ENGINEERING-CONTRACT.md 5
 */

import type { SafetyTier } from '@/types/letters'

/**
 * Keys returned by `lib/letters/safety.ts` (BE3) in `SafetyResult.templateKey`.
 * The contract types `templateKey` as `string | null`; this union is the
 * narrowing, not a redefinition.
 */
export type SafetyTemplateKey =
  | 't0.reflect'
  | 't1.intrusive_thoughts'
  | 't1.rage'
  | 't1.bonding_difficulty'
  | 't1.self_criticism'
  | 't1.default'
  | 't1.session_end_offer'
  | 't2.self_harm'
  | 't2.harm_to_child'
  | 't2.psychosis_markers'
  | 't2.default'

/** Where a piece of copy is allowed to appear. The UI must honour this. */
export type SafetySurface =
  /** Tier 0. One line inside the interview turn, before the next question. */
  | 'interview_reflection'
  /** Tier 1. One line inside the interview turn, then the interview continues. */
  | 'interview_normalizer'
  /** Tier 1. Quiet, dismissible, AFTER the entry is saved. Never during. */
  | 'session_end_offer'
  /** Tier 2. Warm inline card. Composition stops. Saving does not. */
  | 'stop_card'

export type CrisisActionKind = 'call' | 'text' | 'chat'

export type CrisisAction = {
  kind: CrisisActionKind
  /** Button label. One tap, no interstitial, no confirmation dialog. */
  label: string
  /** Human-readable number or address shown next to the button. */
  display: string
  href: string
}

export type CrisisResource = {
  id: string
  name: string
  /** Plain-language hours. Never round this up. */
  availability: string
  actions: readonly CrisisAction[]
  /** Honest limitation, shown to the parent. Null when there is none. */
  caveat: string | null
  verified: { on: string; source: string }
}

export type SafetyCopy = {
  key: SafetyTemplateKey
  tier: SafetyTier
  surface: SafetySurface
  /**
   * Interchangeable variants. Exactly ONE is shown. Variants exist so a
   * parent who discloses the same thing twice in a week is not answered by
   * a recording. They are not a sequence and must never be concatenated.
   */
  lines: readonly string[]
  /** Label for the affirmative action, when the surface has one. */
  actionLabel: string | null
  /** Every surface that shows resources must be dismissible in one tap. */
  dismissLabel: string | null
  resources: readonly CrisisResource[]
}

// ---------------------------------------------------------------------------
// Crisis resources. VERIFIED 2026-09-08. Re-verify every release.
// ---------------------------------------------------------------------------

const LIFELINE_988: CrisisResource = {
  id: 'lifeline-988',
  name: '988 Suicide & Crisis Lifeline',
  availability: 'Free and confidential, 24 hours a day',
  actions: [
    { kind: 'call', label: 'Call 988', display: '988', href: 'tel:988' },
    { kind: 'text', label: 'Text 988', display: '988', href: 'sms:988' },
    {
      kind: 'chat',
      label: 'Chat online',
      display: 'chat.988lifeline.org',
      href: 'https://chat.988lifeline.org/',
    },
  ],
  caveat: null,
  verified: { on: '2026-09-08', source: 'https://988lifeline.org/talk-to-someone-now/' },
}

/**
 * Perinatal-specific AND staffed around the clock. 988 is the crisis line;
 * this is the one a new mother is most likely to actually call, because it
 * is answered by people who do only this.
 */
const MATERNAL_HOTLINE: CrisisResource = {
  id: 'national-maternal-mental-health-hotline',
  name: 'National Maternal Mental Health Hotline',
  availability: 'Free and confidential, 24 hours a day, English and Spanish',
  actions: [
    {
      kind: 'call',
      label: 'Call 1-833-852-6262',
      display: '1-833-TLC-MAMA (1-833-852-6262)',
      href: 'tel:+18338526262',
    },
    {
      kind: 'text',
      label: 'Text 1-833-852-6262',
      display: '1-833-852-6262',
      href: 'sms:+18338526262',
    },
  ],
  caveat: null,
  verified: {
    on: '2026-09-08',
    source: 'https://mchb.hrsa.gov/national-maternal-mental-health-hotline',
  },
}

/**
 * PSI is support and referral, NOT a crisis line, and it calls back inside
 * business hours. Saying so is not a hedge — a parent in crisis who leaves a
 * message and hears nothing for six hours is worse off than one who was told
 * the truth and called 988 instead.
 */
const PSI_HELPLINE: CrisisResource = {
  id: 'psi-helpline',
  name: 'Postpartum Support International HelpLine',
  availability: 'Calls and texts returned daily, 8am-11pm ET, English and Spanish',
  actions: [
    {
      kind: 'call',
      label: 'Call 1-800-944-4773',
      display: '1-800-944-4773',
      href: 'tel:+18009444773',
    },
    {
      kind: 'text',
      label: "Text 'Help' to 800-944-4773",
      display: "Text 'Help' to 800-944-4773 · en Espanol 971-203-7773",
      href: 'sms:+18009444773?&body=Help',
    },
  ],
  caveat: 'This is a support and referral line, not an emergency line.',
  verified: { on: '2026-09-08', source: 'https://postpartum.net/get-help/psi-helpline/' },
}

const TIER_2_RESOURCES: readonly CrisisResource[] = [
  LIFELINE_988,
  MATERNAL_HOTLINE,
  PSI_HELPLINE,
]

/** Tier 1 never shows 988. Offering a suicide line for an intrusive thought
 *  is the exact miscalibration PRD 18.4 forbids. */
const TIER_1_RESOURCES: readonly CrisisResource[] = [MATERNAL_HOTLINE, PSI_HELPLINE]

// ---------------------------------------------------------------------------
// TIER 0 — distress. Reflect it. Then ask the next question. Nothing else.
// No resources. No tone shift. No cards. The parent said their day was hard;
// the correct response is to have heard it, not to do something about it.
// ---------------------------------------------------------------------------

const T0_REFLECT: SafetyCopy = {
  key: 't0.reflect',
  tier: 0,
  surface: 'interview_reflection',
  lines: [
    'That sounds like a long one.',
    'That was a lot of day.',
    "Sounds like today took most of what you had.",
    'Okay. That was a hard one.',
    "That's a lot to be carrying at this hour.",
    'Heavy day.',
  ],
  actionLabel: null,
  dismissLabel: null,
  resources: [],
}

// ---------------------------------------------------------------------------
// TIER 1 — common and benign. ONE normalizing sentence containing a real
// fact, then the interview CONTINUES in the same breath. No card, no modal,
// no colour change, no pause, no clinical register.
// ---------------------------------------------------------------------------

const T1_INTRUSIVE_THOUGHTS: SafetyCopy = {
  key: 't1.intrusive_thoughts',
  tier: 1,
  surface: 'interview_normalizer',
  lines: [
    "Those flashes turn up for almost every new parent, and the fact that this one horrified you is exactly what it is — the opposite of something you'd ever want.",
    "That kind of thought is one of the most common and least admitted parts of the first year, and it arrives uninvited in parents who'd never act on it.",
    "Nearly every parent gets one of those at some point, and being appalled by it is the whole tell — it's not a wish, it's the opposite of one.",
  ],
  actionLabel: null,
  dismissLabel: null,
  resources: [],
}

const T1_RAGE: SafetyCopy = {
  key: 't1.rage',
  tier: 1,
  surface: 'interview_normalizer',
  lines: [
    'Rage shows up in this year far more than anyone says out loud, and it usually tracks how depleted you are rather than how you feel about her.',
    "That flash of fury is one of the most common things about a first year and one of the least said, and it tends to run on no sleep more than on anything else.",
  ],
  actionLabel: null,
  dismissLabel: null,
  resources: [],
}

const T1_BONDING_DIFFICULTY: SafetyCopy = {
  key: 't1.bonding_difficulty',
  tier: 1,
  surface: 'interview_normalizer',
  lines: [
    "Plenty of parents never get the rush everyone promised at the start — for most of them it builds quietly over months instead of arriving all at once.",
    'Not feeling it yet is far more ordinary than the cards suggest, and it more often grows slowly than switches on.',
  ],
  actionLabel: null,
  dismissLabel: null,
  resources: [],
}

const T1_SELF_CRITICISM: SafetyCopy = {
  key: 't1.self_criticism',
  tier: 1,
  surface: 'interview_normalizer',
  lines: [
    "That's one of the most-said sentences of the first year, and it turns up most in the parents paying the closest attention.",
    'Almost every parent says that to themselves in the first year, and it says more about how much you are watching than about how you are doing.',
  ],
  actionLabel: null,
  dismissLabel: null,
  resources: [],
}

const T1_DEFAULT: SafetyCopy = {
  key: 't1.default',
  tier: 1,
  surface: 'interview_normalizer',
  lines: [
    "That's a much more common part of this year than it feels like from the inside of it.",
    'More parents land exactly there than ever say so.',
  ],
  actionLabel: null,
  dismissLabel: null,
  resources: [],
}

/**
 * The soft line at the END of the session, after the entry is saved.
 * A single quiet line with a link and a dismiss. NOT a modal. NOT red. NOT
 * during the entry. NOT repeated every night — the caller rate-limits this.
 */
const T1_SESSION_END_OFFER: SafetyCopy = {
  key: 't1.session_end_offer',
  tier: 1,
  surface: 'session_end_offer',
  lines: [
    'If you ever want to say any of this to a person instead of a page, there are people who do only this.',
    "Whenever you want to say some of this out loud to someone, there are people who do only this. No rush, and no reason it has to be tonight.",
  ],
  actionLabel: 'Who I could talk to',
  dismissLabel: 'Not now',
  resources: TIER_1_RESOURCES,
}

// ---------------------------------------------------------------------------
// TIER 2 — active risk. Warm, direct, short. Composition stops; SAVING DOES
// NOT. Nothing is sent to anyone: no partner, no contact, no clinician.
// The parent's words are never edited, refused, or softened (PRD 18.4).
// ---------------------------------------------------------------------------

const T2_SELF_HARM: SafetyCopy = {
  key: 't2.self_harm',
  tier: 2,
  surface: 'stop_card',
  lines: [
    "Thank you for saying that here.\n\nI'm not going to shape tonight into a letter. It's saved exactly as you said it, and nothing has been sent to anyone.\n\nTalk to a person tonight. These are free, confidential, and open right now.",
  ],
  actionLabel: null,
  dismissLabel: 'Close',
  resources: TIER_2_RESOURCES,
}

const T2_HARM_TO_CHILD: SafetyCopy = {
  key: 't2.harm_to_child',
  tier: 2,
  surface: 'stop_card',
  lines: [
    "I'm glad you said that here rather than nowhere.\n\nI'm not going to shape tonight into a letter. It's saved exactly as you said it, and nothing has been sent to anyone.\n\nTalk to a person tonight. The people on these lines have heard this from parents before, and they help them.",
  ],
  actionLabel: null,
  dismissLabel: 'Close',
  resources: TIER_2_RESOURCES,
}

const T2_PSYCHOSIS_MARKERS: SafetyCopy = {
  key: 't2.psychosis_markers',
  tier: 2,
  surface: 'stop_card',
  lines: [
    "Thank you for telling me.\n\nI'm not going to shape tonight into a letter. It's saved exactly as you said it, and nothing has been sent to anyone.\n\nWhat you're describing is urgent and it is treatable, and it needs a person with you tonight — someone you trust nearby, and one of these lines now.",
  ],
  actionLabel: null,
  dismissLabel: 'Close',
  resources: TIER_2_RESOURCES,
}

const T2_DEFAULT: SafetyCopy = {
  key: 't2.default',
  tier: 2,
  surface: 'stop_card',
  lines: [
    "Thank you for saying that here.\n\nI'm not going to shape tonight into a letter. It's saved exactly as you said it, and nothing has been sent to anyone.\n\nTalk to a person tonight. These are free, confidential, and open right now.",
  ],
  actionLabel: null,
  dismissLabel: 'Close',
  resources: TIER_2_RESOURCES,
}

export const SAFETY_COPY: Readonly<Record<SafetyTemplateKey, SafetyCopy>> = {
  't0.reflect': T0_REFLECT,
  't1.intrusive_thoughts': T1_INTRUSIVE_THOUGHTS,
  't1.rage': T1_RAGE,
  't1.bonding_difficulty': T1_BONDING_DIFFICULTY,
  't1.self_criticism': T1_SELF_CRITICISM,
  't1.default': T1_DEFAULT,
  't1.session_end_offer': T1_SESSION_END_OFFER,
  't2.self_harm': T2_SELF_HARM,
  't2.harm_to_child': T2_HARM_TO_CHILD,
  't2.psychosis_markers': T2_PSYCHOSIS_MARKERS,
  't2.default': T2_DEFAULT,
}

const TIER_FALLBACK: Readonly<Record<SafetyTier, SafetyTemplateKey | null>> = {
  0: 't0.reflect',
  1: 't1.default',
  2: 't2.default',
}

export function isSafetyTemplateKey(key: string): key is SafetyTemplateKey {
  return Object.prototype.hasOwnProperty.call(SAFETY_COPY, key)
}

/** Exact lookup. Returns null for an unknown key rather than guessing. */
export function getSafetyCopy(key: string | null): SafetyCopy | null {
  if (key === null || !isSafetyTemplateKey(key)) return null
  return SAFETY_COPY[key]
}

/**
 * Lookup with a tier floor, so an unmapped or misspelled key from the
 * classifier can never leave a tier 2 parent looking at a blank card.
 * Tier 0 deliberately falls back to a reflection and nothing more.
 */
export function resolveSafetyCopy(tier: SafetyTier, key: string | null): SafetyCopy | null {
  const exact = getSafetyCopy(key)
  if (exact !== null && exact.tier === tier) return exact
  const fallbackKey = TIER_FALLBACK[tier]
  return fallbackKey === null ? null : SAFETY_COPY[fallbackKey]
}

/**
 * Deterministic variant choice. Pure: the caller injects the seed (an entry
 * id hash or day index), so the same night always renders the same line and
 * nothing here reads the clock or Math.random.
 */
export function pickSafetyLine(copy: SafetyCopy, seed: number): string {
  const n = copy.lines.length
  if (n === 0) return ''
  const i = ((Math.trunc(seed) % n) + n) % n
  return copy.lines[i] ?? copy.lines[0] ?? ''
}

/** The tier 1 offer must appear after the entry is saved, never inside it. */
export function isAllowedDuringInterview(copy: SafetyCopy): boolean {
  return copy.surface === 'interview_reflection' || copy.surface === 'interview_normalizer'
}

/**
 * Register guardrails. Any string in this file containing one of these has
 * drifted into a clinical or advisory voice and must not ship. Asserted in
 * the QE test for this module.
 */
export const BANNED_SAFETY_PHRASES: readonly string[] = [
  'i am concerned',
  "i'm concerned",
  'we are concerned',
  'sounds serious',
  'that sounds serious',
  'have you considered',
  'you should',
  'you need to',
  'seek professional help',
  'symptoms',
  'diagnos',
  'disorder',
  'mental illness',
  'i understand how you feel',
]

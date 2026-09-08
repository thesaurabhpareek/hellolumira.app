/**
 * @module letters/prompts/age-bands
 * @description Age-banded opening-prompt bank for Letters. Pure data, no logic.
 *   Consumed by `lib/letters/prompt-selection.ts` (BE4) to pick the night's
 *   opening question from `LetterPromptContext` (types/letters.ts).
 *
 * Content position (PRD §16.3, §16.4): the milestone log is the hook, the
 *   texture is the artifact. A dated fact ("first steps: 14 Mar 2026") is the
 *   invitation, never the payload — the payload is the next question. Every
 *   `texturePrompt` in this file asks for what a milestone or a check-in row
 *   cannot hold: what it looked like, what the parent felt, what surprised or
 *   scared them. None restate a fact the app already has structured.
 *
 * Hard exclusion (PRD §6.3): no prompt in this file is, or softens into, an
 *   upward counterfactual, a regret frame, or a day rating ("what could you
 *   have done differently", "how would you rate today", "what would you
 *   change"). That framing produced a short-term distress increase in the
 *   expressive-writing literature (Baikie & Wilhelm 2005) and is documented
 *   as actively harmful to abuse survivors and PTSD veterans — neither of
 *   which this product can screen for at signup. Do not add one back.
 *
 * CDC verification (required before writing, per brief). Fetched directly
 *   from cdc.gov "Learn the Signs. Act Early." on 2026-09-08, one page per
 *   age, post-February-2022 revision (Zubler et al., Pediatrics 149(3),
 *   2022):
 *     - https://www.cdc.gov/act-early/milestones/2-months.html   — smiles; holds head up (tummy time)
 *     - https://www.cdc.gov/act-early/milestones/4-months.html   — holds head steady; NO rolling listed
 *     - https://www.cdc.gov/act-early/milestones/6-months.html   — rolls tummy-to-back (rolling lands at 6mo, confirmed)
 *     - https://www.cdc.gov/act-early/milestones/9-months.html   — sits without support; babbles ("mamamama"/"bababa"); wary of strangers; NO crawling listed (confirmed removed)
 *     - https://www.cdc.gov/act-early/milestones/1-year.html     — pulls to stand; waves bye-bye; calls parent "mama"/"dada"; pincer grasp (thumb + finger)
 *     - https://www.cdc.gov/act-early/milestones/15-months.html  — takes a few steps alone; attempts 1-2 words beyond mama/dada (walking + first-word confirmed at 15mo, not 12mo)
 *     - https://www.cdc.gov/act-early/milestones/2-years.html    — says 2+ words together; runs
 *     - https://www.cdc.gov/act-early/milestones/index.html      — checklist ages: 2, 4, 6, 9, 12, 15, 18, 24, 30, 36, 48, 60mo (15 and 30 confirmed added); criterion is the 75th percentile
 *   All of the above match the brief's claims: 75th-percentile criterion,
 *   checklists added at 15 and 30mo, crawling removed, walking-alone and
 *   first-word moved 12mo -> 15mo, rolling moved 4mo -> 6mo. CDC ages are
 *   used here strictly as prompt timing (when to surface a texture prompt),
 *   never as a scorecard shown to the parent — PRD §16.4.
 *
 * Pronoun note. `LetterPromptContext` (the frozen contract type) exposes
 *   `babyName: string | null` and no pronoun field. Every `texturePrompt`
 *   below is written with singular "they/them" so it is correct for any
 *   baby and never depends on a name being present — satisfies "must work
 *   when the baby's name is unknown" without a per-prompt no-name variant.
 *   The two evergreen prompts are shipped verbatim as specified in the PRD
 *   and the engineering brief, which use "she" (the founder's own daughter
 *   is the product's origin story). Shipping literal "she" to a parent of a
 *   son is a known content gap this file does not have the authority to
 *   fix — see REQUEST below.
 *
 * REQUEST (types/letters.ts, frozen — CT1 cannot edit): `LetterPromptContext`
 *   has no `babyPronouns` field. Recommend adding
 *   `babyPronouns: { subject: string; object: string; possessive: string } | null`
 *   so the two evergreen prompts (and any future pronoun-bearing copy) can
 *   render correctly instead of defaulting to "she" for every family.
 *
 * REQUEST (BE4, lib/letters/prompt-selection.ts): several `milestoneType`
 *   values below are NOT in the existing `MilestoneType` union
 *   (types/app.ts): `first_smile`, `head_control`, `first_solids`,
 *   `babbling`, `stranger_wariness`, `waves`, `two_word_phrase`, `running`.
 *   These are the CDC-anchor milestones PRD §16.4 calls for in the 0-9mo and
 *   16-24mo bands that the app's current milestone taxonomy does not track.
 *   The values that DO exist in `MilestoneType` — `rolling`, `sitting`,
 *   `pulling_to_stand`, `first_word`, `pincer_grip`, `walking`, plus the
 *   pregnancy types `first_scan`, `anatomy_scan`, `first_kick`,
 *   `third_trimester`, `birth_plan_done` — are used as-is and will match
 *   `LetterPromptContext.todaysMilestones[].type` directly. The rest will
 *   never fire until `MilestoneType` is extended or BE4 matches them some
 *   other way (e.g. free-text milestone notes); until then those triggers
 *   are inert and the band still works fine on texture prompts alone.
 */

/** Six CDC-anchored bands plus a pre-birth and a post-24mo edge case. */
export type AgeBandId =
  | 'prebirth'
  | '0-3'
  | '4-6'
  | '7-9'
  | '10-12'
  | '13-15'
  | '16-24'
  | '24-plus'

/** How a band's age range should be interpreted. Only 'range' uses the bounds. */
export type AgeBandBoundary = 'prebirth' | 'range' | 'fallback'

export type TexturePrompt = {
  /** Stable id for analytics and de-duplication. Never shown to the user. */
  id: string
  /** The question as read to / shown to the parent. No {name} token by design — see module doc. */
  text: string
}

export type MilestoneTrigger = {
  /**
   * Matched against `LetterPromptContext.todaysMilestones[].type`.
   * See the REQUEST note above: not every value here exists yet in
   * `types/app.ts` `MilestoneType`.
   */
  milestoneType: string
  /** Internal label only, for logs and the prompt-selection test fixtures. */
  label: string
  /** Contains a literal `{name}` token. Use when `babyName` is non-null. */
  promptWithName: string
  /** No token. Use when `babyName` is null. Written independently, not a mechanical strip. */
  promptNoName: string
}

export type AgeBand = {
  id: AgeBandId
  label: string
  boundary: AgeBandBoundary
  /** Inclusive lower bound in completed months. Null when boundary !== 'range'. */
  minAgeMonths: number | null
  /** Inclusive upper bound in completed months. Null when boundary !== 'range'. */
  maxAgeMonths: number | null
  /** Non-user-facing note on why this band's edges sit where they do. */
  cdcNote: string
  milestoneTriggers: MilestoneTrigger[]
  texturePrompts: TexturePrompt[]
}

export type AgeBandPrompts = {
  /** Shown in every band, in addition to that band's texturePrompts. */
  evergreen: TexturePrompt[]
  bands: Record<AgeBandId, AgeBand>
  /** Display / fallback-search order, oldest-first is wrong on purpose — prebirth leads. */
  bandOrder: AgeBandId[]
}

export const EVERGREEN_PROMPTS: TexturePrompt[] = [
  { id: 'evergreen-remember', text: 'What did she do today that you want to remember?' },
  { id: 'evergreen-feeling', text: 'What were you feeling today?' },
]

const PREBIRTH_BAND: AgeBand = {
  id: 'prebirth',
  label: 'Before birth',
  boundary: 'prebirth',
  minAgeMonths: null,
  maxAgeMonths: null,
  cdcNote: 'No CDC checklist applies before birth. Anchors are pregnancy milestones already in MilestoneType.',
  milestoneTriggers: [
    {
      milestoneType: 'first_scan',
      label: 'First ultrasound',
      promptWithName: 'You saw {name} for the first time today. What did the screen look like?',
      promptNoName: 'You saw them for the first time today. What did the screen look like?',
    },
    {
      milestoneType: 'first_kick',
      label: 'First felt movement',
      promptWithName: 'You felt {name} move today. Where were you when it happened?',
      promptNoName: 'You felt them move today. Where were you when it happened?',
    },
    {
      milestoneType: 'anatomy_scan',
      label: 'Anatomy scan',
      promptWithName: 'You found out more about {name} today. What surprised you?',
      promptNoName: 'You found out more about them today. What surprised you?',
    },
    {
      milestoneType: 'third_trimester',
      label: 'Third trimester start',
      promptWithName: "You're in the final stretch with {name} now. What are you telling yourself right now?",
      promptNoName: "You're in the final stretch now. What are you telling yourself right now?",
    },
    {
      milestoneType: 'birth_plan_done',
      label: 'Birth plan finished',
      promptWithName: 'You made a plan for the day you meet {name}. What matters most to you about it?',
      promptNoName: 'You made a plan for the day you meet them. What matters most to you about it?',
    },
  ],
  texturePrompts: [
    { id: 'prebirth-face', text: 'What do you imagine their face will look like?' },
    { id: 'prebirth-afraid', text: 'What are you most afraid of about the day you meet them?' },
    { id: 'prebirth-tell-someday', text: 'What do you already know you want to tell them, someday?' },
    { id: 'prebirth-surprised', text: 'What has surprised you about being pregnant, or about waiting for them?' },
    { id: 'prebirth-body', text: 'What does your body feel like tonight?' },
    { id: 'prebirth-told', text: "Who have you told, and who are you still holding this from?" },
    { id: 'prebirth-name', text: 'What name are you turning over in your head right now?' },
    { id: 'prebirth-before', text: 'What do you want them to know about the person you were before they arrived?' },
    { id: 'prebirth-waiting', text: "What's the hardest part of waiting?" },
    { id: 'prebirth-laugh', text: 'What made you laugh today?' },
  ],
}

const BAND_0_3: AgeBand = {
  id: '0-3',
  label: '0-3 months',
  boundary: 'range',
  minAgeMonths: 0,
  maxAgeMonths: 3,
  cdcNote: 'CDC 2mo checklist: smiles at people; holds head up (tummy time). 4mo checklist: holds head steady without support. No rolling until 6mo.',
  milestoneTriggers: [
    {
      milestoneType: 'first_smile',
      label: 'First social smile',
      promptWithName: '{name} smiled today. Was it the real one or the gas one?',
      promptNoName: 'They smiled today. Was it the real one or the gas one?',
    },
    {
      milestoneType: 'head_control',
      label: 'Steady head control',
      promptWithName: '{name} held their head up today, steady. What did that look like?',
      promptNoName: 'They held their head up today, steady. What did that look like?',
    },
  ],
  texturePrompts: [
    { id: '0-3-3am-voice', text: 'What does the 3am version of you sound like?' },
    { id: '0-3-who-they-look-like', text: 'Who did they look like today?' },
    { id: '0-3-unexpected-sound', text: "What sound did they make that you didn't expect?" },
    { id: '0-3-cry-tells-you', text: "What does their cry tell you that words couldn't?" },
    { id: '0-3-your-body', text: 'What surprised you about your own body today?' },
    { id: '0-3-middle-of-night', text: "What do you do in the middle of the night that no one else sees?" },
    { id: '0-3-weight-against-you', text: 'What does their weight feel like against you right now?' },
    { id: '0-3-who-helped', text: 'Who came to help today, and who did you wish had?' },
    { id: '0-3-smell', text: "What's a smell from right now you know you'll eventually forget you used to notice?" },
    { id: '0-3-got-right', text: 'What did you get right today, even if it did not feel like it?' },
    { id: '0-3-not-saying', text: "What are you not saying out loud yet?" },
  ],
}

const BAND_4_6: AgeBand = {
  id: '4-6',
  label: '4-6 months',
  boundary: 'range',
  minAgeMonths: 4,
  maxAgeMonths: 6,
  cdcNote: 'CDC 6mo checklist: rolls tummy-to-back (rolling confirmed at 6mo, not 4mo). Solids typically start around 6mo; not a CDC checklist item.',
  milestoneTriggers: [
    {
      milestoneType: 'rolling',
      label: 'Rolling over',
      promptWithName: '{name} rolled over today. Which way did they go?',
      promptNoName: 'They rolled over today. Which way did they go?',
    },
    {
      milestoneType: 'first_solids',
      label: 'First real food',
      promptWithName: '{name} tried real food today. What was the face they made?',
      promptNoName: 'They tried real food today. What was the face they made?',
    },
  ],
  texturePrompts: [
    { id: '4-6-constant-noise', text: "What noise are they making constantly right now?" },
    { id: '4-6-shriek-laugh', text: "What's the thing that makes them shriek with laughter this week?" },
    { id: '4-6-cant-imagine-without', text: "What have you stopped being able to imagine life without?" },
    { id: '4-6-real-laugh', text: 'What does their laugh sound like when it is real, not performed for you?' },
    { id: '4-6-body-change', text: "What's changed about your body that no one warned you about?" },
    { id: '4-6-reach-automatically', text: 'What do you reach for automatically now that you did not a month ago?' },
    { id: '4-6-tell-a-friend', text: "What's the one thing you would tell a friend who is about to have a baby?" },
    { id: '4-6-food-face', text: 'What face did they make at food today?' },
    { id: '4-6-different-now', text: 'What do you do differently now than you did in week one?' },
    { id: '4-6-hardest-hour', text: "What's the hardest hour of your day right now?" },
  ],
}

const BAND_7_9: AgeBand = {
  id: '7-9',
  label: '7-9 months',
  boundary: 'range',
  minAgeMonths: 7,
  maxAgeMonths: 9,
  cdcNote: 'CDC 9mo checklist: sits without support; babbles ("mamamama"/"bababa"); shy/clingy/fearful around strangers. Crawling was removed as a checklist item in the Feb 2022 revision and is not used here as an anchor.',
  milestoneTriggers: [
    {
      milestoneType: 'sitting',
      label: 'Sitting unsupported',
      promptWithName: '{name} sat up on their own today. What were they looking at?',
      promptNoName: 'They sat up on their own today. What were they looking at?',
    },
    {
      milestoneType: 'babbling',
      label: 'Strings of babble',
      promptWithName: '{name} strung a whole run of sounds together today. What did it sound like?',
      promptNoName: 'They strung a whole run of sounds together today. What did it sound like?',
    },
    {
      milestoneType: 'stranger_wariness',
      label: 'Wary of a stranger',
      promptWithName: '{name} was wary of someone new today. Who was it?',
      promptNoName: 'They were wary of someone new today. Who was it?',
    },
  ],
  texturePrompts: [
    { id: '7-9-afraid-of', text: 'What are they afraid of right now?' },
    { id: '7-9-laugh-so-hard', text: 'What makes them laugh so hard it stops?' },
    { id: '7-9-describe-hands', text: 'Describe their hands.' },
    { id: '7-9-see-you-walk-in', text: 'What do they do the second they see you walk in?' },
    { id: '7-9-invented-game', text: "What's the game you did not know you had invented?" },
    { id: '7-9-who-they-reach-for', text: 'Who do they reach for when they are upset, and does it surprise you?' },
    { id: '7-9-swear-never-forget', text: "What do they do now that you swear you will never forget, and probably will?" },
    { id: '7-9-felt-like-parenting', text: 'What did you do today that felt like actual parenting, not just survival?' },
    { id: '7-9-entirely-their-own', text: "What's a sound they make that is entirely their own?" },
    { id: '7-9-still-figuring-out', text: 'What are you still figuring out about them?' },
  ],
}

const BAND_10_12: AgeBand = {
  id: '10-12',
  label: '10-12 months',
  boundary: 'range',
  minAgeMonths: 10,
  maxAgeMonths: 12,
  cdcNote: 'CDC 12mo (1yr) checklist: pulls to stand; waves bye-bye; calls a parent "mama"/"dada" or another special name; picks up small items with thumb and finger (pincer grasp).',
  milestoneTriggers: [
    {
      milestoneType: 'pulling_to_stand',
      label: 'Pulling to stand',
      promptWithName: '{name} pulled themself up to standing today. What did they grab onto?',
      promptNoName: 'They pulled themself up to standing today. What did they grab onto?',
    },
    {
      milestoneType: 'first_word',
      label: 'First special name for a parent',
      promptWithName: '{name} called you something today. What did it sound like?',
      promptNoName: 'They called you something today. What did it sound like?',
    },
    {
      milestoneType: 'waves',
      label: 'Waving bye-bye',
      promptWithName: '{name} waved bye-bye today. Who were they waving at?',
      promptNoName: 'They waved bye-bye today. Who were they waving at?',
    },
    {
      milestoneType: 'pincer_grip',
      label: 'Pincer grasp',
      promptWithName: '{name} picked something up with just two fingers today. What was it?',
      promptNoName: 'They picked something up with just two fingers today. What was it?',
    },
  ],
  texturePrompts: [
    { id: '10-12-opinion', text: "What's their opinion this week — a food they refuse, a person they prefer?" },
    { id: '10-12-scared-of-for-them', text: 'What are you scared of for them right now?' },
    { id: '10-12-door-opens', text: 'What do they do the moment they see the door open?' },
    { id: '10-12-your-habit', text: "What's a habit of yours they have already picked up?" },
    { id: '10-12-almost-said', text: 'What did you almost say out loud to them today, and did not?' },
    { id: '10-12-house-different', text: "What's different about the house now that they can reach things?" },
    { id: '10-12-miss-last-month', text: 'What do you already miss about last month?' },
    { id: '10-12-stubborn-about', text: "What's the thing they are stubborn about?" },
    { id: '10-12-lights-up-for', text: 'Who do they light up for, besides you?' },
    { id: '10-12-not-expect-true', text: 'What did you not expect to be true about parenting by now?' },
  ],
}

const BAND_13_15: AgeBand = {
  id: '13-15',
  label: '13-15 months',
  boundary: 'range',
  minAgeMonths: 13,
  maxAgeMonths: 15,
  cdcNote: 'CDC 15mo checklist: takes a few steps on their own; attempts one or two words beyond "mama"/"dada". Both moved here from the pre-2022 12mo checklist.',
  milestoneTriggers: [
    {
      milestoneType: 'walking',
      label: 'First independent steps',
      promptWithName: '{name} took steps on their own today. What did the room feel like?',
      promptNoName: 'They took steps on their own today. What did the room feel like?',
    },
    {
      milestoneType: 'first_word',
      label: 'First real word',
      promptWithName: '{name} said a new word today. What was it, and who did you call first?',
      promptNoName: 'They said a new word today. What was it, and who did you call first?',
    },
  ],
  texturePrompts: [
    { id: '13-15-room-felt-like', text: 'What did the room feel like when they walked?' },
    { id: '13-15-called-first', text: 'Who did you call first?' },
    { id: '13-15-no-other-baby', text: 'What do they do that no one else’s baby does?' },
    { id: '13-15-word-wrong', text: "What word are they saying wrong right now, on purpose or not?" },
    { id: '13-15-avoiding-place', text: "What's a place you have started avoiding, now that they are mobile?" },
    { id: '13-15-caught-them', text: 'What did you catch them doing right before you caught them?' },
    { id: '13-15-never-thought-say', text: "What's something you say to them now that you never thought you would say?" },
    { id: '13-15-reminds-of-family', text: 'What do they do that reminds you of someone in your family?' },
    { id: '13-15-harder-than-expected', text: 'What is harder than you expected about this age?' },
    { id: '13-15-only-you-thought', text: 'What did you do today that only you would have thought to do for them?' },
  ],
}

const BAND_16_24: AgeBand = {
  id: '16-24',
  label: '16-24 months',
  boundary: 'range',
  minAgeMonths: 16,
  maxAgeMonths: 24,
  cdcNote: 'CDC 24mo (2yr) checklist: says at least two words together ("more milk"); runs.',
  milestoneTriggers: [
    {
      milestoneType: 'two_word_phrase',
      label: 'First two-word phrase',
      promptWithName: '{name} put two words together today. What did they say?',
      promptNoName: 'They put two words together today. What did they say?',
    },
    {
      milestoneType: 'running',
      label: 'First run',
      promptWithName: '{name} ran today. Where were they going?',
      promptNoName: 'They ran today. Where were they going?',
    },
  ],
  texturePrompts: [
    { id: '16-24-calls-wrong', text: 'What do they call things wrong, and will you miss it when they stop?' },
    { id: '16-24-hope-never-inherit', text: 'What do you hope they never inherit from you?' },
    { id: '16-24-full-sentence', text: 'What full sentence surprised you today?' },
    { id: '16-24-negotiating', text: "What are they negotiating with you about now?" },
    { id: '16-24-broken-rule', text: "What's a rule you have already broken that you swore you would not?" },
    { id: '16-24-see-yourself', text: 'What do they do that makes you see your partner, or yourself, in them?' },
    { id: '16-24-tantrum-taught', text: 'What did a tantrum teach you about them this week?' },
    { id: '16-24-no-longer-need', text: "What's something they used to need you for that they do not anymore?" },
    { id: '16-24-say-your-name', text: 'What do you want to remember about how they say your name?' },
    { id: '16-24-already-disappearing', text: 'What version of them do you already know is disappearing?' },
  ],
}

const BAND_24_PLUS: AgeBand = {
  id: '24-plus',
  label: '24+ months',
  boundary: 'fallback',
  minAgeMonths: null,
  maxAgeMonths: null,
  cdcNote: 'No CDC-anchored milestone triggers are defined past 24 months in this brief. CDC checklists continue at 30, 36, 48 and 60mo; add anchors there if the product extends past its 0-12mo core scope.',
  milestoneTriggers: [],
  texturePrompts: [
    { id: '24-plus-different-person', text: 'What did they say today that sounded like a whole different person?' },
    { id: '24-plus-obsessed-with', text: 'What are they obsessed with this week?' },
    { id: '24-plus-explain-first-time', text: 'What did you have to explain to them for the first time?' },
    { id: '24-plus-fight-who-won', text: 'What did you disagree about today, and who won?' },
    { id: '24-plus-on-their-own-now', text: 'What do they do completely on their own now that used to need you?' },
    { id: '24-plus-wish-written-down', text: "What do you wish you had written down from a year ago?" },
    { id: '24-plus-your-phrase', text: 'What phrase of yours did you hear come out of their mouth?' },
    { id: '24-plus-no-answer', text: 'What did they ask you that you did not have an answer for?' },
    { id: '24-plus-proudest', text: 'What are you proudest of them for this week?' },
    { id: '24-plus-tell-later', text: 'What do you already know you will tell them about this age, later?' },
  ],
}

export const AGE_BAND_ORDER: AgeBandId[] = [
  'prebirth',
  '0-3',
  '4-6',
  '7-9',
  '10-12',
  '13-15',
  '16-24',
  '24-plus',
]

export const AGE_BAND_PROMPTS: AgeBandPrompts = {
  evergreen: EVERGREEN_PROMPTS,
  bandOrder: AGE_BAND_ORDER,
  bands: {
    prebirth: PREBIRTH_BAND,
    '0-3': BAND_0_3,
    '4-6': BAND_4_6,
    '7-9': BAND_7_9,
    '10-12': BAND_10_12,
    '13-15': BAND_13_15,
    '16-24': BAND_16_24,
    '24-plus': BAND_24_PLUS,
  },
}

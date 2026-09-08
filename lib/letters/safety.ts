/**
 * @module letters/safety
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │  CLINICAL REVIEW REQUIRED BEFORE LAUNCH.                                 │
 * │                                                                          │
 * │  This module, its tiering rules, AND every piece of copy keyed off its   │
 * │  output MUST be reviewed and signed off by a licensed perinatal mental   │
 * │  health clinician before Letters ships to a single real parent           │
 * │  (PRD §18 preamble, §18.4).                                              │
 * │                                                                          │
 * │  THIS IS NOT A CLINICAL INSTRUMENT. It is not a screener, not a          │
 * │  diagnostic aid, not a risk-assessment tool, and it has no validated     │
 * │  sensitivity or specificity. It is a deterministic string-matching       │
 * │  heuristic whose only job is to decide which piece of pre-written,       │
 * │  human-authored UI copy the interview surface shows next. It will        │
 * │  produce false negatives on real risk and false positives on benign      │
 * │  speech. Nothing downstream may present its output as an assessment of   │
 * │  the parent, and nothing downstream may treat tier 0 as evidence of      │
 * │  safety.                                                                 │
 * └──────────────────────────────────────────────────────────────────────────┘
 *
 * WHAT THIS MODULE MAY DO (PRD §18.4):
 *   Escalate the UI. That is all. It returns a tier, a category, and — at
 *   tier 2 only — the key of a fixed, non-AI copy template.
 *
 * WHAT THIS MODULE MUST NEVER DO:
 *   Refuse, edit, redact, truncate, soften, or withhold what the parent said.
 *   Refusing to record a parent's words is itself a harm. The transcript is
 *   passed through untouched; this function returns metadata about it and
 *   never a modified copy of it. Callers MUST still persist the entry
 *   (tier 2 restricts it to L1 private — it does not block saving).
 *
 * PRIVACY (contract §1.5, PRD §18.4, §19):
 *   The triggering text is NEVER returned and NEVER logged. There is no
 *   console call, no telemetry, and no I/O in this file. Log tier, category,
 *   SAFETY_RULESET_VERSION and a timestamp — nothing else.
 *
 * DETERMINISM:
 *   Pure. No LLM call, no clock, no randomness, no module-level mutable state.
 *   No global (/g) regexes are used, so no `lastIndex` can leak between calls.
 *   The same transcript always yields the same result — this is what makes the
 *   behaviour reviewable by a clinician and reproducible in an incident.
 *
 * ─── THE CENTRAL DISTINCTION: EGO-DYSTONIC vs. STATED INTENT ────────────────
 *
 * Unwanted intrusive thoughts ("what if I dropped her", "I'm terrified I'll
 * hurt her") are near-universal postpartum and are clinically benign when
 * ego-dystonic — that is, when the parent experiences the thought as alien,
 * unwanted and frightening. Treating one as an emergency is the failure mode
 * that ends the relationship and stops the parent ever speaking again. That is
 * tier 1: one normalizing sentence, and the interview CONTINUES. No modal, no
 * red, no clinical voice.
 *
 * Stated intent ("I want to hurt her") is the parent expressing a wish or a
 * plan. That is tier 2: composition stops and a fixed template is shown.
 *
 * The linguistic signal we key on is EMBEDDING. In an ego-dystonic report, the
 * harm clause is the *complement* of a fear/hypothetical predicate:
 *     [I'm terrified] that [I might hurt her]
 *     [what if]           [I dropped her]
 *     [I keep imagining]  [dropping her]
 * In stated intent, the harm clause is the *matrix* clause and carries a
 * volitional verb:
 *     [I want to hurt her]      [I'm going to hurt her]
 *
 * So the rule is positional, not bag-of-words: an ego-dystonic marker demotes a
 * harm clause only when it directly embeds it — i.e. it sits immediately before
 * the clause with nothing but function words / hedges in between, or the marker
 * ("never", "keep thinking") sits inside the clause itself. A fear word floating
 * elsewhere in a long run-on sentence does NOT demote. This is deliberately
 * conservative: "I'm scared about money and I want to hurt her" stays tier 2.
 *
 * ─── ASYMMETRY: SELF-HARM IS NEVER DEMOTED ─────────────────────────────────
 *
 * Ego-dystonic framing demotes CHILD-directed harm only. Self-directed harm
 * ("I'm scared I might hurt myself") always resolves to tier 2. Two reasons:
 *   1. Fear of one's own suicidality is itself a support-warranting signal.
 *   2. The tier 2 response is asymmetric in cost. For self-harm it is a warm
 *      offer of a number to call — proportionate even when over-triggered. For
 *      child-directed content it carries an accusatory implication ("we think
 *      you might hurt your baby") that is uniquely destructive to a parent
 *      reporting an intrusive thought. So we err high on self, and we err
 *      toward *correct framing* on the child.
 *
 * ─── FALSE-POSITIVE CONTROL ────────────────────────────────────────────────
 *
 * Trigger words are ordinary English. "She killed that nap", "I'm dying of
 * tiredness", "the baby dropped her toy", "I could kill my husband", "I hurt
 * her feelings" must all stay at tier 0/1. Three defences:
 *   1. Every harm clause requires an explicit first-person subject `I` and a
 *      closed vocabulary of auxiliaries between subject and verb — so a
 *      third-person subject ("the baby dropped…", "she killed…") never matches.
 *   2. An object exclusion list ("her feelings", "her toy", "that nap").
 *   3. A hyperbole class: verbs with common idiomatic use ("I could kill him",
 *      "I could have strangled him") cap at tier 1 when the object is a bare
 *      pronoun, but not when the object is explicitly the baby.
 *
 * ─── AMBIGUITY POLICY ──────────────────────────────────────────────────────
 *
 * Between "nothing" and "something", and between tier 0 and tier 1, ambiguity
 * resolves UP: a flag is cheap, a miss is not. Between tier 1 and tier 2 the
 * rule is evidential rather than directional, because both errors are serious
 * harms: an explicit ego-dystonic frame demotes to 1; a bare aggressive
 * hypothetical with no frame at all escalates to 2.
 *
 * @see docs/Lumira-Letters-PRD.md §18.4 (escalation design), §18.7 (ranked exposure)
 * @see docs/LETTERS-ENGINEERING-CONTRACT.md §1, §2
 */

import type { SafetyResult, SafetyTier, SafetyCategory } from '@/types/letters'

/**
 * Ruleset identity. Log this alongside tier so an escalation can be replayed
 * against the exact rules that produced it (PRD §18.4: "log tier, timestamp,
 * model version"). Bump on ANY change to patterns or precedence, and re-run
 * clinician review.
 */
export const SAFETY_RULESET_VERSION = 'letters-safety-r1'

/**
 * Keys for the FIXED, HUMAN-AUTHORED tier 2 templates. Never model-generated.
 * The copy behind these keys is owned by lane CT4 (`lib/letters/prompts/safety-copy.ts`).
 *
 * Tier 0 and tier 1 return `templateKey: null` BY DESIGN. A non-null
 * templateKey means, and only ever means, "stop composition and show the fixed
 * crisis template". Consumers may branch on `templateKey !== null` safely.
 * Tier 1 copy is selected from `category` instead — deliberately, so that a
 * downstream `if (safety.templateKey)` can never accidentally show a crisis
 * modal to a parent reporting an ordinary intrusive thought.
 */
export const TIER2_TEMPLATE_KEYS: Readonly<Record<'self_harm' | 'harm_to_child' | 'psychosis', string>> =
  Object.freeze({
    self_harm: 'letters.safety.tier2.self_harm',
    harm_to_child: 'letters.safety.tier2.harm_to_child',
    psychosis: 'letters.safety.tier2.psychosis',
  })

/** Upper bound on scanned characters. Far above any realistic nightly transcript
 *  (~2–5 minutes of speech ≈ 3k chars). Present only as a DoS guard; scanning is
 *  linear. Truncation would be a miss, so this is set high on purpose. */
const MAX_SCAN_CHARS = 500_000

const NO_FINDING: SafetyResult = Object.freeze({ tier: 0, category: 'none', templateKey: null })

function make(tier: SafetyTier, category: SafetyCategory, templateKey: string | null): SafetyResult {
  return { tier, category, templateKey }
}

// ── Normalisation ──────────────────────────────────────────────────────────
// Speech-to-text output is lowercase-ish, lightly punctuated and full of curly
// apostrophes. Normalise so patterns can be written once, in plain lowercase.
// NOTE: this normalised copy is local to the call and is never returned.

function normalize(raw: string): string {
  return raw
    .normalize('NFKC')
    .replace(/[\u2018\u2019\u02bc\u201b`\u00b4]/g, "'") // curly / grave apostrophes
    .replace(/[\u200b-\u200d\ufeff]/g, '') // zero-width junk
    .replace(/[\u2013\u2014]/g, ' ') // en/em dash -> space
    .toLowerCase()
    .replace(/[ \t]+/g, ' ')
}

/**
 * Split into scoring units on strong terminators only. We deliberately do NOT
 * split on "and"/"but": dictated speech runs on, and splitting a coordinated
 * clause would strip the fear frame off its own harm clause
 * ("I keep thinking what if I dropped her and hurt her") and escalate an
 * intrusive thought to tier 2.
 */
function segment(text: string): string[] {
  return text
    .split(/[.!?;\n\r]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

// ── Shared clause machinery ────────────────────────────────────────────────

/** Closed auxiliary/hedge vocabulary permitted between the subject `I` and the
 *  harm verb. Closed on purpose: an open `\w+` gap would let unrelated content
 *  ("I think she might hurt her") masquerade as first-person. Contains no
 *  adjectives, so fear words can never be swallowed as auxiliaries. */
const AUX = [
  'might', 'may', 'could', 'would', 'will', 'never', 'ever', 'just', 'actually',
  'accidentally', 'somehow', 'literally', 'really', 'almost', 'nearly', 'end', 'up',
  'going', 'to', 'gonna', 'want', 'wanna', 'wanted', 'need', 'needed', 'plan',
  'planning', 'planned', 'intend', 'feel', 'like', 'have', 'had', 'been', 'am', 'be',
  'keep', 'kept', 'stop', 'thinking', 'imagining', 'picturing', 'seeing', 'about', 'a', 'one', 'day', 'someday',
  'sometimes', 'maybe', 'probably', 'honestly', 'even', 'sort', 'kind', 'of', 'so',
]

/** Bare pronoun objects. Ambiguous: may refer to the baby, a partner, anyone. */
const OBJ_PRONOUN = "(?:her|him|them)"
/** Unambiguous references to the child. */
const OBJ_BABY = "(?:the baby|my baby|our baby|the little one|the wee one|my (?:daughter|son|child|girl|boy))"
const OBJ_ANY = `(?:${OBJ_PRONOUN}|${OBJ_BABY})`

/** Ordinary-English objects that make a "harm" verb innocent. */
const OBJ_EXCLUDE =
  "(?!\\s*(?:feelings?|pride|ego|confidence|toys?|rattle|bottle|dummy|nap|naps|sleep|routine|chances?|point|case|arm|arms|leg|legs|head|hand|hands|bum|bottom|nappy|diaper|back|hair|gums?|feed|schedule|mood|day|birthday|milk|milestones?|off|up|in the air|around|awake|a party|a birthday|to sleep)\\b)"

const HARM_SUBJECT = "\\bi\\s*(?:'m|'ll|'d|'ve)?\\s*"

/** Verb classes. The class decides what a *bare hypothetical* (no fear frame)
 *  means, which is the only place the three differ. */
const VERB_ACCIDENT =
  "drop|drops|dropped|dropping|fall on|fell on|falling on|trip over|tripped over|roll onto|rolled onto|roll on|squash|squashed|squashing|crush|crushed|crushing"
/** Verbs with common hyperbolic use in ordinary speech ("I could kill him"). */
const VERB_HYPERBOLE =
  "kill|kills|killed|killing|murder|murdered|murdering|strangle|strangled|strangling|throttle|throttled|slap|slapped|slapping|smack|smacked|smacking|hit|hits|hitting|punch|punched|throw|threw|throwing|chuck|chucked"
/** Verbs with essentially no innocent hyperbolic use toward an infant. */
// NOTE: "squeeze" and "starve" are deliberately ABSENT. "I want to squeeze her"
// is affectionate and "I feel like I'm starving her" is a low-supply feeding
// worry; both would have produced tier 2 on entirely benign speech.
const VERB_HARD =
  "hurt|hurts|hurting|harm|harms|harming|smother|smothered|smothering|suffocate|suffocated|suffocating|drown|drowned|drowning|shake|shakes|shook|shaking"

type VerbClass = 'accident' | 'hyperbole' | 'hard'

function clauseRe(verbs: string): RegExp {
  return new RegExp(
    `${HARM_SUBJECT}(?:(?:${AUX.join('|')})\\s+){0,6}(?:${verbs})\\s+${OBJ_ANY}\\b${OBJ_EXCLUDE}`
  )
}

const CLAUSE_PATTERNS: ReadonlyArray<{ re: RegExp; klass: VerbClass }> = Object.freeze([
  { re: clauseRe(VERB_HARD), klass: 'hard' },
  { re: clauseRe(VERB_HYPERBOLE), klass: 'hyperbole' },
  { re: clauseRe(VERB_ACCIDENT), klass: 'accident' },
  // Multi-word harm phrases whose object is embedded in the phrase itself.
  {
    re: new RegExp(
      `${HARM_SUBJECT}(?:(?:${AUX.join('|')})\\s+){0,6}(?:put(?:ting)? a pillow over|hold(?:ing)? (?:her|him) under|held (?:her|him) under|leave (?:her|him) in the (?:car|bath)|leaving (?:her|him) in the (?:car|bath))`
    ),
    klass: 'hard',
  },
])

/** Volitional markers — the parent stating a wish, plan or decision. */
const INTENT_MARKER =
  /\b(?:want(?:ed)?\s+to|wanna|need\s+to|plan(?:ning|ned)?\s+to|intend\s+to|going\s+to|gonna|feel\s+like|have\s+a\s+plan)\b|\bi'(?:ll|m going)\b|\bi\s+will\b/
/** Hypothetical/modal markers — the parent describing a possibility. */
const MODAL_MARKER = /\b(?:might|may|could|would)\b|\bi'd\b/

/**
 * Markers that can appear INSIDE the harm clause and mark it ego-dystonic.
 * "I would never hurt her" and "I keep thinking about hurting her" both embed
 * the harm under a marker the clause regex swallows, so a before-the-clause
 * check alone would miss them.
 */
const SPAN_EGO_DYSTONIC = /\bnever\b|\b(?:keep|kept)\s+(?:thinking|imagining|picturing|seeing)\b/

/**
 * An explicit disavowal anywhere in the same sentence
 * ("I want to throw her out the window some nights — I would never do it").
 * This is the canonical way a parent verbalises an intrusive thought while
 * showing insight into it, and it is a tier 1 disclosure, not a stated plan.
 * JUDGEMENT CALL, flagged for clinician review: it is the one place where a
 * volitional surface form is demoted by something that does not embed it.
 * Scoped to the sentence, and it never applies to self-harm.
 */
const DISAVOWAL =
  /\bi\s+(?:would|'d|could)\s+never\b|\bi\s+would\s+n[o']?t\s+ever\b|\bi\s+never\s+would\b|\bi\s+wouldn'?t\s+(?:actually|ever|really)\b/

/** Ego-dystonic predicates that embed a following harm clause. */
const EGO_DYSTONIC_LEADS: readonly string[] = Object.freeze([
  "what if",
  "what would happen if",
  "i(?:'m| am|m)?\\s*(?:so |really |just |always |a bit |constantly )*(?:scared|afraid|terrified|frightened|worried|petrified|panicked|anxious)(?:\\s+(?:that|of|about|i))?",
  "i(?:'ve| have)\\s+been\\s+(?:scared|afraid|terrified|worried)(?:\\s+(?:that|of|about))?",
  "(?:it|that|this|the thought|the idea)\\s+(?:scares|frightens|terrifies|freaks)\\s+me(?:\\s+out)?",
  "i\\s+(?:keep|kept)\\s+(?:thinking|imagining|picturing|seeing|worrying)(?:\\s+about)?",
  "i\\s+can'?t\\s+stop\\s+(?:thinking|imagining|picturing|worrying)(?:\\s+about)?",
  "i\\s+(?:had|have|get|keep having|kept having)\\s+(?:a|this|these|those)?\\s*(?:horrible|awful|terrible|dark|scary|intrusive|disturbing|violent|weird)?\\s*(?:thought|thoughts|image|images|flash|flashes)(?:\\s+(?:about|that|of))?",
  "intrusive\\s+thoughts?(?:\\s+(?:about|that|of))?",
  "(?:horrible|awful|terrible|dark|scary|disturbing|violent)\\s+thoughts?(?:\\s+(?:about|that|of))?",
  "the\\s+(?:thought|idea|image|picture)\\s+of",
  "i\\s+(?:would|'d|d)\\s+never",
  "i\\s+don'?t\\s+want\\s+to\\s+but",
  "god forbid",
  "the\\s+fear\\s+that",
  "i\\s+worry(?:\\s+(?:that|about))?",
])

/** Function words / hedges permitted between an ego-dystonic lead and the harm
 *  clause it embeds. TIGHT excludes coordinators, so "I'm scared AND I want to
 *  hurt her" is NOT demoted. */
const BRIDGE_TIGHT_TOKENS = [
  'that', 'if', 'when', 'i', "i'm", 'im', "i'll", 'ill', "i'd", 'id', "i've", 'ive',
  'am', 'will', 'might', 'may', 'could', 'would', 'going', 'gonna', 'to', 'one',
  'day', 'some', 'someday', 'sometimes', 'somehow', 'maybe', 'accidentally', 'by',
  'accident', 'just', 'actually', 'really', 'ever', 'even', 'end', 'up', 'literally',
  'a', 'the', 'my', 'of', 'it', 'this', 'nearly', 'almost', 'always', 'about',
]
/** LOOSE additionally allows coordinators. Used ONLY to demote modal/hypothetical
 *  clauses, never volitional ones. */
const BRIDGE_LOOSE_TOKENS = [...BRIDGE_TIGHT_TOKENS, 'and', 'but', 'then', 'so', 'because', 'cos', 'cause']

function bridgeSource(tokens: readonly string[]): string {
  return `(?:[\\s,]*(?:${tokens.join('|')})\\b){0,10}[\\s,]*$`
}

function buildLeadRegexes(tokens: readonly string[]): readonly RegExp[] {
  const bridge = bridgeSource(tokens)
  return Object.freeze(EGO_DYSTONIC_LEADS.map((lead) => new RegExp(`(?:${lead})${bridge}`)))
}

const LEADS_TIGHT = buildLeadRegexes(BRIDGE_TIGHT_TOKENS)
const LEADS_LOOSE = buildLeadRegexes(BRIDGE_LOOSE_TOKENS)

function hasLeadBefore(before: string, leads: readonly RegExp[]): boolean {
  for (const re of leads) {
    if (re.test(before)) return true
  }
  return false
}

/** Transcript-level evidence that the parent is explicitly narrating unwanted
 *  thoughts. Demotes a later bare modal clause whose fear frame sat in an
 *  earlier sentence ("I get these awful intrusive thoughts. I might smother her."). */
const INTRUSIVE_CONTEXT =
  /\bintrusive thoughts?\b|\b(?:horrible|awful|terrible|dark|scary|disturbing|violent)\s+thoughts?\b|\bthoughts?\s+i\s+can'?t\s+(?:stop|shake|get rid of)\b|\bpops?\s+into\s+my\s+head\b/

// ── Tier 2: self-harm ──────────────────────────────────────────────────────
// Never demoted. See the asymmetry note in the header.

/** Idiomatic self-reproach: "I could kill myself for forgetting her bottle."
 *  Scrubbed before self-harm matching. The scrubbed copy is local and discarded. */
const SELF_HARM_IDIOM =
  /\b(?:could|coulda|could'?ve|could have|nearly|almost|literally)\s+(?:have\s+)?kill(?:ed)?\s+myself\s+(?:for|when|over|about|because|the way)\b/

const SELF_HARM_PATTERNS: readonly RegExp[] = Object.freeze([
  /\bkill(?:ing)?\s+myself\b/,
  /\bend(?:ing)?\s+(?:my\s+life|it\s+all)\b/,
  /\btak(?:e|ing)\s+my\s+own\s+life\b/,
  /\b(?:hurt|harm|cut|cutting|hurting|harming)\s+myself\b/,
  /\boff\s+myself\b/,
  /\bhang\s+myself\b/,
  /\bthrow(?:ing)?\s+myself\s+(?:off|under|in front of)\b/,
  /\bsuicid(?:e|al)\b/,
  /\boverdos(?:e|ing)\b/,
  /\btake\s+(?:all\s+)?(?:the|my)\s+pills\b/,
  /\bwant(?:ed)?\s+to\s+die\b/,
  /\bwish(?:ed)?\s+i\s+(?:was|were|wasn'?t|weren'?t)\s+(?:dead|here|alive|around|born)\b/,
  /\bbetter\s+off\s+(?:dead|without\s+me)\b/,
  /\bi\s+don'?t\s+want\s+to\s+(?:be\s+here|be\s+alive|exist|wake\s+up)\b/,
  /\bi\s+(?:want|wanted|wish|hope)\w*\s+(?:to\s+)?(?:i\s+)?(?:could\s+)?(?:just\s+)?(?:go\s+to\s+sleep\s+and\s+)?(?:not|never)\s+wake\s+up\b/,
  // "I want to disappear" — passive ideation, unless qualified by a duration
  // ("disappear for a day"), which is ordinary exhaustion talk.
  /\bwant(?:ed)?\s+to\s+disappear\b(?!\s+for\s+(?:a\s+(?:day|week|weekend|bit|while|minute|moment|hour)|an\s+hour|\d|five|ten|twenty|thirty))/,
])

function isSelfHarm(sentence: string): boolean {
  const scrubbed = sentence.replace(SELF_HARM_IDIOM, ' ')
  for (const re of SELF_HARM_PATTERNS) {
    if (re.test(scrubbed)) return true
  }
  return false
}

// ── Tier 2: psychosis markers ──────────────────────────────────────────────
// Deliberately narrow and therefore low-recall: postpartum psychosis rarely
// self-reports in these words, and every wider pattern we tried produced
// unacceptable false positives on affectionate hyperbole ("she's a little
// devil", "the voices in my head telling me I'm a bad mum"). Command-hallucination
// phrasing requires an imperative complement ("telling me TO ..."). Low recall
// here is accepted because tier 2 is a UI escalation, not a clinical screen.

const PSYCHOSIS_PATTERNS: readonly RegExp[] = Object.freeze([
  /\b(?:the|this|my)\s+baby\s+(?:is\s*not|isn'?t)\s+(?:mine|my\s+baby|real|human)\b/,
  /\b(?:she|he)\s+(?:is\s*not|isn'?t)\s+(?:really\s+)?(?:mine|my\s+(?:baby|daughter|son|child))\b/,
  /\b(?:they|someone|somebody)\s+(?:swapped|switched|replaced|took)\s+(?:her|him|my\s+baby|the\s+baby)\b/,
  /\bvoices?\s+(?:are\s+)?(?:telling|told|tell)\s+me\s+to\b/,
  /\b(?:i\s+)?(?:hear|hearing|keep hearing)\s+voices\b/,
  /\bi'?m\s+hallucinating\b/,
  /\bseeing\s+things\s+that\s+(?:are\s*not|aren'?t)\s+(?:really\s+)?there\b/,
  /\b(?:the\s+baby|she|he)\s+(?:is|'s)\s+possessed\b/,
])

function isPsychosis(sentence: string): boolean {
  for (const re of PSYCHOSIS_PATTERNS) {
    if (re.test(sentence)) return true
  }
  return false
}

// ── Tier 1: non-clause patterns ────────────────────────────────────────────

/** Narrated unwanted thoughts with no explicit harm clause. */
const INTRUSIVE_PATTERNS: readonly RegExp[] = Object.freeze([
  /\bintrusive thoughts?\b/,
  /\b(?:horrible|awful|terrible|dark|scary|disturbing|violent)\s+thoughts?\b/,
  /\bthoughts?\s+i\s+can'?t\s+(?:stop|shake|get rid of)\b/,
  /\b(?:image|picture|thought)\s+(?:that\s+)?(?:keeps?\s+)?pop(?:s|ping|ped)?\s+into\s+my\s+head\b/,
  /\b(?:keep|kept|can'?t stop)\s+(?:imagining|picturing|seeing)\s+(?:\w+\s+){0,3}?(?:dropping|falling|dying|dead|drowning|choking|hurt|something (?:bad|terrible|awful|happening))/,
  /\bwhat if something (?:bad |terrible |awful )?happen(?:s|ed)\s+to\s+(?:her|him|the baby|my baby)\b/,
  /\bthe\s+(?:thought|idea|image)\s+of\s+(?:\w+\s+){0,3}?(?:dropping|hurting|smothering|drowning|shaking|losing|harming)\b/,
]);

/** Relational tier 1: no bonding, self-blame, rage toward the baby.
 *  All three map to `bonding_difficulty` — see the category note in classify(). */
const BONDING_PATTERNS: readonly RegExp[] = Object.freeze([
  /\bi'?m\s+(?:such\s+)?(?:a|the)\s+(?:bad|terrible|awful|horrible|useless|rubbish|shit|shitty|failure of a)\s+(?:mother|mom|mum|mummy|mommy|dad|father|parent)\b/,
  /\bi\s+am\s+a\s+bad\s+(?:mother|mom|mum|dad|father|parent)\b/,
  /\bworst\s+(?:mother|mom|mum|dad|father|parent)\b/,
  /\bi'?m\s+failing\s+(?:her|him|them|as\s+a\s+(?:mother|mom|mum|dad|father|parent))\b/,
  /\bi\s+don'?t\s+(?:feel\s+(?:like\s+)?(?:a\s+)?(?:bond|bonded|connected|connection|attached)|feel\s+anything\s+(?:for|when|towards)|love\s+(?:her|him|the baby|my baby))\b/,
  /\bhaven'?t\s+bonded\b|\bno\s+bond\s+with\b|\bthere'?s\s+no\s+bond\b/,
  /\bi\s+(?:feel|felt)\s+nothing\s+(?:when|for|towards|toward|around|looking)\b/,
  /\bstill\s+don'?t\s+feel\s+like\s+(?:her|his|a)\s+(?:mother|mum|mom|dad|father|parent)\b/,
  /\bi\s+(?:resent|regret)\s+(?:her|him|them|this|the baby|my baby|having\s+(?:her|him|a baby|kids|children))\b/,
  /\bwish\s+i\s+(?:had\s*n[o']?t|hadn'?t|never)\s+(?:had|done)\b/,
  /\bi\s+hate\s+(?:being\s+a\s+(?:mother|mom|mum|dad|father|parent)|motherhood|fatherhood|being\s+her\s+(?:mum|mom|mother))\b/,
  /\b(?:blind|so much|such|pure|white hot)\s+rage\b|\bfilled\s+with\s+rage\b|\brage\s+(?:i|that i)\s+(?:didn'?t|never|don'?t)\b/,
  /\bi\s+(?:lost\s+(?:my\s+temper|it)|screamed|shouted|yelled)\s+(?:with|at|in)\s+(?:her|him|the baby|my baby)\b/,
  /\bi\s+wanted\s+to\s+scream\s+at\s+(?:her|him|the baby|my baby)\b/,
])

// ── Tier 0: distress ───────────────────────────────────────────────────────
// Informational only. PRD §18.4: "Reflect it in the interview. Nothing else."
// No resource cards, no tone shift. Consumers must not render anything new for
// tier 0 — the category exists so the interview can acknowledge a hard day.

const DISTRESS_PATTERNS: readonly RegExp[] = Object.freeze([
  /\b(?:tired|tiredness|exhausted|exhaustion|knackered|shattered|wrecked|drained|wiped out|burnt out|burned out|running on empty)\b/,
  /\b(?:didn'?t sleep|barely slept|no sleep|haven'?t slept|up all night|awake all night)\b/,
  /\b(?:i cried|crying|in tears|sobbed|sobbing|broke down|breaking down)\b/,
  /\bi hate (?:this|today|all of this|every)\b/,
  /\b(?:overwhelmed|overwhelming|at my limit|breaking point|touched out|can'?t cope|falling apart)\b/,
  /\bi\s+can'?t\s+(?:do|keep doing)\s+this\s+anymore\b/,
  /\b(?:hardest|worst)\s+(?:day|week|night)\b/,
  /\bi'?m\s+(?:so\s+)?(?:done|over it|struggling|not ok(?:ay)?|not coping)\b/,
])

function isDistress(text: string): boolean {
  for (const re of DISTRESS_PATTERNS) {
    if (re.test(text)) return true
  }
  return false
}

// ── Child-directed harm clause evaluation ──────────────────────────────────

/**
 * Decide the tier for one harm clause found in one sentence.
 * Returns 2 for stated intent / unframed aggression, 1 for ego-dystonic or
 * accident-class material, and 0 when the clause is a report of an actual past
 * event with no frame at all ("I dropped her today") — which is a story about
 * a hard day, not a risk signal, and must not be flagged.
 */
function tierForHarmClause(
  sentence: string,
  span: string,
  start: number,
  klass: VerbClass,
  intrusiveContext: boolean
): SafetyTier {
  const before = sentence.slice(0, start)
  const spanIsEgoDystonic = SPAN_EGO_DYSTONIC.test(span)
  const tightLead = spanIsEgoDystonic || hasLeadBefore(before, LEADS_TIGHT)
  const looseLead = tightLead || hasLeadBefore(before, LEADS_LOOSE)

  const isIntent = INTENT_MARKER.test(span)
  const isModal = MODAL_MARKER.test(span)

  if (isIntent) {
    // Volitional. Demoted only by a directly-embedding (tight) fear predicate,
    // or by an explicit disavowal in the same sentence.
    return tightLead || DISAVOWAL.test(sentence) ? 1 : 2
  }

  if (isModal) {
    if (looseLead || intrusiveContext) return 1
    if (klass === 'accident') return 1   // "I might drop her" — fear of an accident.
    if (klass === 'hyperbole') {
      // "I could kill him" is idiomatic with a bare pronoun; it is not when the
      // object is unambiguously the baby.
      return new RegExp(`${OBJ_BABY}\\b`).test(span) ? 2 : 1
    }
    return 2 // hard verb, modal, no frame anywhere: resolve up.
  }

  // No intent, no modal: bare past/present ("I dropped her", "I hurt her").
  // Only meaningful under a fear frame ("what if I dropped her").
  return looseLead ? 1 : 0
}

function scanHarmClauses(sentence: string, intrusiveContext: boolean): SafetyTier {
  let worst: SafetyTier = 0
  for (const { re, klass } of CLAUSE_PATTERNS) {
    const m = re.exec(sentence)
    if (!m) continue
    const tier = tierForHarmClause(sentence, m[0], m.index, klass, intrusiveContext)
    if (tier > worst) worst = tier
  }
  return worst
}

function anyMatch(patterns: readonly RegExp[], text: string): boolean {
  for (const re of patterns) {
    if (re.test(text)) return true
  }
  return false
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Classify a transcript for safety escalation. Pure and deterministic.
 *
 * Precedence (highest first):
 *   tier 2  self-harm  →  harm to child  →  psychosis markers
 *   tier 1  intrusive thoughts (incl. ego-dystonic harm clauses)  →  relational
 *   tier 0  distress  →  none
 *
 * Self-harm is checked first among tier 2 because its template is the one that
 * carries the crisis line the parent most likely needs in the moment; the
 * templates are not mutually exclusive in content, only in what we show first.
 *
 * @param transcript The parent's raw transcript. NEVER mutated, NEVER logged,
 *                   NEVER returned in any form.
 * @returns tier, category and — at tier 2 only — a fixed template key.
 */
export function classify(transcript: string): SafetyResult {
  if (typeof transcript !== 'string') return NO_FINDING
  const trimmed = transcript.trim()
  if (trimmed.length === 0) return NO_FINDING

  const text = normalize(trimmed.slice(0, MAX_SCAN_CHARS))
  const sentences = segment(text)
  if (sentences.length === 0) return NO_FINDING

  const intrusiveContext = INTRUSIVE_CONTEXT.test(text)

  // Pass 1 — tier 2. Scan every sentence before returning so precedence is by
  // severity, not by position in the transcript.
  let harmToChild = false
  let psychosis = false
  let egoDystonicHarm = false

  for (const sentence of sentences) {
    if (isSelfHarm(sentence)) {
      return make(2, 'self_harm', TIER2_TEMPLATE_KEYS.self_harm)
    }
    if (isPsychosis(sentence)) psychosis = true
    const harmTier = scanHarmClauses(sentence, intrusiveContext)
    if (harmTier === 2) harmToChild = true
    if (harmTier === 1) egoDystonicHarm = true
  }

  if (harmToChild) return make(2, 'harm_to_child', TIER2_TEMPLATE_KEYS.harm_to_child)
  if (psychosis) return make(2, 'severe_maternal_distress', TIER2_TEMPLATE_KEYS.psychosis)

  // Pass 2 — tier 1. One normalizing sentence; the interview continues.
  if (egoDystonicHarm || anyMatch(INTRUSIVE_PATTERNS, text)) {
    return make(1, 'intrusive_thoughts', null)
  }
  // `bonding_difficulty` carries all relational tier 1 material — absent bond,
  // self-blame ("I'm a bad mother") and rage — because the frozen
  // SafetyCategory union has no distinct value for the latter two. CT4's copy
  // for this category must therefore cover all three, or the contract type
  // needs a new value. Flagged in the lane report.
  if (anyMatch(BONDING_PATTERNS, text)) {
    return make(1, 'bonding_difficulty', null)
  }

  // Pass 3 — tier 0.
  if (isDistress(text)) return make(0, 'distress', null)
  return NO_FINDING
}

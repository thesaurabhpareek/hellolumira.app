/**
 * @module lib/letters/prompts/followup-templates
 * @description Wording for the nightly follow-up question. Pure data only — no
 *   selection logic lives here. Lane BE5 (`lib/letters/followups.ts`) picks an
 *   archetype deterministically from transcript signals (PRD §14.3) and a
 *   template id from within that archetype, then looks the text up here and
 *   fills the slots. This file never decides which question fires.
 *
 * Archetypes (PRD §14.3):
 *   - anchor    fires when the transcript has an event but no sensory detail.
 *   - thread    fires when a prior entry has a matching open thread. Needs
 *               {priorFact} — a short fragment carried over verbatim from that
 *               entry, never invented.
 *   - you       fires when the entry is all events and no first-person affect.
 *   - containing  fires instead of the other three when the safety tier is
 *               >= 1 (PRD §18.4) or affect dominates the transcript (§14.3).
 *               Gives the parent a private-layer exit. Must never mention
 *               help, resources, or shift into a clinical register — that is
 *               the job of CT4's safety-copy.ts, a separate surface. This one
 *               question is the only thing the parent sees at that moment.
 *
 * Slots:
 *   {babyName}  — replaced by the caller with the baby's name, or with
 *                 FOLLOWUP_BABY_NAME_FALLBACK when no name is set. Every
 *                 template that needs the baby uses this token in place of a
 *                 gendered pronoun ("her"/"his") so the fallback always reads
 *                 grammatically, regardless of the baby's sex.
 *   {priorFact} — thread only. A short clause fragment, e.g. "pulling up on
 *                 the couch". Templates are written to read as a natural
 *                 continuation of that fragment.
 *
 * Style rules followed throughout (see brief): second person, warm, short,
 * no exclamation marks, none of "amazing" / "beautiful" / "precious" /
 * "journey" / "moment" / "treasure", every question answerable in one spoken
 * sentence by someone exhausted at 9pm.
 */

import type { FollowUpArchetype } from '@/types/letters'

/**
 * Local superset of the shared FollowUpArchetype union, scoped to this file.
 * 'containing' is not part of FollowUpArchetype in types/letters.ts, which is
 * frozen and not owned by this lane — see REQUEST in the final report. This
 * union does not redefine or widen the shared type; it only adds a literal
 * for content this module also owns.
 */
export type FollowUpTemplateArchetype = FollowUpArchetype | 'containing'

export interface FollowUpTemplate {
  readonly id: string
  readonly archetype: FollowUpTemplateArchetype
  readonly text: string
}

/** Used by the caller in place of {babyName} when no name is set in-app. */
export const FOLLOWUP_BABY_NAME_FALLBACK = 'your baby' as const

/** Button/link label for declining the follow-up. Low cost to exit (PRD §6.2.4). */
export const FOLLOWUP_SKIP_LABEL = 'Skip' as const

/** Shown once the entry is complete and no more follow-ups will fire. */
export const FOLLOWUP_CLOSING_LINE = "That's everything for tonight." as const

// ---------------------------------------------------------------------------
// anchor — one concrete sensory detail. Low-stakes recall; PRD's own example
// is "What was she wearing?". None of these ask the parent to interpret or
// judge anything, which is why the archetype is the safest of the three to
// fire often.
// ---------------------------------------------------------------------------
const ANCHOR_TEMPLATES: readonly FollowUpTemplate[] = [
  { id: 'anchor-01', archetype: 'anchor', text: 'What was {babyName} wearing?' },
  { id: 'anchor-02', archetype: 'anchor', text: 'Where were you standing?' },
  { id: 'anchor-03', archetype: 'anchor', text: 'What did the room sound like?' },
  { id: 'anchor-04', archetype: 'anchor', text: 'What was playing in the background, if anything?' },
  { id: 'anchor-05', archetype: 'anchor', text: "What did {babyName}'s hands do?" },
  { id: 'anchor-06', archetype: 'anchor', text: 'What time of day was it?' },
  // Flag: "smell" recall can land oddly if the underlying event was messy or
  // unpleasant (spit-up, a diaper blowout). Low risk, but BE5 may want to
  // avoid pairing this one with a transcript that reads as gross-out rather
  // than tender.
  { id: 'anchor-07', archetype: 'anchor', text: 'What did {babyName} smell like, right after?' },
  { id: 'anchor-08', archetype: 'anchor', text: 'What was underfoot — carpet, tile, grass?' },
  { id: 'anchor-09', archetype: 'anchor', text: 'What was the light like in the room?' },
  { id: 'anchor-10', archetype: 'anchor', text: 'What was the first sound {babyName} made?' },
]

// ---------------------------------------------------------------------------
// thread — continuity with a specific prior entry. {priorFact} is supplied
// verbatim by the caller from a real row; these templates only frame it.
// General flag: if {priorFact} names a stalled or negative pattern (a
// regression, a still-unresolved worry) rather than a milestone, "still
// happening?" phrasing can read as a sore reminder rather than continuity.
// That is a selection concern for BE5, not a wording fix — noting it here so
// it isn't lost.
// ---------------------------------------------------------------------------
const THREAD_TEMPLATES: readonly FollowUpTemplate[] = [
  { id: 'thread-01', archetype: 'thread', text: 'Two weeks ago, {babyName} was {priorFact}. Still?' },
  { id: 'thread-02', archetype: 'thread', text: 'You mentioned {babyName} was {priorFact}. Any different now?' },
  { id: 'thread-03', archetype: 'thread', text: "Last time it was {priorFact}. Where's that now?" },
  { id: 'thread-04', archetype: 'thread', text: 'You said {priorFact} — still happening?' },
  { id: 'thread-05', archetype: 'thread', text: 'Whatever happened with {priorFact}?' },
  { id: 'thread-06', archetype: 'thread', text: 'You were watching for {priorFact}. Any update?' },
  { id: 'thread-07', archetype: 'thread', text: 'Before, {babyName} was {priorFact}. Same tonight?' },
  { id: 'thread-08', archetype: 'thread', text: "That thing about {priorFact} — how's it going?" },
  { id: 'thread-09', archetype: 'thread', text: 'You brought up {priorFact} a while back. Anything new?' },
  { id: 'thread-10', archetype: 'thread', text: '{priorFact} — is that still where things stand?' },
]

// ---------------------------------------------------------------------------
// you — the parent's own state. Deliberately not phrased as a rating of the
// day or a "what would you do differently" audit (PRD §6.3 — that framing
// must never ship). These ask what was felt, not what was done well or badly.
// ---------------------------------------------------------------------------
const YOU_TEMPLATES: readonly FollowUpTemplate[] = [
  { id: 'you-01', archetype: 'you', text: 'What did you feel watching that?' },
  { id: 'you-02', archetype: 'you', text: 'What were you thinking, right then?' },
  { id: 'you-03', archetype: 'you', text: "What did you want to say out loud but didn't?" },
  { id: 'you-04', archetype: 'you', text: 'What surprised you about your own reaction?' },
  { id: 'you-05', archetype: 'you', text: 'What were you hoping for, right then?' },
  { id: 'you-06', archetype: 'you', text: 'What is the one word for how you felt?' },
  { id: 'you-07', archetype: 'you', text: 'What did you notice in yourself today?' },
  { id: 'you-08', archetype: 'you', text: 'What almost made you laugh today?' },
  // Flag: inviting the parent to name what almost made them cry, on a night
  // that may already have been hard, risks reopening rather than closing —
  // this leans harder into "discharge" than most of the set. Keep, but BE5
  // may want to weight it down relative to the others.
  { id: 'you-09', archetype: 'you', text: 'What almost made you cry today?' },
  // Flag: "what did you need" can read as therapy-adjacent and demand more
  // self-examination than a spoken-sentence answer at 9pm easily gives. The
  // softest of this set to answer briefly; consider firing less often.
  { id: 'you-10', archetype: 'you', text: 'What did you need, right then?' },
]

// ---------------------------------------------------------------------------
// containing — replaces the other three when safety tier >= 1 (PRD §18.4) or
// affect dominates the transcript (§14.3). One warm exit, nothing else. Every
// variant reviewed against the brief's constraint: never triage, never
// mention help or resources, never shift register. If any of these reads as
// clinical to you, it should not ship — flag it back rather than editing
// past this comment.
// ---------------------------------------------------------------------------
const CONTAINING_TEMPLATES: readonly FollowUpTemplate[] = [
  { id: 'containing-01', archetype: 'containing', text: "Do you want this in {babyName}'s book, or just out of your head?" },
  { id: 'containing-02', archetype: 'containing', text: 'Want this written down, or just said out loud?' },
  { id: 'containing-03', archetype: 'containing', text: 'Should this go in the book, or stay just between us?' },
  { id: 'containing-04', archetype: 'containing', text: 'Is this one for the book tonight, or just for you?' },
]

/** Single source of truth. Every other export is derived from this array. */
export const FOLLOWUP_TEMPLATES: readonly FollowUpTemplate[] = [
  ...ANCHOR_TEMPLATES,
  ...THREAD_TEMPLATES,
  ...YOU_TEMPLATES,
  ...CONTAINING_TEMPLATES,
]

/** Grouped by archetype, in the order above, for BE5 to pick within a slot. */
export const FOLLOWUP_TEMPLATES_BY_ARCHETYPE: Readonly<
  Record<FollowUpTemplateArchetype, readonly FollowUpTemplate[]>
> = {
  anchor: ANCHOR_TEMPLATES,
  thread: THREAD_TEMPLATES,
  you: YOU_TEMPLATES,
  containing: CONTAINING_TEMPLATES,
}

/** O(1) lookup by the template key BE5 passes back after selection. */
export const FOLLOWUP_TEMPLATES_BY_ID: Readonly<Record<string, FollowUpTemplate>> =
  Object.fromEntries(FOLLOWUP_TEMPLATES.map((template) => [template.id, template]))

/**
 * @module letters/prompts/notifications
 * @description Typed notification copy for Letters. Data only — no logic, no
 *   scheduling, no substitution. The scheduler (owned elsewhere) picks a set,
 *   picks a variant, and replaces `{{babyName}}` with `LetterPromptContext.babyName`
 *   (falling back to a neutral phrase if null). See docs/Lumira-Letters-PRD.md
 *   §14.4 (recovery ladder), §14.5 (notification design), §14.6 (no gamification).
 *
 * COPY RULES — absolute, read before touching this file:
 *   1. Name the child (`{{babyName}}`) in every title or body. Never a bare
 *      pronoun, never "your baby".
 *   2. Ask nothing of the parent's effort. No "just", no "quick" framed as a
 *      favor, no "please". Stating the duration honestly (e.g. "two minutes")
 *      is informational, not a request for effort — that's allowed.
 *   3. State duration honestly where a duration is mentioned. Never round down
 *      to sound easier than it is.
 *   4. NEVER: counts of any kind, streaks, numbers of missed nights/days,
 *      "don't lose", "you haven't", "keep it up", or exclamation marks.
 *      This applies to the copy strings themselves — a screen this notification
 *      deep-links to may show an accumulation count (PRD §14.6 permits that,
 *      e.g. "47 letters to {{babyName}}"), but that number is rendered by the
 *      screen, not authored into a push notification string here.
 *   5. Never guilt. Lumira exists because a founder felt guilty about an
 *      unfilled baby book. A notification that manufactures the same guilt
 *      it claims to relieve is the one failure mode that is never acceptable
 *      here, however effective it might test. If a draft variant could be
 *      read as "you're behind," it does not ship — rewrite it or cut it.
 *
 * Every violation above is a bug, not a style nit. If you are adding a variant,
 * read it out loud as if it just interrupted a tired parent at 9pm. If it would
 * make them feel behind, it fails rule 5 regardless of what it says literally.
 */

export type NotificationCopy = {
  /** iOS notification title. Keep to roughly 40 characters or fewer. */
  title: string
  /** iOS notification body. Keep to roughly 90 characters or fewer. */
  body: string
}

// ---------------------------------------------------------------------------
// 1. Onboarding — nights 1-7
// ---------------------------------------------------------------------------
// Establishes the ritual (out loud, at night, about the child) and the
// duration (two minutes), so the steady-state prompt later needs neither
// explained. One variant per night, in order — index 0 is night 1.

export const ONBOARDING_NIGHTS_1_TO_7: readonly NotificationCopy[] = [
  {
    title: `{{babyName}}'s day`,
    body: 'Two minutes, out loud, whenever tonight allows.',
  },
  {
    title: `A minute with {{babyName}}`,
    body: "Say what today was like. That's the whole thing.",
  },
  {
    title: `{{babyName}}, tonight`,
    body: 'No structure needed. Just talk, out loud, for a bit.',
  },
  {
    title: `For {{babyName}}'s book`,
    body: 'Two minutes, spoken, becomes a page later.',
  },
  {
    title: `{{babyName}}'s day, in your voice`,
    body: "Say it however it comes out. That's enough.",
  },
  {
    title: `Tonight, for {{babyName}}`,
    body: 'A couple of minutes, talking, out loud.',
  },
  {
    title: `{{babyName}}'s week, one day at a time`,
    body: "Tonight's two minutes, whatever's true today.",
  },
] as const

// ---------------------------------------------------------------------------
// 2. Steady state — the everyday nudge
// ---------------------------------------------------------------------------

export const STEADY_STATE: readonly NotificationCopy[] = [
  {
    title: `What should {{babyName}} know?`,
    body: 'About today. Two minutes, out loud.',
  },
  {
    title: `{{babyName}}'s day`,
    body: 'What happened today, in your words.',
  },
  {
    title: `Tonight, for {{babyName}}`,
    body: 'Whatever today was, say it now.',
  },
  {
    title: `A line for {{babyName}}`,
    body: 'What should they know about today?',
  },
  {
    title: `{{babyName}}, today`,
    body: 'Two minutes, out loud, before the day closes.',
  },
  {
    title: `Tell {{babyName}}'s book`,
    body: 'What today looked like, in a couple of minutes.',
  },
  {
    title: `{{babyName}}'s day, quickly`,
    body: "A minute or two, whatever's on your mind.",
  },
] as const

// ---------------------------------------------------------------------------
// 3. Second window — 10:15pm, only if the first notification was dismissed
//    without being opened. Softer and shorter. Must read as genuinely fine
//    to ignore, not as a second ask.
// ---------------------------------------------------------------------------

export const SECOND_WINDOW: readonly NotificationCopy[] = [
  {
    title: 'Still there if you want it',
    body: `{{babyName}}'s day, whenever. No rush.`,
  },
  {
    title: `{{babyName}}, if there's time`,
    body: "A minute, if it's easy tonight.",
  },
  {
    title: 'No pressure',
    body: `{{babyName}}'s entry is here whenever you are.`,
  },
  {
    title: 'Just in case',
    body: `A word about {{babyName}}, if tonight allows.`,
  },
  {
    title: "Whenever's fine",
    body: `{{babyName}}'s day is still open. No rush at all.`,
  },
  {
    title: 'One more chance, no pressure',
    body: `For {{babyName}}, if it's easy right now.`,
  },
] as const

// ---------------------------------------------------------------------------
// 4. The recovery ladder — docs/Lumira-Letters-PRD.md §14.4
// ---------------------------------------------------------------------------

/**
 * RUNG: 1 night missed.
 *
 * Deliberately no export here. The PRD is explicit: "Nothing. Silence. No
 * mention, ever, on return." There is no copy for this rung because the
 * correct behavior is to send nothing and say nothing about it later — not
 * even a gentle acknowledgement. If a future contributor is looking for
 * "the one-night-missed message," it does not exist. Do not add one.
 */

/**
 * RUNG: 2-4 nights missed.
 *
 * Also deliberately not a distinct copy set. The PRD: "Same prompt,
 * unchanged. No acknowledgement of the gap." This is `STEADY_STATE` itself —
 * reuse it directly rather than duplicating its variants under a new name,
 * which would invite the two lists to drift and a future edit to
 * accidentally add gap-acknowledging language to one but not the other.
 */
export const RECOVERY_2_TO_4_NIGHTS: readonly NotificationCopy[] = STEADY_STATE

/**
 * RUNG: 5-7 nights missed.
 *
 * The prompt widens to cover the whole gap as a single entry. Debt is
 * cancelled by redefining the unit ("the last few days" instead of "the
 * days you missed"), not by asking the parent to catch up on each one.
 */
export const RECOVERY_5_TO_7_NIGHTS: readonly NotificationCopy[] = [
  {
    title: 'The last few days, as one',
    body: `One entry for all of it, {{babyName}}. Out loud, in one go.`,
  },
  {
    title: `{{babyName}}'s week, together`,
    body: 'Cover the last few days as one entry.',
  },
  {
    title: 'A few days, one entry',
    body: `Whatever's been happening with {{babyName}}, all of it at once.`,
  },
  {
    title: `{{babyName}}, the whole stretch`,
    body: 'One entry for the last few days, however it comes out.',
  },
  {
    title: `{{babyName}}'s week, in one go`,
    body: 'The last few days, as one entry.',
  },
  {
    title: 'One entry, the last few days',
    body: `For {{babyName}}, everything since, in one go.`,
  },
] as const

/**
 * RUNG: ~14 nights missed.
 *
 * Lumira drafts an entry from milestones, check-ins, and chat, and asks the
 * parent to correct it rather than write it from nothing. Editing is cheap
 * where authoring is not — the copy must frame this as review, never as a
 * catch-up task.
 */
export const RECOVERY_14_NIGHTS: readonly NotificationCopy[] = [
  {
    title: `A draft for {{babyName}}'s book`,
    body: "Written from what's already there. Read it, fix what's off.",
  },
  {
    title: `{{babyName}}'s entry is drafted`,
    body: "Take a look, change anything that's not quite right.",
  },
  {
    title: `Something's written for {{babyName}}`,
    body: 'From milestones and check-ins. Yours to correct.',
  },
  {
    title: `A first pass, for {{babyName}}`,
    body: "Read it over, edit what doesn't sound like you.",
  },
  {
    title: `{{babyName}}'s page, started`,
    body: 'Already drafted. Just fix what needs fixing.',
  },
  {
    title: `Drafted, for {{babyName}}`,
    body: 'From what Lumira already knows. Correct it, not write it.',
  },
] as const

/**
 * RUNG: 30+ nights missed.
 *
 * The PRD calls for exactly ONE reactivation message, and only one — "then
 * stop." This is intentionally a single object, not a variant array: a
 * rotation would imply repeated sends, which contradicts "then stop." If
 * this rung needs to fire again after the app drops to weekly, that is a
 * scheduling decision for whoever owns the scheduler, not a signal to add
 * more variants here.
 *
 * It leads with the artifact per the PRD ("show the letters already
 * written, then ask"), but the count itself is not in this string — it is
 * rendered by the screen this notification opens (see rule 4 in the header
 * comment). The copy only gestures at the archive existing.
 */
export const RECOVERY_30_PLUS_NIGHTS: NotificationCopy = {
  title: `Everything you've written for {{babyName}}`,
  body: 'Open it up. Add to it, or just read it back.',
}

// ---------------------------------------------------------------------------
// 5. Milestone-triggered — an in-the-moment nudge right after a milestone
//    is logged, while the moment is still fresh.
// ---------------------------------------------------------------------------

export const MILESTONE_TRIGGERED: readonly NotificationCopy[] = [
  {
    title: `{{babyName}} just did something`,
    body: "Say a bit more about it, while it's fresh.",
  },
  {
    title: 'Before it fades',
    body: `A word about what {{babyName}} just did.`,
  },
  {
    title: 'That milestone, in your words',
    body: `Add a line about {{babyName}} while it's fresh.`,
  },
  {
    title: 'Worth saying out loud',
    body: `What just happened with {{babyName}}. Capture it now.`,
  },
  {
    title: `{{babyName}}'s moment`,
    body: "Say more about it before it's just a memory.",
  },
  {
    title: `Fresh, for {{babyName}}`,
    body: 'A quick word about what just happened.',
  },
] as const

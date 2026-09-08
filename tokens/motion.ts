// tokens/motion.ts — Lumira design tokens, motion tier
//
// Lane: DS2. Owns this file and tokens/shadows.ts, and no others
// (see docs/LETTERS-ENGINEERING-CONTRACT.md §5).
//
// GROUND RULES (docs/Lumira-Design-System-iOS.md §2, §6):
// - Plain TypeScript objects. No framework imports (no framer-motion, no reanimated,
//   no react-native), no runtime logic — every value here is data, computed once at
//   author time. Consumers (web via framer-motion, native via react-native-reanimated
//   v4, and scripts/build-tokens.ts which reads springs.<name>.reanimated for the
//   generated native theme) import this module directly.
// - Primitives/motion tokens never fork by light/dark mode. Reduce Motion is a
//   separate accessibility axis, handled below as an explicit variant map, not a
//   light/dark-style fork.

// ─────────────────────────────────────────────────────────────────────────────
// 6.2 — Spring tokens
// ─────────────────────────────────────────────────────────────────────────────
//
// Design spec §6.1: a spring is a physics simulation with velocity, not a fixed
// timeline — it can be interrupted mid-flight and re-target smoothly. This is why
// every token below is expressed as spring parameters, never as duration+bezier.
//
// Three parameterizations of the same five feels, one per consumer:
//   - apple:      response (seconds) + dampingFraction (1.0 = critical/no bounce,
//                 <1.0 = underdamped/overshoots). Apple's own vocabulary
//                 (developer.apple.com), the source of truth §6.2's table is built from.
//   - framer:     duration (seconds) + bounce (0-1). framer-motion's own vocabulary.
//   - reanimated: duration (ms) + dampingRatio. react-native-reanimated v4's
//                 `withSpring(value, { duration, dampingRatio })` form — chosen per
//                 §6.3 over stiffness/damping/mass because it is "the direct analog
//                 of Apple's response + dampingFraction": reanimated.duration is
//                 apple.response expressed in milliseconds instead of seconds, and
//                 reanimated.dampingRatio equals apple.dampingFraction exactly, with
//                 no conversion loss. Confirmed against every worked example in
//                 design spec §6.3 (mic press-in = interactive, listening-start glow
//                 = gentle, tab indicator = snappy) — every one round-trips exactly.
//
// framer's `bounce` is NOT derived from dampingFraction by a formula at build time.
// design spec §6.2 states this explicitly: "framer-motion's bounce (0-1) is roughly
// the inverse of dampingFraction; bounce ≈ 1 − dampingFraction is a calibrate-by-eye
// approximation, not an exact formula — framer defines bounce independently. Verify
// visually." The values below are the calibrated-by-eye values the design spec itself
// ships in its §6.2 code sample, not a computed 1-dampingFraction (which would read,
// e.g., 0.175 for `standard` — visibly too bouncy; the spec's own chosen value is
// 0.08). Do not "simplify" this file by deriving framer.bounce from dampingFraction.

export interface AppleSpringParams {
  /** Seconds. Approximates perceived duration to settle. */
  readonly response: number;
  /** 1.0 = critically damped (no overshoot). <1.0 = underdamped (overshoots). */
  readonly dampingFraction: number;
}

export interface FramerSpringParams {
  /** Seconds. */
  readonly duration: number;
  /** 0-1. Calibrate-by-eye approximation of dampingFraction — see header comment. */
  readonly bounce: number;
}

export interface ReanimatedSpringParams {
  /** Milliseconds (not seconds — differs from apple.response/framer.duration). */
  readonly duration: number;
  /** Direct analog of apple.dampingFraction (react-native-reanimated v4 §6.3). */
  readonly dampingRatio: number;
}

export interface SpringToken {
  readonly apple: AppleSpringParams;
  readonly framer: FramerSpringParams;
  readonly reanimated: ReanimatedSpringParams;
}

export type SpringName = 'snappy' | 'standard' | 'gentle' | 'interactive' | 'bouncy';

/**
 * The five spring tokens (design spec §6.2 table).
 *
 * `spring.bouncy` is the ONLY token allowed to overshoot by design intent. Per the
 * Letters PRD: no bounce anywhere in Letters — bouncy is reserved for milestone /
 * badge-unlock moments outside Letters. The other four are underdamped in the strict
 * physics sense (dampingFraction < 1) but were calibrated (see framer.bounce values)
 * to read as effectively no visible bounce; only bouncy is tuned to be seen.
 */
export const springs: Record<SpringName, SpringToken> = {
  snappy: {
    apple: { response: 0.28, dampingFraction: 1.0 },
    framer: { duration: 0.28, bounce: 0 },
    reanimated: { duration: 280, dampingRatio: 1.0 },
  },
  standard: {
    apple: { response: 0.5, dampingFraction: 0.825 },
    framer: { duration: 0.5, bounce: 0.08 },
    reanimated: { duration: 500, dampingRatio: 0.825 },
  },
  gentle: {
    apple: { response: 0.65, dampingFraction: 0.9 },
    framer: { duration: 0.65, bounce: 0 },
    reanimated: { duration: 650, dampingRatio: 0.9 },
  },
  interactive: {
    apple: { response: 0.15, dampingFraction: 0.86 },
    framer: { duration: 0.15, bounce: 0.05 },
    reanimated: { duration: 150, dampingRatio: 0.86 },
  },
  bouncy: {
    apple: { response: 0.55, dampingFraction: 0.68 },
    framer: { duration: 0.55, bounce: 0.22 },
    reanimated: { duration: 550, dampingRatio: 0.68 },
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Existing --ease-* bezier reconciliation (design spec §6.2 action item)
// ─────────────────────────────────────────────────────────────────────────────
//
// app/globals.css (owned by DS4, NOT edited here) ships five bezier custom
// properties predating the spring system. §6.2: "the existing --ease-ios /
// --ease-spring bezier curves in tailwind.config.ts must be reconciled against
// this table before native ships, or web and native will visibly mismatch."
// Reconciliation below — nearest spring token per curve shape and actual call-site
// usage (grepped in app/globals.css), not name similarity alone.
//
//   --ease-default    cubic-bezier(0.25, 0.10, 0.25, 1.00)   -> spring.snappy
//     No overshoot (all y in [0,1]), short/crisp. Used at 150-300ms for hover/press
//     transforms (globals.css lines ~1119, ~1133) — matches snappy's own job
//     (button press, toggle) almost exactly.
//
//   --ease-spring      cubic-bezier(0.34, 1.56, 0.64, 1.00)   -> spring.bouncy
//     The only bezier with a y-value > 1 (1.56) — i.e. the only one that overshoots
//     at all, so it is the only legitimate match for bouncy. CONFIRMED but FLAGGED:
//     in the current CSS it is not confined to milestone/badge-unlock use — it is
//     also applied to nav-item and card hover transforms (globals.css lines ~1427,
//     ~1821, ~1839), which the design spec's "bouncy is milestone/badge only" rule
//     would forbid. This file does not fix those call sites (out of DS2's lane —
//     see final report REQUEST line); flagging here so it isn't silently "resolved"
//     by this comment.
//
//   --ease-decelerate  cubic-bezier(0.00, 0.00, 0.20, 1.00)   -> spring.gentle
//     No overshoot, pure decelerate-to-rest. Used for slide-in entrances (globals.css
//     lines ~1160-1192) at 300-400ms — same "slow settle" character as gentle's job
//     (entry reveal, composing state), even though gentle's own response (650ms) runs
//     longer than these particular call sites.
//
//   --ease-ios         cubic-bezier(0.16, 1.00, 0.30, 1.00)   -> spring.standard
//     No overshoot, Apple-style decelerate-then-ease-out. Used for exactly standard's
//     documented job — sheet/modal present (globals.css line ~1341 `pt-modal-up`),
//     scale-in (line ~1188), card-like slideUp (line ~1790) — at 200-350ms, close to
//     standard's 500ms response. Best behavioral match of the five.
//
//   --ease-accelerate  cubic-bezier(0.40, 0.00, 1.00, 1.00)             -> CANNOT RECONCILE
//     A pure ease-in/accelerate curve (speeds up leaving rest) has no spring analog:
//     springs are rest-seeking (they settle toward a target), they do not accelerate
//     away from one. There is no token above this curve can honestly map to. It is
//     also, per grep of app/globals.css, unreferenced by any `transition`/`animation`
//     declaration today — defined but dead. Recommend removal when DS4 next touches
//     globals.css motion vars; not actioned here (out of lane).
//
// spring.interactive has no legacy bezier counterpart at all — a fixed bezier cannot
// represent gesture-coupled, interruptible drag-tracking by construction (§6.1), so
// there was nothing for the old system to approximate it with. It is a genuinely new
// capability, not a reconciliation.

// ─────────────────────────────────────────────────────────────────────────────
// 6.4 — Letters-specific motion timings
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Idle "tap to talk" breathing cue on the mic entry point, BEFORE capture starts.
 *
 * IMPORTANT — this is deliberately distinct from the active listening glow described
 * in design spec §6.4: "Continuous low-amplitude glow driven by real audio amplitude,
 * not a decorative loop. A withRepeat loop reads as fake. Drive it from actual RMS
 * ticks." That rule governs the aura ONCE CAPTURE HAS BEGUN and there is real
 * amplitude data to drive it. Before that moment there is no audio to sample, so a
 * timed idle-breathing loop is the only option and is not the "fake loop" the spec
 * warns against — FE1 (ListeningAura.tsx) should use this token for the idle/resting
 * state and switch to real RMS-driven values the instant capture starts.
 */
export const listeningAuraIdleBreath = {
  cycleMs: 4000,
  scaleFrom: 0.92,
  scaleTo: 1.0,
  spring: 'gentle' as const satisfies SpringName,
} as const;

/** Transcript word-by-word reveal — mimics live transcription, never a block paste. */
export const transcriptWordStagger = {
  minStaggerMs: 40,
  maxStaggerMs: 60,
  defaultStaggerMs: 50,
  perWordSpring: 'snappy' as const satisfies SpringName,
} as const;

/**
 * Composing-state breath pulse. Design spec §6.4: "Explicitly reject the spinner ...
 * This must feel unhurried by design, not merely unoptimized."
 */
export const composingBreathPulse = {
  cycleMs: 1400,
  scaleFrom: 1.0,
  scaleTo: 1.02,
  spring: 'gentle' as const satisfies SpringName,
} as const;

/** Entry reveal — "a settle, not a pop — a private artifact, not a badge." */
export const entryReveal = {
  minDurationMs: 400,
  maxDurationMs: 500,
  scaleFrom: 0.97,
  scaleTo: 1.0,
  spring: 'gentle' as const satisfies SpringName,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// 6.5 — Reduce Motion
// ─────────────────────────────────────────────────────────────────────────────
//
// "Gate every non-essential spring on AccessibilityInfo.isReduceMotionEnabled() /
// Reanimated's useReducedMotion()." Rules, verbatim from §6.5:
//   - Overshoot springs -> dampingRatio forced to 1.0, or instant
//   - Screen transitions -> cross-fade only, no slide or scale
//   - Composing animation -> KEEP (conveys system state, not decoration) but strip
//     scale, keep opacity pulse only
//   - Haptics are unaffected — Reduce Motion and Reduce Haptics are separate
//     accessibility axes (see haptics section below; do not gate hapticsMap on this).

export type ReducedMotionTreatment = 'critically-damped' | 'instant';

export interface ReducedMotionSpringEntry {
  readonly treatment: ReducedMotionTreatment;
  readonly reanimated: ReanimatedSpringParams;
  readonly framer: FramerSpringParams;
}

/**
 * Per-spring Reduce Motion overrides. `snappy` is already critically damped
 * (dampingFraction 1.0, framer.bounce 0) and is passed through unchanged — there is
 * no overshoot to remove. The other four are forced to dampingRatio/bounce = 0 either
 * as an instant cut (`interactive`, `bouncy` — gesture snap-back and milestone
 * overshoot are pure decoration once motion is reduced) or a critically-damped settle
 * at the same duration (`standard`, `gentle` — these carry perceptible sheet/entry
 * transitions that should still resolve smoothly, just without ringing).
 */
export const reducedMotionSprings: Record<SpringName, ReducedMotionSpringEntry> = {
  snappy: {
    treatment: 'critically-damped',
    reanimated: springs.snappy.reanimated,
    framer: springs.snappy.framer,
  },
  standard: {
    treatment: 'critically-damped',
    reanimated: { duration: 500, dampingRatio: 1.0 },
    framer: { duration: 0.5, bounce: 0 },
  },
  gentle: {
    treatment: 'critically-damped',
    reanimated: { duration: 650, dampingRatio: 1.0 },
    framer: { duration: 0.65, bounce: 0 },
  },
  interactive: {
    treatment: 'instant',
    reanimated: { duration: 0, dampingRatio: 1.0 },
    framer: { duration: 0, bounce: 0 },
  },
  bouncy: {
    treatment: 'instant',
    reanimated: { duration: 0, dampingRatio: 1.0 },
    framer: { duration: 0, bounce: 0 },
  },
} as const;

/**
 * Composing survives Reduce Motion by design (§6.5) — it communicates "the system is
 * working on your letter," which is state, not flourish. Scale is stripped; the
 * opacity pulse alone continues at the same cadence.
 */
export const composingBreathPulseReduced = {
  cycleMs: composingBreathPulse.cycleMs,
  opacityOnly: true,
  scaleFrom: 1.0,
  scaleTo: 1.0,
} as const;

/** Entry reveal under Reduce Motion: cross-fade only, no scale (§6.5 screen-transition rule applied to content reveal). */
export const entryRevealReduced = {
  durationMs: 450,
  opacityOnly: true,
  scaleFrom: 1.0,
  scaleTo: 1.0,
} as const;

/** Word-by-word stagger is pure decoration (simulates live typing) — Reduce Motion removes it entirely; transcript text appears as each chunk arrives, with no artificial per-word delay. */
export const transcriptWordStaggerReduced = {
  minStaggerMs: 0,
  maxStaggerMs: 0,
  defaultStaggerMs: 0,
} as const;

/** Idle breathing loop is pure decoration — Reduce Motion holds the mic affordance static. */
export const listeningAuraIdleBreathReduced = {
  cycleMs: listeningAuraIdleBreath.cycleMs,
  scaleFrom: 1.0,
  scaleTo: 1.0,
} as const;

/** Screen transitions under Reduce Motion: cross-fade only, no slide or scale (§6.5). */
export const reducedMotionScreenTransition = {
  type: 'cross-fade',
  durationMs: 200,
} as const;

export const reducedMotion = {
  springs: reducedMotionSprings,
  screenTransition: reducedMotionScreenTransition,
  composingBreathPulse: composingBreathPulseReduced,
  entryReveal: entryRevealReduced,
  transcriptWordStagger: transcriptWordStaggerReduced,
  listeningAuraIdleBreath: listeningAuraIdleBreathReduced,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Haptics (data only — expo-haptics is a native dependency, never imported here)
// ─────────────────────────────────────────────────────────────────────────────
//
// "Haptics are unaffected by Reduce Motion — separate accessibility axis" (§6.4/§6.5).
// Do NOT gate any lookup into this map on reducedMotion above.
//
// Only two Letters haptic events are actually specified in the design spec, both in
// §6.3's worked example: the mic press-in and the listening-start confirmation. Add
// further entries here only once a specific event is specified in the design spec —
// do not invent Letters haptic events that aren't documented.

export type HapticEventName = 'micPressIn' | 'listeningStart';

export type ExpoHapticsImpactStyle = 'Light' | 'Medium' | 'Heavy' | 'Rigid' | 'Soft';
export type ExpoHapticsNotificationType = 'Success' | 'Warning' | 'Error';

export type HapticEntry =
  | { readonly method: 'impactAsync'; readonly style: ExpoHapticsImpactStyle }
  | { readonly method: 'notificationAsync'; readonly type: ExpoHapticsNotificationType };

export const hapticsMap: Record<HapticEventName, HapticEntry> = {
  // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium) — design spec §6.3
  micPressIn: { method: 'impactAsync', style: 'Medium' },
  // Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success) — design spec §6.3
  listeningStart: { method: 'notificationAsync', type: 'Success' },
} as const;

export const motion = {
  springs,
  listeningAuraIdleBreath,
  transcriptWordStagger,
  composingBreathPulse,
  entryReveal,
  reducedMotion,
  hapticsMap,
} as const;

export type Motion = typeof motion;

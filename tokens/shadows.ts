// tokens/shadows.ts — Lumira design tokens, elevation/shadow tier
//
// Lane: DS2. Owns this file and tokens/motion.ts, and no others
// (see docs/LETTERS-ENGINEERING-CONTRACT.md §5).
//
// GROUND RULES (docs/Lumira-Design-System-iOS.md §2.3, §3.4):
// - Plain TypeScript objects. No framework imports, no runtime logic. Consumers: web
//   (scripts/build-tokens.ts emits `--shadow-xs..xl` CSS custom properties from the
//   `css` field), and React Native (imports `ios` and `androidElevation` directly —
//   RN has no CSS box-shadow at all, so those two fields are the only representation
//   that reaches native).
// - "Shadows: Hand-author the iOS/Android pair per shadow step. Only five steps
//   exist — cheaper than parsing rgba strings" (§2.3). Every triple below (css / ios /
//   androidElevation) is written by hand and kept in sync by eye, not derived from one
//   another at build or runtime — there is no parser in this file on purpose.

export interface ShadowOffset {
  readonly width: number;
  readonly height: number;
}

export interface IosShadowProps {
  readonly shadowColor: string;
  /** 0-1. */
  readonly shadowOpacity: number;
  readonly shadowRadius: number;
  readonly shadowOffset: ShadowOffset;
}

export interface ShadowDefinition {
  /** CSS `box-shadow` value. Spliced into `--shadow-<step>` by scripts/build-tokens.ts. */
  readonly css: string;
  readonly ios: IosShadowProps;
  /** Android `elevation` (dp). */
  readonly androidElevation: number;
}

export type ShadowStep = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// ─────────────────────────────────────────────────────────────────────────────
// Light mode — five elevation steps
// ─────────────────────────────────────────────────────────────────────────────
//
// `css` values are byte-identical to the light-mode --shadow-xs..xl already shipping
// in app/globals.css (:root, lines ~155-159) — this is the zero-visual-diff migration
// design spec §2.2 requires; the light-mode elevation model isn't changing, only being
// given a canonical TS source and iOS/Android counterparts it never had before.
// (`--shadow-inner`, `--shadow-sage`, `--shadow-terra`, `--shadow-coral` are explicitly
// out of scope for this generator per scripts/build-tokens.ts's own header comment —
// not reproduced here.)
//
// iOS shadowRadius is hand-picked at roughly half the CSS blur radius (a common
// CSS-box-shadow -> iOS-shadowRadius rule of thumb: CSS blur spreads visibly further
// per unit than iOS's shadowRadius does), shadowOffset.height matches the CSS
// offset-y, and shadowOpacity matches the CSS alpha. Android elevation increases
// step-over-step on a compressed version of Material's own 1/3/6/12/24dp scale, tuned
// by eye against the css/ios pair at each step rather than computed from either.
export const shadows: Record<ShadowStep, ShadowDefinition> = {
  xs: {
    css: '0 1px 2px rgba(0, 0, 0, 0.04)',
    ios: { shadowColor: '#000000', shadowOpacity: 0.04, shadowRadius: 1, shadowOffset: { width: 0, height: 1 } },
    androidElevation: 1,
  },
  sm: {
    css: '0 2px 8px rgba(0, 0, 0, 0.06)',
    ios: { shadowColor: '#000000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
    androidElevation: 3,
  },
  md: {
    css: '0 4px 16px rgba(0, 0, 0, 0.08)',
    ios: { shadowColor: '#000000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
    androidElevation: 6,
  },
  lg: {
    css: '0 8px 32px rgba(0, 0, 0, 0.10)',
    ios: { shadowColor: '#000000', shadowOpacity: 0.10, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } },
    androidElevation: 12,
  },
  xl: {
    css: '0 16px 48px rgba(0, 0, 0, 0.12)',
    ios: { shadowColor: '#000000', shadowOpacity: 0.12, shadowRadius: 24, shadowOffset: { width: 0, height: 16 } },
    androidElevation: 24,
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Dark mode — intentionally no shadow at any step
// ─────────────────────────────────────────────────────────────────────────────
//
// DELIBERATE DEVIATION FROM CURRENT app/globals.css — DOCUMENTED HERE FOR THE
// build-tokens.ts DIFF REPORT:
//
// app/globals.css's .dark block (lines ~346-350) currently ships real box-shadow
// values for --shadow-xs..xl (e.g. `0 4px 16px rgba(0, 0, 0, 0.25)` for md) — i.e.
// dark mode today just reuses the light-mode shadow recipe at higher opacity. Design
// spec §3.4 ("Dark mode: desaturate, do not invert") explicitly rejects this:
//
//   "Elevation by lightness, not shadow. Shadows read as blue-black smudges on warm
//   dark and undercut the 'not blue-black' premise ... Hairline borders, not shadows,
//   separate elevated layers."
//
// So every step below resolves to a real, present, no-op shadow (not omitted from the
// map — build-tokens.ts's validateShadows() requires every step to be a well-formed
// ShadowDefinition, and RN's `ios`/`androidElevation` fields aren't optional at the
// type level either) rather than shadow at all. Elevation in dark mode instead comes
// entirely from tokens/semantic.ts's `dark.surface` lightness steps (background
// L=0.183 -> raised L=0.22 -> overlay L=0.265) plus `dark.border.subtle`/`default`
// hairlines (both already shipped by DS1) — this file supplies none of that; it only
// stops contributing a shadow that would fight it.
//
// This is the exact "undocumented deviation" DS3 flagged when scripts/build-tokens.ts
// diffs generated CSS against the current .dark block: every --shadow-* var will show
// as CHANGED (rgba(...) -> none) with no scripts/build-tokens.ts KNOWN_CITATIONS entry
// to cite, so the diff will print as "UNDOCUMENTED" even though it is, per this
// comment, fully intentional. See this lane's final report for a REQUEST to DS3 to add
// a citation (design spec §3.4) to scripts/build-tokens.ts's KNOWN_CITATIONS table —
// not done here, tokens/shadows.ts is this lane's only owned file.
const NONE_IOS_SHADOW: IosShadowProps = {
  shadowColor: 'transparent',
  shadowOpacity: 0,
  shadowRadius: 0,
  shadowOffset: { width: 0, height: 0 },
};

const NONE_SHADOW: ShadowDefinition = {
  css: 'none',
  ios: NONE_IOS_SHADOW,
  androidElevation: 0,
};

export const shadowsDark: Record<ShadowStep, ShadowDefinition> = {
  xs: NONE_SHADOW,
  sm: NONE_SHADOW,
  md: NONE_SHADOW,
  lg: NONE_SHADOW,
  xl: NONE_SHADOW,
} as const;

export const shadowTokens = { shadows, shadowsDark } as const;
export type ShadowTokens = typeof shadowTokens;

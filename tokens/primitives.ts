// tokens/primitives.ts — Lumira design tokens, primitive tier
//
// Lane: DS1. Owns this file and tokens/semantic.ts, and no others
// (see docs/LETTERS-ENGINEERING-CONTRACT.md §5).
//
// GROUND RULES (docs/Lumira-Design-System-iOS.md §2):
// - Plain TypeScript objects. No framework imports, no CSS. Consumable as-is by the
//   web build (compiled to CSS custom properties by scripts/build-tokens.ts, owned by
//   DS3) and by React Native (imported directly as a JS theme object).
// - Primitives NEVER fork by light/dark mode. Only tokens/semantic.ts forks.
//
// COLOR RAMP METHOD (design spec §3.2):
// Anchors converted to OKLCH (Björn Ottosson's OKLab, D65, sRGB gamut), hue held fixed
// per family, lightness piecewise-linear from L≈0.985 (step 50) through the anchor's own
// L to L≈0.145 (step 950). Out-of-gamut results are chroma-reduced at fixed L/H (binary
// search) rather than naively clipped per channel, per §3.2's "taper chroma at both
// extremes to avoid gamut clipping" instruction. Computed with a standalone verification
// script (not eyeballed) — see the ratio table in this lane's final report.
//
// Anchors preserved exactly (written back as the literal input hex, not recomputed):
//   Sage  500 #3D8178   Terra 400 #C4844E   Rose 400 #D4607C
//   Amber 200 #F5D890   Sand    0 #FAFAF8   Sand dark base (950) #131210
//
// KNOWN DEFECT FIXED (§3.2): "above L=0.85 the chroma taper is too weak for sage and
// rose — the 100-step tints read minty/neon rather than pale." Chroma is now a
// piecewise function of L with a knee at L=0.85 (the spec's own boundary):
//   - Below the knee: chroma stays close to the anchor's own value (mild taper down to
//     90% at the knee). This preserves the doc's own un-flagged step-200/300 examples,
//     which sit near full anchor saturation.
//   - Above the knee: chroma follows a concave power curve (exponent 0.22) down to a
//     small non-zero floor (~10% of anchor chroma) at step 50 — steep enough that most
//     of the reduction happens immediately after crossing 0.85, not eyeballed-linear.
//     The floor is non-zero (not flattened to gray) so the palest tint still reads as a
//     whisper of the family hue, matching the doc's own tinted (not white) step-50
//     examples (e.g. Sage 50 #F3FDFB).
// Amber is anchored at step 200 (L=0.890), already above the knee — for amber the whole
// light side (50/100) uses the steep curve starting from the anchor itself.
//
// Verified before/after chroma (C in OKLCH) at the flagged 100 step — computed, not
// eyeballed. "Before" = a single mild linear taper applied uniformly across the whole
// light side (reproduces the documented defect); "after" = the fix shipped below:
//
//   family   L        C before (weak, buggy)   C after (fixed)   reduction
//   sage     0.899     0.0689                    0.0183            73%
//   terra    0.906     0.1033                    0.0256            75%
//   rose     0.898     0.1448                     0.0387            73%
//   amber    0.938     0.0946                    0.0218            77%
//
// Every hex below round-trips through sRGB without per-channel clamping (i.e. is
// in-gamut as generated).

/** A standard 11-step ramp used by sage, terra, rose and amber. */
export interface ColorRamp {
  readonly 50: string;
  readonly 100: string;
  readonly 200: string;
  readonly 300: string;
  readonly 400: string;
  readonly 500: string;
  readonly 600: string;
  readonly 700: string;
  readonly 800: string;
  readonly 900: string;
  readonly 950: string;
}

/** Sand carries one extra step (0) below 50 — it is the literal shipped app background,
 *  distinct from (and slightly warmer than) the generated neutral-gray 50 step. There is
 *  no "sand.900" special-cased token: 900 is an ordinary interpolated step, and the dark
 *  base anchor lives at 950 (design spec §1.1 — "Sand 900" was never actually built and
 *  the name is retired, not reused). */
export interface SandRamp extends ColorRamp {
  readonly 0: string;
}

export const sage: ColorRamp = {
  50: '#F5FCFB',
  100: '#D1E2DF',
  200: '#93D0C7',
  300: '#76B5AC',
  400: '#5A9B91',
  500: '#3D8178', // anchor, preserved exactly
  600: '#2D6760',
  700: '#1D4F49',
  800: '#0E3833',
  900: '#02221E',
  950: '#000E0B',
} as const;

export const terra: ColorRamp = {
  50: '#FFF9F4',
  100: '#EDDCCF',
  200: '#F5B786',
  300: '#DC9D6A',
  400: '#C4844E', // anchor, preserved exactly
  500: '#A46C3C',
  600: '#85552B',
  700: '#673F1B',
  800: '#4A2A0B',
  900: '#301600',
  950: '#150600',
} as const;

export const rose: ColorRamp = {
  50: '#FFF8F9',
  100: '#F6D3D9',
  200: '#FFA3B5',
  300: '#F07D97',
  400: '#D4607C', // anchor, preserved exactly
  500: '#B24D66',
  600: '#913A50',
  700: '#72283C',
  800: '#541728',
  900: '#370716',
  950: '#1C0006',
} as const;

export const amber: ColorRamp = {
  50: '#FDFAF3',
  100: '#F0EADA',
  200: '#F5D890', // anchor, preserved exactly
  300: '#D5BA78',
  400: '#B59D61',
  500: '#97814A',
  600: '#796635',
  700: '#5D4C20',
  800: '#42340A',
  900: '#281D00',
  950: '#0F0900',
} as const;

// NOTE: coral is intentionally absent. Design spec §3.3: it is undocumented drift with
// no assigned semantic job — Terra and Rose already bracket the warm hue range Lumira
// needs (content-safe accent vs. alert-safe accent). Do not re-add it here; if a genuine
// third warm accent is needed later, generate it from that need, not from leftover config.

export const sand: SandRamp = {
  0: '#FAFAF8', // anchor, preserved exactly — the shipped app background
  50: '#E2E2E0',
  100: '#CACAC8',
  200: '#B3B3B1',
  300: '#9D9C9A',
  400: '#878684',
  500: '#71716E',
  600: '#5D5C5A',
  700: '#494846',
  800: '#363533',
  900: '#242321',
  950: '#131210', // anchor, preserved exactly — the shipped dark-mode base background
} as const;

/** Bare universal constants outside any ramp. Sand-0 (#FAFAF8) is deliberately warm and
 *  is already the lightest point of the sand ramp, so it cannot represent the pure-white
 *  raised/card surface the app already ships (globals.css `--surface-raised: #FFFFFF`).
 *  Kept minimal — just the two absolutes, not a second ramp. */
export const white = '#FFFFFF';
export const black = '#000000';

// ---------------------------------------------------------------------------------------
// Spacing — 8px grid (values as already shipping in app/globals.css --space-*; carried
// here as the platform-neutral source so RN reads the same dp values with no CSS var
// indirection).
// ---------------------------------------------------------------------------------------
export interface SpacingScale {
  readonly 0: number;
  readonly px: number;
  readonly 0.5: number;
  readonly 1: number;
  readonly 1.5: number;
  readonly 2: number;
  readonly 3: number;
  readonly 4: number;
  readonly 5: number;
  readonly 6: number;
  readonly 8: number;
  readonly 10: number;
  readonly 12: number;
  readonly 16: number;
  readonly 20: number;
  readonly 24: number;
}

export const spacing: SpacingScale = {
  0: 0,
  px: 1,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
} as const;

// ---------------------------------------------------------------------------------------
// Radius — matches the shipped values (design spec §1.1 conflict table: code and
// DESIGN.md agree at md=12/lg=16; PRODUCT.md's 14/18 is stale and is not reproduced here).
// ---------------------------------------------------------------------------------------
export interface RadiusScale {
  readonly none: number;
  readonly xs: number;
  readonly sm: number;
  readonly md: number;
  readonly lg: number;
  readonly xl: number;
  readonly full: number;
}

export const radius: RadiusScale = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

// ---------------------------------------------------------------------------------------
// Z-index — no prior primitive scale existed (globals.css used ad hoc literals: 2, 10,
// 90, 95, 100, 1000, 9999 scattered across components). This scale is additive and
// named by layer purpose; it does not remove or renumber any existing raw usage.
// ---------------------------------------------------------------------------------------
export interface ZIndexScale {
  readonly base: number;
  readonly raised: number;
  readonly dropdown: number;
  readonly sticky: number;
  readonly overlay: number;
  readonly drawer: number;
  readonly modal: number;
  readonly popover: number;
  readonly toast: number;
  readonly tooltip: number;
  readonly max: number;
}

export const zIndex: ZIndexScale = {
  base: 0,
  raised: 2,
  dropdown: 10,
  sticky: 20,
  overlay: 90,
  drawer: 95,
  modal: 100,
  popover: 1000,
  toast: 1200,
  tooltip: 1300,
  max: 9999,
} as const;

export const primitives = {
  sage,
  terra,
  rose,
  amber,
  sand,
  white,
  black,
  spacing,
  radius,
  zIndex,
} as const;

export type Primitives = typeof primitives;

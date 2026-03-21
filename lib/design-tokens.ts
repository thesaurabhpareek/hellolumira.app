/**
 * @module design-tokens
 * @description Lumira Design System v2.0 — Typed design tokens for JS/TS usage.
 *   These mirror the CSS custom properties defined in globals.css.
 *   Use these when you need token values in JS (e.g., canvas drawing, charts,
 *   dynamic styles, or animation calculations).
 * @version 2.0.0
 * @since March 2026
 */

/* ══════════════════════════════════════════════════════════════════════════════
   COLOR PALETTE
   ══════════════════════════════════════════════════════════════════════════════ */

export const sage = {
  50:  '#EDF4F2',
  100: '#D4E8E4',
  200: '#A8CECA',
  300: '#7BB5AD',
  400: '#549C92',
  500: '#3D8178',
  600: '#336B63',
  700: '#29554F',
  800: '#1F403B',
  900: '#152B28',
  950: '#0B1614',
} as const;

export const terra = {
  50:  '#FDF0E6',
  100: '#FAE0CC',
  200: '#F0C49E',
  300: '#E2A670',
  400: '#C4844E',
  500: '#A86E3C',
  600: '#8C5A30',
  700: '#704726',
  800: '#54351C',
  900: '#3A2413',
  950: '#1F130A',
} as const;

export const coral = {
  50:  '#FFF1EE',
  100: '#FFE0D9',
  200: '#FFC1B3',
  300: '#FF9E8A',
  400: '#F27961',
  500: '#E5634A',
  600: '#C94D36',
  700: '#A63D2B',
  800: '#843121',
  900: '#622518',
  950: '#3D160E',
} as const;

/** Semantic status colors — light mode defaults */
export const semantic = {
  success: {
    bg:     '#F0FFF4',
    text:   '#276749',
    border: '#C6F6D5',
    50:     '#F0FFF4',
    100:    '#C6F6D5',
    500:    '#38A169',
    600:    '#2F855A',
    700:    '#276749',
  },
  warning: {
    bg:     '#FFFFF0',
    text:   '#744210',
    border: '#FEFCBF',
    50:     '#FFFFF0',
    100:    '#FEFCBF',
    500:    '#D69E2E',
    600:    '#B7791F',
    700:    '#744210',
  },
  error: {
    bg:     '#FFF5F5',
    text:   '#822727',
    border: '#FED7D7',
    50:     '#FFF5F5',
    100:    '#FED7D7',
    500:    '#E53E3E',
    600:    '#C53030',
    700:    '#822727',
  },
  info: {
    bg:     '#EBF8FF',
    text:   '#2A4365',
    border: '#BEE3F8',
    50:     '#EBF8FF',
    100:    '#BEE3F8',
    500:    '#4299E1',
    600:    '#3182CE',
    700:    '#2A4365',
  },
} as const;

/** Surface layers */
export const surfaces = {
  light: {
    background: '#FAFAF8',
    primary:    '#FFFFFF',
    raised:     '#FFFFFF',
    overlay:    'rgba(255, 255, 255, 0.92)',
    sunken:     '#F5F3EF',
  },
  dark: {
    background: '#131210',
    primary:    '#1C1A17',
    raised:     '#242220',
    overlay:    'rgba(28, 26, 23, 0.92)',
    sunken:     '#0D0C0B',
  },
} as const;

/** Text hierarchy */
export const textColors = {
  light: {
    primary:    '#2D3748',
    secondary:  '#4A5568',
    tertiary:   '#718096',
    quaternary: '#A0AEC0',
    inverse:    '#FFFFFF',
    link:       '#3D8178',
  },
  dark: {
    primary:    '#F0EEEA',
    secondary:  '#C8C4BC',
    tertiary:   '#9C9A94',
    quaternary: '#6B6964',
    inverse:    '#131210',
    link:       '#A8CECA',
  },
} as const;

/* ══════════════════════════════════════════════════════════════════════════════
   SPACING (8px grid)
   ══════════════════════════════════════════════════════════════════════════════ */

export const spacing = {
  0:     0,
  px:    1,
  0.5:   2,
  1:     4,
  1.5:   6,
  2:     8,
  3:     12,
  4:     16,
  5:     20,
  6:     24,
  8:     32,
  10:    40,
  12:    48,
  16:    64,
  20:    80,
  24:    96,
} as const;

/* ══════════════════════════════════════════════════════════════════════════════
   ELEVATION (shadows)
   ══════════════════════════════════════════════════════════════════════════════ */

export const elevation = {
  xs:    '0 1px 2px rgba(0, 0, 0, 0.04)',
  sm:    '0 2px 8px rgba(0, 0, 0, 0.06)',
  md:    '0 4px 16px rgba(0, 0, 0, 0.08)',
  lg:    '0 8px 32px rgba(0, 0, 0, 0.10)',
  xl:    '0 16px 48px rgba(0, 0, 0, 0.12)',
  inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.04)',
  sage:  '0 4px 14px rgba(61, 129, 120, 0.20)',
  terra: '0 4px 14px rgba(196, 132, 78, 0.20)',
  coral: '0 4px 14px rgba(242, 121, 97, 0.20)',
} as const;

/* ══════════════════════════════════════════════════════════════════════════════
   BORDER RADIUS
   ══════════════════════════════════════════════════════════════════════════════ */

export const radius = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  full: 9999,
} as const;

/* ══════════════════════════════════════════════════════════════════════════════
   MOTION / ANIMATION
   ══════════════════════════════════════════════════════════════════════════════ */

export const duration = {
  instant: 100,
  fast:    200,
  normal:  300,
  slow:    500,
  slower:  700,
} as const;

export const easing = {
  default:    'cubic-bezier(0.25, 0.1, 0.25, 1)',
  spring:     'cubic-bezier(0.34, 1.56, 0.64, 1)',
  decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
  accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
  ios:        'cubic-bezier(0.16, 1, 0.3, 1)',
} as const;

/* ══════════════════════════════════════════════════════════════════════════════
   TYPOGRAPHY
   ══════════════════════════════════════════════════════════════════════════════ */

export type TypeStyle = {
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  fontWeight: number;
};

export const typography: Record<string, TypeStyle> = {
  display: {
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: -0.02 * 36,  // -0.72
    fontWeight: 700,
  },
  title1: {
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.015 * 28, // -0.42
    fontWeight: 700,
  },
  title2: {
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.01 * 22,  // -0.22
    fontWeight: 700,
  },
  title3: {
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.01 * 20,  // -0.20
    fontWeight: 600,
  },
  headline: {
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.005 * 17, // -0.085
    fontWeight: 600,
  },
  body: {
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: -0.005 * 17, // -0.085
    fontWeight: 400,
  },
  callout: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0,
    fontWeight: 400,
  },
  subhead: {
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0,
    fontWeight: 400,
  },
  footnote: {
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0,
    fontWeight: 400,
  },
  caption1: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.01 * 12, // 0.12
    fontWeight: 400,
  },
  caption2: {
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.02 * 11, // 0.22
    fontWeight: 400,
  },
} as const;

/* ══════════════════════════════════════════════════════════════════════════════
   CONVENIENCE HELPERS
   ══════════════════════════════════════════════════════════════════════════════ */

/** Returns a CSS transition string using design-system tokens. */
export function transition(
  properties: string | string[] = 'all',
  dur: keyof typeof duration = 'fast',
  ease: keyof typeof easing = 'default',
): string {
  const props = Array.isArray(properties) ? properties.join(', ') : properties;
  const ms = duration[dur];
  const fn = easing[ease];
  // For single property, return simple string
  if (!Array.isArray(properties) || properties.length === 1) {
    return `${props} ${ms}ms ${fn}`;
  }
  // For multiple properties, each gets the same duration/easing
  return properties.map((p) => `${p} ${ms}ms ${fn}`).join(', ');
}

/**
 * Checks if the user prefers reduced motion.
 * Safe for SSR (returns false on server).
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Returns the appropriate duration — 0 if user prefers reduced motion,
 * otherwise the token value in ms.
 */
export function safeDuration(dur: keyof typeof duration = 'normal'): number {
  return prefersReducedMotion() ? 0 : duration[dur];
}

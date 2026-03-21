// tailwind.config.ts — Lumira Tailwind configuration
// v2.0 — Premium design system: full color palettes, spacing, elevation, motion, typography
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── shadcn/ui semantic tokens (RGB-triplet CSS vars) ──────────────────
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        card: {
          DEFAULT: "rgb(var(--card) / <alpha-value>)",
          foreground: "rgb(var(--card-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "rgb(var(--popover) / <alpha-value>)",
          foreground: "rgb(var(--popover-foreground) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "rgb(var(--primary) / <alpha-value>)",
          foreground: "rgb(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--secondary) / <alpha-value>)",
          foreground: "rgb(var(--secondary-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "rgb(var(--muted) / <alpha-value>)",
          foreground: "rgb(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          foreground: "rgb(var(--accent-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "rgb(var(--destructive) / <alpha-value>)",
          foreground: "rgb(var(--destructive-foreground) / <alpha-value>)",
        },
        border: "rgb(var(--border) / <alpha-value>)",
        input:  "rgb(var(--input) / <alpha-value>)",
        ring:   "rgb(var(--ring) / <alpha-value>)",

        // ── Sage (Primary green) — full 10-shade scale ──────────────────────
        sage: {
          50:  "var(--sage-50)",
          100: "var(--sage-100)",
          200: "var(--sage-200)",
          300: "var(--sage-300)",
          400: "var(--sage-400)",
          500: "var(--sage-500)",
          600: "var(--sage-600)",
          700: "var(--sage-700)",
          800: "var(--sage-800)",
          900: "var(--sage-900)",
          950: "var(--sage-950)",
        },

        // ── Terra (Secondary warm) — full 10-shade scale ────────────────────
        terra: {
          50:  "var(--terra-50)",
          100: "var(--terra-100)",
          200: "var(--terra-200)",
          300: "var(--terra-300)",
          400: "var(--terra-400)",
          500: "var(--terra-500)",
          600: "var(--terra-600)",
          700: "var(--terra-700)",
          800: "var(--terra-800)",
          900: "var(--terra-900)",
          950: "var(--terra-950)",
        },

        // ── Coral (Accent for CTAs & highlights) ────────────────────────────
        coral: {
          50:  "var(--coral-50)",
          100: "var(--coral-100)",
          200: "var(--coral-200)",
          300: "var(--coral-300)",
          400: "var(--coral-400)",
          500: "var(--coral-500)",
          600: "var(--coral-600)",
          700: "var(--coral-700)",
          800: "var(--coral-800)",
          900: "var(--coral-900)",
          950: "var(--coral-950)",
        },

        // ── Sand (Neutral base) ─────────────────────────────────────────────
        sand: {
          0: '#FAFAF8',
        },

        // ── Semantic status colors ──────────────────────────────────────────
        success: {
          bg:     "var(--success-bg)",
          text:   "var(--success-text)",
          border: "var(--success-border)",
          50:     "var(--success-50)",
          100:    "var(--success-100)",
          500:    "var(--success-500)",
          600:    "var(--success-600)",
          700:    "var(--success-700)",
        },
        warning: {
          bg:     "var(--warning-bg)",
          text:   "var(--warning-text)",
          border: "var(--warning-border)",
          50:     "var(--warning-50)",
          100:    "var(--warning-100)",
          500:    "var(--warning-500)",
          600:    "var(--warning-600)",
          700:    "var(--warning-700)",
        },
        error: {
          bg:     "var(--error-bg)",
          text:   "var(--error-text)",
          border: "var(--error-border)",
          50:     "var(--error-50)",
          100:    "var(--error-100)",
          500:    "var(--error-500)",
          600:    "var(--error-600)",
          700:    "var(--error-700)",
        },
        info: {
          bg:     "var(--info-bg)",
          text:   "var(--info-text)",
          border: "var(--info-border)",
          50:     "var(--info-50)",
          100:    "var(--info-100)",
          500:    "var(--info-500)",
          600:    "var(--info-600)",
          700:    "var(--info-700)",
        },

        // ── Legacy status aliases (preserved for backward compat) ───────────
        'status-amber':       '#D69E2E',
        'status-amber-light': '#FFFFF0',
        'status-amber-dark':  '#744210',
        'status-green':       '#276749',
        'status-green-light': '#F0FFF4',
        'status-red-light':   '#FFF5F5',
        'status-red-dark':    '#822727',

        // ── Surface layers ──────────────────────────────────────────────────
        surface: {
          DEFAULT:    "var(--surface-primary)",
          background: "var(--surface-background)",
          raised:     "var(--surface-raised)",
          overlay:    "var(--surface-overlay)",
          sunken:     "var(--surface-sunken)",
        },

        // ── Text hierarchy ──────────────────────────────────────────────────
        "text-primary":    "var(--text-primary)",
        "text-secondary":  "var(--text-secondary)",
        "text-tertiary":   "var(--text-tertiary)",
        "text-quaternary": "var(--text-quaternary)",
        "text-inverse":    "var(--text-inverse)",
        "text-link":       "var(--text-link)",
      },

      // ── Border Radius ───────────────────────────────────────────────────────
      borderRadius: {
        xs:      "var(--radius-xs)",
        sm:      "var(--radius-sm)",
        md:      "var(--radius-md)",
        lg:      "var(--radius-lg)",
        xl:      "var(--radius-xl)",
        full:    "var(--radius-full)",
        DEFAULT: "var(--radius)",
      },

      // ── Spacing (8px grid) ──────────────────────────────────────────────────
      spacing: {
        'sp-0':   "var(--space-0)",
        'sp-px':  "var(--space-px)",
        'sp-0.5': "var(--space-0-5)",
        'sp-1':   "var(--space-1)",
        'sp-1.5': "var(--space-1-5)",
        'sp-2':   "var(--space-2)",
        'sp-3':   "var(--space-3)",
        'sp-4':   "var(--space-4)",
        'sp-5':   "var(--space-5)",
        'sp-6':   "var(--space-6)",
        'sp-8':   "var(--space-8)",
        'sp-10':  "var(--space-10)",
        'sp-12':  "var(--space-12)",
        'sp-16':  "var(--space-16)",
        'sp-20':  "var(--space-20)",
        'sp-24':  "var(--space-24)",
      },

      // ── Elevation (box-shadow) ──────────────────────────────────────────────
      boxShadow: {
        'xs':     "var(--shadow-xs)",
        'sm':     "var(--shadow-sm)",
        'md':     "var(--shadow-md)",
        'lg':     "var(--shadow-lg)",
        'xl':     "var(--shadow-xl)",
        'inner':  "var(--shadow-inner)",
        'sage':   "var(--shadow-sage)",
        'terra':  "var(--shadow-terra)",
        'coral':  "var(--shadow-coral)",
      },

      // ── Typography ──────────────────────────────────────────────────────────
      fontFamily: {
        sans: ["Plus Jakarta Sans", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      fontSize: {
        'display':  ["var(--font-display-size)",  { lineHeight: "var(--font-display-line)",  letterSpacing: "var(--font-display-track)"  }],
        'title1':   ["var(--font-title1-size)",   { lineHeight: "var(--font-title1-line)",   letterSpacing: "var(--font-title1-track)"   }],
        'title2':   ["var(--font-title2-size)",   { lineHeight: "var(--font-title2-line)",   letterSpacing: "var(--font-title2-track)"   }],
        'title3':   ["var(--font-title3-size)",   { lineHeight: "var(--font-title3-line)",   letterSpacing: "var(--font-title3-track)"   }],
        'headline': ["var(--font-headline-size)", { lineHeight: "var(--font-headline-line)", letterSpacing: "var(--font-headline-track)" }],
        'body':     ["var(--font-body-size)",     { lineHeight: "var(--font-body-line)",     letterSpacing: "var(--font-body-track)"     }],
        'callout':  ["var(--font-callout-size)",  { lineHeight: "var(--font-callout-line)",  letterSpacing: "var(--font-callout-track)"  }],
        'subhead':  ["var(--font-subhead-size)",  { lineHeight: "var(--font-subhead-line)",  letterSpacing: "var(--font-subhead-track)"  }],
        'footnote': ["var(--font-footnote-size)", { lineHeight: "var(--font-footnote-line)", letterSpacing: "var(--font-footnote-track)" }],
        'caption1': ["var(--font-caption1-size)", { lineHeight: "var(--font-caption1-line)", letterSpacing: "var(--font-caption1-track)" }],
        'caption2': ["var(--font-caption2-size)", { lineHeight: "var(--font-caption2-line)", letterSpacing: "var(--font-caption2-track)" }],
      },

      // ── Motion / Animation ──────────────────────────────────────────────────
      transitionDuration: {
        'instant': "var(--duration-instant)",
        'fast':    "var(--duration-fast)",
        'normal':  "var(--duration-normal)",
        'slow':    "var(--duration-slow)",
        'slower':  "var(--duration-slower)",
      },
      transitionTimingFunction: {
        'default':    "var(--ease-default)",
        'spring':     "var(--ease-spring)",
        'decelerate': "var(--ease-decelerate)",
        'accelerate': "var(--ease-accelerate)",
        'ios':        "var(--ease-ios)",
      },

      // ── Existing extensions (preserved) ─────────────────────────────────────
      maxWidth: {
        content: "480px",
      },
      height: {
        dvh: '100dvh',
      },
      minHeight: {
        dvh: '100dvh',
      },
      keyframes: {
        'story-ring-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.75' },
        },
        'story-progress': {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
        'story-viewer-in': {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'story-viewer-out': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0)', opacity: '0' },
        },
      },
      animation: {
        'story-ring-pulse': 'story-ring-pulse 2s ease-in-out infinite',
        'story-progress': 'story-progress linear forwards',
        'story-viewer-in': 'story-viewer-in 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'story-viewer-out': 'story-viewer-out 0.2s ease-in',
      },
    },
  },
  plugins: [],
};
export default config;

// tailwind.config.ts — Lumira Tailwind configuration
// v1.2 — Added Lumira design tokens (sage, terra, sand, status)
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

        // ── Lumira design tokens (hex named aliases) ──────────────────────────
        // Sage (primary green) — mirrors --color-primary-*
        sage: {
          50:  '#EDF4F2',   // --color-primary-light
          200: '#A8CECA',   // --color-primary-mid
          500: '#3D8178',   // --color-primary
          600: '#336B63',
        },
        // Terra (accent warm orange) — mirrors --color-accent-*
        terra: {
          50:  '#FDF0E6',   // --color-accent-light
          400: '#C4844E',   // --color-accent
        },
        // Sand (neutral base) — mirrors --color-surface
        sand: {
          0: '#FAFAF8',
        },
        // Status semantic colours
        'status-amber':       '#D69E2E',
        'status-amber-light': '#FFFFF0',
        'status-amber-dark':  '#744210',
        'status-green':       '#276749',
        'status-green-light': '#F0FFF4',
        'status-red-light':   '#FFF5F5',
        'status-red-dark':    '#822727',
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        DEFAULT: "var(--radius)",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      maxWidth: {
        content: "480px",
      },
      height: {
        dvh: '100dvh',
      },
      minHeight: {
        dvh: '100dvh',
      },
    },
  },
  plugins: [],
};
export default config;

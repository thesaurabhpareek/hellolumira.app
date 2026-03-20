# Lumira Design System

## Overview

Lumira is a warm, trustworthy parenting companion. The visual identity reflects calm confidence — a knowledgeable friend who never alarms unnecessarily but always takes things seriously. Every design decision prioritises legibility, accessibility, and emotional comfort over decoration. The palette draws from nature (sage greens, warm terra cotta, sand neutrals) to feel grounded rather than clinical or corporate.

---

## Color Tokens

### Brand Colors

| Token | Hex | CSS Variable | Tailwind Class | Usage |
|-------|-----|-------------|----------------|-------|
| Sage 500 | `#3D8178` | `--color-primary` | `text-primary` / `bg-primary` | Primary actions, interactive elements, links |
| Sage 600 | `#2E6B63` | — | `bg-sage-600` | Hover states, pressed primary buttons |
| Sage 200 | `#A8CECA` | `--color-primary-mid` | `border-sage-200` / `bg-sage-200` | Borders on sage-tinted backgrounds |
| Sage 50 | `#EDF4F2` | `--color-primary-light` | `bg-secondary` | Tinted backgrounds, selected chip backgrounds |
| Terra 400 | `#C4844E` | `--color-accent` | `text-accent` / `bg-accent` | Secondary actions, accent highlights |
| Terra 50 | `#FFF7ED` | `--color-accent-light` | `bg-terra-50` | Tinted accent backgrounds |

### Neutral / Sand

| Token | Hex | CSS Variable | Tailwind Class | Usage |
|-------|-----|-------------|----------------|-------|
| Sand 0 | `#FAFAF8` | `--color-white` / `--color-background` | `bg-sand-0` / `bg-background` | Page background, card surfaces |
| Sand 100 | `#E8E6E1` | `--color-border` | `border-border` | Dividers, input borders, card borders |
| Sand 500 | `#706D67` | `--color-muted` / `--color-muted-foreground` | `text-muted-foreground` | Secondary text, labels, timestamps |
| Sand 900 | `#1A1A1A` | `--color-slate` | `text-foreground` | Primary body text, headings |

### Status Colors

| Token | Hex | CSS Variable | Tailwind Class | Usage |
|-------|-----|-------------|----------------|-------|
| Amber | `#D69E2E` | `--color-amber` | `text-status-amber` / `bg-status-amber` | Warnings, pattern flags |
| Amber Light | `#FEFCE8` | `--color-amber-light` | `bg-status-amber-light` | Amber tinted backgrounds |
| Amber Dark | `#92400E` | `--color-amber-dark` | `text-status-amber-dark` | Text on amber backgrounds |
| Green | `#22C55E` | `--color-green` | `text-status-green` | Success, completion indicators |
| Green Light | `#F0FDF4` | `--color-green-light` | `bg-status-green-light` | Success tinted backgrounds |
| Red | `#E53E3E` | `--color-red` | `text-destructive` | Errors, emergency states |
| Red Light | `#FFF5F5` | `--color-red-light` | `bg-status-red-light` | Error tinted backgrounds |
| Red Dark | `#822727` | `--color-red-dark` | `text-status-red-dark` | Text on red backgrounds |

---

## Typography

All type uses **Plus Jakarta Sans** (Google Fonts), with `-apple-system` system fallback.

| Class | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `.text-display` | 28px | 700 | 1.2 | Hero headings, celebration screens |
| `.text-h1` | 24px | 700 | 1.3 | Page titles, modal headings |
| `.text-h2` | 20px | 700 | 1.4 | Section headings |
| `.text-h3` | 18px | 600 | 1.4 | Card titles, sub-headings |
| `.text-body` | 15px | 400 | 1.65 | Primary body copy, chat messages |
| `.text-body-sm` | 14px | 400 | 1.6 | Secondary body, option labels |
| `.text-caption` | 12px | 500 | 1.5 | Metadata, timestamps, labels |

Tailwind equivalents for common sizes: `text-sm` (14px), `text-base` (16px), `text-[15px]`, `text-[13px]`, `text-[12px]`, `text-[11px]`.

---

## Spacing & Layout

- **Content width**: `480px` max-width via `.content-width` class — applied to all scrollable feed and chat content areas
- **Page padding**: `16px` horizontal (`p-4`)
- **Card padding**: `20px` (`p-5`) standard, `24px` (`p-6`) for prominent cards
- **Section gap**: `16px` between feed cards (`mb-4`)
- **Bottom nav height**: `56px` — all fixed-bottom elements account for this
- **Safe areas**: `env(safe-area-inset-bottom)` used for iOS home indicator clearance; always combined with `max()` e.g. `max(16px, env(safe-area-inset-bottom))`

---

## Border Radius

| Token | Value | CSS Variable | Tailwind | Usage |
|-------|-------|-------------|----------|-------|
| `sm` | `8px` | `--radius-sm` | `rounded-sm` | Chips, badges, small elements |
| `md` | `12px` | `--radius-md` | `rounded-md` | Buttons, inputs, inner cards |
| `lg` | `16px` | `--radius-lg` | `rounded-lg` | Feed cards, overlays, panels |
| Full | `9999px` | — | `rounded-full` | Avatars, pill badges |

---

## Component Classes

These utility classes are defined in `globals.css` and should be used instead of re-implementing inline styles.

| Class | Description |
|-------|-------------|
| `.lumira-card` | Standard feed card: white background, `border-border`, `rounded-lg`, `p-5`, `mb-4` |
| `.btn-primary` | Full-width primary button: sage background, white text, `h-[52px]`, `rounded-md`, `font-semibold` |
| `.btn-ghost` | Ghost button: transparent background, border, muted text, same dimensions as `.btn-primary` |
| `.chip` | Option chip: compact pill button for structured field selection, sage-tinted border |
| `.chip-selected` | Selected state for `.chip`: sage background, primary text, stronger border |
| `.bubble-lumira` | Lumira chat bubble: sage-50 background, rounded corners, max-width constrained |
| `.bubble-parent` | Parent chat bubble: sage background, white text, right-aligned |
| `.shimmer` | Loading shimmer animation for skeleton placeholders |
| `.lumira-skeleton` | Skeleton block combining `.shimmer` with standard sizing |
| `.animate-fade-in` | Fade + slide-up entrance animation (uses `page-enter` keyframe) |
| `.page-enter` | Full page transition animation applied on route navigation |

---

## Animation System

All keyframes are defined in `globals.css`. Components reference them by name.

| Keyframe | Duration | Usage |
|----------|----------|-------|
| `page-enter` | 0.3s ease-out | Page-level fade/slide entrance |
| `notification-pulse` | 2s infinite | Unread notification badge pulse on bell icon |
| `badge-bounce-in` | 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) | Badge/achievement earned entrance |
| `badge-glow-pulse` | 1.5s ease-in-out infinite | Glow effect on earned badges |
| `lumiraEmojiFade` | 0.3s ease | Emoji rotation in LumiraTyping (inline in component) |
| `lumiraTextSlide` | 0.3s ease | Text slide in LumiraTyping (inline in component) |
| `lumiraSeedBounce` | 0.5s ease | Seed reward bounce in LumiraTyping (inline in component) |
| `milestone-confetti` | 2–4s ease-out | Confetti fall in MilestoneCelebration (inline in component) |
| `milestone-card-enter` | 0.5s cubic-bezier | Card spring entrance in MilestoneCelebration (inline in component) |
| `milestone-emoji-bounce` | 0.6s cubic-bezier | Emoji bounce in MilestoneCelebration (inline in component) |
| `notif-backdrop-in` | 0.15s ease | Notification panel backdrop fade (inline in component) |
| `notif-dropdown-in` | 0.2s ease | Notification dropdown slide-in (inline in component) |

Inline `<style>` blocks are kept within components only when the animation is component-specific and tightly coupled to component logic. Global, reusable animations belong in `globals.css`.

---

## Icon System

Custom SVG icons live in `/components/icons/`. Icons are inline SVG components accepting `size` and `color` props.

### Sizing conventions
- **Navigation icons** (bottom tab bar): `22px`
- **Inline icons** (buttons, chips, labels): `16px`
- **Notification / badge icons**: `20px`
- **Avatar / identity icons**: `28px` (chat), `40px` (standard), `48px` (prominent)

The `LumiraAvatar` component in `/components/app/LumiraAvatar.tsx` renders the brand mark SVG and accepts a `size` prop (default `40`).

---

## Design Principles

1. **Calm over clinical** — Use soft sage and sand tones rather than harsh whites and blues. Medical information is presented warmly, not alarmingly.

2. **Touch-first** — All interactive targets are minimum `48px` tall. Tap areas are generous. No hover-only interactions.

3. **Information hierarchy through weight** — Font weight (700/600/500/400) carries semantic meaning. Avoid color alone for hierarchy.

4. **Progressive disclosure** — Show just enough. Collapsible sections (BabyContextCard), lazy-loaded cards, and inline-only escalation banners keep the feed scannable.

5. **Feedback at every interaction** — Haptics (`triggerHaptic`), micro-animations on chips/buttons (`active:scale-[0.97]`), and loading indicators keep parents confident the app is responding.

6. **Safety is never buried** — Escalation banners, emergency overlays, and red-flag content always use visually distinct colors with sufficient contrast. Emergency overlays are full-screen and cannot be accidentally dismissed.

---

## Dark Mode

Dark mode CSS tokens are defined in `globals.css` under `@media (prefers-color-scheme: dark)` / `.dark` selectors but **full implementation is pending**. Components are written with semantic Tailwind tokens (`text-foreground`, `bg-background`, `border-border`) so they will respect dark mode once the token values are finalised.

---

## Enhancement Roadmap

- **Framer Motion transitions**: Replace CSS `animate-fade-in` class with `<motion.div>` variants for spring physics on card entrances and list reordering
- **Milestone celebrations**: Upgrade confetti from CSS-only to canvas-based for richer physics on major milestones
- **Article typography refresh**: Apply a custom prose stylesheet for `ArticleInsightCard` and `WeekGuideCard` — currently uses raw HTML from CMS
- **Stage progress indicator**: Visual week/month progress bar at the top of the home feed (design pending)
- **Shared animation tokens**: Extract `cubic-bezier(0.34, 1.56, 0.64, 1)` spring curve and standard durations into CSS custom properties for consistency

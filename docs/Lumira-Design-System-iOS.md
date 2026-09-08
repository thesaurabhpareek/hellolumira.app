# Lumira Design System — iOS / Cross-Platform Specification

**Rebuilding the component library to a native iOS quality bar, on vetted open source**
Version 1.0 · September 2026 · Companion to the Letters PRD
Target: Expo / React Native for iOS, with the Next.js web app retained

---

## 0. Executive summary

Lumira's design system today is three documents and one codebase that disagree with each other. Before anything native ships, that has to be resolved — otherwise the drift gets duplicated onto a second platform and becomes permanent.

**The eight decisions in this document:**

| # | Decision | Rationale |
|---|---|---|
| 1 | **Share tokens, hooks and types. Write the UI layer twice.** | Universal component kits optimize for parity, and parity pulls native screens toward web conventions. That is the opposite of the quality bar. |
| 2 | **NativeWind 4 + React Native Reusables** as the native base | Same Tailwind mental model as web (the single biggest complexity reducer for a non-engineer); MIT copy-paste components you own outright, same workflow as shadcn |
| 3 | **A hand-rolled ~80-line token build script**, not Style Dictionary, not Tamagui | Readable, debuggable, zero new dependency |
| 4 |  **Five color pairs fail WCAG AA, one of them fails even the 3:1 UI floor.** Fix by role separation | Computed and independently re-verified; the first pass had three errors. See §3.1 |
| 5 | **Kill the coral scale** | Live in `tailwind.config.ts`, documented nowhere, no semantic job |
| 6 | **Minimum tap target is 44pt, not 48px** | 48dp is an Android Material number that was copied into an iOS-first doc. This is a correctness bug |
| 7 | **Expo Router's native form-sheet** for sheets, not a JS reimplementation | Real `UISheetPresentationController` physics for free |
| 8 | **Springs, not durations**, for all motion | This is most of what separates native from "web app in a shell" |

**Everything recommended here is MIT or SIL OFL.** Per the directive: use vetted open source, build nothing that already exists well.

---

## 1. Ground truth — what the code actually says

Read directly from `/Users/saurabh/lumira-app`, not from the docs.

`app/globals.css` (1,996 lines) is the **real** source of truth, not PRODUCT.md and not DESIGN.md.

### 1.1 Conflict resolution table

| Token | PRODUCT.md | DESIGN.md | Code | **Winner** | Reason |
|---|---|---|---|---|---|
| Dark background | `#131210` | `#1A1A1A` | `#131210` | **`#131210`** | Already shipping. DESIGN.md conflated a *light-mode text color* (`--color-slate`) with a dark background — wrong on both the value and what it describes |
| `--radius-md` | 14px | 12px | 12px | **12px** | Code and DESIGN.md agree; PRODUCT.md is stale |
| `--radius-lg` | 18px | 16px | 16px | **16px** | Same |
| Terra 50 | `#FAF0EA` | `#FFF7ED` | `#FDF0E6` | **`#FDF0E6`** | Three-way disagreement. Code wins — it is the only value actually rendered. **Both docs need correcting, not the code** |
| Coral scale | absent | absent | full 10-shade, live in `--shadow-coral` | **Delete** — see §3.3 | Undocumented drift is the real bug |
| "Sand 900" | cited | cited | **does not exist** | **Retire the name**; build a real sand 0–950 ramp | Both docs cite a token that was never built. `tailwind.config.ts` defines only `sand.0` |
| Card component | — | — | **two incompatible implementations** | **`card.tsx` wins**; port `premium-card`'s variant API onto it | Only `card.tsx` uses semantic tokens correctly |

### 1.2 The component duplication is worse than assumed

There are effectively **three** competing button patterns, not two:
- `ui/button.tsx` (shadcn pattern, semantic RGB-triplet vars) — **imported in 1 file**
- `ui/premium-button.tsx` (bracket-syntax `var(--color-*)`, hand-rolled shadows) — **imported in 1 file**
- Raw `<button>`/`<div>` markup — **18 components bypass both**

`premium-card.tsx` also **ignores the real elevation scale** (`--shadow-sm/md/lg` exist) and hardcodes `rgba(0,0,0,0.06)` inline via cva. That is exactly what a token linter should catch.

Also: all four sheet/modal components (`bottom-sheet.tsx`, `half-sheet.tsx`, `dialog.tsx`, `premium-modal.tsx`) have **zero import sites**. They are built scaffolding, not shipped UI. That is good news — they can be redesigned freely.

**One genuinely good asset:** `lib/design-tokens.ts` (327 lines) is a real, typed, portable token file that would work in React Native as-is. It is just barely consumed — components use **402 raw Tailwind class strings** instead.

---

## 2. Token architecture

### 2.1 Three tiers, enforced

```
primitive:  {family}-{step}              sage-500, sand-950, terra-400
semantic:   color-{role}-{modifier}      color-surface-raised, color-text-primary
component:  {component}-{part}[-{state}] button-primary-bg, button-primary-bg-pressed
```

**Rule:** semantic may only reference primitive; component may only reference semantic. Enforce with a `scripts/lint-tokens.ts` regex scan that fails CI when a component-tier value contains a raw hex or `rgba()` literal. That single check catches today's `premium-card.tsx` problem and prevents its recurrence.

### 2.2 File structure and build

```
tokens/
  primitives.ts    // { sage: {50:'#F3FDFB', ..., 950:'#00251F'}, sand: {...}, ... }
  semantic.ts      // { light: {surfaceRaised: primitives.sand[0], ...}, dark: {...} }
  components.ts    // { buttonPrimaryBg: {ref:'semantic.colorPrimary'}, ... }
  shadows.ts       // per step: { css, ios:{shadowColor,shadowOpacity,shadowRadius,shadowOffset}, android:{elevation} }
  motion.ts        // spring tokens, §5
scripts/build-tokens.ts   // emits globals.css token block + packages/tokens/theme.native.ts
```

**Recommendation: a hand-rolled ~80-line `tsx scripts/build-tokens.ts`, run via `predev`/`prebuild`.**

Style Dictionary is the "correct" enterprise answer but adds a JSON/YAML transform layer that a non-engineer cannot debug when it breaks. Tamagui's token system means adopting Tamagui as the styling engine — a much bigger commitment (§4). Eighty lines of readable TypeScript that Claude Code can edit directly beats both.

**Migration is byte-identical first.** Step 1 ships `tokens/*.ts` generating CSS identical to today's `globals.css` — **zero visual diff, zero risk**. Only then does a second PR fix the real conflicts.

### 2.3 What does not translate between web and native

| Concern | Resolution |
|---|---|
| **CSS variables** | Do not exist in RN. Semantic and component tiers resolve to plain JS values at build time; RN never sees `var()` |
| **Shadows** | Hand-author the iOS/Android pair per shadow step. Only five steps exist — cheaper than parsing rgba strings |
| **rem vs pt** | Moot. The code already uses raw px everywhere, so values carry 1:1 to RN dp |
| **Color opacity** | A shared `withOpacity(hex, alpha)` helper generates both the Tailwind `rgb(var(--x)/<alpha>)` pattern and RN's `rgba()` strings from one source |
| **Dark mode** | Only the **semantic** tier forks. Web emits both CSS blocks; RN exports `lightTheme`/`darkTheme` consumed via `useColorScheme`. Primitive and component tiers never fork |

---

## 3. Color

### 3.1 Contrast audit — computed and independently re-verified

WCAG relative-luminance formula, sRGB→linear, run twice. **The first pass contained three errors** — generated ramp values had been silently substituted for the documented tokens. The table below uses the **documented PRODUCT.md §2.3 hexes** and has been recomputed from scratch.

| Pair (documented tokens) | Ratio | AA body 4.5:1 | AA large / UI 3:1 |
|---|---|---|---|
| Sage 500 `#3D8178` on Sand 0 `#FAFAF8` | **4.36** | ❌ FAIL | ✅ |
| White on Sage 500 | 4.56 | ✅ (barely) | ✅ |
| Terra 400 `#C4844E` on white | **3.11** | ❌ FAIL | ✅ |
| **Terra 400 on Terra 50 `#FAF0EA`** | **2.77** | ❌ **FAIL** | ❌ **FAIL** |
| Rose 400 `#D4607C` on Rose 50 `#FDF0F3` | **3.29** | ❌ FAIL | ✅ |
| **Amber 600 `#9A6B10` on Amber 50 `#FDF8EE`** | **4.42** | ❌ **FAIL** | ✅ |
| Sand 500 `#706D67` on Sand 0 | 4.93 | ✅ PASS | ✅ |
| Sand 300 `#B0ADA6` on Sand 0 | 2.14 | ❌ (see note) | ❌ |
| Sage 700 `#1F4F49` on Sand 0 | 8.84 | ✅ | ✅ |
| Sage 300 on `#131210` | 8.03 | ✅ | ✅ |
| Terra 300 on `#131210` | 8.13 | ✅ | ✅ |
| Rose 300 on `#131210` | 7.18 | ✅ | ✅ |
| Amber 300 on `#131210` | 9.92 | ✅ | ✅ |

**Two findings the first pass got wrong, both material:**

1. **Amber 600 on Amber 50 fails at 4.42**, not passes at 5.33. This is a live "watch — monitor this, not alarming" card in a health-adjacent product. It was reported as passing.
2. **Terra 400 on Terra 50 is 2.77 — it fails even the 3:1 large-text and UI floor.** This pairing is the "what's usually normal" warm reassurance card, and it is the worst contrast in the system. It was not tested at all in the first pass.

*(The first pass also wrongly failed Sand 500, which actually passes at 4.93.)*

**Note on Sand 300.** WCAG exempts disabled controls, so Sand 300 is fine for disabled states. It is **not** fine for placeholder text, which must be readable. Use Sand 500 for placeholders.

### 3.1.1 Corrected values

**Primary fix — role separation, not hex patching.** Do not ship two near-identical hexes per family. Codify:

> **Sage 500, Terra 400 and Rose 400 are UI, icon and large-text tokens only (3:1 floor). Body copy on light surfaces uses the 600 step.**

This is self-documenting and removes a whole class of future mistakes.

**Where a 500/400 step must carry body text**, these are the minimum-change corrections, computed by luminance search against the real background token:

| Token | Current | On | Corrected | Ratio |
|---|---|---|---|---|
| Sage body | `#3D8178` | Sand 0 | **`#3B7E75`** | 4.54 |
| Terra body | `#C4844E` | white | **`#9E6A3F`** | 4.58 |
| Terra body | `#C4844E` | Terra 50 | **`#94643B`** | 4.52 |
| Rose body | `#D4607C` | Rose 50 | **`#AF4F66`** | 4.58 |
| Amber body | `#9A6B10` | Amber 50 | **`#98690F`** | 4.55 |
| Placeholder | `#B0ADA6` | Sand 0 | **`#75736F`** | 4.53 |

**Action: the Terra-on-Terra-50 card and the Amber watch card need fixing before the native build, not after.** Both are in shipped light-mode UI today.

### 3.2 Generated ramps

Method: convert each anchor to OKLCH, hold hue fixed, piecewise-linear interpolate lightness toward L≈0.985 (step 50) and L≈0.145 (step 950), tapering chroma at both extremes to avoid gamut clipping.

| Step | Sage (H184) | Terra (H60) | Rose (H7) | Amber (H88) | Sand (C≈0) |
|---|---|---|---|---|---|
| 50 | `#F3FDFB` | `#FFF8F0` | `#FFF4F7` | `#FEFAEF` | `#FAFAFA` |
| 200 | `#8DD1C7` | `#F9B67F` | `#FF96B1` | `#F5D890` ◆ | `#C3C3C1` |
| 400 | `#589B92` | `#C4844E` ◆ | `#D4607C` ◆ | `#B89C56` | `#8F8F8D` |
| 500 | `#3D8178` ◆ | `#A86A33` | `#B84764` | `#9B8039` | `#767674` |
| 600 | `#226960` | `#8C5115` | `#9C2C4D` | `#7F6518` | `#5E5E5C` |
| 900 | `#00251F` | `#3A0B00` | `#450012` | `#301A00` | `#131210` ◆ |

◆ = original anchor, preserved exactly.

**Known defect, flagged not fixed:** above L=0.85 the chroma taper is too weak for Sage and Rose — the 100-step tints read minty and neon rather than pale. **Needs a steeper curve above L=0.85 before shipping.** Do not use the 100 steps until this is corrected.

### 3.3 Coral: delete it

Terra (H≈60, warm amber-brown) and Rose (H≈7, escalation red-pink) already bracket the warm hue range Lumira needs — a content-safe accent and an alert-safe accent. A third warm hue at H≈33 sits in the gap with no assigned semantic job. It would only get reached for when someone cannot decide between Terra and Rose, which is precisely how token systems rot.

**Assumption:** it entered `tailwind.config.ts` from a starter template or an early exploration that was never reconciled. Nothing in either design doc assigns it meaning. **Delete the scale.** If a genuine third semantic need appears later (a distinct milestone/celebration accent), generate it from that need, not from leftover config.

### 3.4 Dark mode: desaturate, do not invert

**Principle.** Dark mode is not `invert(lightness)`. Saturated mid-tones at full chroma vibrate against a near-black warm ground — simultaneous contrast makes high-chroma color look artificially bright and fatiguing at 2am, the opposite of calm.

**Rule:** on dark surfaces, lift lightness (L 0.55 → 0.72+, i.e. toward the 300 step) **and** cut chroma 15–25% at that lightness. That is why the 300 steps land at 7–10:1 above — they are not merely lighter, they are gentler.

**Elevation by lightness, not shadow.** Shadows read as blue-black smudges on warm dark and undercut the "not blue-black" premise.

| Layer | Lightness | Approx. |
|---|---|---|
| Base background | L 0.183 | `#131210` |
| Card surface | L 0.21–0.23 | |
| Modal / sheet | L 0.25–0.28 | |
| Popover | L 0.30 | |

Hairline borders, not shadows, separate elevated layers.

*Open question: confirm this reads correctly on OLED at very low brightness, where these deltas compress.*

### 3.5 Night mode: do not build it

A red-shifted dim reading mode duplicates what iOS Night Shift, True Tone, and low-brightness rendering already do system-wide, and Lumira's dark mode is already warm and low-blue by design. A third mode multiplies QA surface (light × dark × night × every screen) for a benefit users already get.

**If built anyway, there is a specific hazard:** red-shifted UI plus Rose-400 escalation is a legibility and semantic collision — red-on-red is the worst possible combination for an alert state. Scope it to the Letters reading screen only, never app-wide.

### 3.6 iOS semantic colors: use the mechanism, not the values

Do **not** map to `.systemBackground`, `.label`, or `UIColor.systemX` — Apple's system colors resolve to blue-tinted grays in dark mode, which directly fights the "no blue-black near a sleeping baby" premise, and the warm palette is the brand differentiator.

**Do** adopt `UIColor(dynamicProvider:)` as the *mechanism* for trait-responsive color assets. That is free infrastructure. Just feed it Lumira's own hex pairs.

---

## 4. Component library base

### 4.1 Evaluation

Versions and licenses verified against npm and GitHub, September 2026.

| Library | Version | License | Health | RN + Web | Styling | Verdict |
|---|---|---|---|---|---|---|
| **NativeWind** | 4.2.6 | MIT | Active | Same Tailwind syntax as web | Tailwind classes on RN via `react-native-css-interop` | **Adopt — styling engine** |
| **React Native Reusables** | CLI copy-paste (no version to track) | MIT | Active, multiple mirrors | RN + web via RNW | NativeWind | **Adopt — component base.** You own the source once copied; Claude Code edits it directly, same workflow as shadcn |
| **react-native-reanimated** | 4.6.0 | MIT | Active, standard | — | — | **Adopt — required** |
| **react-native-gesture-handler** | 3.2.1 | MIT | Active | — | — | **Adopt — required** |
| **@gorhom/bottom-sheet** | 5.2.14 | MIT | Active | — | — | Adopt *only* where native sheets cannot express the behavior (§7) |
| **expo-haptics** | SDK-pinned (57.0.2) | MIT | Expo core | — | — | **Adopt — essential** |
| **react-native-keyboard-controller** | 1.17.5 | MIT | Active | — | — | **Adopt — §7.3** |
| **moti** | 0.30.0 | MIT | Active | — | Declarative layer over Reanimated | Adopt — optional convenience |
| **whisper.rn** | see PRD §21.2 | MIT | Active | — | — | **Adopt — on-device STT** |
| Tamagui | 2.7.7 | MIT | Active, high churn | Yes, own compiler | Style-prop compiler | **Reject** — compiler surface too large to operate blind |
| gluestack-ui | 5.0.3 | MIT | Active | Yes | NativeWind underneath | Viable alternative to RNR; RNR preferred for the copy-paste ownership model |
| Shopify Restyle | 2.4.5 | MIT | Mature, low velocity | RN-first | Typed theme props | Reject — Box/Text only, you build every component anyway |
| React Native Paper | 5.15.3 | MIT | Active (Callstack) | Yes | Material | **Reject** — wrong aesthetic |
| Dripsy | 4.3.8 | MIT | **Stale, ~2yr** | Yes | Theme-based | **Reject — unmaintained** |
| react-native-unistyles | 3.3.0 | MIT | Active | RN-first | StyleSheet API | Reject for now — a second styling paradigm competing with web's Tailwind |
| `@gluestack-ui/themed` v1 | 1.1.73 | ISC | **Superseded, ~1yr stale** | — | — | **Reject** |
| Expo UI (SwiftUI primitives) | experimental | MIT | Emerging | iOS only, no web share | SwiftUI | Reject for MVP — forks the whole approach |
| @shopify/react-native-skia | 2.11.2 | MIT | Active | — | — | **Defer** — only for custom canvas work |

### 4.2 The sharing boundary — firm position

Tamagui and gluestack both sell "one component tree, two platforms." **Reject that promise for Lumira specifically.**

The deciding constraint is that Saurabh is non-technical and operates through Claude Code diffs. He cannot debug a cross-platform compiler when it silently mis-renders on one platform, and a universal abstraction is exactly where bugs hide behind a layer neither of you wrote. It also works *against* the stated goal: universal kits optimize for parity, and parity pulls native screens toward web conventions for press states, scroll physics, and sheet chrome — which is the definition of "web app in a shell."

**Sharing stops at:** design tokens (plain TS objects), business-logic hooks (Supabase queries, entry state machines, validation, age math), and TS/Zod types.

**Nothing visual crosses the boundary.**

**The honest counterargument:** "shadcn parity" between React Native Reusables and `@base-ui/react` is naming similarity, not shared code. If token discipline slips, you get two design systems that quietly drift — different button radii, different spacing, different motion timing — and a non-engineer cannot easily eyeball two codebases to catch it. Tamagui's compiler makes drift structurally impossible.

**Cost of being wrong:** visible but recoverable. Drift shows up as inconsistent tap targets or spacing, caught in review, fixed file by file — not a rewrite. If NativeWind's runtime interop hits a perf cliff on long lists, migrate only the hot-path screens, since NativeWind is isolated to component-level styling calls.

### 4.3 Component classification rule

> **If a file's only job is compute — fetch, transform, return typed data — it is shareable, at worst behind a platform adapter (storage, navigation, haptics). If it renders anything, it is written twice.**

| Category | Examples | Count |
|---|---|---|
| **Shared as-is** | `lib/pattern-rules.ts`, `lib/baby-age.ts`, `lib/badges.ts`, `lib/context-builder.ts`, `types/*.ts`, `lib/design-tokens.ts` | ~15 lib files |
| **Shared with adapter** | `useBabyProfile`, `useNotifications`, Supabase client wrapper, `lib/claude.ts` prompt logic | ~10 |
| **Written twice** | Everything in `components/ui/*` and `components/app/*`, all 27 pages | ~102 |

**Cannot be shared, full stop:** `next/navigation`, `next/image`, all server components, Tailwind class strings, DOM events.

---

## 5. Typography

### 5.1 Apple's real type scale — verified

Pulled directly from Apple's HIG data endpoint (`developer.apple.com/tutorials/data/design/human-interface-guidelines/typography.json`), "Large (default)" Dynamic Type tab. These are the true values, not approximations.

| Style | Weight | Size (pt) | Leading (pt) | Emphasized |
|---|---|---|---|---|
| Large Title | Regular | 34 | 41 | Bold |
| Title 1 | Regular | 28 | 34 | Bold |
| Title 2 | Regular | 22 | 28 | Bold |
| Title 3 | Regular | 20 | 25 | Semibold |
| **Headline** | **Semibold** | 17 | 22 | Semibold |
| Body | Regular | 17 | 22 | Semibold |
| Callout | Regular | 16 | 21 | Semibold |
| Subhead | Regular | 15 | 20 | Semibold |
| Footnote | Regular | 13 | 18 | Semibold |
| Caption 1 | Regular | 12 | 16 | Semibold |
| Caption 2 | Regular | 11 | 13 | Semibold |

Lumira's `tailwind.config.ts` already uses these exact names, which is a good sign — but it has no `Large Title`. Map `display` → Large Title.

### 5.2 The metric mismatch — measured

Plus Jakarta Sans was downloaded and measured with fontTools (unitsPerEm 1000): **x-height 536 (53.6%), cap-height 745 (74.5%)**. SF Pro's commonly cited metrics (~51.8% x-height, ~71.4% cap-height — **unverified**, Apple's font is not publicly downloadable) are smaller.

**Plus Jakarta Sans runs roughly 3–4% larger optically at the same point size.** Copy Apple's sizes verbatim and body text will look denser and heavier than the equivalent iOS screen; titles will crowd their leading.

**Fix: add leading, do not reduce size.** Shrinking fights legibility, which conflicts with the 2am-readability principle.

| Style | Apple | **Lumira (PJS)** |
|---|---|---|
| Body | 17 / 22 | **17 / 24** |
| Callout | 16 / 21 | **16 / 23** |
| Subhead | 15 / 20 | **15 / 22** |
| Footnote | 13 / 18 | **13 / 20** |
| Caption 1 | 12 / 16 | **12 / 18** |
| Caption 2 | 11 / 13 | **11 / 15** |
| Display, Title 1–3 | unchanged | **unchanged** — the larger leading already absorbs the bigger cap-height |

### 5.3 Dynamic Type

RN `Text` scales `fontSize` by `PixelRatio.getFontScale()` when `allowFontScaling` is true (the default), and this works identically for custom fonts.

**The gotcha that breaks most RN apps: RN does not auto-scale `lineHeight`.** A hardcoded `lineHeight: 24` with `fontSize` scaled 17 → 25.5 produces clipped, overlapping text. **Every text style must compute `lineHeight` as `Math.round(fontSize * ratio)` at render time via a shared hook, never as a static value.**

| Element class | `maxFontSizeMultiplier` | Rationale |
|---|---|---|
| **Journal entry body (reading view)** | uncapped, or 2.2 | This *is* the accessibility use case — a tired parent at 2am |
| App body / paragraph copy | 1.5 | Layout holds at 480px max-width |
| Buttons, tab labels, nav titles | 1.3 | Fixed containers must not overflow |
| Seeds/streak counters, level badges, avatar initials | `allowFontScaling={false}` | Fixed circular containers — scaling breaks the shape, not just the text |

**The known failure point is the 5-tab bottom nav at accessibility sizes AX1–AX5.** Required response: switch to icon-only tabs above a scale threshold (`PixelRatio.getFontScale() > ~1.6`, since RN has no direct `UIContentSizeCategory` bridge without a small native module), moving labels to `accessibilityLabel`. Also: **no fixed-height containers around body copy anywhere** — use `minHeight`, never `height`.

### 5.4 The 16px input rule does not carry over

The `input, textarea, select { font-size: 16px !important }` rule in `globals.css` exists solely because Mobile Safari zooms the viewport when a focused input computes below 16px. **Native RN `TextInput` has no viewport and does not zoom.** The rule is void in Expo.

What replaces it: size `TextInput` by the HIG Body style (17pt) for legibility, keep the 44pt tap-target minimum (unrelated, still applies), and apply the same multiplier caps. **Document this explicitly in the shared token layer** so nobody "fixes" native inputs back to 16px out of web muscle memory.

### 5.5 Font loading

Use Expo's static font config bundling local `require()` assets — **not** `Font.loadAsync` against a remote URL. Network font loading is a real FOUT risk and an unnecessary privacy surface (a CDN fetch on every cold start). Gate first paint behind `SplashScreen.preventAutoHideAsync()` as a safety net.

**Ship static weight files (400/500/600/700), not the variable font.** Lumira uses four weights, and RN/Fabric variable-font axis selection via `fontWeight` has a history of inconsistent behavior across versions. Named static families (`PlusJakartaSans-Regular/Medium/SemiBold/Bold`) are the reliable choice.

### 5.6 The reading face — a serif, for entry body only

**Recommendation: use a serif for journal entry body text, not Plus Jakarta Sans.**

The framing is "letters Meera could read at eighteen." That is a genre signal, and typography carries it: a distinct serif marks the journal as *written* rather than *app chrome*, the moment the parent opens it. *(Do not lean on serif-vs-sans reading-speed claims — they are contested on screen.)*

All candidates are SIL OFL 1.1 — free, commercial-safe, no attribution required:

| Face | Why |
|---|---|
| **Literata** ★ | Commissioned for Google Play Books, purpose-built for on-screen reading, optical-size axis tuned for small screens. **Top pick.** |
| Newsreader | Old-style book serif, warmer and more literary if Literata reads too neutral |
| Source Serif 4 | Safe, well-tested, slightly more clinical |

Plus Jakarta Sans keeps all journal-screen chrome — dateline, buttons, nav. **Only the letter body switches face.**

---

## 6. Motion

### 6.1 Springs, not durations

A duration + cubic-bezier animation is a fixed timeline: always exactly 300ms regardless of what is happening. A spring is a physics simulation with **velocity**, so it can be interrupted mid-flight and re-target smoothly — drag a sheet halfway, release, and it continues from *current velocity*, not from zero.

**This is the actual reason iOS feels alive and web-with-easing feels dead.** Every native iOS gesture transition is spring-interruptible; almost no `transition: ease-out 300ms` is.

**Apple's verified defaults** (developer.apple.com):
- `Animation.spring()` → `response: 0.5, dampingFraction: 0.825, blendDuration: 0`
- `Animation.interactiveSpring()` → `response: 0.15, dampingFraction: 0.86, blendDuration: 0.25`

`response` ≈ perceived duration in seconds; `dampingFraction` 1.0 = critical (no bounce), <1.0 = overshoot.

### 6.2 Spring token table

| Token | response | dampingFraction | Feel | Used for |
|---|---|---|---|---|
| `spring.snappy` | 0.28 | 1.0 | crisp, no bounce | tab switch, button press, toggle |
| `spring.standard` | 0.5 | 0.825 | Apple default | sheet present/dismiss, card expand |
| `spring.gentle` | 0.65 | 0.9 | slow settle | entry reveal, composing state |
| `spring.interactive` | 0.15 | 0.86 | tracks finger 1:1 | drag-to-dismiss, pull-to-refresh, swipe row |
| `spring.bouncy` | 0.55 | 0.68 | visible overshoot | **milestone / badge unlock only** |

**`spring.bouncy` is the only token allowed to overshoot.** Overuse of bounce is the single clearest tell of a non-native app. And per the Letters PRD: **no bounce anywhere in Letters.** No confetti on a letter to a child.

```ts
// tokens/motion.ts — imported by web (framer-motion) and native (reanimated)
export const springs = {
  snappy:      { duration: 0.28, bounce: 0    },
  standard:    { duration: 0.5,  bounce: 0.08 },
  gentle:      { duration: 0.65, bounce: 0    },
  interactive: { duration: 0.15, bounce: 0.05 },
  bouncy:      { duration: 0.55, bounce: 0.22 },
};
```

framer-motion's `bounce` (0–1) is roughly the inverse of `dampingFraction`; `bounce ≈ 1 − dampingFraction` is a **calibrate-by-eye approximation, not an exact formula** — framer defines `bounce` independently. Verify visually.

**Action item:** the existing `--ease-ios` / `--ease-spring` bezier curves in `tailwind.config.ts` must be reconciled against this table before native ships, or web and native will visibly mismatch.

### 6.3 Reanimated v4

`withSpring` accepts either `stiffness/damping/mass` **or** `duration/dampingRatio` (mutually exclusive). Use the second form — it is the direct analog of Apple's response + dampingFraction.

```ts
// Signature interaction 1 — the mic tap (Letters entry point)
const scale = useSharedValue(1);
const glow  = useSharedValue(0);

const onMicPressIn = () => {
  'worklet';
  scale.value = withSpring(0.94, { duration: 150, dampingRatio: 0.86 });
  runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
};

const onListeningStart = () => {
  glow.value = withSpring(1, { duration: 650, dampingRatio: 0.9 });
  runOnJS(Haptics.notificationAsync)(Haptics.NotificationFeedbackType.Success);
};

// Signature interaction 2 — tab indicator
const indicatorX = useSharedValue(0);
const tabStyle = useAnimatedStyle(() => ({
  transform: [{ translateX: withSpring(indicatorX.value, { duration: 280, dampingRatio: 1 }) }],
}));
```

**Why worklets are mandatory here, not merely preferred:** the mic press happens *during active audio capture*. Any JS-thread animation competes with the JS event loop for STT callback delivery and will stutter or drop frames at exactly the moment the parent needs confidence the app heard them.

### 6.4 Letters-specific motion

| Moment | Treatment |
|---|---|
| **Listening** | Continuous low-amplitude glow driven by **real audio amplitude**, not a decorative loop. A `withRepeat` loop reads as fake. Drive it from actual RMS ticks. |
| **Transcript appearing** | Word-by-word opacity stagger, `spring.snappy` per word, 40–60ms stagger — mimics live transcription, never a block paste |
| **Composing** | **Explicitly reject the spinner.** Slow single-breath scale pulse (`spring.gentle`, 1.0↔1.02, ~1.4s cycle). This must feel *unhurried by design*, not merely unoptimized |
| **Entry reveal** | `spring.gentle`, scale 0.97→1 plus opacity, 400–500ms. A settle, not a pop — a private artifact, not a badge |

### 6.5 Reduce Motion — required, not optional

Gate every non-essential spring on `AccessibilityInfo.isReduceMotionEnabled()` (Reanimated has native `useReducedMotion()` support).

- Overshoot springs → `dampingRatio` forced to 1.0, or instant
- Screen transitions → cross-fade only, no slide or scale
- Composing animation → **keep** (it conveys system state, not decoration) but strip scale, keep opacity pulse only
- **Haptics are unaffected.** Reduce Motion ≠ Reduce Haptics. They are separate accessibility axes

---

## 7. Navigation, sheets and keyboard

### 7.1 Expo Router migration

Expo Router's file conventions (`(group)`, `[param]`, `[...catchall]`, nested `_layout`) were built as a direct port of Next.js App Router semantics. The route *tree* migrates almost mechanically.

| Next.js | Expo Router | Effort |
|---|---|---|
| `app/(app)/layout.tsx` | `(app)/_layout.tsx`, swap `redirect()` for `router.replace` | Low |
| `home`, `chat`, `letters`, `profile` | `(app)/(tabs)/*.tsx` under `(tabs)/_layout.tsx` | Low |
| `[thread_id]`, `[slug]`, `[id]` | identical, pushed outside `(tabs)` | Low |
| `app/api/*` | **Stays as-is** — the Expo app calls the existing Next.js API routes over HTTPS | None |
| **Server components fetching Supabase** | **No RSC in Expo Router.** Every server-side fetch becomes a client hook | **This is the real cost** |

**The work is not learning a router. It is replacing every server-fetched prop with a client data hook** — and per PRD §21.5, that is most of the feature surface.

### 7.2 The tab bar

**Correction to a common assumption:** Lumira's bottom nav does **not** use lucide-react. It uses a custom stroke-based SVG set (`components/icons/index.tsx`, 24×24, 1.75px stroke, filled/unfilled pairs) modeled on Apple Health / Clue. Lucide is used elsewhere.

**Recommendation:** keep the custom set for brand identity — the filled/unfilled pairing already matches SF Symbol conventions, and it ports trivially via `react-native-svg`. Use `expo-symbols` (SF Symbols) only for *system* affordances where matching the OS matters more than brand: back chevron, share, ellipsis.

**Also note:** the nav **already has an elevated center slot** (`isCenter: true`, 44px circle, gradient, −6px raise) currently occupied by Chat. The Letters PRD moves it to `⊕ Tonight`.

**Dimensions.** iOS standard tab content height is **49pt**; total footprint with the home-indicator safe area is 83pt on Face ID devices. Port as `tabBarStyle: { height: 49 + insets.bottom }` using `useSafeAreaInsets()` — never a hardcoded value. The web `56px min-height` is already safe-area-inclusive.

**On current iOS appearance.** iOS 26 introduced Liquid Glass: translucent floating tab bars that could collapse to a single icon on scroll. There are reports (**single aggregated source citing Bloomberg's Gurman — treat as unverified**) that iOS 27 reverses the collapse behavior as a usability fix while keeping the glass material. *(Apple's own HIG pages are JS-gated and could not be fetched directly — this gap is stated honestly rather than papered over.)*

**Recommendation given the uncertainty: do not build a scroll-collapsing tab bar.** Ship a fixed, glass-blurred bar. That is where Apple is converging, not where iOS 26 briefly overshot.

### 7.3 Sheets

**Recommendation: use Expo Router's native form-sheet** (`sheetAllowedDetents`, `sheetInitialDetentIndex`, `sheetGrabberVisible`, `sheetCornerRadius`, `sheetLargestUndimmedDetentIndex`) for every sheet that is a navigation-level surface. It is `UISheetPresentationController` underneath, so you get the real velocity curve, the real rubber-band, and the real presenting-view scale-back for free, with zero JS bridge cost.

Reserve `@gorhom/bottom-sheet` for sheets that must live *inside* a screen with custom mid-interaction snap behavior. **Assessment: no Lumira surface currently needs this.**

*Note: iOS supports arbitrary detent counts; Android caps at 3. A `flex:1` layout fix for numeric detents landed in Expo SDK 55+.*

**Verified physics reference values** (from `half-sheet.tsx`, which is a good behavioral spec even though none of its code ports):

| Property | Repo value | iOS system | Recommendation |
|---|---|---|---|
| Grabber | 36×5pt | 36×5pt | ✅ matches — keep |
| Presenting-view scale-back | 0.97 | **0.92** | Use native sheets and get 0.92 free. A custom 0.97 reads as "almost native" |
| Rubber-band factor | 0.35 | 0.55 (UIScrollView) | Either match 0.55 or keep 0.35 **as a documented deliberate choice** — do not leave it accidental |
| Velocity dismiss | 0.5 px/ms | not published (**unverified**) | Keep. Do not invent a "more accurate" number |
| Corner radius | 16px | ~10–12pt system default | Reconcile with the token drift decision (§1.1) |
| Scrim | `rgba(0,0,0,0.4)`, blur 4px | ~0.3–0.4 | Inconsistent between the two repo files — **token drift, fix it** |

### 7.4 The keyboard — the transcript editor is the hard case

**Use `react-native-keyboard-controller` (1.17.5, MIT), not `KeyboardAvoidingView`.** RN's built-in component measures post-layout and lags or jumps on iOS. `keyboard-controller` drives an animated value off the native keyboard frame, so content resizes in the *same frame* the keyboard moves.

**The specific solution for the transcript editor** — a long-form multiline field inside a sheet, which is the hardest case in RN:

1. Present it as a native form-sheet at the **`large` detent only** — never `medium`. A resizing detent fighting a resizing keyboard is the exact failure mode that makes RN apps feel broken.
2. Pin the bottom action bar (Save / Done) above the keyboard with `translateY` tied to keyboard progress via `useKeyboardAnimation`.
3. Let the **content inside** the already-full-height sheet reflow via `KeyboardAwareScrollView`, so the caret line stays visible.
4. **Never let the sheet itself resize to dodge the keyboard.**

**Scroll vs. drag arbitration:** native form-sheets handle this correctly by default (UIKit arbitrates natively). Where gorhom is used, `BottomSheetScrollView`/`BottomSheetFlatList` are mandatory — a plain `ScrollView` inside gorhom breaks gesture arbitration. Rule for both: sheet drag activates only when inner `scrollTop <= 0`. (`half-sheet.tsx` already implements exactly this check — port the logic, not the code.)

### 7.5 Overlay inventory

| Surface | Presentation | Dismiss |
|---|---|---|
| Listening / recording | Native sheet, `medium` → `large` on transcript start | Swipe or tap outside |
| Transcript review & edit | Native form-sheet, **`large` only** | Explicit Save / Discard |
| **Escalation** | **Full-screen native modal, not a sheet** | **No swipe, no backdrop tap. Button only.** A safety-critical surface must not be accidentally swipe-dismissible |
| Entry share | Native `ActionSheetIOS` / share sheet | System default |
| Settings | Native form-sheet, `large` | Swipe or back |

**Consolidation:** all four web overlay components are unused and none port. `half-sheet.tsx`'s *physics values* become the shared token source for any non-native sheet. `premium-modal.tsx`'s centered non-dismissible variant survives as the *pattern* for the escalation overlay, not as code. On web, delete `bottom-sheet.tsx` (strictly worse than `half-sheet.tsx`, zero imports) after confirming no unmerged branch depends on it.

---

## 8. Accessibility

Treat this as correctness, not a checklist. Lumira's primary context — one-handed, dark room, exhausted, baby in the other arm — is itself an accessibility problem. **Situational impairment should drive the design as much as permanent disability does.**

### 8.1 Tap target: 44pt, not 48px

Apple's HIG specifies a **44×44pt** minimum tappable area. *(Corroborated consistently across sources quoting it directly; Apple's HIG pages are JS-rendered and blocked direct fetch — flagged honestly.)*

Lumira's docs say 48px. **That is an Android Material number (48dp) copied into an iOS-first document.** Change the token to **44pt minimum on iOS**; keep 48 as a web/Android floor only. This is a bug, not a style preference.

### 8.2 VoiceOver for the Letters flow

State machine: `idle → recording → transcribing → reviewing → saved`. **Every transition needs an explicit `announceForAccessibility()` call** — VoiceOver does not infer state from visual change.

```
Mic button:
  accessibilityRole="button"
  accessibilityLabel="Record tonight's letter"
  accessibilityHint="Double tap to start recording. You can also type instead."
  accessibilityState={{ busy: isRecording }}

On recording start:   "Recording. Tap again to stop."
On stop:              "Recording stopped. Transcribing."
On transcript ready:  "Transcription ready. Review your letter before saving."
On save:              "Letter saved for March 14."      ← never a bare "Saved"
On failure:           "Transcription failed. Your recording is saved.
                       Try again or type your letter."
```

The last string is **the highest-stakes string in the app.** It must never let the user believe the entry is gone.

Two rules: (1) move VoiceOver focus programmatically to the transcript field when the review screen appears, or the user is stranded on a now-dead mic button; (2) **do not re-announce the timer or waveform every second** — iOS has no polite live-region equivalent for continuously changing content, and it becomes audio spam. Announce start, stop, and errors only.

### 8.3 The voice-first irony

A voice-first nightly ritual is a hard exclusion for Deaf and hard-of-hearing users, users with a stammer or speech difference, users who cannot speak, and — most commonly — any parent with a sleeping baby or partner in the room.

**The typed path is not a fallback. It is co-equal.** Concretely: the mic button and the text field get **the same size and the same visual weight**, side by side or stacked with equal prominence. Interview questions render as visible text simultaneously — they are already text in a chat-style UI, so this is nearly free. Do not gate questions behind audio playback.

**Required framing change, stated plainly:** "it talks to you every night" should mean *Lumira initiates a text conversation that can optionally be spoken*, not an audio-first product. This does not weaken the vision. It is the only version of the vision that is not discriminatory by construction.

### 8.4 Accessibility settings response

| Setting | Detection API | Lumira must do |
|---|---|---|
| Reduce Motion | `isReduceMotionEnabled()` + `reduceMotionChanged` | Kill overshoot springs and slide transitions app-wide; cut celebrations to fade |
| Reduce Transparency | `isReduceTransparencyEnabled()` | Sheet and tab-bar blur become solid Sand fills |
| Increase Contrast | `isDarkerSystemColorsEnabled()` | Swap to a **pre-defined** higher-contrast token set — never runtime color math |
| Bold Text | `isBoldTextEnabled()` + `boldTextChanged` | Force `fontWeight` up one step app-wide |
| Differentiate Without Color | **No core RN API** — needs a small native module bridging `UIAccessibility.shouldDifferentiateWithoutColor` | See §8.5 — but build it color-independent by default so the bridge is not load-bearing |

### 8.5 Color independence

The escalation / watch / normal card system currently leans on color alone. Each card needs three redundant signals:

| Card | Color | Icon | Label | Border |
|---|---|---|---|---|
| Escalate | Rose | filled triangle | "Talk to your doctor" | solid 2px |
| Watch | Amber | half circle | "Keep an eye on this" | dashed |
| Normal | Sage | check | "This is normal" | none |

**Build this always-on.** Then the missing native bridge never gates correctness.

### 8.6 Cognitive accessibility and entry-loss prevention

Copy target: **6th–8th grade reading level** for all check-in and error strings. A 2am reader has no working memory to spare.

**Undo over confirm.** Deleting a letter is undo-with-a-toast (10s), never a confirm dialog.

**The P0 guarantee.** Every keystroke and every completed recording writes to local persistent storage **before any network call**. Save is optimistic-local-first; a failed Supabase write retries in background with the draft still visible. **A mistap, a killed app, or a dead connection must never destroy a night's entry.** Rosebud's App Store reviews — entries lost on voice capture — are the cautionary case. This is the single item to escalate above everything else in this document.

---

## 9. New components for Letters

| Component | Key props | Platform |
|---|---|---|
| `ListeningAura` | `amplitude`, `state: 'listening' \| 'idle' \| 'processing'`, `onStop` | Logic shared; Reanimated native / CSS+JS web |
| `FollowUpQuestionCard` | `question`, `index`, `total`, `onSkip`, `onAnswerVoice`, `onAnswerText` | Written twice |
| `ComposingState` | `phase: 'composing' \| 'slow' \| 'timeout' \| 'failed'`, `transcript`, `onRetry`, `onSaveRaw` | Written twice |
| `TranscriptEditor` | `transcript`, `onChange`, `knownNames`, `onLearnName` | Written twice |
| `LetterCard` (rebuild) | `entry`, `onPress` | Written twice |
| `LetterReadingView` (new) | `entry` | Written twice |
| `LetterTimeline` | `entries`, `onJumpToMonth`, `milestoneFilter` | Logic shared; FlashList native / windowed web |
| `MonthYearJumpSheet` | `months`, `onSelect` | Written twice |
| `LettersEmptyState` | `onStart` | Written twice |
| `LetterCountBadge` | `count`, `period: 'month'` | Written twice. **Never a streak** (PRD §14.6) |

**Reusable from the existing repo:** the `app/(app)/journal/page.tsx` list page shape (same server-fetch/RLS pattern — swap the card, add a sticky month header) and the save-with-retry pattern in `journal/new/page.tsx` (2 attempts, 1s backoff). **Not reusable:** `components/app/JournalEntry.tsx` (40 lines, renders an AI weekly summary — wrong content model entirely) and the plain `<textarea>` composer.

Full interaction specifications for these are in the Letters PRD §15.

---

## 10. Migration plan

### 10.1 Repo strategy: no monorepo yet

A Turborepo/Nx migration for a non-engineer solo-maintaining a live product is a real cost — new build pipeline, new CI, import-path rewrites across ~114 files, and a second place things can break, all before a single native screen ships.

**Recommendation: keep one repo.** Promote `lib/design-tokens.ts` into `lib/tokens/`, add a `lib/core/` folder for shared-with-adapter hooks, and build and test both inside the Next.js app. Create the Expo app as a **second, separate repo** consuming those via a private GitHub package. **Revisit a true monorepo only after 2+ native screens ship and duplication pain is proven, not assumed.**

### 10.2 Phased plan — nothing breaks in between

| Phase | Work | Ships |
|---|---|---|
| **0 — Web hygiene** | `tokens/*.ts` generating byte-identical CSS · fix the three real conflicts · retire "Sand 900" · delete coral · freeze `premium-*` (no new files) · extract Letters state into a real hook · delete or wire up the dead `useCheckinThread.ts` | Zero visual diff; proves the hooks pattern once, for real |
| **1 — Proof of approach** | Expo shell + **Letters only**. New code, no legacy DOM/Tailwind baggage, directly serves the emotional thesis | A native app with one excellent screen. Web unaffected |
| **2 — Capture** | whisper.rn on-device STT · Supabase auth via SecureStore · TestFlight with the 25–40 parent cohort | The night-2 validation gate |
| **3 — Decide** | Based on Phase 1–2 usage, decide whether to port Home and Chat | **Do not commit to a 5-tab native app up front** |

**Strangler pattern throughout:** each PR touching a `premium-card` screen swaps it for `card.tsx` plus a ported variant. **Never a dedicated "convert everything" PR.**

### 10.3 Why launch native with Letters only

Porting Home, Chat, Tribes and Content now means rewriting ~40 more components against an unproven adapter layer, while the actual thesis needs exactly one screen. **A narrow excellent single-screen app beats a mediocre five-tab port**, and it de-risks the "does the Expo token/hook/route plan actually work" question cheaply.

### 10.4 App Store prerequisites

| Item | Status | Confidence |
|---|---|---|
| Apple Developer Program, $99/yr | **Not enrolled** — no `eas.json` or Expo config in the repo | High |
| EAS Build + EAS Submit | Required. Expo's classic build service is retired; there is no other path to an App Store binary | High |
| App Privacy nutrition label | Mandatory. **Transcript and journal data collection must be declared honestly** | High |
| `NSMicrophoneUsageDescription` | Required for STT. **Missing this is an instant rejection** | High |
| `NSSpeechRecognitionUsageDescription` | Required if Apple's Speech framework is used at all | High |
| Bundle ID (`app.hellolumira`) | Not yet registered — confirm before Phase 1 | High |
| Review scrutiny | No special health category applies, but Guidelines 1.4.1 (physical harm / medical claims) and 5.1.1 (data minimization) apply. **Expect closer manual review** given parenting/health-adjacent framing | Medium, unverified against current review practice |

---

## 11. Open questions

1. Chroma taper above L=0.85 for Sage and Rose (§3.2). **Blocks use of the 100 steps.**
2. Does the dark elevation ladder hold on OLED at very low brightness?
3. Real on-device latency and model footprint for whisper.rn on an actual iPhone.
4. Reconciling the existing `--ease-*` beziers against the spring table (§6.2).
5. Sheet corner radius: 16px repo value vs ~10–12pt iOS default.
6. Whether any Lumira surface genuinely needs gorhom over native sheets. Current assessment: none.
7. Exact `react-native-reanimated` / `gesture-handler` peer floors for gorhom 5.2.14 — check at `expo install` time, do not hardcode.

---

## Sources

[Apple HIG Typography](https://developer.apple.com/design/human-interface-guidelines/typography) · [Apple — Animation.spring](https://developer.apple.com/documentation/swiftui/animation/spring(response:dampingfraction:blendduration:)) · [NativeWind](https://www.nativewind.dev/) · [React Native Reusables](https://reactnativereusables.com/) · [Reanimated withSpring](https://docs.swmansion.com/react-native-reanimated/docs/animations/withSpring/) · [@gorhom/bottom-sheet](https://gorhom.dev/react-native-bottom-sheet/) · [react-native-keyboard-controller](https://kirillzyusko.github.io/react-native-keyboard-controller/) · [expo-haptics](https://docs.expo.dev/versions/latest/sdk/haptics/) · [Expo Router](https://docs.expo.dev/router/introduction/) · [whisper.rn](https://github.com/mybigday/whisper.rn) · [Literata (SIL OFL)](https://fonts.google.com/specimen/Literata) · [Tamagui](https://tamagui.dev/) · [gluestack-ui](https://gluestack.io/) · [Shopify Restyle](https://github.com/Shopify/restyle) · [WCAG 2.1 contrast minimum](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html) · [RN AccessibilityInfo](https://reactnative.dev/docs/accessibilityinfo)

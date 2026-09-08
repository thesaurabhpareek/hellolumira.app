# Letters — Engineering Contract

**Every agent working on Letters reads this first and follows it without exception.**
Branch: `feat/letters`. Never commit to `main` or `fixes-from-session`.

---

## 1. Non-negotiables

1. **Everything is behind a feature flag.** No Letters code path executes without passing
   `isLettersEnabled()` from `lib/letters/flags.ts`. No module reads `process.env` for a
   Letters flag directly — `flags.ts` is the only place that is allowed to.
2. **Additive only. Nothing existing may break.** No `DROP`, no `ALTER ... DROP COLUMN`,
   no renaming an existing column, no changing an existing function signature, no deleting
   a component that something imports. The existing AI weekly-summary journal keeps working
   exactly as it does today (`entry_kind = 'ai_summary'` is the backfilled default).
3. **Stay in your lane.** You own the files listed for your ID in §5 and no others. If you
   need a change in a file you do not own, write it in your final report as a
   `REQUEST:` line. Do not edit it.
4. **The contract types are frozen.** `types/letters.ts` is the shared interface. Do not
   redefine, duplicate, or widen these types locally. If a type is genuinely wrong, report
   it — do not patch around it.
5. **Never log transcript text, entry bodies, or safety-trigger text.** Log ids, counts,
   tiers, durations. This is a hard privacy boundary, not a style preference.

## 2. Software engineering rules for AI-written code

These exist because AI-written code fails in predictable ways. Follow them literally.

- **Pure functions by default.** Business logic goes in `lib/`, is pure, takes its inputs
  as arguments, and returns values. No hidden I/O, no module-level mutable state, no
  reading the clock or `Math.random()` inside a pure function — inject those.
- **No business logic in components.** Components render what a hook gives them. Hooks own
  state and I/O. This is the rule PRODUCT.md claimed and the codebase did not follow; we
  are not repeating that mistake.
- **No direct Supabase calls from components.** Go through a hook or an API route.
- **Typed boundaries.** Every exported function has an explicit return type. No `any`.
  No non-null assertions (`!`) on values that come from the network or the database.
- **Every `lib/letters/*.ts` module ships with a colocated test** in
  `__tests__/letters/<name>.test.ts` using Vitest. Test the real edge cases: empty input,
  very long input, unicode, null fields, and the failure path — not just the happy path.
- **Errors are values at the boundary.** API routes return typed error shapes with a
  correct HTTP status. Never `throw` past a route handler. Never swallow an error silently.
- **No new dependencies** without stating the package, version, license, and why an
  existing dependency cannot do it. Default answer is no.
- **Small files.** If a module passes ~250 lines, it is doing too much — split it.
- **Idempotent migrations.** `IF NOT EXISTS`, `DO $$ ... EXCEPTION WHEN duplicate_object`.
  A migration must be safe to run twice.
- **No secrets in code.** No API keys, no service-role keys client-side.
- **Do not reformat, refactor, or "improve" code you did not write.** Diff noise hides bugs.

## 3. Definition of done

A lane is done when all of these are true:
- [ ] Code compiles: `npx tsc --noEmit` passes with no new errors
- [ ] Lint passes: `npm run lint` with no new warnings in your files
- [ ] Tests written and passing: `npx vitest run __tests__/letters/<yours>`
- [ ] Every new surface is flag-gated
- [ ] No file outside your lane was modified
- [ ] Your final report lists: files written, tests added, `REQUEST:` lines, and anything
      you could not verify

## 4. Governance and rollout

| Layer | Control | Default |
|---|---|---|
| Kill switch | `NEXT_PUBLIC_LETTERS_ENABLED` env var | `false` |
| Cohort | `NEXT_PUBLIC_LETTERS_ROLLOUT_PCT` (0-100, deterministic bucket by profile id) | `0` |
| Per-user | `letters_settings.nightly_enabled` | `true` once the row exists |
| Sub-feature | `NEXT_PUBLIC_LETTERS_<FLAG>` overrides `DEFAULT_SUBFLAGS` | see `flags.ts` |

`shaped_compose` and `audio_retention` default **OFF** pending founder decisions
(PRD §0.3-A and §0.3-C). Build both paths; the decision is a flag flip, not a rewrite.

**Rollback:** set `NEXT_PUBLIC_LETTERS_ENABLED=false` and redeploy. The migration is
additive, so no database rollback is required or permitted.

## 5. File ownership map

No two lanes share a file. This is what makes parallel work safe.

### Backend / lib
| ID | Owns |
|---|---|
| BE1 | `lib/letters/deslop.ts` |
| BE2 | `lib/letters/names.ts` |
| BE3 | `lib/letters/safety.ts` |
| BE4 | `lib/letters/prompt-selection.ts` |
| BE5 | `lib/letters/followups.ts` |
| BE6 | `lib/letters/compose-keep-words.ts` |
| BE7 | `lib/letters/compose-shaped.ts` |
| BE8 | `lib/letters/voice-profile.ts` |
| BE9 | `app/api/letters/session/route.ts`, `app/api/letters/transcript/route.ts` |
| BE10 | `app/api/letters/compose/route.ts`, `app/api/letters/entries/route.ts` |

### Frontend
| ID | Owns |
|---|---|
| FE1 | `components/app/letters/ListeningAura.tsx` |
| FE2 | `components/app/letters/TranscriptEditor.tsx` |
| FE3 | `components/app/letters/FollowUpQuestionCard.tsx` |
| FE4 | `components/app/letters/ComposingState.tsx` |
| FE5 | `components/app/letters/LetterCard.tsx`, `LettersEmptyState.tsx` |
| FE6 | `components/app/letters/LetterReadingView.tsx` |
| FE7 | `components/app/letters/LetterTimeline.tsx`, `MonthYearJumpSheet.tsx` |
| FE8 | `app/(app)/letters/page.tsx`, `app/(app)/letters/[id]/page.tsx` |
| FE9 | `app/(app)/letters/tonight/page.tsx` |
| FE10 | `hooks/useLettersSession.ts`, `hooks/useVoiceCapture.ts`, `hooks/useLetterTimeline.ts` |

### Content
| ID | Owns |
|---|---|
| CT1 | `lib/letters/prompts/age-bands.ts` |
| CT2 | `lib/letters/prompts/followup-templates.ts` |
| CT3 | `lib/letters/prompts/notifications.ts` |
| CT4 | `lib/letters/prompts/safety-copy.ts` |
| CT5 | `lib/letters/prompts/microcopy.ts` |

### Design
| ID | Owns |
|---|---|
| DS1 | `tokens/primitives.ts`, `tokens/semantic.ts` |
| DS2 | `tokens/motion.ts`, `tokens/shadows.ts` |
| DS3 | `scripts/build-tokens.ts` |
| DS4 | `app/globals.css` (contrast fixes only, §3.1.1 of the design spec) |
| DS5 | `components/app/PremiumBottomNav.tsx`, `components/icons/index.tsx` (Letters tab only) |

### DevOps
| ID | Owns |
|---|---|
| DO1 | `eas.json`, `app.config.ts`, `docs/APP-STORE-PREP.md` |
| DO2 | `.github/workflows/letters-ci.yml`, `docs/RELEASE-RUNBOOK.md` |

### Platform (SRE / security / privacy / data)
| ID | Owns |
|---|---|
| PL1 | `lib/letters/rate-limit.ts` |
| PL2 | `__tests__/letters/rls.test.ts` |
| PL3 | `lib/letters/redact.ts` |
| PL4 | `lib/letters/analytics.ts` |
| PL5 | `lib/letters/observability.ts` |
| PL6 | `lib/letters/export.ts` |
| PL7 | `lib/letters/retention.ts` |
| PL8-10 | Review only — write findings to `docs/reviews/`, no code |

### QE
| ID | Owns |
|---|---|
| QE1-8 | `__tests__/letters/*.test.ts` for the lane assigned, plus fixes **only** in files whose owning lane has completed |
| QE9-10 | `__tests__/e2e/letters.spec.ts` (Playwright) |

### Review-only lanes (no code)
Product, legal/compliance, and cross-functional leads write to `docs/reviews/<id>-<topic>.md`.

## 6. Reference documents
- `docs/Lumira-Letters-PRD.md` — the product spec. Section numbers cited in agent briefs refer to it.
- `docs/Lumira-Design-System-iOS.md` — tokens, contrast fixes, motion, accessibility.

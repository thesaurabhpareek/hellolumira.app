# Letters / Journaling — build status

Branch: `feat/letters` · 2 commits · **committed locally, NOT pushed** (sandbox has no
GitHub credentials). Run `git push -u origin feat/letters` from your own terminal.

**Feature is dark by default.** `NEXT_PUBLIC_LETTERS_ENABLED` is unset, so nothing in the
live app changes. Merging this branch is safe.

## Health
| Check | Result |
|---|---|
| `npx tsc --noEmit` | clean (app/lib/hooks/components) |
| `npm run lint` | clean, 0 warnings |
| `npx vitest run __tests__/letters` | **370 passing, 9 files** |
| Build-blocking issues | none known |

## What is built

**Contracts** — migration v48 (additive, idempotent, `entry_kind` = ai_summary\|log\|letter,
`source_entry_ids`, `letter_span`, one-log-per-day unique index), `types/letters.ts`
(frozen), `lib/letters/flags.ts` (3-layer gating, default OFF),
`docs/LETTERS-ENGINEERING-CONTRACT.md` (file ownership map + SWE rules for AI-written code).

**Core logic, pure and tested** — `deslop` (AI-slop removal, structural + lexical),
`names` (STT name correction; Soundex-gated, learns once), `safety` (deterministic
tiering, 92 tests, ego-dystonic vs intent separation), `prompt-selection`, `followups`,
`compose-keep-words` (**default mode**, authenticity invariant property-tested — no output
word absent from input), `compose-shaped`, `compose-letter`, `voice-profile`.

**API** — `session`, `transcript` (P0 persist-first), `compose`, `letter`, `entries`.

**UI** — ListeningAura (the aura, not a waveform), TranscriptEditor, FollowUpQuestionCard,
ComposingState, EntryCard, EntryReadingView, EntryTimeline, empty state, journal pages,
tonight flow, 3 hooks. Flag-off path on live routes verified byte-identical to today.

**Content** — age-bands (post-2022 CDC ages, verified against cdc.gov), followup templates,
notifications, safety copy, microcopy.

**Design** — tokens (primitives/semantic/motion/shadows), build + lint scripts.

**DevOps** — eas.json, app.config.ts, `docs/APP-STORE-PREP.md`, CI gates,
`docs/RELEASE-RUNBOOK.md`.

## Blockers before this can be enabled for anyone

1. **Migration v48 has NOT been applied** to the live Supabase project. Routes will 500
   until it is. Apply before flipping any flag.
2. **Perinatal clinician review of Tier 0/1/2 safety copy.** Hard gate. `lib/letters/safety.ts`
   and `lib/letters/prompts/safety-copy.ts` carry headers saying so.
3. **Named human owner for Tier 2 crisis escalation.** None exists in the repo. Release gate.
4. **Privacy counsel review** + Anthropic zero-retention terms in writing.
5. **Verify crisis numbers** (988, Postpartum Support International) before ship.
6. Your three PRD §0.3 decisions. Both compose modes are built; each is a flag flip,
   not a rewrite.

## Known debt (small, non-blocking)
- `__tests__/letters/__probe.test.ts` — scratch file, sandbox denied deletion. `git rm` it.
- `_to_delete/` — stray files + git locks the sandbox could not delete. Delete the folder.
- `scripts/lint-tokens.ts` reports ~893 pre-existing raw-hex violations repo-wide; CI is
  scoped to changed files only.
- DS3 flagged 35 changed / 79 removed tokens vs current globals.css needing sign-off before
  the token system replaces the hand-written CSS. Not wired in yet.
- Milestone detection for the timeline filter is not wired to a data source.
- Literata (reading serif) is not loaded; EntryReadingView falls back to a Georgia stack.

## Not built (rate limit stopped Wave 1; never dispatched)
10 SRE/security/privacy/data lanes, 5 product review, 5 designer review,
10 legal/compliance/x-fn review, QE2-10. The engineering contract's file ownership map
already reserves their lanes.

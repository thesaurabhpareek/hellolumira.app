# Letters — Release Runbook

Owner of this document: DO2. Source of truth for rollout mechanics is
`docs/LETTERS-ENGINEERING-CONTRACT.md` §4 (governance) and `lib/letters/flags.ts`
(the code) — if this runbook and the code ever disagree, the code is right and this
file is stale; fix the file.

This runbook covers the **web app** (Next.js on Vercel, this repo). Native/App Store
release mechanics (`eas.json`, `app.config.ts`, Apple Developer enrollment) are DO1's
lane — see `docs/APP-STORE-PREP.md`. Not duplicated here.

---

## 1. Do not launch without these (hard gates)

Every item below blocks going past **Dark**. This section exists because it is much
cheaper to stop here than to explain afterward why it shipped without one of these.

| Gate | Status as of this writing | Source |
|---|---|---|
| Perinatal clinician sign-off on `lib/letters/safety.ts` tiering rules **and** all Tier 1/Tier 2 copy (`lib/letters/prompts/safety-copy.ts`) | **Not done.** `safety.ts` carries a header stating this explicitly. | PRD §18 preamble, §18.4; contract note in `safety.ts` |
| Privacy attorney review (SPI handling, retention, export/delete, EU geofence) | **Not done.** | PRD §22, §1008 (legal risk table) |
| Anthropic zero-retention terms in writing | **Not done.** | PRD §22 dependencies list |
| Crisis numbers in `safety-copy.ts` verified current | Verified 2026-09-08 against primary sources (988 Lifeline, National Maternal Mental Health Hotline, PSI HelpLine). **Re-verify at every release** — a stale crisis number is worse than none. | `lib/letters/prompts/safety-copy.ts` header |
| Named human owner for Tier 2 safety escalation follow-up | **Not assigned. No name exists in any project doc as of this writing.** | PRD §20: *"A named human owner and a written runbook before launch. Not a queue."* — restated here as a hard release gate, see §6 below |

**If any row above is not "done," do not move past Dark, regardless of engineering
readiness.** None of these are DO2's to close — DO2's job is to make sure the gate is
checked, loudly, before each promotion.

---

## 2. The three-layer flag model

From contract §4 and `lib/letters/flags.ts`. Read the code — it is short and it is the
actual authority:

```
isLettersEnabled(ctx) =
     envEnabled()                              // Layer 1: kill switch
  && ctx.profileId != null
  && ctx.userEnabled !== false                 // Layer 3: per-user opt-out
  && rolloutBucket(ctx.profileId) < rolloutPercent()   // Layer 2: cohort %
```

| Layer | Control | Default | Notes |
|---|---|---|---|
| 1. Kill switch | `NEXT_PUBLIC_LETTERS_ENABLED` | `false` | Build-time env var. The emergency stop. |
| 2. Cohort | `NEXT_PUBLIC_LETTERS_ROLLOUT_PCT` (0–100) | `0` | Deterministic hash bucket of `profileId`, stable across sessions. **Not an allowlist** — there is no per-user override that bypasses the percentage. See §3 for what that means for the Internal stage. |
| 3. Per-user | `letters_settings.nightly_enabled` | `true` once the row exists | Lets an already-in-cohort user opt out. Cannot opt a user *into* a cohort they didn't bucket into. |
| Sub-feature | `NEXT_PUBLIC_LETTERS_<FLAG>` overrides `DEFAULT_SUBFLAGS` in `flags.ts` | `voice_capture` / `followup_questions`: on. `shaped_compose` / `audio_retention`: **off** pending founder decisions (PRD §0.3-A, §0.3-C). `print_export` / `partner_sharing`: off, deferred to v1.1. | Independent of the main rollout — a sub-flag can only be `true` if `isLettersEnabled` is already `true`. |

### 3. Stages and exact env values

| Stage | `NEXT_PUBLIC_LETTERS_ENABLED` | `NEXT_PUBLIC_LETTERS_ROLLOUT_PCT` | Where it's set |
|---|---|---|---|
| **Dark** | `false` | `0` (or unset) | Production. This is the resting state until every gate in §1 is checked. |
| **Internal** | `true` | `100` | **A Vercel Preview/staging deployment only, gated by Vercel deployment protection (SSO/password) to the internal team** — production stays `false`/`0`. See caveat below. |
| **1%** | `true` | `1` | Production |
| **10%** | `true` | `10` | Production |
| **100%** | `true` | `100` | Production |

**Caveat, stated plainly:** `flags.ts` has no allowlist-by-user-id mechanism — the
cohort layer is purely a percentage over a hash bucket, so there is no code-level way
to say "these five staff accounts, regardless of bucket, in production." The Internal
stage above works around that by using a separate deployment (100% rollout) rather than
carving an allowlist into production traffic. If true production dogfooding (same DB,
same traffic, staff-only visibility) is wanted later, that requires adding an allowlist
to `flags.ts` — a scoped change, not something to route around in this runbook.

Sub-flags (`shaped_compose`, `audio_retention`) stay at their coded defaults (`false`)
through every stage above unless a founder decision (§0.3-A / §0.3-C) explicitly flips
one. Flipping a sub-flag is a separate, deliberate action — never bundle it with a
rollout-percentage promotion.

**Promotion order between stages is sequential and one-way forward under normal
operation** — do not skip from 1% to 100%. Hold each stage long enough to read the
metrics in §5 against a real day-night cycle (bedtime-clustered usage) before
promoting.

---

## 4. Migration v48

`supabase/migrations/lumira_v48_letters.sql`.

- **Additive only.** Every column add uses `ADD COLUMN IF NOT EXISTS`; every new
  constraint is wrapped `DO $$ ... EXCEPTION WHEN duplicate_object THEN NULL; END $$`.
  Safe to run twice. Extends `journal_entries` rather than replacing it — the existing
  AI weekly-summary journal (`entry_kind = 'ai_summary'`, backfilled default) keeps
  working untouched.
- **Must be applied before any code that reads the new columns ships to an
  environment.** A deploy that ships code referencing `entry_kind`, `raw_transcript`,
  `source_entry_ids`, etc. against a database that hasn't run this migration will fail
  at the query, not at build time — apply the migration first, confirm it, then deploy
  code.
- **⚠ As of this writing, this migration has NOT been applied to the live (production)
  Supabase project.** Do not promote past Dark until it has been applied there and
  verified (e.g. `SELECT column_name FROM information_schema.columns WHERE
  table_name='journal_entries' AND column_name='entry_kind';` returns a row).
- **There is deliberately no DB rollback for this migration**, and none should be
  written. Contract §4: *"Rollback is a flag flip."* Reverting the flag makes every new
  column and table inert (nothing reads or writes them) without touching schema. Do not
  `DROP` these columns to "roll back" — that is explicitly forbidden by contract §1.2
  regardless of what stage the rollout is at.

---

## 5. What to watch, per stage

Watch these from the moment a stage goes live through at least one full day-night
cycle before promoting. Sources: Vercel function logs / Supabase logs today; the
metrics below should graduate to `lib/letters/analytics.ts` / `observability.ts`
(PL4/PL5) as those lanes land — **as of this writing those modules do not exist yet**,
so treat structured dashboards as a dependency, not a given, and fall back to log
queries in the meantime.

| Metric | Read | Threshold |
|---|---|---|
| **Transcript-persist failure rate** | Any failure to persist a completed recording/keystroke to durable storage. | **Must be zero.** PRD §15.5 treats entry loss as P0. Any nonzero value, at any stage, triggers the incident procedure in §6 immediately — do not wait for a pattern. |
| Compose failure rate | Failed calls in the compose pipeline (`app/api/letters/compose/route.ts`), independent of transcript persistence — contract §1.5 / PRD §15.5: *"Compose failure must never touch the transcript."* A compose failure with the transcript intact is degraded, not P0; a compose failure that takes the transcript with it **is** P0. | Alert and investigate above ~2% sustained over 15 minutes. Confirm on every failure that the source log/transcript survived. |
| Safety flag tier distribution | Daily count of Tier 1 and Tier 2 outputs from `lib/letters/safety.ts`, as a share of entries. | No PRD-specified absolute target — this is a heuristic string-matcher, not a validated instrument (see `safety.ts` header). Watch for a **sudden shift** from baseline (established during Internal/1%) — a spike usually means a regression in the matcher (false positives) or a copy/prompt change upstream, not a change in real user distress. Investigate any material week-over-week shift before promoting. |
| p95 compose latency | Time from compose request to composed body returned. | **No PRD-specified numeric target** — PRD §22 lists "real compose latency on an actual device" as something still to be validated, not a committed number. Establish a baseline during the Internal stage and alert on regression relative to that baseline (e.g. sustained >2× baseline), not against an invented absolute number. |
| Claude spend per active user | Anthropic console spend ÷ Letters DAU for the period. | PRD §21.3 models ~$0.48–$1.02/user/month optimized. Alert if trending materially above the high end — likely means `shaped_compose` is seeing more traffic than intended, or prompt caching (§21.3) isn't hitting. |

---

## 6. Incidents

### 6.1 Entry-loss report ("I lost an entry")

Treat as **P0** the moment it's reported, before confirming root cause — PRD §20 sets
the target at zero and calls any instance a P0 incident.

1. **Do not roll back the migration.** Roll back the *feature*: set
   `NEXT_PUBLIC_LETTERS_ENABLED=false` and redeploy (§7). This stops new exposure while
   you investigate — it does not touch already-written data.
2. Check whether the loss is at persistence (worse — violates §15.5's core guarantee)
   or at compose (recoverable — the source log/transcript should still exist; a letter
   failing to compose is not the same failure as a log failing to save).
3. Pull the affected row(s) by profile/entry id from Supabase directly — do not ask the
   reporting parent to reproduce it by trying again.
4. Do not close the loop with the parent until you can state, specifically, whether
   their words are recoverable or genuinely gone. A vague "we're looking into it" is
   worse than an honest "that entry is not recoverable" — see PRD §15.5's framing of
   what this product is promising.
5. File the incident with: timestamp, profile id (never the content), which layer
   failed (client persistence / network / API / DB), and whether it's isolated or
   systemic (check for a shared cause — e.g. a bad deploy, a Supabase incident).
6. Post-incident: this class of bug pauses the current rollout stage until root-caused,
   regardless of how small the blast radius looks.

### 6.2 Tier 2 safety escalation

`lib/letters/safety.ts` Tier 2 (self-harm, harm-to-child, infant safety, domestic
violence, severe maternal distress) shows the parent a **fixed, non-AI template** with
crisis resources — the module itself does nothing further, by design (it must never
refuse, edit, or withhold the parent's words).

**PRD §20 is explicit: this feature must not launch without a named human owner for
Tier 2 escalation follow-up, and a written runbook — "not a queue."** As of this
writing:

- **Named owner: not yet assigned.** No name appears in any project doc.
- **This is restated here as a hard release gate** (§1): do not promote past Dark
  until a specific person is named, has agreed to the responsibility, and this section
  is updated with their name and the actual follow-up procedure (what "follow-up" means
  operationally — Lumira is not a crisis service and the copy must not imply it is one;
  clarify with the clinician reviewer in §1 what, if anything, follow-up entails beyond
  the in-product resources).
- Until an owner is named and this section is filled in with a real procedure, treat
  the absence itself as the blocking issue, not something to route around with a
  support queue — the PRD is specific that a queue is not sufficient here.

---

## 7. Rollback procedure

1. Set `NEXT_PUBLIC_LETTERS_ENABLED=false` in the environment for the affected scope
   (production, or the specific preview deployment).
2. Redeploy (env var changes require a redeploy to take effect for
   `NEXT_PUBLIC_*` build-time vars on Vercel/Next.js).
3. **Verify the feature is fully dark**, not just "should be":
   - Confirm `isLettersEnabled` returns `false` for a known test profile (a quick check
     via the app, or a unit-style smoke check against `flags.ts` with the deployed env
     values).
   - Confirm the Letters UI surfaces (`app/(app)/letters/*`, the Tonight entry point)
     render their disabled/absent state, not a broken one — a flag flip should make the
     feature *invisible*, not error.
   - Confirm no new writes are occurring to the v48 columns (spot-check
     `journal_entries` for new rows with `entry_kind IN ('log','letter')` post-rollback
     — there should be none).
4. No database action is required or permitted (§4). Existing Letters data is left in
   place — the flag flip is the entire rollback.
5. Do not re-promote until the root cause is understood and, if it was a code defect,
   fixed and covered by a test per contract §2/§3.

---

## 8. Pre-launch checklist (gates rollout past Dark)

Restates §1 as a literal checklist, plus the operational item this document owns:

- [ ] Perinatal clinician has reviewed and signed off on Tier 1 copy and the
      `safety.ts` tiering logic
- [ ] Privacy attorney has reviewed data handling, retention, export/delete, and SPI
      classification
- [ ] Anthropic zero-retention terms obtained in writing
- [ ] Crisis numbers in `safety-copy.ts` re-verified against primary sources within the
      last release cycle
- [ ] **Named human owner for Tier 2 escalation follow-up is assigned and §6.2 of this
      document is updated with their name and a real procedure**
- [ ] Migration `lumira_v48_letters.sql` applied to the live Supabase project and
      verified (§4)
- [ ] `letters-ci.yml` green on the PR promoting the stage
- [ ] Baseline metrics (§5) captured from the Internal stage before setting a
      production percentage above 0

None of these are satisfied by this document existing — this is the checklist, not the
completion of it.

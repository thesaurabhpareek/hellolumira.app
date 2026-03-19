# Lumira Instrumentation, Analytics & Schema Naming Audit

**Audit Date:** 2026-03-19
**Auditor:** Staff Data Engineer
**Standard:** GA4 / Segment / Amplitude naming conventions

---

## 1. Analytics Event Taxonomy

### Verdict: STRONG

The `lib/analytics.ts` event taxonomy is well-structured. All 46 events follow
`object_action` snake_case pattern with consistent past-tense verbs. Events are
grouped by category via comments. No camelCase or PascalCase names found.

| Finding | Priority |
|---------|----------|
| No violations found in event names | n/a |

**Minor observations (no fix needed):**
- `tab_switched` and `page_viewed` are in a "Navigation" category but lack an
  `navigation_` prefix. This is acceptable per GA4 conventions (short generic
  names are fine for high-frequency events).
- `avatar_selected` could be `profile_avatar_selected` for hierarchy, but the
  current name is unambiguous in context.

---

## 2. Event Properties

### Verdict: GOOD with one gap

| # | Finding | File | Line | Current | Recommended | Priority |
|---|---------|------|------|---------|-------------|----------|
| 2.1 | `trackEvent` payload includes `session_id`, `timestamp`, `url` by default. Good. Missing `user_id` / `profile_id` in the automatic envelope. | `lib/analytics.ts` | 59-65 | No `profile_id` in payload | Add optional `profile_id` to payload when `identifyUser` has been called | P1 |

---

## 3. Console / Server Logging

### Verdict: GOOD with specific issues

All log statements use `[module-name]` prefix format consistently. Log levels
are appropriate (error for errors, warn for warnings, log for info). Structured
context objects are passed alongside messages.

| # | Finding | File | Line | Current | Recommended | Priority |
|---|---------|------|------|---------|-------------|----------|
| 3.1 | **PII in logs**: `resend.ts` logs `{ to, subject }` where `to` is a raw email address | `lib/resend.ts` | 115, 144, 151 | `{ to, subject }` | `{ to_hash: sha256(to), subject }` or omit `to` entirely | P0 |
| 3.2 | **PII in logs**: `invite-partner/route.ts` logs email-related error with potentially PII context | `app/api/invite-partner/route.ts` | 94, 97 | `emailError.message` may contain email | Ensure error messages are sanitized | P2 |
| 3.3 | **Missing prefix**: `early-access/route.ts` uses bare `console.error('Early access insert error:', error)` | `app/api/early-access/route.ts` | 52 | `'Early access insert error:'` | `'[early-access] Insert error:'` | P1 |
| 3.4 | **Inconsistent prefix casing**: `lib/analytics.ts` uses `[Analytics]` (PascalCase) while all other modules use lowercase `[audit]`, `[resend]`, `[consent]` | `lib/analytics.ts` | 68, 90 | `[Analytics]` | `[analytics]` | P1 |
| 3.5 | **Inconsistent prefix format**: Notification API routes use `[GET /api/notifications]` and `[POST /api/notifications/mark-read]` (HTTP method + full path) while all other routes use short module names like `[chat]`, `[consent]` | `app/api/notifications/*.ts` | various | `[GET /api/notifications]` | `[notifications]`, `[notifications/mark-read]` etc. | P2 |
| 3.6 | **Error boundary logs pass raw Error objects**: All error boundaries log `error` objects which may contain user-visible stack traces with file paths | `app/(app)/*/error.tsx` | 13 | `console.error('[X Error Boundary]', error)` | `console.error('[X Error Boundary]', error.message)` | P2 |

---

## 4. Database Schema Naming

### Verdict: EXCELLENT

All table and column names follow PostgreSQL/snake_case conventions:

- **Table names**: plural snake_case (profiles, baby_profiles, daily_checkins, concern_sessions, chat_threads, chat_messages, notifications, consent_records, etc.)
- **Column names**: snake_case (created_at, profile_id, baby_id, emotional_signal, etc.)
- **Foreign keys**: `{table_singular}_id` pattern (profile_id, baby_id, thread_id)
- **Timestamps**: `created_at`, `updated_at`, `read_at`, `triggered_at`, etc.
- **Booleans**: `is_read`, `is_dismissed`, `is_archived`, `follow_up_sent`, `red_flag_detected`, `is_structured_response` -- most use `is_` prefix
- **Enums**: lowercase snake_case values throughout
- **Status fields**: proper tense (pending, processing, completed, expired)

| # | Finding | File | Line | Current | Recommended | Priority |
|---|---------|------|------|---------|-------------|----------|
| 4.1 | `first_checkin_complete` — boolean missing `is_` prefix | `types/app.ts` | 8 | `first_checkin_complete` | `is_first_checkin_complete` | P2 |
| 4.2 | `first_time_parent` — boolean missing `is_` prefix | `types/app.ts` | 7 | `first_time_parent` | `is_first_time_parent` | P2 |
| 4.3 | `follow_up_sent` — boolean missing `is_` prefix | `types/app.ts` | 122 | `follow_up_sent` | `is_follow_up_sent` | P2 |
| 4.4 | `prep_message_sent` — boolean missing `is_` prefix | `types/app.ts` | 182 | `prep_message_sent` | `is_prep_message_sent` | P2 |
| 4.5 | `red_flag_detected` on chat_messages — already uses correct `is_`-less naming since it reads as past participle. Acceptable. | n/a | n/a | n/a | n/a | n/a |

**Note on 4.1-4.4:** These are P2 cosmetic issues. Renaming DB columns is a
breaking migration that must be coordinated with a full deployment. Not worth
the risk for `is_` prefix compliance alone.

---

## 5. API Response Schema Naming

### Verdict: MIXED — camelCase in responses

| # | Finding | File | Line | Current | Recommended | Priority |
|---|---------|------|------|---------|-------------|----------|
| 5.1 | **camelCase in chat escalation response**: `immediateAction`, `actionUrl` | `app/api/chat/route.ts` | 200-203, 413-416 | `immediateAction`, `actionUrl` | `immediate_action`, `action_url` | P1 |
| 5.2 | **camelCase in RedFlagResult type**: `immediateAction`, `preAuthoredMessage`, `actionUrl` | `types/chat.ts` | 54-56 | camelCase fields | snake_case fields | P1 |
| 5.3 | **camelCase in ESCALATION_CONFIG**: `cardType` field | `types/chat.ts` | 72 | `cardType` | `card_type` | P2 |
| 5.4 | **camelCase in ConcernQuestion type**: `inputType`, `scale_min_label` / `scale_max_label` mixed | `types/app.ts` | 86 | `inputType` | `input_type` | P1 |
| 5.5 | **Inconsistent error response shapes**: Some routes return `{ error: 'string' }`, others `{ error: true, message: 'string' }` | various API routes | various | Mixed shapes | Standardize on `{ error: string, code?: string }` or `{ error: true, message: string }` | P1 |
| 5.6 | **Inconsistent success response**: `early-access` returns `{ success: true }`, analytics returns `{ ok: true }` | `app/api/early-access/route.ts`, `app/api/analytics/route.ts` | various | Mixed `success`/`ok` | Standardize on `{ success: true }` | P2 |

---

## 6. Audit Log Schema

### Verdict: STRONG

The `lib/audit.ts` audit event types use `object_action` snake_case pattern
consistently: `account_created`, `profile_updated`, `consent_granted`,
`data_export_requested`, etc. All 18 event types follow the convention.

| # | Finding | File | Line | Current | Recommended | Priority |
|---|---------|------|------|---------|-------------|----------|
| 6.1 | Audit events use `object_action` (e.g., `consent_granted`) instead of `object.action` (e.g., `consent.granted`). The `object_action` pattern is actually more common in modern analytics and avoids issues with dot-separated keys in JSON. | `lib/audit.ts` | 18-37 | `object_action` | Keep as-is. `object_action` is the dominant convention. | n/a |

No violations found.

---

## Summary of Fixes Required

### P0 — Breaks data pipeline / PII leak
| # | Issue | Action |
|---|-------|--------|
| 3.1 | PII (email) in production logs via resend.ts | Remove `to` from log context objects |

### P1 — Inconsistency affecting data quality
| # | Issue | Action |
|---|-------|--------|
| 2.1 | Missing profile_id in analytics payload | Add profile_id to trackEvent payload |
| 3.3 | Missing log prefix in early-access route | Add `[early-access]` prefix |
| 3.4 | Inconsistent `[Analytics]` prefix casing | Change to `[analytics]` |
| 5.1 | camelCase in chat API response (immediateAction, actionUrl) | Add snake_case aliases with deprecation |
| 5.2 | camelCase in RedFlagResult type | Add snake_case aliases |
| 5.4 | camelCase `inputType` in ConcernQuestion | Add snake_case alias |
| 5.5 | Inconsistent error response shapes | Document standard; fix is too broad for this pass |

---

## Fixes Applied

### P0 Fixes

**3.1 PII in resend.ts logs** -- `lib/resend.ts` lines 115, 144, 151
- Removed `to` (email address) from all `console.error` and `console.warn`
  context objects. Only `{ subject }` is logged now.

### P1 Fixes

**2.1 Missing profile_id in analytics payload** -- `lib/analytics.ts`
- Added `identifiedProfileId` module-level variable.
- `identifyUser()` now stores the profile ID.
- `trackEvent()` now includes `profile_id` in every payload.

**3.3 Missing log prefix in early-access route** -- `app/api/early-access/route.ts` line 52
- Changed `'Early access insert error:'` to `'[early-access] Insert error:'`.

**3.4 Inconsistent [Analytics] prefix casing** -- `lib/analytics.ts` lines 68, 90
- Changed `[Analytics]` to `[analytics]` to match all other module prefixes.

**5.1 + 5.2 camelCase in chat API response and RedFlagResult type** --
`types/chat.ts`, `lib/red-flag-scanner.ts`, `app/api/chat/route.ts`
- Added snake_case canonical fields (`immediate_action`, `pre_authored_message`,
  `action_url`) to `RedFlagResult` type alongside deprecated camelCase fields.
- Created `makeResult()` helper in red-flag-scanner to populate both key sets.
- Updated both chat API response locations to emit both `immediate_action` /
  `immediateAction` and `action_url` / `actionUrl`.
- All existing client code continues to work via the deprecated camelCase fields.

**5.4 camelCase inputType in ConcernQuestion** -- `types/app.ts` line 86
- Added `input_type` snake_case field alongside deprecated `inputType`.
- Component `ConcernStepCard.tsx` continues using `inputType` with no breakage.

### Not Fixed (P2 / Deferred)

- Boolean column `is_` prefix compliance (4.1-4.4): DB column rename is high
  risk for cosmetic gain. Deferred.
- Error boundary raw error logging (3.6): Low risk, deferred.
- Notification route log prefix format (3.5): Cosmetic, deferred.
- `cardType` in ESCALATION_CONFIG (5.3): Internal-only constant, deferred.
- Inconsistent success/ok response keys (5.6): Requires API versioning, deferred.
- Inconsistent error response shapes (5.5): Documented standard; full migration
  deferred to next API version.

# Lumira QA Security & Correctness Audit Report

**Date:** 2026-03-19
**Auditor:** Senior QA Engineer Agent
**Scope:** All 21 API routes, 9 lib modules, types

---

## P0 — Critical (Security / Data Safety)

### BUG-001: `notifications/unread-count` returns 200 with `count: 0` for unauthenticated users
**File:** `app/api/notifications/unread-count/route.ts` line 14
**Issue:** When `user` is null (unauthenticated), the route returns `{ count: 0 }` with HTTP 200 instead of 401. This leaks the fact that the endpoint exists and silently swallows auth failures. More critically, it means frontend code cannot distinguish "zero notifications" from "not logged in", which could mask broken auth state.
**Fix:** Return `{ error: 'Unauthorized' }` with status 401.

### BUG-002: `early-access` route uses anon key client directly — no RLS protection
**File:** `app/api/early-access/route.ts` lines 12-15
**Issue:** Creates a Supabase client with `createClient` from `@supabase/supabase-js` directly using the public anon key, NOT the server-side SSR client. This bypasses cookie-based auth entirely. If the `early_access_queue` table has INSERT-permissive RLS policies for anon, this is fine, but if not, this could fail silently. Also, no rate limiting exists — an attacker could spam thousands of email signups.
**Fix:** Add rate limiting (IP-based). Consider using the server createClient or service client.

### BUG-003: `invite-partner` returns invite URL to client — token exposure
**File:** `app/api/invite-partner/route.ts` line 63
**Issue:** The response includes `invite_url` containing the secret token. If the frontend logs or exposes this, the token is leaked. The invite should be sent via email only, not returned in the API response.
**Fix:** Remove `invite_url` from the response body. Only send via email.

### BUG-004: `generate-weekly-summary` does not verify baby ownership
**File:** `app/api/generate-weekly-summary/route.ts` lines 30-35
**Issue:** After verifying the user is logged in, there is no check that the authenticated user owns or is a member of the baby profile. Any authenticated user could generate weekly summaries for any baby_id (IDOR vulnerability).
**Fix:** Add `baby_profile_members` ownership check like chat/threads does.

### BUG-005: `concern-summary` does not verify baby ownership
**File:** `app/api/concern-summary/route.ts` lines 38-39
**Issue:** Checks `user.id !== profile_id` but does not verify the user is authorized to access `baby_id`. An attacker who knows another user's baby_id could create concern sessions for babies they do not own.
**Fix:** Add baby_profile_members ownership check.

### BUG-006: `chat` route does not verify baby ownership
**File:** `app/api/chat/route.ts` lines 60-65
**Issue:** Same IDOR pattern — checks user matches profile_id but does not verify baby_id belongs to this user.
**Fix:** Add baby_profile_members ownership check.

### BUG-007: `checkin-conversation` does not verify baby ownership
**File:** `app/api/checkin-conversation/route.ts` lines 47-51
**Issue:** Same IDOR pattern.
**Fix:** Add baby_profile_members ownership check.

### BUG-008: `detect-patterns` does not verify baby ownership
**File:** `app/api/detect-patterns/route.ts` lines 21-26
**Issue:** Same IDOR pattern. Additionally, returns 401 with correct status but the error format is inconsistent (`{ error: 'Unauthorized' }` vs other routes using `{ error: true, message: '...' }`).

---

## P1 — High (Functional Bugs / Data Integrity)

### BUG-009: `red-flag-scanner` crashes on null/undefined input
**File:** `lib/red-flag-scanner.ts` line 361
**Issue:** `scanForRedFlags` calls `message.toLowerCase()` without null-checking. If message is null or undefined, this throws a TypeError, which propagates as a 500 error to the user. This is a safety-critical function — a crash here means the red flag scanner is bypassed.
**Fix:** Add `if (!message) return { level: 'none', ... }` guard at the top.

### BUG-010: `emotional-signals` crashes on null/undefined input
**File:** `lib/emotional-signals.ts` line 28
**Issue:** `inferEmotionalSignal` calls `text.toLowerCase()` without null guard. Will throw TypeError on null/undefined input.
**Fix:** Add `if (!text) return null` guard.

### BUG-011: `baby-age` — pregnancy week can be negative or wildly large
**File:** `lib/baby-age.ts` line 9
**Issue:** When due_date is extremely far in the future, `daysPregnant` is negative (e.g., -100), then `Math.max(1, Math.floor(-100/7))` = 1. This is clamped but misleading. When due_date is in the distant past, daysPregnant can be 500+, producing week 71, which makes no sense.
**Fix:** Clamp pregnancy_week to range [1, 42].

### BUG-012: `weekly-guide` cache insert is fire-and-forget with no error handling
**File:** `app/api/weekly-guide/route.ts` line 64
**Issue:** `void supabase.from('weekly_guides').insert(...)` — the `void` discard means the promise is never awaited and errors are silently swallowed. If the insert fails (e.g., unique constraint), every subsequent request re-generates the guide from Claude, wasting API credits.
**Fix:** Await the insert and log errors.

### BUG-013: `detect-patterns` returns 200 on all errors (silent failure)
**File:** `app/api/detect-patterns/route.ts` lines 106-110
**Issue:** The catch block returns `{ patterns_detected: [], patterns_skipped: [] }` with HTTP 200 for ALL errors including auth failures, database errors, etc. This makes debugging impossible and could mask security issues.
**Fix:** Return appropriate error status codes. Only return 200 with empty data for non-error cases.

### BUG-014: `route-concern` returns 200 with `{ concern_type: 'other' }` on all errors
**File:** `app/api/route-concern/route.ts` lines 63-66
**Issue:** Catch block returns 200 with `other` classification for ALL errors including Claude API failures. This silently degrades without informing the caller that something went wrong.

### BUG-015: `chat` route — fire-and-forget fetch to `/api/detect-patterns` does not include auth cookies
**File:** `app/api/chat/route.ts` lines 289-297
**Issue:** The `fetch()` call to the patterns endpoint is made server-side without forwarding the user's session cookies. This means the patterns endpoint will see an unauthenticated request and return 401 (which then gets swallowed by `.catch(() => {})`). Pattern detection after chat messages is effectively broken.
**Fix:** Forward cookies from the original request, or call the pattern detection function directly instead of via HTTP.

---

## P2 — Medium (Input Validation / Edge Cases)

### BUG-016: `chat` route does not validate required fields
**File:** `app/api/chat/route.ts` line 55
**Issue:** `body` is cast to `ChatRequest` but no validation is performed. If `baby_id`, `profile_id`, or `message` are missing/undefined, the route will fail with confusing Supabase errors rather than a clean 400.
**Fix:** Add explicit validation for required fields.

### BUG-017: `checkin-conversation` does not validate required fields
**File:** `app/api/checkin-conversation/route.ts` line 41
**Issue:** Same pattern — no validation of baby_id, profile_id, stage, message.

### BUG-018: `concern-summary` does not validate required fields
**File:** `app/api/concern-summary/route.ts` line 29
**Issue:** No validation for baby_id, profile_id, stage, concern_type, answers.

### BUG-019: `generate-weekly-summary` does not validate week_number/year range
**File:** `app/api/generate-weekly-summary/route.ts` line 26
**Issue:** No validation that week_number is 1-53, year is reasonable. An attacker could pass `week_number: 999999` and `year: -5` to generate arbitrary data.

### BUG-020: `notifications/mark-read` does not validate notification_ids format
**File:** `app/api/notifications/mark-read/route.ts` line 24
**Issue:** Checks array is non-empty but does not validate that individual items are UUID strings. Non-UUID strings could cause Supabase query errors.

### BUG-021: `privacy/preferences` does not validate `product_improvement_enabled`
**File:** `app/api/privacy/preferences/route.ts` lines 28-39
**Issue:** Validates `analytics_enabled` and `ai_processing_enabled` as booleans, but `product_improvement_enabled` is accepted without type checking.

### BUG-022: `communications/unsubscribe` — XSS risk in error HTML
**File:** `app/api/communications/unsubscribe/route.ts` line 118
**Issue:** `Unknown email type: "${type}"` — the `type` parameter from the URL is interpolated directly into HTML without escaping. An attacker could craft a URL with `type=<script>alert(1)</script>` to execute XSS.
**Fix:** HTML-escape the `type` value before interpolation.

### BUG-023: `classifier.ts` — matched.length === 2 returns first match only
**File:** `lib/chat/classifier.ts` lines 62-65
**Issue:** When exactly 2 categories match, it returns `matched[0]` instead of `'multiple'`. With 3+ matches it returns `'multiple'`. This is an off-by-one in the multi-category logic.
**Fix:** Change condition to `if (matched.length >= 2) return 'multiple'` or `if (matched.length > 1) return 'multiple'`.

### BUG-024: `baby-age.ts` — month calculation can be inaccurate
**File:** `lib/baby-age.ts` lines 35-38
**Issue:** `remainingWeeks = ageInWeeks - ageInMonths * 4` assumes each month is 4 weeks (28 days). In reality, months have 30-31 days. For a baby born 2 months ago, the display string may show extra weeks that don't align with calendar months.

---

## P3 — Low (Code Quality / Inconsistency)

### BUG-025: Inconsistent error response formats across API routes
**Issue:** Some routes return `{ error: true, message: '...' }`, others return `{ error: '...' }`, and some return `{ error: true, fallback_message: '...' }`. This forces the frontend to handle multiple error shapes.
**Affected routes:** notifications/* use `{ error: '...' }`, privacy/* use `{ error: true, message: '...' }`, weekly-guide uses `{ error: true, fallback_message: '...' }`.

### BUG-026: `consent.ts` ConsentType does not match `types/app.ts` ConsentType
**File:** `lib/consent.ts` line 7 vs `types/app.ts` line 186
**Issue:** `lib/consent.ts` defines `ConsentType` as 7 values (terms_of_service, privacy_policy, data_processing, marketing_email, marketing_sms, marketing_whatsapp, analytics_cookies). `types/app.ts` defines a different `ConsentType` with 13 values including sensitive_data, community_guidelines, etc. The two types are not compatible and could cause runtime type mismatches.

### BUG-027: Duplicate `sha256` implementation
**File:** `lib/consent.ts` line 43 and `lib/audit.ts` line 32
**Issue:** Same `sha256` function is copy-pasted in both files. Should be extracted to a shared utility.

### BUG-028: `red-flag-scanner.test.ts` uses inline implementation instead of actual module
**File:** `__tests__/lib/red-flag-scanner.test.ts`
**Issue:** The test file re-implements the scanner inline rather than importing from `@/lib/red-flag-scanner`. This means tests could pass even if the real implementation is broken. The inline version also does not include all categories (missing suicidal_ideation, reduced_fetal_movement, preterm_labor_signs).

### BUG-029: No rate limiting on any API route
**Issue:** None of the 21 API routes implement rate limiting. Routes that call Claude (chat, checkin-conversation, concern-summary, generate-weekly-summary, route-concern, weekly-guide) are especially vulnerable to cost-based attacks where an attacker makes rapid requests to run up Anthropic API charges.

### BUG-030: `fever` false positive in red-flag-scanner
**File:** `lib/red-flag-scanner.ts` line 324
**Issue:** The fever check matches on `'38'`, `'39'`, `'40'` as substrings. This means messages like "my baby is 38 weeks" or "the year 2039" or "I have 40 diapers" would trigger fever escalation. The check should look for temperature-specific patterns.

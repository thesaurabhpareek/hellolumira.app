# Lumira Product Backlog
> Generated: 2026-03-22 | Sources: Security audit, Performance audit, UX/Feature audit + session bug fixes

---

## Already Fixed This Session
| Fix | Commit |
|-----|--------|
| Stage-aware landing page pain points | b711efe |
| Planning copy emotional rewrite | b711efe |
| Dark mode Google button hover invisible | 6c422de |
| Magic link expiry copy: 24h → 10 min | 6c422de |
| Cron seed-stories auth fail-open bug | 6c422de |
| Existing account UX on signup page | 8eff87f |
| Chat responses showing raw ```json fences | d15787c |
| "You're up late" at 6pm (UTC timezone bug) | d15787c |

---

## P0 — Blockers (Fix Before Any New Feature)

### SEC-01 · Account deletion not implemented
- **Location:** `app/(app)/profile/DeleteAccountLink.tsx`
- **Issue:** "Delete my account" redirects to settings — no actual deletion
- **Risk:** GDPR/CCPA Article 17 violation (right to erasure)
- **Fix:** Cascade-delete all user data, revoke auth, audit log, confirm email
- **Effort:** M (2–3 days)

### SEC-02 · Rate limiting missing on expensive AI endpoints
- **Location:** `/api/weekly-guide`, `/api/concern-summary`, `/api/generate-weekly-summary`, `/api/route-concern`
- **Issue:** Chat (20/min) and stories (5/24h) are limited — but 4+ other Claude-calling endpoints have no rate limit. Single user can exhaust API budget.
- **Fix:** Apply `checkRateLimit(user.id)` guard matching chat route pattern
- **Effort:** S (1 day)

### BUG-01 · Journal is create-only — entries disappear
- **Location:** `app/(app)/journal/` — only `new/page.tsx` exists
- **Issue:** Users can write journal entries but never view, search, edit, or delete them
- **Fix:** Build list view, entry detail, delete action
- **Effort:** M (3–5 days)

### BUG-02 · Data export records request but never generates file
- **Location:** `app/api/privacy/request-export/route.ts`
- **Issue:** GDPR Article 20 (data portability) — request is stored in DB but no file is generated or emailed
- **Fix:** Compile all user data → JSON/CSV → email with signed download link → cleanup
- **Effort:** L (3–5 days)

### BUG-03 · Red flag scanner false positive on "38 weeks old"
- **Location:** `lib/red-flag-scanner.ts`
- **Issue:** "38" substring triggers fever escalation — "baby is 38 weeks old" shows urgent alert
- **Fix:** Require temperature unit context (°C/°F) or explicit "fever" keyword nearby
- **Effort:** S (< 1 day)

---

## P1 — High Priority (Current Sprint)

### FEAT-01 · Push notifications (web push)
- **Location:** Not implemented — no service worker, no VAPID keys
- **Issue:** Cron jobs trigger but nothing reaches the user in-app or push. Email only.
- **Impact:** Daily check-in completion will be low without reminders. Core retention mechanic.
- **Fix:** Service worker + Web Push API + VAPID key management + client subscription storage
- **Effort:** L (1–2 weeks)

### FEAT-02 · Milestone age-based suggestions
- **Location:** `app/(app)/milestones/page.tsx`
- **Issue:** Log-only. No "upcoming milestones for your baby at 11 months" suggestions.
- **Fix:** Build age-matched milestone calculator + suggestion cards above the log
- **Effort:** M (3–5 days)

### FEAT-03 · Help articles content (all quick links say "launching soon")
- **Location:** `app/(app)/help/page.tsx`
- **Issue:** Every help article link shows a toast — no actual content
- **Fix:** Write ~10 core help articles, build article viewer
- **Effort:** M (2–3 days)

### PERF-01 · Context builder runs 6 DB queries on every message — no caching
- **Location:** `lib/context-builder.ts`
- **Issue:** `buildContextBlock()` fetches baby profile, members, weekly summary, check-ins, concern sessions, patterns on EVERY message. At 1000 concurrent users with 5-message conversations = 30K queries/min.
- **Fix:** 5-minute request-scoped cache keyed on `user_id + baby_id`. Static data (weekly summary, baby profile) cached; dynamic data (latest checkin) cache-busted on write.
- **Effort:** M (1–2 days)

### PERF-02 · Missing composite DB indexes on hot query paths
- **Location:** Supabase migrations
- **Issue:** Sequential scans on tables queried with `(baby_id, date DESC)` patterns
- **Fix:** Add indexes:
  ```sql
  CREATE INDEX idx_daily_checkins_baby_date ON daily_checkins(baby_id, checkin_date DESC);
  CREATE INDEX idx_chat_threads_user_baby ON chat_threads(profile_id, baby_id, is_archived, last_message_at DESC);
  CREATE INDEX idx_chat_messages_thread_date ON chat_messages(thread_id, created_at DESC);
  CREATE INDEX idx_baby_members_profile ON baby_profile_members(profile_id, baby_id);
  CREATE INDEX idx_tribe_posts_tribe_date ON tribe_posts(tribe_id, created_at DESC);
  ```
- **Effort:** S (half day — just a migration file)

### SEC-03 · Supabase image URL validation too broad
- **Location:** `app/api/stories/route.ts`
- **Issue:** Regex allows any `*.supabase.co/storage/` domain — should lock to this project's specific bucket
- **Fix:** `new RegExp('^https://${new URL(SUPABASE_URL).hostname}/storage/')`
- **Effort:** S (< 1 hour)

### SEC-04 · Health check endpoint leaks service status publicly
- **Location:** `app/api/health/route.ts`
- **Issue:** No auth — anyone can check if DB is degraded, enabling timing attacks
- **Fix:** Require `HEALTH_CHECK_SECRET` bearer token (same pattern as cron endpoints)
- **Effort:** S (< 1 hour)

### SEC-05 · System profile IDs inconsistent across routes
- **Location:** `app/api/cron/seed-stories/route.ts` vs `app/api/content/refresh/route.ts`
- **Issue:** Two different hardcoded UUIDs for the system author profile — stories get fragmented by "author"
- **Fix:** Standardize to env var `LUMIRA_SYSTEM_PROFILE_ID` with single canonical fallback UUID
- **Effort:** S (< 1 hour)

### CONTENT-01 · Verify content_articles table is seeded
- **Location:** `app/(app)/content/page.tsx`
- **Issue:** Content page is fully built with stage/category filters but "Nothing here yet" shows if table is empty
- **Fix:** Verify article count; seed 20–30 initial articles per stage if needed
- **Effort:** M (depending on content)

### SAFETY-01 · Email unsubscribe XSS risk in error responses
- **Location:** Unsubscribe endpoint (communications)
- **Issue:** HTML error response may not escape user-supplied input (BUG-022 in QA report)
- **Fix:** Escape all user input before including in HTML responses
- **Effort:** S (< 1 hour)

---

## P2 — Medium Priority (Next Sprint)

### FEAT-04 · Tribes: search, discover, and join flow
- **Location:** `app/(app)/tribes/page.tsx`
- **Issue:** Tribes list exists but search by name/topic and clear join flow may be missing
- **Fix:** Add search bar, tribe detail card, join/leave button with optimistic update
- **Effort:** M (3–5 days)

### FEAT-05 · Tribes moderation/reporting UI
- **Location:** Tribes post/comment components
- **Issue:** No report button visible to users on posts or comments
- **Fix:** Add ··· menu with "Report post" → modal → submits to moderation queue
- **Effort:** M (2–3 days)

### FEAT-06 · Concern follow-up surfaced in app (not just email)
- **Location:** `app/(app)/home/page.tsx`
- **Issue:** Concern sessions have `follow_up_due` dates and cron emails, but app UI never surfaces "Check in on this concern"
- **Fix:** Add follow-up card on home feed when `follow_up_due` is within 24h
- **Effort:** S (1–2 days)

### FEAT-07 · Partner divergence view
- **Location:** Not implemented
- **Issue:** Both parents log check-ins but diverging assessments ("baby sleeping well" vs "poorly") are detected but never shown in UI
- **Fix:** Add compare view showing both parents' latest assessment side-by-side
- **Effort:** S–M (2–3 days)

### PERF-03 · Conversation history unbounded (up to 100 turns per request)
- **Location:** `hooks/useChatThread.ts`, `app/api/chat/route.ts`
- **Issue:** Full conversation history sent with every message — at 100 turns × ~100 tokens = 10K tokens overhead
- **Fix:** Sliding window of last 15 exchanges; summarize older context via separate call
- **Effort:** M (1–2 days)

### PERF-04 · Message preview fetching is O(n × 2) — denormalize or use RPC
- **Location:** `app/api/chat/threads/route.ts`
- **Issue:** Fetches 2× messages needed (threadCount × 2) then discards half
- **Fix:** Denormalize `last_message_preview` column in `chat_threads`, update on each insert
- **Effort:** M (1–2 days including migration)

### PERF-05 · Rate limit store memory leak risk
- **Location:** `lib/rate-limit.ts`
- **Issue:** In-memory Map grows to 10K entries before bulk cleanup. At scale, creates memory spikes.
- **Fix:** LRU eviction + per-entry TTL; or migrate to Upstash Redis for distributed limiting
- **Effort:** M (1–2 days)

### UX-01 · Privacy settings: data retention selector may not be wired
- **Location:** `app/(app)/settings/privacy/page.tsx`
- **Issue:** DB has `data_retention_months` field but UI may not expose it
- **Fix:** Add dropdown (12 / 24 / 36 months) if missing
- **Effort:** S (1 day)

### UX-02 · Profile edit: verify all fields are exposed
- **Location:** `app/(app)/profile/edit/page.tsx`
- **Issue:** Profile page shows many fields (bio, location, pronouns, parenting style, languages, etc.) but edit page may not include all of them
- **Fix:** Audit and add any missing fields
- **Effort:** S (1 day)

### UX-03 · Notifications settings: remove WhatsApp/SMS placeholders or build them
- **Location:** `app/(app)/settings/notifications/page.tsx`
- **Issue:** "Coming soon" badges create false promise. Misleading UI.
- **Fix:** Either remove the sections entirely or implement basic SMS via Twilio
- **Effort:** S to remove / L to implement

---

## P3 — Nice-to-Have (Backlog)

### BUG-05 · Dark mode toggle appears twice
- **Reported by:** User (visual review)
- **Issue:** The dark mode toggle is duplicated — shows up two times on screen. Only one should remain, in the top navigation bar.
- **Fix:** Find all placements of the dark mode toggle component across layout/nav files and remove the duplicate instance, keeping only the one in the top nav.
- **Effort:** S (< 1 hour)

### BUG-04 · Low contrast text — unreadable in dark mode on multiple home page cards
- **Reported by:** User (visual review)
- **Examples confirmed:**
  - "TODAY'S REFLECTION" card — prompt text illegible against card background
  - "20 days until Meera's first birthday!" countdown — unreadable in dark mode
- **Scope:** Multiple instances across home page — any card using `text-muted-foreground` on a coloured/gradient surface (reflection card, weekly guide card, birthday countdown, check-in prompts)
- **Fix:** Audit all home page card components in dark mode; ensure body/prompt text meets WCAG AA contrast (4.5:1). Replace `text-muted-foreground` with `text-foreground` or a high-contrast token on coloured/dark card backgrounds.
- **Effort:** S (half day)

### FEAT-08 · Growth tracking (weight/height/head circumference + WHO percentile charts)
- **Issue:** Competitive gap vs. Huckleberry, Baby Tracker. Parents track this for pediatrician visits.
- **Effort:** L (1–2 weeks)

### FEAT-09 · Timer-based tracking (feed duration, sleep stretches)
- **Issue:** Qualitative check-ins only. Power users want "baby slept 2h 40min" with duration.
- **Effort:** M (3–5 days)

### FEAT-10 · Onboarding completion celebration screen
- **Issue:** Onboarding just redirects to home — missed delight moment
- **Effort:** S (1 day)

### PERF-06 · Reduce 65% client components — many can be server components
- **Issue:** Large JS bundle, slower hydration on mobile
- **Effort:** M (audit + convert ~20 components)

### PERF-07 · System prompt caching with Claude's cache_control
- **Issue:** 700–1000 tokens of system prompt sent on every request — eligible for prompt caching
- **Fix:** Use `cache_control: {type: 'ephemeral'}` on static system prompt blocks
- **Effort:** S (1 day)

### UX-04 · Offline support (service worker + cache)
- **Issue:** App unusable with poor signal. Parents often in basements, hospitals, planes.
- **Effort:** L (1 week)

### UX-05 · Systematic a11y audit (WCAG AA)
- **Issue:** Some aria-labels present but no systematic testing. ADA compliance gap.
- **Effort:** M (2–3 days)

### UX-06 · Profile completion arc: real-time feedback when editing
- **Issue:** Updating a field may not immediately update the completion % without refresh
- **Effort:** S (1 day)

---

## Architecture Notes (No Sprint, Just Awareness)

| Issue | Notes |
|-------|-------|
| 24 migration files — should be squashed | Slow replay for new instances. Squash once schema stabilizes. |
| Fire-and-forget API calls swallow all errors | Add structured logging to `.catch()` handlers in chat + checkin routes |
| 119 uses of `any`/type casts | Gradual Zod validation on API boundaries |
| No error boundaries on major UI sections | Add `error.tsx` per Next.js route segment |

---

## Supabase Dashboard Actions Required (Can't be done in code)
1. **Authentication → Email → OTP Expiry → set to `600`** (10 minutes)
2. **Verify `CRON_SECRET` env var** is set on Vercel — all 4 cron jobs need it
3. **Verify `LUMIRA_SYSTEM_PROFILE_ID`** is set and matches the profiles row

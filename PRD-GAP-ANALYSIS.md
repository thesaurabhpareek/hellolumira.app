# Lumira PRD Gap Analysis & Competitor Benchmarking

**Author:** Senior Product Manager Agent
**Date:** 2026-03-19
**Codebase Version:** v13 (post-QA audit)
**Reference:** QA-REVIEW.md (256 test cases), types/app.ts, types/chat.ts, DB migrations v11-v13

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Feature Inventory: What Has Been Built](#2-feature-inventory-what-has-been-built)
3. [Gap Analysis: PRD vs Implementation](#3-gap-analysis-prd-vs-implementation)
4. [Data Model Gaps](#4-data-model-gaps)
5. [Competitor Benchmarking](#5-competitor-benchmarking)
6. [Priority Recommendations](#6-priority-recommendations)

---

## 1. Executive Summary

Lumira is an AI-powered parenting companion built as a mobile-first Next.js web app backed by Supabase and Claude AI. The codebase covers the core "daily loop" well: onboarding, daily check-ins, concern flows, weekly guides, chat, pattern detection, and safety scaffolding. However, three of the five bottom-nav tabs (Tribes, Content, Profile) link to pages that do not exist. The notification and settings subsystems have backend support but limited or missing frontend. Key differentiators (emotional check-ins, pattern detection, red flag scanner, two-parent support) are implemented and ahead of competitors. But table-stakes features every parenting app must have (growth tracking, feeding logs, milestone timeline view, push notifications) are absent or skeletal.

**Implementation completeness by area:**

| Area | Status | Completeness |
|------|--------|-------------|
| Auth (magic link) | Implemented | ~90% |
| Onboarding | Implemented | ~85% |
| Daily Check-in | Implemented | ~80% |
| Concern Flows | Implemented | ~85% |
| Weekly Guide | Implemented | ~75% |
| Chat with AI | Implemented | ~70% |
| Pattern Detection | Implemented | ~75% |
| Safety (Red Flags) | Implemented | ~80% |
| Notifications (backend) | Implemented | ~60% |
| Email (Resend) | Implemented | ~50% |
| History | Implemented | ~60% |
| Journal | Implemented (create only) | ~40% |
| Milestones | Implemented (create only) | ~40% |
| Settings | Implemented | ~60% |
| Privacy/Consent | Implemented | ~70% |
| Partner Invite | Implemented | ~65% |
| Landing Page | Implemented | ~90% |
| Tribes/Community | **Not built** | 0% |
| Content/Articles | **Not built** | 0% |
| Profile page | **Not built** | 0% |
| Gamification/Streaks | **Not built** | 0% |
| Referrals | **Not built** | 0% |
| Feedback/Help | **Not built** | 0% |
| Push Notifications | **Not built** | 0% |
| WhatsApp/SMS | **Not built** | 0% |
| Growth Charts | **Not built** | 0% |
| Data Export (actual file) | **Not built** | ~20% |

---

## 2. Feature Inventory: What Has Been Built

### 2.1 Fully Implemented Features

**Authentication & Session Management**
- Magic link auth via Supabase (`/auth/page.tsx`, `/auth/callback/`)
- Middleware-based route protection with PROTECTED_PREFIXES covering `/home`, `/checkin`, `/concern`, `/history`, `/journal`, `/milestones`, `/settings`, `/chat`, `/tribes`, `/content`, `/profile`
- Security headers on all responses (X-Frame-Options, CSP, Referrer-Policy, Permissions-Policy)
- Logged-in user redirect from `/auth` to `/home` or `/onboarding`
- Fail-closed when Supabase env vars missing (redirects to `/auth`)

**Onboarding (3-step)**
- Step 1: Parent first name
- Step 2: Pregnancy vs born toggle, due date / DOB / baby name
- Step 3: First-time parent, optional initial concern, consent checkbox
- Partner invite step after completion
- Consent records inserted (4 types: terms, privacy, data_processing, sensitive_data)
- Audit log entry on account creation

**Home Dashboard (`/home`)**
- Time-of-day greeting with parent name
- Pregnancy progress badge with week/trimester
- Infant age display string
- Today's check-in status indicator
- Pattern flag card (proactive prompt from detected patterns)
- Weekly guide card (AI-generated, cached)
- Bottom sticky bar with "Log today" and "Something's on my mind" CTAs

**Daily Check-in (`/checkin`)**
- Conversational check-in thread component (`CheckinThread`)
- Stage-aware structured fields (pregnancy: nausea, energy, symptoms; infant: sleep, feeding, mood, diapers)
- Chip-based input for structured fields
- AI conversation via `/api/checkin-conversation`
- Emotional signal detection on conversation text
- Same-day re-entry (loads existing check-in)
- First check-in intro flow

**Concern Flows (`/concern`)**
- Concern type selector: 5 pregnancy types, 6 infant types + "other"
- Multi-step guided questionnaires (11 JSON flow files in `lib/concern-flows/`)
- Step-by-step question cards with back navigation
- AI-generated summary via `/api/concern-summary` (4 sections: likely_causes, try_first, monitor, escalate_when)
- RFM (Reduced Fetal Movement) bypass: pre-authored card, AI not called
- Concern session stored with follow-up scheduling

**Chat (`/chat`)**
- Thread list page with last message preview
- Individual thread view (`/chat/[thread_id]`)
- Full AI pipeline: validate -> auth -> baby/profile fetch -> red flag scan -> emotional signal -> concern classify -> context build -> Claude call -> store messages -> update emotional state -> pattern detection (async)
- Emergency red flag short-circuit (pre-authored response, no Claude call)
- Thread auto-title generation
- Escalation tracking per thread
- Token usage tracking (input/output tokens per message)
- Suggested prompts for new conversations
- Baby context card, escalation banner, emergency overlay components

**Pattern Detection**
- Rule-based engine in `lib/pattern-rules.ts`
- 10 pattern types: sleep, feeding, mood, concern_followup, milestone_proximity, parent_gap, partner_divergence, nausea_severity, prenatal_anxiety, appointment_proximity
- 3-day cooldown enforcement
- Proactive prompts stored on `baby_profiles.pending_proactive_type`
- Pattern flag card on home screen
- API endpoint `/api/detect-patterns`

**Safety Infrastructure**
- Red flag scanner (`lib/red-flag-scanner.ts`) covering 12 emergency categories
- Emotional signal inference (`lib/emotional-signals.ts`) with 4 levels (ok, tired, struggling, distressed)
- Distressed parent: helpline surfacing (PSI: 1-800-944-4773)
- Pre-authored emergency responses (never call AI for emergencies)
- Claude temperature locked at 0.4
- System prompt enforces: no diagnosis, no medication doses, no dismissive language, max 3 paragraphs

**Context Builder**
- Parallel fetch of 6 data sources: baby profile, parent profiles, weekly summary, recent check-ins (last 6), latest concern, pattern observations (last 5)
- Structured context block injected into Claude system prompt
- Two-parent awareness (current parent + partner emotional state)

**Notifications (Backend)**
- Full CRUD API endpoints: list, mark-read, mark-all-read, dismiss, unread-count
- Rate limiting: max 5 notifications/day/user
- Tribe reaction batching
- Default emoji/priority per notification type
- 14-day auto-expiry
- DB cleanup function for expired/stale notifications
- In-app notification bell component (`NotificationBell`) and panel (`NotificationPanel`)

**Email (Resend)**
- Generic `sendEmail()` with unsubscribe footer and List-Unsubscribe headers
- 7 email templates: daily check-in reminder, pattern alert, weekly guide, concern follow-up, onboarding Day 1, onboarding Day 3, re-engagement, partner invite
- HTML escaping for XSS prevention
- CAN-SPAM/GDPR compliant unsubscribe links

**Communication Preferences**
- API endpoints for update-preferences and unsubscribe
- Settings: email_enabled, email_daily_checkin, email_pattern_alerts, email_weekly_guide, email_concern_followup, whatsapp_enabled, sms_enabled, checkin_hour, timezone, quiet_hours_start, quiet_hours_end

**Privacy & Compliance**
- Consent record system (append-only, immutable)
- Privacy preferences: AI processing toggle, analytics toggle, data retention (12/24/36 months), GDPR/CCPA flags
- Data export request endpoint
- Data deletion request endpoint
- Consent history endpoint
- IP hashing (never stores raw IP)
- Legal pages: terms, privacy, acceptable use, community guidelines, data practices

**History (`/history`)**
- Last 30 days of check-ins and concern sessions
- Grouped by date with summary cards
- Stage-aware display (pregnancy vs infant fields)

**Journal (`/journal/new`)**
- Free-text journal entry creation
- Date auto-populated
- Private to individual parent (RLS)

**Milestones (`/milestones/new`)**
- Pregnancy milestones: first scan, anatomy scan, first kick, third trimester, birth plan done
- Infant milestones: rolling, sitting, crawling, pulling to stand, first word, pincer grip, walking
- Date picker, optional notes

**Landing Page**
- Stage-aware hero copy (pregnancy vs infant toggle)
- Early access waitlist form -> `early_access_queue` table
- UTM parameter capture and referral code tracking
- Pain-point recognition section
- How-it-works section
- Medical credibility section (AAP, WHO, NICE, RCOG)
- CTA to `/auth`

**App Shell**
- Sticky header with Lumira wordmark + notification bell
- 5-tab bottom navigation: Home, Chat, Tribes, Content, Profile
- Safe area insets for iOS
- 480px max-width content container

### 2.2 Partially Implemented Features

| Feature | What Exists | What's Missing |
|---------|-------------|----------------|
| Notification settings UI | Backend API for preferences | Frontend settings page file exists in route structure but no .tsx files found in the directory |
| Privacy settings UI | Backend API for privacy prefs | Same -- route exists but page.tsx may be missing or was not found by glob |
| Journal | Create new entry only | No list view, no edit, no delete, no search |
| Milestones | Create new only | No timeline view, no list, no edit, no age-appropriate suggestions |
| Weekly Guide | AI-generated and cached in DB | No fallback content library, no offline access |
| Data Export | API endpoint accepts request | No actual file generation, no download mechanism |
| Data Deletion | API endpoint accepts request | No actual deletion pipeline (marks as pending only) |
| Two-parent support | Partner invite flow, shared baby profile, RLS | No partner view of each other's check-ins, no partner divergence UI |

### 2.3 Not Implemented (Referenced in Bottom Nav / Types / QA Test Cases)

| Feature Area | Evidence of Intent | Implementation Status |
|-------------|-------------------|----------------------|
| **Tribes (Community)** | Bottom nav tab, notification types (tribe_reply, tribe_reaction, tribe_mention), TC-163 to TC-175 (13 test cases) | **0% -- no routes, no components, no API** |
| **Content/Articles** | Bottom nav tab, notification type (new_article), TC-158 to TC-162 (5 test cases) | **0% -- no routes, no components, no API** |
| **Profile page** | Bottom nav tab, referenced in QA | **0% -- no route** |
| **Gamification (Streaks/Badges)** | Notification types (streak_at_risk, badge_earned), TC-141 to TC-148 (8 test cases) | **0% -- no implementation** |
| **Referrals** | TC-153 to TC-157 (5 test cases), referral_code in early_access_queue | **0% -- waitlist captures referral code, no referral system** |
| **Feedback/Help** | TC-149 to TC-152 (4 test cases) | **0% -- no feedback form, no help center** |
| **Push Notifications** | TC-N001 to TC-N008 (8 test cases) | **0% -- no service worker, no web push** |
| **WhatsApp/SMS** | TC-113 to TC-119 (7 test cases), comm_prefs has whatsapp_enabled/sms_enabled | **0% -- no Twilio/WhatsApp integration** |
| **Growth Charts** | Not in types but expected by users | **0% -- no weight/height/head tracking** |
| **Pregnancy Appointments** | Type defined, DB table exists, v12/v13 ensure columns | **0% -- no UI for creating/viewing appointments** |
| **Weekly Summary Generation** | API endpoint `/api/generate-weekly-summary` exists, DB table exists | Endpoint exists but no cron job or trigger to call it |

---

## 3. Gap Analysis: PRD vs Implementation

### 3.1 Features Specified in PRD/Test Cases but NOT Implemented

Based on the 256 test cases defined in QA-REVIEW.md:

| PRD Section | Test Cases | Status | Gap Severity |
|-------------|-----------|--------|-------------|
| Tribes/Community | TC-163 to TC-175 (13 tests, 5 P0) | **Not built** | Critical -- bottom nav tab leads to 404 |
| Content/Articles | TC-158 to TC-162 (5 tests, 2 P0) | **Not built** | Critical -- bottom nav tab leads to 404 |
| Profile/Gamification | TC-141 to TC-148 (8 tests, 1 P0) | **Not built** | High -- bottom nav tab leads to 404 |
| Referrals | TC-153 to TC-157 (5 tests) | **Not built** | Medium |
| Feedback/Help | TC-149 to TC-152 (4 tests, 1 P0) | **Not built** | High -- no user support channel |
| WhatsApp/SMS | TC-113 to TC-119 (7 tests, 3 P0) | **Not built** | Medium |
| Push Notifications | TC-N001 to TC-N008 (8 tests, 2 P0) | **Not built** | High -- mobile web primary form factor |
| Chat Red Flag Scanner (lib/chat/) | TC-Chat-001 to TC-Chat-028 (28 tests, 8 P0 critical) | **Partially built** -- `classifier.ts` exists, scanner uses `lib/red-flag-scanner.ts` directly | Medium -- scanner works, but dedicated chat safety layer missing |
| Rate Limiting | TC-M014, TC-M015, BUG-005 | **Not built** | Critical -- security vulnerability |

### 3.2 Features Partially Implemented

| Feature | What's Done | What's Missing |
|---------|-------------|----------------|
| **Notification Settings UI** | API endpoints complete, route structure exists | Frontend page with toggles for each notification type |
| **Privacy Settings UI** | API endpoints complete, route structure exists | Needs verification -- privacy/page.tsx may exist but wasn't found in glob |
| **Dark Mode** | TC-052 (WCAG AA dark), TC-056 (warm, no blue-black) referenced | No dark mode CSS variables or media query detected |
| **Offline/Weak Connection** | TC-073 (graceful weak connection) | No service worker, no offline queue, no optimistic UI |
| **Milestone Timeline** | Create form exists | No list/timeline view, no age-appropriate milestone suggestions, no completion tracking |
| **Journal List** | Create form exists | No list view, no past entries display |
| **Data Export** | Request endpoint, DB table | No actual data compilation, no file generation, no download |
| **Accessibility** | 48px tap targets (mostly), safe-area insets, aria-labels on some elements | No systematic a11y audit, no prefers-reduced-motion, no screen reader testing |

### 3.3 Features Implemented but NOT in Original PRD (Bonus/Extra)

| Feature | Evidence |
|---------|---------|
| **Landing page waitlist** | Full waitlist form with UTM capture, stage toggle, referral code -- goes beyond simple auth page |
| **Legal pages (6 documents)** | Terms, privacy, acceptable use, community guidelines, data practices, plus a legal hub page |
| **Security headers in middleware** | X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy |
| **Automatic updated_at triggers** | DB triggers on 5 tables -- infrastructure not specified in test cases |
| **Token usage tracking** | input_tokens/output_tokens on chat messages for cost monitoring |
| **Thread auto-titling** | Generates thread title from first message |
| **Notification reaction batching** | Batches tribe_reaction notifications into one per source |
| **Notification daily cleanup** | PostgreSQL function for expired/stale notification removal |

---

## 4. Data Model Gaps

### 4.1 Tables/Types Defined but Not Used in Any UI

| Table/Type | Defined In | Used By | UI Exists |
|-----------|-----------|---------|-----------|
| `PregnancyAppointment` | types/app.ts, v13 migration | No API route creates them | No |
| `WeeklySummary` | types/app.ts, v12/v13 migrations | `context-builder.ts` reads, `/api/generate-weekly-summary` writes | No trigger/cron to generate |
| `CommunicationPreferences` | types/app.ts, v12/v13 migrations | `/api/communications/update-preferences` | Settings page may exist |
| `DataExportRequest` | types/app.ts, v13 migration | `/api/privacy/request-export` writes | Privacy settings page may exist |
| `DataDeletionRequest` | types/app.ts, v13 migration | `/api/privacy/request-deletion` writes | Privacy settings page may exist |
| `landing_page_conversions` | v13 migration | Nothing in codebase | No |

### 4.2 Notification Types Defined but Never Generated

The following notification types exist in the DB CHECK constraint and TypeScript types but no code path generates them:

| Notification Type | Expected Trigger | Status |
|------------------|-----------------|--------|
| `tribe_reply` | When someone replies to a Tribes post | Tribes not built |
| `tribe_reaction` | When someone reacts to a Tribes post | Tribes not built |
| `tribe_mention` | When someone mentions a user in Tribes | Tribes not built |
| `streak_at_risk` | When check-in streak is about to break | Gamification not built |
| `badge_earned` | When user earns a badge | Gamification not built |
| `new_article` | When new content is published | Content not built |
| `milestone_approaching` | When an age-appropriate milestone is near | No milestone proximity engine |
| `weekly_guide_ready` | When weekly guide is generated | No generation trigger |
| `escalation_reminder` | Follow-up on escalated concerns | No escalation reminder cron |
| `concern_followup` | Automated concern follow-up | Follow-up due tracked but no cron to fire |
| `partner_joined` | When partner accepts invite | Invite acceptance flow exists but doesn't create notification |

Only `pattern_detected` is actively generated (by detect-patterns when it fires proactive prompts, though it stores on baby_profiles, not via createNotification).

### 4.3 Pattern Types Defined but Never Triggered

| Pattern Type | Status |
|-------------|--------|
| `milestone_proximity` | No milestone proximity calculation exists |
| `parent_gap` | Defined in message map on home page but no detection rule in pattern-rules.ts |
| `partner_divergence` | Defined in message map but no detection rule |
| `appointment_proximity` | Defined in message map but no detection rule, no appointment UI |

---

## 5. Competitor Benchmarking

### 5.1 Competitor Feature Matrix

| Feature | Lumira | Huckleberry | Baby Tracker | Wonder Weeks | Kinedu | Peanut | BabyCenter |
|---------|--------|------------|-------------|-------------|--------|--------|-----------|
| **Daily check-in / logging** | Conversational AI | Timer-based | Manual logs | No | Activity-based | No | Trackers |
| **Sleep tracking** | Qualitative (poor/ok/good) | Timer + prediction | Timer + logs | No | Basic | No | Basic |
| **Feeding tracking** | Qualitative (less/normal/more) | Timer + volume | Timer + amount + type | No | Basic | No | Basic |
| **Diaper tracking** | Qualitative (normal/fewer/more/unusual) | Yes (count) | Yes (count + type) | No | No | No | Yes |
| **Growth charts** | **None** | Yes (WHO) | Yes (WHO/CDC) | No | Yes | No | Yes |
| **Milestone tracking** | Create-only (no view) | Yes (timeline) | Yes | Leap-based | Yes (1800+) | No | Yes |
| **Developmental content** | AI-generated weekly guides | Sleep tips | Articles | Leap explanations | 2000+ activities | Expert articles | 10000+ articles |
| **AI chat / assistant** | Full AI chat with safety | SweetSpot (sleep) | No | No | No | No | No |
| **Concern triage** | Structured flows + AI summary | No | No | No | No | Q&A forums | Forums |
| **Pattern detection** | Automated (10 types) | Sleep patterns only | Manual charts | Developmental leaps | No | No | No |
| **Safety / red flags** | 12-category scanner | No | No | No | No | No | No |
| **Emotional wellbeing** | 4-level inference + helpline | No | No | No | No | No | Mood tracker |
| **Two-parent support** | Shared profile + partner invite | Yes | Yes | No | No | No | Partner mode |
| **Community** | **Not built** (planned "Tribes") | No | No | Community | Community | Core feature | Forums |
| **Expert content** | AI-generated only | Expert tips | Articles | Leap guides | Expert videos | Expert Q&A | Expert articles |
| **Push notifications** | **Not built** | Yes | Yes | Yes | Yes | Yes | Yes |
| **Pregnancy tracking** | Week-by-week with AI guides | No (baby only) | Limited | No | Yes | Yes | Yes |
| **Medical info storage** | **None** | No | Vaccination, allergies | No | No | No | Health records |
| **Data privacy** | Strong (consent, audit, RLS) | Standard | Standard | Standard | Standard | Standard | Standard |
| **Platform** | Mobile web (PWA potential) | iOS/Android | iOS/Android | iOS/Android | iOS/Android | iOS/Android | iOS/Android/Web |

### 5.2 What Lumira Has That Competitors Don't

1. **AI-powered conversational check-ins** -- No competitor offers a conversational daily check-in. Huckleberry and Baby Tracker use form-based logging. Lumira's approach is lower-friction and more emotionally attuned.

2. **Structured concern triage with AI summary** -- The concern flow (guided questionnaire -> AI-generated 4-section summary with escalation guidance) is unique. No competitor offers this structured approach. Most rely on forums or generic articles.

3. **12-category red flag scanner** -- Real-time safety scanning of user input for breathing emergencies, choking, seizures, fever thresholds by age, suicidal ideation, etc. No competitor has this. This is a genuine differentiator for trust and safety.

4. **Emotional wellbeing inference** -- Automatically detecting parent emotional state (ok/tired/struggling/distressed) from natural language and surfacing helpline resources for distressed parents. No competitor does this.

5. **Pattern detection engine** -- Automated detection of sleep, feeding, mood, and nausea patterns from daily check-in data with cooldown logic. Huckleberry does sleep prediction but not multi-signal pattern detection.

6. **Full context memory** -- Claude receives a structured context block with baby age, recent check-ins, patterns, concerns, and both parents' emotional states. This creates continuity that no chatbot competitor matches.

7. **Privacy-first architecture** -- Append-only consent log, IP hashing, GDPR/CCPA toggles, data retention controls, export/deletion requests. Significantly stronger than any competitor.

8. **Pregnancy + infant in one app** -- Seamless transition from pregnancy tracking to infant tracking. Many competitors only cover one or the other (Huckleberry = baby only, Wonder Weeks = baby only).

### 5.3 What Competitors Have That Lumira Must Add (Table Stakes)

| Feature | Who Has It | Why It's Table Stakes | Lumira Gap Severity |
|---------|-----------|----------------------|-------------------|
| **Push notifications** | Everyone | Mobile web users won't return without reminders. Check-in reminders, pattern alerts, and weekly guide notifications need push. Without push, retention will crater. | **P0 Critical** |
| **Growth charts (weight/height/head)** | Huckleberry, Baby Tracker, Kinedu, BabyCenter | Parents expect to track physical growth. Pediatrician visits generate measurements that parents want to log and visualize. WHO growth percentile charts are expected. | **P1 High** |
| **Timer-based tracking** | Huckleberry, Baby Tracker | For feeding and sleep, many parents want to log *duration* and *frequency*, not just quality. "How long since last feed?" is a daily question. | **P1 High** |
| **Milestone timeline view** | Huckleberry, Baby Tracker, Kinedu | Parents want to see milestones their baby has hit and upcoming ones by age. Current create-only form has no view. | **P1 High** |
| **Content library** | BabyCenter (10K+ articles), Kinedu (2K+ activities), Wonder Weeks | Parents need expert-reviewed articles, not just AI-generated content. Trust comes from curated, evidence-based content. | **P1 High** |
| **Community / forums** | Peanut, BabyCenter, Kinedu | New parents want peer support. "Am I the only one?" is a universal need. Tribes is planned but unbuilt. | **P2 (but high for retention)** |
| **Vaccination tracker** | Baby Tracker | Parents need to track vaccination schedule. Pediatricians ask about it. | **P2** |
| **Photo/memory storage** | Baby Tracker | Emotional anchor. Parents want to attach photos to milestones. | **P2** |
| **Offline support** | Most native apps | PWA-style offline support is needed for mobile web apps used during nighttime feeds when signal may be weak. | **P1 High** |

---

## 6. Priority Recommendations

### P0 -- Must-Have for Launch (Without These, the App Won't Be Useful)

| # | Feature | Effort | Rationale |
|---|---------|--------|-----------|
| P0-1 | **Fix 3 broken bottom nav tabs** (Tribes, Content, Profile) | 1-2 days | Three of five tabs lead to 404. This is the most visible broken experience. Either implement placeholder "Coming Soon" pages or remove the tabs. |
| P0-2 | **Push notifications (web push via service worker)** | 1-2 weeks | Without push, users will not return for daily check-ins. Check-in reminder at configured `checkin_hour`, pattern alerts, and weekly guide notifications. This is the single highest-impact retention lever. |
| P0-3 | **Rate limiting on all AI endpoints** | 2-3 days | Security vulnerability (BUG-005 from QA). Implement via `@upstash/ratelimit` or Vercel Edge middleware. Without this, a single user can exhaust the Anthropic API budget. |
| P0-4 | **Profile page** | 3-5 days | Users need to view/edit their profile, baby info, and partner connection. Currently the only way to see profile info is the Settings page. The "Profile" tab in bottom nav needs a page. |
| P0-5 | **Concern follow-up cron job** | 1-2 days | Concern sessions have `follow_up_due` dates but nothing triggers the follow-up. This breaks the promise of continuity. Implement via Vercel Cron or Supabase pg_cron. |
| P0-6 | **Weekly summary generation cron** | 1-2 days | API endpoint exists but nothing calls it. Context builder reads weekly summaries -- without generation, AI context is impoverished. |

### P1 -- Should-Have (Significantly Improves Value)

| # | Feature | Effort | Rationale |
|---|---------|--------|-----------|
| P1-1 | **Milestone timeline view** | 3-5 days | Create-only milestones are useless without a view. Build a visual timeline grouped by age/stage with upcoming milestone suggestions based on baby's age. |
| P1-2 | **Journal list view** | 2-3 days | Currently entries go into a void. Build a chronological list of past entries. |
| P1-3 | **Content library (curated articles)** | 2-3 weeks | Start with 20-30 evidence-based articles covering the most common topics (safe sleep, breastfeeding, introducing solids, teething, postpartum mood). Organize by stage and topic. Can use AI to generate initial drafts reviewed by medical experts. |
| P1-4 | **Growth tracking & charts** | 1-2 weeks | Weight, height, head circumference logging with WHO percentile curve overlay. This is what parents bring to and from pediatrician visits. |
| P1-5 | **Notification settings frontend** | 3-5 days | Backend exists. Build toggle UI for each notification type, quiet hours, check-in time selector. |
| P1-6 | **Privacy settings frontend** | 3-5 days | Backend exists. Build toggles for AI processing, analytics, data retention dropdown, export/delete buttons. |
| P1-7 | **Dark mode** | 3-5 days | Parents use the app during nighttime feeds. Bright screens disrupt sleep. Warm dark mode (no blue-black per TC-056) is a quality-of-life necessity. |
| P1-8 | **Offline support / PWA manifest** | 1-2 weeks | Service worker for offline access to cached weekly guides, history, and milestones. Queue check-in submissions when offline. |
| P1-9 | **Timer-based feeding/sleep tracking** | 1-2 weeks | Supplement the qualitative check-in with optional duration tracking. "Start/stop" timer for feeds and sleep sessions. Parents need to answer "how long since last feed?" |
| P1-10 | **Pregnancy appointment UI** | 3-5 days | Type and DB table exist. Build create/list/edit for appointments with reminders. |

### P2 -- Nice-to-Have (Differentiators / Retention Boosters)

| # | Feature | Effort | Rationale |
|---|---------|--------|-----------|
| P2-1 | **Tribes (community)** | 4-6 weeks | Stage-matched parent groups. High retention value but complex to build and moderate. Can start with simple threaded discussions grouped by stage. |
| P2-2 | **Gamification (streaks & badges)** | 1-2 weeks | Check-in streaks, milestone badges, engagement rewards. Types and notification infrastructure exist. Need UI and streak calculation logic. |
| P2-3 | **WhatsApp check-in reminders** | 1-2 weeks | Many parents prefer WhatsApp to email. Integrate via Twilio/WhatsApp Business API for check-in reminders. |
| P2-4 | **Referral system** | 1 week | Generate unique referral codes, track invites, reward both referrer and referee. Waitlist already captures `referral_code`. |
| P2-5 | **Photo attachments on milestones** | 3-5 days | Allow parents to upload a photo when logging a milestone. Store in Supabase Storage. Emotional anchor for engagement. |
| P2-6 | **Feedback / help center** | 3-5 days | In-app feedback form and FAQ. Critical for user support but not blocking for core value. |
| P2-7 | **Data export (actual file generation)** | 1 week | Generate JSON/CSV export of all user data. Currently only marks request as pending. GDPR requires delivery within 30 days. |
| P2-8 | **Vaccination tracker** | 1-2 weeks | Vaccination schedule by country with check-off and reminders. |
| P2-9 | **Multi-baby support** | 1 week | Some parents have twins or closely-spaced children. Data model supports it (baby_profile_members junction), but UI only fetches first baby. |
| P2-10 | **Toddler stage content** | 2-3 weeks | Stage type includes 'toddler' but no toddler-specific concern flows, milestones, or check-in fields exist. |

---

## Appendix A: Immediate Action Items (Week 1)

1. **Replace broken tab routes** with "Coming Soon" placeholder pages for `/tribes`, `/content`, `/profile` -- prevent 404 errors
2. **Implement rate limiting** on `/api/chat`, `/api/checkin-conversation`, `/api/concern-summary`, `/api/detect-patterns` via Upstash ratelimit
3. **Create cron jobs** for weekly summary generation and concern follow-up checks (Vercel Cron)
4. **Generate notifications** for pattern_detected when patterns fire (connect detect-patterns to createNotification)

## Appendix B: Key File Paths

- App routes: `/Users/saurabh/Desktop/hellolumira.app/lumira/app/`
- Components: `/Users/saurabh/Desktop/hellolumira.app/lumira/components/`
- Lib (core logic): `/Users/saurabh/Desktop/hellolumira.app/lumira/lib/`
- Types: `/Users/saurabh/Desktop/hellolumira.app/lumira/types/`
- DB migrations: `/Users/saurabh/Desktop/hellolumira.app/lumira/supabase/migrations/`
- Tests: `/Users/saurabh/Desktop/hellolumira.app/lumira/__tests__/`
- QA Review: `/Users/saurabh/Desktop/hellolumira.app/lumira/QA-REVIEW.md`

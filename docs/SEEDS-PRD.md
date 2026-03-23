# Seeds Gamification System — Product Requirements Document

**Version:** 2.0
**Date:** March 2026
**Status:** In Progress

---

## 1. Problem

### What exists today

The seeds system is structurally sound — `seed_transactions`, `seeds_balance`, `increment_seeds_balance` RPC, and the deduplication index all exist and work. The `awardSeeds()` server-side helper is already wired into check-in, quiz, tribe posts/comments, journal, profile updates, and partner invite.

### What is broken or incomplete

1. **Inconsistent economy.** Seed amounts were designed without a coherent framework. Daily check-in gives 5 seeds, but a daily streak bonus (which fires unconditionally alongside check-in regardless of streak length) also gives 2 seeds. The amounts in `lib/seeds.ts` differ from what the PRD specifies.

2. **Missing first-time bonuses.** There is no `first_checkin` one-time bonus. There is no 7-day or 30-day streak bonus — the current `daily_streak_bonus` fires every day the user checks in, which dilutes the milestone reward meaning.

3. **Story interactions earn no seeds.** `POST /api/stories/[id]/react` and `POST /api/stories/[id]/reply` call no seeds logic at all.

4. **Concern logging earns no seeds.** The concern flow UI (`/concern/[id]/page.tsx`) does not call `awardSeeds`.

5. **No transaction history UI.** Users can see their balance in the header pill and on the profile page, but there is no way to understand how they earned seeds or what actions to take next.

6. **Seeds pill animation is good but the profile page balance is static.** The profile page renders `seedsBalance` as a plain number — it does not use `SeedsDisplay` with the level/progress bar.

7. **Article read awards are client-side but not wired.** `read_article` appears in `CLIENT_ALLOWED_REASONS` but the content page (`/content/page.tsx`) does not call the API when an article is opened.

8. **`daily_streak_bonus` logic is wrong.** It is awarded unconditionally on every check-in; it should only fire when the streak hits exactly 7 or 30 days.

---

## 2. Goals

| Goal | Metric |
|------|--------|
| Every meaningful user action results in seed feedback | Coverage: all 14 earning events wired up |
| Users understand what seeds are for | Seeds history page live; profile level visible |
| Reward healthy daily habits | Streak milestone bonuses fire correctly at 7d and 30d |
| Prevent farming | Server-side deduplication remains the authority; client endpoint restricted to safe reasons only |

---

## 3. Earning Events

All amounts are canonical. They override the values currently in `lib/seeds.ts`.

### Daily actions (deduplicated per calendar day per user)

| Reason key | Event | Seeds |
|---|---|---|
| `daily_checkin` | Complete the daily check-in conversation | **5** |
| `log_concern` | Log a concern via the concern flow | **10** |
| `read_article` | Open and read a content article | **3** |
| `post_in_tribe` | Create a post in any tribe | **10** |
| `comment_in_tribe` | Comment on a tribe post | **5** |
| `react_to_story` | React to a story (first reaction per day) | **2** |
| `reply_to_story` | Reply to a story | **5** |
| `complete_quiz` | Complete the daily quiz question | **10** |
| `journal_entry` | Write a journal entry | **3** |

### Streak milestone bonuses (one-time per milestone, using a unique key)

These are one-time awards keyed as `streak_7_days` and `streak_30_days` (treated as `ONE_TIME_REASONS`), awarded in the check-in route when the streak reaches exactly those values.

| Reason key | Event | Seeds |
|---|---|---|
| `streak_7_days` | Reach a 7-day streak | **25** |
| `streak_30_days` | Reach a 30-day streak | **100** |

### One-time actions (awarded once, ever)

| Reason key | Event | Seeds |
|---|---|---|
| `first_checkin` | Complete your very first check-in | **25** |
| `complete_profile` | Fill all core profile enrichment fields | **50** |
| `invite_partner` | Send a partner invite email | **20** |
| `first_share` | First in-app share action | **5** |
| `profile_field_completion` | Complete an individual profile field (capped per field) | **5** |

---

## 4. Spending (Future — Not Implemented)

Seeds will unlock cosmetic and utility rewards. Implemented in a future sprint.

| Reward | Cost |
|---|---|
| Unlock premium article collection | 50 seeds |
| Unlock custom avatar frame | 30 seeds |
| Priority Lumira Expert response | 20 seeds |
| Unlock "Super Parent" tribe flair | 100 seeds |
| Redeem for partner discount code | 200 seeds |

---

## 5. Display

### 5.1 Header pill — `SeedsBalancePill`
- Already implemented with Supabase realtime subscription
- Bounce + floating `+N` animation on balance increase
- Counter animation when balance changes
- Links to `/profile`

### 5.2 Profile page — `SeedsDisplay` (full card)
- Replace the current static badge on the profile page with the `SeedsDisplay` component
- Shows balance, level name (Seedling → Lumira Legend), level number badge, and progress bar to next level

### 5.3 Seeds history page — `/profile/seeds`
- Lists last 50 `seed_transactions` with reason label, amount, and date
- Provides context: "Here's how you've been earning seeds"
- Link from the profile page seeds card

### 5.4 Toast on earn
- The `showToast()` utility in `lib/animations.ts` should be called client-side after a successful seed award API response
- Format: `🌱 +5 seeds — Daily check-in`

---

## 6. Technical Architecture

### 6.1 Data model

```sql
-- Already exists in v19 migration
public.seed_transactions (
  id uuid PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  reason text NOT NULL,
  reference_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
)
-- UNIQUE INDEX on (profile_id, reason, reference_date) — authoritative dedup
```

The `metadata` column (jsonb) specified in the original brief does not exist in the v19 migration. A new migration adds it along with two new `reason` values (`react_to_story`, `reply_to_story`, `log_concern`, `first_checkin`, `streak_7_days`, `streak_30_days`).

### 6.2 `awardSeeds()` — server-side helper

Located at `lib/seeds.ts`. The single source of truth for all seed logic:

- Maps `reason → amount` via `SEED_REWARDS` config
- For `ONE_TIME_REASONS`, uses `2000-01-01` as `reference_date` so the unique index blocks duplicates forever
- Inserts into `seed_transactions`
- Calls `increment_seeds_balance` RPC
- Falls back to read-modify-write if RPC is unavailable
- Returns `{ success, already_awarded, amount, reason }`

### 6.3 `POST /api/seeds/award` — client-safe endpoint

Restricts to `CLIENT_ALLOWED_REASONS`. Server-side routes call `awardSeeds()` directly.

### 6.4 Wiring map

| Touchpoint | File | Method |
|---|---|---|
| Daily check-in | `app/api/checkin-conversation/route.ts` | `awardSeeds(profile_id, 'daily_checkin')` |
| First check-in | `app/api/checkin-conversation/route.ts` | `awardSeeds(profile_id, 'first_checkin')` when `!profileData.first_checkin_complete` |
| Streak 7d / 30d | `app/api/checkin-conversation/route.ts` | `awardSeeds(profile_id, 'streak_7_days'/'streak_30_days')` based on new streak value |
| Log concern | `app/(app)/concern/[id]/page.tsx` | `fetch('/api/seeds/award', { reason: 'log_concern' })` |
| Read article | `app/(app)/content/page.tsx` | `fetch('/api/seeds/award', { reason: 'read_article' })` on article open |
| Post in tribe | `app/api/tribes/[slug]/posts/route.ts` | `awardSeeds(user.id, 'post_in_tribe')` — already wired |
| Comment in tribe | `app/api/tribes/posts/[postId]/comments/route.ts` | `awardSeeds(user.id, 'comment_in_tribe')` — already wired |
| React to story | `app/api/stories/[id]/react/route.ts` | `awardSeeds(user.id, 'react_to_story')` when `action === 'added'` |
| Reply to story | `app/api/stories/[id]/reply/route.ts` | `awardSeeds(user.id, 'reply_to_story')` |
| Complete quiz | `app/api/quiz/answer/route.ts` | `awardSeeds(user.id, 'complete_quiz')` — already wired |
| Journal entry | `app/(app)/journal/new/page.tsx` | `fetch('/api/seeds/award', { reason: 'journal_entry' })` — already wired |
| Invite partner | `app/(app)/settings/InvitePartnerForm.tsx` | `fetch('/api/seeds/award', { reason: 'invite_partner' })` — already wired |
| Profile field | `app/api/profile/update/route.ts` | Already wired per-field |
| Complete profile | `app/api/profile/update/route.ts` | `awardSeeds(user.id, 'complete_profile')` when all enrichment fields filled |

### 6.5 Migration

`supabase/migrations/lumira_v47_seeds_economy_v2.sql` adds:
- `metadata jsonb` column to `seed_transactions`
- No schema changes needed for new reason keys — they are just text values

---

## 7. Non-Goals

- No leaderboard in this sprint
- No seeds redemption UI
- No streak freeze purchases
- No notifications for seeds earned (toast only, no push)

---

## 8. Open Questions

1. Should `log_concern` award be per-concern-type per day, or truly once per day regardless of how many concerns are logged? (Current spec: once per day)
2. Should streak bonuses reset if a user earns them, then breaks and rebuilds their streak? (Current spec: yes — `streak_7_days` is one-time ever, so they can only earn it once)

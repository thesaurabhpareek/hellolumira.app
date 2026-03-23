/**
 * @module Seeds
 * @description Server-side seed awarding logic. Call directly from any API route
 *   without needing HTTP roundtrips or auth cookie forwarding.
 *   Deduplicates by (profile_id, reason, reference_date).
 * @version 2.0.0
 * @since March 2026
 */

/*
 * ============================================================
 * SEEDS GAMIFICATION — canonical amounts (see docs/SEEDS-PRD.md)
 * ============================================================
 *
 * DAILY ACTIONS (once per calendar day per user):
 *   daily_checkin           +5 seeds    Complete the daily check-in
 *   log_concern             +10 seeds   Log a concern via the concern flow
 *   read_article            +3 seeds    Read a content article
 *   complete_quiz           +10 seeds   Complete the daily quiz question
 *   post_in_tribe           +10 seeds   Create a post in any tribe
 *   comment_in_tribe        +5 seeds    Comment on a tribe post
 *   react_to_story          +2 seeds    React to a story (first per day)
 *   reply_to_story          +5 seeds    Reply to a story
 *   journal_entry           +3 seeds    Write a journal entry
 *
 * STREAK MILESTONE BONUSES (one-time, keyed as one-time reasons):
 *   streak_7_days           +25 seeds   Reach a 7-day streak
 *   streak_30_days          +100 seeds  Reach a 30-day streak
 *
 * ONE-TIME ACTIONS (awarded once, ever):
 *   first_checkin           +25 seeds   Complete the very first check-in
 *   complete_profile        +50 seeds   Fill all core enrichment fields
 *   invite_partner          +20 seeds   Send a partner invite
 *   first_share             +5 seeds    First in-app share
 *   profile_field_completion +5 seeds   Fill an individual profile field
 *
 * IMPLEMENTATION NOTES
 * --------------------
 *   - All server-side awarding goes through awardSeeds() in this module.
 *   - Client-side callers POST to /api/seeds/award with a reason from CLIENT_ALLOWED_REASONS.
 *   - The DB unique index on (profile_id, reason, reference_date) is the authoritative
 *     deduplication mechanism; awardSeeds() relies on the 23505 conflict code.
 *   - profiles.seeds_balance is kept in sync by the increment_seeds_balance DB function.
 *   - SeedsBalancePill subscribes to Supabase realtime so the header updates without reload.
 * ============================================================
 */

import { createServiceClient } from '@/lib/supabase/server'

/** Seed reward amounts by reason */
export const SEED_REWARDS: Record<string, number> = {
  // Daily actions
  daily_checkin: 5,
  log_concern: 10,
  read_article: 3,
  complete_quiz: 10,
  post_in_tribe: 10,
  comment_in_tribe: 5,
  react_to_story: 2,
  reply_to_story: 5,
  journal_entry: 3,
  // Streak milestone bonuses (one-time)
  streak_7_days: 25,
  streak_30_days: 100,
  // One-time actions
  first_checkin: 25,
  complete_profile: 50,
  invite_partner: 20,
  first_share: 5,
  profile_field_completion: 5, // variable amount — overridden by API route
}

/** One-time reasons — only awarded once ever (not per-day) */
const ONE_TIME_REASONS = new Set([
  'first_checkin',
  'complete_profile',
  'invite_partner',
  'first_share',
  'streak_7_days',
  'streak_30_days',
])

export interface AwardResult {
  success: boolean
  already_awarded: boolean
  amount: number
  reason: string
}

/**
 * Award seeds to a user. Safe to call multiple times — deduplicates via DB unique index.
 * Works from any server context (no auth cookies needed).
 *
 * @param profileId - The user's profile UUID
 * @param reason    - A key from SEED_REWARDS
 * @param amount    - Optional override (used for profile_field_completion with variable amounts)
 */
export async function awardSeeds(
  profileId: string,
  reason: string,
  amount?: number
): Promise<AwardResult> {
  const rewardAmount = amount ?? SEED_REWARDS[reason]
  if (!rewardAmount) {
    console.warn(`[seeds] Unknown reward reason: ${reason}`)
    return { success: false, already_awarded: false, amount: 0, reason }
  }

  try {
    const serviceClient = await createServiceClient()

    // For one-time reasons, use a fixed date so the unique index prevents duplicates forever
    const referenceDate = ONE_TIME_REASONS.has(reason)
      ? '2000-01-01'
      : new Date().toISOString().split('T')[0]

    // Insert transaction (unique index on profile_id + reason + reference_date)
    const { error: insertError } = await serviceClient
      .from('seed_transactions')
      .insert({
        profile_id: profileId,
        amount: rewardAmount,
        reason,
        reference_date: referenceDate,
      })

    if (insertError) {
      if (insertError.code === '23505') {
        // Already awarded today (or ever, for one-time reasons)
        return { success: true, already_awarded: true, amount: 0, reason }
      }
      console.error(`[seeds] Insert error for ${reason}:`, insertError.message)
      return { success: false, already_awarded: false, amount: 0, reason }
    }

    // Atomically increment balance via RPC
    const { error: rpcError } = await serviceClient.rpc('increment_seeds_balance', {
      p_profile_id: profileId,
      p_amount: rewardAmount,
    })

    if (rpcError) {
      // Fallback: read current balance and write back the incremented value.
      // Not atomic but acceptable for a rare RPC-unavailable scenario.
      console.warn(`[seeds] RPC failed, using read-modify-write fallback:`, rpcError.message)
      const { data: profileRow } = await serviceClient
        .from('profiles')
        .select('seeds_balance')
        .eq('id', profileId)
        .single()
      const current = (profileRow as { seeds_balance?: number } | null)?.seeds_balance ?? 0
      const { error: updateError } = await serviceClient
        .from('profiles')
        .update({ seeds_balance: current + rewardAmount })
        .eq('id', profileId)
      if (updateError) {
        console.error(`[seeds] Fallback UPDATE also failed:`, updateError.message)
      }
    }

    return { success: true, already_awarded: false, amount: rewardAmount, reason }
  } catch (err) {
    console.error(`[seeds] Error awarding ${reason}:`, err)
    return { success: false, already_awarded: false, amount: 0, reason }
  }
}

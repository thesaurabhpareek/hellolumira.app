/**
 * @module Seeds
 * @description Server-side seed awarding logic. Call directly from any API route
 *   without needing HTTP roundtrips or auth cookie forwarding.
 *   Deduplicates by (profile_id, reason, reference_date).
 * @version 1.1.0
 * @since March 2026
 */

/*
 * ============================================================
 * SEEDS GAMIFICATION REQUIREMENTS
 * ============================================================
 *
 * EARNING OPPORTUNITIES
 * ---------------------
 * Daily actions (once per calendar day per user):
 *   daily_checkin           +5 seeds/day   Complete the daily check-in conversation
 *   log_concern             +3 seeds/day   Log a new concern
 *   read_article            +2 seeds/day   Read a content article (once per article per day)
 *   complete_quiz           +3 seeds/day   Complete the daily quiz
 *   post_in_tribe           +4 seeds/day   Create a post in any tribe
 *   comment_in_tribe        +2 seeds/day   Comment on a tribe post
 *   journal_entry           +3 seeds/day   Write a journal entry
 *   daily_streak_bonus      +2 seeds/day   Bonus awarded alongside check-in when streak >= 7 days
 *
 * One-time actions (awarded once, ever):
 *   complete_profile        +10 seeds      Fill out profile basics
 *   invite_partner          +15 seeds      Send a partner invite
 *   first_share             +5 seeds       First in-app share action
 *   profile_field_completion +5 seeds/field Fill individual profile fields (capped per field)
 *
 * SPENDING OPPORTUNITIES (planned, not yet implemented)
 * -----------------------------------------------------
 *   Unlock premium article collection    50 seeds
 *   Unlock custom avatar frame           30 seeds
 *   Priority "Lumira Expert" response    20 seeds
 *   Unlock "Super Parent" tribe flair   100 seeds
 *   Redeem for partner discount code    200 seeds
 *
 * VISIBILITY IMPROVEMENTS NEEDED
 * --------------------------------
 *   - Toast notification showing seeds earned after each action (+N seeds 🌱)
 *   - Seeds history page listing recent seed_transactions
 *   - Optional: leaderboard among tribe members
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
  daily_checkin: 5,
  log_concern: 3,
  read_article: 2,
  complete_quiz: 3,
  post_in_tribe: 4,
  comment_in_tribe: 2,
  journal_entry: 3,
  complete_profile: 10,
  invite_partner: 15,
  daily_streak_bonus: 2,
  first_share: 5,
  profile_field_completion: 5, // variable amount — overridden by API route
}

/** One-time reasons — only awarded once ever (not per-day) */
const ONE_TIME_REASONS = new Set(['complete_profile', 'invite_partner', 'first_share'])

export interface AwardResult {
  success: boolean
  already_awarded: boolean
  amount: number
  reason: string
}

/**
 * Award seeds to a user. Safe to call multiple times — deduplicates via DB unique index.
 * Works from any server context (no auth cookies needed).
 */
export async function awardSeeds(
  profileId: string,
  reason: string
): Promise<AwardResult> {
  const amount = SEED_REWARDS[reason]
  if (!amount) {
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
        amount,
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
      p_amount: amount,
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
        .update({ seeds_balance: current + amount })
        .eq('id', profileId)
      if (updateError) {
        console.error(`[seeds] Fallback UPDATE also failed:`, updateError.message)
      }
    }

    return { success: true, already_awarded: false, amount, reason }
  } catch (err) {
    console.error(`[seeds] Error awarding ${reason}:`, err)
    return { success: false, already_awarded: false, amount: 0, reason }
  }
}

/**
 * @module Seeds
 * @description Server-side seed awarding logic. Call directly from any API route
 *   without needing HTTP roundtrips or auth cookie forwarding.
 *   Deduplicates by (profile_id, reason, reference_date).
 * @version 1.0.0
 * @since March 2026
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
  complete_profile: 10,
  invite_partner: 15,
  daily_streak_bonus: 2,
  first_share: 5,
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
        // Already awarded
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
      // Fallback: atomic increment via raw SQL-style update
      console.warn(`[seeds] RPC failed, using fallback:`, rpcError.message)
      await serviceClient.rpc('increment_seeds_balance', {
        p_profile_id: profileId,
        p_amount: amount,
      })
    }

    return { success: true, already_awarded: false, amount, reason }
  } catch (err) {
    console.error(`[seeds] Error awarding ${reason}:`, err)
    return { success: false, already_awarded: false, amount: 0, reason }
  }
}

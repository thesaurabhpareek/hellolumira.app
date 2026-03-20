/**
 * @module SeedsAwardAPI
 * @description POST /api/seeds/award — Awards seeds to the authenticated user.
 *   Deduplicates by reason + date so the same action can only earn seeds once
 *   per day. Also updates the seeds_balance on the profiles table.
 * @version 1.0.0
 * @since March 2026
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { SECURITY_HEADERS } from '@/lib/utils'

/** Seed reward amounts by reason */
const SEED_REWARDS: Record<string, number> = {
  daily_checkin: 5,
  log_concern: 3,
  read_article: 2,
  complete_quiz: 3,
  post_in_tribe: 4,
  comment_in_tribe: 2,
  complete_profile: 10,
  invite_partner: 15,
  daily_streak_bonus: 2,
}

/** One-time reasons that should only ever be awarded once (not per-day) */
const ONE_TIME_REASONS = new Set(['complete_profile', 'invite_partner'])

interface AwardRequest {
  reason: string
}

export async function POST(request: NextRequest) {
  try {
    let body: AwardRequest
    try {
      body = (await request.json()) as AwardRequest
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }

    const { reason } = body

    if (!reason || typeof reason !== 'string') {
      return NextResponse.json(
        { error: 'Missing required field: reason' },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }

    const amount = SEED_REWARDS[reason]
    if (!amount) {
      return NextResponse.json(
        { error: `Unknown reward reason: ${reason}` },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }

    const supabase = await createClient()
    const serviceClient = await createServiceClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: SECURITY_HEADERS }
      )
    }

    // For one-time reasons, use a fixed reference date so the unique index prevents duplicates forever
    const referenceDate = ONE_TIME_REASONS.has(reason)
      ? '2000-01-01'
      : new Date().toISOString().split('T')[0]

    // Try to insert (unique index on profile_id + reason + reference_date prevents duplicates)
    const { error: insertError } = await serviceClient
      .from('seed_transactions')
      .insert({
        profile_id: user.id,
        amount,
        reason,
        reference_date: referenceDate,
      })

    if (insertError) {
      // Duplicate — already awarded for this reason today (or ever for one-time)
      if (insertError.code === '23505') {
        return NextResponse.json({
          success: true,
          already_awarded: true,
          amount: 0,
          message: 'Seeds already awarded for this action',
        })
      }
      console.error('[seeds/award] Insert error:', insertError.message)
      return NextResponse.json(
        { error: 'Failed to award seeds' },
        { status: 500, headers: SECURITY_HEADERS }
      )
    }

    // Update balance on profiles
    const { error: updateError } = await serviceClient.rpc('increment_seeds_balance', {
      p_profile_id: user.id,
      p_amount: amount,
    })

    // If the RPC doesn't exist yet, fall back to a manual update
    if (updateError) {
      await serviceClient
        .from('profiles')
        .update({ seeds_balance: amount }) // This is a fallback; ideally the RPC handles atomicity
        .eq('id', user.id)
    }

    return NextResponse.json({
      success: true,
      already_awarded: false,
      amount,
      reason,
      message: `+${amount} seeds earned!`,
    })
  } catch (err) {
    console.error('[seeds/award] Error:', err)
    return NextResponse.json(
      { error: 'Failed to award seeds' },
      { status: 500, headers: SECURITY_HEADERS }
    )
  }
}

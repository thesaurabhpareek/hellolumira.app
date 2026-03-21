/**
 * @module SeedsAwardAPI
 * @description POST /api/seeds/award — Awards seeds to the authenticated user.
 *   This endpoint is for CLIENT-SIDE callers (browser fetch with cookies).
 *   Server-side API routes should use `awardSeeds()` from `@/lib/seeds` directly.
 * @version 2.0.0
 * @since March 2026
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SECURITY_HEADERS } from '@/lib/utils'
import { awardSeeds } from '@/lib/seeds'

/**
 * SECURITY: Only these reasons can be claimed from the client side.
 * Server-side routes (checkin, quiz, tribe posts) call awardSeeds() directly
 * and can use any reason. This prevents users from farming seeds via the API.
 */
const CLIENT_ALLOWED_REASONS = new Set([
  'first_share',
  'read_article',
  'invite_partner',
  'complete_profile',
])

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

    // SECURITY: Only allow client-safe reasons to prevent seed farming
    if (!CLIENT_ALLOWED_REASONS.has(reason)) {
      return NextResponse.json(
        { error: 'Invalid reason' },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: SECURITY_HEADERS }
      )
    }

    const result = await awardSeeds(user.id, reason)

    if (!result.success && !result.already_awarded) {
      return NextResponse.json(
        { error: 'Failed to award seeds' },
        { status: 500, headers: SECURITY_HEADERS }
      )
    }

    return NextResponse.json({
      success: true,
      already_awarded: result.already_awarded,
      amount: result.amount,
      reason,
      message: result.already_awarded
        ? 'Seeds already awarded for this action'
        : `+${result.amount} seeds earned!`,
    })
  } catch (err) {
    console.error('[seeds/award] Error:', err)
    return NextResponse.json(
      { error: 'Failed to award seeds' },
      { status: 500, headers: SECURITY_HEADERS }
    )
  }
}

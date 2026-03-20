/**
 * @module BadgesAwardAPI
 * @description POST /api/badges/award — Awards a badge to the authenticated user.
 *   Deduplicates via unique constraint (profile_id + badge_id).
 *   Returns the badge details and whether it was newly awarded.
 * @version 1.0.0
 * @since March 2026
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { SECURITY_HEADERS } from '@/lib/utils'
import { getBadgeById } from '@/lib/badges'

interface AwardBadgeRequest {
  badge_id: string
}

export async function POST(request: NextRequest) {
  try {
    let body: AwardBadgeRequest
    try {
      body = (await request.json()) as AwardBadgeRequest
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }

    const { badge_id } = body

    if (!badge_id || typeof badge_id !== 'string') {
      return NextResponse.json(
        { error: 'Missing required field: badge_id' },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }

    const badge = getBadgeById(badge_id)
    if (!badge) {
      return NextResponse.json(
        { error: `Unknown badge: ${badge_id}` },
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

    // Try to insert (unique index prevents duplicates)
    const { error: insertError } = await serviceClient
      .from('earned_badges')
      .insert({
        profile_id: user.id,
        badge_id,
      })

    if (insertError) {
      if (insertError.code === '23505') {
        return NextResponse.json({
          success: true,
          newly_awarded: false,
          badge,
          message: 'Badge already earned',
        })
      }
      console.error('[badges/award] Insert error:', insertError.message)
      return NextResponse.json(
        { error: 'Failed to award badge' },
        { status: 500, headers: SECURITY_HEADERS }
      )
    }

    return NextResponse.json({
      success: true,
      newly_awarded: true,
      badge,
      message: `New badge earned: ${badge.name}!`,
    })
  } catch (err) {
    console.error('[badges/award] Error:', err)
    return NextResponse.json(
      { error: 'Failed to award badge' },
      { status: 500, headers: SECURITY_HEADERS }
    )
  }
}

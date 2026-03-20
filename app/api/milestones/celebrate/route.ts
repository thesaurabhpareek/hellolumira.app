/**
 * @module MilestoneCelebrateAPI
 * @description POST /api/milestones/celebrate — Marks a milestone as celebrated
 *   so it won't show up in future /api/milestones/check responses.
 * @version 1.0.0
 * @since March 2026
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SECURITY_HEADERS } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json()
    const { milestone_key, baby_id } = body

    if (!milestone_key || !baby_id) {
      return NextResponse.json(
        { error: 'milestone_key and baby_id are required' },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }

    // Upsert so duplicate calls are safe
    await supabase.from('baby_milestones').upsert(
      {
        baby_id,
        profile_id: user.id,
        milestone_key,
        milestone_type: 'auto',
        title: milestone_key,
        celebrated_at: new Date().toISOString(),
      },
      { onConflict: 'baby_id,milestone_key' }
    )

    return NextResponse.json({ ok: true }, { headers: SECURITY_HEADERS })
  } catch (err) {
    console.error('[MilestoneCelebrateAPI] Error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: SECURITY_HEADERS }
    )
  }
}

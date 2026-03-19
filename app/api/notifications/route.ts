/**
 * @module NotificationsListAPI
 * @description GET /api/notifications — Fetches paginated notifications grouped
 *   by today/earlier. Supports cursor-based pagination, priority ordering, and
 *   automatic expiry filtering.
 * @version 1.0.0
 * @since March 2026
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SECURITY_HEADERS } from '@/lib/utils'
import type { Notification } from '@/types/app'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: SECURITY_HEADERS })
    }

    const { searchParams } = new URL(request.url)
    const parsedLimit = parseInt(searchParams.get('limit') || '20', 10)
    const limit = Math.min(Math.max(isNaN(parsedLimit) ? 20 : parsedLimit, 1), 50)
    const before = searchParams.get('before') // cursor: created_at ISO string

    // Validate cursor is a valid ISO date if provided
    if (before && isNaN(new Date(before).getTime())) {
      return NextResponse.json({ error: 'Invalid cursor format' }, { status: 400, headers: SECURITY_HEADERS })
    }

    let query = supabase
      .from('notifications')
      .select('id, profile_id, baby_id, type, title, body, emoji, action_url, is_read, is_dismissed, read_at, source_type, source_id, priority, expires_at, created_at')
      .eq('profile_id', user.id)
      .eq('is_dismissed', false)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .order('priority', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(limit)

    if (before) {
      query = query.lt('created_at', before)
    }

    const { data, error } = await query

    if (error) {
      console.error('[GET /api/notifications] Error:', error.message)
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500, headers: SECURITY_HEADERS })
    }

    const notifications = (data || []) as Notification[]

    // Group by today vs earlier
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayISO = todayStart.toISOString()

    const today = notifications.filter((n) => n.created_at >= todayISO)
    const earlier = notifications.filter((n) => n.created_at < todayISO)

    const nextCursor =
      notifications.length === limit
        ? notifications[notifications.length - 1].created_at
        : null

    return NextResponse.json({
      today,
      earlier,
      next_cursor: nextCursor,
    })
  } catch (err) {
    console.error('[GET /api/notifications] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: SECURITY_HEADERS })
  }
}

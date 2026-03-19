/**
 * @module UnreadCountAPI
 * @description GET /api/notifications/unread-count — Returns the count of unread,
 *   non-dismissed, non-expired notifications (capped at 99 for display).
 * @version 1.0.0
 * @since March 2026
 */

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SECURITY_HEADERS } from '@/lib/utils'

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: SECURITY_HEADERS })
    }

    const { count, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('profile_id', user.id)
      .eq('is_read', false)
      .eq('is_dismissed', false)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)

    if (error) {
      console.error('[GET /api/notifications/unread-count] Error:', error.message)
      return NextResponse.json({ count: 0 })
    }

    // Cap at 99 to prevent large numbers
    return NextResponse.json({ count: Math.min(count ?? 0, 99) })
  } catch (err) {
    console.error('[GET /api/notifications/unread-count] Unexpected error:', err)
    return NextResponse.json({ count: 0 })
  }
}

/**
 * @module MarkAllReadAPI
 * @description POST /api/notifications/mark-all-read — Marks all unread
 *   notifications as read for the authenticated user. Returns the count
 *   of notifications that were marked.
 * @version 1.0.0
 * @since March 2026
 */

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SECURITY_HEADERS } from '@/lib/utils'

export async function POST() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: SECURITY_HEADERS })
    }

    // Count and update in parallel — count is for the response, update is the mutation
    const now = new Date().toISOString()
    const [{ count }, { error }] = await Promise.all([
      supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('profile_id', user.id)
        .eq('is_read', false)
        .eq('is_dismissed', false),
      supabase
        .from('notifications')
        .update({ is_read: true, read_at: now })
        .eq('profile_id', user.id)
        .eq('is_read', false),
    ])

    if (error) {
      console.error('[POST /api/notifications/mark-all-read] Error:', error.message)
      return NextResponse.json({ error: 'Failed to mark all as read' }, { status: 500, headers: SECURITY_HEADERS })
    }

    return NextResponse.json({ count_marked: count ?? 0 })
  } catch (err) {
    console.error('[POST /api/notifications/mark-all-read] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: SECURITY_HEADERS })
  }
}

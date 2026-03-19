/**
 * @module MarkReadAPI
 * @description POST /api/notifications/mark-read — Marks specific notifications
 *   as read. Accepts up to 50 notification IDs per request, scoped to the
 *   authenticated user via RLS.
 * @version 1.0.0
 * @since March 2026
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isValidUUID } from '@/lib/validation'

interface MarkReadBody {
  notification_ids: string[]
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: MarkReadBody
    try {
      body = (await request.json()) as MarkReadBody
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { notification_ids } = body

    if (!Array.isArray(notification_ids) || notification_ids.length === 0) {
      return NextResponse.json({ error: 'notification_ids required' }, { status: 400 })
    }

    // Filter to only valid UUID IDs and cap at 50
    const ids = notification_ids
      .filter((id): id is string => typeof id === 'string' && isValidUUID(id))
      .slice(0, 50)

    if (ids.length === 0) {
      return NextResponse.json({ error: 'No valid notification_ids provided' }, { status: 400 })
    }

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('profile_id', user.id)
      .in('id', ids)

    if (error) {
      console.error('[POST /api/notifications/mark-read] Error:', error.message)
      return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[POST /api/notifications/mark-read] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

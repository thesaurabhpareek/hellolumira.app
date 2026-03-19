/**
 * @module DismissNotificationAPI
 * @description POST /api/notifications/dismiss — Soft-deletes a notification
 *   by setting is_dismissed=true. Scoped to the authenticated user via RLS.
 * @version 1.0.0
 * @since March 2026
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isValidUUID } from '@/lib/validation'

interface DismissBody {
  notification_id: string
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

    let body: DismissBody
    try {
      body = (await request.json()) as DismissBody
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { notification_id } = body

    if (!notification_id || typeof notification_id !== 'string') {
      return NextResponse.json({ error: 'notification_id required' }, { status: 400 })
    }
    if (!isValidUUID(notification_id)) {
      return NextResponse.json({ error: 'Invalid notification_id format' }, { status: 400 })
    }

    const { error } = await supabase
      .from('notifications')
      .update({ is_dismissed: true })
      .eq('id', notification_id)
      .eq('profile_id', user.id)

    if (error) {
      console.error('[POST /api/notifications/dismiss] Error:', error.message)
      return NextResponse.json({ error: 'Failed to dismiss' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[POST /api/notifications/dismiss] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

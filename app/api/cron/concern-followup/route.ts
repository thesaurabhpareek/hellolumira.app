/**
 * @module CronConcernFollowup
 * @description GET /api/cron/concern-followup — Vercel cron job that runs daily
 *   at 9am UTC. Queries concern_sessions where follow_up_due <= now and
 *   follow_up_sent = false. Creates a notification for each overdue follow-up
 *   and marks follow_up_sent = true after notification is created.
 *   Validates CRON_SECRET from the Authorization header.
 * @version 1.0.0
 * @since March 2026
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    // Validate CRON_SECRET
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      console.error('[cron/concern-followup] Unauthorized: invalid or missing CRON_SECRET')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use service role client (bypasses RLS, no cookies needed)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const today = new Date().toISOString().split('T')[0]

    // Fetch overdue follow-ups
    const { data: overdueSessions, error: fetchError } = await supabase
      .from('concern_sessions')
      .select('id, baby_id, profile_id, concern_type')
      .lte('follow_up_due', today)
      .eq('follow_up_sent', false)

    if (fetchError) {
      console.error('[cron/concern-followup] Failed to fetch overdue sessions:', fetchError.message)
      return NextResponse.json({ error: 'Failed to fetch overdue sessions' }, { status: 500 })
    }

    if (!overdueSessions || overdueSessions.length === 0) {
      console.log('[cron/concern-followup] No overdue follow-ups found')
      return NextResponse.json({ success: true, notifications_created: 0 })
    }

    let notificationsCreated = 0
    let errors = 0

    for (const session of overdueSessions) {
      try {
        // Format concern type for display
        const concernDisplay = session.concern_type
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (c: string) => c.toUpperCase())

        // Create notification directly via DB insert (avoids cookie dependency of createNotification)
        const defaultExpiry = new Date()
        defaultExpiry.setDate(defaultExpiry.getDate() + 14)

        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            profile_id: session.profile_id,
            baby_id: session.baby_id,
            type: 'concern_followup',
            title: `Follow-up: ${concernDisplay}`,
            body: `It's been a couple of days since you logged a concern about ${concernDisplay.toLowerCase()}. How are things going? Tap to update or chat with Lumira.`,
            emoji: '\uD83D\uDCCB',
            action_url: `/concerns/${session.id}`,
            is_read: false,
            is_dismissed: false,
            read_at: null,
            source_type: 'concern_session',
            source_id: session.id,
            priority: 1,
            expires_at: defaultExpiry.toISOString(),
          })

        if (notifError) {
          console.error(`[cron/concern-followup] Failed to create notification for session ${session.id}:`, notifError.message)
          errors++
          continue
        }

        // Mark follow_up_sent = true
        const { error: updateError } = await supabase
          .from('concern_sessions')
          .update({ follow_up_sent: true })
          .eq('id', session.id)

        if (updateError) {
          console.error(`[cron/concern-followup] Failed to update session ${session.id}:`, updateError.message)
          errors++
          continue
        }

        notificationsCreated++
        console.log(`[cron/concern-followup] Created follow-up notification for session ${session.id}`)
      } catch (sessionErr) {
        console.error(`[cron/concern-followup] Error processing session ${session.id}:`, sessionErr)
        errors++
      }
    }

    console.log(`[cron/concern-followup] Complete: ${notificationsCreated} notifications created, ${errors} errors`)
    return NextResponse.json({
      success: true,
      notifications_created: notificationsCreated,
      errors,
    })
  } catch (err) {
    console.error('[cron/concern-followup] Fatal error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

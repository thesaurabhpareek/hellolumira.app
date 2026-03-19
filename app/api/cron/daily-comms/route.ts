/**
 * @module CronDailyComms
 * @description GET /api/cron/daily-comms — Vercel cron job that runs every hour.
 *   For each user whose preferred check-in hour matches the current UTC hour
 *   (adjusted for their timezone), sends a daily check-in email if they have not
 *   already checked in today. Validates CRON_SECRET from the Authorization header.
 *   Uses the service role Supabase client (bypasses RLS).
 * @version 1.0.0
 * @since March 2026
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/resend'
import { dailyCheckinEmail } from '@/lib/email-templates'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://hellolumira.app'

export async function GET(request: NextRequest) {
  try {
    // Validate CRON_SECRET
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      console.error('[cron/daily-comms] Unauthorized: invalid or missing CRON_SECRET')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use service role client (bypasses RLS, no cookies needed)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const currentUtcHour = new Date().getUTCHours()
    const today = new Date().toISOString().split('T')[0]

    // Get all communication preferences where daily checkin email is enabled
    const { data: prefs, error: prefsError } = await supabase
      .from('communication_preferences')
      .select('profile_id, checkin_hour, timezone')
      .eq('email_enabled', true)
      .eq('email_daily_checkin', true)

    if (prefsError) {
      console.error('[cron/daily-comms] Failed to fetch communication preferences:', prefsError.message)
      return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 })
    }

    if (!prefs || prefs.length === 0) {
      console.log('[cron/daily-comms] No eligible profiles found')
      return NextResponse.json({ success: true, emails_sent: 0, errors: 0 })
    }

    // Filter profiles whose preferred checkin hour maps to the current UTC hour
    const eligibleProfileIds: string[] = []
    for (const pref of prefs) {
      const localHour = pref.checkin_hour ?? 8 // default to 8am local
      const tz = pref.timezone || 'UTC'

      // Convert the user's preferred local hour to UTC
      // Create a date at the preferred local hour in their timezone, then get UTC hour
      let utcHourForUser: number
      try {
        const refDate = new Date()
        // Use Intl to figure out the current offset for this timezone
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: tz,
          hour: 'numeric',
          hour12: false,
        })
        const localNowHour = parseInt(formatter.format(refDate), 10)
        const offset = localNowHour - refDate.getUTCHours()
        // Preferred UTC hour = preferred local hour - offset
        utcHourForUser = ((localHour - offset) % 24 + 24) % 24
      } catch {
        // Fallback: treat checkin_hour as UTC
        utcHourForUser = localHour
      }

      if (utcHourForUser === currentUtcHour) {
        eligibleProfileIds.push(pref.profile_id)
      }
    }

    if (eligibleProfileIds.length === 0) {
      console.log(`[cron/daily-comms] No profiles match UTC hour ${currentUtcHour}`)
      return NextResponse.json({ success: true, emails_sent: 0, errors: 0 })
    }

    // Fetch profiles that have NOT checked in today
    // First get today's checkins to exclude those profiles
    const { data: todayCheckins } = await supabase
      .from('daily_checkins')
      .select('profile_id')
      .eq('checkin_date', today)
      .in('profile_id', eligibleProfileIds)

    const checkedInProfileIds = new Set((todayCheckins || []).map((c) => c.profile_id))
    const needsEmailProfileIds = eligibleProfileIds.filter((id) => !checkedInProfileIds.has(id))

    if (needsEmailProfileIds.length === 0) {
      console.log('[cron/daily-comms] All eligible profiles have already checked in today')
      return NextResponse.json({ success: true, emails_sent: 0, errors: 0 })
    }

    // Fetch profiles with their auth emails
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, first_name')
      .in('id', needsEmailProfileIds)

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ success: true, emails_sent: 0, errors: 0 })
    }

    // Get auth emails for these profiles
    const { data: authUsers } = await supabase.auth.admin.listUsers()
    const emailMap = new Map<string, string>()
    if (authUsers?.users) {
      for (const u of authUsers.users) {
        if (u.email) emailMap.set(u.id, u.email)
      }
    }

    let emailsSent = 0
    let errors = 0

    for (const profile of profiles) {
      try {
        const email = emailMap.get(profile.id)
        if (!email) {
          console.warn(`[cron/daily-comms] No email found for profile ${profile.id}`)
          continue
        }

        // Get baby profile for this user
        const { data: memberData } = await supabase
          .from('baby_profile_members')
          .select('baby_id')
          .eq('profile_id', profile.id)
          .limit(1)
          .maybeSingle()

        if (!memberData?.baby_id) continue

        const { data: babyData } = await supabase
          .from('baby_profiles')
          .select('id, name')
          .eq('id', memberData.baby_id)
          .single()

        if (!babyData) continue

        const babyName = babyData.name || 'your little one'

        // Generate email content from premium template (includes full legal compliance)
        const prefillUrl = `${APP_URL}/checkin`
        const { subject, html } = dailyCheckinEmail(
          profile.first_name,
          babyName,
          email,
          prefillUrl
        )

        // Send email (skipFooter: true because premium templates include full footer)
        const result = await sendEmail(email, subject, html, {
          tags: [{ name: 'category', value: 'daily_checkin_cron' }],
          skipFooter: true,
        })

        // Log in communication_log
        await supabase.from('communication_log').insert({
          profile_id: profile.id,
          channel: 'email',
          message_type: 'daily_checkin',
          subject,
          recipient: email,
          status: result.success ? 'sent' : 'failed',
          message_id: result.messageId || null,
          error: result.error || null,
          sent_at: new Date().toISOString(),
        }).then(({ error: logError }) => {
          if (logError) {
            console.warn(`[cron/daily-comms] Failed to log communication for ${profile.id}:`, logError.message)
          }
        })

        if (result.success) {
          emailsSent++
          console.log(`[cron/daily-comms] Sent daily check-in email to ${profile.id}`)
        } else {
          console.error(`[cron/daily-comms] Failed to send email to ${profile.id}:`, result.error)
          errors++
        }
      } catch (profileErr) {
        console.error(`[cron/daily-comms] Error processing profile ${profile.id}:`, profileErr)
        errors++
      }
    }

    console.log(`[cron/daily-comms] Complete: ${emailsSent} emails sent, ${errors} errors`)
    return NextResponse.json({
      success: true,
      emails_sent: emailsSent,
      errors,
    })
  } catch (err) {
    console.error('[cron/daily-comms] Fatal error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

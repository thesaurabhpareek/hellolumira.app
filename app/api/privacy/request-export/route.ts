/**
 * @module RequestExportAPI
 * @description POST /api/privacy/request-export — GDPR/CCPA data portability.
 *   Assembles all user data (profile, baby profiles, members, check-ins, concerns,
 *   journal entries, milestones, consent records, communication prefs, weekly
 *   summaries, pattern observations) in a single parallelised query batch.
 *   Stores the assembled JSON in the export request row with a crypto download
 *   token and 48-hour expiry. Logs an audit event.
 * @version 2.0.0
 * @since March 2026
 */

export const dynamic = 'force-dynamic'

import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/audit'
import { SECURITY_HEADERS } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: true, message: 'Unauthorized' }, { status: 401, headers: SECURITY_HEADERS })
    }

    const serviceClient = await createServiceClient()

    // Generate a secure download token and set 48-hour expiry
    const downloadToken = crypto.randomBytes(32).toString('hex')
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 48 * 60 * 60 * 1000)

    // Create the export request record with token and expiry
    const { data: exportRequest, error: insertError } = await serviceClient
      .from('data_export_requests')
      .insert({
        profile_id: user.id,
        status: 'pending',
        requested_at: now.toISOString(),
        download_token: downloadToken,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single()

    if (insertError || !exportRequest) {
      console.error('[request-export] Failed to create export request:', insertError?.message)
      return NextResponse.json(
        { error: true, message: 'Failed to create export request.' },
        { status: 500, headers: SECURITY_HEADERS }
      )
    }

    // Log audit event (non-critical)
    try {
      await logAudit('data_export_requested', user.id, { request_id: exportRequest.id }, request)
    } catch (auditErr) {
      console.error('[request-export] Audit log error (non-fatal):', auditErr)
    }

    // Assemble ALL user data in parallel
    const [
      profileResult,
      babyProfilesResult,
      babyProfileMembersResult,
      checkinsResult,
      concernSessionsResult,
      journalEntriesResult,
      milestonesResult,
      consentRecordsResult,
      communicationPrefsResult,
      weeklySummariesResult,
      patternObservationsResult,
      chatThreadsResult,
      _chatMessagesResult, // included via chat_threads relation
      partnerInvitesResult,
      communicationLogResult,
      pregnancyAppointmentsResult,
      privacyPreferencesResult,
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('baby_profiles').select('*').eq('created_by_profile_id', user.id),
      supabase.from('baby_profile_members').select('*').eq('profile_id', user.id),
      supabase.from('daily_checkins').select('*').eq('profile_id', user.id),
      supabase.from('concern_sessions').select('*').eq('profile_id', user.id),
      supabase.from('journal_entries').select('*').eq('profile_id', user.id),
      supabase.from('milestones').select('*').eq('profile_id', user.id),
      supabase.from('consent_records').select('*').eq('profile_id', user.id),
      supabase.from('communication_preferences').select('*').eq('profile_id', user.id).maybeSingle(),
      supabase.from('weekly_summaries').select('*').eq('profile_id', user.id),
      supabase.from('pattern_observations').select('*').eq('profile_id', user.id),
      supabase.from('chat_threads').select('*, chat_messages(*)').eq('profile_id', user.id),
      Promise.resolve({ data: null }), // chat_messages included via chat_threads relation above
      supabase.from('partner_invites').select('*').eq('invited_by_profile_id', user.id),
      supabase.from('communication_log').select('*').eq('profile_id', user.id),
      supabase.from('pregnancy_appointments').select('*').eq('profile_id', user.id),
      supabase.from('privacy_preferences').select('*').eq('profile_id', user.id).maybeSingle(),
    ])

    const exportData = {
      exported_at: now.toISOString(),
      request_id: exportRequest.id,
      profile: profileResult.data ?? null,
      baby_profiles: babyProfilesResult.data ?? [],
      baby_profile_members: babyProfileMembersResult.data ?? [],
      daily_checkins: checkinsResult.data ?? [],
      concern_sessions: concernSessionsResult.data ?? [],
      journal_entries: journalEntriesResult.data ?? [],
      milestones: milestonesResult.data ?? [],
      consent_records: consentRecordsResult.data ?? [],
      communication_preferences: communicationPrefsResult.data ?? null,
      weekly_summaries: weeklySummariesResult.data ?? [],
      pattern_observations: patternObservationsResult.data ?? [],
      chat_threads: chatThreadsResult.data ?? [], // includes nested chat_messages
      partner_invites: partnerInvitesResult.data ?? [],
      communication_log: communicationLogResult.data ?? [],
      pregnancy_appointments: pregnancyAppointmentsResult.data ?? [],
      privacy_preferences: privacyPreferencesResult.data ?? null,
    }

    // Store the assembled export data in the request row and mark as ready
    const { error: updateError } = await serviceClient
      .from('data_export_requests')
      .update({
        status: 'ready',
        export_data: exportData,
        completed_at: new Date().toISOString(),
      })
      .eq('id', exportRequest.id)

    if (updateError) {
      console.error('[request-export] Failed to store export data:', updateError.message)
      return NextResponse.json(
        { error: true, message: 'Failed to assemble export data.' },
        { status: 500, headers: SECURITY_HEADERS }
      )
    }

    return NextResponse.json({
      request_id: exportRequest.id,
      status: 'ready',
      download_token: downloadToken,
      expires_at: expiresAt.toISOString(),
      data: exportData,
    }, { headers: SECURITY_HEADERS })
  } catch (err) {
    console.error('[request-export] Error:', err)
    return NextResponse.json(
      { error: true, message: 'Something went wrong. Try again.' },
      { status: 500, headers: SECURITY_HEADERS }
    )
  }
}

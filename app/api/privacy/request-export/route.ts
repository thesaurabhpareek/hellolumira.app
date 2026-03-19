/**
 * @module RequestExportAPI
 * @description POST /api/privacy/request-export — GDPR/CCPA data portability.
 *   Assembles all user data (profile, baby profiles, check-ins, concerns,
 *   journal entries, milestones, consent records, communication prefs) in a
 *   single parallelised query batch and returns inline JSON. Logs an audit event.
 * @version 1.0.0
 * @since March 2026
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/audit'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: true, message: 'Unauthorized' }, { status: 401 })
    }

    const serviceClient = await createServiceClient()

    // Create the export request record
    const now = new Date().toISOString()
    const { data: exportRequest, error: insertError } = await serviceClient
      .from('data_export_requests')
      .insert({
        profile_id: user.id,
        status: 'pending',
        requested_at: now,
      })
      .select()
      .single()

    if (insertError || !exportRequest) {
      console.error('[request-export] Failed to create export request:', insertError?.message)
      return NextResponse.json(
        { error: true, message: 'Failed to create export request.' },
        { status: 500 }
      )
    }

    // Log audit event (non-critical)
    try {
      await logAudit('data_export_requested', user.id, { request_id: exportRequest.id }, request)
    } catch (auditErr) {
      console.error('[request-export] Audit log error (non-fatal):', auditErr)
    }

    // Auto-verify and assemble export data (v1: return inline JSON)
    const [
      profileResult,
      babyProfilesResult,
      checkinsResult,
      concernSessionsResult,
      journalEntriesResult,
      milestonesResult,
      consentRecordsResult,
      communicationPrefsResult,
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('baby_profiles').select('*').eq('created_by_profile_id', user.id),
      supabase.from('daily_checkins').select('*').eq('profile_id', user.id),
      supabase.from('concern_sessions').select('*').eq('profile_id', user.id),
      supabase.from('journal_entries').select('*').eq('profile_id', user.id),
      supabase.from('milestones').select('*').eq('profile_id', user.id),
      supabase.from('consent_records').select('*').eq('profile_id', user.id),
      supabase.from('communication_preferences').select('*').eq('profile_id', user.id).maybeSingle(),
    ])

    const exportData = {
      exported_at: now,
      request_id: exportRequest.id,
      profile: profileResult.data ?? null,
      baby_profiles: babyProfilesResult.data ?? [],
      daily_checkins: checkinsResult.data ?? [],
      concern_sessions: concernSessionsResult.data ?? [],
      journal_entries: journalEntriesResult.data ?? [],
      milestones: milestonesResult.data ?? [],
      consent_records: consentRecordsResult.data ?? [],
      communication_preferences: communicationPrefsResult.data ?? null,
    }

    // Update request status to ready
    await serviceClient
      .from('data_export_requests')
      .update({
        status: 'ready',
        completed_at: new Date().toISOString(),
      })
      .eq('id', exportRequest.id)

    return NextResponse.json({
      request_id: exportRequest.id,
      status: 'ready',
      data: exportData,
    })
  } catch (err) {
    console.error('[request-export] Error:', err)
    return NextResponse.json(
      { error: true, message: 'Something went wrong. Try again.' },
      { status: 500 }
    )
  }
}

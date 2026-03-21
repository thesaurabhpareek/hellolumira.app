/**
 * @module VerifyDeletionAPI
 * @description POST /api/privacy/verify-deletion — GDPR right-to-erasure execution.
 *   Validates a deletion verification token, then performs a cascading delete of
 *   all user data across all tables, anonymises audit logs, and removes the
 *   auth.users record via the Supabase Admin API. No user auth required — access
 *   is granted via the cryptographic verification token.
 * @version 1.0.0
 * @since March 2026
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { SECURITY_HEADERS } from '@/lib/utils'
import { checkIpRateLimit } from '@/lib/rate-limit'

interface VerifyDeletionBody {
  token: string
}

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Rate limit by IP to prevent token brute-force
    const { allowed, retryAfter } = await checkIpRateLimit(request, 5, 60_000)
    if (!allowed) {
      return NextResponse.json(
        { error: true, message: 'Too many requests. Please try again later.' },
        { status: 429, headers: { ...SECURITY_HEADERS, 'Retry-After': String(retryAfter) } }
      )
    }

    let body: VerifyDeletionBody
    try {
      body = (await request.json()) as VerifyDeletionBody
    } catch {
      return NextResponse.json(
        { error: true, message: 'Invalid JSON body' },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }

    if (!body.token || typeof body.token !== 'string' || body.token.length < 16) {
      return NextResponse.json(
        { error: true, message: 'Invalid or missing verification token.' },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }

    // Use service role client (bypasses RLS, can delete auth users)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Look up the deletion request by token
    const { data: deletionRequest, error: fetchError } = await supabase
      .from('data_deletion_requests')
      .select('*')
      .eq('verification_token', body.token)
      .single()

    if (fetchError || !deletionRequest) {
      return NextResponse.json(
        { error: true, message: 'Deletion request not found.' },
        { status: 404, headers: SECURITY_HEADERS }
      )
    }

    // Only process pending_verification requests
    if (deletionRequest.status !== 'pending_verification') {
      return NextResponse.json(
        {
          error: true,
          message: `Deletion request has already been ${deletionRequest.status}.`,
        },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }

    // Enforce 72-hour token expiry (uses existing created_at — no schema migration needed)
    const TOKEN_TTL_MS = 72 * 60 * 60 * 1000
    const createdAt = new Date(deletionRequest.created_at).getTime()
    if (Date.now() - createdAt > TOKEN_TTL_MS) {
      await supabase
        .from('data_deletion_requests')
        .update({ status: 'expired' })
        .eq('id', deletionRequest.id)
      return NextResponse.json(
        { error: true, message: 'This deletion link has expired. Please submit a new deletion request from your account settings.' },
        { status: 410, headers: SECURITY_HEADERS }
      )
    }

    const profileId = deletionRequest.profile_id

    // Execute cascading deletion in order (respecting foreign key constraints)
    // Each delete is wrapped individually to handle tables that may not exist
    // Order: leaf tables first, then junction tables, then parent tables

    // 1. Delete from chat_messages (FK to chat_threads — must go before chat_threads)
    try {
      // Get thread IDs first, then delete messages belonging to user's threads
      const { data: threads } = await supabase
        .from('chat_threads')
        .select('id')
        .eq('profile_id', profileId)
      if (threads && threads.length > 0) {
        const threadIds = threads.map((t: { id: string }) => t.id)
        await supabase.from('chat_messages').delete().in('thread_id', threadIds)
      }
    } catch (e) {
      console.error('[verify-deletion] Error deleting chat_messages:', e)
    }

    // 2. Delete from chat_threads
    try {
      await supabase.from('chat_threads').delete().eq('profile_id', profileId)
    } catch (e) {
      console.error('[verify-deletion] Error deleting chat_threads:', e)
    }

    // 3. Delete from daily_checkins
    try {
      await supabase.from('daily_checkins').delete().eq('profile_id', profileId)
    } catch (e) {
      console.error('[verify-deletion] Error deleting daily_checkins:', e)
    }

    // 4. Delete from concern_sessions
    try {
      await supabase.from('concern_sessions').delete().eq('profile_id', profileId)
    } catch (e) {
      console.error('[verify-deletion] Error deleting concern_sessions:', e)
    }

    // 5. Delete from journal_entries
    try {
      await supabase.from('journal_entries').delete().eq('profile_id', profileId)
    } catch (e) {
      console.error('[verify-deletion] Error deleting journal_entries:', e)
    }

    // 6. Delete from milestones
    try {
      await supabase.from('milestones').delete().eq('profile_id', profileId)
    } catch (e) {
      console.error('[verify-deletion] Error deleting milestones:', e)
    }

    // 7. Delete from pattern_observations
    try {
      await supabase.from('pattern_observations').delete().eq('profile_id', profileId)
    } catch (e) {
      console.error('[verify-deletion] Error deleting pattern_observations:', e)
    }

    // 8. Delete from weekly_summaries
    try {
      await supabase.from('weekly_summaries').delete().eq('profile_id', profileId)
    } catch (e) {
      console.error('[verify-deletion] Error deleting weekly_summaries:', e)
    }

    // 9. Delete from pregnancy_appointments
    try {
      await supabase.from('pregnancy_appointments').delete().eq('profile_id', profileId)
    } catch (e) {
      console.error('[verify-deletion] Error deleting pregnancy_appointments:', e)
    }

    // 10. Delete from communication_log
    try {
      await supabase.from('communication_log').delete().eq('profile_id', profileId)
    } catch (e) {
      console.error('[verify-deletion] Error deleting communication_log:', e)
    }

    // 11. Delete from notifications
    try {
      await supabase.from('notifications').delete().eq('profile_id', profileId)
    } catch (e) {
      console.error('[verify-deletion] Error deleting notifications:', e)
    }

    // 12. Delete from baby_profile_members
    try {
      await supabase.from('baby_profile_members').delete().eq('profile_id', profileId)
    } catch (e) {
      console.error('[verify-deletion] Error deleting baby_profile_members:', e)
    }

    // 13. Delete from partner_invites (invited_by_profile_id)
    try {
      await supabase.from('partner_invites').delete().eq('invited_by_profile_id', profileId)
    } catch (e) {
      console.error('[verify-deletion] Error deleting partner_invites:', e)
    }

    // 14. Delete from communication_preferences
    try {
      await supabase.from('communication_preferences').delete().eq('profile_id', profileId)
    } catch (e) {
      console.error('[verify-deletion] Error deleting communication_preferences:', e)
    }

    // 15. Delete from privacy_preferences
    try {
      await supabase.from('privacy_preferences').delete().eq('profile_id', profileId)
    } catch (e) {
      console.error('[verify-deletion] Error deleting privacy_preferences:', e)
    }

    // 16. Anonymise audit_log (set profile_id to NULL, don't delete)
    try {
      await supabase
        .from('audit_log')
        .update({ profile_id: null })
        .eq('profile_id', profileId)
    } catch (e) {
      console.error('[verify-deletion] Error anonymising audit_log:', e)
    }

    // 17. Delete from consent_records
    try {
      await supabase.from('consent_records').delete().eq('profile_id', profileId)
    } catch (e) {
      console.error('[verify-deletion] Error deleting consent_records:', e)
    }

    // 18. Delete from data_export_requests
    try {
      await supabase.from('data_export_requests').delete().eq('profile_id', profileId)
    } catch (e) {
      console.error('[verify-deletion] Error deleting data_export_requests:', e)
    }

    // 19. Update deletion request status to completed BEFORE deleting profile
    const { error: updateError } = await supabase
      .from('data_deletion_requests')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', deletionRequest.id)

    if (updateError) {
      console.error('[verify-deletion] Error updating deletion request status:', updateError.message)
    }

    // 20. Delete from baby_profiles (created by this user)
    try {
      await supabase.from('baby_profiles').delete().eq('created_by_profile_id', profileId)
    } catch (e) {
      console.error('[verify-deletion] Error deleting baby_profiles:', e)
    }

    // 21. Delete from profiles
    try {
      await supabase.from('profiles').delete().eq('id', profileId)
    } catch (e) {
      console.error('[verify-deletion] Error deleting profile:', e)
    }

    // 22. Delete auth.users record via Supabase Admin API
    try {
      const { error: authDeleteError } = await supabase.auth.admin.deleteUser(profileId)
      if (authDeleteError) {
        console.error('[verify-deletion] Error deleting auth user:', authDeleteError.message)
      }
    } catch (e) {
      console.error('[verify-deletion] Error deleting auth user:', e)
    }

    return NextResponse.json({
      success: true,
      message: 'Your account and all associated data have been permanently deleted.',
      request_id: deletionRequest.id,
      status: 'completed',
    }, { headers: SECURITY_HEADERS })
  } catch (err) {
    console.error('[verify-deletion] Error:', err)
    return NextResponse.json(
      { error: true, message: 'Something went wrong. Try again.' },
      { status: 500, headers: SECURITY_HEADERS }
    )
  }
}

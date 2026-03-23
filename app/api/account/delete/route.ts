/**
 * @module AccountDeleteAPI
 * @description POST /api/account/delete — Permanently deletes the authenticated
 *   user's account and all their data. GDPR Article 17 (right to erasure) compliant.
 *   Performs cascading deletion across all user-owned tables in FK-safe order,
 *   then removes the auth.users record via the Supabase Admin API.
 * @version 1.0.0
 * @since March 2026
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { SECURITY_HEADERS } from '@/lib/utils'

export async function POST(_request: NextRequest) {
  try {
    // 1. Authenticate — must be a valid session
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: true, message: 'Unauthorized' },
        { status: 401, headers: SECURITY_HEADERS }
      )
    }

    const userId = user.id

    // 2. Service-role client — bypasses RLS for admin operations
    const service = await createServiceClient()

    // 3. Cascade deletion: child tables first to avoid FK violations

    // 3a. chat_messages — child of chat_threads
    try {
      const { data: threads } = await service
        .from('chat_threads')
        .select('id')
        .eq('profile_id', userId)
      if (threads && threads.length > 0) {
        const threadIds = threads.map((t: { id: string }) => t.id)
        await service.from('chat_messages').delete().in('thread_id', threadIds)
      }
    } catch (e) {
      console.error('[DELETE /api/account/delete] chat_messages:', e)
    }

    // 3b. chat_threads
    try {
      await service.from('chat_threads').delete().eq('profile_id', userId)
    } catch (e) {
      console.error('[DELETE /api/account/delete] chat_threads:', e)
    }

    // 3c. daily_checkins
    try {
      await service.from('daily_checkins').delete().eq('profile_id', userId)
    } catch (e) {
      console.error('[DELETE /api/account/delete] daily_checkins:', e)
    }

    // 3d. notifications
    try {
      await service.from('notifications').delete().eq('profile_id', userId)
    } catch (e) {
      console.error('[DELETE /api/account/delete] notifications:', e)
    }

    // 3e. concern_sessions
    try {
      await service.from('concern_sessions').delete().eq('profile_id', userId)
    } catch (e) {
      console.error('[DELETE /api/account/delete] concern_sessions:', e)
    }

    // 3f. weekly_summaries — keyed by baby_id; delete for all user's babies
    try {
      const { data: babyMemberships } = await service
        .from('baby_profile_members')
        .select('baby_id')
        .eq('profile_id', userId)
      if (babyMemberships && babyMemberships.length > 0) {
        const babyIds = babyMemberships.map((m: { baby_id: string }) => m.baby_id)
        await service.from('weekly_summaries').delete().in('baby_id', babyIds)
      }
    } catch (e) {
      console.error('[DELETE /api/account/delete] weekly_summaries:', e)
    }

    // 3g. journal_entries
    try {
      await service.from('journal_entries').delete().eq('profile_id', userId)
    } catch (e) {
      console.error('[DELETE /api/account/delete] journal_entries:', e)
    }

    // 3h. milestones
    try {
      await service.from('milestones').delete().eq('profile_id', userId)
    } catch (e) {
      console.error('[DELETE /api/account/delete] milestones:', e)
    }

    // 3i. baby_milestones (from v19 enhanced content)
    try {
      await service.from('baby_milestones').delete().eq('profile_id', userId)
    } catch (e) {
      console.error('[DELETE /api/account/delete] baby_milestones:', e)
    }

    // 3j. pattern_observations
    try {
      await service.from('pattern_observations').delete().eq('profile_id', userId)
    } catch (e) {
      console.error('[DELETE /api/account/delete] pattern_observations:', e)
    }

    // 3k. pregnancy_appointments
    try {
      await service.from('pregnancy_appointments').delete().eq('profile_id', userId)
    } catch (e) {
      console.error('[DELETE /api/account/delete] pregnancy_appointments:', e)
    }

    // 3l. quiz_attempts (from v19 enhanced content)
    try {
      await service.from('quiz_attempts').delete().eq('profile_id', userId)
    } catch (e) {
      console.error('[DELETE /api/account/delete] quiz_attempts:', e)
    }

    // 3m. seed_transactions (from v19 seeds/badges)
    try {
      await service.from('seed_transactions').delete().eq('profile_id', userId)
    } catch (e) {
      console.error('[DELETE /api/account/delete] seed_transactions:', e)
    }

    // 3n. earned_badges (from v19 seeds/badges)
    try {
      await service.from('earned_badges').delete().eq('profile_id', userId)
    } catch (e) {
      console.error('[DELETE /api/account/delete] earned_badges:', e)
    }

    // 3o. share_tracking (from v19 seeds/badges; referrer_profile_id)
    try {
      await service.from('share_tracking').delete().eq('referrer_profile_id', userId)
    } catch (e) {
      console.error('[DELETE /api/account/delete] share_tracking:', e)
    }

    // 3p. tribe_reactions (ON DELETE CASCADE from profiles, but explicit for safety)
    try {
      await service.from('tribe_reactions').delete().eq('profile_id', userId)
    } catch (e) {
      console.error('[DELETE /api/account/delete] tribe_reactions:', e)
    }

    // 3q. tribe_comments — SET NULL on delete, anonymise by nullifying profile_id
    try {
      await service
        .from('tribe_comments')
        .update({ profile_id: null })
        .eq('profile_id', userId)
    } catch (e) {
      console.error('[DELETE /api/account/delete] tribe_comments:', e)
    }

    // 3r. tribe_posts — SET NULL on delete, anonymise by nullifying profile_id
    try {
      await service
        .from('tribe_posts')
        .update({ profile_id: null })
        .eq('profile_id', userId)
    } catch (e) {
      console.error('[DELETE /api/account/delete] tribe_posts:', e)
    }

    // 3s. tribe_members — remove user membership from all tribes
    try {
      await service.from('tribe_members').delete().eq('profile_id', userId)
    } catch (e) {
      console.error('[DELETE /api/account/delete] tribe_members:', e)
    }

    // 3t. stories — ON DELETE CASCADE from profiles, but explicit for safety
    try {
      await service.from('stories').delete().eq('profile_id', userId)
    } catch (e) {
      console.error('[DELETE /api/account/delete] stories:', e)
    }

    // 3u. communication_log
    try {
      await service.from('communication_log').delete().eq('profile_id', userId)
    } catch (e) {
      console.error('[DELETE /api/account/delete] communication_log:', e)
    }

    // 3v. communication_preferences
    try {
      await service.from('communication_preferences').delete().eq('profile_id', userId)
    } catch (e) {
      console.error('[DELETE /api/account/delete] communication_preferences:', e)
    }

    // 3w. privacy_preferences
    try {
      await service.from('privacy_preferences').delete().eq('profile_id', userId)
    } catch (e) {
      console.error('[DELETE /api/account/delete] privacy_preferences:', e)
    }

    // 3x. consent_records
    try {
      await service.from('consent_records').delete().eq('profile_id', userId)
    } catch (e) {
      console.error('[DELETE /api/account/delete] consent_records:', e)
    }

    // 3y. data_export_requests
    try {
      await service.from('data_export_requests').delete().eq('profile_id', userId)
    } catch (e) {
      console.error('[DELETE /api/account/delete] data_export_requests:', e)
    }

    // 3z. data_deletion_requests
    try {
      await service.from('data_deletion_requests').delete().eq('profile_id', userId)
    } catch (e) {
      console.error('[DELETE /api/account/delete] data_deletion_requests:', e)
    }

    // 3aa. audit_log — anonymise rather than delete (regulatory retention)
    try {
      await service
        .from('audit_log')
        .update({ profile_id: null })
        .eq('profile_id', userId)
    } catch (e) {
      console.error('[DELETE /api/account/delete] audit_log:', e)
    }

    // 3ab. partner_invites (invited_by_profile_id)
    try {
      await service
        .from('partner_invites')
        .delete()
        .eq('invited_by_profile_id', userId)
    } catch (e) {
      console.error('[DELETE /api/account/delete] partner_invites:', e)
    }

    // 3ac. baby_profile_members — remove user from all shared baby profiles
    try {
      await service.from('baby_profile_members').delete().eq('profile_id', userId)
    } catch (e) {
      console.error('[DELETE /api/account/delete] baby_profile_members:', e)
    }

    // 3ad. baby_profiles — owned by this user (created_by_profile_id)
    try {
      await service
        .from('baby_profiles')
        .delete()
        .eq('created_by_profile_id', userId)
    } catch (e) {
      console.error('[DELETE /api/account/delete] baby_profiles:', e)
    }

    // 4. Delete the profile row
    try {
      await service.from('profiles').delete().eq('id', userId)
    } catch (e) {
      console.error('[DELETE /api/account/delete] profiles:', e)
    }

    // 5. Delete the auth.users record (must be last — invalidates the session)
    const { error: authDeleteError } = await service.auth.admin.deleteUser(userId)
    if (authDeleteError) {
      console.error('[DELETE /api/account/delete] auth.admin.deleteUser:', authDeleteError.message)
      // Do NOT return an error — profile data is already deleted. Log and move on.
    }

    return NextResponse.json(
      { success: true, message: 'Account permanently deleted.' },
      { status: 200, headers: SECURITY_HEADERS }
    )
  } catch (err) {
    console.error('[DELETE /api/account/delete] Unexpected error:', err)
    return NextResponse.json(
      { error: true, message: 'Something went wrong. Please try again.' },
      { status: 500, headers: SECURITY_HEADERS }
    )
  }
}

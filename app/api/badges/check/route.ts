/**
 * @module BadgesCheckAPI
 * @description POST /api/badges/check — Checks all badge criteria for the
 *   authenticated user and awards any earned but not-yet-awarded badges.
 *   Called after key user actions (checkin, article read, quiz, tribe post, etc.)
 *   Returns { awarded: string[] } with newly awarded badge IDs.
 * @version 1.0.0
 * @since March 2026
 */

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { SECURITY_HEADERS } from '@/lib/utils'
import { BADGES } from '@/lib/badges'

/** Safe count helper — returns 0 if the table doesn't exist or query fails */
async function safeCount(
  client: Awaited<ReturnType<typeof createClient>>,
  table: string,
  column: string,
  value: string
): Promise<number> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count } = await (client as any)
      .from(table)
      .select('*', { count: 'exact', head: true })
      .eq(column, value)
    return count ?? 0
  } catch {
    return 0
  }
}

export async function POST() {
  try {
    const supabase = await createClient()
    const serviceClient = await createServiceClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: SECURITY_HEADERS }
      )
    }

    const profileId = user.id

    // 1. Get current earned badges
    const { data: earnedRows } = await supabase
      .from('earned_badges')
      .select('badge_id')
      .eq('profile_id', profileId)

    const earnedSet = new Set((earnedRows ?? []).map((r: { badge_id: string }) => r.badge_id))

    // If all badges are already earned, skip everything
    const unearnedBadges = BADGES.filter((b) => !earnedSet.has(b.id))
    if (unearnedBadges.length === 0) {
      return NextResponse.json({ awarded: [] }, { headers: SECURITY_HEADERS })
    }

    // 2. Query all activity counts in parallel
    const [
      profileResult,
      checkinCountResult,
      quizCountResult,
      articleReadCountResult,
      tribePostCountResult,
      _tribeCommentCountResult,
      tribeMembershipCountResult,
      milestoneCountResult,
      firstShareResult,
      nightOwlResult,
      concernCountResult,
      journalCountResult,
    ] = await Promise.all([
      // Profile data (streak, partner invite, created_at)
      (async () => {
        try {
          const { data } = await supabase
            .from('profiles')
            .select('first_name, current_streak, partner_invite_email, created_at')
            .eq('id', profileId)
            .single()
          return data
        } catch {
          return null
        }
      })(),

      // Daily checkins count
      safeCount(supabase, 'daily_checkins', 'profile_id', profileId),

      // Quiz attempts count
      safeCount(supabase, 'quiz_attempts', 'profile_id', profileId),

      // Article reads (seed_transactions with reason='read_article')
      (async () => {
        try {
          const { count } = await supabase
            .from('seed_transactions')
            .select('*', { count: 'exact', head: true })
            .eq('profile_id', profileId)
            .eq('reason', 'read_article')
          return count ?? 0
        } catch { return 0 }
      })(),

      // Tribe posts count
      safeCount(supabase, 'tribe_posts', 'profile_id', profileId),

      // Tribe comments count
      safeCount(supabase, 'tribe_comments', 'profile_id', profileId),

      // Tribe memberships count
      (async () => {
        try {
          const { count } = await supabase
            .from('tribe_members')
            .select('*', { count: 'exact', head: true })
            .eq('profile_id', profileId)
          return count ?? 0
        } catch { return 0 }
      })(),

      // Baby milestones count
      (async () => {
        try {
          const { data: memberData } = await supabase
            .from('baby_profile_members')
            .select('baby_id')
            .eq('profile_id', profileId)
            .limit(1)
            .maybeSingle()
          if (!memberData?.baby_id) return 0
          const { count } = await supabase
            .from('baby_milestones')
            .select('*', { count: 'exact', head: true })
            .eq('baby_id', memberData.baby_id)
          return count ?? 0
        } catch { return 0 }
      })(),

      // First share check
      (async () => {
        try {
          const { count } = await supabase
            .from('seed_transactions')
            .select('id', { count: 'exact', head: true })
            .eq('profile_id', profileId)
            .eq('reason', 'first_share')
          return (count ?? 0) > 0
        } catch { return false }
      })(),

      // Night owl check — any checkin created between midnight and 4am
      (async () => {
        try {
          const { data } = await supabase
            .from('daily_checkins')
            .select('created_at')
            .eq('profile_id', profileId)
            .order('created_at', { ascending: false })
            .limit(50)
          if (!data || data.length === 0) return false
          return data.some((row: { created_at: string }) => {
            const hour = new Date(row.created_at).getHours()
            return hour >= 0 && hour < 4
          })
        } catch { return false }
      })(),

      // Concern sessions count (table may not exist)
      safeCount(supabase, 'concern_sessions', 'profile_id', profileId),

      // Journal entries count (table may not exist)
      safeCount(supabase, 'journal_entries', 'profile_id', profileId),
    ])

    const currentStreak = profileResult?.current_streak ?? 0
    const hasPartnerInvite = !!profileResult?.partner_invite_email
    const profileCreatedAt = profileResult?.created_at
      ? new Date(profileResult.created_at)
      : null

    // Profile completeness check
    const hasFirstName = !!profileResult?.first_name

    // Get baby info for profile_complete badge
    let babyHasName = false
    let babyHasDueDate = false
    try {
      const { data: memberData } = await supabase
        .from('baby_profile_members')
        .select('baby_id')
        .eq('profile_id', profileId)
        .limit(1)
        .maybeSingle()

      if (memberData?.baby_id) {
        const { data: babyData } = await supabase
          .from('baby_profiles')
          .select('name, due_date, date_of_birth')
          .eq('id', memberData.baby_id)
          .single()

        if (babyData) {
          babyHasName = !!babyData.name
          babyHasDueDate = !!(babyData.due_date || babyData.date_of_birth)
        }
      }
    } catch {
      // Non-fatal
    }

    // Early adopter: signed up in March 2026 (launch month)
    const isEarlyAdopter = profileCreatedAt
      ? profileCreatedAt.getFullYear() === 2026 && profileCreatedAt.getMonth() === 2 // March = 2
      : false

    // 3. Check criteria for each unearned badge
    const criteriaMap: Record<string, boolean> = {
      first_checkin: checkinCountResult >= 1,
      week_warrior: currentStreak >= 7,
      month_champion: currentStreak >= 30,
      first_chat: checkinCountResult >= 1,
      chats_10: checkinCountResult >= 10,
      first_post: tribePostCountResult >= 1,
      conversation_starter: tribePostCountResult >= 5,
      tribe_leader: tribeMembershipCountResult >= 3,
      partner_invited: hasPartnerInvite,
      first_share: firstShareResult as boolean,
      knowledge_seeker: (articleReadCountResult as number) >= 5,
      quiz_master: quizCountResult >= 5,
      first_article: (articleReadCountResult as number) >= 1,
      milestone_tracker: (milestoneCountResult as number) >= 1,
      concern_logger: concernCountResult >= 1,
      memory_keeper: (milestoneCountResult as number) >= 5,
      first_journal: journalCountResult >= 1,
      streak_3: currentStreak >= 3,
      streak_7: currentStreak >= 7,
      streak_30: currentStreak >= 30,
      profile_complete:
        hasFirstName && babyHasName && babyHasDueDate && checkinCountResult >= 1,
      night_owl: nightOwlResult as boolean,
      early_adopter: isEarlyAdopter,
    }

    // 4. Award eligible badges
    const newlyAwarded: string[] = []

    for (const badge of unearnedBadges) {
      if (criteriaMap[badge.id]) {
        try {
          const { error: insertError } = await serviceClient
            .from('earned_badges')
            .insert({
              profile_id: profileId,
              badge_id: badge.id,
            })

          if (!insertError) {
            newlyAwarded.push(badge.id)
          } else if (insertError.code !== '23505') {
            // Log non-duplicate errors
            console.error(`[badges/check] Failed to award ${badge.id}:`, insertError.message)
          }
        } catch (err) {
          console.error(`[badges/check] Error awarding ${badge.id}:`, err)
        }
      }
    }

    return NextResponse.json({ awarded: newlyAwarded }, { headers: SECURITY_HEADERS })
  } catch (err) {
    console.error('[badges/check] Error:', err)
    return NextResponse.json(
      { error: 'Failed to check badges' },
      { status: 500, headers: SECURITY_HEADERS }
    )
  }
}

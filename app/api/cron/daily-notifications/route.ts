/**
 * @module /api/cron/daily-notifications
 * @description Cron endpoint: generates 1-2 personalized in-app notifications
 *   per active user per day. Notifications are based on baby stage, content
 *   recommendations, tribe activity, and check-in reminders.
 *
 * Called by Vercel Cron at 10:23 UTC daily — secured via CRON_SECRET header.
 * Uses the service role Supabase client (bypasses RLS).
 * @version 1.0.0
 * @since March 2026
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/* ── Types ──────────────────────────────────────────────────────────────── */

type Stage = 'planning' | 'pregnancy' | 'infant' | 'toddler' | 'postpartum'

interface NotificationRow {
  profile_id: string
  baby_id: string | null
  type: string
  title: string
  body: string
  emoji: string
  action_url: string | null
  priority: 1 | 2 | 3
  source_type: string
  expires_at: string
}

/* ── Notification content pools by stage ────────────────────────────────── */

interface StagedNotification {
  type: string
  title: string
  body: string
  emoji: string
  action_url: string
  priority: 1 | 2 | 3
}

const STAGE_NOTIFICATIONS: Record<Stage, StagedNotification[]> = {
  planning: [
    {
      type: 'milestone_approaching',
      title: 'Your journey starts here',
      body: 'Track your planning journey with a quick daily check-in. Every entry helps Lumira support you better.',
      emoji: '🌱',
      action_url: '/checkin',
      priority: 2,
    },
    {
      type: 'new_article',
      title: 'Reading for your stage',
      body: 'Discover articles on preconception health, fertility, and preparing your body for pregnancy.',
      emoji: '📖',
      action_url: '/content',
      priority: 3,
    },
    {
      type: 'milestone_approaching',
      title: 'Folic acid reminder',
      body: 'Starting folic acid at least 1 month before conception significantly reduces neural tube defect risk.',
      emoji: '💊',
      action_url: '/checkin',
      priority: 2,
    },
    {
      type: 'system_message',
      title: 'Connect with others planning',
      body: 'You\'re not alone. Hundreds of parents in Lumira tribes are on the same path. See what they\'re sharing.',
      emoji: '🤝',
      action_url: '/tribes',
      priority: 3,
    },
  ],
  pregnancy: [
    {
      type: 'milestone_approaching',
      title: 'Your pregnancy milestone',
      body: 'Each week brings new developments. Log how you\'re feeling today so Lumira can track your journey.',
      emoji: '🤰',
      action_url: '/checkin',
      priority: 2,
    },
    {
      type: 'new_article',
      title: 'This week\'s pregnancy guide',
      body: 'Discover what\'s happening with your baby\'s development this week and tips for managing symptoms.',
      emoji: '📋',
      action_url: '/content',
      priority: 3,
    },
    {
      type: 'milestone_approaching',
      title: 'Hydration check',
      body: 'Staying hydrated during pregnancy reduces fatigue and supports your baby\'s development. How much have you had today?',
      emoji: '💧',
      action_url: '/checkin',
      priority: 3,
    },
    {
      type: 'system_message',
      title: 'Parents in your trimester are sharing',
      body: 'See what other parents at your stage are discussing in the Lumira community right now.',
      emoji: '💬',
      action_url: '/tribes',
      priority: 3,
    },
    {
      type: 'weekly_guide_ready',
      title: 'Movement and comfort tips',
      body: 'Gentle prenatal yoga and walking can ease back pain and improve sleep. Even 10 minutes makes a difference.',
      emoji: '🧘',
      action_url: '/content',
      priority: 3,
    },
  ],
  infant: [
    {
      type: 'milestone_approaching',
      title: 'Track today\'s milestones',
      body: 'Log sleep, feeding, and mood to help Lumira spot patterns and give you personalised insights.',
      emoji: '👶',
      action_url: '/checkin',
      priority: 2,
    },
    {
      type: 'new_article',
      title: 'Development tip for this stage',
      body: 'Tummy time, skin-to-skin, and talking to your baby are the most powerful tools you have right now.',
      emoji: '🌟',
      action_url: '/content',
      priority: 3,
    },
    {
      type: 'milestone_approaching',
      title: 'Sleep patterns this week',
      body: 'Newborns sleep 14-17 hours but rarely in long stretches. Tracking can reveal your baby\'s natural rhythm.',
      emoji: '🌙',
      action_url: '/checkin',
      priority: 2,
    },
    {
      type: 'system_message',
      title: 'Other parents are in the thick of it too',
      body: 'Join the infant care tribe — a safe space to share wins, struggles, and questions at 3am.',
      emoji: '🫂',
      action_url: '/tribes',
      priority: 3,
    },
    {
      type: 'weekly_guide_ready',
      title: 'Feeding reminder',
      body: 'Consistency matters more than perfection. Whatever feeding method works for your family is the right one.',
      emoji: '🍼',
      action_url: '/content',
      priority: 3,
    },
  ],
  toddler: [
    {
      type: 'milestone_approaching',
      title: 'Check in on your toddler\'s day',
      body: 'Log behaviour, sleep, and development today. Early patterns help you stay ahead of each growth leap.',
      emoji: '🧒',
      action_url: '/checkin',
      priority: 2,
    },
    {
      type: 'new_article',
      title: 'Toddler development this month',
      body: 'Language, motor skills, and emotional regulation are all in overdrive right now. Here\'s what to expect.',
      emoji: '🔤',
      action_url: '/content',
      priority: 3,
    },
    {
      type: 'system_message',
      title: 'Toddler parents are talking',
      body: 'From tantrums to sleep regressions — the toddler tribe gets it. See what\'s being shared today.',
      emoji: '💛',
      action_url: '/tribes',
      priority: 3,
    },
    {
      type: 'weekly_guide_ready',
      title: 'Play-based learning tip',
      body: 'Simple activities like stacking, pouring, and pretend play support cognitive development at this stage.',
      emoji: '🧱',
      action_url: '/content',
      priority: 3,
    },
  ],
  postpartum: [
    {
      type: 'milestone_approaching',
      title: 'How are you feeling today?',
      body: 'Postpartum recovery is a journey, not an event. Log your mood and energy — you deserve to be seen too.',
      emoji: '💜',
      action_url: '/checkin',
      priority: 1,
    },
    {
      type: 'new_article',
      title: 'Postpartum care for you',
      body: 'Your recovery matters as much as your baby\'s milestones. Find articles on mental health, healing, and rest.',
      emoji: '🌸',
      action_url: '/content',
      priority: 2,
    },
    {
      type: 'system_message',
      title: 'You\'re not alone in this',
      body: '1 in 5 new parents experience postpartum depression or anxiety. The postpartum tribe is here for honest conversation.',
      emoji: '🤍',
      action_url: '/tribes',
      priority: 2,
    },
    {
      type: 'weekly_guide_ready',
      title: 'Rest when you can',
      body: 'Sleep deprivation is real. Even 20-minute naps when your baby sleeps can help restore cognitive function.',
      emoji: '😴',
      action_url: '/content',
      priority: 3,
    },
  ],
}

const CHECKIN_REMINDER: StagedNotification = {
  type: 'streak_at_risk',
  title: 'Check in before the day ends',
  body: 'You haven\'t logged a check-in today yet. Keep your streak alive and help Lumira personalise your experience.',
  emoji: '⏰',
  action_url: '/checkin',
  priority: 1,
}

/* ── Helper: pick notifications for a user ───────────────────────────────── */

function pickNotifications(
  stage: Stage,
  hasCheckedInToday: boolean,
  dayOfYear: number,
  profileIndex: number,
): StagedNotification[] {
  const pool = STAGE_NOTIFICATIONS[stage] ?? STAGE_NOTIFICATIONS.infant
  const results: StagedNotification[] = []

  // Always include check-in reminder if they haven't checked in today (priority 1)
  if (!hasCheckedInToday) {
    results.push(CHECKIN_REMINDER)
  }

  // Pick 1-2 content/tip notifications from the stage pool (deterministic rotation)
  const seed = dayOfYear * 31 + profileIndex
  const first = pool[seed % pool.length]
  results.push(first)

  // Add a second notification on most days (not if already 2)
  if (results.length < 2 && pool.length > 1) {
    const second = pool[(seed + 2) % pool.length]
    if (second.action_url !== first.action_url) {
      results.push(second)
    }
  }

  // Cap at 2
  return results.slice(0, 2)
}

/* ── Handler ────────────────────────────────────────────────────────────── */

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000,
  )

  // Notifications expire in 48 hours
  const expiresAt = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString()

  // 1. Fetch all active profiles that have a baby profile
  const { data: members, error: membersErr } = await supabase
    .from('baby_profile_members')
    .select('profile_id, baby_id')

  if (membersErr || !members?.length) {
    console.log('[daily-notifications] No members found:', membersErr?.message)
    return NextResponse.json({ ok: true, inserted: 0, reason: 'no members' })
  }

  // Deduplicate — one entry per profile_id (use first baby if multiple)
  const profileBabyMap = new Map<string, string>()
  for (const m of members) {
    if (!profileBabyMap.has(m.profile_id)) {
      profileBabyMap.set(m.profile_id, m.baby_id)
    }
  }

  const profileIds = Array.from(profileBabyMap.keys())

  // 2. Fetch baby stages for all relevant babies
  const babyIds = Array.from(new Set(profileBabyMap.values()))
  const { data: babies } = await supabase
    .from('baby_profiles')
    .select('id, stage')
    .in('id', babyIds)

  const babyStageMap = new Map<string, Stage>()
  for (const b of babies ?? []) {
    babyStageMap.set(b.id, b.stage as Stage)
  }

  // 3. Check which profiles have already checked in today
  const { data: todayCheckins } = await supabase
    .from('daily_checkins')
    .select('profile_id')
    .eq('checkin_date', today)
    .in('profile_id', profileIds)

  const checkedInToday = new Set((todayCheckins ?? []).map((c: { profile_id: string }) => c.profile_id))

  // 4. Check which profiles already received a daily-notification today
  //    (avoid duplicates if cron runs more than once)
  const { data: existingToday } = await supabase
    .from('notifications')
    .select('profile_id')
    .eq('source_type', 'daily_cron')
    .gte('created_at', `${today}T00:00:00.000Z`)
    .in('profile_id', profileIds)

  const alreadyNotified = new Set((existingToday ?? []).map((n: { profile_id: string }) => n.profile_id))

  // 5. Build notification rows for each eligible profile
  const rows: NotificationRow[] = []
  let profileIndex = 0

  for (const profileId of profileIds) {
    if (alreadyNotified.has(profileId)) {
      profileIndex++
      continue
    }

    const babyId = profileBabyMap.get(profileId) ?? null
    const stage: Stage = babyId ? (babyStageMap.get(babyId) ?? 'infant') : 'infant'
    const hasCheckedIn = checkedInToday.has(profileId)

    const picked = pickNotifications(stage, hasCheckedIn, dayOfYear, profileIndex)

    for (const notif of picked) {
      rows.push({
        profile_id: profileId,
        baby_id: babyId,
        type: notif.type,
        title: notif.title,
        body: notif.body,
        emoji: notif.emoji,
        action_url: notif.action_url,
        priority: notif.priority,
        source_type: 'daily_cron',
        expires_at: expiresAt,
      })
    }

    profileIndex++
  }

  if (rows.length === 0) {
    console.log('[daily-notifications] No notifications to insert (all profiles already notified or no eligible users)')
    return NextResponse.json({ ok: true, inserted: 0 })
  }

  // 6. Batch insert notifications (chunk into groups of 500 to avoid payload limits)
  const CHUNK = 500
  let totalInserted = 0
  let errors = 0

  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK)
    const { error: insertErr } = await supabase.from('notifications').insert(chunk)
    if (insertErr) {
      console.error(`[daily-notifications] Insert error (chunk ${i / CHUNK}):`, insertErr.message)
      errors++
    } else {
      totalInserted += chunk.length
    }
  }

  console.log(`[daily-notifications] Complete: ${totalInserted} notifications inserted, ${errors} chunk errors, ${profileIds.length} profiles processed`)
  return NextResponse.json({
    ok: true,
    inserted: totalInserted,
    profiles_processed: profileIds.length,
    errors,
  })
}

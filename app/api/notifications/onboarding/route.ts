/**
 * @module OnboardingNotifications
 * @description POST /api/notifications/onboarding — Creates 3-4 welcome
 *   notifications based on the baby's age/stage after onboarding completes.
 *   Uses the service role client to bypass RLS (no INSERT policy for
 *   authenticated users on the notifications table).
 *   Requires an authenticated user session; the profile_id from the session
 *   is used (not from the request body) to prevent spoofing.
 * @version 1.0.0
 * @since March 2026
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { SECURITY_HEADERS } from '@/lib/utils'
import { verifyBabyOwnership } from '@/lib/validation'

/** Milliseconds in one day. */
const MS_PER_DAY = 86_400_000

/** Average gestation in days (40 weeks). */
const GESTATION_DAYS = 280

interface WelcomeNotification {
  profile_id: string
  baby_id: string
  type: string
  title: string
  body: string
  emoji: string
  action_url: string | null
  is_read: boolean
  is_dismissed: boolean
  priority: number
  expires_at: string
}

/**
 * Computes the pregnancy week from a due date string.
 * Returns a value clamped between 1 and 45.
 */
function getPregnancyWeek(dueDate: string): number {
  const due = new Date(dueDate)
  const today = new Date()
  const daysUntilDue = Math.ceil((due.getTime() - today.getTime()) / MS_PER_DAY)
  const daysPregnant = GESTATION_DAYS - daysUntilDue
  return Math.min(45, Math.max(1, Math.floor(daysPregnant / 7)))
}

/**
 * Computes the baby's age in weeks from a date of birth string.
 */
function getAgeInWeeks(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth)
  const today = new Date()
  const ageInDays = Math.floor((today.getTime() - dob.getTime()) / MS_PER_DAY)
  return Math.max(0, Math.floor(ageInDays / 7))
}

/**
 * Builds the set of welcome notifications based on the baby's stage and age.
 */
function buildWelcomeNotifications(
  profileId: string,
  babyId: string,
  mode: 'pregnancy' | 'born',
  dueDate: string | null,
  dateOfBirth: string | null,
): WelcomeNotification[] {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 14)
  const expires = expiresAt.toISOString()

  const base = {
    profile_id: profileId,
    baby_id: babyId,
    type: 'system_message' as const,
    is_read: false,
    is_dismissed: false,
    priority: 2,
    expires_at: expires,
  }

  if (mode === 'pregnancy' && dueDate) {
    const week = getPregnancyWeek(dueDate)
    return [
      {
        ...base,
        title: `Welcome! You're in week ${week}`,
        body: "Here's what to expect this week — tap to read your weekly guide.",
        emoji: '🤰',
        action_url: '/home',
      },
      {
        ...base,
        title: 'Set up your first daily check-in',
        body: 'It takes 60 seconds and helps Lumira learn how to support you.',
        emoji: '📝',
        action_url: '/home',
      },
      {
        ...base,
        title: 'Did you know?',
        body: 'Lumira can track patterns in your wellbeing over time. Start logging to unlock insights.',
        emoji: '💡',
        action_url: null,
      },
    ]
  }

  // Born mode — differentiate by age
  if (mode === 'born' && dateOfBirth) {
    const ageWeeks = getAgeInWeeks(dateOfBirth)

    // Newborn (0-4 weeks)
    if (ageWeeks <= 4) {
      return [
        {
          ...base,
          title: 'Welcome! Track your newborn\'s first weeks',
          body: 'Daily check-ins help Lumira spot patterns and support you.',
          emoji: '👶',
          action_url: '/home',
        },
        {
          ...base,
          title: 'Tip: Log feeding and sleep',
          body: 'Even rough estimates help Lumira detect patterns early on.',
          emoji: '📊',
          action_url: '/home',
        },
        {
          ...base,
          title: 'Your first weekly guide is ready',
          body: 'Tap to read what to expect in these early days.',
          emoji: '🌱',
          action_url: '/home',
        },
      ]
    }

    // Infant (5-26 weeks / ~1-6 months)
    if (ageWeeks <= 26) {
      return [
        {
          ...base,
          title: "Welcome! Lumira is here for your baby's first year",
          body: 'Personalised guidance, pattern detection, and weekly updates.',
          emoji: '🌟',
          action_url: '/home',
        },
        {
          ...base,
          title: 'Start your daily check-in routine',
          body: 'It takes 60 seconds and gets smarter over time.',
          emoji: '📝',
          action_url: '/home',
        },
        {
          ...base,
          title: "Ask Lumira anything",
          body: "Have a question about your baby's development? Lumira is ready to help.",
          emoji: '💬',
          action_url: '/home',
        },
      ]
    }

    // Infant (27-52 weeks / ~6-12 months)
    return [
      {
        ...base,
        title: 'Welcome! Exciting months ahead',
        body: 'Lumira will help you navigate milestones, sleep changes, and more.',
        emoji: '🎉',
        action_url: '/home',
      },
      {
        ...base,
        title: 'Track milestones with Lumira',
        body: "We'll celebrate the big moments and help you know what's coming next.",
        emoji: '🏆',
        action_url: '/home',
      },
      {
        ...base,
        title: 'Set up pattern detection',
        body: 'Log sleep and feeding to unlock personalised insights.',
        emoji: '📊',
        action_url: '/home',
      },
    ]
  }

  // Fallback — should not normally reach here
  return [
    {
      ...base,
      title: 'Welcome to Lumira!',
      body: 'Start your first daily check-in to get personalised support.',
      emoji: '👋',
      action_url: '/home',
    },
  ]
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user via session (anon client respects RLS / reads session)
    const anonClient = await createClient()
    const {
      data: { user },
    } = await anonClient.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: SECURITY_HEADERS },
      )
    }

    const body = await request.json()
    const { baby_id, mode, due_date, date_of_birth } = body as {
      baby_id: string
      mode: 'pregnancy' | 'born'
      due_date: string | null
      date_of_birth: string | null
    }

    // Validate required fields
    if (!baby_id || typeof baby_id !== 'string') {
      return NextResponse.json(
        { error: 'baby_id is required' },
        { status: 400, headers: SECURITY_HEADERS },
      )
    }
    if (mode !== 'pregnancy' && mode !== 'born') {
      return NextResponse.json(
        { error: 'mode must be "pregnancy" or "born"' },
        { status: 400, headers: SECURITY_HEADERS },
      )
    }

    // SECURITY: Verify user owns this baby profile (prevents IDOR)
    const isOwner = await verifyBabyOwnership(anonClient, user.id, baby_id)
    if (!isOwner) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403, headers: SECURITY_HEADERS },
      )
    }

    const notifications = buildWelcomeNotifications(
      user.id,
      baby_id,
      mode,
      due_date ?? null,
      date_of_birth ?? null,
    )

    // Use service role client to bypass RLS (no INSERT policy for auth users)
    const serviceClient = await createServiceClient()

    const { error: insertError } = await serviceClient
      .from('notifications')
      .insert(notifications)

    if (insertError) {
      console.error('[POST /api/notifications/onboarding] Insert error:', insertError.message)
      return NextResponse.json(
        { error: 'Failed to create welcome notifications' },
        { status: 500, headers: SECURITY_HEADERS },
      )
    }

    return NextResponse.json(
      { success: true, count: notifications.length },
      { headers: SECURITY_HEADERS },
    )
  } catch (err) {
    console.error('[POST /api/notifications/onboarding] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: SECURITY_HEADERS },
    )
  }
}

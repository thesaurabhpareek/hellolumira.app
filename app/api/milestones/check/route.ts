/**
 * @module MilestonesCheckAPI
 * @description GET /api/milestones/check — Checks what milestones are due
 *   based on baby's age, returns upcoming and newly unlocked milestones.
 *   Includes monthly birthday detection, trimester celebrations, countdown
 *   to next milestone, and notification creation for reached milestones.
 * @version 2.0.0
 * @since March 2026
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getBabyAgeInfo } from '@/lib/baby-age'
import { createNotification } from '@/lib/notifications'
import { SECURITY_HEADERS } from '@/lib/utils'
import type { BabyProfile } from '@/types/app'

/** Milliseconds in one day */
const MS_PER_DAY = 86_400_000

// ── Milestone definitions ───────────────────────────────────────────────────

type MilestoneDef = {
  key: string
  type: string
  title: string
  emoji: string
  description: string
  /** For pregnancy: week number. For infant/toddler: week or month number */
  trigger_value: number
  /** 'pregnancy_week' | 'age_weeks' | 'age_months' */
  trigger_unit: 'pregnancy_week' | 'age_weeks' | 'age_months'
  stage: 'pregnancy' | 'infant' | 'toddler'
  /** If true, this is a major milestone with a bigger celebration */
  is_major?: boolean
}

// ── Personal monthly birthday messages ──────────────────────────────────────

function getMonthlyBirthdayMessage(month: number, babyName: string): { title: string; description: string; emoji: string; is_major: boolean } {
  const name = babyName || 'Baby'
  const messages: Record<number, { title: string; description: string; emoji: string; is_major: boolean }> = {
    1: { title: `Happy 1 month, ${name}!`, emoji: '🎉', description: `One whole month! ${name} has changed so much already. Look how far you have both come.`, is_major: false },
    2: { title: `${name} is 2 months old!`, emoji: '🌈', description: `Two months of wonder. Those social smiles are starting to appear — what a reward for all those sleepless nights.`, is_major: false },
    3: { title: `3 months! The fourth trimester is done!`, emoji: '🦋', description: `${name} has completed the fourth trimester. Things often start to feel a little easier from here. You are doing amazing.`, is_major: false },
    4: { title: `${name} is 4 months old!`, emoji: '🌻', description: `Four months of discovery. ${name} is becoming so interactive — reaching, cooing, and engaging with the world.`, is_major: false },
    5: { title: `5 months already!`, emoji: '🎵', description: `${name} is reaching, grabbing, and exploring everything in sight. The curiosity is just beginning!`, is_major: false },
    6: { title: `6 months! Half a year of love!`, emoji: '🎂', description: `Happy half birthday, ${name}! Six months of growth, love, and discovery. You have built something beautiful together.`, is_major: true },
    7: { title: `${name} is 7 months old!`, emoji: '🌟', description: `Seven months in and ${name} is becoming their own little person. Every day brings new surprises.`, is_major: false },
    8: { title: `8 months!`, emoji: '🐣', description: `${name} is on the move — crawling, babbling, and getting into everything. What an adventure!`, is_major: false },
    9: { title: `9 months — inside and out!`, emoji: '🚀', description: `${name} has now been outside as long as they were inside. What a journey from then to now!`, is_major: false },
    10: { title: `${name} is 10 months old!`, emoji: '🌻', description: `Ten months of watching ${name} grow. They are cruising, communicating, and full of personality.`, is_major: false },
    11: { title: `11 months!`, emoji: '🎈', description: `Almost one year! ${name}'s first birthday is just around the corner. Start planning the celebration!`, is_major: false },
    12: { title: `Happy first birthday, ${name}!`, emoji: '🎂', description: `One whole year! What an incredible journey from tiny newborn to this amazing little person. Celebrate everything you have achieved together.`, is_major: true },
    18: { title: `${name} is 18 months!`, emoji: '🌟', description: `A year and a half of wonder! ${name} is learning new words, taking new steps, and discovering more every single day.`, is_major: false },
    24: { title: `Happy 2nd birthday, ${name}!`, emoji: '🎉', description: `Two whole years! ${name} has grown from a tiny baby into an incredible little person with their own thoughts, feelings, and a whole lot of personality.`, is_major: true },
  }
  return messages[month] ?? {
    title: `${name} is ${month} months old!`,
    emoji: '🌟',
    description: `${month} months of love and growth. Every day with ${name} is a new adventure.`,
    is_major: false,
  }
}

// ── Personal trimester celebration messages ──────────────────────────────────

function getTrimesterCelebrationMessage(key: string): { title: string; description: string; emoji: string } {
  const messages: Record<string, { title: string; description: string; emoji: string }> = {
    trimester_1_complete: {
      title: 'First Trimester Complete!',
      emoji: '🎉',
      description: 'You made it through the first trimester! The hardest part is often behind you. The risk of complications drops significantly from here.',
    },
    trimester_2_complete: {
      title: 'Second Trimester Complete!',
      emoji: '🎊',
      description: 'Two-thirds of the way there! Your baby can now hear your voice. Talk, sing, read — they are listening.',
    },
    full_term: {
      title: 'Full Term!',
      emoji: '🎯',
      description: 'Full term! Your baby could arrive any day now — and they are ready. You have done an incredible job getting here.',
    },
  }
  return messages[key] ?? { title: 'Milestone!', emoji: '🎉', description: 'A milestone has been reached!' }
}

const MILESTONE_DEFS: MilestoneDef[] = [
  // Pregnancy milestones
  { key: 'pregnancy_month_1', type: 'pregnancy_month', title: 'First Month Complete', emoji: '🌱', description: 'You have completed your first month of pregnancy!', trigger_value: 4, trigger_unit: 'pregnancy_week', stage: 'pregnancy' },
  { key: 'pregnancy_month_2', type: 'pregnancy_month', title: 'Two Months', emoji: '🌿', description: 'Two months in — your baby is growing rapidly!', trigger_value: 8, trigger_unit: 'pregnancy_week', stage: 'pregnancy' },
  { key: 'pregnancy_month_3', type: 'pregnancy_month', title: 'Three Months', emoji: '🍀', description: 'Three months complete — the first trimester is nearly done!', trigger_value: 12, trigger_unit: 'pregnancy_week', stage: 'pregnancy' },
  { key: 'trimester_1_complete', type: 'trimester', title: 'First Trimester Complete!', emoji: '🎉', description: 'You made it through the first trimester! The hardest part is often behind you.', trigger_value: 13, trigger_unit: 'pregnancy_week', stage: 'pregnancy', is_major: true },
  { key: 'pregnancy_month_4', type: 'pregnancy_month', title: 'Four Months', emoji: '🌸', description: 'Four months — you may start feeling those first flutters soon!', trigger_value: 16, trigger_unit: 'pregnancy_week', stage: 'pregnancy' },
  { key: 'pregnancy_month_5', type: 'pregnancy_month', title: 'Five Months — Halfway!', emoji: '⭐', description: 'Halfway there! What an incredible journey so far.', trigger_value: 20, trigger_unit: 'pregnancy_week', stage: 'pregnancy', is_major: true },
  { key: 'pregnancy_month_6', type: 'pregnancy_month', title: 'Six Months', emoji: '🌻', description: 'Six months — your baby can now hear your voice and respond to sound!', trigger_value: 24, trigger_unit: 'pregnancy_week', stage: 'pregnancy' },
  { key: 'viability', type: 'viability', title: 'Viability Milestone', emoji: '💪', description: 'Week 24 — your baby has reached the threshold of viability. A significant medical milestone.', trigger_value: 24, trigger_unit: 'pregnancy_week', stage: 'pregnancy', is_major: true },
  { key: 'trimester_2_complete', type: 'trimester', title: 'Second Trimester Complete!', emoji: '🎊', description: 'Two-thirds of the way there! Your baby can now hear your voice.', trigger_value: 27, trigger_unit: 'pregnancy_week', stage: 'pregnancy', is_major: true },
  { key: 'pregnancy_month_7', type: 'pregnancy_month', title: 'Seven Months', emoji: '🌙', description: 'Seven months — your baby is practising breathing and gaining weight rapidly!', trigger_value: 28, trigger_unit: 'pregnancy_week', stage: 'pregnancy' },
  { key: 'pregnancy_month_8', type: 'pregnancy_month', title: 'Eight Months', emoji: '🎈', description: 'Eight months! Your baby is almost fully developed and getting ready.', trigger_value: 32, trigger_unit: 'pregnancy_week', stage: 'pregnancy' },
  { key: 'pregnancy_month_9', type: 'pregnancy_month', title: 'Nine Months', emoji: '🏁', description: 'The final month! Your baby could arrive any day now.', trigger_value: 36, trigger_unit: 'pregnancy_week', stage: 'pregnancy' },
  { key: 'full_term', type: 'full_term', title: 'Full Term!', emoji: '🎯', description: 'Full term! Your baby could arrive any day now — and they are ready.', trigger_value: 37, trigger_unit: 'pregnancy_week', stage: 'pregnancy', is_major: true },

  // Infant — age-based milestones
  { key: 'age_1_week', type: 'age_week', title: 'One Week Old!', emoji: '🌟', description: 'Your baby is one week old! You survived the first week — that is huge.', trigger_value: 1, trigger_unit: 'age_weeks', stage: 'infant' },
  { key: 'age_2_weeks', type: 'age_week', title: 'Two Weeks Old', emoji: '✨', description: 'Two weeks! You are finding your rhythm, even if it does not feel like it yet.', trigger_value: 2, trigger_unit: 'age_weeks', stage: 'infant' },
  { key: 'age_1_month', type: 'monthly_birthday', title: 'One Month Old!', emoji: '🎂', description: 'Happy one month! Look how far you have both come.', trigger_value: 1, trigger_unit: 'age_months', stage: 'infant' },
  { key: 'age_2_months', type: 'monthly_birthday', title: 'Two Months Old', emoji: '🌈', description: 'Two months! Social smiles are likely appearing now — what a reward.', trigger_value: 2, trigger_unit: 'age_months', stage: 'infant' },
  { key: 'age_3_months', type: 'monthly_birthday', title: 'Three Months Old', emoji: '🦋', description: 'Three months — the fourth trimester is complete! Things often start to feel easier.', trigger_value: 3, trigger_unit: 'age_months', stage: 'infant' },
  { key: 'age_4_months', type: 'monthly_birthday', title: 'Four Months Old', emoji: '🌻', description: 'Four months! Your baby is becoming so interactive and engaging.', trigger_value: 4, trigger_unit: 'age_months', stage: 'infant' },
  { key: 'age_5_months', type: 'monthly_birthday', title: 'Five Months Old', emoji: '🎵', description: 'Five months — reaching, grabbing, and exploring everything!', trigger_value: 5, trigger_unit: 'age_months', stage: 'infant' },
  { key: 'age_6_months', type: 'monthly_birthday', title: 'Half Birthday!', emoji: '🎉', description: 'Happy half birthday! Six months of growth, love, and discovery.', trigger_value: 6, trigger_unit: 'age_months', stage: 'infant', is_major: true },
  { key: 'age_7_months', type: 'monthly_birthday', title: 'Seven Months Old', emoji: '🌟', description: 'Seven months — your baby is becoming their own little person!', trigger_value: 7, trigger_unit: 'age_months', stage: 'infant' },
  { key: 'age_8_months', type: 'monthly_birthday', title: 'Eight Months Old', emoji: '🐣', description: 'Eight months! Crawling, babbling, and getting into everything.', trigger_value: 8, trigger_unit: 'age_months', stage: 'infant' },
  { key: 'age_9_months', type: 'monthly_birthday', title: 'Nine Months Old', emoji: '🚀', description: 'Nine months — they have been outside as long as they were inside!', trigger_value: 9, trigger_unit: 'age_months', stage: 'infant' },
  { key: 'age_10_months', type: 'monthly_birthday', title: 'Ten Months Old', emoji: '🌻', description: 'Ten months! Cruising, communicating, and full of personality.', trigger_value: 10, trigger_unit: 'age_months', stage: 'infant' },
  { key: 'age_11_months', type: 'monthly_birthday', title: 'Eleven Months Old', emoji: '🎈', description: 'Eleven months — the first birthday is just around the corner!', trigger_value: 11, trigger_unit: 'age_months', stage: 'infant' },
  { key: 'first_birthday', type: 'monthly_birthday', title: 'Happy First Birthday!', emoji: '🎂', description: 'One whole year! What an incredible journey from tiny newborn to this amazing little person.', trigger_value: 12, trigger_unit: 'age_months', stage: 'infant', is_major: true },
]

// Developmental milestones (not age-triggered, but listed for reference)
const DEVELOPMENTAL_MILESTONES = [
  { key: 'first_smile', type: 'first_smile', title: 'First Smile', emoji: '😊', description: 'That first real social smile — one of the most magical moments in early parenthood.' },
  { key: 'first_laugh', type: 'first_laugh', title: 'First Laugh', emoji: '😂', description: 'Nothing sounds better than your baby\'s laugh!' },
  { key: 'first_roll', type: 'first_roll', title: 'First Roll', emoji: '🔄', description: 'Rolling over! A big step in physical development.' },
  { key: 'first_word', type: 'first_word', title: 'First Word', emoji: '💬', description: 'Their first intentional word — you will remember this forever.' },
  { key: 'first_step', type: 'first_step', title: 'First Steps', emoji: '👣', description: 'Walking! A whole new world just opened up.' },
  { key: 'first_tooth', type: 'first_tooth', title: 'First Tooth', emoji: '🦷', description: 'That first tiny tooth — a milestone worth celebrating (and possibly dreading).' },
  { key: 'first_crawl', type: 'first_crawl', title: 'First Crawl', emoji: '🐛', description: 'On the move! Time to baby-proof everything.' },
  { key: 'first_wave', type: 'first_wave', title: 'First Wave', emoji: '👋', description: 'Waving hello or goodbye — a beautiful social milestone.' },
  { key: 'sitting_up', type: 'sitting_up', title: 'Sitting Up Independently', emoji: '🧸', description: 'Sitting without support — a whole new perspective on the world!' },
  { key: 'pulling_to_stand', type: 'pulling_to_stand', title: 'Pulling to Stand', emoji: '🙌', description: 'Standing tall (while holding on tight)!' },
  { key: 'sleeping_through', type: 'sleeping_through', title: 'Sleeping Through the Night', emoji: '🌙', description: 'A full night of sleep — for baby AND you. Celebrate this one!' },
]

// ── Birthday detection helpers ──────────────────────────────────────────────

/**
 * Detects if today is a monthly anniversary of the date_of_birth.
 * Returns the month number (1-36) if it is, or null if not.
 */
function detectMonthlyBirthday(dateOfBirth: string): { month: number; isToday: boolean; daysUntilNext: number; nextMonth: number } | null {
  const dob = new Date(dateOfBirth)
  if (isNaN(dob.getTime())) return null

  const today = new Date()
  const totalMonths =
    (today.getFullYear() - dob.getFullYear()) * 12 +
    (today.getMonth() - dob.getMonth())

  // Adjust if day hasn't been reached yet
  const adjustedMonths = today.getDate() < dob.getDate() ? totalMonths - 1 : totalMonths
  const currentMonth = Math.max(0, adjustedMonths)

  // Check if today is the exact anniversary day
  const isToday = today.getDate() === dob.getDate() && currentMonth > 0

  // Calculate days until next monthly birthday
  const nextMonth = currentMonth + 1
  const nextBirthdayDate = new Date(dob.getFullYear(), dob.getMonth() + nextMonth, dob.getDate())
  const daysUntilNext = Math.max(0, Math.ceil((nextBirthdayDate.getTime() - today.getTime()) / MS_PER_DAY))

  return { month: currentMonth, isToday, daysUntilNext, nextMonth }
}

export async function GET(request: NextRequest) {
  void request

  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: SECURITY_HEADERS }
      )
    }

    // Get baby profile
    const { data: memberData } = await supabase
      .from('baby_profile_members')
      .select('baby_id')
      .eq('profile_id', user.id)
      .limit(1)
      .maybeSingle()

    if (!memberData?.baby_id) {
      return NextResponse.json(
        { error: 'No baby profile found' },
        { status: 404, headers: SECURITY_HEADERS }
      )
    }

    const { data: babyData } = await supabase
      .from('baby_profiles')
      .select('id, name, due_date, date_of_birth, stage')
      .eq('id', memberData.baby_id)
      .single()

    if (!babyData) {
      return NextResponse.json(
        { error: 'Baby profile not found' },
        { status: 404, headers: SECURITY_HEADERS }
      )
    }

    const baby = babyData as BabyProfile
    const ageInfo = getBabyAgeInfo(baby)
    const babyName = baby.name || 'Baby'

    // Get already-celebrated milestones
    const { data: celebratedRows } = await supabase
      .from('baby_milestones')
      .select('milestone_key')
      .eq('baby_id', baby.id)

    const celebratedKeys = new Set((celebratedRows || []).map((r) => r.milestone_key))

    // Filter milestones relevant to this stage and age
    const stageMilestones = MILESTONE_DEFS.filter((m) => m.stage === baby.stage)

    const newlyUnlocked: (MilestoneDef & { celebration_message?: string })[] = []
    const upcoming: (MilestoneDef & { distance: number; countdown_message?: string })[] = []

    for (const milestone of stageMilestones) {
      if (celebratedKeys.has(milestone.key)) continue

      let currentValue = 0
      if (milestone.trigger_unit === 'pregnancy_week') {
        currentValue = ageInfo.pregnancy_week ?? 0
      } else if (milestone.trigger_unit === 'age_weeks') {
        currentValue = ageInfo.age_in_weeks ?? 0
      } else if (milestone.trigger_unit === 'age_months') {
        currentValue = ageInfo.age_in_months ?? 0
      }

      if (currentValue >= milestone.trigger_value) {
        // Only celebrate within a +7 day window of the milestone
        // (e.g., don't celebrate 6-month milestone when baby is 11 months old)
        const overshoot = currentValue - milestone.trigger_value
        let overshootDays = 0
        if (milestone.trigger_unit === 'age_months') {
          overshootDays = overshoot * 30 // approximate
        } else if (milestone.trigger_unit === 'age_weeks' || milestone.trigger_unit === 'pregnancy_week') {
          overshootDays = overshoot * 7
        }

        // Skip milestones that are more than 7 days past
        if (overshootDays > 7) continue

        // Personalize the description for monthly birthdays and trimester milestones
        let personalizedDesc = milestone.description
        let personalizedTitle = milestone.title
        let personalizedEmoji = milestone.emoji

        if (milestone.type === 'monthly_birthday') {
          const msg = getMonthlyBirthdayMessage(milestone.trigger_value, babyName)
          personalizedDesc = msg.description
          personalizedTitle = msg.title
          personalizedEmoji = msg.emoji
        } else if (milestone.type === 'trimester' || milestone.key === 'full_term') {
          const msg = getTrimesterCelebrationMessage(milestone.key)
          personalizedDesc = msg.description
          personalizedTitle = msg.title
          personalizedEmoji = msg.emoji
        }

        newlyUnlocked.push({
          ...milestone,
          title: personalizedTitle,
          description: personalizedDesc,
          emoji: personalizedEmoji,
          celebration_message: personalizedDesc,
        })
      } else {
        const distance = milestone.trigger_value - currentValue
        if (distance <= 4) {
          // Build an exciting countdown message
          let countdownMsg: string | undefined
          if (milestone.type === 'monthly_birthday' && baby.date_of_birth) {
            const bdInfo = detectMonthlyBirthday(baby.date_of_birth)
            if (bdInfo && bdInfo.daysUntilNext <= 30) {
              countdownMsg = `${bdInfo.daysUntilNext} ${bdInfo.daysUntilNext === 1 ? 'day' : 'days'} until ${babyName}'s ${milestone.trigger_value}-month birthday!`
            }
          } else if (milestone.type === 'trimester' || milestone.key === 'full_term') {
            const weeksLeft = distance
            countdownMsg = `${weeksLeft} ${weeksLeft === 1 ? 'week' : 'weeks'} until ${milestone.title.toLowerCase()}`
          }

          upcoming.push({ ...milestone, distance, countdown_message: countdownMsg })
        }
      }
    }

    // ── Monthly birthday detection (for babies beyond the predefined months) ──
    if (baby.date_of_birth && (baby.stage === 'infant' || baby.stage === 'toddler')) {
      const bdInfo = detectMonthlyBirthday(baby.date_of_birth)
      if (bdInfo && bdInfo.isToday && bdInfo.month > 0) {
        const birthdayKey = `monthly_birthday_${bdInfo.month}`
        if (!celebratedKeys.has(birthdayKey)) {
          // Check if this month is already covered by MILESTONE_DEFS
          const alreadyCovered = newlyUnlocked.some(
            (m) => m.type === 'monthly_birthday' && m.trigger_value === bdInfo.month
          )
          if (!alreadyCovered) {
            const msg = getMonthlyBirthdayMessage(bdInfo.month, babyName)
            newlyUnlocked.push({
              key: birthdayKey,
              type: 'monthly_birthday',
              title: msg.title,
              emoji: msg.emoji,
              description: msg.description,
              trigger_value: bdInfo.month,
              trigger_unit: 'age_months',
              stage: baby.stage as 'infant' | 'toddler',
              is_major: msg.is_major,
              celebration_message: msg.description,
            })
          }
        }
      }
    }

    // Sort upcoming by distance
    upcoming.sort((a, b) => a.distance - b.distance)

    // ── Create notifications for newly unlocked milestones ──
    for (const milestone of newlyUnlocked) {
      const notifTitle = `${milestone.emoji} ${babyName}'s ${milestone.title}!`
      const notifBody = milestone.celebration_message || milestone.description
      // Fire-and-forget: create notification (don't block response on it)
      createNotification(
        user.id,
        'milestone_approaching',
        notifTitle,
        notifBody,
        {
          baby_id: baby.id,
          emoji: milestone.emoji,
          priority: milestone.is_major ? 1 : 2,
          source_type: 'milestone',
          source_id: milestone.key,
        }
      ).catch((err) => {
        console.error('[MilestonesCheckAPI] Failed to create notification:', err)
      })
    }

    // ── Build countdown for next milestone ──
    let nextMilestoneCountdown: { message: string; days: number; milestone_title: string } | null = null

    if (baby.date_of_birth && (baby.stage === 'infant' || baby.stage === 'toddler')) {
      const bdInfo = detectMonthlyBirthday(baby.date_of_birth)
      if (bdInfo && bdInfo.daysUntilNext > 0 && bdInfo.daysUntilNext <= 30) {
        const nextMonthLabel = bdInfo.nextMonth === 12 ? 'first birthday' : `${bdInfo.nextMonth}-month birthday`
        nextMilestoneCountdown = {
          message: `${bdInfo.daysUntilNext} ${bdInfo.daysUntilNext === 1 ? 'day' : 'days'} until ${babyName}'s ${nextMonthLabel}!`,
          days: bdInfo.daysUntilNext,
          milestone_title: nextMonthLabel,
        }
      }
    } else if (baby.stage === 'pregnancy' && ageInfo.days_until_due !== undefined) {
      // For pregnancy, countdown to next trimester milestone or due date
      const nextTrimester = upcoming.find((m) => m.type === 'trimester' || m.key === 'full_term')
      if (nextTrimester) {
        const weeksLeft = nextTrimester.distance
        nextMilestoneCountdown = {
          message: `${weeksLeft} ${weeksLeft === 1 ? 'week' : 'weeks'} until ${nextTrimester.title.toLowerCase()}`,
          days: weeksLeft * 7,
          milestone_title: nextTrimester.title,
        }
      } else if (ageInfo.days_until_due > 0) {
        nextMilestoneCountdown = {
          message: `${ageInfo.days_until_due} days until your due date!`,
          days: ageInfo.days_until_due,
          milestone_title: 'Due date',
        }
      }
    }

    return NextResponse.json(
      {
        newly_unlocked: newlyUnlocked.map((m) => ({
          key: m.key,
          type: m.type,
          title: m.title,
          emoji: m.emoji,
          description: m.description,
          is_major: m.is_major ?? false,
          celebration_message: m.celebration_message ?? m.description,
        })),
        upcoming: upcoming.slice(0, 3).map((m) => ({
          key: m.key,
          type: m.type,
          title: m.title,
          emoji: m.emoji,
          description: m.description,
          distance: m.distance,
          distance_unit: m.trigger_unit === 'pregnancy_week' ? 'weeks' : m.trigger_unit === 'age_weeks' ? 'weeks' : 'months',
          countdown_message: m.countdown_message,
        })),
        next_milestone_countdown: nextMilestoneCountdown,
        developmental_milestones: DEVELOPMENTAL_MILESTONES.filter(
          (m) => !celebratedKeys.has(m.key)
        ),
        baby_name: baby.name,
        stage: baby.stage,
      },
      { headers: SECURITY_HEADERS }
    )
  } catch (err) {
    console.error('[MilestonesCheckAPI] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: SECURITY_HEADERS }
    )
  }
}

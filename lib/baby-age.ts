/**
 * @module BabyAge
 * @description Age calculation utilities for pregnancy and postnatal stages.
 *   Computes pregnancy week, trimester, age in weeks/months, time-of-day
 *   labels for contextual greetings, and ISO week numbers for weekly summaries.
 * @version 1.0.0
 * @since March 2026
 */

import type { BabyProfile, BabyAgeInfo, Stage } from '@/types/app'

/** Milliseconds in one day, used for date arithmetic. */
const MS_PER_DAY = 86_400_000

/** Average gestation period in days (40 weeks). */
const GESTATION_DAYS = 280

/**
 * Calculates comprehensive age information from a baby profile.
 *
 * For pregnancy: derives pregnancy week (clamped 1-45), trimester, and days until due.
 * For postnatal: derives age in weeks and months (clamped 0-36 months).
 * Handles invalid dates, future DOBs, and missing data gracefully.
 *
 * @param baby - The baby profile containing stage, due_date, and date_of_birth.
 * @returns Structured age info including display string and numeric values.
 */
export function getBabyAgeInfo(baby: BabyProfile): BabyAgeInfo {
  // Guard: null or undefined baby object
  if (!baby) {
    return { stage: 'pregnancy', age_display_string: 'Pregnancy' }
  }

  const today = new Date()
  if (baby.stage === 'pregnancy' && baby.due_date) {
    const due = new Date(baby.due_date)
    // Guard: invalid date string
    if (isNaN(due.getTime())) {
      return { stage: 'pregnancy', age_display_string: 'Pregnancy' }
    }
    const daysUntilDue = Math.ceil((due.getTime() - today.getTime()) / MS_PER_DAY)
    const daysPregnant = GESTATION_DAYS - daysUntilDue
    // Clamp pregnancy_week to 1-45 range
    const pregnancyWeek = Math.min(45, Math.max(1, Math.floor(daysPregnant / 7)))
    const trimester: 1 | 2 | 3 = pregnancyWeek <= 12 ? 1 : pregnancyWeek <= 27 ? 2 : 3
    return {
      stage: 'pregnancy',
      pregnancy_week: pregnancyWeek,
      trimester,
      days_until_due: Math.max(0, daysUntilDue),
      age_display_string: `Week ${pregnancyWeek} · Trimester ${trimester}`,
    }
  }
  if (baby.date_of_birth) {
    const dob = new Date(baby.date_of_birth)
    // Guard: invalid date string
    if (isNaN(dob.getTime())) {
      return { stage: baby.stage, age_display_string: baby.name || 'Baby' }
    }
    const ageInDays = Math.floor((today.getTime() - dob.getTime()) / MS_PER_DAY)

    // Guard: future DOB should not produce negative ages
    if (ageInDays < 0) {
      const name = baby.name || 'Baby'
      return {
        stage: baby.stage,
        age_in_weeks: 0,
        age_in_months: 0,
        age_display_string: `${name} · Not yet born`,
      }
    }

    const ageInWeeks = Math.floor(ageInDays / 7)
    const rawAgeInMonths =
      (today.getFullYear() - dob.getFullYear()) * 12 +
      (today.getMonth() - dob.getMonth())
    // Clamp age_in_months to 0-36 range for infant/toddler
    const ageInMonths = Math.max(0, Math.min(36, rawAgeInMonths))
    // Calculate remaining weeks since the start of the current month-age
    // (months are not exactly 4 weeks, so use calendar math for accuracy)
    const monthAgeStart = new Date(dob.getFullYear(), dob.getMonth() + ageInMonths, dob.getDate())
    const daysSinceMonthAge = Math.floor((today.getTime() - monthAgeStart.getTime()) / MS_PER_DAY)
    const remainingWeeks = Math.max(0, Math.floor(daysSinceMonthAge / 7))
    const name = baby.name || 'Baby'
    return {
      stage: baby.stage,
      age_in_weeks: ageInWeeks,
      age_in_months: ageInMonths,
      age_display_string:
        remainingWeeks > 0
          ? `${name} · ${ageInWeeks} weeks · ${ageInMonths} months ${remainingWeeks} weeks`
          : `${name} · ${ageInWeeks} weeks · ${ageInMonths} months`,
    }
  }
  return { stage: 'pregnancy', age_display_string: 'Pregnancy' }
}

/**
 * Returns a labelled time-of-day bucket based on the current hour.
 * Used for contextual greetings and check-in openers.
 */
export function getTimeOfDay() {
  const h = new Date().getHours()
  if (h >= 5 && h < 9) return { label: 'early_morning' as const, display: 'Early morning' }
  if (h >= 9 && h < 12) return { label: 'late_morning' as const, display: 'Morning' }
  if (h >= 12 && h < 17) return { label: 'afternoon' as const, display: 'Afternoon' }
  if (h >= 17 && h < 21) return { label: 'evening' as const, display: 'Evening' }
  return { label: 'late_night' as const, display: 'Late night' }
}

/**
 * Returns a stage-aware and time-aware conversational opener for daily check-ins.
 *
 * @param stage    - Current baby stage (pregnancy | infant | toddler).
 * @param babyName - Display name of the baby, or null for default.
 * @returns A friendly opening question string.
 */
export function getCheckinOpener(stage: Stage, babyName: string | null): string {
  const h = new Date().getHours()
  const name = babyName || 'your baby'
  if (stage === 'pregnancy') {
    if (h >= 5 && h < 9) return 'How are you feeling this morning?'
    if (h >= 9 && h < 12) return "How's the first half of the day going?"
    if (h >= 12 && h < 17) return 'How are you doing this afternoon?'
    if (h >= 17 && h < 21) return 'How are you both feeling this evening?'
    return "Still up? How are you doing?"
  }
  if (h >= 5 && h < 9) return `How did last night go with ${name}?`
  if (h >= 9 && h < 12) return "How's the morning going?"
  if (h >= 12 && h < 17) return `How's ${name} doing today?`
  if (h >= 17 && h < 21) return `How did today feel? Let's think about tonight.`
  return `Still up? Rough night?`
}

/**
 * Calculates the current ISO 8601 week number and year.
 * ISO weeks start on Monday; Jan 4 is always in week 1.
 */
export function getCurrentISOWeek(): { week: number; year: number } {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const y = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return {
    week: Math.ceil(((d.getTime() - y.getTime()) / MS_PER_DAY + 1) / 7),
    year: d.getUTCFullYear(),
  }
}

/**
 * Derives the weekly guide lookup key from a baby profile.
 * Maps pregnancy to week number, infant to age in weeks, toddler to age in months.
 *
 * @param baby - The baby profile.
 * @returns An object with stage and the corresponding week or month number.
 */
export function getWeeklyGuideKey(baby: BabyProfile): { stage: Stage; week_or_month: number } {
  const info = getBabyAgeInfo(baby)
  if (info.stage === 'pregnancy' && info.pregnancy_week)
    return { stage: 'pregnancy', week_or_month: info.pregnancy_week }
  if (info.stage === 'infant' && info.age_in_weeks !== undefined)
    return { stage: 'infant', week_or_month: Math.max(1, info.age_in_weeks) }
  if (info.stage === 'toddler' && info.age_in_months !== undefined)
    return { stage: 'toddler', week_or_month: Math.max(1, info.age_in_months) }
  return { stage: 'pregnancy', week_or_month: 1 }
}

/**
 * @module PatternRules
 * @description Rule-based pattern detection engine for daily check-in data.
 *   Detects sleep, feeding, mood, nausea, and anxiety patterns by scanning
 *   the most recent 3-5 check-ins. Includes a cooldown mechanism to prevent
 *   the same pattern from being flagged repeatedly within a configurable
 *   window (default 3 days).
 * @version 1.0.0
 * @since March 2026
 */

import type { DailyCheckin, PatternType } from '@/types/app'

type PatternResult = {
  type: PatternType
  message: string
}

/**
 * Detects noteworthy patterns from recent daily check-in data.
 *
 * Uses short-circuit evaluation: infant/toddler rules run only for those
 * stages, pregnancy rules only for pregnancy. Each rule examines only the
 * minimum required slice of sorted check-ins (3 or 5 days) to avoid
 * unnecessary iteration.
 *
 * @param checkins  - Array of recent daily check-in records.
 * @param stage     - Current baby stage (pregnancy | infant | toddler).
 * @param babyName  - Display name of the baby, or null for default.
 * @returns Array of detected patterns with human-readable messages.
 */
export function detectPatterns(
  checkins: DailyCheckin[],
  stage: 'pregnancy' | 'infant' | 'toddler' | 'postpartum',
  babyName: string | null
): PatternResult[] {
  // Guard: null/undefined/non-array input
  if (!Array.isArray(checkins) || checkins.length === 0) return []

  // Guard: invalid stage
  if (!stage || !['pregnancy', 'infant', 'toddler'].includes(stage)) return []

  const name = babyName || 'your baby'
  const results: PatternResult[] = []

  // Filter out checkins with invalid dates before sorting
  const validCheckins = checkins.filter((c) => {
    if (!c || !c.checkin_date) return false
    const d = new Date(c.checkin_date)
    return !isNaN(d.getTime())
  })

  if (validCheckins.length === 0) return []

  const sorted = [...validCheckins].sort(
    (a, b) => new Date(b.checkin_date).getTime() - new Date(a.checkin_date).getTime()
  )

  if (stage === 'infant' || stage === 'toddler') {
    // Sleep: poor for 3+ consecutive days
    const last3 = sorted.slice(0, 3)
    if (last3.length === 3 && last3.every((c) => c.sleep_quality === 'poor')) {
      results.push({
        type: 'sleep',
        message: `${name}'s sleep has been rough for 3 days in a row. Want to talk through what's going on?`,
      })
    }

    // Feeding: less for 3+ of last 5 days
    const last5 = sorted.slice(0, 5)
    const feedingLess = last5.filter((c) => c.feeding === 'less').length
    if (feedingLess >= 3) {
      results.push({
        type: 'feeding',
        message: `I've noticed ${name} has been feeding less than usual for a few days. Worth a closer look.`,
      })
    }

    // Mood: fussy/very_fussy for 4+ of last 5 days
    const fussyCount = last5.filter(
      (c) => c.mood === 'fussy' || c.mood === 'very_fussy'
    ).length
    if (fussyCount >= 4) {
      results.push({
        type: 'mood',
        message: `${name} has been quite fussy most of this week. Let's figure out what might be going on.`,
      })
    }
  }

  if (stage === 'pregnancy') {
    // Nausea severity: severe for 3+ consecutive days
    const last3 = sorted.slice(0, 3)
    if (last3.length === 3 && last3.every((c) => c.nausea_level === 'severe')) {
      results.push({
        type: 'nausea_severity',
        message:
          "You've had severe nausea for 3 days straight. This is worth talking to your midwife about — and I want to hear how you're doing.",
      })
    }

    // Prenatal anxiety: distressed for 2+ of last 5 days
    const last5 = sorted.slice(0, 5)
    const anxietyCount = last5.filter((c) => c.emotional_signal === 'distressed').length
    if (anxietyCount >= 2) {
      results.push({
        type: 'prenatal_anxiety',
        message:
          "You've been having a hard time emotionally this week. I'm here — want to talk about what's weighing on you?",
      })
    }
  }

  return results
}

/**
 * Checks whether a pattern type is still within its cooldown window.
 *
 * Returns true if the pattern is ALLOWED to fire (i.e. not in cooldown),
 * false if it was triggered too recently.
 *
 * @param recentPatterns - Previously triggered patterns with timestamps.
 * @param type           - The pattern type to check cooldown for.
 * @param cooldownDays   - Number of days to suppress re-triggering (default 3).
 * @returns True if the pattern may fire; false if still in cooldown.
 */
export function checkCooldown(
  recentPatterns: { pattern_type: string; triggered_at: string }[],
  type: PatternType,
  cooldownDays = 3
): boolean {
  // Guard: invalid inputs — allow the pattern if we can't check cooldown
  if (!Array.isArray(recentPatterns) || !type) return true
  if (typeof cooldownDays !== 'number' || cooldownDays < 0) cooldownDays = 3

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - cooldownDays)
  return !recentPatterns.some(
    (p) => {
      if (!p || !p.pattern_type || !p.triggered_at) return false
      const triggeredDate = new Date(p.triggered_at)
      if (isNaN(triggeredDate.getTime())) return false
      return p.pattern_type === type && triggeredDate > cutoff
    }
  )
}

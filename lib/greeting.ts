/**
 * @module Greeting
 * @description Time-aware, culturally diverse greeting utility for Lumira.
 *   Used across the home feed, chat landing, and email templates to make
 *   every message feel personal, contextual, and warm.
 *
 *   Key behaviours:
 *   - Post-midnight (0–2 am): empathetic / gently funny (parents are up with babies)
 *   - Early morning (3–5 am): quietly encouraging
 *   - Morning (6–11 am): diverse culturally inclusive openers (rotates daily)
 *   - Afternoon (12–4 pm): friendly, casual
 *   - Evening (5–8 pm): warm
 *   - Night (9–11 pm): gentle, winding-down
 *
 * @version 1.0.0
 * @since March 2026
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TimePeriod =
  | 'post_midnight'   // 0 – 2
  | 'early_morning'   // 3 – 5
  | 'morning'         // 6 – 11
  | 'afternoon'       // 12 – 16
  | 'evening'         // 17 – 20
  | 'night'           // 21 – 23

// ---------------------------------------------------------------------------
// Opener pools
// ---------------------------------------------------------------------------

const OPENERS: Record<TimePeriod, string[]> = {
  /**
   * Post-midnight: parents are often up for night feeds or can't sleep.
   * Tone: empathetic, lightly playful, never dismissive.
   */
  post_midnight: [
    'Up past midnight —',
    'Night feed o\'clock —',
    'The midnight shift —',
    'Still going, legend —',
    'You\'re running on love (and coffee) —',
    'Technically tomorrow, but hi,',
    'The world is asleep —',
    'Night owl mode:',
  ],

  /**
   * Early morning: up before the sun, probably with a baby.
   * Tone: quietly admiring.
   */
  early_morning: [
    'Rise and shine,',
    'You\'re up before the sun,',
    'Early bird,',
    'First one up,',
    'The early hours belong to you,',
  ],

  /**
   * Morning: culturally diverse openers that rotate daily.
   * Choices are widely recognised, warm, and respectful.
   */
  morning: [
    'Good morning,',
    'Bonjour,',           // French
    'Buenos días,',       // Spanish
    'Guten Morgen,',      // German
    'Namaste,',           // Sanskrit / widely used
    'Good morning,',
    'Ohayō,',             // Japanese (casual romanisation)
    'Aloha,',             // Hawaiian
    'Good morning,',
    'Günaydın,',          // Turkish
    'Shubh prabhat,',     // Hindi
    'Good morning,',
  ],

  /**
   * Afternoon: friendly and casual.
   */
  afternoon: [
    'Good afternoon,',
    'Howdy,',
    'G\'day,',            // Australian / NZ
    'Buenas tardes,',     // Spanish
    'Bon après-midi,',    // French
    'Aloha,',
    'Good afternoon,',
    'Hola,',
    'Salaam,',            // Arabic / Persian / Urdu
    'Good afternoon,',
    'Hey there,',
  ],

  /**
   * Evening: warm and calm.
   */
  evening: [
    'Good evening,',
    'Bonsoir,',           // French
    'Buenas tardes,',     // Spanish (tardes = afternoon/evening)
    'Konbanwa,',          // Japanese
    'Good evening,',
    'Shalom,',            // Hebrew
    'Selamat petang,',    // Malay (petang = evening)
    'Good evening,',
    'Shubh sandhyā,',     // Hindi
  ],

  /**
   * Night: gentle — day is winding down.
   */
  night: [
    'Hey there,',
    'Hey,',
    'Evening,',
    'Almost bedtime,',
    'Winding down,',
    'Hope today was good,',
  ],
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Picks an item from an array deterministically by calendar day.
 * This means the opener changes once per day (not per render), giving
 * pleasant variety without jarring jumps mid-session.
 */
function pickByDay<T>(items: T[]): T {
  // Days since Unix epoch — changes at midnight UTC
  const daysSinceEpoch = Math.floor(Date.now() / 86_400_000)
  return items[daysSinceEpoch % items.length]
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns the time period bucket for the given hour (0–23).
 */
export function getTimePeriod(hour: number): TimePeriod {
  if (hour < 3)  return 'post_midnight'
  if (hour < 6)  return 'early_morning'
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  if (hour < 21) return 'evening'
  return 'night'
}

/**
 * Returns a complete, personalised greeting for the given local hour and name.
 *
 * Examples:
 *   getGreeting(2,  'Priya')  → "Night feed o'clock — Priya"
 *   getGreeting(8,  'James')  → "Bonjour, James"
 *   getGreeting(14, 'Sara')   → "Howdy, Sara"
 *   getGreeting(22, 'Alex')   → "Winding down, Alex"
 *
 * @param hour      - User's local hour (0–23)
 * @param firstName - User's first name (falls back to 'there')
 */
export function getGreeting(hour: number, firstName: string): string {
  const name = firstName?.trim() || 'there'
  const opener = pickByDay(OPENERS[getTimePeriod(hour)])

  // Openers ending with '—' or ':' already carry the right punctuation
  return `${opener} ${name}`
}

/**
 * Shorter greeting for space-constrained surfaces (notifications, subtitles).
 * Returns only the opener word/phrase without the name.
 *
 * Examples:
 *   getShortGreeting(8)  → "Bonjour"
 *   getShortGreeting(14) → "Howdy"
 */
export function getShortGreeting(hour: number): string {
  const opener = pickByDay(OPENERS[getTimePeriod(hour)])
  // Strip trailing punctuation for display as a standalone word
  return opener.replace(/[,!:—\-]+$/, '').trim()
}

/**
 * Returns a simple time-of-day word for email subject lines.
 * Server-side usage: pass the UTC send hour (typically morning for daily crons).
 * Defaults to 'morning' for scheduled emails and edge cases.
 */
export function getEmailTimeWord(hour: number): 'morning' | 'afternoon' | 'evening' {
  const period = getTimePeriod(hour)
  if (period === 'afternoon') return 'afternoon'
  if (period === 'evening' || period === 'night') return 'evening'
  return 'morning'
}

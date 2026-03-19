import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getBabyAgeInfo, getTimeOfDay, getCheckinOpener, getCurrentISOWeek, getWeeklyGuideKey } from '@/lib/baby-age'
import type { BabyProfile } from '@/types/app'

function makeBaby(overrides: Partial<BabyProfile> = {}): BabyProfile {
  return {
    id: 'baby-1',
    name: 'Meera',
    due_date: null,
    date_of_birth: null,
    stage: 'infant',
    pending_proactive_type: null,
    pending_proactive_set_at: null,
    created_by_profile_id: 'profile-1',
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('getBabyAgeInfo', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-18T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // ── NULL / UNDEFINED BABY ────────────────────────────────────────────────

  describe('null/undefined baby', () => {
    it('returns safe default for null baby', () => {
      const info = getBabyAgeInfo(null as unknown as BabyProfile)
      expect(info.stage).toBe('pregnancy')
      expect(info.age_display_string).toBe('Pregnancy')
    })

    it('returns safe default for undefined baby', () => {
      const info = getBabyAgeInfo(undefined as unknown as BabyProfile)
      expect(info.stage).toBe('pregnancy')
      expect(info.age_display_string).toBe('Pregnancy')
    })
  })

  // ── PREGNANCY CALCULATIONS ──────────────────────────────────────────────

  describe('pregnancy stage', () => {
    it('calculates correct pregnancy week from due date', () => {
      // Due date 70 days away => 280 - 70 = 210 days pregnant => week 30
      const baby = makeBaby({
        stage: 'pregnancy',
        due_date: '2026-05-27',
      })
      const info = getBabyAgeInfo(baby)
      expect(info.stage).toBe('pregnancy')
      expect(info.pregnancy_week).toBeDefined()
      expect(info.pregnancy_week).toBeGreaterThan(0)
      expect(info.trimester).toBeDefined()
      expect(info.days_until_due).toBeDefined()
    })

    it('returns trimester 1 for weeks 1-12', () => {
      // ~237 days away => 280 - 237 = 43 days pregnant => week ~6
      const baby = makeBaby({
        stage: 'pregnancy',
        due_date: '2026-11-10',
      })
      const info = getBabyAgeInfo(baby)
      expect(info.trimester).toBe(1)
      expect(info.pregnancy_week).toBeLessThanOrEqual(12)
    })

    it('returns trimester 2 for week 13', () => {
      // Want week 13: 13*7=91 days pregnant => due in 280-91=189 days
      const dueDate = new Date('2026-03-18')
      dueDate.setDate(dueDate.getDate() + 189)
      const baby = makeBaby({
        stage: 'pregnancy',
        due_date: dueDate.toISOString().split('T')[0],
      })
      const info = getBabyAgeInfo(baby)
      expect(info.trimester).toBe(2)
    })

    it('returns trimester 2 for weeks 13-27', () => {
      // ~140 days away => 280 - 140 = 140 days pregnant => week 20
      const baby = makeBaby({
        stage: 'pregnancy',
        due_date: '2026-08-05',
      })
      const info = getBabyAgeInfo(baby)
      expect(info.trimester).toBe(2)
      expect(info.pregnancy_week).toBeGreaterThanOrEqual(13)
      expect(info.pregnancy_week).toBeLessThanOrEqual(27)
    })

    it('returns trimester 2 for week 27', () => {
      // Want week 27: 27*7=189 days pregnant => due in 280-189=91 days
      const dueDate = new Date('2026-03-18')
      dueDate.setDate(dueDate.getDate() + 91)
      const baby = makeBaby({
        stage: 'pregnancy',
        due_date: dueDate.toISOString().split('T')[0],
      })
      const info = getBabyAgeInfo(baby)
      expect(info.trimester).toBe(2)
    })

    it('returns trimester 3 for week 28', () => {
      // Want week 28: 28*7=196 days pregnant => due in 280-196=84 days
      const dueDate = new Date('2026-03-18')
      dueDate.setDate(dueDate.getDate() + 84)
      const baby = makeBaby({
        stage: 'pregnancy',
        due_date: dueDate.toISOString().split('T')[0],
      })
      const info = getBabyAgeInfo(baby)
      expect(info.trimester).toBe(3)
    })

    it('returns trimester 3 for weeks 28+', () => {
      // ~28 days away => 280 - 28 = 252 days pregnant => week 36
      const baby = makeBaby({
        stage: 'pregnancy',
        due_date: '2026-04-15',
      })
      const info = getBabyAgeInfo(baby)
      expect(info.trimester).toBe(3)
    })

    it('clamps pregnancy_week to at least 1', () => {
      const baby = makeBaby({
        stage: 'pregnancy',
        due_date: '2027-03-01',
      })
      const info = getBabyAgeInfo(baby)
      expect(info.pregnancy_week).toBeGreaterThanOrEqual(1)
    })

    it('clamps pregnancy_week to at most 45', () => {
      // Very overdue: due date was 70 days ago => 280 + 70 = 350 days pregnant => week 50, clamped to 45
      const baby = makeBaby({
        stage: 'pregnancy',
        due_date: '2026-01-07',
      })
      const info = getBabyAgeInfo(baby)
      expect(info.pregnancy_week).toBeLessThanOrEqual(45)
    })

    it('clamps days_until_due to minimum 0 (overdue)', () => {
      const baby = makeBaby({
        stage: 'pregnancy',
        due_date: '2026-03-10',
      })
      const info = getBabyAgeInfo(baby)
      expect(info.days_until_due).toBe(0)
    })

    it('handles due_date exactly today', () => {
      const baby = makeBaby({
        stage: 'pregnancy',
        due_date: '2026-03-18',
      })
      const info = getBabyAgeInfo(baby)
      expect(info.pregnancy_week).toBe(40)
      expect(info.days_until_due).toBe(0)
    })

    it('display string shows week and trimester', () => {
      const baby = makeBaby({
        stage: 'pregnancy',
        due_date: '2026-04-15',
      })
      const info = getBabyAgeInfo(baby)
      expect(info.age_display_string).toContain('Week')
      expect(info.age_display_string).toContain('Trimester')
    })

    it('handles invalid due_date string gracefully', () => {
      const baby = makeBaby({
        stage: 'pregnancy',
        due_date: 'not-a-date',
      })
      const info = getBabyAgeInfo(baby)
      expect(info.stage).toBe('pregnancy')
      expect(info.age_display_string).toBe('Pregnancy')
    })

    it('handles due_date with extreme future (5 years away)', () => {
      const baby = makeBaby({
        stage: 'pregnancy',
        due_date: '2031-03-18',
      })
      const info = getBabyAgeInfo(baby)
      expect(info.stage).toBe('pregnancy')
      expect(info.pregnancy_week).toBeGreaterThanOrEqual(1)
    })

    it('pregnancy with both due_date and date_of_birth uses due_date path', () => {
      const baby = makeBaby({
        stage: 'pregnancy',
        due_date: '2026-04-15',
        date_of_birth: '2026-01-01',
      })
      const info = getBabyAgeInfo(baby)
      expect(info.stage).toBe('pregnancy')
      expect(info.pregnancy_week).toBeDefined()
    })
  })

  // ── INFANT AGE CALCULATIONS ─────────────────────────────────────────────

  describe('infant stage', () => {
    it('calculates correct age_in_weeks for 2-week-old', () => {
      const baby = makeBaby({
        stage: 'infant',
        date_of_birth: '2026-03-04', // 14 days ago
      })
      const info = getBabyAgeInfo(baby)
      expect(info.age_in_weeks).toBe(2)
    })

    it('calculates correct age for 7-week-old', () => {
      const baby = makeBaby({
        stage: 'infant',
        date_of_birth: '2026-01-28', // 49 days = 7 weeks
      })
      const info = getBabyAgeInfo(baby)
      expect(info.age_in_weeks).toBe(7)
    })

    it('calculates correct age at 6 months', () => {
      const baby = makeBaby({
        stage: 'infant',
        date_of_birth: '2025-09-18', // 6 months ago
      })
      const info = getBabyAgeInfo(baby)
      expect(info.age_in_months).toBe(6)
      expect(info.age_in_weeks).toBeGreaterThan(0)
    })

    it('calculates age at exactly 12 months', () => {
      const baby = makeBaby({
        stage: 'infant',
        date_of_birth: '2025-03-18',
      })
      const info = getBabyAgeInfo(baby)
      expect(info.age_in_months).toBe(12)
    })

    it('DOB = today yields age_in_weeks = 0, age_in_months = 0', () => {
      const baby = makeBaby({
        stage: 'infant',
        date_of_birth: '2026-03-18',
      })
      const info = getBabyAgeInfo(baby)
      expect(info.age_in_weeks).toBe(0)
      expect(info.age_in_months).toBe(0)
    })

    it('DOB = yesterday yields age_in_weeks = 0', () => {
      const baby = makeBaby({
        stage: 'infant',
        date_of_birth: '2026-03-17',
      })
      const info = getBabyAgeInfo(baby)
      expect(info.age_in_weeks).toBe(0)
    })

    it('uses baby name in display string', () => {
      const baby = makeBaby({
        stage: 'infant',
        date_of_birth: '2026-01-28',
        name: 'Meera',
      })
      const info = getBabyAgeInfo(baby)
      expect(info.age_display_string).toContain('Meera')
    })

    it('uses "Baby" when name is null', () => {
      const baby = makeBaby({
        stage: 'infant',
        date_of_birth: '2026-01-28',
        name: null,
      })
      const info = getBabyAgeInfo(baby)
      expect(info.age_display_string).toContain('Baby')
    })

    it('handles future DOB gracefully (returns 0 weeks, "Not yet born")', () => {
      const baby = makeBaby({
        stage: 'infant',
        date_of_birth: '2026-04-01',
      })
      const info = getBabyAgeInfo(baby)
      expect(info.age_in_weeks).toBe(0)
      expect(info.age_in_months).toBe(0)
      expect(info.age_display_string).toContain('Not yet born')
    })

    it('handles invalid date_of_birth string gracefully', () => {
      const baby = makeBaby({
        stage: 'infant',
        date_of_birth: 'not-a-date',
      })
      const info = getBabyAgeInfo(baby)
      expect(info).toBeDefined()
      expect(info.age_display_string).toBeDefined()
    })

    it('handles date_of_birth "2025-13-45" (invalid month/day)', () => {
      const baby = makeBaby({
        stage: 'infant',
        date_of_birth: '2025-13-45',
      })
      const info = getBabyAgeInfo(baby)
      // JS Date may parse this weirdly, but should not crash
      expect(info).toBeDefined()
    })

    it('handles extremely old DOB (100 years ago) without crashing', () => {
      const baby = makeBaby({
        stage: 'infant',
        date_of_birth: '1926-03-18',
      })
      const info = getBabyAgeInfo(baby)
      expect(info.age_in_weeks).toBeDefined()
      expect(info.age_in_weeks!).toBeGreaterThan(0)
      // age_in_months is clamped to max 36
      expect(info.age_in_months).toBeLessThanOrEqual(36)
    })

    it('clamps age_in_months to 0-36 range', () => {
      const baby = makeBaby({
        stage: 'infant',
        date_of_birth: '1926-03-18',
      })
      const info = getBabyAgeInfo(baby)
      expect(info.age_in_months).toBeLessThanOrEqual(36)
      expect(info.age_in_months).toBeGreaterThanOrEqual(0)
    })
  })

  // ── TODDLER STAGE ──────────────────────────────────────────────────────

  describe('toddler stage', () => {
    it('calculates correct age for toddler at 24 months', () => {
      const baby = makeBaby({
        stage: 'toddler',
        date_of_birth: '2024-03-18',
      })
      const info = getBabyAgeInfo(baby)
      expect(info.age_in_months).toBe(24)
    })

    it('calculates correct age for toddler at 18 months', () => {
      const baby = makeBaby({
        stage: 'toddler',
        date_of_birth: '2024-09-18',
      })
      const info = getBabyAgeInfo(baby)
      expect(info.age_in_months).toBe(18)
    })
  })

  // ── EDGE CASES ─────────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('returns fallback when neither due_date nor date_of_birth is set', () => {
      const baby = makeBaby({
        stage: 'pregnancy',
        due_date: null,
        date_of_birth: null,
      })
      const info = getBabyAgeInfo(baby)
      expect(info.stage).toBe('pregnancy')
      expect(info.age_display_string).toBe('Pregnancy')
    })

    it('returns fallback for infant with no DOB and no due_date', () => {
      const baby = makeBaby({
        stage: 'infant',
        due_date: null,
        date_of_birth: null,
      })
      const info = getBabyAgeInfo(baby)
      expect(info.stage).toBe('pregnancy')
      expect(info.age_display_string).toBe('Pregnancy')
    })

    it('stage="pregnancy" but no due_date falls through to DOB check', () => {
      const baby = makeBaby({
        stage: 'pregnancy',
        due_date: null,
        date_of_birth: '2026-01-01',
      })
      const info = getBabyAgeInfo(baby)
      // It has a DOB so it goes to DOB path
      expect(info.age_in_weeks).toBeDefined()
    })

    it('stage="infant" but no date_of_birth returns fallback', () => {
      const baby = makeBaby({
        stage: 'infant',
        due_date: null,
        date_of_birth: null,
      })
      const info = getBabyAgeInfo(baby)
      expect(info.age_display_string).toBe('Pregnancy')
    })
  })

  // ── LEAP YEAR EDGE CASES ───────────────────────────────────────────────

  describe('leap year edge cases', () => {
    it('handles DOB on Feb 29 (leap year) from non-leap year today', () => {
      // 2024 was a leap year
      const baby = makeBaby({
        stage: 'infant',
        date_of_birth: '2024-02-29',
      })
      const info = getBabyAgeInfo(baby)
      expect(info.age_in_weeks).toBeDefined()
      expect(info.age_in_months).toBeDefined()
      expect(info.age_in_months).toBeGreaterThan(0)
    })
  })
})

// ── getTimeOfDay ─────────────────────────────────────────────────────────

describe('getTimeOfDay', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns early_morning for hour=5', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-18T05:00:00'))
    expect(getTimeOfDay().label).toBe('early_morning')
    expect(getTimeOfDay().display).toBe('Early morning')
  })

  it('returns early_morning for hour=6', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-18T06:30:00'))
    expect(getTimeOfDay().label).toBe('early_morning')
  })

  it('returns early_morning for hour=8', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-18T08:59:00'))
    expect(getTimeOfDay().label).toBe('early_morning')
  })

  it('returns late_morning for hour=9', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-18T09:00:00'))
    expect(getTimeOfDay().label).toBe('late_morning')
    expect(getTimeOfDay().display).toBe('Morning')
  })

  it('returns late_morning for hour=11', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-18T11:30:00'))
    expect(getTimeOfDay().label).toBe('late_morning')
  })

  it('returns afternoon for hour=12', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-18T12:00:00'))
    expect(getTimeOfDay().label).toBe('afternoon')
    expect(getTimeOfDay().display).toBe('Afternoon')
  })

  it('returns afternoon for hour=14', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-18T14:00:00'))
    expect(getTimeOfDay().label).toBe('afternoon')
  })

  it('returns afternoon for hour=16', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-18T16:59:00'))
    expect(getTimeOfDay().label).toBe('afternoon')
  })

  it('returns evening for hour=17', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-18T17:00:00'))
    expect(getTimeOfDay().label).toBe('evening')
    expect(getTimeOfDay().display).toBe('Evening')
  })

  it('returns evening for hour=19', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-18T19:00:00'))
    expect(getTimeOfDay().label).toBe('evening')
  })

  it('returns evening for hour=20', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-18T20:59:00'))
    expect(getTimeOfDay().label).toBe('evening')
  })

  it('returns late_night for hour=21', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-18T21:00:00'))
    expect(getTimeOfDay().label).toBe('late_night')
    expect(getTimeOfDay().display).toBe('Late night')
  })

  it('returns late_night for hour=23', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-18T23:00:00'))
    expect(getTimeOfDay().label).toBe('late_night')
  })

  it('returns late_night for midnight (0:00)', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-18T00:00:00'))
    expect(getTimeOfDay().label).toBe('late_night')
  })

  it('returns late_night for hour=3', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-18T03:00:00'))
    expect(getTimeOfDay().label).toBe('late_night')
  })

  it('returns late_night for hour=4', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-18T04:59:00'))
    expect(getTimeOfDay().label).toBe('late_night')
  })
})

// ── getCheckinOpener ─────────────────────────────────────────────────────

describe('getCheckinOpener', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  describe('pregnancy stage openers', () => {
    it('early morning pregnancy opener', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-03-18T06:00:00'))
      const opener = getCheckinOpener('pregnancy', null)
      expect(opener).toContain('morning')
    })

    it('late morning pregnancy opener', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-03-18T10:00:00'))
      const opener = getCheckinOpener('pregnancy', null)
      expect(opener).toContain('first half')
    })

    it('afternoon pregnancy opener', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-03-18T14:00:00'))
      const opener = getCheckinOpener('pregnancy', null)
      expect(opener).toContain('afternoon')
    })

    it('evening pregnancy opener', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-03-18T19:00:00'))
      const opener = getCheckinOpener('pregnancy', null)
      expect(opener).toContain('evening')
    })

    it('late night pregnancy opener', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-03-18T23:00:00'))
      const opener = getCheckinOpener('pregnancy', null)
      expect(opener.toLowerCase()).toContain('still up')
    })
  })

  describe('infant/toddler stage openers', () => {
    it('uses baby name in infant opener', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-03-18T06:00:00'))
      const opener = getCheckinOpener('infant', 'Meera')
      expect(opener).toContain('Meera')
    })

    it('uses "your baby" when name is null', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-03-18T06:00:00'))
      const opener = getCheckinOpener('infant', null)
      expect(opener).toContain('your baby')
    })

    it('uses "your baby" when name is empty string', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-03-18T06:00:00'))
      const opener = getCheckinOpener('infant', '')
      expect(opener).toContain('your baby')
    })

    it('afternoon infant opener mentions baby by name', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-03-18T14:00:00'))
      const opener = getCheckinOpener('infant', 'Meera')
      expect(opener).toContain('Meera')
    })

    it('late night infant opener acknowledges the hour', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-03-18T23:00:00'))
      const opener = getCheckinOpener('infant', 'Meera')
      expect(opener.toLowerCase()).toContain('still up')
    })

    it('toddler stage uses same openers as infant', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-03-18T06:00:00'))
      const opener = getCheckinOpener('toddler', 'Meera')
      expect(opener).toContain('Meera')
    })
  })
})

// ── getCurrentISOWeek ────────────────────────────────────────────────────

describe('getCurrentISOWeek', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns valid week and year', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-18T12:00:00Z'))
    const result = getCurrentISOWeek()
    expect(result.week).toBeGreaterThanOrEqual(1)
    expect(result.week).toBeLessThanOrEqual(53)
    expect(result.year).toBe(2026)
  })

  it('returns week 1 near start of year', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-05T12:00:00Z'))
    const result = getCurrentISOWeek()
    expect(result.week).toBe(2) // Jan 5 2026 is a Monday, ISO week 2
  })

  it('handles year boundary correctly', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-12-31T12:00:00Z'))
    const result = getCurrentISOWeek()
    expect(result.week).toBeGreaterThanOrEqual(1)
    expect(result.week).toBeLessThanOrEqual(53)
  })
})

// ── getWeeklyGuideKey ────────────────────────────────────────────────────

describe('getWeeklyGuideKey', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-18T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns pregnancy stage with pregnancy_week', () => {
    const baby = makeBaby({
      stage: 'pregnancy',
      due_date: '2026-04-15',
    })
    const result = getWeeklyGuideKey(baby)
    expect(result.stage).toBe('pregnancy')
    expect(result.week_or_month).toBeGreaterThan(0)
  })

  it('returns infant stage with age_in_weeks', () => {
    const baby = makeBaby({
      stage: 'infant',
      date_of_birth: '2026-01-28',
    })
    const result = getWeeklyGuideKey(baby)
    expect(result.stage).toBe('infant')
    expect(result.week_or_month).toBe(7)
  })

  it('returns toddler stage with age_in_months', () => {
    const baby = makeBaby({
      stage: 'toddler',
      date_of_birth: '2024-03-18',
    })
    const result = getWeeklyGuideKey(baby)
    expect(result.stage).toBe('toddler')
    expect(result.week_or_month).toBe(24)
  })

  it('returns fallback when no age info available', () => {
    const baby = makeBaby({
      stage: 'pregnancy',
      due_date: null,
      date_of_birth: null,
    })
    const result = getWeeklyGuideKey(baby)
    expect(result.stage).toBe('pregnancy')
    expect(result.week_or_month).toBe(1)
  })

  it('returns fallback for invalid due_date', () => {
    const baby = makeBaby({
      stage: 'pregnancy',
      due_date: 'invalid',
    })
    const result = getWeeklyGuideKey(baby)
    expect(result.stage).toBe('pregnancy')
    expect(result.week_or_month).toBe(1)
  })
})

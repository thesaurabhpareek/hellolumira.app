// __tests__/lib/baby-age-edge-cases.test.ts
// Additional edge case tests for baby-age module
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getBabyAgeInfo, getWeeklyGuideKey, getCurrentISOWeek } from '@/lib/baby-age'
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

describe('getBabyAgeInfo — additional edge cases', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-18T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // ── BUG-011: pregnancy week out of range ──

  describe('BUG-011 FIXED: pregnancy week bounds (clamped to 1-45)', () => {
    it('overdue pregnancy — week is clamped to max 45', () => {
      // Due date 3 weeks ago: daysPregnant = 280 + 21 = 301, week = floor(301/7) = 43
      const baby = makeBaby({
        stage: 'pregnancy',
        due_date: '2026-02-25', // 21 days ago
      })
      const info = getBabyAgeInfo(baby)
      // Now clamped to max 45
      expect(info.pregnancy_week).toBeLessThanOrEqual(45)
      expect(info.pregnancy_week).toBeGreaterThan(40)
    })

    it('very early pregnancy — due date far in future', () => {
      // Due date 300 days away: daysPregnant = 280 - 300 = -20
      // Max(1, floor(-20/7)) = Max(1, -3) = 1
      const baby = makeBaby({
        stage: 'pregnancy',
        due_date: '2027-01-12', // ~300 days away
      })
      const info = getBabyAgeInfo(baby)
      expect(info.pregnancy_week).toBe(1)
    })
  })

  // ── Future DOB guard ──

  describe('future DOB handling', () => {
    it('returns age_in_weeks=0 for future DOB', () => {
      const baby = makeBaby({
        stage: 'infant',
        date_of_birth: '2026-04-01', // 2 weeks in the future
      })
      const info = getBabyAgeInfo(baby)
      expect(info.age_in_weeks).toBe(0)
      expect(info.age_in_months).toBe(0)
      expect(info.age_display_string).toContain('Not yet born')
    })
  })

  // ── Pregnancy without due_date ──

  describe('pregnancy without due_date', () => {
    it('returns fallback when stage=pregnancy but no due_date', () => {
      const baby = makeBaby({ stage: 'pregnancy', due_date: null })
      const info = getBabyAgeInfo(baby)
      expect(info.stage).toBe('pregnancy')
      expect(info.age_display_string).toBe('Pregnancy')
      expect(info.pregnancy_week).toBeUndefined()
    })
  })

  // ── Invalid date strings ──

  describe('invalid date strings (FIXED)', () => {
    it('handles invalid due_date gracefully (returns fallback)', () => {
      const baby = makeBaby({
        stage: 'pregnancy',
        due_date: 'not-a-date',
      })
      const info = getBabyAgeInfo(baby)
      expect(info).toBeDefined()
      expect(info.stage).toBe('pregnancy')
      expect(info.age_display_string).toBe('Pregnancy')
      // pregnancy_week should be undefined (fallback path)
      expect(info.pregnancy_week).toBeUndefined()
    })

    it('handles invalid date_of_birth gracefully (returns name fallback)', () => {
      const baby = makeBaby({
        stage: 'infant',
        date_of_birth: 'invalid',
      })
      const info = getBabyAgeInfo(baby)
      expect(info).toBeDefined()
      expect(info.age_display_string).toBe('Meera')
    })
  })
})

describe('getWeeklyGuideKey', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-18T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns pregnancy stage and week', () => {
    const baby = makeBaby({
      stage: 'pregnancy',
      due_date: '2026-05-27',
    })
    const key = getWeeklyGuideKey(baby)
    expect(key.stage).toBe('pregnancy')
    expect(key.week_or_month).toBeGreaterThan(0)
  })

  it('returns infant stage and weeks', () => {
    const baby = makeBaby({
      stage: 'infant',
      date_of_birth: '2026-01-28',
    })
    const key = getWeeklyGuideKey(baby)
    expect(key.stage).toBe('infant')
    expect(key.week_or_month).toBeGreaterThan(0)
  })

  it('returns toddler stage and months', () => {
    const baby = makeBaby({
      stage: 'toddler',
      date_of_birth: '2025-01-18',
    })
    const key = getWeeklyGuideKey(baby)
    expect(key.stage).toBe('toddler')
    expect(key.week_or_month).toBeGreaterThan(0)
  })

  it('returns fallback when no age info', () => {
    const baby = makeBaby({
      stage: 'pregnancy',
      due_date: null,
      date_of_birth: null,
    })
    const key = getWeeklyGuideKey(baby)
    expect(key.stage).toBe('pregnancy')
    expect(key.week_or_month).toBe(1)
  })
})

describe('getCurrentISOWeek', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns valid week number (1-53)', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-18T12:00:00Z'))
    const { week, year } = getCurrentISOWeek()
    expect(week).toBeGreaterThanOrEqual(1)
    expect(week).toBeLessThanOrEqual(53)
    expect(year).toBe(2026)
  })

  it('handles year boundary (Dec 31)', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-12-31T12:00:00Z'))
    const { week, year } = getCurrentISOWeek()
    expect(week).toBeGreaterThanOrEqual(1)
    expect(week).toBeLessThanOrEqual(53)
  })

  it('handles Jan 1', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T12:00:00Z'))
    const { week, year } = getCurrentISOWeek()
    expect(week).toBeGreaterThanOrEqual(1)
  })
})

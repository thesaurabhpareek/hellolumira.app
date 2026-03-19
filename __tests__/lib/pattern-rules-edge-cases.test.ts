// __tests__/lib/pattern-rules-edge-cases.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { detectPatterns, checkCooldown } from '@/lib/pattern-rules'
import type { DailyCheckin } from '@/types/app'

function makeCheckin(overrides: Partial<DailyCheckin> & { checkin_date: string }): DailyCheckin {
  return {
    id: crypto.randomUUID(),
    baby_id: 'baby-1',
    profile_id: 'profile-1',
    stage: 'infant',
    sleep_quality: null,
    night_wakings: null,
    feeding: null,
    mood: null,
    diapers: null,
    nausea_level: null,
    energy_level: null,
    symptoms_log: null,
    kept_food_down: null,
    concern_text: null,
    conversation_log: null,
    emotional_signal: null,
    created_at: overrides.checkin_date,
    updated_at: overrides.checkin_date,
    ...overrides,
  }
}

describe('detectPatterns — additional edge cases', () => {
  // ── All null fields ──

  describe('checkins with all null fields', () => {
    it('returns empty array when all checkin fields are null', () => {
      const checkins = [
        makeCheckin({ checkin_date: '2026-03-18' }),
        makeCheckin({ checkin_date: '2026-03-17' }),
        makeCheckin({ checkin_date: '2026-03-16' }),
        makeCheckin({ checkin_date: '2026-03-15' }),
        makeCheckin({ checkin_date: '2026-03-14' }),
      ]
      const result = detectPatterns(checkins, 'infant', 'Meera')
      expect(result).toEqual([])
    })
  })

  // ── Single checkin ──

  describe('insufficient data', () => {
    it('returns empty for 1 checkin', () => {
      const checkins = [
        makeCheckin({ checkin_date: '2026-03-18', sleep_quality: 'poor' }),
      ]
      const result = detectPatterns(checkins, 'infant', 'Meera')
      expect(result).toEqual([])
    })

    it('returns empty for 2 checkins (sleep needs 3)', () => {
      const checkins = [
        makeCheckin({ checkin_date: '2026-03-18', sleep_quality: 'poor' }),
        makeCheckin({ checkin_date: '2026-03-17', sleep_quality: 'poor' }),
      ]
      const result = detectPatterns(checkins, 'infant', 'Meera')
      expect(result.filter(r => r.type === 'sleep')).toHaveLength(0)
    })
  })

  // ── More than 7 checkins ──

  describe('large number of checkins', () => {
    it('only considers the most recent (sorted) checkins', () => {
      // 10 checkins, only the first 3 have poor sleep
      const checkins = Array.from({ length: 10 }, (_, i) =>
        makeCheckin({
          checkin_date: `2026-03-${(18 - i).toString().padStart(2, '0')}`,
          sleep_quality: i < 3 ? 'poor' : 'good',
        })
      )
      const result = detectPatterns(checkins, 'infant', 'Meera')
      expect(result.filter(r => r.type === 'sleep')).toHaveLength(1)
    })
  })

  // ── Toddler stage ──

  describe('toddler stage patterns', () => {
    it('detects sleep pattern for toddler', () => {
      const checkins = [
        makeCheckin({ checkin_date: '2026-03-18', sleep_quality: 'poor' }),
        makeCheckin({ checkin_date: '2026-03-17', sleep_quality: 'poor' }),
        makeCheckin({ checkin_date: '2026-03-16', sleep_quality: 'poor' }),
      ]
      const result = detectPatterns(checkins, 'toddler', 'Meera')
      expect(result.filter(r => r.type === 'sleep')).toHaveLength(1)
    })

    it('does NOT detect pregnancy patterns for toddler', () => {
      const checkins = [
        makeCheckin({ checkin_date: '2026-03-18', nausea_level: 'severe' }),
        makeCheckin({ checkin_date: '2026-03-17', nausea_level: 'severe' }),
        makeCheckin({ checkin_date: '2026-03-16', nausea_level: 'severe' }),
      ]
      const result = detectPatterns(checkins, 'toddler', 'Meera')
      expect(result.filter(r => r.type === 'nausea_severity')).toHaveLength(0)
    })
  })

  // ── Duplicate dates ──

  describe('duplicate checkin dates', () => {
    it('handles duplicate dates without crashing', () => {
      const checkins = [
        makeCheckin({ checkin_date: '2026-03-18', sleep_quality: 'poor' }),
        makeCheckin({ checkin_date: '2026-03-18', sleep_quality: 'poor' }),
        makeCheckin({ checkin_date: '2026-03-18', sleep_quality: 'poor' }),
      ]
      const result = detectPatterns(checkins, 'infant', 'Meera')
      // Still detects because 3 of 3 are poor (they're just same-day duplicates)
      expect(result.filter(r => r.type === 'sleep')).toHaveLength(1)
    })
  })
})

describe('checkCooldown — additional edge cases', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-18T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('handles invalid date in triggered_at gracefully', () => {
    const recent = [
      { pattern_type: 'sleep', triggered_at: 'not-a-date' },
    ]
    // new Date('not-a-date') = Invalid Date
    // Comparison with > will be false, so cooldown is not active
    expect(checkCooldown(recent, 'sleep')).toBe(true)
  })

  it('handles future triggered_at date', () => {
    const recent = [
      { pattern_type: 'sleep', triggered_at: '2026-03-25T12:00:00Z' }, // future
    ]
    // Future date > cutoff = true, so cooldown IS active
    expect(checkCooldown(recent, 'sleep')).toBe(false)
  })

  it('handles cooldownDays = 0', () => {
    const recent = [
      { pattern_type: 'sleep', triggered_at: '2026-03-18T11:00:00Z' }, // 1 hour ago
    ]
    // cutoff = today - 0 days = now, triggered_at 1 hour ago < now, so NOT blocked
    expect(checkCooldown(recent, 'sleep', 0)).toBe(true)
  })

  it('handles multiple recent patterns of same type', () => {
    const recent = [
      { pattern_type: 'sleep', triggered_at: '2026-03-17T12:00:00Z' },
      { pattern_type: 'sleep', triggered_at: '2026-03-14T12:00:00Z' },
    ]
    // First one is within cooldown
    expect(checkCooldown(recent, 'sleep')).toBe(false)
  })
})

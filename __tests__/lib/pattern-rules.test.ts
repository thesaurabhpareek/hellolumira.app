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

// ── detectPatterns ───────────────────────────────────────────────────────

describe('detectPatterns', () => {
  // ── Input validation guards ──

  describe('input validation', () => {
    it('returns empty array for null checkins', () => {
      expect(detectPatterns(null as unknown as DailyCheckin[], 'infant', 'Meera')).toEqual([])
    })

    it('returns empty array for undefined checkins', () => {
      expect(detectPatterns(undefined as unknown as DailyCheckin[], 'infant', 'Meera')).toEqual([])
    })

    it('returns empty array for empty checkins array', () => {
      expect(detectPatterns([], 'infant', 'Meera')).toEqual([])
    })

    it('returns empty array for non-array checkins', () => {
      expect(detectPatterns('not-array' as unknown as DailyCheckin[], 'infant', 'Meera')).toEqual([])
    })

    it('returns empty array for invalid stage', () => {
      const checkins = [makeCheckin({ checkin_date: '2026-03-18', sleep_quality: 'poor' })]
      expect(detectPatterns(checkins, 'invalid' as 'infant', 'Meera')).toEqual([])
    })

    it('returns empty array for null stage', () => {
      expect(detectPatterns([], null as unknown as 'infant', 'Meera')).toEqual([])
    })

    it('returns empty array for undefined stage', () => {
      expect(detectPatterns([], undefined as unknown as 'infant', 'Meera')).toEqual([])
    })

    it('returns empty array for empty string stage', () => {
      const checkins = [makeCheckin({ checkin_date: '2026-03-18', sleep_quality: 'poor' })]
      expect(detectPatterns(checkins, '' as 'infant', 'Meera')).toEqual([])
    })

    it('filters out checkins with null checkin_date', () => {
      const checkins = [
        { ...makeCheckin({ checkin_date: '2026-03-18', sleep_quality: 'poor' }), checkin_date: null as unknown as string },
        makeCheckin({ checkin_date: '2026-03-17', sleep_quality: 'poor' }),
        makeCheckin({ checkin_date: '2026-03-16', sleep_quality: 'poor' }),
      ]
      const result = detectPatterns(checkins, 'infant', 'Meera')
      const sleepPatterns = result.filter((r) => r.type === 'sleep')
      expect(sleepPatterns).toHaveLength(0) // Only 2 valid, need 3
    })

    it('filters out checkins with invalid date string', () => {
      const checkins = [
        makeCheckin({ checkin_date: 'not-a-date', sleep_quality: 'poor' }),
        makeCheckin({ checkin_date: '2026-03-17', sleep_quality: 'poor' }),
        makeCheckin({ checkin_date: '2026-03-16', sleep_quality: 'poor' }),
      ]
      const result = detectPatterns(checkins, 'infant', 'Meera')
      expect(result).toBeDefined() // Should not crash
    })

    it('filters out null checkin entries', () => {
      const checkins = [
        null as unknown as DailyCheckin,
        makeCheckin({ checkin_date: '2026-03-17', sleep_quality: 'poor' }),
        makeCheckin({ checkin_date: '2026-03-16', sleep_quality: 'poor' }),
      ]
      const result = detectPatterns(checkins, 'infant', 'Meera')
      expect(result).toBeDefined()
    })

    it('uses "your baby" when babyName is null', () => {
      const checkins = [
        makeCheckin({ checkin_date: '2026-03-18', sleep_quality: 'poor' }),
        makeCheckin({ checkin_date: '2026-03-17', sleep_quality: 'poor' }),
        makeCheckin({ checkin_date: '2026-03-16', sleep_quality: 'poor' }),
      ]
      const result = detectPatterns(checkins, 'infant', null)
      const sleepPattern = result.find((r) => r.type === 'sleep')
      expect(sleepPattern?.message).toContain('your baby')
    })

    it('uses "your baby" when babyName is empty string', () => {
      const checkins = [
        makeCheckin({ checkin_date: '2026-03-18', sleep_quality: 'poor' }),
        makeCheckin({ checkin_date: '2026-03-17', sleep_quality: 'poor' }),
        makeCheckin({ checkin_date: '2026-03-16', sleep_quality: 'poor' }),
      ]
      const result = detectPatterns(checkins, 'infant', '')
      const sleepPattern = result.find((r) => r.type === 'sleep')
      expect(sleepPattern?.message).toContain('your baby')
    })

    it('handles checkins with all null fields (no crash, no patterns)', () => {
      const checkins = [
        makeCheckin({ checkin_date: '2026-03-18' }),
        makeCheckin({ checkin_date: '2026-03-17' }),
        makeCheckin({ checkin_date: '2026-03-16' }),
        makeCheckin({ checkin_date: '2026-03-15' }),
        makeCheckin({ checkin_date: '2026-03-14' }),
      ]
      expect(detectPatterns(checkins, 'infant', 'Meera')).toEqual([])
    })
  })

  // ── SLEEP PATTERN: 3 consecutive poor nights (infant/toddler) ──

  describe('sleep pattern', () => {
    it('fires when last 3 days are all poor sleep', () => {
      const checkins = [
        makeCheckin({ checkin_date: '2026-03-18', sleep_quality: 'poor' }),
        makeCheckin({ checkin_date: '2026-03-17', sleep_quality: 'poor' }),
        makeCheckin({ checkin_date: '2026-03-16', sleep_quality: 'poor' }),
      ]
      const result = detectPatterns(checkins, 'infant', 'Meera')
      expect(result).toEqual(expect.arrayContaining([expect.objectContaining({ type: 'sleep' })]))
    })

    it('includes baby name in message', () => {
      const checkins = [
        makeCheckin({ checkin_date: '2026-03-18', sleep_quality: 'poor' }),
        makeCheckin({ checkin_date: '2026-03-17', sleep_quality: 'poor' }),
        makeCheckin({ checkin_date: '2026-03-16', sleep_quality: 'poor' }),
      ]
      const result = detectPatterns(checkins, 'infant', 'Meera')
      const sleepPattern = result.find((r) => r.type === 'sleep')
      expect(sleepPattern?.message).toContain('Meera')
    })

    it('does NOT fire when only 2 of 3 days are poor', () => {
      const checkins = [
        makeCheckin({ checkin_date: '2026-03-18', sleep_quality: 'poor' }),
        makeCheckin({ checkin_date: '2026-03-17', sleep_quality: 'ok' }),
        makeCheckin({ checkin_date: '2026-03-16', sleep_quality: 'poor' }),
      ]
      const result = detectPatterns(checkins, 'infant', 'Meera')
      expect(result.filter((r) => r.type === 'sleep')).toHaveLength(0)
    })

    it('does NOT fire with fewer than 3 checkins', () => {
      const checkins = [
        makeCheckin({ checkin_date: '2026-03-18', sleep_quality: 'poor' }),
        makeCheckin({ checkin_date: '2026-03-17', sleep_quality: 'poor' }),
      ]
      const result = detectPatterns(checkins, 'infant', 'Meera')
      expect(result.filter((r) => r.type === 'sleep')).toHaveLength(0)
    })

    it('does NOT fire with single checkin', () => {
      const checkins = [makeCheckin({ checkin_date: '2026-03-18', sleep_quality: 'poor' })]
      const result = detectPatterns(checkins, 'infant', 'Meera')
      expect(result.filter((r) => r.type === 'sleep')).toHaveLength(0)
    })

    it('does NOT fire for pregnancy stage', () => {
      const checkins = [
        makeCheckin({ checkin_date: '2026-03-18', sleep_quality: 'poor' }),
        makeCheckin({ checkin_date: '2026-03-17', sleep_quality: 'poor' }),
        makeCheckin({ checkin_date: '2026-03-16', sleep_quality: 'poor' }),
      ]
      const result = detectPatterns(checkins, 'pregnancy', 'Meera')
      expect(result.filter((r) => r.type === 'sleep')).toHaveLength(0)
    })

    it('fires for toddler stage', () => {
      const checkins = [
        makeCheckin({ checkin_date: '2026-03-18', sleep_quality: 'poor' }),
        makeCheckin({ checkin_date: '2026-03-17', sleep_quality: 'poor' }),
        makeCheckin({ checkin_date: '2026-03-16', sleep_quality: 'poor' }),
      ]
      const result = detectPatterns(checkins, 'toddler', 'Meera')
      expect(result).toEqual(expect.arrayContaining([expect.objectContaining({ type: 'sleep' })]))
    })
  })

  // ── FEEDING PATTERN: 3+ of last 5 days feeding=less ──

  describe('feeding pattern', () => {
    it('fires when 3 of last 5 days have feeding=less', () => {
      const checkins = [
        makeCheckin({ checkin_date: '2026-03-18', feeding: 'less' }),
        makeCheckin({ checkin_date: '2026-03-17', feeding: 'normal' }),
        makeCheckin({ checkin_date: '2026-03-16', feeding: 'less' }),
        makeCheckin({ checkin_date: '2026-03-15', feeding: 'less' }),
        makeCheckin({ checkin_date: '2026-03-14', feeding: 'normal' }),
      ]
      const result = detectPatterns(checkins, 'infant', 'Meera')
      expect(result).toEqual(expect.arrayContaining([expect.objectContaining({ type: 'feeding' })]))
    })

    it('fires when all 5 days have feeding=less', () => {
      const checkins = [
        makeCheckin({ checkin_date: '2026-03-18', feeding: 'less' }),
        makeCheckin({ checkin_date: '2026-03-17', feeding: 'less' }),
        makeCheckin({ checkin_date: '2026-03-16', feeding: 'less' }),
        makeCheckin({ checkin_date: '2026-03-15', feeding: 'less' }),
        makeCheckin({ checkin_date: '2026-03-14', feeding: 'less' }),
      ]
      const result = detectPatterns(checkins, 'infant', 'Meera')
      expect(result).toEqual(expect.arrayContaining([expect.objectContaining({ type: 'feeding' })]))
    })

    it('does NOT fire when only 2 of 5 days have feeding=less', () => {
      const checkins = [
        makeCheckin({ checkin_date: '2026-03-18', feeding: 'less' }),
        makeCheckin({ checkin_date: '2026-03-17', feeding: 'normal' }),
        makeCheckin({ checkin_date: '2026-03-16', feeding: 'normal' }),
        makeCheckin({ checkin_date: '2026-03-15', feeding: 'less' }),
        makeCheckin({ checkin_date: '2026-03-14', feeding: 'normal' }),
      ]
      const result = detectPatterns(checkins, 'infant', 'Meera')
      expect(result.filter((r) => r.type === 'feeding')).toHaveLength(0)
    })

    it('does NOT fire for pregnancy stage', () => {
      const checkins = [
        makeCheckin({ checkin_date: '2026-03-18', feeding: 'less' }),
        makeCheckin({ checkin_date: '2026-03-17', feeding: 'less' }),
        makeCheckin({ checkin_date: '2026-03-16', feeding: 'less' }),
      ]
      const result = detectPatterns(checkins, 'pregnancy', null)
      expect(result.filter((r) => r.type === 'feeding')).toHaveLength(0)
    })
  })

  // ── MOOD PATTERN: 4+ of last 5 days fussy/very_fussy ──

  describe('mood pattern', () => {
    it('fires when 4 of last 5 days are fussy or very_fussy', () => {
      const checkins = [
        makeCheckin({ checkin_date: '2026-03-18', mood: 'fussy' }),
        makeCheckin({ checkin_date: '2026-03-17', mood: 'very_fussy' }),
        makeCheckin({ checkin_date: '2026-03-16', mood: 'fussy' }),
        makeCheckin({ checkin_date: '2026-03-15', mood: 'fussy' }),
        makeCheckin({ checkin_date: '2026-03-14', mood: 'calm' }),
      ]
      const result = detectPatterns(checkins, 'infant', 'Meera')
      expect(result).toEqual(expect.arrayContaining([expect.objectContaining({ type: 'mood' })]))
    })

    it('fires when all 5 days are fussy', () => {
      const checkins = [
        makeCheckin({ checkin_date: '2026-03-18', mood: 'very_fussy' }),
        makeCheckin({ checkin_date: '2026-03-17', mood: 'fussy' }),
        makeCheckin({ checkin_date: '2026-03-16', mood: 'very_fussy' }),
        makeCheckin({ checkin_date: '2026-03-15', mood: 'fussy' }),
        makeCheckin({ checkin_date: '2026-03-14', mood: 'fussy' }),
      ]
      const result = detectPatterns(checkins, 'infant', 'Meera')
      expect(result).toEqual(expect.arrayContaining([expect.objectContaining({ type: 'mood' })]))
    })

    it('does NOT fire when only 3 of 5 days are fussy', () => {
      const checkins = [
        makeCheckin({ checkin_date: '2026-03-18', mood: 'fussy' }),
        makeCheckin({ checkin_date: '2026-03-17', mood: 'calm' }),
        makeCheckin({ checkin_date: '2026-03-16', mood: 'fussy' }),
        makeCheckin({ checkin_date: '2026-03-15', mood: 'fussy' }),
        makeCheckin({ checkin_date: '2026-03-14', mood: 'calm' }),
      ]
      const result = detectPatterns(checkins, 'infant', 'Meera')
      expect(result.filter((r) => r.type === 'mood')).toHaveLength(0)
    })
  })

  // ── NAUSEA SEVERITY (pregnancy only) ──

  describe('nausea severity pattern (pregnancy)', () => {
    it('fires when 3 consecutive days have severe nausea', () => {
      const checkins = [
        makeCheckin({ checkin_date: '2026-03-18', nausea_level: 'severe' }),
        makeCheckin({ checkin_date: '2026-03-17', nausea_level: 'severe' }),
        makeCheckin({ checkin_date: '2026-03-16', nausea_level: 'severe' }),
      ]
      const result = detectPatterns(checkins, 'pregnancy', null)
      expect(result).toEqual(expect.arrayContaining([expect.objectContaining({ type: 'nausea_severity' })]))
    })

    it('does NOT fire when nausea is moderate', () => {
      const checkins = [
        makeCheckin({ checkin_date: '2026-03-18', nausea_level: 'moderate' }),
        makeCheckin({ checkin_date: '2026-03-17', nausea_level: 'severe' }),
        makeCheckin({ checkin_date: '2026-03-16', nausea_level: 'severe' }),
      ]
      const result = detectPatterns(checkins, 'pregnancy', null)
      expect(result.filter((r) => r.type === 'nausea_severity')).toHaveLength(0)
    })

    it('does NOT fire for infant stage even with severe nausea', () => {
      const checkins = [
        makeCheckin({ checkin_date: '2026-03-18', nausea_level: 'severe' }),
        makeCheckin({ checkin_date: '2026-03-17', nausea_level: 'severe' }),
        makeCheckin({ checkin_date: '2026-03-16', nausea_level: 'severe' }),
      ]
      const result = detectPatterns(checkins, 'infant', null)
      expect(result.filter((r) => r.type === 'nausea_severity')).toHaveLength(0)
    })
  })

  // ── PRENATAL ANXIETY (pregnancy only) ──

  describe('prenatal anxiety pattern (pregnancy)', () => {
    it('fires when 2 of last 5 days have distressed emotional_signal', () => {
      const checkins = [
        makeCheckin({ checkin_date: '2026-03-18', emotional_signal: 'distressed' }),
        makeCheckin({ checkin_date: '2026-03-17', emotional_signal: 'ok' }),
        makeCheckin({ checkin_date: '2026-03-16', emotional_signal: 'distressed' }),
        makeCheckin({ checkin_date: '2026-03-15', emotional_signal: 'ok' }),
        makeCheckin({ checkin_date: '2026-03-14', emotional_signal: 'ok' }),
      ]
      const result = detectPatterns(checkins, 'pregnancy', null)
      expect(result).toEqual(expect.arrayContaining([expect.objectContaining({ type: 'prenatal_anxiety' })]))
    })

    it('does NOT fire when only 1 of 5 days is distressed', () => {
      const checkins = [
        makeCheckin({ checkin_date: '2026-03-18', emotional_signal: 'distressed' }),
        makeCheckin({ checkin_date: '2026-03-17', emotional_signal: 'ok' }),
        makeCheckin({ checkin_date: '2026-03-16', emotional_signal: 'ok' }),
        makeCheckin({ checkin_date: '2026-03-15', emotional_signal: 'ok' }),
        makeCheckin({ checkin_date: '2026-03-14', emotional_signal: 'ok' }),
      ]
      const result = detectPatterns(checkins, 'pregnancy', null)
      expect(result.filter((r) => r.type === 'prenatal_anxiety')).toHaveLength(0)
    })

    it('does NOT fire for infant stage', () => {
      const checkins = [
        makeCheckin({ checkin_date: '2026-03-18', emotional_signal: 'distressed' }),
        makeCheckin({ checkin_date: '2026-03-17', emotional_signal: 'distressed' }),
        makeCheckin({ checkin_date: '2026-03-16', emotional_signal: 'distressed' }),
      ]
      const result = detectPatterns(checkins, 'infant', null)
      expect(result.filter((r) => r.type === 'prenatal_anxiety')).toHaveLength(0)
    })
  })

  // ── MULTIPLE PATTERNS ──

  describe('multiple patterns detected simultaneously', () => {
    it('detects both sleep and feeding patterns at once', () => {
      const checkins = [
        makeCheckin({ checkin_date: '2026-03-18', sleep_quality: 'poor', feeding: 'less' }),
        makeCheckin({ checkin_date: '2026-03-17', sleep_quality: 'poor', feeding: 'less' }),
        makeCheckin({ checkin_date: '2026-03-16', sleep_quality: 'poor', feeding: 'less' }),
      ]
      const result = detectPatterns(checkins, 'infant', 'Meera')
      expect(result.map((r) => r.type)).toContain('sleep')
      expect(result.map((r) => r.type)).toContain('feeding')
    })

    it('detects sleep, feeding, and mood patterns together', () => {
      const checkins = [
        makeCheckin({ checkin_date: '2026-03-18', sleep_quality: 'poor', feeding: 'less', mood: 'fussy' }),
        makeCheckin({ checkin_date: '2026-03-17', sleep_quality: 'poor', feeding: 'less', mood: 'very_fussy' }),
        makeCheckin({ checkin_date: '2026-03-16', sleep_quality: 'poor', feeding: 'less', mood: 'fussy' }),
        makeCheckin({ checkin_date: '2026-03-15', feeding: 'normal', mood: 'fussy' }),
        makeCheckin({ checkin_date: '2026-03-14', feeding: 'normal', mood: 'calm' }),
      ]
      const result = detectPatterns(checkins, 'infant', 'Meera')
      expect(result.map((r) => r.type)).toContain('sleep')
      expect(result.map((r) => r.type)).toContain('feeding')
      expect(result.map((r) => r.type)).toContain('mood')
    })

    it('detects both pregnancy patterns at once', () => {
      const checkins = [
        makeCheckin({ checkin_date: '2026-03-18', nausea_level: 'severe', emotional_signal: 'distressed' }),
        makeCheckin({ checkin_date: '2026-03-17', nausea_level: 'severe', emotional_signal: 'distressed' }),
        makeCheckin({ checkin_date: '2026-03-16', nausea_level: 'severe', emotional_signal: 'ok' }),
      ]
      const result = detectPatterns(checkins, 'pregnancy', null)
      expect(result.map((r) => r.type)).toContain('nausea_severity')
      expect(result.map((r) => r.type)).toContain('prenatal_anxiety')
    })
  })

  // ── SORTING ──

  describe('internal sorting', () => {
    it('handles unsorted input correctly', () => {
      const checkins = [
        makeCheckin({ checkin_date: '2026-03-16', sleep_quality: 'poor' }),
        makeCheckin({ checkin_date: '2026-03-18', sleep_quality: 'poor' }),
        makeCheckin({ checkin_date: '2026-03-17', sleep_quality: 'poor' }),
      ]
      const result = detectPatterns(checkins, 'infant', 'Meera')
      expect(result).toEqual(expect.arrayContaining([expect.objectContaining({ type: 'sleep' })]))
    })

    it('handles duplicate dates without crashing', () => {
      const checkins = [
        makeCheckin({ checkin_date: '2026-03-18', sleep_quality: 'poor' }),
        makeCheckin({ checkin_date: '2026-03-18', sleep_quality: 'poor' }),
        makeCheckin({ checkin_date: '2026-03-17', sleep_quality: 'poor' }),
      ]
      const result = detectPatterns(checkins, 'infant', 'Meera')
      expect(result).toEqual(expect.arrayContaining([expect.objectContaining({ type: 'sleep' })]))
    })
  })
})

// ── checkCooldown ────────────────────────────────────────────────────────

describe('checkCooldown', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-18T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('allows pattern when no recent patterns exist', () => {
    expect(checkCooldown([], 'sleep')).toBe(true)
  })

  it('blocks pattern fired 1 day ago (within 3-day cooldown)', () => {
    const recent = [{ pattern_type: 'sleep', triggered_at: '2026-03-17T12:00:00Z' }]
    expect(checkCooldown(recent, 'sleep')).toBe(false)
  })

  it('blocks pattern fired exactly 2 days ago', () => {
    const recent = [{ pattern_type: 'sleep', triggered_at: '2026-03-16T12:00:00Z' }]
    expect(checkCooldown(recent, 'sleep')).toBe(false)
  })

  it('allows pattern fired exactly 3 days ago (at boundary)', () => {
    const recent = [{ pattern_type: 'sleep', triggered_at: '2026-03-15T12:00:00Z' }]
    expect(checkCooldown(recent, 'sleep')).toBe(true)
  })

  it('allows pattern fired 4 days ago', () => {
    const recent = [{ pattern_type: 'sleep', triggered_at: '2026-03-14T12:00:00Z' }]
    expect(checkCooldown(recent, 'sleep')).toBe(true)
  })

  it('cooldown is per pattern_type', () => {
    const recent = [{ pattern_type: 'feeding', triggered_at: '2026-03-17T12:00:00Z' }]
    expect(checkCooldown(recent, 'sleep')).toBe(true)
    expect(checkCooldown(recent, 'feeding')).toBe(false)
  })

  it('respects custom cooldown days (shorter)', () => {
    const recent = [{ pattern_type: 'sleep', triggered_at: '2026-03-16T12:00:00Z' }]
    expect(checkCooldown(recent, 'sleep', 1)).toBe(true)
  })

  it('respects custom cooldown days (longer)', () => {
    const recent = [{ pattern_type: 'sleep', triggered_at: '2026-03-16T12:00:00Z' }]
    expect(checkCooldown(recent, 'sleep', 5)).toBe(false)
  })

  // ── Input validation guards ──

  it('allows pattern when recentPatterns is null', () => {
    expect(checkCooldown(null as unknown as { pattern_type: string; triggered_at: string }[], 'sleep')).toBe(true)
  })

  it('allows pattern when type is null/empty', () => {
    const recent = [{ pattern_type: 'sleep', triggered_at: '2026-03-17T12:00:00Z' }]
    expect(checkCooldown(recent, '' as 'sleep')).toBe(true)
  })

  it('handles invalid triggered_at date (ignores that entry)', () => {
    const recent = [{ pattern_type: 'sleep', triggered_at: 'not-a-date' }]
    expect(checkCooldown(recent, 'sleep')).toBe(true)
  })

  it('handles negative cooldown days (defaults to 3)', () => {
    const recent = [{ pattern_type: 'sleep', triggered_at: '2026-03-17T12:00:00Z' }]
    expect(checkCooldown(recent, 'sleep', -1)).toBe(false)
  })

  it('handles non-number cooldown days (defaults to 3)', () => {
    const recent = [{ pattern_type: 'sleep', triggered_at: '2026-03-17T12:00:00Z' }]
    expect(checkCooldown(recent, 'sleep', 'abc' as unknown as number)).toBe(false)
  })

  it('handles entry with null pattern_type (ignores it)', () => {
    const recent = [{ pattern_type: null as unknown as string, triggered_at: '2026-03-17T12:00:00Z' }]
    expect(checkCooldown(recent, 'sleep')).toBe(true)
  })

  it('handles entry with null triggered_at (ignores it)', () => {
    const recent = [{ pattern_type: 'sleep', triggered_at: null as unknown as string }]
    expect(checkCooldown(recent, 'sleep')).toBe(true)
  })
})

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock baby-age before importing context-builder
vi.mock('@/lib/baby-age', () => ({
  getBabyAgeInfo: vi.fn(),
  getTimeOfDay: vi.fn(() => ({ label: 'afternoon', display: 'Afternoon' })),
}))

import { buildContextBlock } from '@/lib/context-builder'
import { getBabyAgeInfo, getTimeOfDay } from '@/lib/baby-age'

const mockGetBabyAgeInfo = getBabyAgeInfo as ReturnType<typeof vi.fn>
const mockGetTimeOfDay = getTimeOfDay as ReturnType<typeof vi.fn>

// Helper to create a mock Supabase client with configurable responses
function createMockSupabase(overrides: {
  babyData?: Record<string, unknown> | null
  babyError?: { message: string } | null
  membersData?: Record<string, unknown>[] | null
  summaryData?: { content: Record<string, string> } | null
  checkinsData?: Record<string, unknown>[] | null
  concernData?: Record<string, unknown> | null
  patternsData?: Record<string, unknown>[] | null
} = {}) {
  const {
    babyData = { id: 'baby-1', name: 'Meera', due_date: null, date_of_birth: '2026-01-01', stage: 'infant' },
    babyError = null,
    membersData = [
      {
        profile_id: 'profile-1',
        profiles: { id: 'profile-1', first_name: 'Sarah', first_time_parent: true, emotional_state_latest: 'tired' },
      },
    ],
    summaryData = null,
    checkinsData = [],
    concernData = null,
    patternsData = [],
  } = overrides

  return {
    from: vi.fn((table: string) => {
      if (table === 'baby_profiles') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: babyData, error: babyError }),
            })),
          })),
        }
      }
      if (table === 'baby_profile_members') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({ data: membersData }),
          })),
        }
      }
      if (table === 'weekly_summaries') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => ({
                limit: vi.fn(() => ({
                  maybeSingle: vi.fn().mockResolvedValue({ data: summaryData }),
                })),
              })),
            })),
          })),
        }
      }
      if (table === 'daily_checkins') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => ({
                limit: vi.fn().mockResolvedValue({ data: checkinsData }),
              })),
            })),
          })),
        }
      }
      if (table === 'concern_sessions') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => ({
                limit: vi.fn(() => ({
                  maybeSingle: vi.fn().mockResolvedValue({ data: concernData }),
                })),
              })),
            })),
          })),
        }
      }
      if (table === 'pattern_observations') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => ({
                limit: vi.fn().mockResolvedValue({ data: patternsData }),
              })),
            })),
          })),
        }
      }
      return {}
    }),
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockGetBabyAgeInfo.mockReturnValue({
    stage: 'infant',
    age_in_weeks: 11,
    age_in_months: 2,
    age_display_string: 'Meera · 11 weeks · 2 months',
  })
  mockGetTimeOfDay.mockReturnValue({ label: 'afternoon', display: 'Afternoon' })
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('buildContextBlock', () => {
  // ── Happy paths ──

  it('builds context for infant stage with minimal data', async () => {
    const supabase = createMockSupabase()
    const result = await buildContextBlock(supabase as never, 'baby-1', 'profile-1')
    expect(result).toContain('Meera')
    expect(result).toContain('11 weeks')
    expect(result).toContain('Sarah')
    expect(result).toContain('First-time parents: Yes')
    expect(result).toContain('Afternoon')
  })

  it('builds context for pregnancy stage', async () => {
    mockGetBabyAgeInfo.mockReturnValue({
      stage: 'pregnancy',
      pregnancy_week: 28,
      trimester: 3,
      days_until_due: 84,
      age_display_string: 'Week 28 · Trimester 3',
    })
    const supabase = createMockSupabase({
      babyData: { id: 'baby-1', name: null, due_date: '2026-06-10', date_of_birth: null, stage: 'pregnancy' },
    })
    const result = await buildContextBlock(supabase as never, 'baby-1', 'profile-1')
    expect(result).toContain('Pregnancy')
    expect(result).toContain('Week 28')
    expect(result).toContain('2026-06-10')
  })

  it('includes weekly summary when available', async () => {
    const supabase = createMockSupabase({
      summaryData: { content: { sleep_trend: 'improving', feeding_pattern: 'normal' } },
    })
    const result = await buildContextBlock(supabase as never, 'baby-1', 'profile-1')
    expect(result).toContain("This week's summary:")
    expect(result).toContain('sleep trend: improving')
    expect(result).toContain('feeding pattern: normal')
  })

  it('shows "Not yet generated" when no weekly summary', async () => {
    const supabase = createMockSupabase({ summaryData: null })
    const result = await buildContextBlock(supabase as never, 'baby-1', 'profile-1')
    expect(result).toContain('Not yet generated')
  })

  it('includes recent checkins for infant stage', async () => {
    const supabase = createMockSupabase({
      checkinsData: [
        { checkin_date: '2026-03-18', sleep_quality: 'poor', feeding: 'normal', mood: 'fussy' },
        { checkin_date: '2026-03-17', sleep_quality: 'ok', feeding: 'less', mood: 'calm' },
      ],
    })
    const result = await buildContextBlock(supabase as never, 'baby-1', 'profile-1')
    expect(result).toContain('Last 2 check-ins')
    expect(result).toContain('sleep=poor')
    expect(result).toContain('feeding=normal')
    expect(result).toContain('mood=fussy')
  })

  it('includes recent checkins for pregnancy stage', async () => {
    mockGetBabyAgeInfo.mockReturnValue({
      stage: 'pregnancy',
      pregnancy_week: 20,
      age_display_string: 'Week 20 · Trimester 2',
    })
    const supabase = createMockSupabase({
      babyData: { id: 'baby-1', name: null, due_date: '2026-08-01', date_of_birth: null, stage: 'pregnancy' },
      checkinsData: [
        { checkin_date: '2026-03-18', nausea_level: 'moderate', energy_level: 'low', kept_food_down: true },
      ],
    })
    const result = await buildContextBlock(supabase as never, 'baby-1', 'profile-1')
    expect(result).toContain('nausea=moderate')
    expect(result).toContain('energy=low')
  })

  it('includes latest concern session', async () => {
    const supabase = createMockSupabase({
      concernData: {
        concern_type: 'sleep_regression',
        created_at: '2026-03-17T10:00:00Z',
        ai_summary: { likely_causes: ['growth spurt'] },
      },
    })
    const result = await buildContextBlock(supabase as never, 'baby-1', 'profile-1')
    expect(result).toContain('Most recent concern: sleep_regression')
    expect(result).toContain('2026-03-17')
  })

  it('includes pattern observations', async () => {
    const supabase = createMockSupabase({
      patternsData: [
        { pattern_type: 'sleep', message_text: '3 days of poor sleep' },
        { pattern_type: 'feeding', message_text: 'Feeding less than usual' },
      ],
    })
    const result = await buildContextBlock(supabase as never, 'baby-1', 'profile-1')
    expect(result).toContain('Recent pattern flags')
    expect(result).toContain('sleep: 3 days of poor sleep')
    expect(result).toContain('feeding: Feeding less than usual')
  })

  it('includes emotional state', async () => {
    const supabase = createMockSupabase()
    const result = await buildContextBlock(supabase as never, 'baby-1', 'profile-1')
    expect(result).toContain("Sarah's emotional state: tired")
  })

  it('includes partner/other parent when available', async () => {
    const supabase = createMockSupabase({
      membersData: [
        {
          profile_id: 'profile-1',
          profiles: { id: 'profile-1', first_name: 'Sarah', first_time_parent: true, emotional_state_latest: 'tired' },
        },
        {
          profile_id: 'profile-2',
          profiles: { id: 'profile-2', first_name: 'James', first_time_parent: true, emotional_state_latest: 'ok' },
        },
      ],
    })
    const result = await buildContextBlock(supabase as never, 'baby-1', 'profile-1')
    expect(result).toContain('Sarah (current) and James')
    expect(result).toContain("James's emotional state: ok")
  })

  it('includes time of day in context', async () => {
    mockGetTimeOfDay.mockReturnValue({ label: 'late_night', display: 'Late night' })
    const supabase = createMockSupabase()
    const result = await buildContextBlock(supabase as never, 'baby-1', 'profile-1')
    expect(result).toContain('Time of day: Late night')
  })

  // ── Error handling ──

  it('throws when baby profile is not found', async () => {
    const supabase = createMockSupabase({ babyData: null })
    await expect(buildContextBlock(supabase as never, 'baby-1', 'profile-1')).rejects.toThrow(
      'Baby profile not found'
    )
  })

  // ── Edge cases with partial/missing data ──

  it('handles empty members list gracefully', async () => {
    const supabase = createMockSupabase({ membersData: [] })
    const result = await buildContextBlock(supabase as never, 'baby-1', 'profile-1')
    expect(result).toContain('Parent (current)')
    expect(result).toContain("Parent's emotional state: unknown")
  })

  it('handles null members data gracefully', async () => {
    const supabase = createMockSupabase({ membersData: null })
    const result = await buildContextBlock(supabase as never, 'baby-1', 'profile-1')
    expect(result).toContain('Parent')
  })

  it('handles empty checkins gracefully', async () => {
    const supabase = createMockSupabase({ checkinsData: [] })
    const result = await buildContextBlock(supabase as never, 'baby-1', 'profile-1')
    // Should not contain "Last X check-ins" section
    expect(result).not.toContain('Last 0 check-ins')
  })

  it('handles null checkins data gracefully', async () => {
    const supabase = createMockSupabase({ checkinsData: null })
    const result = await buildContextBlock(supabase as never, 'baby-1', 'profile-1')
    expect(result).toBeDefined()
  })

  it('handles null patterns data gracefully', async () => {
    const supabase = createMockSupabase({ patternsData: null })
    const result = await buildContextBlock(supabase as never, 'baby-1', 'profile-1')
    expect(result).toBeDefined()
    expect(result).not.toContain('Recent pattern flags')
  })

  it('handles no concern session gracefully', async () => {
    const supabase = createMockSupabase({ concernData: null })
    const result = await buildContextBlock(supabase as never, 'baby-1', 'profile-1')
    expect(result).not.toContain('Most recent concern')
  })

  it('handles baby with no name (uses "Baby" fallback)', async () => {
    mockGetBabyAgeInfo.mockReturnValue({
      stage: 'infant',
      age_in_weeks: 5,
      age_in_months: 1,
      age_display_string: 'Baby · 5 weeks · 1 months',
    })
    const supabase = createMockSupabase({
      babyData: { id: 'baby-1', name: null, due_date: null, date_of_birth: '2026-02-13', stage: 'infant' },
    })
    const result = await buildContextBlock(supabase as never, 'baby-1', 'profile-1')
    expect(result).toContain('Baby')
  })

  it('handles parent with no first_name', async () => {
    const supabase = createMockSupabase({
      membersData: [
        {
          profile_id: 'profile-1',
          profiles: { id: 'profile-1', first_name: null, first_time_parent: false, emotional_state_latest: null },
        },
      ],
    })
    const result = await buildContextBlock(supabase as never, 'baby-1', 'profile-1')
    // Should use "Parent" fallback
    expect(result).toContain('Parent')
  })

  it('handles null emotional_state_latest', async () => {
    const supabase = createMockSupabase({
      membersData: [
        {
          profile_id: 'profile-1',
          profiles: { id: 'profile-1', first_name: 'Sarah', first_time_parent: true, emotional_state_latest: null },
        },
      ],
    })
    const result = await buildContextBlock(supabase as never, 'baby-1', 'profile-1')
    expect(result).toContain("Sarah's emotional state: unknown")
  })

  it('handles concern_session with missing created_at', async () => {
    const supabase = createMockSupabase({
      concernData: {
        concern_type: 'fever',
        created_at: null,
        ai_summary: null,
      },
    })
    const result = await buildContextBlock(supabase as never, 'baby-1', 'profile-1')
    expect(result).toContain('Most recent concern: fever')
    expect(result).toContain('unknown date')
  })

  it('handles checkin fields with n/a values', async () => {
    const supabase = createMockSupabase({
      checkinsData: [
        { checkin_date: '2026-03-18', sleep_quality: null, feeding: null, mood: null },
      ],
    })
    const result = await buildContextBlock(supabase as never, 'baby-1', 'profile-1')
    expect(result).toContain('sleep=n/a')
    expect(result).toContain('feeding=n/a')
    expect(result).toContain('mood=n/a')
  })

  it('handles pregnancy checkin fields with n/a values', async () => {
    mockGetBabyAgeInfo.mockReturnValue({
      stage: 'pregnancy',
      pregnancy_week: 20,
      age_display_string: 'Week 20 · Trimester 2',
    })
    const supabase = createMockSupabase({
      babyData: { id: 'baby-1', name: null, due_date: '2026-08-01', date_of_birth: null, stage: 'pregnancy' },
      checkinsData: [
        { checkin_date: '2026-03-18', nausea_level: null, energy_level: null, kept_food_down: null },
      ],
    })
    const result = await buildContextBlock(supabase as never, 'baby-1', 'profile-1')
    expect(result).toContain('nausea=n/a')
    expect(result).toContain('energy=n/a')
    expect(result).toContain('kept_food=n/a')
  })

  it('handles pregnancy with missing pregnancy_week', async () => {
    mockGetBabyAgeInfo.mockReturnValue({
      stage: 'pregnancy',
      age_display_string: 'Pregnancy',
    })
    const supabase = createMockSupabase({
      babyData: { id: 'baby-1', name: null, due_date: null, date_of_birth: null, stage: 'pregnancy' },
    })
    const result = await buildContextBlock(supabase as never, 'baby-1', 'profile-1')
    expect(result).toContain('Week ?')
  })

  it('includes "First-time parents: No" for non-first-time parents', async () => {
    const supabase = createMockSupabase({
      membersData: [
        {
          profile_id: 'profile-1',
          profiles: { id: 'profile-1', first_name: 'Sarah', first_time_parent: false, emotional_state_latest: 'ok' },
        },
      ],
    })
    const result = await buildContextBlock(supabase as never, 'baby-1', 'profile-1')
    expect(result).toContain('First-time parents: No')
  })

  it('identifies current session parent', async () => {
    const supabase = createMockSupabase()
    const result = await buildContextBlock(supabase as never, 'baby-1', 'profile-1')
    expect(result).toContain('Current session parent: Sarah')
  })
})

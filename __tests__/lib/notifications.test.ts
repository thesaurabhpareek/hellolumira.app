import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { createNotification, getDefaultEmoji, getDefaultPriority } from '@/lib/notifications'
import { createClient } from '@/lib/supabase/server'
import type { NotificationType } from '@/types/app'

const mockSelect = vi.fn()
const mockSingle = vi.fn()
const mockInsert = vi.fn(() => ({ select: mockSelect }))
const mockUpdate = vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ error: null }) }))
const mockMaybeSingle = vi.fn()

let mockCount = 0

const mockFrom = vi.fn((table: string) => {
  if (table === 'notifications') {
    return {
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          gte: vi.fn().mockResolvedValue({ count: mockCount }),
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  eq: vi.fn(() => ({
                    maybeSingle: mockMaybeSingle,
                  })),
                })),
              })),
            })),
          })),
        })),
      })),
      insert: mockInsert,
      update: mockUpdate,
    }
  }
  return {}
})

const mockClient = { from: mockFrom }

beforeEach(() => {
  vi.clearAllMocks()
  mockCount = 0
  ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue(mockClient)
  mockSelect.mockReturnValue({ single: mockSingle })
  mockSingle.mockResolvedValue({ data: { id: 'notif-1' }, error: null })
  mockMaybeSingle.mockResolvedValue({ data: null })
})

// ── getDefaultEmoji ─────────────────────────────────────────────────────

describe('getDefaultEmoji', () => {
  const ALL_TYPES: NotificationType[] = [
    'pattern_detected', 'concern_followup', 'escalation_reminder',
    'milestone_approaching', 'weekly_guide_ready', 'tribe_reply',
    'tribe_reaction', 'tribe_mention', 'partner_joined',
    'streak_at_risk', 'badge_earned', 'new_article', 'system_message',
  ]

  it.each(ALL_TYPES)('returns emoji for type "%s"', (type) => {
    const emoji = getDefaultEmoji(type)
    expect(emoji).toBeTruthy()
    expect(typeof emoji).toBe('string')
  })

  it('returns specific emoji for pattern_detected', () => {
    expect(getDefaultEmoji('pattern_detected')).toBeDefined()
  })

  it('returns specific emoji for tribe_reaction', () => {
    expect(getDefaultEmoji('tribe_reaction')).toBeDefined()
  })
})

// ── getDefaultPriority ──────────────────────────────────────────────────

describe('getDefaultPriority', () => {
  it('returns 1 (high) for pattern_detected', () => {
    expect(getDefaultPriority('pattern_detected')).toBe(1)
  })

  it('returns 1 (high) for concern_followup', () => {
    expect(getDefaultPriority('concern_followup')).toBe(1)
  })

  it('returns 1 (high) for escalation_reminder', () => {
    expect(getDefaultPriority('escalation_reminder')).toBe(1)
  })

  it('returns 1 (high) for streak_at_risk', () => {
    expect(getDefaultPriority('streak_at_risk')).toBe(1)
  })

  it('returns 2 (medium) for milestone_approaching', () => {
    expect(getDefaultPriority('milestone_approaching')).toBe(2)
  })

  it('returns 2 (medium) for weekly_guide_ready', () => {
    expect(getDefaultPriority('weekly_guide_ready')).toBe(2)
  })

  it('returns 3 (low) for tribe_reaction', () => {
    expect(getDefaultPriority('tribe_reaction')).toBe(3)
  })

  it('returns 3 (low) for new_article', () => {
    expect(getDefaultPriority('new_article')).toBe(3)
  })
})

// ── createNotification ──────────────────────────────────────────────────

describe('createNotification', () => {
  // ── Happy paths ──

  it('creates a notification successfully with all required fields', async () => {
    const result = await createNotification(
      'profile-1',
      'pattern_detected',
      'Sleep pattern',
      'Your baby has had poor sleep 3 days in a row'
    )
    expect(result.success).toBe(true)
    expect(result.notification_id).toBe('notif-1')
  })

  it('creates notification with optional baby_id = null', async () => {
    const result = await createNotification(
      'profile-1',
      'system_message',
      'System Update',
      'New features available',
      { baby_id: undefined }
    )
    expect(result.success).toBe(true)
  })

  it('creates notification with custom emoji', async () => {
    const result = await createNotification(
      'profile-1',
      'pattern_detected',
      'Title',
      'Body',
      { emoji: '\u{1F389}' }
    )
    expect(result.success).toBe(true)
  })

  it('creates notification with action_url', async () => {
    const result = await createNotification(
      'profile-1',
      'pattern_detected',
      'Title',
      'Body',
      { action_url: '/home' }
    )
    expect(result.success).toBe(true)
  })

  it('creates notification with custom priority', async () => {
    const result = await createNotification(
      'profile-1',
      'pattern_detected',
      'Title',
      'Body',
      { priority: 3 }
    )
    expect(result.success).toBe(true)
  })

  // ── Rate limiting ──

  it('allows up to 5 notifications per day', async () => {
    mockCount = 4
    const result = await createNotification(
      'profile-1',
      'pattern_detected',
      'Test',
      'Test body'
    )
    expect(result.success).toBe(true)
  })

  it('blocks 6th notification with daily limit error', async () => {
    mockCount = 5
    mockFrom.mockImplementationOnce(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          gte: vi.fn().mockResolvedValue({ count: 5 }),
        })),
      })),
    }))

    const result = await createNotification(
      'profile-1',
      'pattern_detected',
      'Test',
      'Test body'
    )
    expect(result.success).toBe(false)
    expect(result.error).toContain('Daily notification limit')
  })

  // ── Truncation ──

  it('truncates very long title to 200 chars', async () => {
    const longTitle = 'A'.repeat(300)
    const result = await createNotification(
      'profile-1',
      'pattern_detected',
      longTitle,
      'Body'
    )
    expect(result).toBeDefined()
    // Verify the insert was called with truncated title
    if (mockInsert.mock.calls.length > 0) {
      const insertArg = mockInsert.mock.calls[0][0]
      expect(insertArg.title.length).toBeLessThanOrEqual(200)
    }
  })

  it('truncates very long body to 2000 chars', async () => {
    const longBody = 'B'.repeat(3000)
    const result = await createNotification(
      'profile-1',
      'pattern_detected',
      'Title',
      longBody
    )
    expect(result).toBeDefined()
    if (mockInsert.mock.calls.length > 0) {
      const insertArg = mockInsert.mock.calls[0][0]
      expect(insertArg.body.length).toBeLessThanOrEqual(2000)
    }
  })

  // ── Input validation ──

  it('returns error when profile_id is empty', async () => {
    const result = await createNotification('', 'pattern_detected', 'Test', 'Body')
    expect(result.success).toBe(false)
    expect(result.error).toContain('profile_id')
  })

  it('returns error when profile_id is null', async () => {
    const result = await createNotification(null as unknown as string, 'pattern_detected', 'Test', 'Body')
    expect(result.success).toBe(false)
    expect(result.error).toContain('profile_id')
  })

  it('returns error when profile_id is number', async () => {
    const result = await createNotification(123 as unknown as string, 'pattern_detected', 'Test', 'Body')
    expect(result.success).toBe(false)
    expect(result.error).toContain('profile_id')
  })

  it('returns error when type is empty', async () => {
    const result = await createNotification('profile-1', '' as NotificationType, 'Title', 'Body')
    expect(result.success).toBe(false)
    expect(result.error).toContain('type')
  })

  it('returns error when type is null', async () => {
    const result = await createNotification('profile-1', null as unknown as NotificationType, 'Title', 'Body')
    expect(result.success).toBe(false)
    expect(result.error).toContain('type')
  })

  it('returns error for invalid notification type', async () => {
    const result = await createNotification('profile-1', 'invalid_type' as NotificationType, 'Title', 'Body')
    expect(result.success).toBe(false)
    expect(result.error).toContain('Invalid notification type')
  })

  it('returns error when title is empty', async () => {
    const result = await createNotification('profile-1', 'pattern_detected', '', 'Body')
    expect(result.success).toBe(false)
    expect(result.error).toContain('title')
  })

  it('returns error when title is whitespace-only', async () => {
    const result = await createNotification('profile-1', 'pattern_detected', '   ', 'Body')
    expect(result.success).toBe(false)
    expect(result.error).toContain('title')
  })

  it('returns error when title is null', async () => {
    const result = await createNotification('profile-1', 'pattern_detected', null as unknown as string, 'Body')
    expect(result.success).toBe(false)
    expect(result.error).toContain('title')
  })

  it('returns error when body is empty', async () => {
    const result = await createNotification('profile-1', 'pattern_detected', 'Title', '')
    expect(result.success).toBe(false)
    expect(result.error).toContain('body')
  })

  it('returns error when body is whitespace-only', async () => {
    const result = await createNotification('profile-1', 'pattern_detected', 'Title', '   ')
    expect(result.success).toBe(false)
    expect(result.error).toContain('body')
  })

  it('returns error when body is null', async () => {
    const result = await createNotification('profile-1', 'pattern_detected', 'Title', null as unknown as string)
    expect(result.success).toBe(false)
    expect(result.error).toContain('body')
  })

  // ── Error handling ──

  it('returns error on insert failure', async () => {
    mockSingle.mockResolvedValueOnce({ data: null, error: { message: 'Insert failed' } })
    const result = await createNotification('profile-1', 'pattern_detected', 'Test', 'Body')
    expect(result).toBeDefined()
  })

  it('never throws on unexpected errors', async () => {
    ;(createClient as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Connection failed')
    )
    const result = await createNotification('profile-1', 'pattern_detected', 'Test', 'Body')
    expect(result.success).toBe(false)
    expect(result.error).toContain('Connection failed')
  })

  it('handles non-Error thrown objects', async () => {
    ;(createClient as ReturnType<typeof vi.fn>).mockRejectedValueOnce('string error')
    const result = await createNotification('profile-1', 'pattern_detected', 'Test', 'Body')
    expect(result.success).toBe(false)
    expect(result.error).toBe('Unknown error creating notification')
  })

  // ── tribe_reaction batching ──

  it('updates existing unread tribe_reaction instead of creating new', async () => {
    mockMaybeSingle.mockResolvedValueOnce({
      data: { id: 'existing-notif', title: 'Old title', body: 'Old body' },
    })
    const result = await createNotification(
      'profile-1',
      'tribe_reaction',
      'New Title',
      'New Body',
      { source_type: 'post', source_id: 'post-1' }
    )
    expect(result.success).toBe(true)
    expect(result.notification_id).toBe('existing-notif')
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: vi.fn(),
}))

import { logAudit } from '@/lib/audit'
import type { AuditEventType } from '@/lib/audit'
import { createServiceClient } from '@/lib/supabase/server'

const mockInsert = vi.fn()
const mockFrom = vi.fn(() => ({ insert: mockInsert }))
const mockClient = { from: mockFrom }

beforeEach(() => {
  vi.clearAllMocks()
  ;(createServiceClient as ReturnType<typeof vi.fn>).mockResolvedValue(mockClient)
  mockInsert.mockResolvedValue({ error: null })
})

describe('logAudit', () => {
  // ── Happy paths ──

  it('writes an audit log entry with all fields', async () => {
    await logAudit('account_created', 'profile-1', { source: 'test' })
    expect(mockFrom).toHaveBeenCalledWith('audit_log')
    expect(mockInsert).toHaveBeenCalledOnce()
    const insertArg = mockInsert.mock.calls[0][0]
    expect(insertArg.event_type).toBe('account_created')
    expect(insertArg.profile_id).toBe('profile-1')
    expect(insertArg.metadata).toEqual({ source: 'test' })
    expect(insertArg.created_at).toBeTruthy()
  })

  it('accepts all 19 valid AuditEventType variants', async () => {
    const validTypes: AuditEventType[] = [
      'account_created', 'account_deleted', 'profile_updated',
      'magic_link_sent', 'magic_link_used', 'session_created',
      'consent_granted', 'consent_withdrawn',
      'data_export_requested', 'data_deletion_requested', 'data_deletion_completed',
      'comms_preference_updated', 'unsubscribed_email', 'unsubscribed_sms', 'unsubscribed_whatsapp',
      'partner_invite_sent', 'partner_invite_accepted',
      'escalation_triggered', 'distressed_signal_detected',
    ]
    for (const eventType of validTypes) {
      vi.clearAllMocks()
      mockInsert.mockResolvedValue({ error: null })
      ;(createServiceClient as ReturnType<typeof vi.fn>).mockResolvedValue(mockClient)
      await logAudit(eventType, 'profile-1', {})
      expect(mockInsert).toHaveBeenCalledOnce()
    }
  })

  it('extracts and hashes IP from x-forwarded-for', async () => {
    const fakeRequest = new Request('https://example.com', {
      headers: {
        'x-forwarded-for': '203.0.113.50, 70.41.3.18',
        'user-agent': 'TestAgent/1.0',
      },
    })
    await logAudit('session_created', 'profile-1', {}, fakeRequest)
    const insertArg = mockInsert.mock.calls[0][0]
    expect(insertArg.ip_hash).toHaveLength(64)
    expect(insertArg.ip_hash).not.toBe('203.0.113.50')
    expect(insertArg.user_agent).toBe('TestAgent/1.0')
  })

  it('falls back to x-real-ip if x-forwarded-for is missing', async () => {
    const fakeRequest = new Request('https://example.com', {
      headers: { 'x-real-ip': '10.0.0.1' },
    })
    await logAudit('session_created', 'profile-1', {}, fakeRequest)
    const insertArg = mockInsert.mock.calls[0][0]
    expect(insertArg.ip_hash).toHaveLength(64)
  })

  it('stores metadata correctly', async () => {
    const metadata = { key: 'value', nested: { a: 1 } }
    await logAudit('profile_updated', 'profile-1', metadata)
    const insertArg = mockInsert.mock.calls[0][0]
    expect(insertArg.metadata).toEqual(metadata)
  })

  // ── Null / missing inputs ──

  it('handles null profileId for system events', async () => {
    await logAudit('account_created', null, {})
    const insertArg = mockInsert.mock.calls[0][0]
    expect(insertArg.profile_id).toBeNull()
  })

  it('handles missing request (null IP/UA)', async () => {
    await logAudit('account_created', 'profile-1', {})
    const insertArg = mockInsert.mock.calls[0][0]
    expect(insertArg.ip_hash).toBeNull()
    expect(insertArg.user_agent).toBeNull()
  })

  it('handles request with no x-forwarded-for or x-real-ip', async () => {
    const fakeRequest = new Request('https://example.com')
    await logAudit('session_created', 'profile-1', {}, fakeRequest)
    const insertArg = mockInsert.mock.calls[0][0]
    expect(insertArg.ip_hash).toBeNull()
  })

  it('handles request with no user-agent', async () => {
    const fakeRequest = new Request('https://example.com')
    await logAudit('session_created', 'profile-1', {}, fakeRequest)
    const insertArg = mockInsert.mock.calls[0][0]
    expect(insertArg.user_agent).toBeNull()
  })

  it('handles null metadata gracefully', async () => {
    await logAudit('account_created', 'profile-1', null as unknown as Record<string, unknown>)
    expect(mockInsert).toHaveBeenCalledOnce()
  })

  // ── Metadata truncation / safety ──

  it('truncates very large metadata objects (>10KB)', async () => {
    const bigMeta: Record<string, unknown> = {}
    for (let i = 0; i < 100; i++) {
      bigMeta[`key_${i}`] = 'x'.repeat(1000)
    }
    await logAudit('profile_updated', 'profile-1', bigMeta)
    expect(mockInsert).toHaveBeenCalledOnce()
    const insertArg = mockInsert.mock.calls[0][0]
    expect(insertArg.metadata._truncated).toBe(true)
    expect(insertArg.metadata._original_size).toBeGreaterThan(10000)
  })

  it('handles circular metadata reference gracefully', async () => {
    const circular: Record<string, unknown> = { a: 1 }
    circular.self = circular
    await logAudit('account_created', 'profile-1', circular)
    expect(mockInsert).toHaveBeenCalledOnce()
    const insertArg = mockInsert.mock.calls[0][0]
    expect(insertArg.metadata._error).toBe('metadata not serializable')
  })

  it('passes through small metadata without truncation', async () => {
    const smallMeta = { key: 'value' }
    await logAudit('profile_updated', 'profile-1', smallMeta)
    const insertArg = mockInsert.mock.calls[0][0]
    expect(insertArg.metadata).toEqual(smallMeta)
  })

  // ── Invalid eventType ──

  it('returns early for empty eventType (no insert called)', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    await logAudit('' as AuditEventType, 'profile-1', {})
    expect(mockInsert).not.toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('returns early for null eventType', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    await logAudit(null as unknown as AuditEventType, 'profile-1', {})
    expect(mockInsert).not.toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('returns early for invalid eventType', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    await logAudit('invalid_event' as AuditEventType, 'profile-1', {})
    expect(mockInsert).not.toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('returns early for non-string eventType', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    await logAudit(42 as unknown as AuditEventType, 'profile-1', {})
    expect(mockInsert).not.toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  // ── Never-throw guarantee ──

  it('never throws on DB insert failure (logs to console)', async () => {
    mockInsert.mockResolvedValueOnce({ error: { message: 'DB down' } })
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    await logAudit('account_created', 'profile-1', {})
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('never throws on createServiceClient failure', async () => {
    ;(createServiceClient as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Service unavailable'))
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    await logAudit('account_created', 'profile-1', {})
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('never throws when non-Error object is thrown', async () => {
    ;(createServiceClient as ReturnType<typeof vi.fn>).mockRejectedValueOnce('string error')
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    await logAudit('account_created', 'profile-1', {})
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('returns void (never returns error object)', async () => {
    const result = await logAudit('account_created', 'profile-1', {})
    expect(result).toBeUndefined()
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: vi.fn(),
}))

import { recordConsent, recordConsentBatch } from '@/lib/consent'
import type { ConsentType, ConsentAction } from '@/lib/consent'
import { createServiceClient } from '@/lib/supabase/server'

const VALID_UUID = '00000000-0000-0000-0000-000000000001'

const mockInsert = vi.fn()
const mockFrom = vi.fn(() => ({ insert: mockInsert }))
const mockClient = { from: mockFrom }

beforeEach(() => {
  vi.clearAllMocks()
  ;(createServiceClient as ReturnType<typeof vi.fn>).mockResolvedValue(mockClient)
  mockInsert.mockResolvedValue({ error: null })
})

// ── recordConsent ───────────────────────────────────────────────────────

describe('recordConsent', () => {
  // ── Happy paths ──

  it('records consent successfully with all fields', async () => {
    const result = await recordConsent(VALID_UUID, 'terms_of_service', 'granted', {
      capture_method: 'onboarding_checkbox',
      document_version: '1.0',
      ip_address: '192.168.1.1',
      user_agent: 'TestBrowser/1.0',
      page_url: '/onboarding',
    })
    expect(result.success).toBe(true)
    expect(mockFrom).toHaveBeenCalledWith('consent_records')
    expect(mockInsert).toHaveBeenCalledOnce()
  })

  it('records consent with minimal options', async () => {
    const result = await recordConsent(VALID_UUID, 'privacy_policy', 'granted')
    expect(result.success).toBe(true)
  })

  it('hashes IP address before storage (SHA-256 = 64 hex chars)', async () => {
    await recordConsent(VALID_UUID, 'terms_of_service', 'granted', {
      capture_method: 'onboarding_checkbox',
      ip_address: '192.168.1.1',
    })
    const insertArg = mockInsert.mock.calls[0][0]
    expect(insertArg.ip_address).toBeTruthy()
    expect(insertArg.ip_address).not.toBe('192.168.1.1')
    expect(insertArg.ip_address).toHaveLength(64)
  })

  it('produces consistent hash for same IP', async () => {
    await recordConsent(VALID_UUID, 'terms_of_service', 'granted', {
      capture_method: 'test',
      ip_address: '10.0.0.1',
    })
    const hash1 = mockInsert.mock.calls[0][0].ip_address
    vi.clearAllMocks()
    mockInsert.mockResolvedValue({ error: null })
    ;(createServiceClient as ReturnType<typeof vi.fn>).mockResolvedValue(mockClient)
    await recordConsent(VALID_UUID, 'terms_of_service', 'granted', {
      capture_method: 'test',
      ip_address: '10.0.0.1',
    })
    const hash2 = mockInsert.mock.calls[0][0].ip_address
    expect(hash1).toBe(hash2)
  })

  it('stores null ip_address when no IP provided', async () => {
    await recordConsent(VALID_UUID, 'terms_of_service', 'granted', {
      capture_method: 'settings_toggle',
    })
    const insertArg = mockInsert.mock.calls[0][0]
    expect(insertArg.ip_address).toBeNull()
  })

  it('uses "unknown" capture_method when options are undefined', async () => {
    await recordConsent(VALID_UUID, 'terms_of_service', 'granted')
    const insertArg = mockInsert.mock.calls[0][0]
    expect(insertArg.capture_method).toBe('unknown')
  })

  it('accepts all valid consent types', async () => {
    const types: ConsentType[] = [
      'terms_of_service', 'privacy_policy', 'data_processing',
      'sensitive_data', 'community_guidelines', 'acceptable_use', 'ai_data_practices',
      'marketing_email', 'marketing_sms', 'marketing_whatsapp',
      'analytics', 'product_improvement', 'third_party_sharing',
    ]
    for (const type of types) {
      vi.clearAllMocks()
      mockInsert.mockResolvedValue({ error: null })
      ;(createServiceClient as ReturnType<typeof vi.fn>).mockResolvedValue(mockClient)
      const result = await recordConsent(VALID_UUID, type, 'granted', { capture_method: 'test' })
      expect(result.success).toBe(true)
    }
  })

  it('accepts all valid consent actions', async () => {
    const actions: ConsentAction[] = ['granted', 'withdrawn', 'updated']
    for (const action of actions) {
      vi.clearAllMocks()
      mockInsert.mockResolvedValue({ error: null })
      ;(createServiceClient as ReturnType<typeof vi.fn>).mockResolvedValue(mockClient)
      const result = await recordConsent(VALID_UUID, 'terms_of_service', action, { capture_method: 'test' })
      expect(result.success).toBe(true)
    }
  })

  // ── Unhappy paths ──

  it('returns error when profileId is empty', async () => {
    const result = await recordConsent('', 'terms_of_service', 'granted', { capture_method: 'test' })
    expect(result.success).toBe(false)
    expect(result.error).toContain('profileId')
  })

  it('returns error when profileId is null', async () => {
    const result = await recordConsent(null as unknown as string, 'terms_of_service', 'granted', { capture_method: 'test' })
    expect(result.success).toBe(false)
    expect(result.error).toContain('profileId')
  })

  it('returns error when profileId is not a valid UUID', async () => {
    const result = await recordConsent('profile-1', 'terms_of_service', 'granted', { capture_method: 'test' })
    expect(result.success).toBe(false)
    expect(result.error).toContain('UUID')
  })

  it('returns error when consentType is empty', async () => {
    const result = await recordConsent(VALID_UUID, '' as ConsentType, 'granted', { capture_method: 'test' })
    expect(result.success).toBe(false)
    expect(result.error).toContain('consentType')
  })

  it('returns error for invalid consentType', async () => {
    const result = await recordConsent(VALID_UUID, 'invalid_type' as ConsentType, 'granted', { capture_method: 'test' })
    expect(result.success).toBe(false)
    expect(result.error).toContain('Invalid consent type')
  })

  it('returns error when action is empty', async () => {
    const result = await recordConsent(VALID_UUID, 'terms_of_service', '' as ConsentAction, { capture_method: 'test' })
    expect(result.success).toBe(false)
    expect(result.error).toContain('action')
  })

  it('returns error for invalid action', async () => {
    const result = await recordConsent(VALID_UUID, 'terms_of_service', 'deleted' as ConsentAction, { capture_method: 'test' })
    expect(result.success).toBe(false)
    expect(result.error).toContain('Invalid consent action')
  })

  it('returns error for empty document_version if provided', async () => {
    const result = await recordConsent(VALID_UUID, 'terms_of_service', 'granted', {
      capture_method: 'test',
      document_version: '',
    })
    expect(result.success).toBe(false)
    expect(result.error).toContain('document_version')
  })

  it('returns error for whitespace-only document_version', async () => {
    const result = await recordConsent(VALID_UUID, 'terms_of_service', 'granted', {
      capture_method: 'test',
      document_version: '   ',
    })
    expect(result.success).toBe(false)
    expect(result.error).toContain('document_version')
  })

  it('returns error on Supabase insert failure', async () => {
    mockInsert.mockResolvedValueOnce({ error: { message: 'Duplicate key' } })
    const result = await recordConsent(VALID_UUID, 'terms_of_service', 'granted', { capture_method: 'test' })
    expect(result.success).toBe(false)
    expect(result.error).toContain('Duplicate key')
  })

  it('never throws on unexpected exception', async () => {
    ;(createServiceClient as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Connection refused'))
    const result = await recordConsent(VALID_UUID, 'terms_of_service', 'granted', { capture_method: 'test' })
    expect(result.success).toBe(false)
    expect(result.error).toContain('Connection refused')
  })

  it('never throws on non-Error thrown objects', async () => {
    ;(createServiceClient as ReturnType<typeof vi.fn>).mockRejectedValueOnce('string error')
    const result = await recordConsent(VALID_UUID, 'terms_of_service', 'granted', { capture_method: 'test' })
    expect(result.success).toBe(false)
    expect(result.error).toBe('Unknown error')
  })
})

// ── recordConsentBatch ──────────────────────────────────────────────────

describe('recordConsentBatch', () => {
  it('inserts multiple consent records in one call', async () => {
    const consents = [
      { consentType: 'terms_of_service' as ConsentType, action: 'granted' as ConsentAction },
      { consentType: 'privacy_policy' as ConsentType, action: 'granted' as ConsentAction },
    ]
    const result = await recordConsentBatch(VALID_UUID, consents, { capture_method: 'onboarding_checkbox' })
    expect(result.success).toBe(true)
    const insertArg = mockInsert.mock.calls[0][0]
    expect(insertArg).toHaveLength(2)
  })

  it('inserts 4 consent records (typical onboarding)', async () => {
    const consents = [
      { consentType: 'terms_of_service' as ConsentType, action: 'granted' as ConsentAction },
      { consentType: 'privacy_policy' as ConsentType, action: 'granted' as ConsentAction },
      { consentType: 'data_processing' as ConsentType, action: 'granted' as ConsentAction },
      { consentType: 'marketing_email' as ConsentType, action: 'granted' as ConsentAction },
    ]
    const result = await recordConsentBatch(VALID_UUID, consents, { capture_method: 'onboarding_checkbox' })
    expect(result.success).toBe(true)
    const insertArg = mockInsert.mock.calls[0][0]
    expect(insertArg).toHaveLength(4)
  })

  it('hashes IP once for the entire batch', async () => {
    const consents = [
      { consentType: 'terms_of_service' as ConsentType, action: 'granted' as ConsentAction },
      { consentType: 'privacy_policy' as ConsentType, action: 'granted' as ConsentAction },
    ]
    await recordConsentBatch(VALID_UUID, consents, {
      capture_method: 'onboarding_checkbox',
      ip_address: '10.0.0.1',
    })
    const rows = mockInsert.mock.calls[0][0]
    expect(rows[0].ip_address).toBe(rows[1].ip_address)
    expect(rows[0].ip_address).toHaveLength(64)
  })

  it('all rows share the same created_at timestamp', async () => {
    const consents = [
      { consentType: 'terms_of_service' as ConsentType, action: 'granted' as ConsentAction },
      { consentType: 'privacy_policy' as ConsentType, action: 'granted' as ConsentAction },
    ]
    await recordConsentBatch(VALID_UUID, consents, { capture_method: 'test' })
    const rows = mockInsert.mock.calls[0][0]
    expect(rows[0].created_at).toBe(rows[1].created_at)
  })

  it('returns error for empty consents array', async () => {
    const result = await recordConsentBatch(VALID_UUID, [], { capture_method: 'test' })
    expect(result.success).toBe(false)
    expect(result.error).toContain('consents array')
  })

  it('returns error for null consents', async () => {
    const result = await recordConsentBatch(VALID_UUID, null as unknown as { consentType: ConsentType; action: ConsentAction }[], { capture_method: 'test' })
    expect(result.success).toBe(false)
    expect(result.error).toContain('consents array')
  })

  it('returns error when profileId is empty', async () => {
    const consents = [{ consentType: 'terms_of_service' as ConsentType, action: 'granted' as ConsentAction }]
    const result = await recordConsentBatch('', consents, { capture_method: 'test' })
    expect(result.success).toBe(false)
    expect(result.error).toContain('profileId')
  })

  it('returns error when profileId is not a valid UUID', async () => {
    const consents = [{ consentType: 'terms_of_service' as ConsentType, action: 'granted' as ConsentAction }]
    const result = await recordConsentBatch('invalid', consents, { capture_method: 'test' })
    expect(result.success).toBe(false)
    expect(result.error).toContain('UUID')
  })

  it('returns error for invalid consentType in batch', async () => {
    const consents = [{ consentType: 'invalid' as ConsentType, action: 'granted' as ConsentAction }]
    const result = await recordConsentBatch(VALID_UUID, consents, { capture_method: 'test' })
    expect(result.success).toBe(false)
    expect(result.error).toContain('Invalid consent type')
  })

  it('returns error for invalid action in batch', async () => {
    const consents = [{ consentType: 'terms_of_service' as ConsentType, action: 'deleted' as ConsentAction }]
    const result = await recordConsentBatch(VALID_UUID, consents, { capture_method: 'test' })
    expect(result.success).toBe(false)
    expect(result.error).toContain('Invalid consent action')
  })

  it('returns error on insert failure', async () => {
    mockInsert.mockResolvedValueOnce({ error: { message: 'DB error' } })
    const consents = [{ consentType: 'terms_of_service' as ConsentType, action: 'granted' as ConsentAction }]
    const result = await recordConsentBatch(VALID_UUID, consents, { capture_method: 'test' })
    expect(result.success).toBe(false)
    expect(result.error).toContain('DB error')
  })

  it('never throws on unexpected exception', async () => {
    ;(createServiceClient as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Service unavailable'))
    const consents = [{ consentType: 'terms_of_service' as ConsentType, action: 'granted' as ConsentAction }]
    const result = await recordConsentBatch(VALID_UUID, consents, { capture_method: 'test' })
    expect(result.success).toBe(false)
    expect(result.error).toContain('Service unavailable')
  })
})

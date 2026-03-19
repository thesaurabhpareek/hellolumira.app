// __tests__/api/privacy.test.ts
// Unit tests for privacy API routes: consent-history, preferences, request-export, request-deletion
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockSelect = vi.fn()
const mockSingle = vi.fn()
const mockMaybeSingle = vi.fn()
const mockInsert = vi.fn()
const mockUpdate = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
    from: vi.fn((table: string) => {
      if (table === 'consent_records') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn().mockReturnValue(
              Object.assign(Promise.resolve({ data: [], error: null }), {
                order: vi.fn(() => ({
                  limit: vi.fn().mockResolvedValue({ data: [], error: null }),
                })),
                single: vi.fn().mockResolvedValue({ data: null }),
                maybeSingle: vi.fn().mockResolvedValue({ data: null }),
              })
            ),
          })),
          insert: mockInsert,
        }
      }
      if (table === 'privacy_preferences') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: mockSingle,
              maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'prefs-1' }, error: null }),
            })),
          })),
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({ data: { id: 'prefs-1' }, error: null }),
              })),
            })),
          })),
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: { id: 'prefs-1' }, error: null }),
            })),
          })),
        }
      }
      if (table === 'baby_profiles') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn().mockReturnValue(
              Object.assign(Promise.resolve({ data: [], error: null }), {
                single: vi.fn().mockResolvedValue({ data: null }),
                maybeSingle: vi.fn().mockResolvedValue({ data: null }),
              })
            ),
          })),
        }
      }
      if (table === 'baby_profile_members') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn().mockReturnValue(
              Object.assign(Promise.resolve({ data: [], error: null }), {
                single: vi.fn().mockResolvedValue({ data: null }),
                maybeSingle: vi.fn().mockResolvedValue({ data: null }),
              })
            ),
            in: vi.fn(() => ({
              neq: vi.fn().mockResolvedValue({ count: 0 }),
            })),
          })),
        }
      }
      // General fallback for profiles, daily_checkins, weekly_summaries, pattern_observations, etc
      return {
        select: vi.fn(() => ({
          eq: vi.fn().mockReturnValue(
            Object.assign(Promise.resolve({ data: [], error: null }), {
              single: vi.fn().mockResolvedValue({ data: null }),
              maybeSingle: vi.fn().mockResolvedValue({ data: null }),
            })
          ),
        })),
      }
    }),
  })),
  createServiceClient: vi.fn(async () => ({
    from: vi.fn((table: string) => {
      if (table === 'data_deletion_requests' || table === 'data_export_requests') {
        return {
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: { id: 'req-1', status: 'pending' },
                error: null,
              }),
            })),
          })),
          update: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({ error: null }),
          })),
        }
      }
      return {
        select: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({ data: [] }),
        })),
      }
    }),
  })),
}))

vi.mock('@/lib/consent', () => ({
  recordConsent: vi.fn().mockResolvedValue({ success: true }),
}))

vi.mock('@/lib/audit', () => ({
  logAudit: vi.fn().mockResolvedValue(undefined),
}))

import { GET as getConsentHistory } from '@/app/api/privacy/consent-history/route'
import { PUT as putPreferences } from '@/app/api/privacy/preferences/route'
import { POST as postExport } from '@/app/api/privacy/request-export/route'
import { POST as postDeletion } from '@/app/api/privacy/request-deletion/route'
import { NextRequest } from 'next/server'

function makeGetRequest(url = 'http://localhost/api/privacy/consent-history'): NextRequest {
  return new NextRequest(url, { method: 'GET' })
}

function makePutRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/privacy/preferences', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function makePostRequest(url: string, body: unknown): NextRequest {
  return new NextRequest(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

// ── consent-history GET ──────────────────────────────────────────────────

describe('GET /api/privacy/consent-history', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
  })

  it('returns 401 for unauthenticated user', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    const res = await getConsentHistory()
    expect(res.status).toBe(401)
  })

  it('returns 200 with records for authenticated user', async () => {
    const res = await getConsentHistory()
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.records).toBeDefined()
    expect(Array.isArray(json.records)).toBe(true)
  })
})

// ── preferences PUT ─────────────────────────────────────────────────────

describe('PUT /api/privacy/preferences', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockSingle.mockResolvedValue({ data: { id: 'prefs-1', analytics_enabled: true, ai_processing_enabled: true } })
  })

  it('returns 401 for unauthenticated user', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    const res = await putPreferences(makePutRequest({ analytics_enabled: true }))
    expect(res.status).toBe(401)
  })

  it('returns 400 for invalid JSON body', async () => {
    const req = new NextRequest('http://localhost/api/privacy/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json{',
    })
    const res = await putPreferences(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 for invalid data_retention_months', async () => {
    const res = await putPreferences(makePutRequest({ data_retention_months: 6 }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.message).toContain('data_retention_months')
  })

  it('returns 400 for non-boolean analytics_enabled', async () => {
    const res = await putPreferences(makePutRequest({ analytics_enabled: 'yes' }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.message).toContain('analytics_enabled')
  })

  it('returns 400 for non-boolean ai_processing_enabled', async () => {
    const res = await putPreferences(makePutRequest({ ai_processing_enabled: 1 }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.message).toContain('ai_processing_enabled')
  })

  it('accepts valid data_retention_months values (12, 24, 36)', async () => {
    for (const months of [12, 24, 36]) {
      vi.clearAllMocks()
      mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
      mockSingle.mockResolvedValue({ data: { id: 'prefs-1' } })
      const res = await putPreferences(makePutRequest({ data_retention_months: months }))
      expect(res.status).not.toBe(400)
    }
  })

  it('accepts boolean analytics_enabled', async () => {
    const res = await putPreferences(makePutRequest({ analytics_enabled: false }))
    expect(res.status).not.toBe(400)
  })
})

// ── request-export POST ─────────────────────────────────────────────────

describe('POST /api/privacy/request-export', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
  })

  it('returns 401 for unauthenticated user', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    const res = await postExport(makePostRequest('http://localhost/api/privacy/request-export', {}))
    expect(res.status).toBe(401)
  })

  it('returns 200 with request_id and download_token for authenticated user', async () => {
    const res = await postExport(makePostRequest('http://localhost/api/privacy/request-export', {}))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.request_id).toBeDefined()
    expect(json.status).toBe('ready')
    expect(json.download_token).toBeDefined()
    expect(typeof json.download_token).toBe('string')
    expect(json.expires_at).toBeDefined()
  })
})

// ── request-deletion POST ───────────────────────────────────────────────

describe('POST /api/privacy/request-deletion', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
  })

  it('returns 401 for unauthenticated user', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    const res = await postDeletion(makePostRequest('http://localhost/api/privacy/request-deletion', { confirmation: 'DELETE' }))
    expect(res.status).toBe(401)
  })

  it('returns 400 for invalid JSON body', async () => {
    const req = new NextRequest('http://localhost/api/privacy/request-deletion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json{',
    })
    const res = await postDeletion(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 when confirmation is missing', async () => {
    const res = await postDeletion(makePostRequest('http://localhost/api/privacy/request-deletion', {}))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.message).toContain('DELETE')
  })

  it('returns 400 when confirmation is wrong value', async () => {
    const res = await postDeletion(makePostRequest('http://localhost/api/privacy/request-deletion', { confirmation: 'delete' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when confirmation is empty string', async () => {
    const res = await postDeletion(makePostRequest('http://localhost/api/privacy/request-deletion', { confirmation: '' }))
    expect(res.status).toBe(400)
  })

  it('returns 200 with confirmation = "DELETE"', async () => {
    const res = await postDeletion(makePostRequest('http://localhost/api/privacy/request-deletion', { confirmation: 'DELETE' }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.request_id).toBeDefined()
    expect(json.status).toBe('pending_verification')
    expect(json.verification_token).toBeDefined()
    expect(typeof json.verification_token).toBe('string')
    expect(json.message).toContain('verify')
  })
})

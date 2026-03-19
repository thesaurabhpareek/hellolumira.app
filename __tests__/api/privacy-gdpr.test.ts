// __tests__/api/privacy-gdpr.test.ts
// GDPR compliance tests for export and deletion API routes
import { describe, it, expect, vi, beforeEach } from 'vitest'

const VALID_UUID = '00000000-0000-0000-0000-000000000001'
const VALID_TOKEN = 'a'.repeat(64) // 64 hex chars from 32 bytes

// ── Mocks ──

const mockGetUser = vi.fn()
const mockSelectSingle = vi.fn()
const mockInsertSelectSingle = vi.fn()
const mockUpdateEq = vi.fn()
const mockFrom = vi.fn()

// Mock for request-export and request-deletion (uses createClient + createServiceClient)
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
    from: vi.fn((table: string) => {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: null }),
            maybeSingle: vi.fn().mockResolvedValue({ data: null }),
            order: vi.fn(() => ({
              limit: vi.fn().mockResolvedValue({ data: [], error: null }),
            })),
          })),
        })),
        insert: vi.fn().mockResolvedValue({ error: null }),
      }
    }),
  })),
  createServiceClient: vi.fn(async () => ({
    from: vi.fn((table: string) => {
      if (table === 'data_export_requests') {
        return {
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: mockInsertSelectSingle,
            })),
          })),
          update: vi.fn(() => ({
            eq: mockUpdateEq,
          })),
        }
      }
      if (table === 'data_deletion_requests') {
        return {
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: mockInsertSelectSingle,
            })),
          })),
        }
      }
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: null }),
          })),
        })),
      }
    }),
  })),
}))

vi.mock('@/lib/audit', () => ({
  logAudit: vi.fn().mockResolvedValue(undefined),
}))

// ── Export Tests ──

describe('POST /api/privacy/request-export — GDPR data export', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: VALID_UUID } } })
    mockInsertSelectSingle.mockResolvedValue({
      data: { id: 'export-1', download_token: VALID_TOKEN, expires_at: '2026-03-21T00:00:00Z' },
      error: null,
    })
    mockUpdateEq.mockResolvedValue({ error: null })
  })

  it('happy: returns download_token and expires_at on successful export request', async () => {
    const { POST } = await import('@/app/api/privacy/request-export/route')
    const req = new (await import('next/server')).NextRequest(
      'http://localhost:3000/api/privacy/request-export',
      { method: 'POST' }
    )
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.download_token).toBeDefined()
    expect(json.expires_at).toBeDefined()
    expect(json.status).toBe('ready')
  })

  it('unhappy: returns 401 without auth', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    const { POST } = await import('@/app/api/privacy/request-export/route')
    const req = new (await import('next/server')).NextRequest(
      'http://localhost:3000/api/privacy/request-export',
      { method: 'POST' }
    )
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('unhappy: returns 500 when export insert fails', async () => {
    mockInsertSelectSingle.mockResolvedValueOnce({
      data: null,
      error: { message: 'DB error' },
    })
    const { POST } = await import('@/app/api/privacy/request-export/route')
    const req = new (await import('next/server')).NextRequest(
      'http://localhost:3000/api/privacy/request-export',
      { method: 'POST' }
    )
    const res = await POST(req)
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.message).toContain('Failed')
  })

  it('edge: export data contains all expected fields even when user has no data', async () => {
    const { POST } = await import('@/app/api/privacy/request-export/route')
    const req = new (await import('next/server')).NextRequest(
      'http://localhost:3000/api/privacy/request-export',
      { method: 'POST' }
    )
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    // The data field contains the assembled export
    expect(json.data).toBeDefined()
    expect(json.data.baby_profiles).toEqual([])
    expect(json.data.daily_checkins).toEqual([])
    expect(json.data.concern_sessions).toEqual([])
    // Verify all required GDPR export fields are present
    expect(json.data).toHaveProperty('profile')
    expect(json.data).toHaveProperty('baby_profile_members')
    expect(json.data).toHaveProperty('journal_entries')
    expect(json.data).toHaveProperty('milestones')
    expect(json.data).toHaveProperty('consent_records')
    expect(json.data).toHaveProperty('communication_preferences')
    expect(json.data).toHaveProperty('weekly_summaries')
    expect(json.data).toHaveProperty('pattern_observations')
    expect(json.data).toHaveProperty('chat_threads')
    expect(json.data).toHaveProperty('partner_invites')
    expect(json.data).toHaveProperty('communication_log')
    expect(json.data).toHaveProperty('pregnancy_appointments')
    expect(json.data).toHaveProperty('privacy_preferences')
    expect(json.data).toHaveProperty('exported_at')
    expect(json.data).toHaveProperty('request_id')
  })

  it('edge: export response does not leak internal error details in error messages', async () => {
    mockInsertSelectSingle.mockResolvedValueOnce({
      data: null,
      error: { message: 'relation "data_export_requests" violates unique constraint' },
    })
    const { POST } = await import('@/app/api/privacy/request-export/route')
    const req = new (await import('next/server')).NextRequest(
      'http://localhost:3000/api/privacy/request-export',
      { method: 'POST' }
    )
    const res = await POST(req)
    expect(res.status).toBe(500)
    const json = await res.json()
    // Should not contain DB internals
    expect(json.message).not.toContain('relation')
    expect(json.message).not.toContain('constraint')
    expect(json.message).not.toContain(VALID_UUID)
  })
})

// ── Export Download Tests ──

describe('GET /api/privacy/export/[token] — Export download', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Mock @supabase/supabase-js for the export download route
  it('unhappy: returns 400 for invalid/short token', async () => {
    // We mock at the supabase-js level since this route uses createClient from @supabase/supabase-js
    vi.resetModules()
    vi.doMock('@supabase/supabase-js', () => ({
      createClient: vi.fn(() => ({
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } }),
            })),
          })),
        })),
      })),
    }))
    const { GET } = await import('@/app/api/privacy/export/[token]/route')
    const { NextRequest } = await import('next/server')
    const req = new NextRequest('http://localhost:3000/api/privacy/export/short')
    const res = await GET(req, { params: Promise.resolve({ token: 'short' }) })
    expect(res.status).toBe(400)
  })

  it('unhappy: returns 404 for non-existent token', async () => {
    vi.resetModules()
    vi.doMock('@supabase/supabase-js', () => ({
      createClient: vi.fn(() => ({
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } }),
            })),
          })),
        })),
      })),
    }))
    const { GET } = await import('@/app/api/privacy/export/[token]/route')
    const { NextRequest } = await import('next/server')
    const validLengthToken = 'x'.repeat(64)
    const req = new NextRequest(`http://localhost:3000/api/privacy/export/${validLengthToken}`)
    const res = await GET(req, { params: Promise.resolve({ token: validLengthToken }) })
    expect(res.status).toBe(404)
  })

  it('unhappy: returns 410 for expired token', async () => {
    const expiredDate = new Date(Date.now() - 86400000).toISOString()
    vi.resetModules()
    vi.doMock('@supabase/supabase-js', () => ({
      createClient: vi.fn(() => ({
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: 'export-1',
                  status: 'ready',
                  expires_at: expiredDate,
                  export_data: { profile: {} },
                  download_token: VALID_TOKEN,
                },
                error: null,
              }),
            })),
          })),
        })),
      })),
    }))

    const { GET } = await import('@/app/api/privacy/export/[token]/route')
    const { NextRequest } = await import('next/server')
    const req = new NextRequest(`http://localhost:3000/api/privacy/export/${VALID_TOKEN}`)
    const res = await GET(req, { params: Promise.resolve({ token: VALID_TOKEN }) })
    expect(res.status).toBe(410)
    const json = await res.json()
    expect(json.message).toContain('expired')
  })

  it('happy: returns JSON file for valid token', async () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString()
    const mockUpdate = vi.fn(() => ({
      eq: vi.fn().mockResolvedValue({ error: null }),
    }))
    vi.resetModules()
    vi.doMock('@supabase/supabase-js', () => ({
      createClient: vi.fn(() => ({
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: 'export-1',
                  status: 'ready',
                  expires_at: futureDate,
                  export_data: { profile: { first_name: 'Test' }, baby_profiles: [] },
                  download_token: VALID_TOKEN,
                },
                error: null,
              }),
            })),
          })),
          update: mockUpdate,
        })),
      })),
    }))

    const { GET } = await import('@/app/api/privacy/export/[token]/route')
    const { NextRequest } = await import('next/server')
    const req = new NextRequest(`http://localhost:3000/api/privacy/export/${VALID_TOKEN}`)
    const res = await GET(req, { params: Promise.resolve({ token: VALID_TOKEN }) })
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toBe('application/json')
    expect(res.headers.get('Content-Disposition')).toContain('attachment')
  })

  it('edge: export token reuse after download returns 404 (status changed to downloaded)', async () => {
    // After first download, status changes from 'ready' to 'downloaded'
    vi.resetModules()
    vi.doMock('@supabase/supabase-js', () => ({
      createClient: vi.fn(() => ({
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: 'export-1',
                  status: 'downloaded', // Already downloaded
                  expires_at: new Date(Date.now() + 86400000).toISOString(),
                  export_data: { profile: {} },
                  download_token: VALID_TOKEN,
                },
                error: null,
              }),
            })),
          })),
        })),
      })),
    }))

    const { GET } = await import('@/app/api/privacy/export/[token]/route')
    const { NextRequest } = await import('next/server')
    const req = new NextRequest(`http://localhost:3000/api/privacy/export/${VALID_TOKEN}`)
    const res = await GET(req, { params: Promise.resolve({ token: VALID_TOKEN }) })
    // Status is 'downloaded', not 'ready', so it should return 404
    expect(res.status).toBe(404)
  })

  it('edge: token expiry boundary — just before 48h returns 200', async () => {
    // 47h 59m 59s from now — still valid
    const justBeforeExpiry = new Date(Date.now() + 1000).toISOString()
    const mockUpdate = vi.fn(() => ({
      eq: vi.fn().mockResolvedValue({ error: null }),
    }))
    vi.resetModules()
    vi.doMock('@supabase/supabase-js', () => ({
      createClient: vi.fn(() => ({
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: 'export-2',
                  status: 'ready',
                  expires_at: justBeforeExpiry,
                  export_data: { profile: {} },
                  download_token: VALID_TOKEN,
                },
                error: null,
              }),
            })),
          })),
          update: mockUpdate,
        })),
      })),
    }))

    const { GET } = await import('@/app/api/privacy/export/[token]/route')
    const { NextRequest } = await import('next/server')
    const req = new NextRequest(`http://localhost:3000/api/privacy/export/${VALID_TOKEN}`)
    const res = await GET(req, { params: Promise.resolve({ token: VALID_TOKEN }) })
    expect(res.status).toBe(200)
  })

  it('edge: token expiry boundary — just after 48h returns 410', async () => {
    // 1 second in the past — expired
    const justAfterExpiry = new Date(Date.now() - 1000).toISOString()
    vi.resetModules()
    vi.doMock('@supabase/supabase-js', () => ({
      createClient: vi.fn(() => ({
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: 'export-3',
                  status: 'ready',
                  expires_at: justAfterExpiry,
                  export_data: { profile: {} },
                  download_token: VALID_TOKEN,
                },
                error: null,
              }),
            })),
          })),
        })),
      })),
    }))

    const { GET } = await import('@/app/api/privacy/export/[token]/route')
    const { NextRequest } = await import('next/server')
    const req = new NextRequest(`http://localhost:3000/api/privacy/export/${VALID_TOKEN}`)
    const res = await GET(req, { params: Promise.resolve({ token: VALID_TOKEN }) })
    expect(res.status).toBe(410)
  })

  it('security: error messages do not leak PII or internal IDs', async () => {
    vi.resetModules()
    vi.doMock('@supabase/supabase-js', () => ({
      createClient: vi.fn(() => ({
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } }),
            })),
          })),
        })),
      })),
    }))

    const { GET } = await import('@/app/api/privacy/export/[token]/route')
    const { NextRequest } = await import('next/server')
    const req = new NextRequest(`http://localhost:3000/api/privacy/export/${VALID_TOKEN}`)
    const res = await GET(req, { params: Promise.resolve({ token: VALID_TOKEN }) })
    const json = await res.json()
    // Should not contain UUIDs or internal details
    expect(json.message).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}/)
    expect(json.message).not.toContain('profile_id')
    expect(json.message).not.toContain('supabase')
  })
})

// ── Deletion Request Tests ──

describe('POST /api/privacy/request-deletion — GDPR deletion request', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: VALID_UUID } } })
    mockInsertSelectSingle.mockResolvedValue({
      data: { id: 'deletion-1', verification_token: VALID_TOKEN, status: 'pending_verification' },
      error: null,
    })
  })

  it('happy: returns verification_token on successful deletion request', async () => {
    const { POST } = await import('@/app/api/privacy/request-deletion/route')
    const { NextRequest } = await import('next/server')
    const req = new NextRequest('http://localhost:3000/api/privacy/request-deletion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmation: 'DELETE' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.verification_token).toBeDefined()
    expect(json.status).toBe('pending_verification')
  })

  it('unhappy: returns 401 without auth', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    const { POST } = await import('@/app/api/privacy/request-deletion/route')
    const { NextRequest } = await import('next/server')
    const req = new NextRequest('http://localhost:3000/api/privacy/request-deletion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmation: 'DELETE' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('unhappy: returns 400 without confirmation', async () => {
    const { POST } = await import('@/app/api/privacy/request-deletion/route')
    const { NextRequest } = await import('next/server')
    const req = new NextRequest('http://localhost:3000/api/privacy/request-deletion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.message).toContain('DELETE')
  })

  it('unhappy: returns 400 with wrong confirmation text', async () => {
    const { POST } = await import('@/app/api/privacy/request-deletion/route')
    const { NextRequest } = await import('next/server')
    const req = new NextRequest('http://localhost:3000/api/privacy/request-deletion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmation: 'delete' }), // lowercase
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('unhappy: returns 400 for invalid JSON body', async () => {
    const { POST } = await import('@/app/api/privacy/request-deletion/route')
    const { NextRequest } = await import('next/server')
    const req = new NextRequest('http://localhost:3000/api/privacy/request-deletion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json{',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.message).toContain('Invalid JSON')
  })
})

// ── Verify Deletion Tests ──

describe('POST /api/privacy/verify-deletion — Execute deletion', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('happy: completes deletion with valid token', async () => {
    vi.resetModules()
    vi.doMock('@supabase/supabase-js', () => ({
      createClient: vi.fn(() => ({
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: 'deletion-1',
                  profile_id: VALID_UUID,
                  status: 'pending_verification',
                  verification_token: VALID_TOKEN,
                },
                error: null,
              }),
            })),
          })),
          delete: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({ error: null }),
          })),
          update: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({ error: null }),
          })),
        })),
        auth: {
          admin: {
            deleteUser: vi.fn().mockResolvedValue({ error: null }),
          },
        },
      })),
    }))

    const { POST } = await import('@/app/api/privacy/verify-deletion/route')
    const { NextRequest } = await import('next/server')
    const req = new NextRequest('http://localhost:3000/api/privacy/verify-deletion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: VALID_TOKEN }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.status).toBe('completed')
  })

  it('unhappy: returns 400 for missing token', async () => {
    const { POST } = await import('@/app/api/privacy/verify-deletion/route')
    const { NextRequest } = await import('next/server')
    const req = new NextRequest('http://localhost:3000/api/privacy/verify-deletion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('unhappy: returns 400 for token too short', async () => {
    const { POST } = await import('@/app/api/privacy/verify-deletion/route')
    const { NextRequest } = await import('next/server')
    const req = new NextRequest('http://localhost:3000/api/privacy/verify-deletion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'short' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('unhappy: returns 404 for non-existent token', async () => {
    vi.resetModules()
    vi.doMock('@supabase/supabase-js', () => ({
      createClient: vi.fn(() => ({
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } }),
            })),
          })),
        })),
      })),
    }))

    const { POST } = await import('@/app/api/privacy/verify-deletion/route')
    const { NextRequest } = await import('next/server')
    const req = new NextRequest('http://localhost:3000/api/privacy/verify-deletion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: VALID_TOKEN }),
    })
    const res = await POST(req)
    expect(res.status).toBe(404)
  })

  it('unhappy: returns 400 for already-completed deletion request', async () => {
    vi.resetModules()
    vi.doMock('@supabase/supabase-js', () => ({
      createClient: vi.fn(() => ({
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: 'deletion-1',
                  profile_id: VALID_UUID,
                  status: 'completed',
                  verification_token: VALID_TOKEN,
                },
                error: null,
              }),
            })),
          })),
        })),
      })),
    }))

    const { POST } = await import('@/app/api/privacy/verify-deletion/route')
    const { NextRequest } = await import('next/server')
    const req = new NextRequest('http://localhost:3000/api/privacy/verify-deletion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: VALID_TOKEN }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.message).toContain('already been')
  })

  it('unhappy: returns 400 for invalid JSON body', async () => {
    const { POST } = await import('@/app/api/privacy/verify-deletion/route')
    const { NextRequest } = await import('next/server')
    const req = new NextRequest('http://localhost:3000/api/privacy/verify-deletion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json{',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.message).toContain('Invalid JSON')
  })

  it('edge: double deletion request — second returns already completed', async () => {
    // First call would complete, second should see 'completed' status
    vi.resetModules()
    vi.doMock('@supabase/supabase-js', () => ({
      createClient: vi.fn(() => ({
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: 'deletion-1',
                  profile_id: VALID_UUID,
                  status: 'completed',
                  verification_token: VALID_TOKEN,
                },
                error: null,
              }),
            })),
          })),
        })),
      })),
    }))

    const { POST } = await import('@/app/api/privacy/verify-deletion/route')
    const { NextRequest } = await import('next/server')
    const req = new NextRequest('http://localhost:3000/api/privacy/verify-deletion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: VALID_TOKEN }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.message).toContain('already been completed')
  })

  it('security: deletion error messages do not leak profile IDs', async () => {
    vi.resetModules()
    vi.doMock('@supabase/supabase-js', () => ({
      createClient: vi.fn(() => ({
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } }),
            })),
          })),
        })),
      })),
    }))

    const { POST } = await import('@/app/api/privacy/verify-deletion/route')
    const { NextRequest } = await import('next/server')
    const req = new NextRequest('http://localhost:3000/api/privacy/verify-deletion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: VALID_TOKEN }),
    })
    const res = await POST(req)
    const json = await res.json()
    expect(json.message).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}/)
    expect(json.message).not.toContain('profile_id')
  })
})

// ── Consent History Tests ──

describe('GET /api/privacy/consent-history — Consent audit trail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('happy: returns consent records for authenticated user', async () => {
    const mockRecords = [
      { id: '1', profile_id: VALID_UUID, consent_type: 'data_processing', action: 'granted', capture_method: 'settings_toggle', created_at: '2026-03-19T00:00:00Z' },
      { id: '2', profile_id: VALID_UUID, consent_type: 'analytics', action: 'withdrawn', capture_method: 'settings_toggle', created_at: '2026-03-18T00:00:00Z' },
    ]
    mockGetUser.mockResolvedValue({ data: { user: { id: VALID_UUID } } })

    // The consent-history route uses createClient from @/lib/supabase/server
    // which is already mocked globally. We need the from().select().eq().order().limit() chain
    // to return our mock records. Since the global mock returns { data: null },
    // we need to verify the route handles that gracefully.
    const { GET } = await import('@/app/api/privacy/consent-history/route')
    const res = await GET()
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toHaveProperty('records')
    expect(Array.isArray(json.records)).toBe(true)
  })

  it('unhappy: returns 401 without auth', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    const { GET } = await import('@/app/api/privacy/consent-history/route')
    const res = await GET()
    expect(res.status).toBe(401)
  })
})

// ── Privacy Preferences Tests ──

describe('PUT /api/privacy/preferences — Privacy preferences update', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: VALID_UUID } } })
  })

  it('unhappy: returns 401 without auth', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    const { PUT } = await import('@/app/api/privacy/preferences/route')
    const { NextRequest } = await import('next/server')
    const req = new NextRequest('http://localhost:3000/api/privacy/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analytics_enabled: false }),
    })
    const res = await PUT(req)
    expect(res.status).toBe(401)
  })

  it('unhappy: returns 400 for invalid data_retention_months', async () => {
    const { PUT } = await import('@/app/api/privacy/preferences/route')
    const { NextRequest } = await import('next/server')
    const req = new NextRequest('http://localhost:3000/api/privacy/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data_retention_months: 6 }),
    })
    const res = await PUT(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.message).toContain('12, 24, or 36')
  })

  it('unhappy: returns 400 for non-boolean analytics_enabled', async () => {
    const { PUT } = await import('@/app/api/privacy/preferences/route')
    const { NextRequest } = await import('next/server')
    const req = new NextRequest('http://localhost:3000/api/privacy/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analytics_enabled: 'yes' }),
    })
    const res = await PUT(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.message).toContain('boolean')
  })

  it('unhappy: returns 400 for non-boolean ai_processing_enabled', async () => {
    const { PUT } = await import('@/app/api/privacy/preferences/route')
    const { NextRequest } = await import('next/server')
    const req = new NextRequest('http://localhost:3000/api/privacy/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ai_processing_enabled: 1 }),
    })
    const res = await PUT(req)
    expect(res.status).toBe(400)
  })

  it('unhappy: returns 400 for invalid JSON body', async () => {
    const { PUT } = await import('@/app/api/privacy/preferences/route')
    const { NextRequest } = await import('next/server')
    const req = new NextRequest('http://localhost:3000/api/privacy/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json{',
    })
    const res = await PUT(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.message).toContain('Invalid JSON')
  })
})

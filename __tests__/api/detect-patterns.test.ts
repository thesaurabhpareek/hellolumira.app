// __tests__/api/detect-patterns.test.ts
// Unit tests for POST /api/detect-patterns
import { describe, it, expect, vi, beforeEach } from 'vitest'

const VALID_UUID = '00000000-0000-0000-0000-000000000001'
const VALID_BABY_ID = '00000000-0000-0000-0000-000000000002'

const mockGetUser = vi.fn()
const mockMaybeSingle = vi.fn()
const mockSingle = vi.fn()
const mockInsert = vi.fn()
const mockUpdate = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
    from: vi.fn((table: string) => {
      if (table === 'baby_profile_members') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: mockMaybeSingle,
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
                limit: vi.fn().mockResolvedValue({ data: [] }),
              })),
            })),
          })),
        }
      }
      if (table === 'baby_profiles') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: mockSingle,
            })),
          })),
          update: mockUpdate,
        }
      }
      if (table === 'pattern_observations') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              gte: vi.fn().mockResolvedValue({ data: [] }),
            })),
          })),
          insert: mockInsert,
        }
      }
      return {}
    }),
  })),
}))

import { POST } from '@/app/api/detect-patterns/route'
import { NextRequest } from 'next/server'

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/detect-patterns', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/detect-patterns', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: VALID_UUID } } })
    mockMaybeSingle.mockResolvedValue({ data: { baby_id: VALID_BABY_ID } })
    mockSingle.mockResolvedValue({ data: { name: 'Meera' } })
    mockInsert.mockResolvedValue({ error: null })
    mockUpdate.mockReturnValue({ eq: vi.fn(() => ({ is: vi.fn().mockResolvedValue({ error: null }) })) })
  })

  it('returns 400 for invalid JSON body', async () => {
    const req = new NextRequest('http://localhost/api/detect-patterns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json{',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 for missing baby_id', async () => {
    const res = await POST(makeRequest({ profile_id: VALID_UUID, stage: 'infant' }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain('baby_id')
  })

  it('returns 400 for invalid baby_id format', async () => {
    const res = await POST(makeRequest({ baby_id: 'not-uuid', profile_id: VALID_UUID, stage: 'infant' }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain('baby_id')
  })

  it('returns 400 for missing profile_id', async () => {
    const res = await POST(makeRequest({ baby_id: VALID_BABY_ID, stage: 'infant' }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain('profile_id')
  })

  it('returns 400 for invalid stage', async () => {
    const res = await POST(makeRequest({ baby_id: VALID_BABY_ID, profile_id: VALID_UUID, stage: 'adult' }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain('stage')
  })

  it('returns 401 when user is not authenticated', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    const res = await POST(makeRequest({ baby_id: VALID_BABY_ID, profile_id: VALID_UUID, stage: 'infant' }))
    expect(res.status).toBe(401)
  })

  it('returns 401 when user.id does not match profile_id', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'different-user-id' } } })
    const res = await POST(makeRequest({ baby_id: VALID_BABY_ID, profile_id: VALID_UUID, stage: 'infant' }))
    expect(res.status).toBe(401)
  })

  it('returns 403 when user is not a member of baby profile', async () => {
    mockMaybeSingle.mockResolvedValueOnce({ data: null })
    const res = await POST(makeRequest({ baby_id: VALID_BABY_ID, profile_id: VALID_UUID, stage: 'infant' }))
    expect(res.status).toBe(403)
  })

  it('returns empty patterns when no checkins exist', async () => {
    const res = await POST(makeRequest({ baby_id: VALID_BABY_ID, profile_id: VALID_UUID, stage: 'infant' }))
    const json = await res.json()
    expect(json.patterns_detected).toEqual([])
    expect(json.patterns_skipped).toEqual([])
  })
})

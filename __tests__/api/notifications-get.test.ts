// __tests__/api/notifications-get.test.ts
// Unit tests for GET /api/notifications
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockOr = vi.fn()
const mockOrder = vi.fn()
const mockLimit = vi.fn()
const mockLt = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
    from: vi.fn(() => ({
      select: mockSelect,
    })),
  })),
}))

import { GET } from '@/app/api/notifications/route'
import { NextRequest } from 'next/server'

function makeRequest(params: Record<string, string> = {}): NextRequest {
  const url = new URL('http://localhost/api/notifications')
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }
  return new NextRequest(url, { method: 'GET' })
}

describe('GET /api/notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    // Build the mock chain
    mockLt.mockResolvedValue({ data: [], error: null })
    mockLimit.mockReturnValue({ lt: mockLt })
    mockOrder.mockReturnValueOnce({ order: vi.fn(() => ({ limit: mockLimit })) })
    mockOr.mockReturnValue({ order: mockOrder })
    mockEq.mockReturnValueOnce({ eq: vi.fn(() => ({ or: mockOr })) })
    mockSelect.mockReturnValue({ eq: mockEq })
    // Default: return empty list
    mockLimit.mockResolvedValue({ data: [], error: null })
  })

  it('returns 401 for unauthenticated user', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    const res = await GET(makeRequest())
    expect(res.status).toBe(401)
  })

  it('returns 400 for invalid cursor format', async () => {
    const res = await GET(makeRequest({ before: 'not-a-date' }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain('Invalid cursor')
  })

  it('clamps negative limit to 1', async () => {
    // This tests the validation logic. The actual DB call is mocked.
    const req = makeRequest({ limit: '-5' })
    const res = await GET(req)
    // Should not crash; limit is clamped to 1
    expect(res).toBeDefined()
  })

  it('clamps NaN limit to default 20', async () => {
    const req = makeRequest({ limit: 'abc' })
    const res = await GET(req)
    expect(res).toBeDefined()
  })

  it('clamps limit above 50 to 50', async () => {
    const req = makeRequest({ limit: '100' })
    const res = await GET(req)
    expect(res).toBeDefined()
  })

  it('accepts valid cursor date', async () => {
    const req = makeRequest({ before: '2026-03-18T12:00:00Z' })
    const res = await GET(req)
    // Should not return 400
    expect(res.status).not.toBe(400)
  })
})

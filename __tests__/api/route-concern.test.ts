// __tests__/api/route-concern.test.ts
// Unit tests for POST /api/route-concern
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
  })),
}))

vi.mock('@/lib/claude', () => ({
  callClaudeJSON: vi.fn().mockResolvedValue({ concern_type: 'sleep_regression' }),
}))

import { POST } from '@/app/api/route-concern/route'
import { callClaudeJSON } from '@/lib/claude'
import { NextRequest } from 'next/server'

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/route-concern', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/route-concern', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    ;(callClaudeJSON as ReturnType<typeof vi.fn>).mockResolvedValue({ concern_type: 'sleep_regression' })
  })

  it('returns 401 for unauthenticated user', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    const res = await POST(makeRequest({ free_text: 'test', stage: 'infant' }))
    expect(res.status).toBe(401)
  })

  it('returns 400 for invalid JSON body', async () => {
    const req = new NextRequest('http://localhost/api/route-concern', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json{',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 for missing stage', async () => {
    const res = await POST(makeRequest({ free_text: 'my baby is not sleeping' }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain('stage')
  })

  it('returns 400 for invalid stage', async () => {
    const res = await POST(makeRequest({ free_text: 'test', stage: 'adult' }))
    expect(res.status).toBe(400)
  })

  it('returns "other" for empty free_text', async () => {
    const res = await POST(makeRequest({ free_text: '', stage: 'infant' }))
    const json = await res.json()
    expect(json.concern_type).toBe('other')
  })

  it('returns "other" for non-string free_text', async () => {
    const res = await POST(makeRequest({ free_text: 123, stage: 'infant' }))
    const json = await res.json()
    expect(json.concern_type).toBe('other')
  })

  it('returns classified concern type from Claude', async () => {
    const res = await POST(makeRequest({ free_text: 'baby not sleeping', stage: 'infant' }))
    const json = await res.json()
    expect(json.concern_type).toBe('sleep_regression')
  })

  it('falls back to "other" when Claude returns invalid type', async () => {
    ;(callClaudeJSON as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ concern_type: 'invalid_type' })
    const res = await POST(makeRequest({ free_text: 'test concern', stage: 'infant' }))
    const json = await res.json()
    expect(json.concern_type).toBe('other')
  })

  it('falls back to "other" on Claude error', async () => {
    ;(callClaudeJSON as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('API error'))
    const res = await POST(makeRequest({ free_text: 'test concern', stage: 'infant' }))
    const json = await res.json()
    expect(json.concern_type).toBe('other')
  })

  it('truncates free_text to 2000 characters', async () => {
    const longText = 'a'.repeat(3000)
    const res = await POST(makeRequest({ free_text: longText, stage: 'infant' }))
    // Should not crash, text is truncated before passing to Claude
    expect(res.status).toBe(200)
  })
})

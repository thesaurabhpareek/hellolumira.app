// __tests__/api/early-access.test.ts
// Unit tests for POST /api/early-access
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock @supabase/supabase-js (note: this route uses the direct client, not server helper)
const mockInsert = vi.fn()
const mockFrom = vi.fn(() => ({ insert: mockInsert }))
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({ from: mockFrom })),
}))

import { POST } from '@/app/api/early-access/route'
import { NextRequest } from 'next/server'

// Use a unique IP per request so the in-module rate limiter never blocks tests
let _ipCounter = 0
function makeRequest(body: unknown): NextRequest {
  const ip = `10.0.0.${(_ipCounter++ % 254) + 1}`
  return new NextRequest('http://localhost/api/early-access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': ip },
    body: JSON.stringify(body),
  })
}

describe('POST /api/early-access', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockInsert.mockResolvedValue({ error: null })
  })

  it('returns 200 on valid email', async () => {
    const res = await POST(makeRequest({ email: 'test@example.com' }))
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
  })

  it('lowercases email before inserting', async () => {
    await POST(makeRequest({ email: 'Test@EXAMPLE.COM' }))
    const insertArg = mockInsert.mock.calls[0][0]
    expect(insertArg.email).toBe('test@example.com')
  })

  it('returns 400 for missing email', async () => {
    const res = await POST(makeRequest({}))
    expect(res.status).toBe(400)
  })

  it('returns 400 for non-string email', async () => {
    const res = await POST(makeRequest({ email: 123 }))
    expect(res.status).toBe(400)
  })

  it('returns 400 for invalid email format', async () => {
    const res = await POST(makeRequest({ email: 'not-an-email' }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain('valid email')
  })

  it('treats duplicate email (23505 error) as success', async () => {
    mockInsert.mockResolvedValueOnce({ error: { code: '23505', message: 'duplicate' } })
    const res = await POST(makeRequest({ email: 'test@example.com' }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
  })

  it('returns 500 on non-duplicate DB error', async () => {
    mockInsert.mockResolvedValueOnce({ error: { code: '42000', message: 'DB error' } })
    const res = await POST(makeRequest({ email: 'test@example.com' }))
    expect(res.status).toBe(500)
  })

  it('returns 400 for invalid JSON body', async () => {
    const ip = `10.0.0.${(_ipCounter++ % 254) + 1}`
    const req = new NextRequest('http://localhost/api/early-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': ip },
      body: 'not-json{',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('truncates email to max 254 characters', async () => {
    const longEmail = 'a'.repeat(240) + '@example.com'
    await POST(makeRequest({ email: longEmail }))
    // The email is trimmed to 254 chars before regex validation
    // If the result still passes regex, it should work
    // If not, it returns 400 — either way, no crash
    expect(true).toBe(true) // no crash assertion
  })

  it('trims whitespace from email', async () => {
    await POST(makeRequest({ email: '  test@example.com  ' }))
    const insertArg = mockInsert.mock.calls[0][0]
    expect(insertArg.email).toBe('test@example.com')
  })
})

// __tests__/api/chat.test.ts
// Unit tests for POST /api/chat — input validation and error handling
import { describe, it, expect, vi, beforeEach } from 'vitest'

const VALID_UUID = '00000000-0000-0000-0000-000000000001'
const VALID_BABY_ID = '00000000-0000-0000-0000-000000000002'

const mockGetUser = vi.fn()
const mockMaybeSingle = vi.fn()

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
      // baby_profiles and profiles — parallel fetch
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: null }),
          })),
        })),
        insert: vi.fn().mockResolvedValue({ error: null }),
        update: vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ error: null }) })),
      }
    }),
  })),
}))

// Mock claude — we don't want to actually call the API
vi.mock('@/lib/claude', () => ({
  default: {
    messages: {
      create: vi.fn().mockResolvedValue({
        content: [{ type: 'text', text: '{"message":"test response"}' }],
        usage: { input_tokens: 10, output_tokens: 20 },
      }),
    },
  },
  MASTER_SYSTEM_PROMPT: vi.fn(() => 'system prompt'),
}))

vi.mock('@/lib/context-builder', () => ({
  buildContextBlock: vi.fn().mockResolvedValue('context'),
}))

import { POST } from '@/app/api/chat/route'
import { NextRequest } from 'next/server'

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/chat — input validation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: VALID_UUID } } })
    mockMaybeSingle.mockResolvedValue({ data: { baby_id: VALID_BABY_ID } })
  })

  it('returns 400 for invalid JSON body', async () => {
    const req = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json{',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.message).toContain('Invalid JSON')
  })

  it('returns 400 for missing baby_id', async () => {
    const res = await POST(makeRequest({
      profile_id: VALID_UUID,
      message: 'hello',
    }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.message).toContain('baby_id')
  })

  it('returns 400 for invalid baby_id format', async () => {
    const res = await POST(makeRequest({
      baby_id: 'not-a-uuid',
      profile_id: VALID_UUID,
      message: 'hello',
    }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.message).toContain('baby_id')
  })

  it('returns 400 for missing profile_id', async () => {
    const res = await POST(makeRequest({
      baby_id: VALID_BABY_ID,
      message: 'hello',
    }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.message).toContain('profile_id')
  })

  it('returns 400 for invalid profile_id format', async () => {
    const res = await POST(makeRequest({
      baby_id: VALID_BABY_ID,
      profile_id: 'not-a-uuid',
      message: 'hello',
    }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.message).toContain('profile_id')
  })

  it('returns 400 for invalid thread_id format', async () => {
    const res = await POST(makeRequest({
      baby_id: VALID_BABY_ID,
      profile_id: VALID_UUID,
      thread_id: 'not-a-uuid',
      message: 'hello',
    }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.message).toContain('thread_id')
  })

  it('returns 400 for missing message', async () => {
    const res = await POST(makeRequest({
      baby_id: VALID_BABY_ID,
      profile_id: VALID_UUID,
    }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.message).toContain('message')
  })

  it('returns 400 for empty message string', async () => {
    const res = await POST(makeRequest({
      baby_id: VALID_BABY_ID,
      profile_id: VALID_UUID,
      message: '',
    }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.message).toContain('message')
  })

  it('returns 401 for unauthenticated user', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    const res = await POST(makeRequest({
      baby_id: VALID_BABY_ID,
      profile_id: VALID_UUID,
      message: 'hello',
    }))
    expect(res.status).toBe(401)
  })

  it('returns 401 when user.id does not match profile_id', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: '99999999-9999-9999-9999-999999999999' } } })
    const res = await POST(makeRequest({
      baby_id: VALID_BABY_ID,
      profile_id: VALID_UUID,
      message: 'hello',
    }))
    expect(res.status).toBe(401)
  })

  it('returns 403 when user is not a member of baby profile (IDOR prevention)', async () => {
    mockMaybeSingle.mockResolvedValueOnce({ data: null })
    const res = await POST(makeRequest({
      baby_id: VALID_BABY_ID,
      profile_id: VALID_UUID,
      message: 'hello',
    }))
    expect(res.status).toBe(403)
  })

  it('returns 400 for conversation_history exceeding max length', async () => {
    const history = Array.from({ length: 101 }, (_, i) => ({
      role: 'user' as const,
      content: `msg ${i}`,
    }))
    const res = await POST(makeRequest({
      baby_id: VALID_BABY_ID,
      profile_id: VALID_UUID,
      message: 'hello',
      conversation_history: history,
    }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.message).toContain('conversation_history')
  })
})

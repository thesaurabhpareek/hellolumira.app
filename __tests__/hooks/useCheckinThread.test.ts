// @vitest-environment happy-dom
/**
 * Unit tests for useCheckinThread hook.
 * Tests checkin flow, structured fields, completion state, retry logic.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCheckinThread } from '@/hooks/useCheckinThread'

const mockFetch = vi.fn()
globalThis.fetch = mockFetch

beforeEach(() => {
  vi.useFakeTimers()
  vi.clearAllMocks()
})

afterEach(() => {
  vi.useRealTimers()
})

const OPENING_PARAMS = {
  baby_id: 'baby-1',
  profile_id: 'profile-1',
  stage: 'infant' as const,
  message: '',
  is_opening: true,
}

const REPLY_PARAMS = {
  baby_id: 'baby-1',
  profile_id: 'profile-1',
  stage: 'infant' as const,
  message: 'She slept ok',
  is_opening: false,
}

function mockApiResponse(data: Record<string, unknown> = {}) {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      message: "How did last night go with Meera?",
      structured_fields: null,
      checkin_complete: false,
      conversation_log: [],
      ...data,
    }),
  })
}

describe('useCheckinThread', () => {
  // ── Initial state ──

  it('returns empty initial state', () => {
    const { result } = renderHook(() => useCheckinThread())
    expect(result.current.messages).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.structuredFields).toBeNull()
    expect(result.current.isComplete).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('initializes with provided messages', () => {
    const initial = [
      { role: 'lumira' as const, content: 'Hi!', timestamp: '2026-03-18T10:00:00Z' },
    ]
    const { result } = renderHook(() => useCheckinThread(initial))
    expect(result.current.messages).toHaveLength(1)
    expect(result.current.messages[0].content).toBe('Hi!')
  })

  // ── Opening message (is_opening: true) ──

  it('does NOT add parent message for opening request', async () => {
    mockFetch.mockImplementation(() => mockApiResponse())
    const { result } = renderHook(() => useCheckinThread())

    await act(async () => {
      await result.current.send(OPENING_PARAMS)
    })

    // Only lumira message, no parent message
    expect(result.current.messages).toHaveLength(1)
    expect(result.current.messages[0].role).toBe('lumira')
  })

  it('adds lumira message from opening response', async () => {
    mockFetch.mockImplementation(() => mockApiResponse({
      message: "Good morning! How did last night go?",
    }))
    const { result } = renderHook(() => useCheckinThread())

    await act(async () => {
      await result.current.send(OPENING_PARAMS)
    })

    expect(result.current.messages[0].content).toBe("Good morning! How did last night go?")
  })

  // ── Parent reply (is_opening: false) ──

  it('adds parent message before Lumira reply', async () => {
    mockFetch.mockImplementation(() => mockApiResponse({
      message: "Glad to hear! How about feeding?",
    }))
    const { result } = renderHook(() => useCheckinThread())

    await act(async () => {
      await result.current.send(REPLY_PARAMS)
    })

    expect(result.current.messages).toHaveLength(2)
    expect(result.current.messages[0].role).toBe('parent')
    expect(result.current.messages[0].content).toBe('She slept ok')
    expect(result.current.messages[1].role).toBe('lumira')
  })

  it('does not add empty parent message when message is whitespace-only', async () => {
    mockFetch.mockImplementation(() => mockApiResponse())
    const { result } = renderHook(() => useCheckinThread())

    await act(async () => {
      await result.current.send({ ...REPLY_PARAMS, message: '   ' })
    })

    // Whitespace-only message is not trimmed — the condition is `message.trim()`
    // Which means empty after trim => no parent message added
    const parentMsgs = result.current.messages.filter(m => m.role === 'parent')
    expect(parentMsgs).toHaveLength(0)
  })

  // ── Structured fields ──

  it('sets structured fields when returned from API', async () => {
    const fields = [
      { id: 'sleep', label: 'Sleep quality', options: [{ value: 'poor', label: 'Poor' }, { value: 'ok', label: 'OK' }] },
    ]
    mockFetch.mockImplementation(() => mockApiResponse({
      structured_fields: fields,
    }))
    const { result } = renderHook(() => useCheckinThread())

    await act(async () => {
      await result.current.send(REPLY_PARAMS)
    })

    expect(result.current.structuredFields).toEqual(fields)
  })

  it('does not update structured fields when empty array returned', async () => {
    mockFetch.mockImplementation(() => mockApiResponse({
      structured_fields: [],
    }))
    const { result } = renderHook(() => useCheckinThread())

    await act(async () => {
      await result.current.send(REPLY_PARAMS)
    })

    // Empty array has length 0, so `data.structured_fields?.length > 0` is false
    expect(result.current.structuredFields).toBeNull()
  })

  it('attaches structured fields to the lumira message', async () => {
    const fields = [
      { id: 'mood', label: 'Mood', options: [{ value: 'calm', label: 'Calm' }] },
    ]
    mockFetch.mockImplementation(() => mockApiResponse({
      structured_fields: fields,
    }))
    const { result } = renderHook(() => useCheckinThread())

    await act(async () => {
      await result.current.send(REPLY_PARAMS)
    })

    const lumiraMsg = result.current.messages.find(m => m.role === 'lumira')
    expect(lumiraMsg?.structured_fields).toEqual(fields)
  })

  // ── Completion ──

  it('sets isComplete when checkin_complete is true', async () => {
    mockFetch.mockImplementation(() => mockApiResponse({
      checkin_complete: true,
      message: "Thanks for checking in! Have a good day.",
    }))
    const { result } = renderHook(() => useCheckinThread())

    await act(async () => {
      await result.current.send(REPLY_PARAMS)
    })

    expect(result.current.isComplete).toBe(true)
  })

  it('does not set isComplete when checkin_complete is false', async () => {
    mockFetch.mockImplementation(() => mockApiResponse({
      checkin_complete: false,
    }))
    const { result } = renderHook(() => useCheckinThread())

    await act(async () => {
      await result.current.send(REPLY_PARAMS)
    })

    expect(result.current.isComplete).toBe(false)
  })

  it('attaches checkin_complete flag to lumira message', async () => {
    mockFetch.mockImplementation(() => mockApiResponse({
      checkin_complete: true,
    }))
    const { result } = renderHook(() => useCheckinThread())

    await act(async () => {
      await result.current.send(REPLY_PARAMS)
    })

    const lumiraMsg = result.current.messages.find(m => m.role === 'lumira')
    expect(lumiraMsg?.checkin_complete).toBe(true)
  })

  // ── Loading state ──

  it('sets loading during send', async () => {
    let resolveApi: (value: unknown) => void
    mockFetch.mockImplementation(() => new Promise(r => { resolveApi = r }))
    const { result } = renderHook(() => useCheckinThread())

    let sendPromise: Promise<void>
    act(() => {
      sendPromise = result.current.send(REPLY_PARAMS)
    })

    expect(result.current.loading).toBe(true)

    await act(async () => {
      resolveApi!({
        ok: true,
        json: () => Promise.resolve({ message: 'response', conversation_log: [] }),
      })
      await sendPromise!
    })

    expect(result.current.loading).toBe(false)
  })

  // ── Retry logic ──

  it('retries once on first failure then succeeds', async () => {
    let callCount = 0
    mockFetch.mockImplementation(() => {
      callCount += 1
      if (callCount === 1) {
        return Promise.reject(new Error('API error'))
      }
      return mockApiResponse()
    })

    const { result } = renderHook(() => useCheckinThread())

    await act(async () => {
      const p = result.current.send(REPLY_PARAMS)
      await vi.advanceTimersByTimeAsync(1500)
      await p
    })

    expect(callCount).toBe(2)
    expect(result.current.error).toBeNull()
    const lumiraMessages = result.current.messages.filter(m => m.role === 'lumira')
    expect(lumiraMessages).toHaveLength(1)
  })

  it('sets error after both attempts fail', async () => {
    mockFetch.mockRejectedValue(new Error('API error'))

    const { result } = renderHook(() => useCheckinThread())

    await act(async () => {
      const p = result.current.send(REPLY_PARAMS)
      await vi.advanceTimersByTimeAsync(2000)
      await p
    })

    expect(result.current.error).toBe("Lumira is taking a moment. Try again.")
    // parent message + error lumira message
    const lumiraMessages = result.current.messages.filter(m => m.role === 'lumira')
    expect(lumiraMessages).toHaveLength(1)
    expect(lumiraMessages[0].content).toContain('try again')
  })

  // ── Error cleared on new send ──

  it('clears error on successful subsequent send', async () => {
    // First: fail
    mockFetch.mockRejectedValue(new Error('API error'))
    const { result } = renderHook(() => useCheckinThread())

    await act(async () => {
      const p = result.current.send(REPLY_PARAMS)
      await vi.advanceTimersByTimeAsync(2000)
      await p
    })
    expect(result.current.error).toBeTruthy()

    // Second: succeed
    mockFetch.mockImplementation(() => mockApiResponse())
    await act(async () => {
      await result.current.send(REPLY_PARAMS)
    })
    expect(result.current.error).toBeNull()
  })

  // ── Conversation log ──

  it('passes conversation_so_far to subsequent API calls', async () => {
    const convLog = [
      { role: 'lumira' as const, content: 'Good morning!', timestamp: '2026-03-18T06:00:00Z' },
      { role: 'parent' as const, content: 'She slept ok', timestamp: '2026-03-18T06:01:00Z' },
    ]
    mockFetch.mockImplementation(() => mockApiResponse({
      conversation_log: convLog,
    }))
    const { result } = renderHook(() => useCheckinThread())

    // First call
    await act(async () => {
      await result.current.send(OPENING_PARAMS)
    })

    // Second call should include conversation_so_far
    await act(async () => {
      await result.current.send(REPLY_PARAMS)
    })

    const secondCallBody = JSON.parse(mockFetch.mock.calls[1][1].body)
    expect(secondCallBody.conversation_so_far).toEqual(convLog)
  })

  // ── API request format ──

  it('sends correct request body', async () => {
    mockFetch.mockImplementation(() => mockApiResponse())
    const { result } = renderHook(() => useCheckinThread())

    await act(async () => {
      await result.current.send(REPLY_PARAMS)
    })

    expect(mockFetch).toHaveBeenCalledWith('/api/checkin-conversation', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }))

    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.baby_id).toBe('baby-1')
    expect(body.profile_id).toBe('profile-1')
    expect(body.stage).toBe('infant')
    expect(body.message).toBe('She slept ok')
    expect(body.is_opening).toBe(false)
  })
})

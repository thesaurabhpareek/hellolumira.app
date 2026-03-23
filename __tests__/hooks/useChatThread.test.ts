// @vitest-environment happy-dom
/**
 * Unit tests for useChatThread hook.
 * Tests message sending, retry logic, error handling, and state management.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useChatThread } from '@/hooks/useChatThread'

const mockFetch = vi.fn()
globalThis.fetch = mockFetch

beforeEach(() => {
  vi.clearAllMocks()
})

const SEND_PARAMS = {
  baby_id: 'baby-1',
  profile_id: 'profile-1',
  thread_id: 'thread-1',
  message: 'How is her sleep?',
}

function mockSuccessResponse(data: Record<string, unknown> = {}) {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      message: 'She might be going through a sleep regression.',
      escalation: null,
      emotional_signal: null,
      suggested_prompts: null,
      concern_category: null,
      ...data,
    }),
  })
}

describe('useChatThread', () => {
  // ── Initial state ──

  it('returns empty messages by default', () => {
    const { result } = renderHook(() => useChatThread())
    expect(result.current.messages).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.escalation).toBeNull()
    expect(result.current.emotionalSignal).toBeNull()
    expect(result.current.suggestedPrompts).toBeNull()
    expect(result.current.concernCategory).toBeNull()
  })

  it('initializes with provided messages', () => {
    const initial = [
      { role: 'user' as const, content: 'Hello', timestamp: '2026-03-18T10:00:00Z' },
    ]
    const { result } = renderHook(() => useChatThread(initial))
    expect(result.current.messages).toHaveLength(1)
    expect(result.current.messages[0].content).toBe('Hello')
  })

  // ── Successful send ──

  it('adds user and assistant messages on send', async () => {
    mockFetch.mockImplementation(() => mockSuccessResponse())
    const { result } = renderHook(() => useChatThread())

    await act(async () => {
      await result.current.send(SEND_PARAMS)
    })

    // After send completes: user message + assistant message
    expect(result.current.messages).toHaveLength(2)
    expect(result.current.messages[0].role).toBe('user')
    expect(result.current.messages[0].content).toBe('How is her sleep?')
    expect(result.current.messages[1].role).toBe('assistant')
    expect(result.current.messages[1].content).toContain('sleep regression')
  })

  it('adds assistant message on successful response', async () => {
    mockFetch.mockImplementation(() => mockSuccessResponse())
    const { result } = renderHook(() => useChatThread())

    await act(async () => {
      await result.current.send(SEND_PARAMS)
    })

    expect(result.current.messages).toHaveLength(2)
    expect(result.current.messages[1].role).toBe('assistant')
    expect(result.current.messages[1].content).toContain('sleep regression')
  })

  it('sets loading to false after send completes', async () => {
    mockFetch.mockImplementation(() => mockSuccessResponse())
    const { result } = renderHook(() => useChatThread())

    await act(async () => {
      await result.current.send(SEND_PARAMS)
    })

    expect(result.current.loading).toBe(false)
  })

  it('clears error on successful send after failure', async () => {
    // First call: fail
    mockFetch.mockRejectedValueOnce(new Error('API error'))
    mockFetch.mockRejectedValueOnce(new Error('API error'))
    const { result } = renderHook(() => useChatThread())

    await act(async () => {
      await result.current.send(SEND_PARAMS)
    })
    expect(result.current.error).toBeTruthy()

    // Second call: succeed
    mockFetch.mockImplementation(() => mockSuccessResponse())
    await act(async () => {
      await result.current.send(SEND_PARAMS)
    })
    expect(result.current.error).toBeNull()
  })

  // ── Escalation ──

  it('sets escalation state from response', async () => {
    mockFetch.mockImplementation(() =>
      mockSuccessResponse({
        escalation: { level: 'emergency', category: 'breathing_emergency', immediateAction: 'Call 911', actionUrl: 'tel:911' },
      })
    )
    const { result } = renderHook(() => useChatThread())

    await act(async () => {
      await result.current.send(SEND_PARAMS)
    })

    expect(result.current.escalation).toEqual({
      level: 'emergency',
      category: 'breathing_emergency',
      immediateAction: 'Call 911',
      actionUrl: 'tel:911',
    })
  })

  it('attaches escalation to the assistant message', async () => {
    const escData = { level: 'urgent', category: null, immediateAction: 'See a doctor', actionUrl: null }
    mockFetch.mockImplementation(() => mockSuccessResponse({ escalation: escData }))
    const { result } = renderHook(() => useChatThread())

    await act(async () => {
      await result.current.send(SEND_PARAMS)
    })

    expect(result.current.messages[1].escalation).toEqual(escData)
  })

  // ── Emotional signal ──

  it('sets emotionalSignal from response', async () => {
    mockFetch.mockImplementation(() =>
      mockSuccessResponse({ emotional_signal: 'distressed' })
    )
    const { result } = renderHook(() => useChatThread())

    await act(async () => {
      await result.current.send(SEND_PARAMS)
    })

    expect(result.current.emotionalSignal).toBe('distressed')
  })

  // ── Suggested prompts ──

  it('sets suggestedPrompts from response', async () => {
    mockFetch.mockImplementation(() =>
      mockSuccessResponse({ suggested_prompts: ['Tell me about sleep regressions', 'Is this normal?'] })
    )
    const { result } = renderHook(() => useChatThread())

    await act(async () => {
      await result.current.send(SEND_PARAMS)
    })

    expect(result.current.suggestedPrompts).toEqual([
      'Tell me about sleep regressions',
      'Is this normal?',
    ])
  })

  // ── Concern category ──

  it('sets concernCategory from response', async () => {
    mockFetch.mockImplementation(() =>
      mockSuccessResponse({ concern_category: 'sleep' })
    )
    const { result } = renderHook(() => useChatThread())

    await act(async () => {
      await result.current.send(SEND_PARAMS)
    })

    expect(result.current.concernCategory).toBe('sleep')
  })

  // ── Retry logic ──

  it('retries once on first failure then succeeds', async () => {
    let callCount = 0
    mockFetch.mockImplementation(() => {
      callCount += 1
      if (callCount === 1) {
        return Promise.reject(new Error('API error'))
      }
      return mockSuccessResponse()
    })

    const { result } = renderHook(() => useChatThread())

    await act(async () => {
      await result.current.send(SEND_PARAMS)
    })

    await waitFor(() => {
      expect(callCount).toBe(2)
    })
    expect(result.current.messages).toHaveLength(2) // user + assistant
    expect(result.current.error).toBeNull()
  }, 10000)

  it('sets error after both attempts fail', async () => {
    mockFetch.mockRejectedValue(new Error('API error'))

    const { result } = renderHook(() => useChatThread())

    await act(async () => {
      await result.current.send(SEND_PARAMS)
    })

    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
    })
    expect(result.current.error).toBe("I'm having trouble connecting right now. Your conversation is saved — tap to try again.")
  }, 10000)

  // ── Error status codes — Fix 6 regressions ──

  it('shows service-unavailable message on 503 response', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve({ ok: false, status: 503 })
    )
    const { result } = renderHook(() => useChatThread())

    await act(async () => {
      await result.current.send(SEND_PARAMS)
    })

    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
    })
    expect(result.current.error).toContain('temporarily unavailable')
    expect(result.current.error).not.toContain("I'm having trouble connecting")
  }, 10000)

  it('shows rate-limit message on 429 response', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve({ ok: false, status: 429 })
    )
    const { result } = renderHook(() => useChatThread())

    await act(async () => {
      await result.current.send(SEND_PARAMS)
    })

    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
    })
    expect(result.current.error).toContain('too quickly')
    expect(result.current.error).not.toContain('temporarily unavailable')
  }, 10000)

  it('shows generic connectivity message for non-503/429 errors', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve({ ok: false, status: 500 })
    )
    const { result } = renderHook(() => useChatThread())

    await act(async () => {
      await result.current.send(SEND_PARAMS)
    })

    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
    })
    expect(result.current.error).toContain("I'm having trouble connecting")
    expect(result.current.error).not.toContain('temporarily unavailable')
    expect(result.current.error).not.toContain('too quickly')
  }, 10000)

  it('attaches error message as an assistant message in the thread', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve({ ok: false, status: 503 })
    )
    const { result } = renderHook(() => useChatThread())

    await act(async () => {
      await result.current.send(SEND_PARAMS)
    })

    await waitFor(() => {
      expect(result.current.messages.length).toBeGreaterThanOrEqual(2)
    })
    // user message + error assistant message
    const lastMsg = result.current.messages[result.current.messages.length - 1]
    expect(lastMsg.role).toBe('assistant')
    expect(lastMsg.content).toContain('temporarily unavailable')
  }, 10000)

  it('shows session-expired message on 401 response', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve({ ok: false, status: 401 })
    )
    const { result } = renderHook(() => useChatThread())

    await act(async () => {
      await result.current.send(SEND_PARAMS)
    })

    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
    })
    expect(result.current.error).toContain('Session expired')
  }, 10000)

  // ── setMessages ──

  it('allows setting messages externally', () => {
    const { result } = renderHook(() => useChatThread())

    act(() => {
      result.current.setMessages([
        { role: 'assistant', content: 'Welcome!', timestamp: '2026-03-18T10:00:00Z' },
      ])
    })

    expect(result.current.messages).toHaveLength(1)
    expect(result.current.messages[0].content).toBe('Welcome!')
  })

  // ── Multi-turn context ──

  it('sends conversation history on subsequent messages', async () => {
    mockFetch.mockImplementation(() => mockSuccessResponse())
    const { result } = renderHook(() => useChatThread())

    // First message
    await act(async () => {
      await result.current.send(SEND_PARAMS)
    })

    // Second message
    await act(async () => {
      await result.current.send({ ...SEND_PARAMS, message: 'Follow up question' })
    })

    // Check the second fetch call includes conversation_history
    const secondCallBody = JSON.parse(mockFetch.mock.calls[1][1].body)
    expect(secondCallBody.conversation_history).toBeDefined()
    expect(secondCallBody.conversation_history).toHaveLength(2) // user + assistant from first turn
  })
})

// @vitest-environment happy-dom
/**
 * Unit tests for useNotifications hook.
 * Tests polling, dismiss, mark-read, and error handling.
 * Uses a mock fetch to avoid real API calls.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useNotifications } from '@/hooks/useNotifications'

// Global fetch mock
const mockFetch = vi.fn()
globalThis.fetch = mockFetch

beforeEach(() => {
  vi.useFakeTimers()
  vi.clearAllMocks()
  // Default: unread-count returns 0, other endpoints succeed
  mockFetch.mockImplementation((url: string, _options?: RequestInit) => {
    if (typeof url === 'string' && url.includes('/api/notifications/unread-count')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ count: 0 }),
      })
    }
    if (typeof url === 'string' && url.includes('/api/notifications/mark-read')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    }
    if (typeof url === 'string' && url.includes('/api/notifications/mark-all-read')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    }
    if (typeof url === 'string' && url.includes('/api/notifications/dismiss')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    }
    if (typeof url === 'string' && url.includes('/api/notifications')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ today: [], earlier: [], next_cursor: null }),
      })
    }
    return Promise.resolve({ ok: false })
  })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useNotifications', () => {
  // ── Initial state ──

  it('returns initial state with 0 unread count', async () => {
    const { result } = renderHook(() => useNotifications())
    // Wait for the initial poll to complete
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10)
    })
    expect(result.current.unreadCount).toBe(0)
    expect(result.current.notifications).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  // ── Polling ──

  it('fetches unread count on mount', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (typeof url === 'string' && url.includes('unread-count')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ count: 3 }),
        })
      }
      return Promise.resolve({ ok: false })
    })
    const { result } = renderHook(() => useNotifications())
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10)
    })
    expect(result.current.unreadCount).toBe(3)
  })

  it('polls unread count every 60 seconds', async () => {
    let count = 0
    mockFetch.mockImplementation((url: string) => {
      if (typeof url === 'string' && url.includes('unread-count')) {
        count += 1
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ count }),
        })
      }
      return Promise.resolve({ ok: false })
    })
    const { result } = renderHook(() => useNotifications())

    // Initial fetch
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10)
    })
    expect(result.current.unreadCount).toBe(1)

    // Advance past one polling interval
    await act(async () => {
      await vi.advanceTimersByTimeAsync(60_000)
    })
    expect(result.current.unreadCount).toBe(2)
  })

  it('silently ignores polling failures', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (typeof url === 'string' && url.includes('unread-count')) {
        return Promise.resolve({ ok: false })
      }
      return Promise.resolve({ ok: false })
    })
    const { result } = renderHook(() => useNotifications())
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10)
    })
    // Should not throw, unreadCount stays 0
    expect(result.current.unreadCount).toBe(0)
  })

  it('silently ignores network errors during polling', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (typeof url === 'string' && url.includes('unread-count')) {
        return Promise.reject(new Error('Network error'))
      }
      return Promise.resolve({ ok: false })
    })
    const { result } = renderHook(() => useNotifications())
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10)
    })
    expect(result.current.unreadCount).toBe(0)
    expect(result.current.error).toBeNull()
  })

  // ── fetchNotifications ──

  it('fetches full notification list', async () => {
    const mockNotifs = {
      today: [
        { id: 'n1', type: 'pattern_detected', title: 'Sleep Alert', body: 'Test', is_read: false, is_dismissed: false },
      ],
      earlier: [],
      next_cursor: null,
    }
    mockFetch.mockImplementation((url: string) => {
      if (typeof url === 'string' && url.includes('/api/notifications?')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockNotifs),
        })
      }
      if (typeof url === 'string' && url.includes('unread-count')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ count: 1 }) })
      }
      return Promise.resolve({ ok: false })
    })

    const { result } = renderHook(() => useNotifications())
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10)
    })

    await act(async () => {
      await result.current.fetchNotifications()
    })

    expect(result.current.notifications).toEqual(mockNotifs)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('sets error when fetchNotifications fails', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (typeof url === 'string' && url.includes('/api/notifications?')) {
        return Promise.resolve({ ok: false })
      }
      if (typeof url === 'string' && url.includes('unread-count')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ count: 0 }) })
      }
      return Promise.resolve({ ok: false })
    })

    const { result } = renderHook(() => useNotifications())
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10)
    })

    await act(async () => {
      await result.current.fetchNotifications()
    })

    expect(result.current.error).toBe('Failed to fetch notifications')
  })

  it('sets loading during fetchNotifications', async () => {
    let resolveNotifs: (value: unknown) => void
    const notifPromise = new Promise((r) => { resolveNotifs = r })

    mockFetch.mockImplementation((url: string) => {
      if (typeof url === 'string' && url.includes('/api/notifications?')) {
        return notifPromise.then(() => ({
          ok: true,
          json: () => Promise.resolve({ today: [], earlier: [], next_cursor: null }),
        }))
      }
      if (typeof url === 'string' && url.includes('unread-count')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ count: 0 }) })
      }
      return Promise.resolve({ ok: false })
    })

    const { result } = renderHook(() => useNotifications())
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10)
    })

    let fetchPromise: Promise<void>
    act(() => {
      fetchPromise = result.current.fetchNotifications()
    })

    // Loading should be true while waiting
    expect(result.current.loading).toBe(true)

    await act(async () => {
      resolveNotifs!(undefined)
      await fetchPromise!
    })

    expect(result.current.loading).toBe(false)
  })

  // ── markRead ──

  it('optimistically marks notifications as read', async () => {
    const mockNotifs = {
      today: [
        { id: 'n1', type: 'pattern_detected', title: 'Test', body: 'Body', is_read: false, is_dismissed: false, read_at: null },
        { id: 'n2', type: 'system_message', title: 'Test2', body: 'Body2', is_read: false, is_dismissed: false, read_at: null },
      ],
      earlier: [],
      next_cursor: null,
    }
    mockFetch.mockImplementation((url: string) => {
      if (typeof url === 'string' && url.includes('/api/notifications?')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockNotifs) })
      }
      if (typeof url === 'string' && url.includes('unread-count')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ count: 2 }) })
      }
      if (typeof url === 'string' && url.includes('mark-read')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
      }
      return Promise.resolve({ ok: false })
    })

    const { result } = renderHook(() => useNotifications())
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10)
    })
    await act(async () => {
      await result.current.fetchNotifications()
    })

    await act(async () => {
      await result.current.markRead(['n1'])
    })

    expect(result.current.notifications!.today[0].is_read).toBe(true)
    expect(result.current.notifications!.today[0].read_at).toBeTruthy()
    expect(result.current.notifications!.today[1].is_read).toBe(false)
    expect(result.current.unreadCount).toBe(1)
  })

  // ── markAllRead ──

  it('marks all notifications as read', async () => {
    const mockNotifs = {
      today: [
        { id: 'n1', is_read: false, is_dismissed: false, read_at: null },
      ],
      earlier: [
        { id: 'n2', is_read: false, is_dismissed: false, read_at: null },
      ],
      next_cursor: null,
    }
    mockFetch.mockImplementation((url: string) => {
      if (typeof url === 'string' && url.includes('/api/notifications?')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockNotifs) })
      }
      if (typeof url === 'string' && url.includes('unread-count')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ count: 2 }) })
      }
      if (typeof url === 'string' && url.includes('mark-all-read')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
      }
      return Promise.resolve({ ok: false })
    })

    const { result } = renderHook(() => useNotifications())
    await act(async () => { await vi.advanceTimersByTimeAsync(10) })
    await act(async () => { await result.current.fetchNotifications() })

    await act(async () => {
      await result.current.markAllRead()
    })

    expect(result.current.notifications!.today[0].is_read).toBe(true)
    expect(result.current.notifications!.earlier[0].is_read).toBe(true)
    expect(result.current.unreadCount).toBe(0)
  })

  // ── dismiss ──

  it('removes dismissed notification from list', async () => {
    const mockNotifs = {
      today: [
        { id: 'n1', is_read: false, is_dismissed: false, read_at: null },
        { id: 'n2', is_read: true, is_dismissed: false, read_at: '2026-03-18T10:00:00Z' },
      ],
      earlier: [],
      next_cursor: null,
    }
    mockFetch.mockImplementation((url: string) => {
      if (typeof url === 'string' && url.includes('/api/notifications?')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockNotifs) })
      }
      if (typeof url === 'string' && url.includes('unread-count')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ count: 1 }) })
      }
      if (typeof url === 'string' && url.includes('dismiss')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
      }
      return Promise.resolve({ ok: false })
    })

    const { result } = renderHook(() => useNotifications())
    await act(async () => { await vi.advanceTimersByTimeAsync(10) })
    await act(async () => { await result.current.fetchNotifications() })

    await act(async () => {
      await result.current.dismiss('n1')
    })

    expect(result.current.notifications!.today).toHaveLength(1)
    expect(result.current.notifications!.today[0].id).toBe('n2')
    // Unread count decremented because n1 was unread
    expect(result.current.unreadCount).toBe(0)
  })

  it('does not decrement unread count when dismissing already-read notification', async () => {
    const mockNotifs = {
      today: [
        { id: 'n1', is_read: true, is_dismissed: false, read_at: '2026-03-18T10:00:00Z' },
      ],
      earlier: [],
      next_cursor: null,
    }
    mockFetch.mockImplementation((url: string) => {
      if (typeof url === 'string' && url.includes('/api/notifications?')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockNotifs) })
      }
      if (typeof url === 'string' && url.includes('unread-count')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ count: 0 }) })
      }
      if (typeof url === 'string' && url.includes('dismiss')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
      }
      return Promise.resolve({ ok: false })
    })

    const { result } = renderHook(() => useNotifications())
    await act(async () => { await vi.advanceTimersByTimeAsync(10) })
    await act(async () => { await result.current.fetchNotifications() })

    await act(async () => {
      await result.current.dismiss('n1')
    })

    expect(result.current.unreadCount).toBe(0)
    expect(result.current.notifications!.today).toHaveLength(0)
  })

  // ── refresh ──

  it('refresh triggers a new poll cycle', async () => {
    let fetchCount = 0
    mockFetch.mockImplementation((url: string) => {
      if (typeof url === 'string' && url.includes('unread-count')) {
        fetchCount += 1
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ count: fetchCount }) })
      }
      return Promise.resolve({ ok: false })
    })

    const { result } = renderHook(() => useNotifications())
    await act(async () => { await vi.advanceTimersByTimeAsync(10) })
    const countAfterInit = result.current.unreadCount

    await act(async () => {
      result.current.refresh()
      await vi.advanceTimersByTimeAsync(10)
    })

    expect(result.current.unreadCount).toBeGreaterThan(countAfterInit)
  })

  // ── Silent fail on mutation errors ──

  it('silently handles markRead failure', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (typeof url === 'string' && url.includes('mark-read')) {
        return Promise.reject(new Error('Network error'))
      }
      if (typeof url === 'string' && url.includes('unread-count')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ count: 1 }) })
      }
      return Promise.resolve({ ok: false })
    })

    const { result } = renderHook(() => useNotifications())
    await act(async () => { await vi.advanceTimersByTimeAsync(10) })

    // Should not throw
    await act(async () => {
      await result.current.markRead(['n1'])
    })
    expect(result.current.error).toBeNull()
  })

  it('silently handles dismiss failure', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (typeof url === 'string' && url.includes('dismiss')) {
        return Promise.reject(new Error('Network error'))
      }
      if (typeof url === 'string' && url.includes('unread-count')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ count: 0 }) })
      }
      return Promise.resolve({ ok: false })
    })

    const { result } = renderHook(() => useNotifications())
    await act(async () => { await vi.advanceTimersByTimeAsync(10) })

    await act(async () => {
      await result.current.dismiss('n1')
    })
    expect(result.current.error).toBeNull()
  })

  it('silently handles markAllRead failure', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (typeof url === 'string' && url.includes('mark-all-read')) {
        return Promise.reject(new Error('Network error'))
      }
      if (typeof url === 'string' && url.includes('unread-count')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ count: 0 }) })
      }
      return Promise.resolve({ ok: false })
    })

    const { result } = renderHook(() => useNotifications())
    await act(async () => { await vi.advanceTimersByTimeAsync(10) })

    await act(async () => {
      await result.current.markAllRead()
    })
    expect(result.current.error).toBeNull()
  })
})

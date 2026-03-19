// @vitest-environment happy-dom
/**
 * Unit tests for useWeeklyGuide hook.
 * Tests guide fetching, retry logic, error handling, and refetch.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useWeeklyGuide } from '@/hooks/useWeeklyGuide'

const mockFetch = vi.fn()

beforeEach(() => {
  vi.useFakeTimers()
  vi.clearAllMocks()
  // The hook uses window.fetch specifically
  vi.stubGlobal('fetch', mockFetch)
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

const MOCK_GUIDE = {
  opening: 'Welcome to week 12!',
  what_is_happening: 'Baby is developing rapidly.',
  whats_usually_normal: ['Frequent feeding', 'Short naps'],
  focus_this_week: ['Tummy time', 'Reading aloud'],
  watch_outs: ['Persistent crying', 'Feeding refusal'],
}

describe('useWeeklyGuide', () => {
  // ── Happy path ──

  it('fetches and returns guide data', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ guide: MOCK_GUIDE }),
    })

    const { result } = renderHook(() => useWeeklyGuide('infant', 12))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10)
    })

    expect(result.current.guide).toEqual(MOCK_GUIDE)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('starts with loading=true', () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ guide: MOCK_GUIDE }),
    })

    const { result } = renderHook(() => useWeeklyGuide('infant', 12))
    expect(result.current.loading).toBe(true)
  })

  it('fetches correct URL with stage and week_or_month', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ guide: MOCK_GUIDE }),
    })

    renderHook(() => useWeeklyGuide('pregnancy', 28))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10)
    })

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/weekly-guide?stage=pregnancy&week_or_month=28'
    )
  })

  it('fetches for toddler stage with month', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ guide: MOCK_GUIDE }),
    })

    renderHook(() => useWeeklyGuide('toddler', 18))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10)
    })

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/weekly-guide?stage=toddler&week_or_month=18'
    )
  })

  // ── Error handling ──

  it('sets error when fetch returns !ok', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
    })

    const { result } = renderHook(() => useWeeklyGuide('infant', 12))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000) // retry delay
    })

    expect(result.current.error).toBe('Failed to fetch guide')
    expect(result.current.guide).toBeNull()
    expect(result.current.loading).toBe(false)
  })

  it('sets error from data.error with fallback_message', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ error: true, fallback_message: 'Guide not available for this week' }),
    })

    const { result } = renderHook(() => useWeeklyGuide('infant', 99))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000)
    })

    expect(result.current.error).toBe('Guide not available for this week')
  })

  it('sets generic error when data.error has no fallback_message', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ error: true }),
    })

    const { result } = renderHook(() => useWeeklyGuide('infant', 12))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000)
    })

    expect(result.current.error).toBe('Guide unavailable')
  })

  // ── Retry logic ──

  it('retries once on first failure then succeeds', async () => {
    let callCount = 0
    mockFetch.mockImplementation(() => {
      callCount += 1
      if (callCount === 1) {
        return Promise.reject(new Error('Network error'))
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ guide: MOCK_GUIDE }),
      })
    })

    const { result } = renderHook(() => useWeeklyGuide('infant', 12))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000)
    })

    expect(result.current.guide).toEqual(MOCK_GUIDE)
    expect(result.current.error).toBeNull()
    expect(callCount).toBe(2)
  })

  it('sets error after both attempts fail', async () => {
    mockFetch.mockRejectedValue(new Error('Persistent error'))

    const { result } = renderHook(() => useWeeklyGuide('infant', 12))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000)
    })

    expect(result.current.error).toBe('Persistent error')
    expect(result.current.guide).toBeNull()
  })

  it('handles non-Error thrown objects', async () => {
    mockFetch.mockRejectedValue('string error')

    const { result } = renderHook(() => useWeeklyGuide('infant', 12))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000)
    })

    expect(result.current.error).toBe("Couldn't load your guide — tap to retry")
  })

  // ── Refetch ──

  it('refetch triggers new data load', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ guide: MOCK_GUIDE }),
    })

    const { result } = renderHook(() => useWeeklyGuide('infant', 12))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10)
    })

    expect(result.current.guide).toEqual(MOCK_GUIDE)

    // Update mock to return different guide
    const UPDATED_GUIDE = { ...MOCK_GUIDE, opening: 'Updated week 12 guide!' }
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ guide: UPDATED_GUIDE }),
    })

    act(() => {
      result.current.refetch()
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10)
    })

    expect(result.current.guide).toEqual(UPDATED_GUIDE)
  })

  // ── Re-fetch on props change ──

  it('re-fetches when stage changes', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ guide: MOCK_GUIDE }),
    })

    const { result, rerender } = renderHook(
      ({ stage, wom }) => useWeeklyGuide(stage, wom),
      { initialProps: { stage: 'infant' as const, wom: 12 } }
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10)
    })

    rerender({ stage: 'toddler' as const, wom: 18 })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10)
    })

    // Should have been called with both URLs
    const calls = mockFetch.mock.calls.map((c: unknown[]) => c[0])
    expect(calls).toContain('/api/weekly-guide?stage=infant&week_or_month=12')
    expect(calls).toContain('/api/weekly-guide?stage=toddler&week_or_month=18')
  })

  it('re-fetches when week_or_month changes', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ guide: MOCK_GUIDE }),
    })

    const { rerender } = renderHook(
      ({ stage, wom }) => useWeeklyGuide(stage, wom),
      { initialProps: { stage: 'infant' as const, wom: 12 } }
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10)
    })

    rerender({ stage: 'infant' as const, wom: 13 })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10)
    })

    const calls = mockFetch.mock.calls.map((c: unknown[]) => c[0])
    expect(calls).toContain('/api/weekly-guide?stage=infant&week_or_month=13')
  })
})

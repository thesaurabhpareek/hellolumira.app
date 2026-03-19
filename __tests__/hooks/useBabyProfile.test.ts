// @vitest-environment happy-dom
/**
 * Unit tests for useBabyProfile hook.
 * Tests profile loading, retry logic, error handling, and cleanup.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// Mock the supabase client module
const mockGetUser = vi.fn()
const mockProfileSelect = vi.fn()
const mockMemberSelect = vi.fn()
const mockBabySelect = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    from: vi.fn((table: string) => {
      if (table === 'profiles') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: mockProfileSelect,
            })),
          })),
        }
      }
      if (table === 'baby_profile_members') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              limit: vi.fn(() => ({
                maybeSingle: mockMemberSelect,
              })),
            })),
          })),
        }
      }
      if (table === 'baby_profiles') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: mockBabySelect,
            })),
          })),
        }
      }
      return {}
    }),
  })),
}))

import { useBabyProfile } from '@/hooks/useBabyProfile'

beforeEach(() => {
  vi.useFakeTimers()
  vi.clearAllMocks()

  // Default: authenticated user with a baby profile
  mockGetUser.mockResolvedValue({
    data: { user: { id: 'user-1' } },
  })
  mockProfileSelect.mockResolvedValue({
    data: { id: 'user-1', first_name: 'Sarah', first_time_parent: true },
    error: null,
  })
  mockMemberSelect.mockResolvedValue({
    data: { baby_id: 'baby-1' },
  })
  mockBabySelect.mockResolvedValue({
    data: { id: 'baby-1', name: 'Meera', stage: 'infant', date_of_birth: '2026-01-01' },
    error: null,
  })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useBabyProfile', () => {
  // ── Happy path ──

  it('loads profile and baby profile on mount', async () => {
    const { result } = renderHook(() => useBabyProfile())

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10)
    })

    expect(result.current.profile).toEqual(
      expect.objectContaining({ id: 'user-1', first_name: 'Sarah' })
    )
    expect(result.current.baby).toEqual(
      expect.objectContaining({ id: 'baby-1', name: 'Meera', stage: 'infant' })
    )
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('starts with loading=true', () => {
    const { result } = renderHook(() => useBabyProfile())
    expect(result.current.loading).toBe(true)
  })

  // ── No baby membership ──

  it('sets baby to null when no baby membership exists', async () => {
    mockMemberSelect.mockResolvedValue({ data: null })

    const { result } = renderHook(() => useBabyProfile())
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10)
    })

    expect(result.current.baby).toBeNull()
    expect(result.current.profile).toBeDefined()
    expect(result.current.error).toBeNull()
  })

  it('sets baby to null when member data has no baby_id', async () => {
    mockMemberSelect.mockResolvedValue({ data: { baby_id: null } })

    const { result } = renderHook(() => useBabyProfile())
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10)
    })

    expect(result.current.baby).toBeNull()
  })

  // ── Not authenticated ──

  it('retries on auth failure then sets error', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const { result } = renderHook(() => useBabyProfile())
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000) // account for retry delay
    })

    expect(result.current.error).toBe('Not authenticated')
    expect(result.current.profile).toBeNull()
    expect(result.current.baby).toBeNull()
    expect(result.current.loading).toBe(false)
  })

  // ── Profile fetch error ──

  it('retries on profile error then sets error', async () => {
    mockProfileSelect.mockResolvedValue({
      data: null,
      error: { message: 'Profile not found' },
    })

    const { result } = renderHook(() => useBabyProfile())
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000)
    })

    expect(result.current.error).toBeTruthy()
    expect(result.current.loading).toBe(false)
  })

  // ── Baby profile fetch error ──

  it('retries on baby profile error then sets error', async () => {
    mockBabySelect.mockResolvedValue({
      data: null,
      error: { message: 'Baby not found' },
    })

    const { result } = renderHook(() => useBabyProfile())
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000)
    })

    expect(result.current.error).toBeTruthy()
    expect(result.current.loading).toBe(false)
  })

  // ── Retry logic ──

  it('retries once on first failure then succeeds', async () => {
    let attempt = 0
    mockGetUser.mockImplementation(() => {
      attempt += 1
      if (attempt === 1) {
        return Promise.reject(new Error('Network error'))
      }
      return Promise.resolve({ data: { user: { id: 'user-1' } } })
    })

    const { result } = renderHook(() => useBabyProfile())
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000) // 1s retry delay + execution
    })

    expect(result.current.profile).toBeDefined()
    expect(result.current.error).toBeNull()
  })

  // ── Refetch ──

  it('refetch triggers a new data load', async () => {
    const { result } = renderHook(() => useBabyProfile())
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10)
    })

    expect(result.current.profile).toBeDefined()

    // Update mock data
    mockProfileSelect.mockResolvedValue({
      data: { id: 'user-1', first_name: 'Updated Sarah' },
      error: null,
    })

    act(() => {
      result.current.refetch()
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10)
    })

    expect(result.current.profile).toEqual(
      expect.objectContaining({ first_name: 'Updated Sarah' })
    )
  })

  // ── Non-Error thrown objects ──

  it('handles non-Error thrown objects gracefully', async () => {
    mockGetUser.mockRejectedValue('string error')

    const { result } = renderHook(() => useBabyProfile())
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000)
    })

    expect(result.current.error).toBe("Couldn't load profile — tap to retry")
    expect(result.current.loading).toBe(false)
  })
})

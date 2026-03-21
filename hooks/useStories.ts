'use client'

/**
 * @module useStories
 * @description Fetches and manages story strip data for the home screen.
 *   Polls the stories endpoint every 60 seconds with SWR-like stale-while-
 *   revalidate behaviour: stale data remains visible while a background
 *   refresh is in flight. Cleans up the polling interval on unmount and
 *   guards against state updates on unmounted components.
 * @version 1.0.0
 * @since March 2026
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import type { StoryStripItem } from '@/types/app'

/** Polling interval for story strip refresh — 60s. */
const POLL_INTERVAL_MS = 60_000

interface UseStoriesResult {
  /** Ordered list of users with their stories for the strip. */
  stories: StoryStripItem[]
  /** True only on the initial fetch (not background refreshes). */
  loading: boolean
  /** Error message from the most recent fetch attempt, or null. */
  error: string | null
  /** Manually trigger a refresh of the story strip data. */
  refresh: () => void
}

/**
 * Fetches story strip data from `GET /api/stories` on mount and polls every
 * 60 seconds. Returns stale data while a background refresh is in progress
 * (SWR-like). The polling interval is cleaned up on unmount and a `cancelled`
 * flag prevents state updates after the component is removed from the tree.
 *
 * @returns Story strip state and a manual refresh function.
 */
export function useStories(): UseStoriesResult {
  const [stories, setStories] = useState<StoryStripItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)
  const hasFetchedOnce = useRef(false)

  useEffect(() => {
    let cancelled = false

    const fetchStories = async () => {
      // Only show loading spinner on the very first fetch
      if (!hasFetchedOnce.current) {
        setLoading(true)
      }

      try {
        const res = await fetch('/api/stories')
        if (!res.ok) {
          throw new Error('Failed to fetch stories')
        }

        const data = (await res.json()) as { stories: StoryStripItem[] }
        if (!cancelled) {
          setStories(data.stories)
          setError(null)
          hasFetchedOnce.current = true
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : 'Could not load stories'
          setError(message)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchStories()
    const interval = setInterval(fetchStories, POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [tick])

  const refresh = useCallback(() => {
    setTick((t) => t + 1)
  }, [])

  return { stories, loading, error, refresh }
}

/**
 * @module useWeeklyGuide
 * @description React hook that fetches the stage-specific weekly developmental
 *   guide. Re-fetches when stage or week/month changes. Includes a single
 *   automatic retry with 1s backoff and proper unmount cleanup.
 * @version 1.0.0
 * @since March 2026
 */

import { useState, useEffect } from 'react'
import type { Stage, WeeklyGuideContent } from '@/types/app'

interface UseWeeklyGuideResult {
  guide: WeeklyGuideContent | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useWeeklyGuide(
  stage: Stage,
  week_or_month: number
): UseWeeklyGuideResult {
  const [guide, setGuide] = useState<WeeklyGuideContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false

    const attempt = async (): Promise<WeeklyGuideContent> => {
      const res = await window.fetch(
        `/api/weekly-guide?stage=${stage}&week_or_month=${week_or_month}`
      )
      if (!res.ok) throw new Error('Failed to fetch guide')
      const data = await res.json()
      if (data.error) throw new Error(data.fallback_message || 'Guide unavailable')
      return data.guide as WeeklyGuideContent
    }

    const run = async () => {
      setLoading(true)
      setError(null)

      try {
        try {
          const g = await attempt()
          if (!cancelled) setGuide(g)
        } catch {
          await new Promise((r) => setTimeout(r, 1000))
          const g = await attempt()
          if (!cancelled) setGuide(g)
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Couldn't load your guide — tap to retry"
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()

    return () => {
      cancelled = true
    }
  }, [stage, week_or_month, tick])

  const refetch = () => setTick((t) => t + 1)

  return { guide, loading, error, refetch }
}

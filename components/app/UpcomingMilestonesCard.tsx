/**
 * @module UpcomingMilestonesCard
 * @description Home feed card showing upcoming milestones with countdown,
 *   triggering celebration overlays when milestones are reached. Fetches
 *   milestone data from /api/milestones/check on mount.
 * @version 2.0.0
 * @since March 2026
 */
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import MilestoneCelebration from './MilestoneCelebration'

interface MilestoneData {
  key: string
  type: string
  title: string
  emoji: string
  description: string
  is_major?: boolean
  celebration_message?: string
}

interface UpcomingMilestone extends MilestoneData {
  distance: number
  distance_unit: string
  countdown_message?: string
}

interface MilestoneCountdown {
  message: string
  days: number
  milestone_title: string
}

interface Props {
  babyId: string
  babyName: string | null
}

export default function UpcomingMilestonesCard({ babyId, babyName }: Props) {
  const [upcoming, setUpcoming] = useState<UpcomingMilestone[]>([])
  const [countdown, setCountdown] = useState<MilestoneCountdown | null>(null)
  const [celebration, setCelebration] = useState<MilestoneData | null>(null)
  const [_celebrationQueue, setCelebrationQueue] = useState<MilestoneData[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        const res = await fetch('/api/milestones/check')
        if (!res.ok) return
        const data = await res.json()

        setUpcoming(data.upcoming || [])
        setCountdown(data.next_milestone_countdown || null)

        // Queue celebrations for newly unlocked milestones
        // Only show each celebration max 2 times (tracked in localStorage)
        if (data.newly_unlocked?.length > 0) {
          const CELEBRATION_KEY = 'lumira_celebrated'
          const celebrated: Record<string, number> = JSON.parse(localStorage.getItem(CELEBRATION_KEY) || '{}')

          // Filter out milestones already shown 2+ times
          const unseen = data.newly_unlocked.filter(
            (m: MilestoneData) => (celebrated[m.key] || 0) < 2
          )

          if (unseen.length > 0) {
            // Sort major milestones first
            const sorted = [...unseen].sort(
              (a: MilestoneData, b: MilestoneData) => (b.is_major ? 1 : 0) - (a.is_major ? 1 : 0)
            )
            // Only show max 2 celebrations per page load
            const toShow = sorted.slice(0, 2)
            setCelebrationQueue(toShow)
            setCelebration(toShow[0])

            // Mark all shown celebrations in localStorage
            for (const m of toShow) {
              celebrated[m.key] = (celebrated[m.key] || 0) + 1
            }
            localStorage.setItem(CELEBRATION_KEY, JSON.stringify(celebrated))

            // Also save to DB so they don't come back from the API
            for (const m of data.newly_unlocked) {
              fetch('/api/milestones/celebrate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ milestone_key: m.key, baby_id: babyId }),
              }).catch(() => {})
            }
          }
        }
      } catch {
        // Silently fail — milestones are enhancement, not critical
      } finally {
        setLoaded(true)
      }
    }

    fetchMilestones()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDismissCelebration = () => {
    setCelebrationQueue((prev) => {
      const next = prev.slice(1)
      if (next.length > 0) {
        setCelebration(next[0])
      } else {
        setCelebration(null)
      }
      return next
    })
  }

  if (!loaded) return null

  return (
    <>
      {/* Celebration overlay */}
      {celebration && (
        <MilestoneCelebration
          milestone={celebration}
          babyId={babyId}
          babyName={babyName}
          onDismiss={handleDismissCelebration}
        />
      )}

      {/* Countdown to next milestone */}
      {countdown && !celebration && (
        <div
          style={{
            background: 'linear-gradient(135deg, var(--color-accent-light), #FFF7ED)',
            border: '1.5px solid var(--color-accent)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '28px', lineHeight: 1, flexShrink: 0 }}>
            {countdown.days <= 3 ? '\u2728' : '\uD83C\uDF89'}
          </span>
          <div style={{ flex: 1 }}>
            <p
              style={{
                fontSize: '15px',
                fontWeight: 700,
                color: 'var(--color-accent)',
                lineHeight: 1.4,
                marginBottom: '2px',
              }}
            >
              {countdown.message}
            </p>
            {countdown.days <= 3 && (
              <p
                style={{
                  fontSize: '12px',
                  color: 'var(--color-accent)',
                  opacity: 0.8,
                }}
              >
                Almost there!
              </p>
            )}
          </div>
        </div>
      )}

      {/* Upcoming milestones card */}
      {upcoming.length > 0 && (
        <div
          style={{
            background: 'var(--color-white)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            marginBottom: '16px',
          }}
        >
          <p
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--color-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '14px',
            }}
          >
            Upcoming milestones
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {upcoming.map((m) => (
              <div
                key={m.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  background: 'var(--color-surface)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <span style={{ fontSize: '24px', lineHeight: 1, flexShrink: 0 }}>
                  {m.emoji}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--color-slate)',
                      lineHeight: 1.4,
                      marginBottom: '2px',
                    }}
                  >
                    {m.title}
                  </p>
                  <p
                    style={{
                      fontSize: '12px',
                      color: 'var(--color-muted)',
                    }}
                  >
                    {m.countdown_message || `In ${m.distance} ${m.distance_unit}`}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/milestones/new"
            style={{
              display: 'block',
              textAlign: 'center',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--color-primary)',
              textDecoration: 'none',
              marginTop: '12px',
              padding: '8px',
              minHeight: '36px',
            }}
          >
            Log a milestone &rarr;
          </Link>
        </div>
      )}
    </>
  )
}

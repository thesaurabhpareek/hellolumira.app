/**
 * @module StreakCounter
 * @description Premium streak counter with animated flame, milestone frames,
 *   weekly calendar dots, and contextual states (active, at-risk, broken).
 *   Pulse animation on active streaks, gold/diamond frames at milestones.
 * @version 1.0.0
 * @since March 2026
 */
'use client'

import { useEffect, useRef, useState } from 'react'

type StreakState = 'active' | 'at-risk' | 'broken'

interface StreakCounterProps {
  /** Current streak count */
  streak: number
  /** Whether the user checked in today */
  checkedInToday: boolean
  /** Longest streak for context (optional) */
  longestStreak?: number
  /** Days of the week the user has checked in (0=Sun, 1=Mon, ..., 6=Sat) */
  weekCheckins?: boolean[]
  /** Whether the user has a streak freeze active */
  hasStreakFreeze?: boolean
  /** Compact mode for inline display */
  compact?: boolean
}

const MILESTONE_THRESHOLDS = [7, 14, 30, 60, 90]

function getStreakState(streak: number, checkedInToday: boolean): StreakState {
  if (streak === 0) return 'broken'
  if (!checkedInToday && streak > 0) return 'at-risk'
  return 'active'
}

function getMilestoneFrame(streak: number): 'none' | 'gold' | 'diamond' {
  if (streak >= 90) return 'diamond'
  if (streak >= 30) return 'gold'
  if (MILESTONE_THRESHOLDS.includes(streak)) return 'gold'
  return 'none'
}

function isMilestone(streak: number): boolean {
  return MILESTONE_THRESHOLDS.includes(streak)
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export default function StreakCounter({
  streak,
  checkedInToday,
  longestStreak,
  weekCheckins,
  hasStreakFreeze = false,
  compact = false,
}: StreakCounterProps) {
  const state = getStreakState(streak, checkedInToday)
  const frame = getMilestoneFrame(streak)
  const milestone = isMilestone(streak)
  const [displayStreak, setDisplayStreak] = useState(0)
  const prevStreak = useRef(streak)
  const [mounted, setMounted] = useState(false)

  // Animate count on mount / change
  useEffect(() => {
    setMounted(true)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setDisplayStreak(streak)
      return
    }

    const from = prevStreak.current !== streak ? prevStreak.current : 0
    prevStreak.current = streak
    const diff = streak - from
    if (diff === 0) {
      setDisplayStreak(streak)
      return
    }

    const duration = 600
    const start = performance.now()

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayStreak(Math.round(from + diff * eased))
      if (progress < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [streak])

  const flameColor =
    state === 'active' ? '#F59E0B' : state === 'at-risk' ? '#D97706' : '#9CA3AF'
  const bgColor =
    state === 'active'
      ? 'rgba(245, 158, 11, 0.08)'
      : state === 'at-risk'
        ? 'rgba(217, 119, 6, 0.06)'
        : 'rgba(156, 163, 175, 0.06)'
  const borderColor =
    frame === 'diamond'
      ? '#60A5FA'
      : frame === 'gold'
        ? '#F59E0B'
        : state === 'active'
          ? 'rgba(245, 158, 11, 0.2)'
          : state === 'at-risk'
            ? 'rgba(217, 119, 6, 0.15)'
            : 'var(--color-border)'

  if (compact) {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          borderRadius: '100px',
          background: bgColor,
          border: `1.5px solid ${borderColor}`,
        }}
      >
        <span
          style={{
            fontSize: '16px',
            lineHeight: 1,
            animation: state === 'active' && mounted ? 'streak-flame-pulse 2s ease-in-out infinite' : 'none',
            filter: state === 'broken' ? 'grayscale(1)' : 'none',
          }}
        >
          {'\uD83D\uDD25'}
        </span>
        <span
          style={{
            fontSize: '14px',
            fontWeight: 700,
            color: state === 'broken' ? 'var(--color-muted)' : flameColor,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {displayStreak}
        </span>

        <style>{STREAK_KEYFRAMES}</style>
      </div>
    )
  }

  return (
    <div
      style={{
        background: bgColor,
        border: `1.5px solid ${borderColor}`,
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Milestone shimmer overlay */}
      {milestone && state === 'active' && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(105deg, transparent 40%, rgba(245, 158, 11, 0.06) 45%, rgba(245, 158, 11, 0.12) 50%, rgba(245, 158, 11, 0.06) 55%, transparent 60%)',
            animation: 'streak-shimmer 3s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Top row: flame + streak count */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
        {/* Flame with glow */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '52px',
            height: '52px',
          }}
        >
          {/* Glow ring for active streaks */}
          {state === 'active' && (
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: '-4px',
                borderRadius: '50%',
                background: frame === 'diamond'
                  ? 'radial-gradient(circle, rgba(96, 165, 250, 0.15) 0%, transparent 70%)'
                  : frame === 'gold'
                    ? 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, transparent 70%)',
                animation: mounted ? 'streak-glow-pulse 2s ease-in-out infinite' : 'none',
              }}
            />
          )}
          <span
            style={{
              fontSize: '32px',
              lineHeight: 1,
              filter: state === 'broken' ? 'grayscale(1) opacity(0.5)' : 'none',
              animation: state === 'active' && mounted ? 'streak-flame-pulse 2s ease-in-out infinite' : 'none',
            }}
          >
            {'\uD83D\uDD25'}
          </span>
        </div>

        {/* Streak number */}
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span
              style={{
                fontSize: '32px',
                fontWeight: 800,
                color: state === 'broken' ? 'var(--color-muted)' : 'var(--color-slate)',
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {displayStreak}
            </span>
            <span
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: state === 'broken' ? 'var(--color-muted)' : flameColor,
              }}
            >
              {streak === 1 ? 'day' : 'days'}
            </span>
          </div>

          {/* Contextual subtitle */}
          <p
            style={{
              fontSize: '13px',
              color: 'var(--color-muted)',
              marginTop: '4px',
              lineHeight: 1.4,
            }}
          >
            {state === 'active' && milestone && `Milestone reached!`}
            {state === 'active' && !milestone && (
              longestStreak && streak >= longestStreak
                ? 'Your longest streak ever!'
                : `Keep it going!`
            )}
            {state === 'at-risk' && 'Check in today to keep your streak!'}
            {state === 'broken' && 'Start a new streak today'}
          </p>
        </div>

        {/* Streak freeze badge */}
        {hasStreakFreeze && (
          <div
            style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              borderRadius: '100px',
              background: 'rgba(96, 165, 250, 0.1)',
              border: '1px solid rgba(96, 165, 250, 0.2)',
              fontSize: '12px',
              fontWeight: 600,
              color: '#3B82F6',
            }}
          >
            {'\u2744\uFE0F'} Freeze
          </div>
        )}
      </div>

      {/* Weekly calendar dots */}
      {weekCheckins && weekCheckins.length === 7 && (
        <div
          style={{
            display: 'flex',
            gap: '8px',
            justifyContent: 'space-between',
            padding: '12px 0 0',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          {DAY_LABELS.map((label, i) => {
            const done = weekCheckins[i]
            const isToday = new Date().getDay() === i
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  flex: 1,
                }}
              >
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: isToday ? 'var(--color-slate)' : 'var(--color-muted)',
                  }}
                >
                  {label}
                </span>
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: done
                      ? state === 'active' ? '#F59E0B' : 'var(--color-primary)'
                      : 'var(--color-border)',
                    border: isToday && !done ? '2px solid var(--color-primary)' : 'none',
                    transition: 'background 0.3s ease, transform 0.3s ease',
                    transform: done && isToday ? 'scale(1.2)' : 'scale(1)',
                  }}
                />
              </div>
            )
          })}
        </div>
      )}

      {/* Next milestone progress */}
      {state !== 'broken' && streak > 0 && (() => {
        const nextMilestone = MILESTONE_THRESHOLDS.find(m => m > streak)
        if (!nextMilestone) return null
        const progress = (streak / nextMilestone) * 100

        return (
          <div
            style={{
              marginTop: '14px',
              paddingTop: '12px',
              borderTop: weekCheckins ? 'none' : '1px solid var(--color-border)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-muted)' }}>
                Next milestone
              </span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: flameColor }}>
                {nextMilestone} days
              </span>
            </div>
            <div
              style={{
                height: '4px',
                borderRadius: '2px',
                background: 'var(--color-border)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  borderRadius: '2px',
                  background: `linear-gradient(90deg, ${flameColor}, #F59E0B)`,
                  width: mounted ? `${progress}%` : '0%',
                  transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              />
            </div>
          </div>
        )
      })()}

      <style>{STREAK_KEYFRAMES}</style>
    </div>
  )
}

const STREAK_KEYFRAMES = `
  @keyframes streak-flame-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.15) rotate(3deg); }
  }
  @keyframes streak-glow-pulse {
    0%, 100% { opacity: 0.5; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.1); }
  }
  @keyframes streak-shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(200%); }
  }
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
    }
  }
`

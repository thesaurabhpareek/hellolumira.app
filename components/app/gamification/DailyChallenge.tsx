/**
 * @module DailyChallenge
 * @description Daily parenting micro-challenges with animated checkmarks,
 *   progress tracking, bonus seeds for completion, time remaining indicator,
 *   and streak multiplier display.
 * @version 1.0.0
 * @since March 2026
 */
'use client'

import { useState, useEffect, useCallback } from 'react'

export interface Challenge {
  id: string
  label: string
  emoji: string
  completed: boolean
  /** Seeds awarded for this individual challenge */
  seeds: number
}

interface DailyChallengeProps {
  /** List of today's challenges */
  challenges: Challenge[]
  /** Bonus seeds for completing ALL challenges */
  bonusSeeds?: number
  /** Current streak multiplier (e.g., 1.5x) */
  streakMultiplier?: number
  /** Callback when a challenge is toggled */
  onToggle?: (challengeId: string) => void
  /** Hours remaining in the day (0-24) */
  hoursRemaining?: number
}

export default function DailyChallenge({
  challenges,
  bonusSeeds = 10,
  streakMultiplier,
  onToggle,
  hoursRemaining,
}: DailyChallengeProps) {
  const [localChallenges, setLocalChallenges] = useState(challenges)
  const [mounted, setMounted] = useState(false)
  const [justCompleted, setJustCompleted] = useState<string | null>(null)

  const completed = localChallenges.filter(c => c.completed).length
  const total = localChallenges.length
  const allDone = completed === total
  const progressPct = total > 0 ? (completed / total) * 100 : 0

  useEffect(() => {
    setMounted(true)
  }, [])

  // Sync from parent
  useEffect(() => {
    setLocalChallenges(challenges)
  }, [challenges])

  const handleToggle = useCallback((id: string) => {
    setLocalChallenges(prev =>
      prev.map(c => c.id === id ? { ...c, completed: !c.completed } : c)
    )
    setJustCompleted(id)
    setTimeout(() => setJustCompleted(null), 600)
    onToggle?.(id)
  }, [onToggle])

  const totalSeeds = localChallenges.reduce((sum, c) => sum + (c.completed ? c.seeds : 0), 0) +
    (allDone ? bonusSeeds : 0)

  return (
    <div
      style={{
        background: 'var(--color-white)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* All-done shimmer */}
      {allDone && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(105deg, transparent 35%, rgba(34, 197, 94, 0.06) 45%, rgba(34, 197, 94, 0.1) 50%, rgba(34, 197, 94, 0.06) 55%, transparent 65%)',
            animation: mounted ? 'challenge-shimmer 3s ease-in-out infinite' : 'none',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '18px' }}>{'\u2B50'}</span>
            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-slate)' }}>
              Daily Challenges
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-muted)' }}>
            {allDone ? 'All done! Great work!' : `${completed} of ${total} completed`}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          {/* Time remaining */}
          {hoursRemaining !== undefined && !allDone && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: hoursRemaining <= 4 ? 'var(--color-red)' : 'var(--color-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {'\u23F0'} {hoursRemaining}h left
            </span>
          )}

          {/* Streak multiplier */}
          {streakMultiplier && streakMultiplier > 1 && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#F59E0B',
                background: 'rgba(245, 158, 11, 0.08)',
                padding: '2px 8px',
                borderRadius: '100px',
              }}
            >
              {'\uD83D\uDD25'} {streakMultiplier}x
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: '4px',
          borderRadius: '2px',
          background: 'var(--color-border)',
          marginBottom: '16px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            borderRadius: '2px',
            background: allDone
              ? 'linear-gradient(90deg, #22C55E, #16A34A)'
              : 'linear-gradient(90deg, var(--color-primary), #4A9A8F)',
            width: mounted ? `${progressPct}%` : '0%',
            transition: 'width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        />
      </div>

      {/* Challenge items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {localChallenges.map((challenge) => {
          const isJustCompleted = justCompleted === challenge.id && challenge.completed

          return (
            <button
              key={challenge.id}
              onClick={() => handleToggle(challenge.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: challenge.completed ? 'rgba(34, 197, 94, 0.04)' : 'var(--color-surface)',
                border: `1px solid ${challenge.completed ? 'rgba(34, 197, 94, 0.15)' : 'transparent'}`,
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                minHeight: '52px',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {/* Checkbox */}
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  background: challenge.completed ? '#22C55E' : 'transparent',
                  border: challenge.completed ? 'none' : '2px solid var(--color-border)',
                  transition: 'all 0.2s ease',
                  transform: isJustCompleted ? 'scale(1.2)' : 'scale(1)',
                }}
              >
                {challenge.completed && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    style={{
                      animation: isJustCompleted ? 'challenge-check-draw 0.3s ease-out' : 'none',
                    }}
                  >
                    <path
                      d="M2.5 7L5.5 10L11.5 4"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>

              {/* Emoji */}
              <span style={{ fontSize: '18px', lineHeight: 1, flexShrink: 0 }}>
                {challenge.emoji}
              </span>

              {/* Label */}
              <span
                style={{
                  flex: 1,
                  fontSize: '14px',
                  fontWeight: 600,
                  color: challenge.completed ? 'var(--color-muted)' : 'var(--color-slate)',
                  textDecoration: challenge.completed ? 'line-through' : 'none',
                  transition: 'color 0.2s ease',
                }}
              >
                {challenge.label}
              </span>

              {/* Seeds reward */}
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: challenge.completed ? '#22C55E' : 'var(--color-accent)',
                  opacity: challenge.completed ? 0.7 : 1,
                  whiteSpace: 'nowrap',
                }}
              >
                +{challenge.seeds}
              </span>
            </button>
          )
        })}
      </div>

      {/* Bonus row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '14px',
          paddingTop: '12px',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <div>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: allDone ? '#22C55E' : 'var(--color-muted)',
            }}
          >
            {allDone ? 'Bonus earned!' : 'Complete all for bonus'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: allDone ? '#22C55E' : 'var(--color-accent)',
            }}
          >
            {'\uD83C\uDF31'} +{bonusSeeds} bonus
          </span>
          {allDone && (
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#22C55E',
                background: 'rgba(34, 197, 94, 0.08)',
                padding: '2px 8px',
                borderRadius: '100px',
              }}
            >
              Total: +{totalSeeds}
            </span>
          )}
        </div>
      </div>

      <style>{`
        @keyframes challenge-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes challenge-check-draw {
          0% { opacity: 0; transform: scale(0.5); }
          60% { transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>
    </div>
  )
}

/**
 * @module LevelRing
 * @description SVG circular progress ring (Apple Watch ring style) showing
 *   the user's current level, XP count, animated fill on mount, and glow
 *   effect at 100%. Color tiers change by level. Milestone markers around ring.
 * @version 1.0.0
 * @since March 2026
 */
'use client'

import { useEffect, useState, useRef } from 'react'

/** Level tier colors — synced with SeedsDisplay */
const LEVEL_TIERS: { min: number; color: string; name: string }[] = [
  { min: 0, color: '#8BC34A', name: 'Seedling' },
  { min: 2, color: '#4CAF50', name: 'Sprout' },
  { min: 3, color: '#3D8178', name: 'Sapling' },
  { min: 4, color: '#C4844E', name: 'Bloom' },
  { min: 5, color: '#D69E2E', name: 'Flourish' },
  { min: 6, color: '#F59E0B', name: 'Garden' },
  { min: 7, color: '#E87461', name: 'Orchard' },
  { min: 8, color: '#8B5CF6', name: 'Forest' },
  { min: 9, color: '#6366F1', name: 'Ecosystem' },
  { min: 10, color: '#EC4899', name: 'Legend' },
]

function getTierColor(level: number): string {
  let color = LEVEL_TIERS[0].color
  for (const tier of LEVEL_TIERS) {
    if (level >= tier.min) color = tier.color
  }
  return color
}

interface LevelRingProps {
  /** Current level (1-10+) */
  level: number
  /** Current XP/seeds */
  currentXP: number
  /** XP needed for next level */
  nextLevelXP: number
  /** Progress 0-100 within current level */
  progress: number
  /** Size of the ring in px (default: 160) */
  size?: number
  /** Ring stroke width (default: 10) */
  strokeWidth?: number
  /** Whether to show milestone markers */
  showMilestones?: boolean
  /** Label below the level number */
  label?: string
}

export default function LevelRing({
  level,
  currentXP,
  nextLevelXP,
  progress,
  size = 160,
  strokeWidth = 10,
  showMilestones = true,
  label,
}: LevelRingProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0)
  const [mounted, setMounted] = useState(false)
  const animRef = useRef<number | null>(null)

  const color = getTierColor(level)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const center = size / 2

  // Animate on mount
  useEffect(() => {
    setMounted(true)

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setAnimatedProgress(progress)
      return
    }

    const duration = 1200
    const start = performance.now()

    function tick(now: number) {
      const elapsed = now - start
      const t = Math.min(elapsed / duration, 1)
      // Ease-out elastic-ish
      const eased = 1 - Math.pow(1 - t, 4)
      setAnimatedProgress(progress * eased)
      if (t < 1) {
        animRef.current = requestAnimationFrame(tick)
      }
    }

    animRef.current = requestAnimationFrame(tick)
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [progress])

  const strokeDashoffset = circumference * (1 - animatedProgress / 100)
  const isComplete = progress >= 100

  // Milestone markers at 25%, 50%, 75%
  const milestoneAngles = [25, 50, 75].map(pct => {
    const angle = (pct / 100) * 360 - 90 // Start from top (-90deg)
    const rad = (angle * Math.PI) / 180
    return {
      pct,
      x: center + radius * Math.cos(rad),
      y: center + radius * Math.sin(rad),
      reached: progress >= pct,
    }
  })

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: `${size}px`,
          height: `${size}px`,
        }}
      >
        <svg
          width={size}
          height={size}
          style={{
            transform: 'rotate(-90deg)',
            filter: isComplete && mounted ? `drop-shadow(0 0 12px ${color}50)` : 'none',
            transition: 'filter 0.5s ease',
          }}
        >
          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Progress arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: mounted ? 'none' : 'stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          />

          {/* Glow overlay at 100% */}
          {isComplete && (
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth + 4}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={0}
              opacity={0.15}
              style={{
                animation: mounted ? 'level-ring-glow 2s ease-in-out infinite' : 'none',
              }}
            />
          )}
        </svg>

        {/* Milestone dots (on top of SVG) */}
        {showMilestones && milestoneAngles.map(({ pct, x, y, reached }) => (
          <div
            key={pct}
            style={{
              position: 'absolute',
              left: `${x}px`,
              top: `${y}px`,
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: reached ? color : 'var(--color-border)',
              border: `2px solid var(--color-white)`,
              transform: 'translate(-50%, -50%)',
              transition: 'background 0.5s ease',
              zIndex: 2,
            }}
          />
        ))}

        {/* Center content */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontSize: `${size * 0.22}px`,
              fontWeight: 800,
              color: 'var(--color-slate)',
              lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {level}
          </span>
          <span
            style={{
              fontSize: `${Math.max(size * 0.07, 11)}px`,
              fontWeight: 600,
              color: color,
              marginTop: '2px',
            }}
          >
            Level
          </span>
          <span
            style={{
              fontSize: `${Math.max(size * 0.065, 10)}px`,
              color: 'var(--color-muted)',
              marginTop: '2px',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {currentXP.toLocaleString()} XP
          </span>
        </div>
      </div>

      {/* Label below */}
      {label && (
        <p
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--color-muted)',
            marginTop: '12px',
            textAlign: 'center',
          }}
        >
          {label}
        </p>
      )}

      {/* XP to next level */}
      {progress < 100 && (
        <p
          style={{
            fontSize: '12px',
            color: 'var(--color-muted)',
            marginTop: label ? '4px' : '12px',
          }}
        >
          {(nextLevelXP - currentXP).toLocaleString()} XP to next level
        </p>
      )}

      <style>{`
        @keyframes level-ring-glow {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.25; }
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

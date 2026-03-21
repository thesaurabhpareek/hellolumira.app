/**
 * @module SeedsDisplay
 * @description Premium seeds/XP display with animated counter, level progress bar,
 *   sparkle effects on earning, and level badge. Shows seeds history on tap.
 * @version 1.0.0
 * @since March 2026
 */
'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

/** Level thresholds: [seeds_required, level_name, color] */
const LEVELS: [number, string, string][] = [
  [0, 'Seedling', '#8BC34A'],
  [50, 'Sprout', '#4CAF50'],
  [150, 'Sapling', '#3D8178'],
  [350, 'Bloom', '#C4844E'],
  [600, 'Flourish', '#D69E2E'],
  [1000, 'Garden', '#F59E0B'],
  [1500, 'Orchard', '#E87461'],
  [2500, 'Forest', '#8B5CF6'],
  [4000, 'Ecosystem', '#6366F1'],
  [6000, 'Lumira Legend', '#EC4899'],
]

function getLevel(seeds: number): { level: number; name: string; color: string; current: number; next: number; progress: number } {
  let levelIndex = 0
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (seeds >= LEVELS[i][0]) {
      levelIndex = i
      break
    }
  }

  const current = LEVELS[levelIndex][0]
  const next = levelIndex < LEVELS.length - 1 ? LEVELS[levelIndex + 1][0] : LEVELS[levelIndex][0]
  const progress = next > current ? ((seeds - current) / (next - current)) * 100 : 100

  return {
    level: levelIndex + 1,
    name: LEVELS[levelIndex][1],
    color: LEVELS[levelIndex][2],
    current,
    next,
    progress: Math.min(progress, 100),
  }
}

interface SeedsDisplayProps {
  /** Current seeds balance */
  balance: number
  /** Show level progress bar (default: true) */
  showLevel?: boolean
  /** Show sparkle on mount if balance > 0 (default: false) */
  celebrateOnMount?: boolean
  /** Callback when tapped / clicked */
  onTap?: () => void
  /** Compact pill mode */
  compact?: boolean
}

export default function SeedsDisplay({
  balance,
  showLevel = true,
  celebrateOnMount = false,
  onTap,
  compact = false,
}: SeedsDisplayProps) {
  const [displayBalance, setDisplayBalance] = useState(balance)
  const [earnedAmount, setEarnedAmount] = useState<number | null>(null)
  const [sparkle, setSparkle] = useState(false)
  const prevBalance = useRef(balance)
  const containerRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  const level = getLevel(balance)

  useEffect(() => {
    setMounted(true)

    if (celebrateOnMount && balance > 0) {
      setSparkle(true)
      setTimeout(() => setSparkle(false), 800)
    }
  }, [celebrateOnMount, balance])

  // Animate balance changes
  useEffect(() => {
    const prev = prevBalance.current
    const diff = balance - prev
    prevBalance.current = balance

    if (diff <= 0) {
      setDisplayBalance(balance)
      return
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setDisplayBalance(balance)
      setEarnedAmount(diff)
      setTimeout(() => setEarnedAmount(null), 2000)
      return
    }

    // Show floating "+N"
    setEarnedAmount(diff)
    setSparkle(true)
    setTimeout(() => setSparkle(false), 800)
    setTimeout(() => setEarnedAmount(null), 1500)

    // Counting animation
    const duration = 400
    const start = performance.now()

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayBalance(Math.round(prev + diff * eased))
      if (progress < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [balance])

  const handleClick = useCallback(() => {
    onTap?.()
  }, [onTap])

  if (compact) {
    return (
      <div
        ref={containerRef}
        onClick={handleClick}
        role={onTap ? 'button' : undefined}
        tabIndex={onTap ? 0 : undefined}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          borderRadius: '100px',
          background: 'var(--color-accent-light)',
          cursor: onTap ? 'pointer' : 'default',
          position: 'relative',
          overflow: 'visible',
          transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: sparkle ? 'scale(1.1)' : 'scale(1)',
        }}
      >
        <span style={{ fontSize: '14px', lineHeight: 1 }}>{'\uD83C\uDF31'}</span>
        <span
          style={{
            fontSize: '14px',
            fontWeight: 700,
            color: 'var(--color-accent)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {displayBalance}
        </span>

        {/* Level badge */}
        <span
          style={{
            fontSize: '10px',
            fontWeight: 700,
            color: '#fff',
            background: level.color,
            padding: '1px 6px',
            borderRadius: '100px',
            lineHeight: '16px',
          }}
        >
          L{level.level}
        </span>

        {/* Floating earned amount */}
        {earnedAmount !== null && (
          <span
            style={{
              position: 'absolute',
              top: '-8px',
              right: '-4px',
              fontSize: '13px',
              fontWeight: 700,
              color: '#22C55E',
              animation: 'seeds-float-up 1.2s ease-out forwards',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            +{earnedAmount}
          </span>
        )}

        <style>{SEEDS_KEYFRAMES}</style>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      role={onTap ? 'button' : undefined}
      tabIndex={onTap ? 0 : undefined}
      style={{
        background: 'var(--color-white)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        position: 'relative',
        overflow: 'visible',
        cursor: onTap ? 'pointer' : 'default',
      }}
    >
      {/* Top row: icon + balance + level badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: showLevel ? '16px' : '0' }}>
        {/* Seed icon with sparkle */}
        <div
          style={{
            position: 'relative',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            background: 'var(--color-accent-light)',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: '24px',
              lineHeight: 1,
              animation: sparkle && mounted ? 'seeds-icon-bounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
            }}
          >
            {'\uD83C\uDF31'}
          </span>

          {/* Sparkle particles */}
          {sparkle && (
            <>
              {[0, 1, 2, 3, 4, 5].map(i => (
                <span
                  key={i}
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    fontSize: '10px',
                    animation: `seeds-sparkle-burst 0.6s ${i * 0.06}s ease-out forwards`,
                    opacity: 0,
                    ['--spark-angle' as string]: `${(i / 6) * 360}deg`,
                    pointerEvents: 'none',
                  }}
                >
                  {'\u2728'}
                </span>
              ))}
            </>
          )}
        </div>

        {/* Balance + label */}
        <div style={{ flex: 1, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span
              style={{
                fontSize: '28px',
                fontWeight: 800,
                color: 'var(--color-slate)',
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {displayBalance}
            </span>
            <span
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--color-accent)',
              }}
            >
              seeds
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginTop: '2px' }}>
            {level.name}
          </p>

          {/* Floating earned amount */}
          {earnedAmount !== null && (
            <span
              style={{
                position: 'absolute',
                top: '-14px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '16px',
                fontWeight: 700,
                color: '#22C55E',
                animation: 'seeds-float-up 1.2s ease-out forwards',
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
                textShadow: '0 1px 4px rgba(0,0,0,0.1)',
              }}
            >
              {'\uD83C\uDF31'} +{earnedAmount}
            </span>
          )}
        </div>

        {/* Level badge */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '8px 12px',
            borderRadius: '12px',
            background: `${level.color}12`,
            border: `1px solid ${level.color}30`,
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: '18px', fontWeight: 800, color: level.color, lineHeight: 1 }}>
            {level.level}
          </span>
          <span style={{ fontSize: '10px', fontWeight: 600, color: level.color, opacity: 0.8 }}>
            Level
          </span>
        </div>
      </div>

      {/* Level progress bar */}
      {showLevel && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-muted)' }}>
              {level.progress < 100 ? `${Math.round(level.next - balance)} seeds to next level` : 'Max level reached!'}
            </span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: level.color }}>
              {Math.round(level.progress)}%
            </span>
          </div>
          <div
            style={{
              height: '6px',
              borderRadius: '3px',
              background: 'var(--color-border)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                borderRadius: '3px',
                background: `linear-gradient(90deg, ${level.color}, ${level.color}CC)`,
                width: mounted ? `${level.progress}%` : '0%',
                transition: 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
                boxShadow: level.progress >= 100 ? `0 0 8px ${level.color}40` : 'none',
              }}
            />
          </div>
        </div>
      )}

      <style>{SEEDS_KEYFRAMES}</style>
    </div>
  )
}

const SEEDS_KEYFRAMES = `
  @keyframes seeds-float-up {
    0% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
    60% { opacity: 1; transform: translateX(-50%) translateY(-20px) scale(1.15); }
    100% { opacity: 0; transform: translateX(-50%) translateY(-36px) scale(0.9); }
  }
  @keyframes seeds-icon-bounce {
    0% { transform: scale(1); }
    40% { transform: scale(1.3) rotate(-10deg); }
    70% { transform: scale(0.9) rotate(5deg); }
    100% { transform: scale(1) rotate(0); }
  }
  @keyframes seeds-sparkle-burst {
    0% { opacity: 1; transform: translate(0, 0) scale(1); }
    100% { opacity: 0; transform: translate(
      calc(cos(var(--spark-angle, 0deg)) * 24px),
      calc(sin(var(--spark-angle, 0deg)) * 24px)
    ) scale(0.3); }
  }
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
    }
  }
`

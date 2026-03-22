/**
 * @module AchievementUnlock
 * @description Full-screen overlay celebration when an achievement is unlocked.
 *   Features backdrop blur, badge scale-in with bounce, CSS confetti,
 *   typewriter title effect, seeds counter, and share/continue buttons.
 *   Auto-dismisses after 5 seconds.
 * @version 1.0.0
 * @since March 2026
 */
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { triggerHaptic } from '@/lib/animations'
import Confetti from './Confetti'
import type { AchievementTier } from './AchievementCard'

interface AchievementUnlockProps {
  /** Achievement name */
  name: string
  /** Achievement description */
  description: string
  /** Achievement emoji */
  emoji: string
  /** Achievement tier */
  tier: AchievementTier
  /** Seeds earned from this achievement */
  seedsEarned: number
  /** Callback when dismissed */
  onDismiss: () => void
  /** Callback when share is tapped */
  onShare?: () => void
  /** Auto-dismiss delay in ms (default: 5000) */
  autoDismissMs?: number
}

const TIER_COLORS: Record<AchievementTier, { primary: string; glow: string }> = {
  bronze: { primary: '#B45309', glow: 'rgba(180, 83, 9, 0.2)' },
  silver: { primary: '#6B7280', glow: 'rgba(107, 114, 128, 0.2)' },
  gold: { primary: '#D69E2E', glow: 'rgba(214, 158, 46, 0.25)' },
  diamond: { primary: '#6366F1', glow: 'rgba(99, 102, 241, 0.25)' },
}

export default function AchievementUnlock({
  name,
  description,
  emoji,
  tier,
  seedsEarned,
  onDismiss,
  onShare,
  autoDismissMs = 5000,
}: AchievementUnlockProps) {
  const [visible, setVisible] = useState(false)
  const [titleText, setTitleText] = useState('')
  const [showContent, setShowContent] = useState(false)
  const [seedsCount, setSeedsCount] = useState(0)
  const dismissTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const tierColors = TIER_COLORS[tier]

  const fullTitle = 'Achievement Unlocked!'

  const handleDismiss = useCallback(() => {
    setVisible(false)
    if (dismissTimeoutRef.current) clearTimeout(dismissTimeoutRef.current)
    setTimeout(() => onDismiss(), 300)
  }, [onDismiss])

  useEffect(() => {
    // Phase 1: show overlay
    const showTimer = setTimeout(() => {
      setVisible(true)
      triggerHaptic('success')
    }, 50)

    // Phase 2: typewriter title
    const typewriterStart = setTimeout(() => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion) {
        setTitleText(fullTitle)
        setShowContent(true)
        return
      }

      let charIndex = 0
      const typeInterval = setInterval(() => {
        charIndex++
        setTitleText(fullTitle.slice(0, charIndex))
        if (charIndex >= fullTitle.length) {
          clearInterval(typeInterval)
          // Phase 3: show content after title completes
          setTimeout(() => setShowContent(true), 200)
        }
      }, 40)

      return () => clearInterval(typeInterval)
    }, 500)

    // Phase 4: count up seeds
    const seedsTimer = setTimeout(() => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion) {
        setSeedsCount(seedsEarned)
        return
      }

      const duration = 500
      const start = performance.now()
      function tick(now: number) {
        const progress = Math.min((now - start) / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setSeedsCount(Math.round(seedsEarned * eased))
        if (progress < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, 1500)

    // Second haptic burst
    const hapticTimer = setTimeout(() => triggerHaptic('medium'), 400)

    // Auto-dismiss
    dismissTimeoutRef.current = setTimeout(handleDismiss, autoDismissMs)

    return () => {
      clearTimeout(showTimer)
      clearTimeout(typewriterStart)
      clearTimeout(seedsTimer)
      clearTimeout(hapticTimer)
      if (dismissTimeoutRef.current) clearTimeout(dismissTimeoutRef.current)
    }
  }, [autoDismissMs, handleDismiss, seedsEarned])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 0.3s ease',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={handleDismiss}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      />

      {/* Confetti */}
      <Confetti active={visible} count={60} duration={4000} />

      {/* Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          zIndex: 1,
          background: 'var(--color-white)',
          borderRadius: '24px',
          padding: '36px 28px 28px',
          maxWidth: '360px',
          width: '100%',
          textAlign: 'center',
          boxShadow: `0 24px 64px rgba(0, 0, 0, 0.2), 0 0 0 1px ${tierColors.glow}`,
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.8) translateY(20px)',
          transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Glow ring behind emoji */}
        <div
          style={{
            position: 'relative',
            display: 'inline-block',
            marginBottom: '16px',
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              background: `radial-gradient(circle, ${tierColors.glow} 0%, transparent 70%)`,
              animation: visible ? 'unlock-glow-pulse 2s ease-in-out infinite' : 'none',
            }}
          />
          <span
            style={{
              display: 'block',
              fontSize: '72px',
              lineHeight: 1,
              position: 'relative',
              animation: visible ? 'unlock-emoji-enter 0.6s 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both' : 'none',
            }}
          >
            {emoji}
          </span>
        </div>

        {/* Typewriter title */}
        <p
          style={{
            fontSize: '13px',
            fontWeight: 700,
            color: tierColors.primary,
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            marginBottom: '8px',
            minHeight: '18px',
          }}
        >
          {titleText}
          {titleText.length < fullTitle.length && (
            <span
              style={{
                display: 'inline-block',
                width: '2px',
                height: '14px',
                background: tierColors.primary,
                marginLeft: '2px',
                verticalAlign: 'middle',
                animation: 'unlock-cursor-blink 0.6s step-end infinite',
              }}
            />
          )}
        </p>

        {/* Achievement name + description */}
        <div
          style={{
            opacity: showContent ? 1 : 0,
            transform: showContent ? 'translateY(0)' : 'translateY(10px)',
            transition: 'all 0.4s ease',
          }}
        >
          <h2
            style={{
              fontSize: '22px',
              fontWeight: 800,
              color: 'var(--color-slate)',
              marginBottom: '6px',
              lineHeight: 1.3,
            }}
          >
            {name}
          </h2>
          <p
            style={{
              fontSize: '15px',
              color: 'var(--color-muted)',
              lineHeight: 1.5,
              marginBottom: '20px',
            }}
          >
            {description}
          </p>

          {/* Seeds earned */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '100px',
              background: 'var(--color-accent-light)',
              marginBottom: '24px',
            }}
          >
            <span style={{ fontSize: '16px' }}>{'\uD83C\uDF31'}</span>
            <span
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: 'var(--color-accent)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              +{seedsCount} seeds earned
            </span>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {onShare && (
              <button
                onClick={() => { onShare(); handleDismiss() }}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-primary)',
                  border: 'none',
                  color: '#fff',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  minHeight: '48px',
                  transition: 'opacity 0.15s ease',
                }}
              >
                Share achievement
              </button>
            )}
            <button
              onClick={handleDismiss}
              style={{
                width: '100%',
                padding: '14px 20px',
                borderRadius: 'var(--radius-md)',
                background: 'transparent',
                border: '1.5px solid var(--color-border)',
                color: 'var(--color-slate)',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                minHeight: '48px',
                transition: 'all 0.15s ease',
              }}
            >
              Continue
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes unlock-emoji-enter {
          0% { transform: scale(0.3) rotate(-15deg); opacity: 0; }
          60% { transform: scale(1.2) rotate(5deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes unlock-glow-pulse {
          0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.15); }
        }
        @keyframes unlock-cursor-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  )
}

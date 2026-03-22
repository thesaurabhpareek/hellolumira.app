/**
 * @module AchievementCard
 * @description Achievement card with tiers (Bronze, Silver, Gold, Diamond),
 *   locked/unlocked states, progress tracking, rarity indicator, and share button.
 *   Supports both individual card and collection grid layout.
 * @version 1.0.0
 * @since March 2026
 */
'use client'

import { useState, useEffect } from 'react'

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'diamond'

export interface Achievement {
  id: string
  name: string
  description: string
  emoji: string
  tier: AchievementTier
  /** 0-100 completion percentage */
  progress: number
  /** Whether this achievement is unlocked */
  unlocked: boolean
  /** When unlocked (ISO date) */
  unlockedAt?: string
  /** Seeds awarded for this achievement */
  seedsReward: number
  /** What fraction of users have earned this */
  rarityPercent?: number
  /** Whether this was just unlocked (triggers shine animation) */
  isNew?: boolean
  /** Criteria text for how to earn */
  criteria: string
}

interface AchievementCardProps {
  achievement: Achievement
  /** Callback when share button is tapped */
  onShare?: (achievement: Achievement) => void
  /** Compact mode for grid view */
  compact?: boolean
}

const TIER_CONFIG: Record<AchievementTier, { label: string; color: string; bgColor: string; borderColor: string; icon: string }> = {
  bronze: {
    label: 'Bronze',
    color: '#B45309',
    bgColor: 'rgba(180, 83, 9, 0.06)',
    borderColor: 'rgba(180, 83, 9, 0.15)',
    icon: '\uD83E\uDD49',
  },
  silver: {
    label: 'Silver',
    color: '#6B7280',
    bgColor: 'rgba(107, 114, 128, 0.06)',
    borderColor: 'rgba(107, 114, 128, 0.15)',
    icon: '\uD83E\uDD48',
  },
  gold: {
    label: 'Gold',
    color: '#D69E2E',
    bgColor: 'rgba(214, 158, 46, 0.06)',
    borderColor: 'rgba(214, 158, 46, 0.2)',
    icon: '\uD83E\uDD47',
  },
  diamond: {
    label: 'Diamond',
    color: '#6366F1',
    bgColor: 'rgba(99, 102, 241, 0.06)',
    borderColor: 'rgba(99, 102, 241, 0.15)',
    icon: '\uD83D\uDC8E',
  },
}

export default function AchievementCard({
  achievement,
  onShare,
  compact = false,
}: AchievementCardProps) {
  const [mounted, setMounted] = useState(false)
  const tier = TIER_CONFIG[achievement.tier]

  useEffect(() => {
    setMounted(true)
  }, [])

  if (compact) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '14px 8px',
          borderRadius: 'var(--radius-lg)',
          background: achievement.unlocked ? tier.bgColor : 'var(--color-surface)',
          border: `1px solid ${achievement.unlocked ? tier.borderColor : 'var(--color-border)'}`,
          position: 'relative',
          overflow: 'hidden',
          opacity: achievement.unlocked ? 1 : 0.6,
          transition: 'all 0.3s ease',
        }}
      >
        {/* New unlock shimmer */}
        {achievement.isNew && achievement.unlocked && (
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.4) 50%, transparent 65%)',
              animation: mounted ? 'achievement-shine 2s ease-in-out infinite' : 'none',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Emoji / locked icon */}
        <span
          style={{
            fontSize: '28px',
            lineHeight: 1,
            marginBottom: '8px',
            filter: achievement.unlocked ? 'none' : 'grayscale(1) brightness(0.7)',
            animation: achievement.isNew && mounted ? 'achievement-bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
          }}
        >
          {achievement.unlocked ? achievement.emoji : '?'}
        </span>

        {/* Name */}
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: achievement.unlocked ? 'var(--color-slate)' : 'var(--color-muted)',
            textAlign: 'center',
            lineHeight: 1.3,
          }}
        >
          {achievement.unlocked ? achievement.name : '???'}
        </span>

        {/* Mini progress bar */}
        {!achievement.unlocked && achievement.progress > 0 && (
          <div
            style={{
              width: '100%',
              height: '3px',
              borderRadius: '2px',
              background: 'var(--color-border)',
              marginTop: '8px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                borderRadius: '2px',
                background: tier.color,
                width: mounted ? `${achievement.progress}%` : '0%',
                transition: 'width 0.6s ease',
              }}
            />
          </div>
        )}

        <style>{ACHIEVEMENT_KEYFRAMES}</style>
      </div>
    )
  }

  return (
    <div
      style={{
        background: achievement.unlocked ? 'var(--color-white)' : 'var(--color-surface)',
        border: `1.5px solid ${achievement.unlocked ? tier.borderColor : 'var(--color-border)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Shimmer for new unlocks */}
      {achievement.isNew && achievement.unlocked && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.5) 45%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.5) 55%, transparent 65%)',
            animation: mounted ? 'achievement-shine 2.5s ease-in-out infinite' : 'none',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Top row: emoji + info + tier */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        {/* Achievement icon */}
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: achievement.unlocked ? tier.bgColor : 'var(--color-border)',
            border: `2px solid ${achievement.unlocked ? tier.borderColor : 'transparent'}`,
            flexShrink: 0,
            position: 'relative',
          }}
        >
          <span
            style={{
              fontSize: '28px',
              lineHeight: 1,
              filter: achievement.unlocked ? 'none' : 'grayscale(1) brightness(0.5)',
              animation: achievement.isNew && mounted ? 'achievement-bounce 0.6s 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) both' : 'none',
            }}
          >
            {achievement.unlocked ? achievement.emoji : '?'}
          </span>
        </div>

        {/* Info */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: achievement.unlocked ? 'var(--color-slate)' : 'var(--color-muted)',
              }}
            >
              {achievement.unlocked ? achievement.name : '???'}
            </span>

            {/* Tier badge */}
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: tier.color,
                background: tier.bgColor,
                padding: '2px 8px',
                borderRadius: '100px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {tier.icon} {tier.label}
            </span>
          </div>

          <p
            style={{
              fontSize: '13px',
              color: 'var(--color-muted)',
              lineHeight: 1.5,
              marginBottom: '0',
            }}
          >
            {achievement.unlocked ? achievement.description : achievement.criteria}
          </p>
        </div>
      </div>

      {/* Progress bar (when locked) */}
      {!achievement.unlocked && (
        <div style={{ marginTop: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
              {achievement.criteria}
            </span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: tier.color }}>
              {Math.round(achievement.progress)}%
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
                background: tier.color,
                width: mounted ? `${achievement.progress}%` : '0%',
                transition: 'width 0.8s ease',
              }}
            />
          </div>
        </div>
      )}

      {/* Bottom row (when unlocked): rarity + seeds + share */}
      {achievement.unlocked && (
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Seeds reward */}
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-accent)' }}>
              {'\uD83C\uDF31'} +{achievement.seedsReward} seeds
            </span>

            {/* Rarity */}
            {achievement.rarityPercent !== undefined && (
              <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                Earned by {achievement.rarityPercent}% of parents
              </span>
            )}
          </div>

          {/* Share button */}
          {onShare && (
            <button
              onClick={() => onShare(achievement)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                borderRadius: '100px',
                background: 'var(--color-primary-light)',
                border: 'none',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--color-primary)',
                cursor: 'pointer',
                minHeight: '32px',
              }}
            >
              Share
            </button>
          )}
        </div>
      )}

      <style>{ACHIEVEMENT_KEYFRAMES}</style>
    </div>
  )
}

/** Grid wrapper for a collection of achievement cards */
export function AchievementGrid({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px',
      }}
    >
      {children}
    </div>
  )
}

const ACHIEVEMENT_KEYFRAMES = `
  @keyframes achievement-shine {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(200%); }
  }
  @keyframes achievement-bounce {
    0% { transform: scale(0.5); opacity: 0; }
    60% { transform: scale(1.2); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
    }
  }
`

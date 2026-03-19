// app/(app)/profile/BadgesGrid.tsx — Badge grid display
'use client'

import type { Badge } from '@/lib/badges'

interface BadgesGridProps {
  badges: Badge[]
  earnedIds: string[]
}

export default function BadgesGrid({ badges, earnedIds }: BadgesGridProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
      }}
    >
      {badges.map((badge) => {
        const isEarned = earnedIds.includes(badge.id)
        return (
          <div
            key={badge.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '12px 8px',
              borderRadius: '12px',
              background: isEarned ? 'var(--color-primary-light)' : '#F9FAFB',
              opacity: isEarned ? 1 : 0.5,
              transition: 'opacity 0.2s ease',
            }}
          >
            <span
              style={{
                fontSize: '28px',
                marginBottom: '6px',
                filter: isEarned ? 'none' : 'grayscale(1)',
              }}
            >
              {badge.emoji}
            </span>
            <p
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: isEarned ? 'var(--color-slate)' : '#9CA3AF',
                textAlign: 'center',
                lineHeight: 1.3,
              }}
            >
              {badge.name}
            </p>
            <p
              style={{
                fontSize: '10px',
                color: isEarned ? 'var(--color-primary)' : '#D1D5DB',
                fontWeight: 600,
                marginTop: '2px',
              }}
            >
              +{badge.points} pts
            </p>
          </div>
        )
      })}
    </div>
  )
}

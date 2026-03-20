// app/(app)/profile/BadgesGrid.tsx — Badge grid with categories and earned state
'use client'

import { useState, useEffect } from 'react'
import type { Badge } from '@/lib/badges'

interface BadgesGridProps {
  badges: Badge[]
  earnedIds: string[]
  newBadgeId?: string | null
}

export default function BadgesGrid({ badges, earnedIds, newBadgeId }: BadgesGridProps) {
  const [celebratingId, setCelebratingId] = useState<string | null>(null)

  useEffect(() => {
    if (newBadgeId && earnedIds.includes(newBadgeId)) {
      setCelebratingId(newBadgeId)
      const timer = setTimeout(() => setCelebratingId(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [newBadgeId, earnedIds])

  // Group badges by category
  const categories = Array.from(new Set(badges.map((b) => b.category)))
  const categoryLabels: Record<string, string> = {
    engagement: 'Engagement',
    community: 'Community',
    learning: 'Learning',
    parenting: 'Parenting',
    streaks: 'Streaks',
    special: 'Special',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {categories.map((cat) => {
        const catBadges = badges.filter((b) => b.category === cat)
        const earnedInCat = catBadges.filter((b) => earnedIds.includes(b.id)).length
        return (
          <div key={cat}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '10px',
              }}
            >
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--color-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.3px',
                }}
              >
                {categoryLabels[cat] || cat}
              </p>
              <p
                style={{
                  fontSize: '11px',
                  color: 'var(--color-muted)',
                }}
              >
                {earnedInCat}/{catBadges.length}
              </p>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '10px',
              }}
            >
              {catBadges.map((badge) => {
                const isEarned = earnedIds.includes(badge.id)
                const isCelebrating = celebratingId === badge.id
                return (
                  <div
                    key={badge.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '12px 6px',
                      borderRadius: '12px',
                      background: isEarned ? 'var(--color-primary-light)' : '#F9FAFB',
                      opacity: isEarned ? 1 : 0.5,
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      ...(isCelebrating
                        ? {
                            boxShadow: '0 0 20px rgba(61, 129, 120, 0.3)',
                            transform: 'scale(1.05)',
                          }
                        : {}),
                    }}
                  >
                    {/* Celebration sparkle overlay */}
                    {isCelebrating && (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background:
                            'linear-gradient(135deg, rgba(61,129,120,0.1), rgba(196,132,78,0.1))',
                          borderRadius: '12px',
                          animation: 'pulse 1s ease-in-out infinite',
                        }}
                      />
                    )}
                    <span
                      style={{
                        fontSize: '26px',
                        marginBottom: '4px',
                        filter: isEarned ? 'none' : 'grayscale(1)',
                        position: 'relative',
                        ...(isCelebrating
                          ? { animation: 'badgeBounce 0.6s ease-in-out' }
                          : {}),
                      }}
                    >
                      {badge.emoji}
                    </span>
                    <p
                      style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        color: isEarned ? 'var(--color-slate)' : '#9CA3AF',
                        textAlign: 'center',
                        lineHeight: 1.3,
                        position: 'relative',
                      }}
                    >
                      {badge.name}
                    </p>
                    {isEarned && (
                      <p
                        style={{
                          fontSize: '9px',
                          color: 'var(--color-primary)',
                          fontWeight: 600,
                          marginTop: '2px',
                          position: 'relative',
                        }}
                      >
                        +{badge.points} pts
                      </p>
                    )}
                    {!isEarned && (
                      <p
                        style={{
                          fontSize: '9px',
                          color: '#D1D5DB',
                          marginTop: '2px',
                          textAlign: 'center',
                          position: 'relative',
                        }}
                      >
                        {badge.criteria}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Badge celebration animation styles */}
      <style>{`
        @keyframes badgeBounce {
          0% { transform: scale(1); }
          30% { transform: scale(1.3); }
          50% { transform: scale(0.9); }
          70% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  )
}

// app/(app)/profile/BadgesGrid.tsx — Badge grid with clickable detail cards
'use client'

import { useState, useEffect } from 'react'
import type { Badge } from '@/lib/badges'

interface BadgesGridProps {
  badges: Badge[]
  earnedIds: string[]
  earnedAt?: Record<string, string>
  newBadgeId?: string | null
}

// Map badge IDs to action paths
const BADGE_ACTIONS: Record<string, { label: string; href: string }> = {
  first_checkin: { label: 'Start a check-in', href: '/checkin' },
  week_warrior: { label: 'Check in daily', href: '/checkin' },
  month_champion: { label: 'Keep your streak!', href: '/checkin' },
  first_chat: { label: 'Chat with Lumira', href: '/checkin' },
  chats_10: { label: 'Keep chatting', href: '/checkin' },
  first_post: { label: 'Post in a tribe', href: '/tribes' },
  conversation_starter: { label: 'Post in tribes', href: '/tribes' },
  tribe_leader: { label: 'Explore tribes', href: '/tribes' },
  partner_invited: { label: 'Invite partner', href: '/settings' },
  first_share: { label: 'Share Lumira', href: '/share' },
  knowledge_seeker: { label: 'Read articles', href: '/content' },
  quiz_master: { label: 'Take a quiz', href: '/quiz' },
  first_article: { label: 'Read an article', href: '/content' },
  milestone_tracker: { label: 'Log a milestone', href: '/milestones/new' },
  concern_logger: { label: 'Log a concern', href: '/checkin' },
  memory_keeper: { label: 'Log milestones', href: '/milestones/new' },
  first_journal: { label: 'Write in journal', href: '/journal/new' },
  streak_3: { label: 'Check in daily', href: '/checkin' },
  streak_7: { label: 'Keep your streak!', href: '/checkin' },
  streak_30: { label: 'Keep going!', href: '/checkin' },
  profile_complete: { label: 'Complete profile', href: '/profile' },
  night_owl: { label: 'Check in late', href: '/checkin' },
  early_adopter: { label: 'Already earned!', href: '/home' },
}

export default function BadgesGrid({ badges, earnedIds, earnedAt = {}, newBadgeId }: BadgesGridProps) {
  const [celebratingId, setCelebratingId] = useState<string | null>(null)
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null)

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
    <>
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
                <p style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
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
                    <button
                      key={badge.id}
                      onClick={() => setSelectedBadge(badge)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '12px 6px',
                        borderRadius: '12px',
                        background: isEarned ? 'var(--color-primary-light)' : '#F9FAFB',
                        opacity: isEarned ? 1 : 0.6,
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden',
                        border: 'none',
                        cursor: 'pointer',
                        WebkitTapHighlightColor: 'transparent',
                        ...(isCelebrating
                          ? {
                              boxShadow: '0 0 20px rgba(61, 129, 120, 0.3)',
                              transform: 'scale(1.05)',
                            }
                          : {}),
                      }}
                    >
                      {isCelebrating && (
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(135deg, rgba(61,129,120,0.1), rgba(196,132,78,0.1))',
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
                          ...(isCelebrating ? { animation: 'badgeBounce 0.6s ease-in-out' } : {}),
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
                        <p style={{ fontSize: '9px', color: 'var(--color-primary)', fontWeight: 600, marginTop: '2px', position: 'relative' }}>
                          +{badge.points} pts
                        </p>
                      )}
                      {!isEarned && (
                        <p style={{ fontSize: '9px', color: '#D1D5DB', marginTop: '2px', textAlign: 'center', position: 'relative' }}>
                          Locked
                        </p>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}

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

      {/* Badge Detail Overlay */}
      {selectedBadge && (
        <>
          <div
            onClick={() => setSelectedBadge(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.35)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              zIndex: 199,
            }}
          />
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'var(--color-white)',
              borderRadius: '20px',
              padding: '28px 24px',
              textAlign: 'center',
              zIndex: 200,
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              maxWidth: '300px',
              width: '90%',
            }}
          >
            {/* Badge emoji */}
            <div
              style={{
                fontSize: '56px',
                marginBottom: '12px',
                filter: earnedIds.includes(selectedBadge.id) ? 'none' : 'grayscale(1)',
              }}
            >
              {selectedBadge.emoji}
            </div>

            {/* Badge name */}
            <h3
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--color-slate)',
                marginBottom: '6px',
              }}
            >
              {selectedBadge.name}
            </h3>

            {/* Status */}
            {(() => {
              const isEarnedBadge = earnedIds.includes(selectedBadge.id)
              const awardedDate = earnedAt[selectedBadge.id]
              const dateLabel = awardedDate
                ? new Date(awardedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : null
              return (
                <span
                  style={{
                    display: 'inline-block',
                    padding: '3px 12px',
                    borderRadius: '100px',
                    fontSize: '11px',
                    fontWeight: 600,
                    background: isEarnedBadge ? '#F0FDF4' : '#FEF3C7',
                    color: isEarnedBadge ? '#15803D' : '#92400E',
                    marginBottom: '14px',
                  }}
                >
                  {isEarnedBadge ? (dateLabel ? `Earned ${dateLabel} ✓` : 'Earned ✓') : 'Not earned yet'}
                </span>
              )
            })()}

            {/* Description */}
            <p
              style={{
                fontSize: '14px',
                color: 'var(--color-muted)',
                lineHeight: 1.6,
                marginBottom: '12px',
              }}
            >
              {selectedBadge.description}
            </p>

            {earnedIds.includes(selectedBadge.id) ? (
              /* Points earned — shown only for earned badges */
              <p
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--color-primary)',
                  marginBottom: '16px',
                }}
              >
                +{selectedBadge.points} points earned!
              </p>
            ) : (
              /* How to earn — shown only for unearned badges */
              <div
                style={{
                  background: 'var(--color-accent-light)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  marginBottom: '16px',
                  textAlign: 'left',
                }}
              >
                <p
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--color-accent)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.4px',
                    marginBottom: '4px',
                  }}
                >
                  How to earn
                </p>
                <p
                  style={{
                    fontSize: '13px',
                    color: 'var(--color-slate)',
                    lineHeight: 1.5,
                  }}
                >
                  {selectedBadge.criteria}
                </p>
              </div>
            )}

            {/* Action CTA for unearned badges */}
            {!earnedIds.includes(selectedBadge.id) && BADGE_ACTIONS[selectedBadge.id] && (
              <a
                href={BADGE_ACTIONS[selectedBadge.id].href}
                style={{
                  display: 'block',
                  padding: '12px 20px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-primary)',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  marginBottom: '12px',
                  minHeight: '44px',
                  lineHeight: '20px',
                }}
              >
                {BADGE_ACTIONS[selectedBadge.id].label}
              </a>
            )}

            {/* Dismiss */}
            <button
              onClick={() => setSelectedBadge(null)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '13px',
                color: 'var(--color-muted)',
                cursor: 'pointer',
                padding: '8px',
              }}
            >
              Close
            </button>
          </div>
        </>
      )}
    </>
  )
}

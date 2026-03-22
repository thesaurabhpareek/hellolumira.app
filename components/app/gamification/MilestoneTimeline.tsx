/**
 * @module MilestoneTimeline
 * @description Baby milestone tracker with gamification. Vertical timeline
 *   with nodes for completed, current, and upcoming milestones. Includes
 *   fun facts, photo attachment option, share button, and animated transitions.
 * @version 1.0.0
 * @since March 2026
 */
'use client'

import { useState, useEffect } from 'react'

type MilestoneStatus = 'completed' | 'current' | 'upcoming'

export interface TimelineMilestone {
  id: string
  title: string
  emoji: string
  status: MilestoneStatus
  /** ISO date when completed */
  completedDate?: string
  /** Expected timeframe (e.g., "4-6 months") */
  expectedTimeframe?: string
  /** Fun fact about this milestone */
  funFact?: string
  /** Optional photo URL */
  photoUrl?: string
  /** Description / notes */
  description?: string
  /** Seeds earned for logging */
  seedsEarned?: number
}

interface MilestoneTimelineProps {
  milestones: TimelineMilestone[]
  babyName?: string
  /** Callback when share is tapped */
  onShare?: (milestone: TimelineMilestone) => void
  /** Callback when photo is tapped */
  onAddPhoto?: (milestoneId: string) => void
  /** Callback when a milestone is tapped */
  onTap?: (milestone: TimelineMilestone) => void
}

const STATUS_CONFIG: Record<MilestoneStatus, { dotColor: string; lineColor: string; bgColor: string }> = {
  completed: {
    dotColor: '#22C55E',
    lineColor: '#22C55E',
    bgColor: 'rgba(34, 197, 94, 0.04)',
  },
  current: {
    dotColor: 'var(--color-primary)',
    lineColor: 'var(--color-border)',
    bgColor: 'var(--color-primary-light)',
  },
  upcoming: {
    dotColor: 'var(--color-border)',
    lineColor: 'var(--color-border)',
    bgColor: 'transparent',
  },
}

export default function MilestoneTimeline({
  milestones,
  babyName,
  onShare,
  onAddPhoto,
  onTap,
}: MilestoneTimelineProps) {
  const [mounted, setMounted] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const name = babyName || 'Baby'

  return (
    <div
      style={{
        background: 'var(--color-white)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <span style={{ fontSize: '18px' }}>{'\uD83C\uDF1F'}</span>
        <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-slate)' }}>
          {name}&apos;s Milestones
        </span>
      </div>

      {/* Timeline */}
      <div style={{ position: 'relative', paddingLeft: '32px' }}>
        {milestones.map((milestone, index) => {
          const config = STATUS_CONFIG[milestone.status]
          const isLast = index === milestones.length - 1
          const isExpanded = expandedId === milestone.id
          const delay = index * 80

          return (
            <div
              key={milestone.id}
              style={{
                position: 'relative',
                paddingBottom: isLast ? '0' : '24px',
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(8px)',
                transition: `opacity 0.3s ${delay}ms ease, transform 0.3s ${delay}ms ease`,
              }}
            >
              {/* Vertical line */}
              {!isLast && (
                <div
                  style={{
                    position: 'absolute',
                    left: '-20px',
                    top: '18px',
                    bottom: '0',
                    width: '2px',
                    background: config.lineColor,
                    transition: 'background 0.3s ease',
                  }}
                />
              )}

              {/* Timeline dot */}
              <div
                style={{
                  position: 'absolute',
                  left: '-26px',
                  top: '6px',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  background: milestone.status === 'upcoming' ? 'var(--color-white)' : config.dotColor,
                  border: milestone.status === 'upcoming'
                    ? '2px solid var(--color-border)'
                    : milestone.status === 'current'
                      ? '3px solid var(--color-primary)'
                      : 'none',
                  boxShadow: milestone.status === 'current'
                    ? '0 0 0 4px rgba(61, 129, 120, 0.15)'
                    : 'none',
                  zIndex: 2,
                  transition: 'all 0.3s ease',
                  animation: milestone.status === 'current' && mounted
                    ? 'timeline-pulse 2s ease-in-out infinite'
                    : 'none',
                }}
              >
                {milestone.status === 'completed' && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    style={{ position: 'absolute', top: '0', left: '0' }}
                  >
                    <path
                      d="M3 7L5.5 9.5L11 4"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>

              {/* Content card */}
              <button
                onClick={() => {
                  setExpandedId(isExpanded ? null : milestone.id)
                  onTap?.(milestone)
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: config.bgColor,
                  border: milestone.status === 'current'
                    ? '1px solid var(--color-primary-mid)'
                    : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  WebkitTapHighlightColor: 'transparent',
                  minHeight: '48px',
                }}
              >
                {/* Top row: emoji + title + date */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      fontSize: '24px',
                      lineHeight: 1,
                      filter: milestone.status === 'upcoming' ? 'grayscale(0.6) opacity(0.5)' : 'none',
                    }}
                  >
                    {milestone.emoji}
                  </span>
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: milestone.status === 'upcoming' ? 'var(--color-muted)' : 'var(--color-slate)',
                        marginBottom: '2px',
                      }}
                    >
                      {milestone.title}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                      {milestone.status === 'completed' && milestone.completedDate
                        ? new Date(milestone.completedDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : milestone.status === 'current'
                          ? 'Happening now!'
                          : milestone.expectedTimeframe
                            ? `Expected: ${milestone.expectedTimeframe}`
                            : ''}
                    </p>
                  </div>

                  {/* Seeds earned badge */}
                  {milestone.status === 'completed' && milestone.seedsEarned && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#22C55E',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      +{milestone.seedsEarned}
                    </span>
                  )}

                  {/* Expand indicator */}
                  <span
                    style={{
                      fontSize: '12px',
                      color: 'var(--color-muted)',
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                      transition: 'transform 0.2s ease',
                    }}
                  >
                    {'\u25BE'}
                  </span>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div
                    style={{
                      marginTop: '12px',
                      paddingTop: '12px',
                      borderTop: '1px solid var(--color-border)',
                    }}
                  >
                    {/* Description */}
                    {milestone.description && (
                      <p
                        style={{
                          fontSize: '13px',
                          color: 'var(--color-muted)',
                          lineHeight: 1.5,
                          marginBottom: '10px',
                        }}
                      >
                        {milestone.description}
                      </p>
                    )}

                    {/* Photo */}
                    {milestone.photoUrl && (
                      <div
                        style={{
                          width: '100%',
                          height: '160px',
                          borderRadius: 'var(--radius-md)',
                          background: `url(${milestone.photoUrl}) center/cover no-repeat`,
                          marginBottom: '10px',
                          border: '1px solid var(--color-border)',
                        }}
                      />
                    )}

                    {/* Fun fact */}
                    {milestone.funFact && (
                      <div
                        style={{
                          display: 'flex',
                          gap: '8px',
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'rgba(245, 158, 11, 0.05)',
                          marginBottom: '10px',
                        }}
                      >
                        <span style={{ fontSize: '14px', flexShrink: 0 }}>{'\uD83D\uDCA1'}</span>
                        <p style={{ fontSize: '12px', color: 'var(--color-muted)', lineHeight: 1.5 }}>
                          {milestone.funFact}
                        </p>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {milestone.status === 'completed' && onShare && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onShare(milestone) }}
                          style={{
                            padding: '8px 14px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--color-primary-light)',
                            border: 'none',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: 'var(--color-primary)',
                            cursor: 'pointer',
                            minHeight: '36px',
                          }}
                        >
                          Share
                        </button>
                      )}
                      {!milestone.photoUrl && onAddPhoto && milestone.status !== 'upcoming' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onAddPhoto(milestone.id) }}
                          style={{
                            padding: '8px 14px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--color-surface)',
                            border: '1px solid var(--color-border)',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: 'var(--color-slate)',
                            cursor: 'pointer',
                            minHeight: '36px',
                          }}
                        >
                          {'\uD83D\uDCF7'} Add photo
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </button>
            </div>
          )
        })}
      </div>

      <style>{`
        @keyframes timeline-pulse {
          0%, 100% { box-shadow: 0 0 0 4px rgba(61, 129, 120, 0.15); }
          50% { box-shadow: 0 0 0 8px rgba(61, 129, 120, 0.08); }
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

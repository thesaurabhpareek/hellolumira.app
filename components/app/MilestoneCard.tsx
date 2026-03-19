/**
 * @module MilestoneCard
 * @description Renders a single developmental milestone with type-specific
 *   emoji, date, and description. Uses a lookup table for milestone type emojis.
 * @version 1.0.0
 * @since March 2026
 */
import type { Milestone, MilestoneType } from '@/types/app'

const MILESTONE_EMOJIS: Record<MilestoneType, string> = {
  first_scan: '🖥️',
  anatomy_scan: '🩻',
  first_kick: '👟',
  third_trimester: '🌙',
  birth_plan_done: '📋',
  rolling: '🔄',
  sitting: '🧸',
  crawling: '🐾',
  pulling_to_stand: '🙌',
  first_word: '💬',
  pincer_grip: '✌️',
  walking: '👣',
  other: '⭐',
}

const MILESTONE_LABELS: Record<MilestoneType, string> = {
  first_scan: 'First scan',
  anatomy_scan: 'Anatomy scan',
  first_kick: 'First kick felt',
  third_trimester: 'Third trimester',
  birth_plan_done: 'Birth plan done',
  rolling: 'Rolling over',
  sitting: 'Sitting up',
  crawling: 'Crawling',
  pulling_to_stand: 'Pulling to stand',
  first_word: 'First word',
  pincer_grip: 'Pincer grip',
  walking: 'First steps',
  other: 'Milestone',
}

interface Props {
  milestone: Milestone
}

export default function MilestoneCard({ milestone }: Props) {
  const emoji = MILESTONE_EMOJIS[milestone.milestone_type] || '⭐'
  const label = MILESTONE_LABELS[milestone.milestone_type] || milestone.milestone_type

  const dateObj = new Date(milestone.milestone_date + 'T12:00:00')
  const dateLabel = dateObj.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div
      className="lumira-card"
      style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-primary-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          flexShrink: 0,
        }}
      >
        {emoji}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 700, fontSize: '16px', color: 'var(--color-slate)', marginBottom: '2px' }}>
          {label}
        </p>
        <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: milestone.notes ? '8px' : '0' }}>
          {dateLabel}
        </p>
        {milestone.notes && (
          <p style={{ fontSize: '14px', color: 'var(--color-slate)', lineHeight: 1.6 }}>
            {milestone.notes}
          </p>
        )}
      </div>
    </div>
  )
}

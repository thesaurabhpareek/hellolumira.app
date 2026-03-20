/**
 * @module MilestoneCard
 * @description Renders a single developmental milestone with type-specific
 *   emoji, date, and description.
 * @version 1.1.0 — Migrated inline styles → Tailwind classes
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
    <div className="lumira-card flex items-start gap-4">
      <div className="w-12 h-12 rounded-md bg-secondary flex items-center justify-center text-2xl shrink-0">
        {emoji}
      </div>
      <div className="flex-1">
        <p className="font-bold text-base text-foreground mb-0.5">{label}</p>
        <p className={`text-[13px] text-muted-foreground ${milestone.notes ? 'mb-2' : 'mb-0'}`}>
          {dateLabel}
        </p>
        {milestone.notes && (
          <p className="text-sm text-foreground leading-relaxed">{milestone.notes}</p>
        )}
      </div>
    </div>
  )
}

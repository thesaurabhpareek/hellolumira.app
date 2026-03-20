/**
 * @module PatternFlagCard
 * @description Displays a detected pattern alert with the pattern message
 *   and a link to discuss the pattern further with Lumira.
 * @version 1.0.0
 * @since March 2026
 */
'use client'

import Link from 'next/link'
import type { PatternType } from '@/types/app'

const PATTERN_ICONS: Record<PatternType, string> = {
  sleep: '😴',
  feeding: '🍼',
  mood: '😢',
  concern_followup: '💙',
  milestone_proximity: '🌟',
  parent_gap: '⏰',
  partner_divergence: '👫',
  nausea_severity: '🤢',
  prenatal_anxiety: '💭',
  appointment_proximity: '📅',
}

interface Props {
  type: PatternType
  message: string
  onDismiss: () => void
}

export default function PatternFlagCard({ type, message, onDismiss }: Props) {
  const icon = PATTERN_ICONS[type] || '💙'

  return (
    <div
      className="animate-fade-in bg-status-amber-light border border-[#F6E05E] rounded-lg relative"
      style={{ padding: '16px 20px' }}
    >
      {/* Dismiss button */}
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className="absolute top-3 right-3 bg-transparent border-none cursor-pointer text-muted-foreground text-[18px] px-2 py-1 min-h-[48px] min-w-[48px] flex items-center justify-center rounded-sm"
      >
        ×
      </button>

      {/* Content */}
      <div className="flex items-start gap-3 pr-8">
        <span className="text-[28px] shrink-0">{icon}</span>
        <div className="flex-1">
          <p className="text-sm font-semibold mb-1" style={{ color: '#744210' }}>
            Lumira noticed something
          </p>
          <p className="text-sm leading-[1.6] mb-[14px]" style={{ color: '#92400E' }}>
            {message}
          </p>
          <Link
            href="/checkin"
            className="inline-flex items-center px-4 py-2 bg-status-amber text-white rounded-md text-sm font-semibold no-underline min-h-[48px]"
          >
            Let&apos;s talk about it →
          </Link>
        </div>
      </div>
    </div>
  )
}

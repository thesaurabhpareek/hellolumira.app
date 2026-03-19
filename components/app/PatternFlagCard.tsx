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
      className="animate-fade-in"
      style={{
        background: 'var(--color-amber-light)',
        border: '1px solid #F6E05E',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        position: 'relative',
      }}
    >
      {/* Dismiss button */}
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--color-muted)',
          fontSize: '18px',
          padding: '4px 8px',
          minHeight: '32px',
          minWidth: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 'var(--radius-sm)',
        }}
      >
        ×
      </button>

      {/* Content */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', paddingRight: '32px' }}>
        <span style={{ fontSize: '28px', flexShrink: 0 }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <p
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#744210',
              marginBottom: '4px',
            }}
          >
            Lumira noticed something
          </p>
          <p
            style={{
              fontSize: '14px',
              lineHeight: 1.6,
              color: '#92400E',
              marginBottom: '14px',
            }}
          >
            {message}
          </p>
          <Link
            href="/checkin"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '8px 16px',
              background: 'var(--color-amber)',
              color: 'white',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
              minHeight: '40px',
            }}
          >
            Let&apos;s talk about it →
          </Link>
        </div>
      </div>
    </div>
  )
}

/**
 * @module EscalationBanner
 * @description Amber/rose banner displayed in the chat when an urgent or
 *   call-doctor escalation level is detected. Shows the immediate action
 *   recommendation with an optional phone link.
 * @version 1.0.0
 * @since March 2026
 */
'use client'

import type { EscalationLevel } from '@/types/chat'

interface Props {
  level: EscalationLevel
}

export default function EscalationBanner({ level }: Props) {
  if (level === 'none' || level === 'monitor') return null

  const isUrgent = level === 'urgent'
  const isCallDoctor = level === 'call_doctor'

  return (
    <div
      role="alert"
      className="mb-4 rounded-lg text-sm leading-[1.5]"
      style={{
        padding: '12px 16px',
        borderLeft: '3px solid',
        borderLeftColor: isUrgent
          ? 'var(--color-red)'
          : isCallDoctor
          ? 'var(--color-amber)'
          : 'var(--color-border)',
        background: isUrgent
          ? 'var(--color-red-light)'
          : isCallDoctor
          ? 'var(--color-amber-light)'
          : 'var(--color-surface)',
      }}
    >
      <span
        className="font-semibold"
        style={{ color: isUrgent ? 'var(--color-red)' : 'var(--color-amber)' }}
      >
        {isUrgent ? 'Seek care today' : 'Worth calling your pediatrician'}
      </span>
      <span
        className="ml-2"
        style={{
          color: isUrgent ? 'var(--color-red)' : 'var(--color-amber)',
          opacity: 0.8,
        }}
      >
        {isUrgent
          ? 'based on what you\'ve described'
          : 'when you get a chance'}
      </span>
    </div>
  )
}

/**
 * @module EmergencyOverlay
 * @description Full-screen blocking emergency overlay displayed when a red flag
 *   scanner detects an emergency-level concern. Cannot be dismissed by tapping
 *   outside — the user must explicitly acknowledge. Shows pre-authored emergency
 *   instructions with emergency service phone numbers.
 * @version 1.0.0
 * @since March 2026
 */
'use client'

import { useEffect, useRef } from 'react'

interface Props {
  message: string
  actionUrl: string | null
  onAcknowledge: () => void
}

export default function EmergencyOverlay({ message, actionUrl, onAcknowledge }: Props) {
  // Extract the first actionable line for the call button
  const callUrl = actionUrl || 'tel:911'
  const callButtonRef = useRef<HTMLAnchorElement>(null)

  // Auto-focus the call button on mount for accessibility
  useEffect(() => {
    callButtonRef.current?.focus()
  }, [])

  // Lock body scroll when overlay is open
  useEffect(() => {
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [])

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label="Emergency — this needs immediate attention"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        background: 'rgba(114, 28, 28, 0.95)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        paddingTop: 'max(24px, env(safe-area-inset-top))',
        paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
        touchAction: 'none',
        overscrollBehavior: 'contain',
      }}
    >
      {/* Warning icon */}
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
        }}
      >
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>

      <h2
        style={{
          color: 'white',
          fontSize: '21px',
          fontWeight: 700,
          marginBottom: '16px',
          textAlign: 'center',
        }}
      >
        This needs immediate attention
      </h2>

      <p
        style={{
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: '15px',
          lineHeight: 1.7,
          textAlign: 'center',
          marginBottom: '32px',
          maxWidth: '340px',
          whiteSpace: 'pre-wrap',
        }}
      >
        {message}
      </p>

      <div style={{ width: '100%', maxWidth: '340px' }}>
        {/* Call emergency services button */}
        <a
          ref={callButtonRef}
          href={callUrl}
          aria-label="Call emergency services now"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '56px',
            background: 'white',
            color: '#7C1F1F',
            fontWeight: 700,
            fontSize: '17px',
            borderRadius: '18px',
            textDecoration: 'none',
            marginBottom: '12px',
            touchAction: 'manipulation',
          }}
        >
          Call emergency services
        </a>

        {/* Acknowledge button */}
        <button
          onClick={onAcknowledge}
          style={{
            width: '100%',
            height: '52px',
            background: 'rgba(255, 255, 255, 0.15)',
            color: 'rgba(255, 255, 255, 0.9)',
            fontWeight: 500,
            fontSize: '15px',
            borderRadius: '14px',
            border: 'none',
            cursor: 'pointer',
            touchAction: 'manipulation',
          }}
        >
          I understand &mdash; I am getting help
        </button>
      </div>

      <p
        style={{
          color: 'rgba(255, 255, 255, 0.5)',
          fontSize: '12px',
          marginTop: '24px',
          textAlign: 'center',
        }}
      >
        Lumira will be here when you are ready
      </p>
    </div>
  )
}

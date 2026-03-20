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
      className="fixed inset-0 z-[300] flex flex-col items-center justify-center p-6"
      style={{
        background: 'rgba(114, 28, 28, 0.95)',
        paddingTop: 'max(24px, env(safe-area-inset-top))',
        paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
        touchAction: 'none',
        overscrollBehavior: 'contain',
      }}
    >
      {/* Warning icon */}
      <div
        className="w-[72px] h-[72px] rounded-full flex items-center justify-center mb-5"
        style={{ background: 'rgba(255, 255, 255, 0.15)' }}
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

      <h2 className="text-white text-[21px] font-bold mb-4 text-center">
        This needs immediate attention
      </h2>

      <p
        className="text-[15px] leading-[1.7] text-center mb-8 whitespace-pre-wrap"
        style={{ color: 'rgba(255, 255, 255, 0.9)', maxWidth: '340px' }}
      >
        {message}
      </p>

      <div className="w-full" style={{ maxWidth: '340px' }}>
        {/* Call emergency services button */}
        <a
          ref={callButtonRef}
          href={callUrl}
          aria-label="Call emergency services now"
          className="flex items-center justify-center w-full h-14 bg-white font-bold text-[17px] no-underline mb-3"
          style={{
            color: '#7C1F1F',
            borderRadius: '18px',
            touchAction: 'manipulation',
          }}
        >
          Call emergency services
        </a>

        {/* Acknowledge button */}
        <button
          onClick={onAcknowledge}
          className="w-full h-[52px] border-none cursor-pointer font-medium text-[15px]"
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            color: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '14px',
            touchAction: 'manipulation',
          }}
        >
          I understand &mdash; I am getting help
        </button>
      </div>

      <p
        className="text-[12px] mt-6 text-center"
        style={{ color: 'rgba(255, 255, 255, 0.5)' }}
      >
        Lumira will be here when you are ready
      </p>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { enrollPasskey, isPasskeySupported } from '@/lib/webauthn-client'

interface PasskeyEnrollmentSheetProps {
  isOpen: boolean
  onClose: () => void
  onEnrolled: () => void
}

export default function PasskeyEnrollmentSheet({ isOpen, onClose, onEnrolled }: PasskeyEnrollmentSheetProps) {
  const [enrolling, setEnrolling] = useState(false)
  const [error, setError] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [supported, setSupported] = useState<boolean | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && !!window.PublicKeyCredential)
  }, [])

  // Reset error when sheet opens
  useEffect(() => {
    if (isOpen) setError('')
  }, [isOpen])

  const handleEnroll = async () => {
    setEnrolling(true)
    setError('')

    const result = await enrollPasskey()
    setEnrolling(false)

    if (result.success) {
      // enrollPasskey already sets lumira_passkey_enrolled in localStorage
      setToastVisible(true)
      setTimeout(() => setToastVisible(false), 3000)
      onEnrolled()
    } else if (result.cancelled) {
      // Silent dismiss on cancel
      onClose()
    } else {
      setError(result.error)
    }
  }

  const handleDismiss = () => {
    try {
      localStorage.setItem('lumira_passkey_nudge_dismissed_at', String(Date.now()))
      const count = parseInt(localStorage.getItem('lumira_passkey_nudge_dismissed_count') ?? '0')
      localStorage.setItem('lumira_passkey_nudge_dismissed_count', String(count + 1))
    } catch {}
    onClose()
  }

  if (!mounted) return null

  // Don't render at all if passkeys are not supported on this browser
  if (!isOpen || supported === false) return null
  if (supported === null) return null  // still checking

  return (
    <>
      {/* Toast */}
      {toastVisible && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            bottom: '100px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--color-primary)',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: '100px',
            fontSize: '14px',
            fontWeight: 600,
            zIndex: 1000,
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          }}
        >
          Face ID sign-in is on.
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={handleDismiss}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 200,
            transition: 'opacity 0.3s ease',
          }}
          aria-hidden="true"
        />
      )}

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Set up Face ID sign-in"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 201,
          background: 'var(--color-card, #fff)',
          borderRadius: '20px 20px 0 0',
          padding: '0 24px 40px',
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.3s ease',
          boxShadow: '0 -4px 32px rgba(0,0,0,0.12)',
          maxWidth: '480px',
          margin: '0 auto',
        }}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '12px', paddingBottom: '8px' }}>
          <div
            style={{
              width: '36px',
              height: '4px',
              borderRadius: '2px',
              background: 'var(--color-border)',
            }}
          />
        </div>

        {/* Lock icon */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0 16px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'var(--color-primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" stroke="var(--color-primary)" strokeWidth="2" fill="none"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="16" r="1.5" fill="var(--color-primary)"/>
            </svg>
          </div>
        </div>

        {/* Headline */}
        <h2
          style={{
            textAlign: 'center',
            fontSize: '20px',
            fontWeight: 700,
            color: 'var(--color-slate)',
            marginBottom: '10px',
            lineHeight: 1.3,
          }}
        >
          Unlock Lumira with one tap
        </h2>

        {/* Body copy */}
        <p
          style={{
            textAlign: 'center',
            fontSize: '15px',
            color: 'var(--color-muted)',
            lineHeight: 1.6,
            marginBottom: '8px',
          }}
        >
          No waiting for an email. No expired links.
          <br />
          Just Face ID — even at 3am. Nothing is shared
          <br />
          with Lumira or Apple.
        </p>

        <p
          style={{
            textAlign: 'center',
            fontSize: '13px',
            color: 'var(--color-muted)',
            marginBottom: '24px',
            lineHeight: 1.5,
          }}
        >
          Works on all your Apple devices automatically.
        </p>

        {/* Inline error */}
        {error && (
          <div
            role="alert"
            style={{
              background: 'var(--color-red-light)',
              border: '1px solid #FEB2B2',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              marginBottom: '16px',
              fontSize: '14px',
              color: 'var(--color-red)',
            }}
          >
            {error}
          </div>
        )}

        {/* Primary CTA */}
        <button
          onClick={handleEnroll}
          disabled={enrolling}
          style={{
            width: '100%',
            height: '52px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-primary)',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 600,
            border: 'none',
            cursor: enrolling ? 'not-allowed' : 'pointer',
            opacity: enrolling ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '12px',
            fontFamily: 'inherit',
            transition: 'opacity 0.15s ease',
          }}
        >
          {enrolling ? (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }} aria-hidden="true">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              Setting up...
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="2"/>
                <path d="M4 20c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M8 12.5C8 10.015 9.79 8 12 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
              </svg>
              Set up Face ID sign-in
            </>
          )}
        </button>

        {/* Secondary dismiss */}
        <button
          onClick={handleDismiss}
          style={{
            width: '100%',
            height: '44px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '15px',
            color: 'var(--color-muted)',
            fontFamily: 'inherit',
          }}
        >
          Maybe later
        </button>
      </div>
    </>
  )
}

/**
 * Returns whether to show the passkey enrollment nudge and a function to mark it dismissed.
 * Not a React hook — safe to call from useEffect or event handlers.
 * For use in components: call inside useEffect or useMemo to avoid SSR issues.
 */
export function getPasskeyEnrollmentNudgeState(): { shouldShow: boolean; markDismissed: () => void } {
  if (typeof window === 'undefined') return { shouldShow: false, markDismissed: () => {} }

  const enrolled = localStorage.getItem('lumira_passkey_enrolled') === '1'
  if (enrolled) return { shouldShow: false, markDismissed: () => {} }

  const dismissedAt = parseInt(localStorage.getItem('lumira_passkey_nudge_dismissed_at') ?? '0')
  const count = parseInt(localStorage.getItem('lumira_passkey_nudge_dismissed_count') ?? '0')
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000

  if (count >= 3) return { shouldShow: false, markDismissed: () => {} }
  if (dismissedAt > sevenDaysAgo) return { shouldShow: false, markDismissed: () => {} }
  if (!isPasskeySupported()) return { shouldShow: false, markDismissed: () => {} }

  return {
    shouldShow: true,
    markDismissed: () => {
      localStorage.setItem('lumira_passkey_nudge_dismissed_at', String(Date.now()))
      localStorage.setItem('lumira_passkey_nudge_dismissed_count', String(count + 1))
    },
  }
}

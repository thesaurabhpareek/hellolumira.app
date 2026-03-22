'use client'

import { useEffect } from 'react'

export default function CheckinError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Checkin Error Boundary]', error)
  }, [error])

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100%',
        backgroundColor: '#FAFAF8',
        padding: '1rem',
      }}
    >
      <div
        style={{
          maxWidth: '480px',
          width: '100%',
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        <h2
          style={{
            fontSize: '1.125rem',
            fontWeight: 600,
            color: '#3D8178',
            marginBottom: '0.75rem',
          }}
        >
          Hmm, that didn&apos;t work
        </h2>
        <p
          style={{
            fontSize: '0.9rem',
            color: '#6B7280',
            marginBottom: '1.5rem',
            lineHeight: 1.5,
          }}
        >
          We couldn&apos;t get your check-in ready just now. Your data is safe — let&apos;s try again.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button
            onClick={reset}
            style={{
              padding: '0.625rem 1.25rem',
              backgroundColor: '#3D8178',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
          <a
            href="/home"
            style={{
              padding: '0.625rem 1.25rem',
              backgroundColor: 'transparent',
              color: '#3D8178',
              border: '1px solid #3D8178',
              borderRadius: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: 500,
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  )
}

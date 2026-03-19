'use client'

import { useEffect } from 'react'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[App Error Boundary]', error)
  }, [error])

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
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
            fontSize: '1.25rem',
            fontWeight: 600,
            color: '#3D8178',
            marginBottom: '0.75rem',
          }}
        >
          Something went wrong
        </h2>
        <p
          style={{
            fontSize: '0.95rem',
            color: '#6B7280',
            marginBottom: '1.5rem',
            lineHeight: 1.5,
          }}
        >
          Lumira ran into an unexpected issue. This has been logged and we are
          looking into it. You can try again or head back to the home screen.
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

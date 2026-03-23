'use client'

import { useEffect } from 'react'

export default function HistoryError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[History Error Boundary]', error)
  }, [error])

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        backgroundColor: 'var(--color-surface)',
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
            color: 'var(--color-primary)',
            marginBottom: '0.75rem',
          }}
        >
          Hmm, that didn&apos;t work
        </h2>
        <p
          style={{
            fontSize: '0.9rem',
            color: 'var(--color-muted)',
            marginBottom: '1.5rem',
            lineHeight: 1.5,
          }}
        >
          We couldn&apos;t load your journey right now. Your check-ins and conversations are safe — let&apos;s try again.
        </p>
        <button
          onClick={reset}
          style={{
            padding: '0.625rem 1.5rem',
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-white)',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '0.9rem',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </div>
    </div>
  )
}

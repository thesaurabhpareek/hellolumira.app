'use client'

import { useEffect } from 'react'

export default function ChatError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Chat Error Boundary]', error)
  }, [error])

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
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
          Chat is taking a moment
        </h2>
        <p
          style={{
            fontSize: '0.9rem',
            color: '#6B7280',
            marginBottom: '1.5rem',
            lineHeight: 1.5,
          }}
        >
          Lumira could not load the conversation right now. Your messages are
          safe. Please try again in a moment.
        </p>
        <button
          onClick={reset}
          style={{
            padding: '0.625rem 1.5rem',
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
      </div>
    </div>
  )
}

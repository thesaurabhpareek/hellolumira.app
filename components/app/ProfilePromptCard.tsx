// components/app/ProfilePromptCard.tsx — Dismissible profile completion prompt
'use client'

import { useState } from 'react'
import Link from 'next/link'

interface ProfilePromptCardProps {
  missingItem?: string
}

export default function ProfilePromptCard({ missingItem }: ProfilePromptCardProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div
      style={{
        position: 'relative',
        background: '#FFF7ED',
        border: '1.5px solid #C4844E',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        marginBottom: '16px',
      }}
    >
      {/* Dismiss button */}
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          width: '48px',
          height: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#C4844E',
          fontSize: '20px',
          padding: 0,
        }}
      >
        ✕
      </button>

      <p
        style={{
          fontSize: '16px',
          fontWeight: 700,
          color: '#1A1A1A',
          marginBottom: '6px',
          paddingRight: '36px',
        }}
      >
        Complete your profile
      </p>
      <p
        style={{
          fontSize: '14px',
          color: '#6B7280',
          lineHeight: 1.5,
          marginBottom: '16px',
        }}
      >
        {missingItem || 'Tell us about your feeding approach'}
      </p>
      <Link
        href="/profile"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '48px',
          padding: '0 24px',
          borderRadius: 'var(--radius-md)',
          background: '#C4844E',
          color: '#FFFFFF',
          fontSize: '15px',
          fontWeight: 600,
          textDecoration: 'none',
          transition: 'opacity 0.15s ease',
        }}
      >
        Answer 2 quick questions
      </Link>
    </div>
  )
}

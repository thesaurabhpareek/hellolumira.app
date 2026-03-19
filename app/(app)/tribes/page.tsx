'use client'

import { useState } from 'react'

const myTribes = [
  {
    emoji: '\u{1F319}',
    name: '3am Club',
    description: 'For the night shift parents',
    members: '2.1k',
    lastActive: '2 min ago',
  },
  {
    emoji: '\u{1F37C}',
    name: 'First-Time Parents',
    description: "We're all figuring it out together",
    members: '5.3k',
    lastActive: '5 min ago',
  },
  {
    emoji: '\u{1F33F}',
    name: 'Postpartum Support',
    description: 'Real talk about the fourth trimester',
    members: '1.8k',
    lastActive: '12 min ago',
  },
]

const suggestedTribes = [
  { emoji: '\u{1F476}', name: 'Sleep Regression Survivors', members: '892' },
  { emoji: '\u{1F951}', name: 'Starting Solids', members: '1.2k' },
  { emoji: '\u{1F4AA}', name: 'Back to Work', members: '743' },
]

export default function TribesPage() {
  const [toast, setToast] = useState<string | null>(null)

  const showToast = () => {
    setToast('Tribes launching soon!')
    setTimeout(() => setToast(null), 2000)
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--color-surface)',
        paddingBottom: '100px',
      }}
    >
      <div className="content-width mx-auto px-4 pt-6">
        {/* Header */}
        <h1 className="text-h1" style={{ color: 'var(--color-slate)', marginBottom: '4px' }}>
          Your Tribes
        </h1>
        <p
          className="text-body"
          style={{ color: 'var(--color-muted)', marginBottom: '24px', lineHeight: 1.5 }}
        >
          Connect with parents in your moment
        </p>

        {/* My Tribes */}
        <p
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--color-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '12px',
          }}
        >
          My Tribes
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
          {myTribes.map((tribe) => (
            <button
              key={tribe.name}
              onClick={showToast}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                width: '100%',
                padding: '14px 16px',
                background: 'var(--color-white)',
                border: '1px solid var(--color-border)',
                borderRadius: '14px',
                cursor: 'pointer',
                textAlign: 'left',
                minHeight: '48px',
                transition: 'background 0.15s ease',
              }}
            >
              <span style={{ fontSize: '28px', flexShrink: 0 }}>{tribe.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: '15px', color: 'var(--color-slate)', marginBottom: '2px' }}>
                  {tribe.name}
                </p>
                <p style={{ fontSize: '13px', color: 'var(--color-muted)', lineHeight: 1.4 }}>
                  {tribe.description}
                </p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary)' }}>
                  {tribe.members}
                </p>
                <p style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
                  {tribe.lastActive}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Suggested for You */}
        <p
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--color-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '12px',
          }}
        >
          Suggested for You
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
          {suggestedTribes.map((tribe) => (
            <button
              key={tribe.name}
              onClick={showToast}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '14px',
                width: '100%',
                padding: '14px 16px',
                background: 'var(--color-white)',
                border: '1px dashed var(--color-border)',
                borderRadius: '14px',
                cursor: 'pointer',
                textAlign: 'left',
                minHeight: '48px',
                transition: 'background 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                <span style={{ fontSize: '28px', flexShrink: 0 }}>{tribe.emoji}</span>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '15px', color: 'var(--color-slate)' }}>
                    {tribe.name}
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--color-muted)' }}>
                    {tribe.members} members
                  </p>
                </div>
              </div>
              <span
                style={{
                  padding: '6px 14px',
                  borderRadius: '100px',
                  background: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  fontSize: '13px',
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                Join
              </span>
            </button>
          ))}
        </div>

        {/* Browse All */}
        <button
          onClick={showToast}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            padding: '14px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-primary)',
            fontWeight: 600,
            fontSize: '15px',
            minHeight: '48px',
          }}
        >
          Browse All Tribes &rarr;
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--color-slate)',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: '100px',
            fontSize: '14px',
            fontWeight: 500,
            zIndex: 100,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          {toast}
        </div>
      )}
    </div>
  )
}

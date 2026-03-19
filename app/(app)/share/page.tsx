'use client'

import { useState } from 'react'

const SHARE_URL = 'https://hellolumira.app'
const SHARE_MESSAGE = "I've been using Lumira — a calm, thoughtful parenting companion — and I think you'd love it too. Check it out: https://hellolumira.app"

export default function SharePage() {
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(SHARE_URL)
      showToast('Link copied!')
    } catch {
      showToast('Could not copy link')
    }
  }

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(SHARE_MESSAGE)}`
  const emailUrl = `mailto:?subject=${encodeURIComponent('Check out Lumira')}&body=${encodeURIComponent(SHARE_MESSAGE)}`

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
        <h1 className="text-h1" style={{ color: 'var(--color-slate)', marginBottom: '24px' }}>
          Share Lumira
        </h1>

        {/* Illustration / message */}
        <div
          style={{
            textAlign: 'center',
            padding: '32px 20px',
            background: 'var(--color-primary-light)',
            borderRadius: '14px',
            marginBottom: '24px',
          }}
        >
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>
            {'\u{1F49B}'}
          </span>
          <p
            style={{
              fontSize: '16px',
              fontWeight: 600,
              color: 'var(--color-slate)',
              marginBottom: '8px',
              lineHeight: 1.4,
            }}
          >
            Know someone expecting or with a baby?
          </p>
          <p
            style={{
              fontSize: '14px',
              color: 'var(--color-muted)',
              lineHeight: 1.5,
            }}
          >
            Share Lumira with them.
          </p>
        </div>

        {/* Copyable link */}
        <p
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--color-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '8px',
          }}
        >
          Share Link
        </p>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            background: 'var(--color-white)',
            border: '1px solid var(--color-border)',
            borderRadius: '14px',
            marginBottom: '24px',
          }}
        >
          <p
            style={{
              flex: 1,
              fontSize: '15px',
              color: 'var(--color-slate)',
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {SHARE_URL}
          </p>
          <button
            onClick={copyLink}
            style={{
              padding: '8px 16px',
              borderRadius: '100px',
              border: 'none',
              background: 'var(--color-primary)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              flexShrink: 0,
              minHeight: '36px',
            }}
          >
            Copy
          </button>
        </div>

        {/* Share buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              width: '100%',
              padding: '14px',
              background: '#25D366',
              color: '#fff',
              borderRadius: '14px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '15px',
              minHeight: '48px',
              transition: 'opacity 0.15s ease',
            }}
          >
            Share via WhatsApp
          </a>
          <a
            href={emailUrl}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              width: '100%',
              padding: '14px',
              background: 'var(--color-primary)',
              color: '#fff',
              borderRadius: '14px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '15px',
              minHeight: '48px',
              transition: 'opacity 0.15s ease',
            }}
          >
            Share via Email
          </a>
          <button
            onClick={copyLink}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              width: '100%',
              padding: '14px',
              background: 'var(--color-white)',
              color: 'var(--color-slate)',
              border: '1.5px solid var(--color-border)',
              borderRadius: '14px',
              fontWeight: 600,
              fontSize: '15px',
              cursor: 'pointer',
              minHeight: '48px',
              transition: 'all 0.15s ease',
            }}
          >
            Copy Link
          </button>
        </div>

        {/* Referral stats placeholder */}
        <div
          className="lumira-card"
          style={{ textAlign: 'center' }}
        >
          <p style={{ fontSize: '14px', color: 'var(--color-muted)', lineHeight: 1.5 }}>
            Referral tracking coming soon
          </p>
        </div>
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

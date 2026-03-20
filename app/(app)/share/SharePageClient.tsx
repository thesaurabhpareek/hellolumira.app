// app/(app)/share/SharePageClient.tsx — Client-side share page with personalized link
'use client'

import { useState } from 'react'

interface SharePageClientProps {
  personalizedLink: string
  shareToken: string
  shareCount: number
  firstName: string
}

export default function SharePageClient({
  personalizedLink,
  shareCount,
  firstName,
}: SharePageClientProps) {
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  const shareMessage = `I've been using Lumira — a calm, thoughtful parenting companion — and I think you'd love it too. Check it out: ${personalizedLink}`

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(personalizedLink)
      showToast('Link copied!')

      // Award seeds for sharing
      fetch('/api/seeds/award', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'first_share' }),
      }).catch(() => {})
    } catch {
      showToast('Could not copy link')
    }
  }

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`
  const emailUrl = `mailto:?subject=${encodeURIComponent('Check out Lumira')}&body=${encodeURIComponent(shareMessage)}`

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--color-surface)',
        paddingBottom: '100px',
      }}
    >
      <div className="content-width mx-auto px-4 pt-6">
        {/* Back button */}
        <button
          onClick={() => window.history.back()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            color: '#3D8178',
            fontSize: '14px',
            fontWeight: 600,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '16px 0',
          }}
        >
          &larr; Back
        </button>

        {/* Header */}
        <h1 className="text-h1" style={{ color: 'var(--color-slate)', marginBottom: '24px' }}>
          Share the Love
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
            Share your personal link with them, {firstName}.
          </p>
        </div>

        {/* Personalized copyable link */}
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
          Your Personal Link
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
            marginBottom: '16px',
          }}
        >
          <p
            style={{
              flex: 1,
              fontSize: '14px',
              color: 'var(--color-slate)',
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {personalizedLink}
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

        {/* Share stats */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            padding: '16px',
            background: 'var(--color-accent-light)',
            borderRadius: '14px',
            marginBottom: '24px',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-accent)' }}>
              {shareCount}
            </p>
            <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-accent)', opacity: 0.8 }}>
              {shareCount === 1 ? 'Link click' : 'Link clicks'}
            </p>
          </div>
          <div
            style={{
              width: '1px',
              height: '32px',
              background: 'var(--color-accent)',
              opacity: 0.2,
            }}
          />
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-accent)' }}>
              🌱
            </p>
            <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-accent)', opacity: 0.8 }}>
              Earn seeds by sharing
            </p>
          </div>
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

        {/* How it works */}
        <div className="lumira-card">
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
            How it works
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { step: '1', text: 'Share your personal link with friends or family' },
              { step: '2', text: 'When they click your link and sign up, you both benefit' },
              { step: '3', text: 'Earn Seeds for every person you invite' },
            ].map((item) => (
              <div
                key={item.step}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <span
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'var(--color-primary-light)',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {item.step}
                </span>
                <p style={{ fontSize: '14px', color: 'var(--color-slate)', lineHeight: 1.5 }}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>
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

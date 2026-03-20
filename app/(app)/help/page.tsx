'use client'

import { useState } from 'react'

const quickLinks = [
  { title: 'How does Lumira work?', icon: '\u{2728}' },
  { title: 'Is my data safe?', icon: '\u{1F512}' },
  { title: 'How to use daily check-ins', icon: '\u{2705}' },
  { title: 'Understanding concern flows', icon: '\u{1F4AC}' },
  { title: 'Managing notifications', icon: '\u{1F514}' },
]

const contactOptions = [
  {
    title: 'Report a Bug',
    subtitle: "Something not working? Let us know.",
    href: 'mailto:hello@hellolumira.app?subject=Bug Report',
    icon: '\u{1F41B}',
  },
  {
    title: 'Send a Shoutout \u{1F49B}',
    subtitle: 'We love hearing what you enjoy.',
    href: 'mailto:hello@hellolumira.app?subject=Shoutout',
    icon: '\u{1F4E8}',
  },
  {
    title: 'Ask a Question',
    subtitle: "We'll get back to you soon.",
    href: 'mailto:hello@hellolumira.app?subject=Question',
    icon: '\u{2753}',
  },
]

export default function HelpPage() {
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  const filteredLinks = search.trim()
    ? quickLinks.filter((l) => l.title.toLowerCase().includes(search.toLowerCase()))
    : quickLinks

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
        <h1 className="text-h1" style={{ color: 'var(--color-slate)', marginBottom: '20px' }}>
          Get Help
        </h1>

        {/* Search bar */}
        <div style={{ marginBottom: '24px' }}>
          <input
            type="text"
            placeholder="What can we help with?"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: '14px',
              border: '1px solid var(--color-border)',
              background: 'var(--color-white)',
              fontSize: '15px',
              color: 'var(--color-slate)',
              outline: 'none',
              minHeight: '48px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Quick links */}
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
          Common Questions
        </p>

        <div className="lumira-card" style={{ marginBottom: '24px', padding: 0, overflow: 'hidden' }}>
          {filteredLinks.map((link, i) => (
            <button
              key={link.title}
              onClick={() => showToast('Help articles launching soon!')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '14px 16px',
                background: 'none',
                border: 'none',
                borderBottom: i < filteredLinks.length - 1 ? '1px solid var(--color-border)' : 'none',
                cursor: 'pointer',
                textAlign: 'left',
                minHeight: '48px',
                color: 'var(--color-slate)',
                fontSize: '15px',
                fontWeight: 500,
                transition: 'background 0.15s ease',
              }}
            >
              <span style={{ fontSize: '18px', flexShrink: 0 }}>{link.icon}</span>
              <span style={{ flex: 1 }}>{link.title}</span>
              <span style={{ color: 'var(--color-muted)', fontSize: '18px' }}>&rsaquo;</span>
            </button>
          ))}
          {filteredLinks.length === 0 && (
            <div style={{ padding: '24px 16px', textAlign: 'center' }}>
              <p style={{ fontSize: '14px', color: 'var(--color-muted)' }}>
                Nothing matching &quot;{search}&quot; — try a different word?
              </p>
            </div>
          )}
        </div>

        {/* Get in Touch */}
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
          Get in Touch
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
          {contactOptions.map((opt) => (
            <a
              key={opt.title}
              href={opt.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px 16px',
                background: 'var(--color-white)',
                border: '1px solid var(--color-border)',
                borderRadius: '14px',
                textDecoration: 'none',
                minHeight: '48px',
                transition: 'background 0.15s ease',
              }}
            >
              <span style={{ fontSize: '22px', flexShrink: 0 }}>{opt.icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: '15px', color: 'var(--color-slate)', marginBottom: '2px' }}>
                  {opt.title}
                </p>
                <p style={{ fontSize: '13px', color: 'var(--color-muted)' }}>
                  {opt.subtitle}
                </p>
              </div>
              <span style={{ color: 'var(--color-muted)', fontSize: '18px' }}>&rsaquo;</span>
            </a>
          ))}
        </div>

        {/* About Lumira */}
        <div
          style={{
            textAlign: 'center',
            padding: '24px 16px',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: '4px' }}>
            Lumira v1.0.0
          </p>
          <p style={{ fontSize: '13px', color: 'var(--color-muted)' }}>
            Made with {'\u2764\uFE0F'} by Saurabh &amp; Ishita
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

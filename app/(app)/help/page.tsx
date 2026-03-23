'use client'

import { useState } from 'react'
import { HELP_ARTICLES, HelpArticle } from '@/lib/help-articles'

const contactOptions = [
  {
    title: 'Report a Bug',
    subtitle: "Something not working? Let us know.",
    href: 'mailto:hello@hellolumira.app?subject=Bug Report',
    icon: '🐛',
  },
  {
    title: 'Send a Shoutout 💛',
    subtitle: 'We love hearing what you enjoy.',
    href: 'mailto:hello@hellolumira.app?subject=Shoutout',
    icon: '📨',
  },
  {
    title: 'Ask a Question',
    subtitle: "We'll get back to you soon.",
    href: 'mailto:hello@hellolumira.app?subject=Question',
    icon: '❓',
  },
]

const CATEGORY_LABELS: Record<HelpArticle['category'], string> = {
  'getting-started': 'Getting Started',
  'features': 'Features',
  'privacy': 'Privacy & Data',
  'wellbeing': 'Wellbeing',
}

const CATEGORY_ORDER: HelpArticle['category'][] = [
  'getting-started',
  'features',
  'privacy',
  'wellbeing',
]

function renderBody(body: string): React.ReactNode {
  const paragraphs = body.split('\n\n')
  return paragraphs.map((para, i) => {
    if (para.startsWith('## ')) {
      return (
        <h2
          key={i}
          style={{
            fontSize: '17px',
            fontWeight: 700,
            color: 'var(--color-slate)',
            marginTop: i === 0 ? '0' : '24px',
            marginBottom: '8px',
          }}
        >
          {para.slice(3)}
        </h2>
      )
    }
    return (
      <p
        key={i}
        style={{
          fontSize: '15px',
          color: 'var(--color-slate)',
          lineHeight: '1.6',
          marginBottom: '12px',
          whiteSpace: 'pre-line',
        }}
      >
        {para}
      </p>
    )
  })
}

export default function HelpPage() {
  const [search, setSearch] = useState('')
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null)

  const filteredArticles = search.trim()
    ? HELP_ARTICLES.filter((a) => a.title.toLowerCase().includes(search.toLowerCase()))
    : HELP_ARTICLES

  // Group filtered articles by category
  const grouped = CATEGORY_ORDER.reduce<Record<string, HelpArticle[]>>((acc, cat) => {
    const articles = filteredArticles.filter((a) => a.category === cat)
    if (articles.length > 0) acc[cat] = articles
    return acc
  }, {})

  // Article viewer
  if (selectedArticle) {
    return (
      <div
        style={{
          minHeight: '100%',
          background: 'var(--color-surface)',
          paddingBottom: '40px',
        }}
      >
        <div className="content-width mx-auto px-4 pt-6">
          <button
            onClick={() => setSelectedArticle(null)}
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
            &larr; Back to Help
          </button>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>{selectedArticle.icon}</div>
            <h1
              className="text-h1"
              style={{ color: 'var(--color-slate)', marginBottom: '8px' }}
            >
              {selectedArticle.title}
            </h1>
            <span
              style={{
                display: 'inline-block',
                fontSize: '12px',
                fontWeight: 600,
                color: '#3D8178',
                background: 'rgba(61,129,120,0.1)',
                borderRadius: '100px',
                padding: '3px 10px',
                textTransform: 'uppercase',
                letterSpacing: '0.4px',
              }}
            >
              {CATEGORY_LABELS[selectedArticle.category]}
            </span>
          </div>

          <div
            style={{
              background: 'var(--color-white)',
              border: '1px solid var(--color-border)',
              borderRadius: '16px',
              padding: '20px 16px',
            }}
          >
            {renderBody(selectedArticle.body)}
          </div>
        </div>
      </div>
    )
  }

  // Article list
  return (
    <div
      style={{
        minHeight: '100%',
        background: 'var(--color-surface)',
        paddingBottom: '24px',
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

        {/* Articles grouped by category */}
        {Object.keys(grouped).length === 0 ? (
          <div
            className="lumira-card"
            style={{ marginBottom: '24px', padding: '24px 16px', textAlign: 'center' }}
          >
            <p style={{ fontSize: '14px', color: 'var(--color-muted)' }}>
              Nothing matching &quot;{search}&quot; — try a different word?
            </p>
          </div>
        ) : (
          Object.entries(grouped).map(([cat, articles]) => (
            <div key={cat} style={{ marginBottom: '24px' }}>
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
                {CATEGORY_LABELS[cat as HelpArticle['category']]}
              </p>
              <div className="lumira-card" style={{ padding: 0, overflow: 'hidden' }}>
                {articles.map((article, i) => (
                  <button
                    key={article.id}
                    onClick={() => setSelectedArticle(article)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      width: '100%',
                      padding: '14px 16px',
                      background: 'none',
                      border: 'none',
                      borderBottom:
                        i < articles.length - 1 ? '1px solid var(--color-border)' : 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      minHeight: '48px',
                      color: 'var(--color-slate)',
                      fontSize: '15px',
                      fontWeight: 500,
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <span style={{ fontSize: '18px', flexShrink: 0 }}>{article.icon}</span>
                    <span style={{ flex: 1 }}>{article.title}</span>
                    <span style={{ color: 'var(--color-muted)', fontSize: '18px' }}>&rsaquo;</span>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}

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
                <p
                  style={{
                    fontWeight: 600,
                    fontSize: '15px',
                    color: 'var(--color-slate)',
                    marginBottom: '2px',
                  }}
                >
                  {opt.title}
                </p>
                <p style={{ fontSize: '13px', color: 'var(--color-muted)' }}>{opt.subtitle}</p>
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
    </div>
  )
}

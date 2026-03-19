'use client'

import { useState } from 'react'

const categories = ['All', 'Sleep', 'Feeding', 'Development', 'Wellness', 'Safety']

const articles = [
  {
    title: 'Understanding Sleep Regressions',
    category: 'Sleep',
    readTime: '4 min read',
    excerpt: 'Why your baby suddenly stopped sleeping through the night, and what you can do about it.',
  },
  {
    title: 'Introducing Solid Foods: A Week-by-Week Guide',
    category: 'Feeding',
    readTime: '6 min read',
    excerpt: 'A gentle, evidence-based approach to starting solids when your baby is ready.',
  },
  {
    title: "Is My Baby's Poop Normal?",
    category: 'Development',
    readTime: '3 min read',
    excerpt: "A visual guide to what's normal, what's not, and when to call your pediatrician.",
  },
  {
    title: "Self-Care When You're Running on Empty",
    category: 'Wellness',
    readTime: '5 min read',
    excerpt: 'Small, realistic ways to take care of yourself when everything feels like too much.',
  },
  {
    title: 'Safe Sleep: What the Evidence Actually Says',
    category: 'Safety',
    readTime: '7 min read',
    excerpt: 'Cutting through the noise to give you clear, research-backed safe sleep guidelines.',
  },
  {
    title: "When to Call the Doctor: A Parent's Quick Guide",
    category: 'Safety',
    readTime: '4 min read',
    excerpt: 'A handy reference for the signs and symptoms that warrant a call to your provider.',
  },
]

const categoryColors: Record<string, string> = {
  Sleep: '#6366F1',
  Feeding: '#C4844E',
  Development: '#3D8178',
  Wellness: '#D97706',
  Safety: '#DC2626',
}

export default function ContentPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeTab, setActiveTab] = useState<'foryou' | 'saved'>('foryou')
  const [toast, setToast] = useState<string | null>(null)

  const showToast = () => {
    setToast('Content library launching soon!')
    setTimeout(() => setToast(null), 2000)
  }

  const filtered = activeCategory === 'All'
    ? articles
    : articles.filter((a) => a.category === activeCategory)

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
          For You
        </h1>
        <p
          className="text-body"
          style={{ color: 'var(--color-muted)', marginBottom: '20px', lineHeight: 1.5 }}
        >
          Articles and guides for where you are right now
        </p>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0',
            marginBottom: '20px',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          {(['foryou', 'saved'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '12px 0',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid var(--color-primary)' : '2px solid transparent',
                color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-muted)',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                minHeight: '48px',
              }}
            >
              {tab === 'foryou' ? 'For You' : 'Saved'}
            </button>
          ))}
        </div>

        {activeTab === 'foryou' ? (
          <>
            {/* Filter chips */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                paddingBottom: '16px',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
              }}
            >
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '100px',
                    border: activeCategory === cat ? 'none' : '1px solid var(--color-border)',
                    background: activeCategory === cat ? 'var(--color-primary)' : 'var(--color-white)',
                    color: activeCategory === cat ? '#fff' : 'var(--color-slate)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    minHeight: '36px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Article cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filtered.map((article) => (
                <button
                  key={article.title}
                  onClick={showToast}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '16px',
                    background: 'var(--color-white)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '14px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    minHeight: '48px',
                    transition: 'background 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: '100px',
                        background: `${categoryColors[article.category]}15`,
                        color: categoryColors[article.category],
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.3px',
                      }}
                    >
                      {article.category}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                      {article.readTime}
                    </span>
                  </div>
                  <p
                    style={{
                      fontWeight: 600,
                      fontSize: '15px',
                      color: 'var(--color-slate)',
                      marginBottom: '6px',
                      lineHeight: 1.4,
                    }}
                  >
                    {article.title}
                  </p>
                  <p
                    style={{
                      fontSize: '13px',
                      color: 'var(--color-muted)',
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {article.excerpt}
                  </p>
                </button>
              ))}
            </div>
          </>
        ) : (
          /* Saved tab — empty state */
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '48px 24px',
            }}
          >
            <span style={{ fontSize: '40px', marginBottom: '16px' }}>
              {'\u{1F516}'}
            </span>
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-slate)', marginBottom: '6px' }}>
              No saved articles yet
            </p>
            <p style={{ fontSize: '13px', color: 'var(--color-muted)', lineHeight: 1.5, maxWidth: '260px' }}>
              Articles you save will appear here
            </p>
          </div>
        )}
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

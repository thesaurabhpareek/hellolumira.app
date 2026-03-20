'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

/* ── Types ─────────────────────────────────────────────────────────────────── */

type Stage = 'pregnancy' | 'infant' | 'toddler' | 'postpartum'
type Category = 'nutrition' | 'development' | 'wellness' | 'safety' | 'mental-health'

type Article = {
  id: string
  stage: Stage
  week_or_month: number
  title: string
  subtitle: string | null
  body: string
  category: Category
  author: string
  medically_reviewed: boolean
  culturally_sensitive: boolean
  reading_time_minutes: number
  tags: string[]
  created_at: string
  updated_at: string
}

/* ── Constants ─────────────────────────────────────────────────────────────── */

const stages: { key: Stage; label: string; unit: string }[] = [
  { key: 'pregnancy', label: 'Pregnancy', unit: 'Week' },
  { key: 'postpartum', label: 'Postpartum', unit: 'Week' },
  { key: 'infant', label: 'Infant', unit: 'Week' },
  { key: 'toddler', label: 'Toddler', unit: 'Month' },
]

const categories: { key: Category | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'nutrition', label: 'Nutrition' },
  { key: 'development', label: 'Development' },
  { key: 'wellness', label: 'Wellness' },
  { key: 'safety', label: 'Safety' },
  { key: 'mental-health', label: 'Mental Health' },
]

const categoryColors: Record<string, string> = {
  nutrition: '#C4844E',
  development: '#3D8178',
  wellness: '#D97706',
  safety: '#DC2626',
  'mental-health': '#6366F1',
}

const categoryLabels: Record<string, string> = {
  nutrition: 'Nutrition',
  development: 'Development',
  wellness: 'Wellness',
  safety: 'Safety',
  'mental-health': 'Mental Health',
}

/* ── Component ─────────────────────────────────────────────────────────────── */

export default function ContentPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [activeStage, setActiveStage] = useState<Stage>('pregnancy')
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchArticles = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('content_articles')
        .select('*')
        .eq('stage', activeStage)
        .order('week_or_month', { ascending: true })
        .order('created_at', { ascending: false })

      if (activeCategory !== 'all') {
        query = query.eq('category', activeCategory)
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        console.error('[Content] Fetch error:', fetchError)
        setError("We couldn't load articles right now. Please try again.")
        setArticles([])
      } else {
        setArticles(data || [])
      }
    } catch {
      setError("We couldn't load articles right now. Please try again.")
      setArticles([])
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStage, activeCategory])

  useEffect(() => {
    fetchArticles()
  }, [fetchArticles])

  useEffect(() => {
    setExpandedId(null)
  }, [activeStage, activeCategory])

  const stageUnit = stages.find((s) => s.key === activeStage)?.unit || 'Week'

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--color-surface)',
        paddingBottom: '100px',
      }}
    >
      <div className="content-width mx-auto px-4 pt-6">
        {/* ── Back button ──────────────────────────────────────────────── */}
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
        {/* ── Header ──────────────────────────────────────────────────── */}
        <h1
          className="text-h1"
          style={{ color: 'var(--color-slate)', marginBottom: '4px' }}
        >
          Read &amp; Learn
        </h1>
        <p
          className="text-body"
          style={{
            color: 'var(--color-muted)',
            marginBottom: '20px',
            lineHeight: 1.5,
          }}
        >
          Thoughtful, trusted articles for wherever you are in your journey
        </p>

        {/* ── Stage Tabs ──────────────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            gap: '0',
            marginBottom: '20px',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          {stages.map((stage) => (
            <button
              key={stage.key}
              onClick={() => {
                setActiveStage(stage.key)
                setActiveCategory('all')
              }}
              style={{
                flex: 1,
                padding: '12px 0',
                background: 'none',
                border: 'none',
                borderBottom:
                  activeStage === stage.key
                    ? '2px solid var(--color-primary)'
                    : '2px solid transparent',
                color:
                  activeStage === stage.key
                    ? 'var(--color-primary)'
                    : 'var(--color-muted)',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                minHeight: '48px',
                transition: 'color 0.15s ease, border-color 0.15s ease',
              }}
            >
              {stage.label}
            </button>
          ))}
        </div>

        {/* ── Category Filter Chips ───────────────────────────────────── */}
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
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              style={{
                padding: '8px 16px',
                borderRadius: '100px',
                border:
                  activeCategory === cat.key
                    ? 'none'
                    : '1px solid var(--color-border)',
                background:
                  activeCategory === cat.key
                    ? 'var(--color-primary)'
                    : 'var(--color-white)',
                color:
                  activeCategory === cat.key ? '#fff' : 'var(--color-slate)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                minHeight: '36px',
                transition: 'all 0.15s ease',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* ── Article Count ───────────────────────────────────────────── */}
        {!loading && !error && (
          <p
            style={{
              fontSize: '12px',
              color: 'var(--color-muted)',
              marginBottom: '12px',
              fontWeight: 500,
            }}
          >
            {articles.length} article{articles.length !== 1 ? 's' : ''}
          </p>
        )}

        {/* ── Loading State ───────────────────────────────────────────── */}
        {loading && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '48px 24px',
            }}
          >
            <div
              style={{
                width: '2rem',
                height: '2rem',
                border: '3px solid var(--color-border)',
                borderTopColor: 'var(--color-primary)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <p
              style={{
                fontSize: '14px',
                color: 'var(--color-muted)',
                marginTop: '12px',
              }}
            >
              Just a moment...
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* ── Error State ─────────────────────────────────────────────── */}
        {error && !loading && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '48px 24px',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontSize: '15px',
                fontWeight: 600,
                color: 'var(--color-slate)',
                marginBottom: '8px',
              }}
            >
              Hmm, something went wrong
            </p>
            <p
              style={{
                fontSize: '13px',
                color: 'var(--color-muted)',
                marginBottom: '16px',
                lineHeight: 1.5,
              }}
            >
              {error}
            </p>
            <button
              onClick={fetchArticles}
              style={{
                padding: '10px 24px',
                borderRadius: '100px',
                border: 'none',
                background: 'var(--color-primary)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                minHeight: '44px',
              }}
            >
              Try again
            </button>
          </div>
        )}

        {/* ── Empty State ─────────────────────────────────────────────── */}
        {!loading && !error && articles.length === 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '48px 24px',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontSize: '15px',
                fontWeight: 600,
                color: 'var(--color-slate)',
                marginBottom: '6px',
              }}
            >
              Nothing here yet
            </p>
            <p
              style={{
                fontSize: '13px',
                color: 'var(--color-muted)',
                lineHeight: 1.5,
                maxWidth: '260px',
              }}
            >
              We&apos;re working on new articles for this stage and category — check back soon!
            </p>
          </div>
        )}

        {/* ── Article Cards ───────────────────────────────────────────── */}
        {!loading && !error && articles.length > 0 && (
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            {articles.map((article) => {
              const isExpanded = expandedId === article.id
              const color = categoryColors[article.category] || '#3D8178'

              return (
                <div
                  key={article.id}
                  style={{
                    background: 'var(--color-white)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    transition: 'box-shadow 0.15s ease',
                    boxShadow: isExpanded
                      ? '0 2px 12px rgba(0,0,0,0.06)'
                      : 'none',
                  }}
                >
                  {/* Card header — always visible */}
                  <button
                    onClick={() =>
                      setExpandedId(isExpanded ? null : article.id)
                    }
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '16px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      minHeight: '48px',
                    }}
                  >
                    {/* Meta row */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '8px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span
                        style={{
                          padding: '3px 10px',
                          borderRadius: '100px',
                          background: `${color}15`,
                          color,
                          fontSize: '11px',
                          fontWeight: 700,
                          letterSpacing: '0.3px',
                        }}
                      >
                        {categoryLabels[article.category] || article.category}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          color: 'var(--color-muted)',
                          fontWeight: 500,
                        }}
                      >
                        {stageUnit} {article.week_or_month}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          color: 'var(--color-muted)',
                        }}
                      >
                        {article.reading_time_minutes} min read
                      </span>
                      {article.medically_reviewed && (
                        <span
                          style={{
                            fontSize: '10px',
                            color: '#3D8178',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '100px',
                            background: '#3D817810',
                          }}
                        >
                          Reviewed
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <p
                      style={{
                        fontWeight: 600,
                        fontSize: '15px',
                        color: 'var(--color-slate)',
                        marginBottom: article.subtitle ? '4px' : '0',
                        lineHeight: 1.4,
                      }}
                    >
                      {article.title}
                    </p>

                    {/* Subtitle */}
                    {article.subtitle && (
                      <p
                        style={{
                          fontSize: '13px',
                          color: 'var(--color-muted)',
                          lineHeight: 1.5,
                        }}
                      >
                        {article.subtitle}
                      </p>
                    )}
                  </button>

                  {/* Expanded body */}
                  {isExpanded && (
                    <div
                      style={{
                        padding: '0 16px 16px',
                        borderTop: '1px solid var(--color-border)',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '14px',
                          color: 'var(--color-slate)',
                          lineHeight: 1.7,
                          paddingTop: '16px',
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        <ArticleBody text={article.body} />
                      </div>

                      {/* Tags */}
                      {article.tags && article.tags.length > 0 && (
                        <div
                          style={{
                            display: 'flex',
                            gap: '6px',
                            flexWrap: 'wrap',
                            marginTop: '16px',
                            paddingTop: '12px',
                            borderTop: '1px solid var(--color-border)',
                          }}
                        >
                          {article.tags.map((tag) => (
                            <span
                              key={tag}
                              style={{
                                fontSize: '11px',
                                color: 'var(--color-muted)',
                                padding: '3px 10px',
                                borderRadius: '100px',
                                background: 'var(--color-surface)',
                                fontWeight: 500,
                              }}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Author line */}
                      <p
                        style={{
                          fontSize: '12px',
                          color: 'var(--color-muted)',
                          marginTop: '12px',
                          fontStyle: 'italic',
                        }}
                      >
                        By {article.author}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Article Body Renderer ─────────────────────────────────────────────────── */

function ArticleBody({ text }: { text: string }) {
  // Simple markdown-like rendering for bold text and sections
  const lines = text.split('\n')

  return (
    <>
      {lines.map((line, i) => {
        const trimmed = line.trim()

        // Empty line = paragraph break
        if (!trimmed) {
          return <br key={i} />
        }

        // Bold headers (lines starting with **)
        if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
          return (
            <p
              key={i}
              style={{
                fontWeight: 700,
                fontSize: '14px',
                color: 'var(--color-slate)',
                marginTop: '12px',
                marginBottom: '4px',
              }}
            >
              {trimmed.replace(/\*\*/g, '')}
            </p>
          )
        }

        // List items
        if (trimmed.startsWith('- ')) {
          const content = trimmed.slice(2)
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: '8px',
                paddingLeft: '4px',
                marginBottom: '4px',
              }}
            >
              <span
                style={{
                  color: 'var(--color-primary)',
                  flexShrink: 0,
                  lineHeight: 1.7,
                }}
              >
                {'\u2022'}
              </span>
              <span>{renderInlineBold(content)}</span>
            </div>
          )
        }

        // Regular paragraph
        return (
          <p key={i} style={{ marginBottom: '2px' }}>
            {renderInlineBold(trimmed)}
          </p>
        )
      })}
    </>
  )
}

/** Render inline **bold** text */
function renderInlineBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} style={{ fontWeight: 700 }}>
          {part.slice(2, -2)}
        </strong>
      )
    }
    return <span key={i}>{part}</span>
  })
}

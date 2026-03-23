'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

/* ── Types ─────────────────────────────────────────────────────────────────── */

type Stage = 'planning' | 'pregnancy' | 'infant' | 'toddler' | 'postpartum'
type Category = 'nutrition' | 'development' | 'wellness' | 'safety' | 'mental-health' | 'feeding' | 'sleep' | 'health' | 'relationships' | 'milestones'

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
  applicable_stages: string[] | null
  created_at: string
  updated_at: string
}

/* ── Constants ─────────────────────────────────────────────────────────────── */

const stages: { key: Stage; label: string; unit: string }[] = [
  { key: 'planning', label: 'Planning', unit: '' },
  { key: 'pregnancy', label: 'Pregnancy', unit: 'Week' },
  { key: 'postpartum', label: 'Postpartum', unit: 'Week' },
  { key: 'infant', label: 'Infant', unit: 'Week' },
  { key: 'toddler', label: 'Toddler', unit: 'Month' },
]

const categories: { key: Category | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'nutrition', label: '🥗 Nutrition' },
  { key: 'development', label: '📈 Development' },
  { key: 'wellness', label: '🧘 Wellness' },
  { key: 'safety', label: '🛡️ Safety' },
  { key: 'mental-health', label: '🧠 Mental Health' },
  { key: 'feeding', label: '🍼 Feeding' },
  { key: 'sleep', label: '😴 Sleep' },
  { key: 'health', label: '🩺 Health' },
  { key: 'relationships', label: '💕 Relationships' },
]

const categoryColors: Record<string, string> = {
  nutrition: '#C4844E',
  development: '#3D8178',
  wellness: '#D97706',
  safety: '#DC2626',
  'mental-health': '#6366F1',
  feeding: '#E07A5F',
  sleep: '#4A90D9',
  health: '#059669',
  relationships: '#EC4899',
  milestones: '#F59E0B',
}

const categoryLabels: Record<string, string> = {
  nutrition: 'Nutrition',
  development: 'Development',
  wellness: 'Wellness',
  safety: 'Safety',
  'mental-health': 'Mental Health',
  feeding: 'Feeding',
  sleep: 'Sleep',
  health: 'Health',
  relationships: 'Relationships',
}

/** Category emoji icons for visual richness */
const categoryIcons: Record<string, string> = {
  nutrition: '🥗',
  development: '📈',
  wellness: '🧘',
  safety: '🛡️',
  'mental-health': '🧠',
  feeding: '🍼',
  sleep: '😴',
  health: '🩺',
  relationships: '💕',
}

/* ── Component ─────────────────────────────────────────────────────────────── */

export default function ContentPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [activeStage, setActiveStage] = useState<Stage>('pregnancy')
  const [userStage, setUserStage] = useState<Stage | null>(null)
  const [userWeekOrMonth, setUserWeekOrMonth] = useState<number | null>(null)
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const supabase = useMemo(() => createClient(), [])

  // Auto-detect the user's stage and default the tab to it
  useEffect(() => {
    async function detectStage() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data: memberData } = await supabase
          .from('baby_profile_members')
          .select('baby_id')
          .eq('profile_id', user.id)
          .limit(1)
          .maybeSingle()
        if (!memberData?.baby_id) return
        const { data: babyData } = await supabase
          .from('baby_profiles')
          .select('stage, due_date, date_of_birth')
          .eq('id', memberData.baby_id)
          .single()
        if (babyData?.stage) {
          const detectedStage = babyData.stage as Stage
          setUserStage(detectedStage)
          setActiveStage(detectedStage)

          // Compute user's current week/month for proximity-based sorting
          const today = new Date()
          if (detectedStage === 'pregnancy' && babyData.due_date) {
            const msPerWeek = 7 * 24 * 60 * 60 * 1000
            const dueDate = new Date(babyData.due_date)
            const pregnancyWeek = Math.round(40 - (dueDate.getTime() - today.getTime()) / msPerWeek)
            setUserWeekOrMonth(Math.max(1, Math.min(42, pregnancyWeek)))
          } else if ((detectedStage === 'infant' || detectedStage === 'toddler' || detectedStage === 'postpartum') && babyData.date_of_birth) {
            const msPerDay = 24 * 60 * 60 * 1000
            const dob = new Date(babyData.date_of_birth)
            const daysOld = Math.floor((today.getTime() - dob.getTime()) / msPerDay)
            if (detectedStage === 'toddler') {
              setUserWeekOrMonth(Math.floor(daysOld / 30))
            } else {
              setUserWeekOrMonth(Math.floor(daysOld / 7))
            }
          }
        }
      } catch {
        // Silently fail — default stage is fine
      }
    }
    detectStage()
  }, [supabase])

  // Award seeds when an article is expanded/read
  const handleExpandArticle = useCallback((articleId: string | null) => {
    setExpandedId(articleId)
    if (articleId) {
      // Award seeds for reading article (fire-and-forget)
      fetch('/api/seeds/award', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'read_article' }),
      }).catch(() => {})

      // Check and award badges (fire-and-forget)
      fetch('/api/badges/check', { method: 'POST' }).catch(() => {})
    }
  }, [])

  const fetchArticles = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch articles for the active stage, including those with applicable_stages
      let query = supabase
        .from('content_articles')
        .select('*')
        .or(`stage.eq.${activeStage},applicable_stages.cs.{${activeStage}}`)
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
        const isOwnStage = activeStage === userStage
        const wom = userWeekOrMonth ?? 0
        const sorted = (data || []).sort((a, b) => {
          // Primary stage articles always rank above cross-stage matches
          const aIsPrimary = a.stage === activeStage ? 0 : 1
          const bIsPrimary = b.stage === activeStage ? 0 : 1
          if (aIsPrimary !== bIsPrimary) return aIsPrimary - bIsPrimary

          // On the user's own stage: sort by proximity to their current week/month
          // so the most relevant content surfaces first
          if (isOwnStage && wom > 0) {
            const aDelta = (a.week_or_month ?? 0) - wom
            const bDelta = (b.week_or_month ?? 0) - wom
            // Slight look-ahead preference: up to 4 ahead = same as current
            const aDist = aDelta >= 0 && aDelta <= 4 ? 0 : Math.abs(aDelta)
            const bDist = bDelta >= 0 && bDelta <= 4 ? 0 : Math.abs(bDelta)
            return aDist - bDist
          }

          // On other stages: chronological order (good for browsing the journey)
          return (a.week_or_month ?? 0) - (b.week_or_month ?? 0)
        })
        setArticles(sorted)
      }
    } catch {
      setError("We couldn't load articles right now. Please try again.")
      setArticles([])
    } finally {
      setLoading(false)
    }
  }, [activeStage, activeCategory, supabase, userStage, userWeekOrMonth])

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
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-surface)',
        paddingBottom: '24px',
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
          {userStage
            ? 'Curated for your stage \u2014 with trusted articles for every part of the journey'
            : 'Thoughtful, trusted articles for wherever you are in your journey'}
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
                fontSize: '13px',
                cursor: 'pointer',
                minHeight: '48px',
                transition: 'color 0.15s ease, border-color 0.15s ease',
                position: 'relative',
              }}
            >
              {stage.label}
              {userStage === stage.key && (
                <span
                  style={{
                    display: 'block',
                    fontSize: '9px',
                    fontWeight: 700,
                    color: '#87A28F',
                    letterSpacing: '0.3px',
                    marginTop: '2px',
                  }}
                >
                  Your stage
                </span>
              )}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3].map(i => (
              <div
                key={i}
                style={{
                  background: 'var(--color-white)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '14px',
                  padding: '16px',
                }}
              >
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <div className="lumira-skeleton" style={{ height: '22px', width: '80px', borderRadius: '100px' }} />
                  <div className="lumira-skeleton" style={{ height: '22px', width: '50px', borderRadius: '100px' }} />
                </div>
                <div className="lumira-skeleton" style={{ height: '18px', width: '85%', borderRadius: '6px', marginBottom: '6px' }} />
                <div className="lumira-skeleton" style={{ height: '14px', width: '60%', borderRadius: '6px' }} />
              </div>
            ))}
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
              // Show "For you" if article is cross-stage (matched via target_stages, not primary stage)
              const isCrossStageMatch = article.stage !== activeStage
                && article.applicable_stages?.includes(activeStage)

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
                      ? '0 4px 16px rgba(0,0,0,0.08)'
                      : '0 1px 3px rgba(0,0,0,0.03)',
                  }}
                >
                  {/* Card header — always visible */}
                  <button
                    onClick={() =>
                      handleExpandArticle(isExpanded ? null : article.id)
                    }
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '18px 18px 16px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      minHeight: '48px',
                    }}
                  >
                    {/* Title — prominent, first thing you read */}
                    <p
                      style={{
                        fontWeight: 700,
                        fontSize: '16px',
                        color: 'var(--color-slate)',
                        marginBottom: article.subtitle ? '6px' : '10px',
                        lineHeight: 1.4,
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {article.title}
                    </p>

                    {/* Subtitle — excerpt text */}
                    {article.subtitle && (
                      <p
                        style={{
                          fontSize: '14px',
                          color: 'var(--color-muted)',
                          lineHeight: 1.55,
                          marginBottom: '10px',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {article.subtitle}
                      </p>
                    )}

                    {/* Meta row — small pills below content */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span
                        style={{
                          padding: '3px 10px',
                          borderRadius: '100px',
                          background: `${color}12`,
                          color,
                          fontSize: '11px',
                          fontWeight: 600,
                          letterSpacing: '0.2px',
                        }}
                      >
                        {categoryIcons[article.category] || ''} {categoryLabels[article.category] || article.category}
                      </span>
                      {stageUnit && (
                        <span
                          style={{
                            fontSize: '11px',
                            color: 'var(--color-muted)',
                            fontWeight: 500,
                          }}
                        >
                          {stageUnit} {article.week_or_month}
                        </span>
                      )}
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
                      {isCrossStageMatch && (
                        <span
                          style={{
                            fontSize: '10px',
                            color: '#87A28F',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '100px',
                            background: '#87A28F15',
                          }}
                        >
                          For you
                        </span>
                      )}
                      {/* Expand indicator */}
                      <span
                        style={{
                          marginLeft: 'auto',
                          fontSize: '12px',
                          color: 'var(--color-muted)',
                          transition: 'transform 0.2s ease',
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        }}
                      >
                        {'\u25BE'}
                      </span>
                    </div>
                  </button>

                  {/* Expanded body */}
                  {isExpanded && (
                    <div
                      style={{
                        padding: '0 18px 18px',
                        borderTop: '1px solid var(--color-border)',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '15px',
                          color: 'var(--color-slate)',
                          lineHeight: 1.75,
                          paddingTop: '18px',
                          whiteSpace: 'pre-wrap',
                          maxWidth: '600px',
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
                            marginTop: '18px',
                            paddingTop: '14px',
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
                fontSize: '15px',
                color: 'var(--color-slate)',
                marginTop: '16px',
                marginBottom: '6px',
                lineHeight: 1.4,
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
                marginBottom: '6px',
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
          <p key={i} style={{ marginBottom: '6px', lineHeight: 1.75 }}>
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

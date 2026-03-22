'use client'

import {
  useState,
  useCallback,
  useEffect,
  type CSSProperties,
  type ReactNode,
} from 'react'
import Image from 'next/image'

/* ══════════════════════════════════════════════════════════════════════════════
   ContentCard — Flexible card system for articles, guides, videos
   Variants: hero, standard, compact, video, article
   Features: bookmark with animation, reading progress, category color coding,
             "New" badge, estimated read/watch time, author info, engagement
   ══════════════════════════════════════════════════════════════════════════════ */

type CardVariant = 'hero' | 'standard' | 'compact' | 'video' | 'article'

/** Category-to-color mapping from the Lumira design system */
const CATEGORY_COLORS: Record<string, string> = {
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

interface ContentCardProps {
  variant?: CardVariant
  /** Title text */
  title: string
  /** Subtitle or excerpt */
  subtitle?: string | null
  /** Thumbnail/image URL */
  image?: string | null
  /** Category key (maps to color) */
  category?: string | null
  /** Category display label */
  categoryLabel?: string | null
  /** Author name */
  author?: string | null
  /** Author avatar URL or emoji */
  authorAvatar?: string | null
  /** Estimated reading time in minutes */
  readTime?: number | null
  /** Video duration string e.g. "12:34" */
  videoDuration?: string | null
  /** Whether this content is new */
  isNew?: boolean
  /** Reading progress 0-100 */
  readingProgress?: number | null
  /** Whether content is bookmarked */
  bookmarked?: boolean
  /** Engagement: views count */
  views?: number | null
  /** Engagement: saves count */
  saves?: number | null
  /** Engagement: comments count */
  comments?: number | null
  /** Called on card tap */
  onClick?: () => void
  /** Called on bookmark toggle */
  onBookmark?: (bookmarked: boolean) => void
  /** Additional styles */
  style?: CSSProperties
  className?: string
}

/* ── Styles ──────────────────────────────────────────────────────────────── */

const STYLE_ID = 'lumira-content-card-styles'

function ensureStyles() {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID)) return

  const s = document.createElement('style')
  s.id = STYLE_ID
  s.textContent = `
    .lumira-cc {
      position: relative;
      overflow: hidden;
      background: var(--color-white, #fff);
      border: 1px solid var(--color-border, #E2E8F0);
      border-radius: var(--radius-lg, 16px);
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      transition: box-shadow var(--duration-fast, 200ms) var(--ease-default, ease),
                  transform var(--duration-fast, 200ms) var(--ease-default, ease);
    }
    .lumira-cc:active {
      transform: scale(0.985);
    }

    /* Bookmark button */
    .lumira-cc-bookmark {
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 3;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: none;
      background: rgba(255,255,255,0.85);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform 0.2s var(--ease-spring, cubic-bezier(0.34, 1.56, 0.64, 1));
    }
    .lumira-cc-bookmark[data-saved="true"] {
      background: var(--color-primary, #3D8178);
    }
    .lumira-cc-bookmark:active {
      transform: scale(0.8);
    }
    .lumira-cc-bookmark svg {
      width: 18px;
      height: 18px;
    }

    @keyframes lumira-cc-bookmark-pop {
      0%   { transform: scale(1); }
      40%  { transform: scale(1.35); }
      100% { transform: scale(1); }
    }
    .lumira-cc-bookmark[data-animate="true"] {
      animation: lumira-cc-bookmark-pop 0.35s var(--ease-spring, cubic-bezier(0.34, 1.56, 0.64, 1));
    }

    /* New badge */
    .lumira-cc-new {
      display: inline-block;
      padding: 2px 8px;
      border-radius: var(--radius-full, 9999px);
      background: var(--color-primary, #3D8178);
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    /* Category tag */
    .lumira-cc-category {
      display: inline-block;
      padding: 3px 10px;
      border-radius: var(--radius-full, 9999px);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.3px;
    }

    /* Reading progress bar */
    .lumira-cc-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: var(--color-border, #E2E8F0);
    }
    .lumira-cc-progress-fill {
      height: 100%;
      background: var(--color-primary, #3D8178);
      transition: width 0.3s;
    }

    /* Video play overlay */
    .lumira-cc-play-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2;
    }
    .lumira-cc-play-btn {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: rgba(255,255,255,0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 12px rgba(0,0,0,0.2);
    }
    .lumira-cc-play-btn svg {
      width: 22px;
      height: 22px;
      margin-left: 2px;
      color: var(--color-slate, #2D3748);
    }
    .lumira-cc-duration {
      position: absolute;
      bottom: 8px;
      right: 8px;
      padding: 2px 8px;
      border-radius: 4px;
      background: rgba(0,0,0,0.7);
      color: #fff;
      font-size: 12px;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
    }

    /* Engagement metrics */
    .lumira-cc-metrics {
      display: flex;
      gap: 12px;
      font-size: 12px;
      color: var(--color-muted, #718096);
    }
    .lumira-cc-metric {
      display: inline-flex;
      align-items: center;
      gap: 3px;
    }

    @media (prefers-reduced-motion: reduce) {
      .lumira-cc,
      .lumira-cc-bookmark {
        transition: none !important;
      }
      .lumira-cc-bookmark[data-animate="true"] {
        animation: none !important;
      }
    }
  `
  document.head.appendChild(s)
}

/* ── Bookmark icon ───────────────────────────────────────────────────────── */

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? '#fff' : 'none'} stroke={filled ? '#fff' : 'var(--color-muted, #718096)'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  )
}

/* ── Thumbnail component ─────────────────────────────────────────────────── */

function Thumbnail({
  src,
  alt,
  style,
  children,
}: {
  src?: string | null
  alt?: string
  style?: CSSProperties
  children?: ReactNode
}) {
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--surface-sunken, #F5F3EF)',
        ...style,
      }}
    >
      {src && !errored && (
        <Image
          src={src}
          alt={alt ?? ''}
          fill
          unoptimized
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          style={{
            objectFit: 'cover',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.3s',
          }}
        />
      )}
      {children}
    </div>
  )
}

/* ── Component ───────────────────────────────────────────────────────────── */

export default function ContentCard({
  variant = 'standard',
  title,
  subtitle,
  image,
  category,
  categoryLabel,
  author,
  authorAvatar,
  readTime,
  videoDuration,
  isNew,
  readingProgress,
  bookmarked: bookmarkedProp,
  views,
  saves,
  comments,
  onClick,
  onBookmark,
  style,
  className,
}: ContentCardProps) {
  const [bookmarked, setBookmarked] = useState(bookmarkedProp ?? false)
  const [animateBookmark, setAnimateBookmark] = useState(false)

  useEffect(() => { ensureStyles() }, [])
  useEffect(() => { if (bookmarkedProp !== undefined) setBookmarked(bookmarkedProp) }, [bookmarkedProp])

  const handleBookmark = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    const next = !bookmarked
    setBookmarked(next)
    if (next) setAnimateBookmark(true)
    onBookmark?.(next)
  }, [bookmarked, onBookmark])

  const catColor = category ? (CATEGORY_COLORS[category] ?? 'var(--color-muted)') : 'var(--color-muted)'

  /* ── Shared fragments ──────────────────────────────────────────── */

  const categoryTag = category && categoryLabel && (
    <span className="lumira-cc-category" style={{ background: `${catColor}15`, color: catColor }}>
      {categoryLabel}
    </span>
  )

  const newBadge = isNew && <span className="lumira-cc-new">New</span>

  const metaLine = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      {categoryTag}
      {newBadge}
      {readTime && (
        <span style={{ fontSize: 11, color: 'var(--color-muted)', fontWeight: 500 }}>
          {readTime} min read
        </span>
      )}
      {videoDuration && (
        <span style={{ fontSize: 11, color: 'var(--color-muted)', fontWeight: 500 }}>
          {videoDuration}
        </span>
      )}
    </div>
  )

  const authorLine = author && (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
      {authorAvatar && (
        <span style={{
          width: 24, height: 24, borderRadius: '50%',
          background: 'var(--surface-sunken, #F5F3EF)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, overflow: 'hidden', flexShrink: 0,
        }}>
          {authorAvatar.startsWith('http') ? (
            <Image src={authorAvatar} alt={author} width={24} height={24} unoptimized style={{ objectFit: 'cover' }} />
          ) : authorAvatar}
        </span>
      )}
      <span style={{ fontSize: 12, color: 'var(--color-muted)', fontWeight: 500 }}>{author}</span>
    </div>
  )

  const metrics = (views || saves || comments) ? (
    <div className="lumira-cc-metrics" style={{ marginTop: '8px' }}>
      {views != null && <span className="lumira-cc-metric">{formatCompact(views)} views</span>}
      {saves != null && <span className="lumira-cc-metric">{formatCompact(saves)} saves</span>}
      {comments != null && <span className="lumira-cc-metric">{formatCompact(comments)} comments</span>}
    </div>
  ) : null

  const bookmarkBtn = onBookmark && (
    <button
      className="lumira-cc-bookmark"
      data-saved={bookmarked ? 'true' : undefined}
      data-animate={animateBookmark ? 'true' : undefined}
      onClick={handleBookmark}
      onAnimationEnd={() => setAnimateBookmark(false)}
      aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
    >
      <BookmarkIcon filled={bookmarked} />
    </button>
  )

  const progressBar = readingProgress != null && readingProgress > 0 && (
    <div className="lumira-cc-progress">
      <div className="lumira-cc-progress-fill" style={{ width: `${Math.min(100, readingProgress)}%` }} />
    </div>
  )

  /* ── HERO: Full-width image with text overlay + gradient ────────── */
  if (variant === 'hero') {
    return (
      <div
        className={`lumira-cc ${className ?? ''}`}
        style={{ minHeight: 240, ...style }}
        onClick={onClick}
        role="article"
      >
        <Thumbnail src={image} alt={title} style={{ position: 'absolute', inset: 0 }} />
        {bookmarkBtn}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1,
          padding: '48px 16px 16px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)',
        }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            {category && categoryLabel && (
              <span className="lumira-cc-category" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                {categoryLabel}
              </span>
            )}
            {newBadge}
          </div>
          <p style={{ fontSize: 20, fontWeight: 700, color: '#fff', lineHeight: 1.3, marginBottom: 4 }}>
            {title}
          </p>
          {subtitle && (
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
              {subtitle}
            </p>
          )}
          {readTime && (
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
              {readTime} min read
            </span>
          )}
        </div>
        {progressBar}
      </div>
    )
  }

  /* ── VIDEO: Thumbnail with play button overlay + duration ───────── */
  if (variant === 'video') {
    return (
      <div className={`lumira-cc ${className ?? ''}`} style={style} onClick={onClick} role="article">
        <div style={{ position: 'relative', aspectRatio: '16/9' }}>
          <Thumbnail src={image} alt={title} style={{ position: 'absolute', inset: 0 }} />
          <div className="lumira-cc-play-overlay">
            <div className="lumira-cc-play-btn">
              <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21" /></svg>
            </div>
          </div>
          {videoDuration && <span className="lumira-cc-duration">{videoDuration}</span>}
          {bookmarkBtn}
        </div>
        <div style={{ padding: '14px 16px' }}>
          {metaLine}
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-slate)', lineHeight: 1.4, marginTop: 8 }}>
            {title}
          </p>
          {authorLine}
          {metrics}
        </div>
        {progressBar}
      </div>
    )
  }

  /* ── COMPACT: Small thumbnail, title + meta inline ─────────────── */
  if (variant === 'compact') {
    return (
      <div
        className={`lumira-cc ${className ?? ''}`}
        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, ...style }}
        onClick={onClick}
        role="article"
      >
        {image && (
          <Thumbnail src={image} alt={title} style={{ width: 56, height: 56, borderRadius: 'var(--radius-sm)', flexShrink: 0 }} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: 14, fontWeight: 600, color: 'var(--color-slate)',
            lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>
            {title}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            {category && categoryLabel && (
              <span style={{ fontSize: 11, color: catColor, fontWeight: 600 }}>{categoryLabel}</span>
            )}
            {readTime && <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>{readTime} min</span>}
            {isNew && <span className="lumira-cc-new">New</span>}
          </div>
        </div>
        {onBookmark && (
          <button
            style={{
              background: 'none', border: 'none', padding: 8, cursor: 'pointer',
              color: bookmarked ? 'var(--color-primary)' : 'var(--color-muted)',
              flexShrink: 0,
            }}
            onClick={handleBookmark}
            aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
          >
            <BookmarkIcon filled={bookmarked} />
          </button>
        )}
      </div>
    )
  }

  /* ── ARTICLE: Category tag + title + excerpt + read time ────────── */
  if (variant === 'article') {
    return (
      <div className={`lumira-cc ${className ?? ''}`} style={style} onClick={onClick} role="article">
        <div style={{ padding: '16px' }}>
          {metaLine}
          <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-slate)', lineHeight: 1.35, marginTop: 10, marginBottom: subtitle ? 6 : 0 }}>
            {title}
          </p>
          {subtitle && (
            <p style={{
              fontSize: 14, color: 'var(--color-muted)', lineHeight: 1.5,
              overflow: 'hidden', textOverflow: 'ellipsis',
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            }}>
              {subtitle}
            </p>
          )}
          {authorLine}
          {metrics}
        </div>
        {progressBar}
      </div>
    )
  }

  /* ── STANDARD (default): Thumbnail left, text right ────────────── */
  return (
    <div
      className={`lumira-cc ${className ?? ''}`}
      style={{ display: 'flex', overflow: 'hidden', ...style }}
      onClick={onClick}
      role="article"
    >
      {image && (
        <Thumbnail src={image} alt={title} style={{ width: 120, flexShrink: 0 }}>
          {variant === 'standard' && bookmarkBtn}
        </Thumbnail>
      )}
      <div style={{ flex: 1, padding: '14px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
        {metaLine}
        <p style={{
          fontSize: 15, fontWeight: 600, color: 'var(--color-slate)',
          lineHeight: 1.35, marginTop: 6,
          overflow: 'hidden', textOverflow: 'ellipsis',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {title}
        </p>
        {subtitle && (
          <p style={{
            fontSize: 13, color: 'var(--color-muted)', lineHeight: 1.5, marginTop: 4,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {subtitle}
          </p>
        )}
        {authorLine}
        {metrics}
      </div>
      {!image && bookmarkBtn}
      {progressBar}
    </div>
  )
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

export type { ContentCardProps, CardVariant }

'use client'

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type CSSProperties,
  type ReactNode,
} from 'react'

/* ══════════════════════════════════════════════════════════════════════════════
   FeedLayout — Instagram/Pinterest-inspired infinite content feed
   Features: infinite scroll (IntersectionObserver), pull-to-refresh with spring
   animation, empty state, "loading more" bottom indicator, scroll-to-top FAB,
   saved scroll position restoration on back navigation
   ══════════════════════════════════════════════════════════════════════════════ */

interface FeedLayoutProps {
  children: ReactNode
  /** Called when user scrolls near bottom — return false to signal "no more" */
  onLoadMore?: () => Promise<boolean | void>
  /** Called on pull-to-refresh */
  onRefresh?: () => Promise<void>
  /** Whether more content can be loaded */
  hasMore?: boolean
  /** Currently loading more */
  loadingMore?: boolean
  /** Show empty state when no children */
  emptyState?: ReactNode
  /** Unique key for scroll position storage */
  scrollKey?: string
  /** Gap between feed items */
  gap?: number
  /** Additional styles */
  style?: CSSProperties
  className?: string
}

/* ── Styles ──────────────────────────────────────────────────────────────── */

const STYLE_ID = 'lumira-feed-layout-styles'

function ensureStyles() {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID)) return

  const s = document.createElement('style')
  s.id = STYLE_ID
  s.textContent = `
    .lumira-feed {
      position: relative;
      min-height: 100dvh;
    }

    /* Pull-to-refresh indicator */
    .lumira-feed-ptr {
      position: absolute;
      top: -60px;
      left: 0;
      right: 0;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      z-index: 5;
      transition: transform 0.3s var(--ease-spring, cubic-bezier(0.34, 1.56, 0.64, 1));
    }
    .lumira-feed-ptr-spinner {
      width: 28px;
      height: 28px;
      border: 2.5px solid var(--color-border, #E2E8F0);
      border-top-color: var(--color-primary, #3D8178);
      border-radius: 50%;
      transition: transform 0.15s, opacity 0.15s;
    }
    .lumira-feed-ptr-spinner[data-spinning="true"] {
      animation: lumira-feed-spin 0.7s linear infinite;
    }
    @keyframes lumira-feed-spin {
      to { transform: rotate(360deg); }
    }

    /* Loading more indicator */
    .lumira-feed-loading-more {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px 0;
      gap: 8px;
    }
    .lumira-feed-loading-more .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--color-primary, #3D8178);
      animation: lumira-feed-bounce 1.2s ease-in-out infinite;
    }
    .lumira-feed-loading-more .dot:nth-child(2) { animation-delay: 0.15s; }
    .lumira-feed-loading-more .dot:nth-child(3) { animation-delay: 0.3s; }
    @keyframes lumira-feed-bounce {
      0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
      40% { transform: scale(1); opacity: 1; }
    }

    /* End of feed */
    .lumira-feed-end {
      text-align: center;
      padding: 20px 0 8px;
      font-size: 13px;
      color: var(--color-muted, #718096);
      font-weight: 500;
    }

    /* Scroll to top FAB */
    .lumira-feed-fab {
      position: fixed;
      bottom: calc(80px + max(0px, env(safe-area-inset-bottom)));
      right: 16px;
      z-index: 50;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: none;
      background: var(--color-white, #fff);
      box-shadow: var(--shadow-lg, 0 8px 32px rgba(0,0,0,0.10));
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform 0.25s var(--ease-spring, cubic-bezier(0.34, 1.56, 0.64, 1)),
                  opacity 0.2s;
      color: var(--color-primary, #3D8178);
    }
    .lumira-feed-fab[data-visible="false"] {
      transform: scale(0);
      opacity: 0;
      pointer-events: none;
    }
    .lumira-feed-fab[data-visible="true"] {
      transform: scale(1);
      opacity: 1;
    }
    .lumira-feed-fab:active {
      transform: scale(0.9);
    }
    .lumira-feed-fab svg {
      width: 22px;
      height: 22px;
    }

    /* Empty state */
    .lumira-feed-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 24px;
      text-align: center;
      min-height: 40dvh;
    }
    .lumira-feed-empty-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: var(--color-primary-light, #EDF4F2);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
    }
    .lumira-feed-empty-icon svg {
      width: 36px;
      height: 36px;
      color: var(--color-primary, #3D8178);
      opacity: 0.7;
    }
    .lumira-feed-empty h3 {
      font-size: 17px;
      font-weight: 700;
      color: var(--color-slate, #2D3748);
      margin-bottom: 6px;
    }
    .lumira-feed-empty p {
      font-size: 14px;
      color: var(--color-muted, #718096);
      line-height: 1.5;
      max-width: 280px;
    }

    @media (prefers-reduced-motion: reduce) {
      .lumira-feed-ptr,
      .lumira-feed-fab {
        transition: none !important;
      }
      .lumira-feed-ptr-spinner[data-spinning="true"],
      .lumira-feed-loading-more .dot {
        animation: none !important;
      }
    }
  `
  document.head.appendChild(s)
}

/* ── Component ───────────────────────────────────────────────────────────── */

export default function FeedLayout({
  children,
  onLoadMore,
  onRefresh,
  hasMore = true,
  loadingMore = false,
  emptyState,
  scrollKey,
  gap = 16,
  style,
  className,
}: FeedLayoutProps) {
  const [showFab, setShowFab] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const feedRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef<number | null>(null)
  const isLoadingMore = useRef(false)

  useEffect(() => { ensureStyles() }, [])

  /* ── Restore scroll position ──────────────────────────────────── */

  useEffect(() => {
    if (!scrollKey) return
    const saved = sessionStorage.getItem(`lumira-feed-scroll-${scrollKey}`)
    if (saved) {
      const pos = parseInt(saved, 10)
      if (!isNaN(pos)) {
        requestAnimationFrame(() => window.scrollTo(0, pos))
      }
    }

    const savePos = () => {
      sessionStorage.setItem(`lumira-feed-scroll-${scrollKey}`, String(window.scrollY))
    }

    window.addEventListener('beforeunload', savePos)
    // Also save on popstate (back navigation)
    window.addEventListener('pagehide', savePos)

    return () => {
      savePos()
      window.removeEventListener('beforeunload', savePos)
      window.removeEventListener('pagehide', savePos)
    }
  }, [scrollKey])

  /* ── FAB visibility on scroll ──────────────────────────────────── */

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setShowFab(window.scrollY > 600)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  /* ── Infinite scroll via IntersectionObserver ─────────────────── */

  useEffect(() => {
    if (!onLoadMore || !hasMore) return
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoadingMore.current && !loadingMore) {
          isLoadingMore.current = true
          onLoadMore().finally(() => { isLoadingMore.current = false })
        }
      },
      { rootMargin: '300px' }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [onLoadMore, hasMore, loadingMore])

  /* ── Pull to refresh ────────────────────────────────────────────── */

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!onRefresh) return
    if (window.scrollY <= 0) {
      touchStartY.current = e.touches[0].clientY
    }
  }, [onRefresh])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartY.current === null || refreshing) return
    const dy = e.touches[0].clientY - touchStartY.current
    if (dy > 0) {
      // Diminishing pull (rubber-band feel)
      const distance = Math.min(120, dy * 0.5)
      setPullDistance(distance)
    }
  }, [refreshing])

  const handleTouchEnd = useCallback(async () => {
    if (touchStartY.current === null) return
    touchStartY.current = null

    if (pullDistance > 60 && onRefresh && !refreshing) {
      setRefreshing(true)
      setPullDistance(60)
      try {
        await onRefresh()
      } finally {
        setRefreshing(false)
        setPullDistance(0)
      }
    } else {
      setPullDistance(0)
    }
  }, [pullDistance, onRefresh, refreshing])

  /* ── Detect empty ──────────────────────────────────────────────── */

  const isEmpty = !children || (Array.isArray(children) && children.length === 0)

  return (
    <div
      ref={feedRef}
      className={`lumira-feed ${className ?? ''}`}
      style={style}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      {onRefresh && (
        <div
          className="lumira-feed-ptr"
          style={{
            transform: `translateY(${pullDistance}px)`,
          }}
        >
          <div
            className="lumira-feed-ptr-spinner"
            data-spinning={refreshing ? 'true' : undefined}
            style={{
              transform: refreshing ? undefined : `rotate(${pullDistance * 3}deg)`,
              opacity: Math.min(1, pullDistance / 40),
            }}
          />
        </div>
      )}

      {/* Feed content area with pull offset */}
      <div
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : undefined,
          transition: pullDistance === 0 ? 'transform 0.3s var(--ease-spring)' : 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: `${gap}px`,
        }}
      >
        {isEmpty ? (
          emptyState ?? (
            <div className="lumira-feed-empty">
              <div className="lumira-feed-empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </div>
              <h3>Nothing here yet</h3>
              <p>New content will appear here as it becomes available. Check back soon!</p>
            </div>
          )
        ) : (
          children
        )}

        {/* Load more sentinel */}
        {!isEmpty && hasMore && (
          <div ref={sentinelRef}>
            {loadingMore && (
              <div className="lumira-feed-loading-more">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </div>
            )}
          </div>
        )}

        {/* End of feed */}
        {!isEmpty && !hasMore && (
          <div className="lumira-feed-end">
            You&apos;re all caught up
          </div>
        )}
      </div>

      {/* Scroll-to-top FAB */}
      <button
        className="lumira-feed-fab"
        data-visible={showFab ? 'true' : 'false'}
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>
    </div>
  )
}

export type { FeedLayoutProps }

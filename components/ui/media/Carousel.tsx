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
   Carousel — Horizontal scrolling content slider
   Features: touch/swipe, CSS scroll-snap, dot/scrollbar indicators,
   auto-play with pause on touch, peek next/prev, arrow buttons on desktop,
   momentum scrolling, three sizes (full, card, mini)
   ══════════════════════════════════════════════════════════════════════════════ */

type CarouselSize = 'full' | 'card' | 'mini'
type IndicatorStyle = 'dots' | 'bar' | 'none'

interface CarouselProps {
  children: ReactNode[]
  /** Slide sizing */
  size?: CarouselSize
  /** Show peek of next/prev slide */
  peek?: boolean
  /** Indicator type */
  indicator?: IndicatorStyle
  /** Auto-play interval in ms. 0 = disabled */
  autoPlay?: number
  /** Gap between slides in px */
  gap?: number
  /** Show arrow buttons (visible on desktop/hover) */
  showArrows?: boolean
  /** Padding on first/last slides */
  edgePadding?: number
  /** Additional styles on the outer wrapper */
  style?: CSSProperties
  className?: string
  /** Called when active slide changes */
  onSlideChange?: (index: number) => void
}

/* ── Styles ──────────────────────────────────────────────────────────────── */

const STYLE_ID = 'lumira-carousel-styles'

function ensureStyles() {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID)) return

  const s = document.createElement('style')
  s.id = STYLE_ID
  s.textContent = `
    .lumira-carousel {
      position: relative;
      width: 100%;
    }

    .lumira-carousel-track {
      display: flex;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    .lumira-carousel-track::-webkit-scrollbar {
      display: none;
    }

    .lumira-carousel-slide {
      flex-shrink: 0;
      scroll-snap-align: start;
    }

    /* Arrow buttons */
    .lumira-carousel-arrow {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      z-index: 3;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      background: var(--color-white, #fff);
      box-shadow: var(--shadow-md, 0 4px 16px rgba(0,0,0,0.08));
      display: none;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--color-slate, #2D3748);
      transition: opacity 0.15s, transform 0.15s;
    }
    .lumira-carousel-arrow:active {
      transform: translateY(-50%) scale(0.92);
    }
    .lumira-carousel-arrow svg {
      width: 20px;
      height: 20px;
    }
    .lumira-carousel-arrow[data-dir="prev"] { left: 8px; }
    .lumira-carousel-arrow[data-dir="next"] { right: 8px; }

    /* Show arrows on desktop hover */
    @media (hover: hover) and (pointer: fine) {
      .lumira-carousel:hover .lumira-carousel-arrow {
        display: flex;
      }
      .lumira-carousel-arrow:hover {
        box-shadow: var(--shadow-lg, 0 8px 32px rgba(0,0,0,0.10));
      }
    }

    /* Dot indicators */
    .lumira-carousel-dots {
      display: flex;
      justify-content: center;
      gap: 6px;
      padding: 12px 0 4px;
    }
    .lumira-carousel-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--color-border, #E2E8F0);
      transition: background 0.2s, transform 0.2s;
      border: none;
      padding: 0;
      cursor: pointer;
    }
    .lumira-carousel-dot[data-active="true"] {
      background: var(--color-primary, #3D8178);
      transform: scale(1.3);
    }

    /* Bar indicator */
    .lumira-carousel-bar-container {
      display: flex;
      justify-content: center;
      padding: 12px 0 4px;
    }
    .lumira-carousel-bar-track {
      width: 48px;
      height: 4px;
      border-radius: 2px;
      background: var(--color-border, #E2E8F0);
      position: relative;
      overflow: hidden;
    }
    .lumira-carousel-bar-fill {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      border-radius: 2px;
      background: var(--color-primary, #3D8178);
      transition: left 0.2s, width 0.2s;
    }

    @media (prefers-reduced-motion: reduce) {
      .lumira-carousel-track {
        scroll-behavior: auto !important;
      }
      .lumira-carousel-dot,
      .lumira-carousel-bar-fill {
        transition: none !important;
      }
    }
  `
  document.head.appendChild(s)
}

/* ── Component ───────────────────────────────────────────────────────────── */

export default function Carousel({
  children,
  size = 'card',
  peek = true,
  indicator = 'dots',
  autoPlay = 0,
  gap = 12,
  showArrows = true,
  edgePadding = 16,
  style,
  className,
  onSlideChange,
}: CarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [touching, setTouching] = useState(false)
  const autoPlayTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const total = children.length

  useEffect(() => { ensureStyles() }, [])

  /* Slide width logic */
  const slideWidth = (): string => {
    switch (size) {
      case 'full': return `calc(100% - ${peek ? edgePadding * 2 : 0}px)`
      case 'card': return `calc(80% - ${peek ? edgePadding : 0}px)`
      case 'mini': return `calc(45% - ${peek ? edgePadding / 2 : 0}px)`
      default: return '80%'
    }
  }

  /* ── Scroll observation ────────────────────────────────────────── */

  const updateActiveIndex = useCallback(() => {
    const track = trackRef.current
    if (!track || !track.children.length) return

    const scrollLeft = track.scrollLeft
    const slides = Array.from(track.children) as HTMLElement[]
    let closestIndex = 0
    let closestDist = Infinity

    slides.forEach((slide, i) => {
      const dist = Math.abs(slide.offsetLeft - scrollLeft - edgePadding)
      if (dist < closestDist) {
        closestDist = dist
        closestIndex = i
      }
    })

    if (closestIndex !== activeIndex) {
      setActiveIndex(closestIndex)
      onSlideChange?.(closestIndex)
    }
  }, [activeIndex, edgePadding, onSlideChange])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateActiveIndex()
          ticking = false
        })
        ticking = true
      }
    }

    track.addEventListener('scroll', onScroll, { passive: true })
    return () => track.removeEventListener('scroll', onScroll)
  }, [updateActiveIndex])

  /* ── Auto-play ─────────────────────────────────────────────────── */

  useEffect(() => {
    if (!autoPlay || touching || total <= 1) return

    autoPlayTimer.current = setInterval(() => {
      const nextIndex = (activeIndex + 1) % total
      scrollToIndex(nextIndex)
    }, autoPlay)

    return () => {
      if (autoPlayTimer.current) clearInterval(autoPlayTimer.current)
    }
  }, [autoPlay, touching, activeIndex, total])

  /* ── Navigation ────────────────────────────────────────────────── */

  const scrollToIndex = useCallback((index: number) => {
    const track = trackRef.current
    if (!track) return

    const slides = Array.from(track.children) as HTMLElement[]
    const slide = slides[index]
    if (!slide) return

    track.scrollTo({
      left: slide.offsetLeft - edgePadding,
      behavior: 'smooth',
    })
  }, [edgePadding])

  const goNext = useCallback(() => {
    if (activeIndex < total - 1) scrollToIndex(activeIndex + 1)
  }, [activeIndex, total, scrollToIndex])

  const goPrev = useCallback(() => {
    if (activeIndex > 0) scrollToIndex(activeIndex - 1)
  }, [activeIndex, scrollToIndex])

  if (!total) return null

  return (
    <div className={`lumira-carousel ${className ?? ''}`} style={style}>
      {/* Track */}
      <div
        ref={trackRef}
        className="lumira-carousel-track"
        style={{
          gap: `${gap}px`,
          paddingLeft: `${edgePadding}px`,
          paddingRight: `${edgePadding}px`,
          scrollBehavior: 'smooth',
        }}
        onTouchStart={() => setTouching(true)}
        onTouchEnd={() => setTouching(false)}
      >
        {children.map((child, i) => (
          <div
            key={i}
            className="lumira-carousel-slide"
            style={{ width: slideWidth() }}
          >
            {child}
          </div>
        ))}
      </div>

      {/* Arrows */}
      {showArrows && total > 1 && (
        <>
          {activeIndex > 0 && (
            <button
              className="lumira-carousel-arrow"
              data-dir="prev"
              onClick={goPrev}
              aria-label="Previous slide"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}
          {activeIndex < total - 1 && (
            <button
              className="lumira-carousel-arrow"
              data-dir="next"
              onClick={goNext}
              aria-label="Next slide"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}
        </>
      )}

      {/* Indicators */}
      {indicator === 'dots' && total > 1 && (
        <div className="lumira-carousel-dots">
          {children.map((_, i) => (
            <button
              key={i}
              className="lumira-carousel-dot"
              data-active={i === activeIndex ? 'true' : undefined}
              onClick={() => scrollToIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {indicator === 'bar' && total > 1 && (
        <div className="lumira-carousel-bar-container">
          <div className="lumira-carousel-bar-track">
            <div
              className="lumira-carousel-bar-fill"
              style={{
                width: `${(1 / total) * 100}%`,
                left: `${(activeIndex / total) * 100}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export type { CarouselProps, CarouselSize, IndicatorStyle }

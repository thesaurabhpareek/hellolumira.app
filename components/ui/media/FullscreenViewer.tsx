'use client'

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type CSSProperties,
  type TouchEvent as ReactTouchEvent,
} from 'react'

/* ══════════════════════════════════════════════════════════════════════════════
   FullscreenViewer — Immersive image viewer overlay
   Features: pinch-to-zoom (CSS transform), pan when zoomed, swipe L/R for
   gallery nav, swipe down to dismiss, double-tap zoom, dot indicators,
   image counter, share/save action bar, prefers-reduced-motion
   ══════════════════════════════════════════════════════════════════════════════ */

export interface ViewerImage {
  src: string
  alt?: string
}

interface FullscreenViewerProps {
  images: ViewerImage[]
  initialIndex?: number
  onClose: () => void
  /** Called when user taps share */
  onShare?: (image: ViewerImage, index: number) => void
  /** Called when user taps save/download */
  onSave?: (image: ViewerImage, index: number) => void
}

/* ── Styles ──────────────────────────────────────────────────────────────── */

const STYLE_ID = 'lumira-fullscreen-viewer-styles'

function ensureStyles() {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID)) return

  const s = document.createElement('style')
  s.id = STYLE_ID
  s.textContent = `
    .lumira-fsv-backdrop {
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: #000;
      display: flex;
      flex-direction: column;
      touch-action: none;
      user-select: none;
      -webkit-user-select: none;
    }
    .lumira-fsv-backdrop[data-entering="true"] {
      animation: lumira-fsv-in var(--duration-normal, 300ms) var(--ease-ios, cubic-bezier(0.16, 1, 0.3, 1));
    }
    .lumira-fsv-backdrop[data-closing="true"] {
      animation: lumira-fsv-out var(--duration-fast, 200ms) var(--ease-accelerate, ease-in) forwards;
    }

    @keyframes lumira-fsv-in {
      from { opacity: 0; transform: scale(0.92); }
      to   { opacity: 1; transform: scale(1); }
    }
    @keyframes lumira-fsv-out {
      from { opacity: 1; transform: scale(1); }
      to   { opacity: 0; transform: scale(0.92); }
    }

    .lumira-fsv-header {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: max(env(safe-area-inset-top, 12px), 12px) 16px 12px;
      background: linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%);
    }
    .lumira-fsv-counter {
      color: rgba(255,255,255,0.9);
      font-size: 15px;
      font-weight: 600;
      letter-spacing: 0.3px;
    }
    .lumira-fsv-close {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: none;
      background: rgba(255,255,255,0.15);
      color: #fff;
      font-size: 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }

    .lumira-fsv-canvas {
      flex: 1;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .lumira-fsv-canvas img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      will-change: transform;
      pointer-events: none;
    }

    .lumira-fsv-dots {
      position: absolute;
      bottom: 80px;
      left: 0;
      right: 0;
      display: flex;
      justify-content: center;
      gap: 6px;
      z-index: 2;
    }
    .lumira-fsv-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: rgba(255,255,255,0.35);
      transition: background 0.2s, transform 0.2s;
    }
    .lumira-fsv-dot[data-active="true"] {
      background: #fff;
      transform: scale(1.3);
    }

    .lumira-fsv-actions {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 2;
      display: flex;
      justify-content: center;
      gap: 32px;
      padding: 16px 16px max(env(safe-area-inset-bottom, 16px), 16px);
      background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%);
    }
    .lumira-fsv-action-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      background: none;
      border: none;
      color: rgba(255,255,255,0.85);
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
      padding: 8px;
      min-height: 44px;
      min-width: 44px;
    }
    .lumira-fsv-action-btn svg {
      width: 24px;
      height: 24px;
    }

    @media (prefers-reduced-motion: reduce) {
      .lumira-fsv-backdrop[data-entering="true"],
      .lumira-fsv-backdrop[data-closing="true"] {
        animation: none !important;
      }
      .lumira-fsv-dot { transition: none !important; }
    }
  `
  document.head.appendChild(s)
}

/* ── Component ───────────────────────────────────────────────────────────── */

export default function FullscreenViewer({
  images,
  initialIndex = 0,
  onClose,
  onShare,
  onSave,
}: FullscreenViewerProps) {
  const [index, setIndex] = useState(initialIndex)
  const [closing, setClosing] = useState(false)
  const [entering, setEntering] = useState(true)

  // Transform state
  const [scale, setScale] = useState(1)
  const [translateX, setTranslateX] = useState(0)
  const [translateY, setTranslateY] = useState(0)

  // Touch tracking
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null)
  const lastTap = useRef<number>(0)
  const pinchStart = useRef<number | null>(null)
  const pinchScaleStart = useRef(1)
  const panStart = useRef<{ x: number; y: number } | null>(null)
  const swipeDismissY = useRef(0)
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => { ensureStyles() }, [])

  // Entry animation
  useEffect(() => {
    const t = setTimeout(() => setEntering(false), 300)
    return () => clearTimeout(t)
  }, [])

  // Prevent body scroll
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
      if (e.key === 'ArrowLeft') navigatePrev()
      if (e.key === 'ArrowRight') navigateNext()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  const total = images.length
  const current = images[index]

  const handleClose = useCallback(() => {
    setClosing(true)
    setTimeout(() => onClose(), 200)
  }, [onClose])

  const navigateNext = useCallback(() => {
    if (scale > 1) return
    setIndex((i) => (i < total - 1 ? i + 1 : i))
    resetTransform()
  }, [total, scale])

  const navigatePrev = useCallback(() => {
    if (scale > 1) return
    setIndex((i) => (i > 0 ? i - 1 : i))
    resetTransform()
  }, [scale])

  const resetTransform = () => {
    setScale(1)
    setTranslateX(0)
    setTranslateY(0)
  }

  /* ── Touch handlers ──────────────────────────────────────────────── */

  const getDistance = (t1: Touch, t2: Touch) =>
    Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)

  const onTouchStart = useCallback((e: ReactTouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch start
      pinchStart.current = getDistance(e.touches[0], e.touches[1])
      pinchScaleStart.current = scale
      return
    }

    if (e.touches.length === 1) {
      const t = e.touches[0]
      touchStart.current = { x: t.clientX, y: t.clientY, time: Date.now() }

      if (scale > 1) {
        panStart.current = { x: translateX, y: translateY }
      }
    }
  }, [scale, translateX, translateY])

  const onTouchMove = useCallback((e: ReactTouchEvent) => {
    // Pinch zoom
    if (e.touches.length === 2 && pinchStart.current !== null) {
      const dist = getDistance(e.touches[0], e.touches[1])
      const newScale = Math.min(5, Math.max(1, pinchScaleStart.current * (dist / pinchStart.current)))
      setScale(newScale)
      if (newScale <= 1) {
        setTranslateX(0)
        setTranslateY(0)
      }
      return
    }

    if (e.touches.length !== 1 || !touchStart.current) return

    const dx = e.touches[0].clientX - touchStart.current.x
    const dy = e.touches[0].clientY - touchStart.current.y

    // Pan when zoomed
    if (scale > 1 && panStart.current) {
      setTranslateX(panStart.current.x + dx)
      setTranslateY(panStart.current.y + dy)
      return
    }

    // Track swipe-down for dismiss
    if (Math.abs(dy) > Math.abs(dx) && dy > 0) {
      swipeDismissY.current = dy
    }
  }, [scale])

  const onTouchEnd = useCallback((e: ReactTouchEvent) => {
    // Handle pinch end
    if (pinchStart.current !== null) {
      pinchStart.current = null
      if (scale <= 1) resetTransform()
      return
    }

    if (!touchStart.current) return

    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStart.current.x
    const dy = (e.changedTouches[0]?.clientY ?? 0) - touchStart.current.y
    const dt = Date.now() - touchStart.current.time
    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)

    // Double-tap to zoom
    const now = Date.now()
    if (dt < 300 && absDx < 10 && absDy < 10) {
      if (now - lastTap.current < 300) {
        // Double tap
        if (scale > 1) {
          resetTransform()
        } else {
          setScale(2.5)
        }
        lastTap.current = 0
        touchStart.current = null
        return
      }
      lastTap.current = now
    }

    // Swipe down to dismiss (only when not zoomed)
    if (scale <= 1 && dy > 120 && absDy > absDx) {
      handleClose()
      touchStart.current = null
      swipeDismissY.current = 0
      return
    }

    // Horizontal swipe for navigation (only when not zoomed)
    if (scale <= 1 && absDx > 60 && absDx > absDy && dt < 400) {
      if (dx < 0) navigateNext()
      else navigatePrev()
    }

    touchStart.current = null
    panStart.current = null
    swipeDismissY.current = 0
  }, [scale, handleClose, navigateNext, navigatePrev])

  const imgTransform = `translate(${translateX}px, ${translateY}px) scale(${scale})`

  if (!current) return null

  return (
    <div
      className="lumira-fsv-backdrop"
      data-entering={entering ? 'true' : undefined}
      data-closing={closing ? 'true' : undefined}
      role="dialog"
      aria-modal="true"
      aria-label={`Image viewer, ${index + 1} of ${total}`}
    >
      {/* Header */}
      <div className="lumira-fsv-header">
        <span className="lumira-fsv-counter">
          {index + 1} of {total}
        </span>
        <button
          className="lumira-fsv-close"
          onClick={handleClose}
          aria-label="Close viewer"
        >
          &#x2715;
        </button>
      </div>

      {/* Image canvas */}
      <div
        ref={canvasRef}
        className="lumira-fsv-canvas"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <img
          key={index}
          src={current.src}
          alt={current.alt ?? `Image ${index + 1}`}
          draggable={false}
          style={{ transform: imgTransform }}
        />
      </div>

      {/* Dot indicators */}
      {total > 1 && total <= 20 && (
        <div className="lumira-fsv-dots">
          {images.map((_, i) => (
            <div
              key={i}
              className="lumira-fsv-dot"
              data-active={i === index ? 'true' : undefined}
            />
          ))}
        </div>
      )}

      {/* Action bar */}
      <div className="lumira-fsv-actions">
        {onShare && (
          <button
            className="lumira-fsv-action-btn"
            onClick={() => onShare(current, index)}
            aria-label="Share image"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
            Share
          </button>
        )}
        {onSave && (
          <button
            className="lumira-fsv-action-btn"
            onClick={() => onSave(current, index)}
            aria-label="Save image"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Save
          </button>
        )}
      </div>
    </div>
  )
}

export type { FullscreenViewerProps }

'use client'

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type CSSProperties,
} from 'react'
import Image from 'next/image'
import Skeleton from './Skeleton'

/* ══════════════════════════════════════════════════════════════════════════════
   ImageGallery — Adaptive grid for 1-N images
   Layouts: 1 → full width, 2 → side by side, 3 → 1 large + 2 small,
            4+ → 2x2 grid with "+N" overlay on 4th tile
   Features: lazy loading (IntersectionObserver), blur-up placeholder,
             shimmer skeleton, error retry, tap to open fullscreen viewer
   ══════════════════════════════════════════════════════════════════════════════ */

export interface GalleryImage {
  src: string
  alt?: string
  /** Tiny base64 data-URI for blur-up placeholder */
  blurDataURL?: string
  width?: number
  height?: number
}

interface ImageGalleryProps {
  images: GalleryImage[]
  /** Border radius on the gallery container */
  borderRadius?: number | string
  /** Gap between tiles */
  gap?: number
  /** Max height of the gallery container */
  maxHeight?: number
  /** Called when user taps an image — receives index */
  onImageTap?: (index: number) => void
  /** Additional styles */
  style?: CSSProperties
  className?: string
}

/* ── Styles injected once ────────────────────────────────────────────────── */

const STYLE_ID = 'lumira-image-gallery-styles'

function ensureGalleryStyles() {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID)) return

  const s = document.createElement('style')
  s.id = STYLE_ID
  s.textContent = `
    .lumira-gallery-tile {
      position: relative;
      overflow: hidden;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }
    .lumira-gallery-tile:active {
      opacity: 0.85;
      transition: opacity 0.1s;
    }
    .lumira-gallery-img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: opacity var(--duration-normal, 300ms) var(--ease-default, ease);
    }
    .lumira-gallery-blur {
      position: absolute;
      inset: 0;
      background-size: cover;
      background-position: center;
      filter: blur(20px);
      transform: scale(1.1);
      transition: opacity var(--duration-normal, 300ms) var(--ease-default, ease);
    }
    .lumira-gallery-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.3px;
    }
    .lumira-gallery-error {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: var(--surface-sunken, #F5F3EF);
      gap: 8px;
    }
    .lumira-gallery-error button {
      padding: 6px 16px;
      border-radius: var(--radius-full, 9999px);
      border: 1px solid var(--color-border, #E2E8F0);
      background: var(--color-white, #fff);
      color: var(--color-primary, #3D8178);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      min-height: 36px;
    }
    @media (prefers-reduced-motion: reduce) {
      .lumira-gallery-img,
      .lumira-gallery-blur {
        transition: none !important;
      }
    }
  `
  document.head.appendChild(s)
}

/* ── LazyImage tile ──────────────────────────────────────────────────────── */

function LazyImage({
  image,
  style,
  onClick,
  overlay,
}: {
  image: GalleryImage
  style?: CSSProperties
  onClick?: () => void
  overlay?: React.ReactNode
}) {
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)
  const [inView, setInView] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const retryCount = useRef(0)

  useEffect(() => { ensureGalleryStyles() }, [])

  // IntersectionObserver for lazy loading
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handleRetry = useCallback(() => {
    retryCount.current += 1
    setErrored(false)
    setLoaded(false)
  }, [])

  return (
    <div
      ref={containerRef}
      className="lumira-gallery-tile"
      style={{
        background: 'var(--surface-sunken, #F5F3EF)',
        ...style,
      }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.() }}
      aria-label={image.alt ?? 'Gallery image'}
    >
      {/* Blur-up placeholder */}
      {image.blurDataURL && (
        <div
          className="lumira-gallery-blur"
          style={{
            backgroundImage: `url(${image.blurDataURL})`,
            opacity: loaded ? 0 : 1,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Skeleton while not in view */}
      {!inView && !image.blurDataURL && (
        <Skeleton variant="rectangle" style={{ position: 'absolute', inset: 0, borderRadius: 0 }} />
      )}

      {/* Actual image */}
      {inView && !errored && (
        <Image
          className="lumira-gallery-img"
          src={`${image.src}${retryCount.current ? `?retry=${retryCount.current}` : ''}`}
          alt={image.alt ?? ''}
          fill
          unoptimized
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          style={{ objectFit: 'cover', opacity: loaded ? 1 : 0 }}
        />
      )}

      {/* Error state */}
      {errored && (
        <div className="lumira-gallery-error">
          <span style={{ fontSize: '24px', opacity: 0.5 }}>&#x1F5BC;</span>
          <button onClick={(e) => { e.stopPropagation(); handleRetry() }}>
            Retry
          </button>
        </div>
      )}

      {overlay}
    </div>
  )
}

/* ── Gallery layout ──────────────────────────────────────────────────────── */

export default function ImageGallery({
  images,
  borderRadius = 'var(--radius-lg)',
  gap = 2,
  maxHeight = 400,
  onImageTap,
  style,
  className,
}: ImageGalleryProps) {
  if (!images.length) return null

  const br = typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius
  const count = images.length

  const tileStyle = (overrides?: CSSProperties): CSSProperties => ({
    minHeight: 0,
    ...overrides,
  })

  const handleTap = (index: number) => {
    onImageTap?.(index)
  }

  // 1 image: full width
  if (count === 1) {
    return (
      <div className={className} style={{ borderRadius: br, overflow: 'hidden', maxHeight, ...style }}>
        <LazyImage
          image={images[0]}
          style={tileStyle({ width: '100%', height: '100%', maxHeight })}
          onClick={() => handleTap(0)}
        />
      </div>
    )
  }

  // 2 images: side by side
  if (count === 2) {
    return (
      <div
        className={className}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: `${gap}px`,
          borderRadius: br,
          overflow: 'hidden',
          maxHeight,
          ...style,
        }}
      >
        {images.slice(0, 2).map((img, i) => (
          <LazyImage
            key={i}
            image={img}
            style={tileStyle({ height: maxHeight })}
            onClick={() => handleTap(i)}
          />
        ))}
      </div>
    )
  }

  // 3 images: 1 large left + 2 stacked right
  if (count === 3) {
    return (
      <div
        className={className}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: `${gap}px`,
          borderRadius: br,
          overflow: 'hidden',
          maxHeight,
          ...style,
        }}
      >
        <LazyImage
          image={images[0]}
          style={tileStyle({ gridRow: '1 / 3', height: '100%' })}
          onClick={() => handleTap(0)}
        />
        <LazyImage
          image={images[1]}
          style={tileStyle({ height: '100%' })}
          onClick={() => handleTap(1)}
        />
        <LazyImage
          image={images[2]}
          style={tileStyle({ height: '100%' })}
          onClick={() => handleTap(2)}
        />
      </div>
    )
  }

  // 4+ images: 2x2 grid, 4th tile shows +N overlay
  const remaining = count - 4
  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: `${gap}px`,
        borderRadius: br,
        overflow: 'hidden',
        maxHeight,
        ...style,
      }}
    >
      {images.slice(0, 4).map((img, i) => (
        <LazyImage
          key={i}
          image={img}
          style={tileStyle({ height: '100%' })}
          onClick={() => handleTap(i)}
          overlay={
            i === 3 && remaining > 0 ? (
              <div className="lumira-gallery-overlay">+{remaining}</div>
            ) : undefined
          }
        />
      ))}
    </div>
  )
}

export { LazyImage }
export type { ImageGalleryProps, GalleryImage as ImageGalleryImage }

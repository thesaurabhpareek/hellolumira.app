'use client'

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'

/* ══════════════════════════════════════════════════════════════════════════════
   Skeleton — Premium shimmer loading placeholders
   Types: text, image, card, avatar, custom rectangle
   Features: shimmer sweep, pulse fallback, responsive, dark-mode aware,
             prefers-reduced-motion support
   ══════════════════════════════════════════════════════════════════════════════ */

type SkeletonVariant = 'text' | 'image' | 'card' | 'avatar' | 'rectangle'
type AnimationMode = 'shimmer' | 'pulse'

interface SkeletonProps {
  /** Visual variant */
  variant?: SkeletonVariant
  /** Animation style */
  animation?: AnimationMode
  /** Width — number (px) or CSS string. Defaults to 100% */
  width?: number | string
  /** Height — number (px) or CSS string */
  height?: number | string
  /** Border radius override */
  borderRadius?: number | string
  /** Aspect ratio for image variant (e.g. 16/9) */
  aspectRatio?: number
  /** Number of text lines to render */
  lines?: number
  /** Additional CSS class */
  className?: string
  /** Style overrides */
  style?: CSSProperties
}

/* ── Shimmer keyframes injected once ─────────────────────────────────────── */

const SHIMMER_ID = 'lumira-skeleton-shimmer'

function ensureStyles() {
  if (typeof document === 'undefined') return
  if (document.getElementById(SHIMMER_ID)) return

  const style = document.createElement('style')
  style.id = SHIMMER_ID
  style.textContent = `
    @keyframes lumira-shimmer {
      0%   { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    @keyframes lumira-pulse {
      0%, 100% { opacity: 1; }
      50%      { opacity: 0.4; }
    }
    @media (prefers-reduced-motion: reduce) {
      .lumira-skeleton-shimmer-inner,
      .lumira-skeleton-pulse {
        animation: none !important;
        opacity: 0.6 !important;
      }
    }
  `
  document.head.appendChild(style)
}

/* ── Base block ──────────────────────────────────────────────────────────── */

function SkeletonBlock({
  width,
  height,
  borderRadius = 'var(--radius-sm)',
  animation = 'shimmer',
  aspectRatio,
  style,
  className,
}: {
  width?: number | string
  height?: number | string
  borderRadius?: number | string
  animation?: AnimationMode
  aspectRatio?: number
  style?: CSSProperties
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => { ensureStyles() }, [])

  const w = typeof width === 'number' ? `${width}px` : width ?? '100%'
  const h = typeof height === 'number' ? `${height}px` : height
  const br = typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius

  const base: CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    width: w,
    height: aspectRatio ? undefined : (h ?? '16px'),
    aspectRatio: aspectRatio ? `${aspectRatio}` : undefined,
    borderRadius: br,
    background: 'var(--surface-sunken, #F5F3EF)',
    ...style,
  }

  if (animation === 'pulse') {
    return (
      <div
        ref={ref}
        className={`lumira-skeleton-pulse ${className ?? ''}`}
        style={{
          ...base,
          animation: 'lumira-pulse 1.5s ease-in-out infinite',
        }}
      />
    )
  }

  return (
    <div ref={ref} className={className} style={base}>
      <div
        className="lumira-skeleton-shimmer-inner"
        style={{
          position: 'absolute',
          inset: 0,
          animation: 'lumira-shimmer 1.8s ease-in-out infinite',
          background:
            'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
        }}
      />
    </div>
  )
}

/* ── Text skeleton ───────────────────────────────────────────────────────── */

function TextSkeleton({
  lines = 3,
  animation,
  className,
  style,
}: Pick<SkeletonProps, 'lines' | 'animation' | 'className' | 'style'>) {
  const widths = ['100%', '92%', '78%', '85%', '65%']
  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: '10px', ...style }}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBlock
          key={i}
          width={widths[i % widths.length]}
          height={14}
          borderRadius={7}
          animation={animation}
        />
      ))}
    </div>
  )
}

/* ── Card skeleton ───────────────────────────────────────────────────────── */

function CardSkeleton({
  animation,
  className,
  style,
}: Pick<SkeletonProps, 'animation' | 'className' | 'style'>) {
  return (
    <div
      className={className}
      style={{
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        background: 'var(--color-white)',
        ...style,
      }}
    >
      <SkeletonBlock height={180} borderRadius={0} animation={animation} aspectRatio={16 / 9} />
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <SkeletonBlock width="60%" height={12} borderRadius={6} animation={animation} />
        <SkeletonBlock width="100%" height={14} borderRadius={7} animation={animation} />
        <SkeletonBlock width="85%" height={14} borderRadius={7} animation={animation} />
        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          <SkeletonBlock width={32} height={32} borderRadius="50%" animation={animation} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', justifyContent: 'center' }}>
            <SkeletonBlock width="40%" height={10} borderRadius={5} animation={animation} />
            <SkeletonBlock width="25%" height={10} borderRadius={5} animation={animation} />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Main export ─────────────────────────────────────────────────────────── */

export default function Skeleton({
  variant = 'rectangle',
  animation = 'shimmer',
  width,
  height,
  borderRadius,
  aspectRatio,
  lines,
  className,
  style,
}: SkeletonProps) {
  switch (variant) {
    case 'text':
      return <TextSkeleton lines={lines} animation={animation} className={className} style={style} />

    case 'avatar':
      return (
        <SkeletonBlock
          width={width ?? 48}
          height={height ?? 48}
          borderRadius="50%"
          animation={animation}
          className={className}
          style={style}
        />
      )

    case 'image':
      return (
        <SkeletonBlock
          width={width}
          height={height}
          borderRadius={borderRadius ?? 'var(--radius-md)'}
          aspectRatio={aspectRatio ?? 4 / 3}
          animation={animation}
          className={className}
          style={style}
        />
      )

    case 'card':
      return <CardSkeleton animation={animation} className={className} style={style} />

    default:
      return (
        <SkeletonBlock
          width={width}
          height={height}
          borderRadius={borderRadius}
          aspectRatio={aspectRatio}
          animation={animation}
          className={className}
          style={style}
        />
      )
  }
}

export { SkeletonBlock, TextSkeleton, CardSkeleton }
export type { SkeletonProps, SkeletonVariant, AnimationMode }

'use client'

import { useState, useEffect } from 'react'

/* ─────────────────────────────────────────────────────────
 *  Premium skeleton components for every page type.
 *  Warm, alive loading — like morning light on a surface.
 *  Uses CSS classes from globals.css: skeleton, skeleton-circle,
 *  skeleton-text, skeleton-heading, skeleton-card, skeleton-stagger,
 *  skeleton-pulse, premium-shimmer.
 * ───────────────────────────────────────────────────────── */

/* ── Base skeleton block ── */
function S({ style, className, circle }: { style?: React.CSSProperties; className?: string; circle?: boolean }) {
  return (
    <div
      className={`${circle ? 'skeleton-circle' : 'skeleton'} ${className ?? ''}`}
      style={{ borderRadius: circle ? '50%' : '8px', ...style }}
    />
  )
}

/* ── Warm card wrapper ── */
function CardShell({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: 'var(--color-white, #fff)',
        borderRadius: 18,
        padding: 20,
        marginBottom: 14,
        border: '1px solid var(--color-border, #E8E6E1)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/* ── Sprout SVG animation (for home loading) ── */
function SproutAnimation() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
      <svg
        width={48}
        height={48}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ animation: 'skeleton-breathe 3s ease-in-out infinite' }}
      >
        {/* Soil arc */}
        <ellipse cx="32" cy="52" rx="14" ry="4" fill="var(--terra-200, #F0C49E)" opacity="0.6">
          <animate attributeName="rx" values="14;16;14" dur="3s" repeatCount="indefinite" />
        </ellipse>
        {/* Stem */}
        <path
          d="M32 52 C32 52, 32 36, 32 28"
          stroke="var(--sage-500, #3D8178)"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        >
          <animate attributeName="d" values="M32 52 C32 52, 32 52, 32 52;M32 52 C32 52, 32 36, 32 28" dur="0.8s" fill="freeze" />
        </path>
        {/* Left leaf */}
        <path
          d="M32 36 C26 30, 16 30, 18 22 C20 14, 30 20, 32 28"
          fill="var(--sage-400, #549C92)"
          opacity="0.85"
        >
          <animate attributeName="opacity" values="0;0;0.85" dur="1.2s" fill="freeze" />
          <animateTransform attributeName="transform" type="rotate" values="-8 32 36;0 32 36;-3 32 36;0 32 36" dur="4s" repeatCount="indefinite" />
        </path>
        {/* Right leaf */}
        <path
          d="M32 32 C38 26, 48 26, 46 18 C44 10, 34 16, 32 24"
          fill="var(--sage-500, #3D8178)"
          opacity="0.9"
        >
          <animate attributeName="opacity" values="0;0;0;0.9" dur="1.4s" fill="freeze" />
          <animateTransform attributeName="transform" type="rotate" values="8 32 32;0 32 32;3 32 32;0 32 32" dur="4.5s" repeatCount="indefinite" />
        </path>
        {/* Tiny unfurling leaf */}
        <path
          d="M32 28 C30 24, 26 22, 28 18 C30 16, 31 22, 32 26"
          fill="var(--sage-300, #7BB5AD)"
          opacity="0"
        >
          <animate attributeName="opacity" values="0;0;0;0;0.7" dur="1.8s" fill="freeze" />
        </path>
        {/* Sparkles */}
        <circle cx="22" cy="16" r="1.5" fill="var(--terra-300, #E2A670)" opacity="0">
          <animate attributeName="opacity" values="0;0.8;0" dur="2.5s" repeatCount="indefinite" begin="1.5s" />
          <animate attributeName="r" values="1;2;1" dur="2.5s" repeatCount="indefinite" begin="1.5s" />
        </circle>
        <circle cx="44" cy="12" r="1" fill="var(--sage-300, #7BB5AD)" opacity="0">
          <animate attributeName="opacity" values="0;0.6;0" dur="3s" repeatCount="indefinite" begin="2s" />
          <animate attributeName="r" values="0.8;1.5;0.8" dur="3s" repeatCount="indefinite" begin="2s" />
        </circle>
      </svg>
    </div>
  )
}

/* ── Rotating warm messages ── */
const WARM_MESSAGES = [
  'Preparing your day...',
  'Gathering insights...',
  'Almost ready...',
]

function WarmMessage() {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex(prev => (prev + 1) % WARM_MESSAGES.length)
        setVisible(true)
      }, 350)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ textAlign: 'center', minHeight: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
      <p
        style={{
          fontSize: '0.82rem',
          fontWeight: 500,
          color: 'var(--sage-600, #336B63)',
          letterSpacing: '-0.01em',
          transition: 'opacity 0.35s ease, transform 0.35s ease',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(4px)',
        }}
      >
        {WARM_MESSAGES[index]}
      </p>
    </div>
  )
}


/* ══════════════════════════════════════════════════════════
 *  HOME SKELETON — feels like the app is "waking up"
 * ══════════════════════════════════════════════════════════ */
export function HomeSkeleton() {
  return (
    <div style={{ minHeight: '100%', background: 'var(--color-surface, #FAFAF8)', paddingBottom: 120 }}>
      <div className="content-width mx-auto px-4 pt-6 skeleton-pulse">
        {/* Sprout + warm message */}
        <SproutAnimation />
        <WarmMessage />

        {/* Staggered skeleton blocks */}
        <div className="skeleton-stagger">
          {/* Greeting row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
            <S style={{ height: 26, width: '52%', borderRadius: 8 }} />
            <S circle style={{ height: 28, width: 56 }} />
          </div>

          {/* Subtitle */}
          <S style={{ height: 16, width: '38%', borderRadius: 6, marginBottom: 20 }} />

          {/* Story strip — row of circles */}
          <div style={{ display: 'flex', gap: 14, marginBottom: 22, overflow: 'hidden' }}>
            {[0, 1, 2, 3, 4, 5].map(i => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <S circle style={{ width: 62, height: 62 }} />
                <S style={{ width: 40, height: 8, borderRadius: 4 }} />
              </div>
            ))}
          </div>

          {/* Hero card — large rounded rectangle */}
          <CardShell style={{ borderRadius: 18, padding: 20, marginBottom: 16 }}>
            <S style={{ height: 14, width: 80, borderRadius: 100, marginBottom: 12 }} />
            <S style={{ height: 20, width: '70%', borderRadius: 6, marginBottom: 8 }} />
            <S style={{ height: 14, width: '90%', borderRadius: 6, marginBottom: 6 }} />
            <S style={{ height: 14, width: '55%', borderRadius: 6 }} />
          </CardShell>

          {/* Quick tips — 2 cards side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            {[0, 1].map(i => (
              <CardShell key={i} style={{ borderRadius: 14, padding: 16, marginBottom: 0 }}>
                <S style={{ width: 32, height: 32, borderRadius: 10, marginBottom: 10 }} />
                <S style={{ height: 12, width: '80%', borderRadius: 4, marginBottom: 6 }} />
                <S style={{ height: 10, width: '55%', borderRadius: 4 }} />
              </CardShell>
            ))}
          </div>

          {/* Quick action pills */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
            {[0, 1, 2].map(i => (
              <CardShell key={i} style={{ borderRadius: 14, padding: 14, marginBottom: 0 }}>
                <S style={{ width: 32, height: 32, borderRadius: 10, marginBottom: 10 }} />
                <S style={{ height: 10, width: '70%', borderRadius: 4 }} />
              </CardShell>
            ))}
          </div>

          {/* Weekly guide — tall card */}
          <CardShell style={{ borderRadius: 16, padding: 18 }}>
            <S style={{ height: 12, width: 100, borderRadius: 100, marginBottom: 12 }} />
            <S style={{ height: 16, width: '75%', borderRadius: 6, marginBottom: 8 }} />
            <S style={{ height: 12, width: '50%', borderRadius: 6, marginBottom: 14 }} />
            <S style={{ height: 36, width: '100%', borderRadius: 10 }} />
          </CardShell>
        </div>
      </div>
    </div>
  )
}


/* ══════════════════════════════════════════════════════════
 *  CONTENT SKELETON
 * ══════════════════════════════════════════════════════════ */
export function ContentSkeleton() {
  return (
    <div style={{ minHeight: '100%', background: 'var(--color-surface, #FAFAF8)', paddingBottom: 24 }}>
      <div className="content-width mx-auto px-4 pt-6 skeleton-pulse">
        <div className="skeleton-stagger">
          {/* Back + title */}
          <S style={{ height: 14, width: 56, borderRadius: 6, marginBottom: 16 }} />
          <S style={{ height: 24, width: '50%', borderRadius: 8, marginBottom: 6 }} />
          <S style={{ height: 14, width: '75%', borderRadius: 6, marginBottom: 20 }} />

          {/* Stage tabs */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '1px solid var(--color-border, #E8E6E1)' }}>
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} style={{ flex: 1, padding: '12px 0', display: 'flex', justifyContent: 'center' }}>
                <S style={{ height: 12, width: '55%', borderRadius: 4 }} />
              </div>
            ))}
          </div>

          {/* Category chips */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 22, overflow: 'hidden' }}>
            {[0, 1, 2, 3, 4].map(i => (
              <S key={i} style={{ height: 34, width: 78, borderRadius: 100, flexShrink: 0 }} />
            ))}
          </div>

          {/* Article cards */}
          {[0, 1, 2, 3].map(i => (
            <CardShell key={i} style={{ borderRadius: 14, padding: 16, marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <S style={{ height: 22, width: 78, borderRadius: 100 }} />
                <S style={{ height: 22, width: 48, borderRadius: 100 }} />
              </div>
              <S style={{ height: 16, width: '82%', borderRadius: 6, marginBottom: 6 }} />
              <S style={{ height: 12, width: '55%', borderRadius: 6 }} />
            </CardShell>
          ))}
        </div>
      </div>
    </div>
  )
}


/* ══════════════════════════════════════════════════════════
 *  CHAT SKELETON
 * ══════════════════════════════════════════════════════════ */
export function ChatSkeleton() {
  return (
    <div style={{ minHeight: '100%', background: 'var(--color-surface, #FAFAF8)', paddingBottom: 24 }}>
      <div className="content-width mx-auto px-4 pt-6 skeleton-pulse">
        <div className="skeleton-stagger">
          {/* Header */}
          <S style={{ height: 24, width: '45%', borderRadius: 8, marginBottom: 6 }} />
          <S style={{ height: 14, width: '65%', borderRadius: 6, marginBottom: 22 }} />

          {/* New chat button */}
          <CardShell style={{ borderRadius: 14, padding: '14px 18px', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <S circle style={{ width: 36, height: 36 }} />
              <S style={{ height: 14, width: '50%', borderRadius: 6 }} />
            </div>
          </CardShell>

          {/* Section label */}
          <S style={{ height: 10, width: 80, borderRadius: 4, marginBottom: 14 }} />

          {/* Thread list */}
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '14px 0',
                borderBottom: i < 3 ? '1px solid var(--color-border, #E8E6E1)' : 'none',
              }}
            >
              <S circle style={{ width: 44, height: 44, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <S style={{ height: 14, width: '60%', borderRadius: 6, marginBottom: 8 }} />
                <S style={{ height: 12, width: '85%', borderRadius: 6 }} />
              </div>
              <S style={{ height: 10, width: 32, borderRadius: 4, flexShrink: 0 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


/* ══════════════════════════════════════════════════════════
 *  TRIBES SKELETON
 * ══════════════════════════════════════════════════════════ */
export function TribesSkeleton() {
  return (
    <div style={{ minHeight: '100%', background: 'var(--color-surface, #FAFAF8)', paddingBottom: 24 }}>
      <div className="content-width mx-auto px-4 pt-6 skeleton-pulse">
        <div className="skeleton-stagger">
          {/* Header */}
          <S style={{ height: 24, width: '40%', borderRadius: 8, marginBottom: 6 }} />
          <S style={{ height: 14, width: '65%', borderRadius: 6, marginBottom: 16 }} />

          {/* Search bar */}
          <CardShell style={{ borderRadius: 12, padding: '12px 16px', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <S style={{ width: 18, height: 18, borderRadius: 4, flexShrink: 0 }} />
              <S style={{ height: 12, width: '50%', borderRadius: 6 }} />
            </div>
          </CardShell>

          {/* Filter chips */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 22, overflow: 'hidden' }}>
            {[0, 1, 2, 3, 4].map(i => (
              <S key={i} style={{ height: 34, width: 78, borderRadius: 100, flexShrink: 0 }} />
            ))}
          </div>

          {/* Section label */}
          <S style={{ height: 10, width: 85, borderRadius: 4, marginBottom: 14 }} />

          {/* Tribe cards */}
          {[0, 1, 2].map(i => (
            <CardShell key={i} style={{ borderRadius: 14, padding: '14px 16px', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <S style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <S style={{ height: 16, width: '45%', borderRadius: 6 }} />
                    <S style={{ height: 28, width: 54, borderRadius: 100 }} />
                  </div>
                  <S style={{ height: 12, width: '88%', borderRadius: 6, marginBottom: 6 }} />
                  <S style={{ height: 10, width: '55%', borderRadius: 4 }} />
                </div>
              </div>
            </CardShell>
          ))}
        </div>
      </div>
    </div>
  )
}


/* ══════════════════════════════════════════════════════════
 *  CHECKIN SKELETON
 * ══════════════════════════════════════════════════════════ */
export function CheckinSkeleton() {
  return (
    <div style={{ minHeight: '100%', background: 'var(--color-surface, #FAFAF8)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="skeleton-pulse" style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>
        <div className="skeleton-stagger">
          {/* Illustration placeholder */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <S circle style={{ width: 80, height: 80 }} />
          </div>
          <S style={{ height: 20, width: '60%', borderRadius: 8, margin: '0 auto 10px' }} />
          <S style={{ height: 14, width: '80%', borderRadius: 6, margin: '0 auto 24px' }} />
          {/* Mood buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 20 }}>
            {[0, 1, 2, 3, 4].map(i => (
              <S key={i} style={{ width: 48, height: 48, borderRadius: 14 }} />
            ))}
          </div>
          <S style={{ height: 44, width: '100%', borderRadius: 12 }} />
        </div>
      </div>
    </div>
  )
}


/* ══════════════════════════════════════════════════════════
 *  PROFILE SKELETON
 * ══════════════════════════════════════════════════════════ */
export function ProfileSkeleton() {
  return (
    <div style={{ minHeight: '100%', background: 'var(--color-surface, #FAFAF8)', paddingBottom: 24 }}>
      <div className="content-width mx-auto px-4 pt-6 skeleton-pulse">
        <div className="skeleton-stagger">
          {/* Avatar + name */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
            <S circle style={{ width: 80, height: 80, marginBottom: 14 }} />
            <S style={{ height: 20, width: 140, borderRadius: 6, marginBottom: 6 }} />
            <S style={{ height: 14, width: 100, borderRadius: 6 }} />
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
            {[0, 1, 2].map(i => (
              <CardShell key={i} style={{ flex: 1, borderRadius: 14, padding: 16, textAlign: 'center', marginBottom: 0 }}>
                <S style={{ height: 20, width: 40, borderRadius: 6, margin: '0 auto 8px' }} />
                <S style={{ height: 10, width: 50, borderRadius: 4, margin: '0 auto' }} />
              </CardShell>
            ))}
          </div>

          {/* Settings rows */}
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: '1px solid var(--color-border, #E8E6E1)' }}>
              <S style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0 }} />
              <S style={{ height: 14, width: '50%', borderRadius: 6, flex: 1 }} />
              <S style={{ width: 20, height: 12, borderRadius: 4, flexShrink: 0 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


/* ══════════════════════════════════════════════════════════
 *  GENERIC APP SKELETON (fallback)
 * ══════════════════════════════════════════════════════════ */
export function AppSkeleton() {
  return (
    <div style={{ minHeight: '100%', background: 'var(--color-surface, #FAFAF8)', paddingBottom: 24 }}>
      <div className="content-width mx-auto px-4 pt-6 skeleton-pulse">
        <div className="skeleton-stagger">
          <S style={{ height: 24, width: '48%', borderRadius: 8, marginBottom: 8 }} />
          <S style={{ height: 14, width: '66%', borderRadius: 6, marginBottom: 24 }} />

          <CardShell style={{ borderRadius: 16, padding: 20, marginBottom: 14 }}>
            <S style={{ height: 16, width: '70%', borderRadius: 6, marginBottom: 10 }} />
            <S style={{ height: 12, width: '90%', borderRadius: 6, marginBottom: 6 }} />
            <S style={{ height: 12, width: '50%', borderRadius: 6 }} />
          </CardShell>

          <CardShell style={{ borderRadius: 16, padding: 20, marginBottom: 14 }}>
            <S style={{ height: 16, width: '60%', borderRadius: 6, marginBottom: 10 }} />
            <S style={{ height: 12, width: '85%', borderRadius: 6, marginBottom: 6 }} />
            <S style={{ height: 12, width: '45%', borderRadius: 6 }} />
          </CardShell>

          <CardShell style={{ borderRadius: 16, padding: 20 }}>
            <S style={{ height: 16, width: '55%', borderRadius: 6, marginBottom: 10 }} />
            <S style={{ height: 12, width: '80%', borderRadius: 6 }} />
          </CardShell>
        </div>
      </div>
    </div>
  )
}

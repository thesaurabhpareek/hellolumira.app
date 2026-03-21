/**
 * @module Confetti
 * @description Reusable CSS-only confetti system with physics-based falling,
 *   rotation, and sway. Uses Lumira brand palette. Performance-optimized with
 *   will-change and requestAnimationFrame-friendly CSS animations.
 *   Auto-cleans up after animation completes.
 * @version 1.0.0
 * @since March 2026
 */
'use client'

import { useEffect, useRef, useState } from 'react'

/** Lumira brand confetti palette: sage, terra, coral, amber, gold, green */
const PALETTE = [
  '#3D8178', // Sage 500
  '#C4844E', // Terra 400
  '#E87461', // Coral
  '#D69E2E', // Amber
  '#F59E0B', // Gold
  '#22C55E', // Green
  '#A8CECA', // Sage 200
  '#D97706', // Dark Amber
]

interface ConfettiProps {
  /** Number of particles (default: 50) */
  count?: number
  /** Duration in ms before auto-cleanup (default: 3500) */
  duration?: number
  /** Spread angle — 'narrow' | 'wide' | 'full' (default: 'full') */
  spread?: 'narrow' | 'wide' | 'full'
  /** Whether the confetti is active */
  active?: boolean
  /** Callback when animation finishes */
  onComplete?: () => void
}

interface Particle {
  id: number
  left: number
  delay: number
  duration: number
  color: string
  size: number
  shape: 'circle' | 'square' | 'ribbon'
  rotation: number
  sway: number
}

export default function Confetti({
  count = 50,
  duration = 3500,
  spread = 'full',
  active = true,
  onComplete,
}: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const hasRun = useRef(false)

  useEffect(() => {
    if (!active || hasRun.current) return
    hasRun.current = true

    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      onComplete?.()
      return
    }

    const spreadRange = spread === 'narrow' ? [30, 70] : spread === 'wide' ? [10, 90] : [0, 100]

    const generated: Particle[] = Array.from({ length: count }, (_, i) => {
      const shapes: Particle['shape'][] = ['circle', 'square', 'ribbon']
      return {
        id: i,
        left: spreadRange[0] + Math.random() * (spreadRange[1] - spreadRange[0]),
        delay: Math.random() * 0.8,
        duration: 2 + Math.random() * 2,
        color: PALETTE[i % PALETTE.length],
        size: 5 + Math.random() * 9,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        rotation: Math.random() * 720,
        sway: (Math.random() - 0.5) * 200,
      }
    })

    setParticles(generated)

    const timer = setTimeout(() => {
      setParticles([])
      onComplete?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [active, count, duration, spread, onComplete])

  // Reset when active toggles off then on
  useEffect(() => {
    if (!active) {
      hasRun.current = false
      setParticles([])
    }
  }, [active])

  if (particles.length === 0) return null

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 100,
      }}
    >
      {particles.map((p) => {
        const borderRadius =
          p.shape === 'circle' ? '50%' : p.shape === 'ribbon' ? '1px' : '2px'
        const width = p.shape === 'ribbon' ? `${p.size * 0.4}px` : `${p.size}px`
        const height = p.shape === 'ribbon' ? `${p.size * 1.5}px` : `${p.size}px`

        return (
          <span
            key={p.id}
            style={{
              position: 'absolute',
              left: `${p.left}%`,
              top: '-20px',
              width,
              height,
              background: p.color,
              borderRadius,
              opacity: 0,
              willChange: 'transform, opacity',
              animation: `lumira-confetti-cascade ${p.duration}s ${p.delay}s ease-out forwards`,
              ['--confetti-sway' as string]: `${p.sway}px`,
              ['--confetti-rotate' as string]: `${p.rotation}deg`,
            }}
          />
        )
      })}

      <style>{`
        @keyframes lumira-confetti-cascade {
          0% {
            opacity: 1;
            transform: translateY(0) translateX(0) rotate(0deg) scale(1);
          }
          25% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateY(100vh) translateX(var(--confetti-sway, 0px)) rotate(var(--confetti-rotate, 720deg)) scale(0.6);
          }
        }
      `}</style>
    </div>
  )
}

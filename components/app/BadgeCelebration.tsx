// components/app/BadgeCelebration.tsx — Animated badge celebration overlay
// v1.1.0 — Migrated inline styles → Tailwind; keyframes moved to globals.css
'use client'

import { useState, useEffect, useRef } from 'react'
import { triggerHaptic, triggerConfetti } from '@/lib/animations'

interface BadgeCelebrationProps {
  badgeName: string
  badgeEmoji: string
  onDismiss?: () => void
}

export default function BadgeCelebration({ badgeName, badgeEmoji, onDismiss }: BadgeCelebrationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const showTimer = setTimeout(() => {
      setIsVisible(true)
      triggerHaptic('success')
      if (overlayRef.current) triggerConfetti(overlayRef.current, 40)
      setTimeout(() => triggerHaptic('medium'), 300)
    }, 100)

    const hideTimer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onDismiss?.(), 300)
    }, 4000)

    return () => { clearTimeout(showTimer); clearTimeout(hideTimer) }
  }, [onDismiss])

  return (
    <>
      {/* Background overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[199] overflow-hidden transition-all duration-300"
        style={{
          background: isVisible ? 'rgba(0, 0, 0, 0.35)' : 'transparent',
          backdropFilter: isVisible ? 'blur(4px)' : 'none',
          WebkitBackdropFilter: isVisible ? 'blur(4px)' : 'none',
          pointerEvents: isVisible ? 'auto' : 'none',
        }}
        onClick={() => { setIsVisible(false); setTimeout(() => onDismiss?.(), 300) }}
      />

      {/* Badge card */}
      <div
        className="fixed z-[200] bg-[var(--color-white)] rounded-[20px] px-10 py-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.2)] max-w-[300px] w-[90%] transition-all duration-300"
        style={{
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) scale(${isVisible ? 1 : 0.8})`,
          opacity: isVisible ? 1 : 0,
          pointerEvents: isVisible ? 'auto' : 'none',
          transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Glow ring + emoji */}
        <div className="relative inline-block mb-4">
          <div
            className="absolute top-1/2 left-1/2 w-20 h-20 rounded-full"
            style={{
              transform: 'translate(-50%, -50%)',
              background: 'radial-gradient(circle, rgba(61, 129, 120, 0.15) 0%, transparent 70%)',
              animation: isVisible ? 'badge-glow-pulse 1.5s ease-in-out infinite' : 'none',
            }}
          />
          <div
            className="text-[56px] relative"
            style={{ animation: isVisible ? 'badge-bounce-in 0.6s ease-out' : 'none' }}
          >
            {badgeEmoji}
          </div>
        </div>

        <p className="text-xs font-bold text-primary uppercase tracking-[1px] mb-2">Badge earned!</p>
        <p className="text-lg font-bold text-foreground">{badgeName}</p>
        <p className="text-xs text-muted-foreground mt-4 opacity-60">Tap anywhere to dismiss</p>
      </div>
    </>
  )
}

// components/app/BadgeCelebration.tsx — Animated badge celebration toast
// Enhanced with confetti, haptic feedback, and badge bounce animation
'use client'

import { useState, useEffect, useRef } from 'react'
import { triggerHaptic, triggerConfetti } from '@/lib/animations'

interface BadgeCelebrationProps {
  badgeName: string
  badgeEmoji: string
  onDismiss?: () => void
}

export default function BadgeCelebration({
  badgeName,
  badgeEmoji,
  onDismiss,
}: BadgeCelebrationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Animate in + haptic
    const showTimer = setTimeout(() => {
      setIsVisible(true)
      triggerHaptic('success')

      // Trigger confetti on the overlay
      if (overlayRef.current) {
        triggerConfetti(overlayRef.current, 40)
      }

      // Second haptic burst for extra delight
      setTimeout(() => triggerHaptic('medium'), 300)
    }, 100)

    // Auto dismiss after 4 seconds
    const hideTimer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onDismiss?.(), 300)
    }, 4000)

    return () => {
      clearTimeout(showTimer)
      clearTimeout(hideTimer)
    }
  }, [onDismiss])

  return (
    <>
      {/* Background overlay */}
      <div
        ref={overlayRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: isVisible ? 'rgba(0, 0, 0, 0.35)' : 'transparent',
          backdropFilter: isVisible ? 'blur(4px)' : 'none',
          WebkitBackdropFilter: isVisible ? 'blur(4px)' : 'none',
          transition: 'all 0.3s ease',
          zIndex: 199,
          pointerEvents: isVisible ? 'auto' : 'none',
          overflow: 'hidden',
        }}
        onClick={() => {
          setIsVisible(false)
          setTimeout(() => onDismiss?.(), 300)
        }}
      />

      {/* Badge card */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) scale(${isVisible ? 1 : 0.8})`,
          opacity: isVisible ? 1 : 0,
          background: 'var(--color-white)',
          borderRadius: '20px',
          padding: '32px 40px',
          textAlign: 'center',
          zIndex: 200,
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          maxWidth: '300px',
          width: '90%',
        }}
      >
        {/* Glow ring behind emoji */}
        <div
          style={{
            position: 'relative',
            display: 'inline-block',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(61, 129, 120, 0.15) 0%, transparent 70%)',
              animation: isVisible ? 'badgeGlowPulse 1.5s ease-in-out infinite' : 'none',
            }}
          />
          <div
            style={{
              fontSize: '56px',
              animation: isVisible ? 'badgeBounceIn 0.6s ease-out' : 'none',
              position: 'relative',
            }}
          >
            {badgeEmoji}
          </div>
        </div>

        <p
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--color-primary)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '8px',
          }}
        >
          Badge earned!
        </p>
        <p
          style={{
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--color-slate)',
          }}
        >
          {badgeName}
        </p>

        <p
          style={{
            fontSize: '12px',
            color: 'var(--color-muted)',
            marginTop: '16px',
            opacity: 0.6,
          }}
        >
          Tap anywhere to dismiss
        </p>

        <style>{`
          @keyframes badgeBounceIn {
            0% { transform: scale(0); }
            50% { transform: scale(1.2); }
            70% { transform: scale(0.9); }
            100% { transform: scale(1); }
          }
          @keyframes badgeGlowPulse {
            0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
            50% { opacity: 1; transform: translate(-50%, -50%) scale(1.15); }
          }
        `}</style>
      </div>
    </>
  )
}

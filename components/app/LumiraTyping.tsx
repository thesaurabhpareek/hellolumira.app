/**
 * @module LumiraTyping
 * @description Enhanced typing indicator with rotating warm messages,
 *   progress bar, and seed animation. Keeps parents engaged during
 *   AI response generation (2-8 seconds typical).
 * @version 2.0.0
 * @since March 2026
 */
'use client'

import { useState, useEffect } from 'react'
import { LumiraAvatar } from './LumiraAvatar'

const WARM_MESSAGES = [
  { text: 'Lumira is thinking...', emoji: '💭' },
  { text: 'Analysing your check-in...', emoji: '🔍' },
  { text: 'Processing your responses...', emoji: '⚙️' },
  { text: 'Reviewing medical journals...', emoji: '📋' },
  { text: 'Evaluating latest research...', emoji: '🧬' },
  { text: 'Cross-referencing guidelines...', emoji: '📚' },
  { text: 'Preparing personalized insights...', emoji: '✨' },
  { text: 'Almost ready for you...', emoji: '🌿' },
]

export default function LumiraTyping() {
  const [messageIndex, setMessageIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [showSeed, setShowSeed] = useState(false)

  // Rotate through warm messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % WARM_MESSAGES.length)
    }, 2200)
    return () => clearInterval(interval)
  }, [])

  // Animate progress bar (non-linear, feels natural)
  useEffect(() => {
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      // Fast start, slow end — never reaches 100% (that's when the response arrives)
      const p = Math.min(92, 30 * Math.log10(elapsed / 500 + 1))
      setProgress(p)
      if (p < 92) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [])

  // Show seed bounce after 1.5s
  useEffect(() => {
    const timer = setTimeout(() => setShowSeed(true), 1500)
    return () => clearTimeout(timer)
  }, [])

  const current = WARM_MESSAGES[messageIndex]

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Lumira is typing"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px',
        marginBottom: '8px',
      }}
    >
      {/* Lumira avatar */}
      <div style={{ flexShrink: 0, paddingTop: '2px' }}>
        <LumiraAvatar size={28} />
      </div>

      {/* Enhanced typing bubble */}
      <div
        className="bubble-lumira"
        style={{
          padding: '14px 18px',
          minHeight: '64px',
          maxWidth: '260px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {/* Message with emoji */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span
            key={messageIndex}
            style={{
              fontSize: '18px',
              lineHeight: 1,
              animation: 'lumiraEmojiFade 0.3s ease',
            }}
          >
            {current.emoji}
          </span>
          <span
            key={`text-${messageIndex}`}
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--color-slate)',
              animation: 'lumiraTextSlide 0.3s ease',
            }}
          >
            {current.text}
          </span>
        </div>

        {/* Mini progress bar */}
        <div
          style={{
            height: '3px',
            borderRadius: '2px',
            background: '#E5E7EB',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              borderRadius: '2px',
              background: 'linear-gradient(90deg, var(--color-primary), #5BA89F)',
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        {/* Dots row with optional seed */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div className="typing-dot" />
          <div className="typing-dot" />
          <div className="typing-dot" />

          {/* Seed bonus hint */}
          {showSeed && (
            <span
              style={{
                marginLeft: 'auto',
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--color-accent)',
                opacity: 0.8,
                animation: 'lumiraSeedBounce 0.5s ease',
              }}
            >
              +5 seeds
            </span>
          )}
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes lumiraEmojiFade {
          0% { opacity: 0; transform: scale(0.5) rotate(-10deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes lumiraTextSlide {
          0% { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes lumiraSeedBounce {
          0% { opacity: 0; transform: translateY(8px); }
          60% { opacity: 1; transform: translateY(-3px); }
          100% { opacity: 0.8; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

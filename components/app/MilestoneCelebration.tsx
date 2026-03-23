/**
 * @module MilestoneCelebration
 * @description Full-screen overlay with CSS-only confetti animation for
 *   celebrating baby milestones. Shows milestone emoji, title, warm message.
 *   Includes CTAs to share in tribes and save to memories.
 *   Auto-dismisses after 5 seconds or on tap.
 * @version 1.1.0
 * @since March 2026
 */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { triggerHaptic } from '@/lib/animations'

interface MilestoneData {
  key: string
  type: string
  title: string
  emoji: string
  description: string
  is_major?: boolean
  celebration_message?: string
}

interface Props {
  milestone: MilestoneData
  babyId: string
  babyName: string | null
  onDismiss: () => void
}

export default function MilestoneCelebration({
  milestone,
  babyId,
  babyName,
  onDismiss,
}: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [visible, setVisible] = useState(true)

  const isMajor = milestone.is_major ?? false

  // Haptic on mount + auto-dismiss (longer for major milestones)
  useEffect(() => {
    triggerHaptic('success')
    // Second burst for extra delight
    const hapticTimer = setTimeout(() => triggerHaptic('medium'), 400)
    // Third burst for major milestones
    const hapticTimer2 = isMajor ? setTimeout(() => triggerHaptic('success'), 800) : null

    const dismissDelay = isMajor ? 8000 : 5000
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onDismiss, 300) // Wait for fade-out animation
    }, dismissDelay)

    return () => {
      clearTimeout(timer)
      clearTimeout(hapticTimer)
      if (hapticTimer2) clearTimeout(hapticTimer2)
    }
  }, [onDismiss, isMajor])

  const handleDismiss = useCallback(() => {
    setVisible(false)
    setTimeout(onDismiss, 300)
  }, [onDismiss])

  const handleSaveToMemories = async () => {
    if (saving || saved) return
    setSaving(true)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { error } = await supabase.from('baby_milestones').insert({
        baby_id: babyId,
        profile_id: user.id,
        milestone_type: milestone.type,
        milestone_key: milestone.key,
        title: milestone.title,
        description: milestone.description,
        celebrated_at: new Date().toISOString(),
      })

      if (error) {
        // If duplicate key error, still mark as saved
        if (error.code === '23505') {
          setSaved(true)
        } else {
          console.error('[MilestoneCelebration] Save error:', error)
        }
      } else {
        setSaved(true)
      }
    } catch (err) {
      console.error('[MilestoneCelebration] Unexpected error:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleShareInTribe = () => {
    const name = babyName || 'Our little one'
    const message = encodeURIComponent(
      `${milestone.emoji} ${name} just reached a milestone: ${milestone.title}! ${milestone.description}`
    )
    router.push(`/tribes?share=${message}`)
    handleDismiss()
  }

  // More confetti for major milestones
  const confettiPieces = Array.from({ length: isMajor ? 60 : 40 }, (_, i) => i)
  // Brand colors: Sage, Terra, gold, white, green, Sage light
  const colors = ['#3D8178', '#C4844E', '#F59E0B', '#FFFFFF', '#22C55E', '#A8CECA', '#D97706', '#EDF4F2']

  return (
    <div
      onClick={handleDismiss}
      className="fixed top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center p-6"
      style={{
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 0.3s ease',
      }}
    >
      {/* Confetti */}
      <div className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden pointer-events-none">
        {confettiPieces.map((i) => {
          const left = Math.random() * 100
          const delay = Math.random() * 0.8
          const duration = 2 + Math.random() * 2
          const color = colors[i % colors.length]
          const size = 6 + Math.random() * 10
          const rotation = Math.random() * 720
          const sway = (Math.random() - 0.5) * 200

          return (
            <span
              key={i}
              style={{
                position: 'absolute',
                left: `${left}%`,
                top: '-20px',
                width: `${size}px`,
                height: `${size}px`,
                background: color,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                animation: `milestone-confetti ${duration}s ${delay}s ease-out forwards`,
                transform: `rotate(${rotation}deg)`,
                opacity: 0,
                // Use custom property for sway
                ['--sway' as string]: `${sway}px`,
              }}
            />
          )
        })}
      </div>

      {/* Celebration card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[var(--color-white)] text-center relative z-[1] w-full"
        style={{
          borderRadius: '20px',
          padding: '32px 28px',
          maxWidth: '360px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
          animation: 'milestone-card-enter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        }}
      >
        {/* Emoji — bigger for major milestones */}
        <div
          className="leading-none mb-4"
          style={{
            fontSize: isMajor ? '80px' : '64px',
            animation: 'milestone-emoji-bounce 0.6s 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
            opacity: 0,
            transform: 'scale(0.5)',
          }}
        >
          {milestone.emoji}
        </div>

        {/* Title */}
        <h2 className="text-[22px] font-bold text-foreground mb-2 leading-[1.3]">
          {milestone.title}
        </h2>

        {/* Description — use celebration_message for extra warmth when available */}
        <p className="text-[15px] text-muted-foreground leading-[1.6] mb-6">
          {milestone.celebration_message || milestone.description}
        </p>

        {/* CTAs */}
        <div className="flex flex-col gap-[10px]">
          <button
            onClick={handleShareInTribe}
            className="w-full rounded-md border-none bg-primary text-white text-[15px] font-semibold cursor-pointer min-h-[48px] transition-opacity duration-150 ease-out"
            style={{ padding: '14px 20px' }}
          >
            Celebrate with your tribe! {'🎉'}
          </button>

          <button
            onClick={handleSaveToMemories}
            disabled={saving || saved}
            className="w-full rounded-md text-[15px] font-semibold min-h-[48px] transition-all duration-150 ease-out"
            style={{
              padding: '14px 20px',
              border: `1.5px solid ${saved ? '#22C55E' : 'var(--color-border)'}`,
              background: saved ? '#F0FDF4' : 'var(--color-white)',
              color: saved ? '#15803D' : 'var(--color-slate)',
              cursor: saved ? 'default' : 'pointer',
            }}
          >
            {saved ? 'Saved to memories ✓' : saving ? 'Saving...' : 'Save to memories'}
          </button>
        </div>

        {/* Dismiss hint */}
        <p className="text-[12px] text-muted-foreground mt-4 opacity-60">
          Tap anywhere to dismiss
        </p>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes milestone-confetti {
          0% {
            opacity: 1;
            transform: translateY(0) translateX(0) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: translateY(100vh) translateX(var(--sway, 0px)) rotate(720deg);
          }
        }

        @keyframes milestone-card-enter {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes milestone-emoji-bounce {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          60% {
            opacity: 1;
            transform: scale(1.2);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  )
}

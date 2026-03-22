'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  HomeSkeleton,
  ContentSkeleton,
  ChatSkeleton,
  TribesSkeleton,
  ProfileSkeleton,
  AppSkeleton,
} from '@/components/app/PageSkeletons'

const PARENTING_TIPS = [
  "Did you know? Babies can recognise their mother's voice from birth",
  "Tip: Skin-to-skin contact helps regulate baby's heartbeat",
  "Fun fact: Newborns can only see about 20-30cm clearly",
  "Remember: There's no such thing as a perfect parent",
  "Your baby grows fastest in the first year of life",
  "Laughter is the best medicine — for parents too!",
  "Babies start dreaming even before they are born",
  "A toddler takes about 176 steps per minute on average",
  "Reading aloud to your baby builds neural connections",
  "Babies are born with about 300 bones — more than adults",
  "Your voice is the most soothing sound to your child",
  "Hugging your child releases oxytocin for both of you",
  "Children laugh about 300 times a day, adults only 20",
  "Tip: Routines help young children feel safe and secure",
  "A baby's brain doubles in size during the first year",
  "Singing to your baby improves language development",
  "Babies can taste what their mothers eat through breast milk",
  "Tip: Eye contact strengthens your bond with your baby",
  "Fun fact: Newborns have no kneecaps — they develop later",
  "Your calm presence is the greatest gift to your child",
  "Babies prefer faces over any other visual pattern",
  "Tip: Tummy time strengthens your baby's core muscles",
  "A toddler learns about 10 new words every single day",
  "Fun fact: Babies are born with a natural swimming reflex",
]

function SproutIcon({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Soil / base arc */}
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
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="-8 32 36;0 32 36;-3 32 36;0 32 36"
          dur="4s"
          repeatCount="indefinite"
        />
      </path>

      {/* Right leaf */}
      <path
        d="M32 32 C38 26, 48 26, 46 18 C44 10, 34 16, 32 24"
        fill="var(--sage-500, #3D8178)"
        opacity="0.9"
      >
        <animate attributeName="opacity" values="0;0;0;0.9" dur="1.4s" fill="freeze" />
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="8 32 32;0 32 32;3 32 32;0 32 32"
          dur="4.5s"
          repeatCount="indefinite"
        />
      </path>

      {/* Small unfurling leaf at top */}
      <path
        d="M32 28 C30 24, 26 22, 28 18 C30 16, 31 22, 32 26"
        fill="var(--sage-300, #7BB5AD)"
        opacity="0"
      >
        <animate attributeName="opacity" values="0;0;0;0;0.7" dur="1.8s" fill="freeze" />
      </path>

      {/* Sparkle */}
      <circle cx="22" cy="16" r="1.5" fill="var(--terra-300, #E2A670)" opacity="0">
        <animate attributeName="opacity" values="0;0.8;0" dur="2.5s" repeatCount="indefinite" begin="1.5s" />
        <animate attributeName="r" values="1;2;1" dur="2.5s" repeatCount="indefinite" begin="1.5s" />
      </circle>
      <circle cx="44" cy="12" r="1" fill="var(--sage-300, #7BB5AD)" opacity="0">
        <animate attributeName="opacity" values="0;0.6;0" dur="3s" repeatCount="indefinite" begin="2s" />
        <animate attributeName="r" values="0.8;1.5;0.8" dur="3s" repeatCount="indefinite" begin="2s" />
      </circle>
    </svg>
  )
}

/* ── Page-variant type for rendering page-specific skeletons ── */
type PageVariant = 'home' | 'content' | 'chat' | 'tribes' | 'profile' | 'generic'

interface LoadingScreenProps {
  variant?: 'full' | 'inline' | 'overlay'
  /** When set, renders page-specific skeleton layout instead of centered spinner */
  page?: PageVariant
  message?: string
}

function PageSkeletonForVariant({ page }: { page: PageVariant }) {
  switch (page) {
    case 'home':    return <HomeSkeleton />
    case 'content': return <ContentSkeleton />
    case 'chat':    return <ChatSkeleton />
    case 'tribes':  return <TribesSkeleton />
    case 'profile': return <ProfileSkeleton />
    case 'generic':
    default:        return <AppSkeleton />
  }
}

export default function LoadingScreen({ variant = 'full', page, message }: LoadingScreenProps) {
  const [tipIndex, setTipIndex] = useState(() => Math.floor(Math.random() * PARENTING_TIPS.length))
  const [visible, setVisible] = useState(true)

  const cycleTip = useCallback(() => {
    setVisible(false)
    const fadeTimer = setTimeout(() => {
      setTipIndex(prev => (prev + 1) % PARENTING_TIPS.length)
      setVisible(true)
    }, 400)
    return fadeTimer
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      cycleTip()
    }, 3500)
    return () => clearInterval(interval)
  }, [cycleTip])

  // If a page variant is specified, render the page skeleton directly
  if (page) {
    return <PageSkeletonForVariant page={page} />
  }

  const isOverlay = variant === 'overlay'
  const isInline = variant === 'inline'

  return (
    <div
      className="loading-screen-root"
      style={{
        ...(isOverlay
          ? {
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(250, 250, 248, 0.88)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }
          : isInline
          ? {
              padding: '32px 16px',
              minHeight: '200px',
            }
          : {
              minHeight: '100dvh',
              background: 'var(--color-surface, #FAFAF8)',
            }),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Animated sprout icon */}
      <div
        style={{
          marginBottom: isInline ? '16px' : '24px',
          animation: 'loadingPulse 2.5s ease-in-out infinite',
        }}
      >
        <SproutIcon size={isInline ? 40 : 56} />
      </div>

      {/* Optional custom message */}
      {message && (
        <p
          style={{
            fontSize: isInline ? '0.85rem' : '0.95rem',
            fontWeight: 500,
            color: 'var(--sage-600, #336B63)',
            marginBottom: '16px',
            letterSpacing: '-0.01em',
          }}
        >
          {message}
        </p>
      )}

      {/* Rotating tip */}
      {!isInline && (
        <div
          style={{
            maxWidth: '320px',
            textAlign: 'center',
            minHeight: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 24px',
          }}
        >
          <p
            style={{
              fontSize: '0.82rem',
              lineHeight: 1.5,
              color: 'var(--text-secondary, #6B7280)',
              transition: 'opacity 0.4s ease, transform 0.4s ease',
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(4px)',
            }}
          >
            {PARENTING_TIPS[tipIndex]}
          </p>
        </div>
      )}

      {/* Progress dots */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          marginTop: isInline ? '12px' : '24px',
        }}
      >
        {[0, 1, 2].map(i => (
          <div
            key={i}
            style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background: 'var(--sage-300, #7BB5AD)',
              animation: `loadingDotBounce 1.4s ease-in-out ${i * 0.16}s infinite`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes loadingPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.06); opacity: 0.85; }
        }
        @keyframes loadingDotBounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .loading-screen-root * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  )
}

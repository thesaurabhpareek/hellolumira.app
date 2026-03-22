'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

/** All optional profile fields that count toward completion */
const PROFILE_FIELDS = [
  { key: 'display_name', label: 'Display name', seeds: 5, prompt: 'Add a display name' },
  { key: 'pronouns', label: 'Pronouns', seeds: 5, prompt: 'Set your pronouns' },
  { key: 'bio', label: 'Bio', seeds: 10, prompt: 'Write a short bio' },
  { key: 'location_city', label: 'City', seeds: 5, prompt: 'Add your city' },
  { key: 'birth_month', label: 'Birth month', seeds: 5, prompt: 'Add your birth month' },
  { key: 'parenting_style', label: 'Parenting style', seeds: 5, prompt: 'Share your parenting style' },
  { key: 'feeding_method', label: 'Feeding method', seeds: 5, prompt: 'Share your feeding approach' },
  { key: 'birth_type', label: 'Birth type', seeds: 5, prompt: 'Add birth type' },
  { key: 'number_of_children', label: 'Number of children', seeds: 5, prompt: 'How many children do you have?' },
  { key: 'languages_spoken', label: 'Languages', seeds: 5, prompt: 'What languages do you speak?' },
  { key: 'work_status', label: 'Work status', seeds: 5, prompt: 'Share your work situation' },
  { key: 'interests', label: 'Interests', seeds: 10, prompt: 'Choose topics you care about' },
  { key: 'looking_for', label: 'Looking for', seeds: 10, prompt: 'What do you want from community?' },
] as const

type ProfileData = Record<string, unknown>

function isFieldComplete(key: string, profile: ProfileData): boolean {
  const val = profile[key]
  if (val === null || val === undefined || val === '') return false
  if (Array.isArray(val)) return val.length > 0
  if (typeof val === 'number') return true
  return !!val
}

function getMilestone(pct: number): { label: string; color: string } {
  if (pct >= 100) return { label: 'Fully Bloomed', color: '#EC4899' }
  if (pct >= 75) return { label: 'Almost There', color: '#F59E0B' }
  if (pct >= 50) return { label: 'Sharing More', color: '#3D8178' }
  if (pct >= 25) return { label: 'Getting Started', color: '#8BC34A' }
  return { label: 'Just Planted', color: '#9CA3AF' }
}

interface ProfileCompletionCardProps {
  profile: ProfileData
}

export default function ProfileCompletionCard({ profile }: ProfileCompletionCardProps) {
  const [animatedPct, setAnimatedPct] = useState(0)

  const completed = PROFILE_FIELDS.filter((f) => isFieldComplete(f.key, profile))
  const incomplete = PROFILE_FIELDS.filter((f) => !isFieldComplete(f.key, profile))
  const pct = Math.round((completed.length / PROFILE_FIELDS.length) * 100)
  const milestone = getMilestone(pct)

  // Animate the ring on mount
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setAnimatedPct(pct)
      return
    }

    const duration = 1000
    const start = performance.now()
    let raf: number

    function tick(now: number) {
      const elapsed = now - start
      const t = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setAnimatedPct(Math.round(pct * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [pct])

  // Ring geometry
  const ringSize = 88
  const strokeWidth = 7
  const radius = (ringSize - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - animatedPct / 100)

  const isComplete = pct >= 100

  return (
    <div className="lumira-card mb-4">
      {/* Header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <p
          style={{
            fontSize: '13px',
            fontWeight: 700,
            color: 'var(--color-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Profile Completion
        </p>
        <span
          style={{
            fontSize: '12px',
            fontWeight: 700,
            color: milestone.color,
            background: `${milestone.color}15`,
            padding: '3px 10px',
            borderRadius: '100px',
          }}
        >
          {milestone.label}
        </span>
      </div>

      {/* Ring + percentage */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          marginBottom: incomplete.length > 0 ? '20px' : '0',
        }}
      >
        <div style={{ position: 'relative', width: ringSize, height: ringSize, flexShrink: 0 }}>
          <svg
            width={ringSize}
            height={ringSize}
            style={{ transform: 'rotate(-90deg)' }}
          >
            {/* Background track */}
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              fill="none"
              stroke="var(--color-border)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            {/* Progress arc */}
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              fill="none"
              stroke={isComplete ? '#EC4899' : '#3D8178'}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{
                filter: isComplete ? 'drop-shadow(0 0 6px rgba(236, 72, 153, 0.35))' : 'none',
              }}
            />
          </svg>
          {/* Center text */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                fontSize: '22px',
                fontWeight: 800,
                color: 'var(--color-slate)',
                lineHeight: 1,
              }}
            >
              {animatedPct}%
            </span>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <p
            style={{
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--color-slate)',
              marginBottom: '4px',
            }}
          >
            {isComplete ? 'Profile complete!' : `Profile ${pct}% complete`}
          </p>
          <p
            style={{
              fontSize: '13px',
              color: 'var(--color-muted)',
              lineHeight: 1.5,
            }}
          >
            {isComplete
              ? 'You\'ve filled out everything. Your garden is in full bloom!'
              : `Complete ${incomplete.length} more field${incomplete.length === 1 ? '' : 's'} to earn seeds and help us personalize your experience.`}
          </p>
        </div>
      </div>

      {/* Incomplete field prompts (show up to 4) */}
      {incomplete.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {incomplete.slice(0, 4).map((field, i, arr) => (
            <div key={field.key}>
              <Link
                href={`/profile/edit?focus=${field.key}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 4px',
                  textDecoration: 'none',
                  color: 'var(--color-slate)',
                  minHeight: '44px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: 'var(--color-border)',
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>{field.prompt}</span>
                </div>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--color-accent)',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  +{field.seeds} seeds
                </span>
              </Link>
              {i < arr.length - 1 && (
                <div
                  style={{
                    height: '1px',
                    background: 'var(--color-border)',
                    margin: '0 4px',
                  }}
                />
              )}
            </div>
          ))}
          {incomplete.length > 4 && (
            <Link
              href="/profile/edit"
              style={{
                display: 'block',
                textAlign: 'center',
                padding: '10px',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-primary)',
                textDecoration: 'none',
              }}
            >
              +{incomplete.length - 4} more fields to complete
            </Link>
          )}
        </div>
      )}

      {/* All done celebration */}
      {isComplete && (
        <div
          style={{
            marginTop: '8px',
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #FDF2F8, #FCE7F3)',
            border: '1px solid #FBCFE8',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#BE185D' }}>
            Your profile is fully bloomed!
          </p>
        </div>
      )}
    </div>
  )
}

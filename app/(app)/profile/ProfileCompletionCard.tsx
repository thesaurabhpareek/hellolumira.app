'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

/** Profile fields that count toward completion — core (onboarding) + enrichment (optional) */
const PROFILE_FIELDS = [
  // Core fields — filled during onboarding, give baseline credit, no seeds reward
  { key: 'first_name', label: 'Name', weight: 3, seeds: 0, prompt: '', core: true },
  { key: 'avatar_emoji', label: 'Avatar', weight: 2, seeds: 0, prompt: '', core: true },
  { key: 'first_time_parent', label: 'Parent experience', weight: 2, seeds: 0, prompt: '', core: true },
  // Enrichment fields — optional, post-onboarding, earn seeds
  { key: 'display_name', label: 'Display name', weight: 2, seeds: 5, prompt: 'Add a display name', core: false },
  { key: 'pronouns', label: 'Pronouns', weight: 2, seeds: 5, prompt: 'Set your pronouns', core: false },
  { key: 'bio', label: 'Bio', weight: 3, seeds: 10, prompt: 'Write a short bio', core: false },
  { key: 'location_city', label: 'City', weight: 2, seeds: 5, prompt: 'Add your city', core: false },
  { key: 'birth_month', label: 'Birth month', weight: 2, seeds: 5, prompt: 'Add your birth month', core: false },
  { key: 'parenting_style', label: 'Parenting style', weight: 2, seeds: 5, prompt: 'Share your parenting style', core: false },
  { key: 'feeding_method', label: 'Feeding method', weight: 2, seeds: 5, prompt: 'Share your feeding approach', core: false },
  { key: 'birth_type', label: 'Birth type', weight: 2, seeds: 5, prompt: 'Add birth type', core: false },
  { key: 'number_of_children', label: 'Number of children', weight: 2, seeds: 5, prompt: 'How many children do you have?', core: false },
  { key: 'languages_spoken', label: 'Languages', weight: 2, seeds: 5, prompt: 'What languages do you speak?', core: false },
  { key: 'work_status', label: 'Work status', weight: 2, seeds: 5, prompt: 'Share your work situation', core: false },
  { key: 'interests', label: 'Interests', weight: 3, seeds: 10, prompt: 'Choose topics you care about', core: false },
  { key: 'looking_for', label: 'Looking for', weight: 3, seeds: 10, prompt: 'What do you want from community?', core: false },
  // V2 personalization fields — directly improve Lumira's responses
  { key: 'country_region', label: 'Region', weight: 3, seeds: 10, prompt: 'Set your country for localized guidance', core: false },
  { key: 'support_network', label: 'Support network', weight: 3, seeds: 10, prompt: 'Tell us about your support system', core: false },
  { key: 'baby_temperament', label: 'Baby temperament', weight: 3, seeds: 10, prompt: 'Describe your baby\'s temperament', core: false },
  { key: 'concerns_priority', label: 'Top concerns', weight: 3, seeds: 10, prompt: 'What worries you most right now?', core: false },
] as const

type ProfileData = Record<string, unknown>

function isFieldComplete(key: string, profile: ProfileData): boolean {
  const val = profile[key]
  if (val === null || val === undefined || val === '') return false
  if (typeof val === 'boolean') return true // boolean fields are "complete" once set (false is valid)
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
  const allIncomplete = PROFILE_FIELDS.filter((f) => !isFieldComplete(f.key, profile))
  // Only show enrichment fields as actionable — core fields are done during onboarding
  const incomplete = allIncomplete.filter((f) => !f.core)
  // Weight-based percentage instead of count-based
  const totalWeight = PROFILE_FIELDS.reduce((sum, f) => sum + f.weight, 0)
  const completedWeight = completed.reduce((sum, f) => sum + f.weight, 0)
  const pct = Math.round((completedWeight / totalWeight) * 100)
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

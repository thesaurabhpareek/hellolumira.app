'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

/**
 * Premium avatar illustrations — SVG-based, each with a distinct symbol.
 * Sage: leaf · Terra: mountain · Bloom: 4-petal flower · Ocean: waves
 * Sunset: sun + rays · Forest: pine tree · Lavender: star · Coral: heart
 * Midnight: crescent moon · Rose: 5-petal blossom
 */
const AVATAR_OPTIONS: {
  id: string
  label: string
  bgGradient: [string, string]
  illustration: React.ReactNode
}[] = [
  {
    id: 'sage-parent',
    label: 'Sage',
    bgGradient: ['#3D8178', '#5BA89F'],
    illustration: (
      // Leaf with vein
      <svg viewBox="0 0 48 48" width="36" height="36" fill="none">
        <path d="M24 6C24 6 8 18 8 29C8 38 15.2 44 24 44C32.8 44 40 38 40 29C40 18 24 6 24 6Z" fill="white" opacity="0.92"/>
        <path d="M24 44V18" stroke="rgba(61,129,120,0.35)" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M24 32L16 26" stroke="rgba(61,129,120,0.25)" strokeWidth="1.2" strokeLinecap="round"/>
        <path d="M24 26L32 20" stroke="rgba(61,129,120,0.25)" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'terra-parent',
    label: 'Terra',
    bgGradient: ['#C4844E', '#D4A574'],
    illustration: (
      // Mountain peaks
      <svg viewBox="0 0 48 48" width="36" height="36" fill="none">
        <path d="M5 38L18 12L29 30L33 22L43 38H5Z" fill="white" opacity="0.92"/>
        <path d="M18 12L29 30" stroke="rgba(196,132,78,0.25)" strokeWidth="1" strokeLinecap="round"/>
        <circle cx="36" cy="11" r="4" fill="white" opacity="0.55"/>
      </svg>
    ),
  },
  {
    id: 'bloom',
    label: 'Bloom',
    bgGradient: ['#E8A0BF', '#F0C0D8'],
    illustration: (
      // 4-petal cross flower
      <svg viewBox="0 0 48 48" width="36" height="36" fill="none">
        <ellipse cx="24" cy="11" rx="5" ry="8" fill="white" opacity="0.85"/>
        <ellipse cx="24" cy="37" rx="5" ry="8" fill="white" opacity="0.85"/>
        <ellipse cx="11" cy="24" rx="8" ry="5" fill="white" opacity="0.85"/>
        <ellipse cx="37" cy="24" rx="8" ry="5" fill="white" opacity="0.85"/>
        <circle cx="24" cy="24" r="7" fill="white" opacity="0.97"/>
      </svg>
    ),
  },
  {
    id: 'ocean',
    label: 'Ocean',
    bgGradient: ['#4A90D9', '#7AB4E8'],
    illustration: (
      // Three horizontal waves
      <svg viewBox="0 0 48 48" width="36" height="36" fill="none">
        <path d="M5 18C8.5 12 12 24 15.5 18C19 12 22.5 24 26 18C29.5 12 33 24 36.5 18C39 14.5 42 16 43 16" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.92"/>
        <path d="M5 27C8.5 21 12 33 15.5 27C19 21 22.5 33 26 27C29.5 21 33 33 36.5 27C39 23.5 42 25 43 25" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7"/>
        <path d="M5 36C8.5 30 12 42 15.5 36C19 30 22.5 42 26 36C29.5 30 33 42 36.5 36" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5"/>
      </svg>
    ),
  },
  {
    id: 'sunset',
    label: 'Sunset',
    bgGradient: ['#F59E0B', '#FBBF24'],
    illustration: (
      // Sun with 8 rays
      <svg viewBox="0 0 48 48" width="36" height="36" fill="none">
        <circle cx="24" cy="24" r="9" fill="white" opacity="0.95"/>
        <path d="M24 5V10M24 38V43M5 24H10M38 24H43M10.5 10.5L14 14M34 34L37.5 37.5M37.5 10.5L34 14M14 34L10.5 37.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.8"/>
      </svg>
    ),
  },
  {
    id: 'forest',
    label: 'Forest',
    bgGradient: ['#2D6A4F', '#52B788'],
    illustration: (
      // Pine tree: stacked triangles + trunk
      <svg viewBox="0 0 48 48" width="36" height="36" fill="none">
        <path d="M24 6L36 24H28L34 36H26V43H22V36H14L20 24H12L24 6Z" fill="white" opacity="0.92"/>
      </svg>
    ),
  },
  {
    id: 'lavender',
    label: 'Lavender',
    bgGradient: ['#9B8EC4', '#BFB4DA'],
    illustration: (
      // 6-point star
      <svg viewBox="0 0 48 48" width="36" height="36" fill="none">
        <path d="M24 5L27.5 17.5H41L30.5 25.5L34 38L24 30L14 38L17.5 25.5L7 17.5H20.5L24 5Z" fill="white" opacity="0.92"/>
      </svg>
    ),
  },
  {
    id: 'coral',
    label: 'Coral',
    bgGradient: ['#E07A5F', '#F2A48B'],
    illustration: (
      // Heart
      <svg viewBox="0 0 48 48" width="36" height="36" fill="none">
        <path d="M24 41C24 41 7 29 7 18C7 12 11.5 7.5 17 7.5C20.5 7.5 23.5 9.5 24 10.5C24.5 9.5 27.5 7.5 31 7.5C36.5 7.5 41 12 41 18C41 29 24 41 24 41Z" fill="white" opacity="0.92"/>
      </svg>
    ),
  },
  {
    id: 'midnight',
    label: 'Midnight',
    bgGradient: ['#2D3748', '#4A5568'],
    illustration: (
      // Crescent moon + stars
      <svg viewBox="0 0 48 48" width="36" height="36" fill="none">
        <path d="M29 7C22.5 9.5 18 16 18 24C18 32 22.5 38.5 29 41C18.5 41 9 33.5 9 24C9 14.5 18.5 7 29 7Z" fill="white" opacity="0.92"/>
        <circle cx="36" cy="10" r="2.5" fill="white" opacity="0.8"/>
        <circle cx="41" cy="19" r="1.8" fill="white" opacity="0.6"/>
        <circle cx="38" cy="27" r="1.2" fill="white" opacity="0.4"/>
      </svg>
    ),
  },
  {
    id: 'rose',
    label: 'Rose',
    bgGradient: ['#BE123C', '#E11D48'],
    illustration: (
      // 5-petal blossom (rotated ellipses around center)
      <svg viewBox="0 0 48 48" width="36" height="36" fill="none">
        <ellipse cx="24" cy="11" rx="4.5" ry="8" fill="white" opacity="0.85"/>
        <ellipse cx="35.6" cy="18" rx="4.5" ry="8" transform="rotate(72 35.6 18)" fill="white" opacity="0.85"/>
        <ellipse cx="31.4" cy="32" rx="4.5" ry="8" transform="rotate(144 31.4 32)" fill="white" opacity="0.85"/>
        <ellipse cx="16.6" cy="32" rx="4.5" ry="8" transform="rotate(216 16.6 32)" fill="white" opacity="0.85"/>
        <ellipse cx="12.4" cy="18" rx="4.5" ry="8" transform="rotate(288 12.4 18)" fill="white" opacity="0.85"/>
        <circle cx="24" cy="24" r="6.5" fill="white" opacity="0.97"/>
      </svg>
    ),
  },
]

/** Render the avatar circle for a given avatar ID */
export function AvatarCircle({ avatarId, size = 72 }: { avatarId: string; size?: number }) {
  const avatar = AVATAR_OPTIONS.find((a) => a.id === avatarId)
  const scale = size / 72

  if (!avatar) {
    // Fallback — default sage avatar
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #3D8178, #5BA89F)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(61, 129, 120, 0.25)',
        }}
      >
        <div style={{ transform: scale !== 1 ? `scale(${scale})` : undefined }}>
          <svg viewBox="0 0 48 48" width="36" height="36" fill="none">
            <path d="M24 6C24 6 8 18 8 29C8 38 15.2 44 24 44C32.8 44 40 38 40 29C40 18 24 6 24 6Z" fill="white" opacity="0.92"/>
            <path d="M24 44V18" stroke="rgba(61,129,120,0.35)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${avatar.bgGradient[0]}, ${avatar.bgGradient[1]})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: `0 2px 8px ${avatar.bgGradient[0]}40`,
      }}
    >
      <div style={{ transform: scale !== 1 ? `scale(${scale})` : undefined }}>
        {avatar.illustration}
      </div>
    </div>
  )
}

interface AvatarPickerProps {
  profileId: string
  currentAvatar: string
}

export default function AvatarPicker({ profileId, currentAvatar }: AvatarPickerProps) {
  const [selected, setSelected] = useState(currentAvatar || 'sage-parent')
  const [saving, setSaving] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSelect = async (avatarId: string) => {
    if (avatarId === selected) return
    const prev = selected
    setSelected(avatarId)
    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_emoji: avatarId })
        .eq('id', profileId)

      if (error) {
        setSelected(prev)
      } else {
        startTransition(() => {
          router.refresh()
        })
      }
    } catch {
      setSelected(prev)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '12px',
        opacity: saving || isPending ? 0.7 : 1,
        transition: 'opacity 0.15s ease',
      }}
    >
      {AVATAR_OPTIONS.map((avatar) => {
        const isSelected = selected === avatar.id
        return (
          <div key={avatar.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => handleSelect(avatar.id)}
              disabled={saving || isPending}
              aria-label={avatar.label}
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                border: isSelected ? '3px solid #3D8178' : '2px solid transparent',
                background: `linear-gradient(135deg, ${avatar.bgGradient[0]}, ${avatar.bgGradient[1]})`,
                cursor: saving ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                padding: 0,
                boxShadow: isSelected
                  ? `0 0 0 2px white, 0 0 0 5px #3D8178`
                  : `0 2px 6px ${avatar.bgGradient[0]}30`,
                transform: isSelected ? 'scale(1.08)' : 'scale(1)',
              }}
            >
              <div style={{ transform: 'scale(0.65)' }}>
                {avatar.illustration}
              </div>
            </button>
            <span style={{ fontSize: '10px', color: isSelected ? '#3D8178' : 'var(--color-muted)', fontWeight: isSelected ? 700 : 500 }}>
              {avatar.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

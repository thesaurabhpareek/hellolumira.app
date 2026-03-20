'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const AVATAR_OPTIONS = [
  '\uD83D\uDC69',       // 👩
  '\uD83D\uDC68',       // 👨
  '\uD83D\uDC69\u200D\uD83E\uDDB1', // 👩‍🦱
  '\uD83D\uDC68\u200D\uD83E\uDDB1', // 👨‍🦱
  '\uD83D\uDC69\u200D\uD83E\uDDB0', // 👩‍🦰
  '\uD83D\uDC68\u200D\uD83E\uDDB0', // 👨‍🦰
  '\uD83E\uDDD5',       // 🧕
  '\uD83D\uDC64',       // 👤
  '\uD83E\uDD31',       // 🤱
  '\uD83D\uDC76',       // 👶
]

interface AvatarPickerProps {
  profileId: string
  currentEmoji: string
}

export default function AvatarPicker({ profileId, currentEmoji }: AvatarPickerProps) {
  const [selected, setSelected] = useState(currentEmoji)
  const [saving, setSaving] = useState(false)

  const handleSelect = async (emoji: string) => {
    setSelected(emoji)
    setSaving(true)
    try {
      const supabase = createClient()
      await supabase
        .from('profiles')
        .update({ avatar_emoji: emoji })
        .eq('id', profileId)
    } catch {
      // Revert on error
      setSelected(selected)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '10px',
        opacity: saving ? 0.7 : 1,
        transition: 'opacity 0.15s ease',
      }}
    >
      {AVATAR_OPTIONS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => handleSelect(emoji)}
          disabled={saving}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            border: selected === emoji ? '3px solid #3D8178' : '2px solid var(--color-border)',
            background: selected === emoji ? 'var(--color-primary-light)' : 'var(--color-white)',
            cursor: saving ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            transition: 'all 0.15s ease',
            padding: 0,
          }}
        >
          {emoji}
        </button>
      ))}
    </div>
  )
}

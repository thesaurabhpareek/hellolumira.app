/**
 * @module StoryComposerText
 * @description Text composer tab for story creation. Provides textarea with
 *   character counter and background colour palette swatches.
 * @version 1.0.0
 * @since March 2026
 */
'use client'

import { useState } from 'react'

const PALETTE = [
  'var(--story-palette-1)',
  'var(--story-palette-2)',
  'var(--story-palette-3)',
  'var(--story-palette-4)',
  'var(--story-palette-5)',
  'var(--story-palette-6)',
  'var(--story-palette-7)',
  'var(--story-palette-8)',
]

const MAX_CHARS = 280

interface StoryComposerTextProps {
  text: string
  bgColor: string
  onTextChange: (text: string) => void
  onBgColorChange: (color: string) => void
}

export default function StoryComposerText({
  text,
  bgColor,
  onTextChange,
  onBgColorChange,
}: StoryComposerTextProps) {
  const [focused, setFocused] = useState(false)
  const charCount = text.length
  const counterColor =
    charCount >= 270
      ? 'text-destructive'
      : charCount >= 240
      ? 'text-status-amber'
      : 'text-status-green'

  return (
    <div className="flex flex-col gap-4">
      {/* Live preview */}
      <div
        className="rounded-xl flex items-center justify-center p-6"
        style={{
          background: bgColor,
          minHeight: '160px',
          transition: 'background 0.2s ease',
        }}
      >
        <p
          className="text-white text-xl font-semibold text-center leading-[1.45]"
          style={{
            maxWidth: '260px',
            textShadow: '0 1px 8px rgba(0,0,0,0.3)',
            opacity: text ? 1 : 0.4,
          }}
        >
          {text || 'Start typing...'}
        </p>
      </div>

      {/* Text area */}
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value.slice(0, MAX_CHARS))}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="What's on your mind?"
          maxLength={MAX_CHARS}
          rows={3}
          className="w-full bg-background border rounded-lg px-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none resize-none transition-border-color"
          style={{
            fontSize: '16px',
            borderColor: focused ? 'var(--color-primary)' : 'var(--color-border)',
          }}
        />
        <span className={`absolute bottom-2 right-3 text-xs font-medium ${counterColor}`}>
          {charCount}/{MAX_CHARS}
        </span>
      </div>

      {/* Colour palette */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Background
        </p>
        <div className="flex gap-2 flex-wrap">
          {PALETTE.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onBgColorChange(color)}
              className="w-10 h-10 rounded-full border-2 transition-all duration-150 touch-manipulation shrink-0"
              style={{
                background: color,
                borderColor: bgColor === color ? 'white' : 'transparent',
                boxShadow:
                  bgColor === color
                    ? '0 0 0 2px var(--color-primary)'
                    : 'none',
              }}
              aria-label={`Select background colour`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

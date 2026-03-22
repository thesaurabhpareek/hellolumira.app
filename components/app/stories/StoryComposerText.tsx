/**
 * @module StoryComposerText
 * @description Text composer for story creation. In fullscreen mode, renders an
 *   immersive colored background with centered text input (Instagram-style).
 *   In compact mode, renders a preview card with textarea below.
 * @version 2.0.0
 * @since March 2026
 */
'use client'

import { useState, useRef, useEffect } from 'react'

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
  /** When true, renders the immersive full-screen text editor */
  fullscreen?: boolean
}

export default function StoryComposerText({
  text,
  bgColor,
  onTextChange,
  onBgColorChange,
  fullscreen = false,
}: StoryComposerTextProps) {
  const [focused, setFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const charCount = text.length
  const counterColor =
    charCount >= 270
      ? 'text-destructive'
      : charCount >= 240
      ? 'text-status-amber'
      : 'text-status-green'

  // Auto-focus in fullscreen mode
  useEffect(() => {
    if (fullscreen && textareaRef.current) {
      const timer = setTimeout(() => {
        textareaRef.current?.focus()
      }, 350) // wait for animation
      return () => clearTimeout(timer)
    }
  }, [fullscreen])

  if (fullscreen) {
    return (
      <div className="flex flex-col gap-4 h-full">
        {/* Immersive preview / editor */}
        <div
          className="rounded-2xl flex flex-col items-center justify-center relative overflow-hidden"
          style={{
            background: bgColor,
            minHeight: '280px',
            transition: 'background 0.3s ease',
          }}
        >
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => onTextChange(e.target.value.slice(0, MAX_CHARS))}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="What's on your mind?"
            maxLength={MAX_CHARS}
            rows={4}
            className="w-full bg-transparent text-white text-xl font-semibold text-center leading-[1.5] placeholder-white/50 outline-none resize-none px-8 py-6"
            style={{
              textShadow: '0 1px 8px rgba(0,0,0,0.25)',
              fontSize: '20px',
              caretColor: 'white',
              minHeight: '200px',
            }}
          />

          {/* Character count overlay */}
          <div className="absolute bottom-3 right-4">
            <span className="text-xs font-medium text-white/60">
              {charCount}/{MAX_CHARS}
            </span>
          </div>
        </div>

        {/* Colour palette */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
            Background
          </p>
          <div className="flex gap-2.5 flex-wrap">
            {PALETTE.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => onBgColorChange(color)}
                className="w-10 h-10 rounded-full border-2 transition-all duration-150 touch-manipulation shrink-0 active:scale-[0.92]"
                style={{
                  background: color,
                  borderColor: bgColor === color ? 'white' : 'transparent',
                  boxShadow:
                    bgColor === color
                      ? '0 0 0 2.5px var(--color-primary)'
                      : '0 1px 3px rgba(0,0,0,0.12)',
                }}
                aria-label="Select background colour"
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Compact mode (fallback, not used in new flow)
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
          ref={textareaRef}
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
              aria-label="Select background colour"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

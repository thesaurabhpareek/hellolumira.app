/**
 * @module StoryReactionBar
 * @description Footer emoji reaction strip for the story viewer. Expands inline
 *   to show emoji options. Sends reaction via POST on tap with haptic feedback.
 * @version 1.0.0
 * @since March 2026
 */
'use client'

import { useState, useCallback } from 'react'

const REACTION_EMOJIS = [
  { emoji: '\u2764\uFE0F', label: 'Love' },
  { emoji: '\uD83D\uDE0A', label: 'Happy' },
  { emoji: '\uD83D\uDE4C', label: 'Celebrate' },
  { emoji: '\uD83D\uDE2E', label: 'Surprised' },
  { emoji: '\uD83D\uDC99', label: 'Support' },
  { emoji: '\uD83C\uDF19', label: 'Night' },
]

interface StoryReactionBarProps {
  storyId: string
}

export default function StoryReactionBar({ storyId }: StoryReactionBarProps) {
  const [expanded, setExpanded] = useState(false)
  const [sentEmoji, setSentEmoji] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  const sendReaction = useCallback(
    async (emoji: string) => {
      if (sending) return
      setSending(true)
      setSentEmoji(emoji)
      setExpanded(false)

      // Haptic feedback
      try {
        navigator?.vibrate?.(15)
      } catch {
        // Not supported
      }

      try {
        await fetch(`/api/stories/${storyId}/react`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emoji }),
          credentials: 'same-origin',
        })
      } catch {
        // Silently fail
      } finally {
        setSending(false)
      }
    },
    [storyId, sending]
  )

  if (sentEmoji) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-2xl animate-story-reaction-bounce">{sentEmoji}</span>
        <span className="text-white/60 text-xs">Sent</span>
      </div>
    )
  }

  if (expanded) {
    return (
      <div className="flex items-center gap-1 animate-fade-in">
        {REACTION_EMOJIS.map((r) => (
          <button
            key={r.emoji}
            type="button"
            onClick={() => sendReaction(r.emoji)}
            disabled={sending}
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-white/10 active:scale-125 transition-transform duration-150 touch-manipulation"
            style={{ WebkitTapHighlightColor: 'transparent' }}
            aria-label={r.label}
          >
            <span className="text-2xl">{r.emoji}</span>
          </button>
        ))}
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setExpanded(true)}
      className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/10 text-white text-sm font-medium touch-manipulation"
      style={{ WebkitTapHighlightColor: 'transparent', minHeight: '44px' }}
    >
      <span>{'\u2764\uFE0F'}</span>
      <span>React</span>
    </button>
  )
}

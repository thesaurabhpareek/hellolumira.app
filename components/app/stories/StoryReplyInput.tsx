/**
 * @module StoryReplyInput
 * @description Reply input for the story viewer footer. Expands on focus
 *   with a send button. Keyboard-aware via scrollIntoView.
 * @version 1.0.0
 * @since March 2026
 */
'use client'

import { useState, useCallback, useRef } from 'react'

interface StoryReplyInputProps {
  storyId: string
}

export default function StoryReplyInput({ storyId }: StoryReplyInputProps) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = useCallback(async () => {
    if (!text.trim() || sending) return
    setSending(true)

    try {
      const res = await fetch(`/api/stories/${storyId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: text.trim() }),
        credentials: 'same-origin',
      })
      if (res.ok) {
        setText('')
        setSent(true)
        setTimeout(() => setSent(false), 2000)
      }
    } catch {
      // Silently fail
    } finally {
      setSending(false)
    }
  }, [storyId, text, sending])

  const handleFocus = () => {
    // Ensure input is visible above keyboard on mobile
    setTimeout(() => {
      inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 300)
  }

  if (sent) {
    return (
      <div className="flex items-center gap-2 text-white/60 text-sm animate-fade-in">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Reply sent
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="flex items-center flex-1 bg-white/10 rounded-full px-4 py-2">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 500))}
          placeholder="Reply..."
          maxLength={500}
          onFocus={handleFocus}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit()
          }}
          className="flex-1 bg-transparent text-white placeholder-white/40 text-[15px] outline-none border-none"
          style={{ fontSize: '16px' }}
        />
        {text.trim() && (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={sending}
            className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center touch-manipulation disabled:opacity-40"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

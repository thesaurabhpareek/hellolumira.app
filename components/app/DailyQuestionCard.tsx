/**
 * @module DailyQuestionCard
 * @description Home feed card with a daily rotating reflection question
 *   matched to the user's stage. Tapping "Reflect with Lumira" opens the
 *   chat with the question pre-filled.
 *
 *   The question rotates once per calendar day (see lib/home-feed-data.ts).
 *   This component is 'use client' because it navigates to the chat router
 *   with sessionStorage pre-fill, which requires browser APIs.
 *
 * @version 1.0.0
 * @since March 2026
 */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ThoughtIcon } from '@/components/icons'

interface Props {
  question: string
  chatPrompt: string
  babyId: string
}

export default function DailyQuestionCard({ question, chatPrompt, babyId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleReflect = async () => {
    if (loading) return
    setLoading(true)

    try {
      // Create a new chat thread, then pre-fill with the prompt
      const res = await fetch('/api/chat/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baby_id: babyId, source: 'direct' }),
      })
      if (!res.ok) throw new Error('Failed to create thread')
      const { thread_id } = await res.json()

      // Store the pre-fill so the chat page picks it up on mount
      sessionStorage.setItem(`chat_initial_${thread_id}`, chatPrompt)
      router.push(`/chat/${thread_id}`)
    } catch {
      // Fallback: open empty chat
      router.push('/chat')
    }
  }

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #F0FDF7 0%, #E6F4F1 100%)',
        border: '1px solid var(--color-primary-mid)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        marginBottom: '16px',
      }}
    >
      {/* Label */}
      <p
        style={{
          fontSize: '11px',
          fontWeight: 700,
          color: 'var(--color-primary)',
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
          marginBottom: '12px',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><ThoughtIcon size={14} color="var(--color-primary)" /> TODAY&apos;S REFLECTION</span>
      </p>

      {/* Question */}
      <p
        style={{
          fontSize: '17px',
          fontWeight: 600,
          color: 'var(--color-slate)',
          lineHeight: 1.45,
          marginBottom: '20px',
        }}
      >
        {question}
      </p>

      {/* CTA */}
      <button
        onClick={handleReflect}
        disabled={loading}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '10px 18px',
          background: loading ? 'var(--color-primary-mid)' : 'var(--color-primary)',
          color: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          border: 'none',
          fontSize: '14px',
          fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'opacity 0.15s ease',
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
        }}
        aria-label="Reflect on this question with Lumira"
      >
        {loading ? (
          <>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              style={{ animation: 'spin 0.8s linear infinite' }}
              aria-hidden="true"
            >
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            Opening chat…
          </>
        ) : (
          <>Reflect with Lumira →</>
        )}
      </button>

      <p
        style={{
          fontSize: '12px',
          color: 'var(--color-primary)',
          marginTop: '10px',
          opacity: 0.75,
        }}
      >
        A new question every day
      </p>
    </div>
  )
}

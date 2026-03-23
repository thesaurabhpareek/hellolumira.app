/**
 * @module DailyQuestionCard
 * @description Home feed card with a daily rotating reflection question.
 *   Tapping "Reflect with Lumira" opens the chat with the question pre-filled.
 * @version 1.1.0 — Migrated inline styles → Tailwind classes
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
      const res = await fetch('/api/chat/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baby_id: babyId, source: 'direct' }),
      })
      if (!res.ok) throw new Error('Failed to create thread')
      const { thread_id } = await res.json()
      sessionStorage.setItem(`chat_initial_${thread_id}`, chatPrompt)
      router.push(`/chat/${thread_id}`)
    } catch {
      router.push('/chat')
    }
  }

  return (
    <div className="bg-[var(--color-primary-light)] border border-[var(--color-primary-mid)] rounded-lg p-5 mb-4">
      {/* Label */}
      <p className="text-[11px] font-bold text-primary uppercase tracking-[0.8px] mb-3">
        <span className="inline-flex items-center gap-1">
          <ThoughtIcon size={14} color="var(--color-primary)" /> TODAY&apos;S REFLECTION
        </span>
      </p>

      {/* Question */}
      <p className="text-h3 text-foreground leading-[1.45] mb-5">{question}</p>

      {/* CTA */}
      <button
        onClick={handleReflect}
        disabled={loading}
        className="btn-press inline-flex items-center gap-1.5 px-[18px] py-2.5 bg-primary text-white rounded-md text-sm font-semibold cursor-pointer border-none transition-opacity disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation [-webkit-tap-highlight-color:transparent]"
        style={{ opacity: loading ? 0.7 : undefined }}
        aria-label="Reflect on this question with Lumira"
      >
        {loading ? (
          <>
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5"
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

      <p className="text-[12px] text-primary/75 mt-2.5">A new question every day</p>
    </div>
  )
}

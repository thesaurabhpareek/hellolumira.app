/**
 * @module StoryContentQuestion
 * @description Q&A story display. Shows a question prompt with an answer input.
 *   From the author's perspective, it shows submitted answers.
 * @version 1.0.0
 * @since March 2026
 */
'use client'

import { useState, useCallback } from 'react'

interface StoryContentQuestionProps {
  storyId: string
  questionPrompt: string
  isOwn: boolean
  /** Existing answers (shown to author only) */
  answers?: Array<{ answer_text: string; created_at: string }>
}

export default function StoryContentQuestion({
  storyId,
  questionPrompt,
  isOwn,
  answers = [],
}: StoryContentQuestionProps) {
  const [answerText, setAnswerText] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = useCallback(async () => {
    if (!answerText.trim() || submitting) return
    setSubmitting(true)

    try {
      const res = await fetch(`/api/stories/${storyId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer_text: answerText.trim() }),
        credentials: 'same-origin',
      })
      if (res.ok) {
        setSubmitted(true)
        setAnswerText('')
      }
    } catch {
      // Silently fail
    } finally {
      setSubmitting(false)
    }
  }, [storyId, answerText, submitting])

  return (
    <div className="flex-1 flex flex-col items-center justify-between px-6 py-8">
      {/* Question prompt */}
      <div className="flex-1 flex items-center">
        <p
          className="text-white text-xl font-semibold text-center leading-[1.4]"
          style={{ textShadow: '0 1px 8px rgba(0,0,0,0.3)' }}
        >
          {questionPrompt}
        </p>
      </div>

      {/* Author view: answers list */}
      {isOwn && answers.length > 0 && (
        <div className="w-full max-w-[320px] mb-4 max-h-[200px] overflow-y-auto no-scrollbar">
          <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">
            {answers.length} {answers.length === 1 ? 'answer' : 'answers'}
          </p>
          <div className="flex flex-col gap-2">
            {answers.map((a, i) => (
              <div
                key={i}
                className="bg-white/10 rounded-lg px-3 py-2"
              >
                <p className="text-white text-sm leading-[1.5]">{a.answer_text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Viewer: answer input */}
      {!isOwn && !submitted && (
        <div className="w-full max-w-[320px]">
          <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2">
            <input
              type="text"
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value.slice(0, 200))}
              placeholder="Type your answer..."
              maxLength={200}
              className="flex-1 bg-transparent text-white placeholder-white/40 text-[15px] outline-none border-none"
              style={{ fontSize: '16px' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit()
              }}
            />
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!answerText.trim() || submitting}
              className="shrink-0 w-9 h-9 rounded-full bg-white/20 flex items-center justify-center touch-manipulation disabled:opacity-40"
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
          </div>
        </div>
      )}

      {/* Submitted confirmation */}
      {!isOwn && submitted && (
        <div className="w-full max-w-[320px] text-center">
          <p className="text-white/80 text-sm font-medium">Answer sent!</p>
        </div>
      )}
    </div>
  )
}

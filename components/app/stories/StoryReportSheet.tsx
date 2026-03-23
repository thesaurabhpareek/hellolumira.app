/**
 * @module StoryReportSheet
 * @description Bottom sheet for reporting a story. Provides reason picker
 *   (radio buttons) and optional detail textarea. Submits to POST /api/stories/[id]/report.
 * @version 1.0.0
 * @since March 2026
 */
'use client'

import { useState, useCallback } from 'react'

type ReportReason = 'inappropriate' | 'harmful' | 'spam' | 'other'

const REASONS: { value: ReportReason; label: string }[] = [
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'harmful', label: 'Harmful or dangerous' },
  { value: 'spam', label: 'Spam' },
  { value: 'other', label: 'Other' },
]

interface StoryReportSheetProps {
  storyId: string
  onClose: () => void
}

export default function StoryReportSheet({
  storyId,
  onClose,
}: StoryReportSheetProps) {
  const [reason, setReason] = useState<ReportReason | null>(null)
  const [detail, setDetail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = useCallback(async () => {
    if (!reason || submitting) return
    setSubmitting(true)

    try {
      await fetch(`/api/stories/${storyId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason,
          detail: detail.trim() || null,
        }),
        credentials: 'same-origin',
      })
      setSubmitted(true)
      setTimeout(onClose, 1500)
    } catch {
      // Silently fail
    } finally {
      setSubmitting(false)
    }
  }, [storyId, reason, detail, submitting, onClose])

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Sheet */}
      <div
        className="relative w-full bg-[var(--color-white)] rounded-t-2xl animate-story-sheet-up safe-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {submitted ? (
          <div className="px-5 py-8 text-center">
            <p className="text-foreground font-semibold text-[17px] mb-2">Report submitted</p>
            <p className="text-muted-foreground text-sm">
              Thank you. We will review this story.
            </p>
          </div>
        ) : (
          <div className="px-5 pb-6">
            <p className="font-semibold text-foreground text-[17px] mb-4">
              Report this story
            </p>

            {/* Reason picker */}
            <div className="flex flex-col gap-2 mb-4">
              {REASONS.map((r) => (
                <label
                  key={r.value}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors"
                  style={{
                    background:
                      reason === r.value
                        ? 'var(--color-primary-light)'
                        : 'var(--color-surface)',
                    border:
                      reason === r.value
                        ? '1.5px solid var(--color-primary)'
                        : '1.5px solid var(--color-border)',
                    minHeight: '48px',
                  }}
                >
                  <input
                    type="radio"
                    name="report-reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={() => setReason(r.value)}
                    className="accent-primary w-4 h-4"
                  />
                  <span className="text-sm font-medium text-foreground">
                    {r.label}
                  </span>
                </label>
              ))}
            </div>

            {/* Detail textarea */}
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value.slice(0, 500))}
              placeholder="Additional details (optional)"
              maxLength={500}
              rows={3}
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none resize-none"
              style={{ fontSize: '16px' }}
            />

            {/* Submit */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!reason || submitting}
              className="btn-primary mt-4"
            >
              {submitting ? 'Submitting...' : 'Submit report'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

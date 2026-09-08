/**
 * @module components/app/letters/FollowUpQuestionCard
 * @description Presents one nightly follow-up question after the parent's
 *   monologue (PRD §14.2, §14.3; design spec §8.3). Presentational only —
 *   all selection, sequencing, and capture logic lives in FE10's
 *   `hooks/useLettersSession.ts`. This component renders what it is given
 *   and reports intent through callback props; it owns no session state
 *   and makes no network calls.
 *
 *   Design decisions honoured here (docs/Lumira-Letters-PRD.md §14.2, §14.3,
 *   §15.4 and docs/LETTERS-ENGINEERING-CONTRACT.md §5, FE3 brief):
 *
 *   - The question is TEXT, answered by VOICE or TYPING — never a chat
 *     bubble exchange. No "Lumira:" label, no avatar; it reads as a quiet
 *     caption, not a message.
 *   - One question at a time, fading in gently. The hook controls *when*
 *     this mounts (~2s after the previous answer settles); this component's
 *     job is only the calm entrance itself, not that scheduling delay.
 *   - Skip is a swipe-left gesture or a subdued text link — never an "X".
 *     An "X" reads as cancelling the whole night, not skipping one question.
 *   - Progress is decorative dots only, never a "Question X of Y" counter
 *     rendered visibly — the hard cap of two is enforced upstream in
 *     lib/letters/followups.ts. Skipping must never feel like failure.
 *   - Voice and typed answers are co-equal affordances (design spec §8.3):
 *     identical size and visual weight, not a primary path and its fallback.
 *   - Never gates completion — Skip stays reachable in every state.
 *
 *   All copy is sourced from lib/letters/prompts/followup-templates.ts and
 *   lib/letters/prompts/microcopy.ts. See this lane's final report for the
 *   handful of functional (non-editorial) labels with no existing source
 *   string, and the REQUEST raised for them.
 */
'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { FOLLOWUP_SKIP_LABEL } from '@/lib/letters/prompts/followup-templates'
import {
  LISTENING_COPY,
  MODALITY_CHOICE_COPY,
  TRANSCRIPT_REVIEW_COPY,
  TYPED_ENTRY_COPY,
} from '@/lib/letters/prompts/microcopy'

export interface FollowUpQuestionCardProps {
  /** Finished question text (already phrased — this component never selects or fills templates). */
  question: string
  /** Zero-based position of this question within tonight's slots. */
  index: number
  /** Total follow-up slots tonight. Hard product cap is 2 (lib/letters/followups.ts). */
  total: number
  /** Skip this one question. Must always remain reachable — never gated. */
  onSkip: () => void
  /** Parent wants to answer by speaking. Capture itself happens outside this component. */
  onAnswerVoice: () => void
  /** Parent submitted a typed answer. */
  onAnswerText: (answer: string) => void
  /** True while a spoken answer is actively being captured for this slot. */
  isListening: boolean
}

/** Entrance fade duration, ms. The ~2s pre-mount delay is the hook's job — see module doc. */
const FADE_IN_MS = 2000
/** Spring-back duration, ms, for a swipe that did not cross the skip threshold. */
const SPRING_BACK_MS = 220
/** Leftward drag distance, px, that counts as "swipe to skip". */
const SWIPE_DISMISS_PX = 96
const DRAG_LEFT_CLAMP = -180
const DRAG_RIGHT_CLAMP = 14

function MicIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth={1.75} />
      <path
        d="M5.5 11.5v.75a6.5 6.5 0 0013 0v-.75M12 19v2.25"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
      />
    </svg>
  )
}

function TypeIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="6" width="18" height="12" rx="2.5" stroke="currentColor" strokeWidth={1.75} />
      <path
        d="M7 10h.01M11 10h.01M15 10h.01M9 14h6"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
      />
    </svg>
  )
}

/**
 * Outer shell: persists across question changes so the sr-only live region
 * below is a stable node whose text content updates in place (matching
 * ComposingState.tsx's pattern) — the reliable way to get VoiceOver to
 * announce each new question, rather than a node that is destroyed and
 * recreated on every question.
 */
export default function FollowUpQuestionCard(props: FollowUpQuestionCardProps) {
  const { question, index, total } = props
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(query.matches)
    const handleChange = () => setPrefersReducedMotion(query.matches)
    query.addEventListener('change', handleChange)
    return () => query.removeEventListener('change', handleChange)
  }, [])

  return (
    <div>
      {/* Announces the question to VoiceOver as it appears (design spec §8.3).
          Visually hidden — the readable caption lives in the body below,
          marked aria-hidden so the two are never announced twice. */}
      <p role="status" aria-live="polite" className="sr-only">
        {`Follow-up question ${index + 1} of ${total}. ${question}`}
      </p>

      <FollowUpQuestionCardBody
        key={`${index}-${question}`}
        {...props}
        prefersReducedMotion={prefersReducedMotion}
      />
    </div>
  )
}

interface BodyProps extends FollowUpQuestionCardProps {
  prefersReducedMotion: boolean
}

/**
 * Remounts on every new question (via the `key` above) so its local UI
 * state — the fade-in, any half-typed draft, any in-progress swipe —
 * always starts clean for the new question rather than carrying over.
 */
function FollowUpQuestionCardBody({
  question,
  index,
  total,
  onSkip,
  onAnswerVoice,
  onAnswerText,
  isListening,
  prefersReducedMotion,
}: BodyProps) {
  const [mounted, setMounted] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [draft, setDraft] = useState('')
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartXRef = useRef<number | null>(null)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  const handleSubmitTyped = () => {
    const trimmed = draft.trim()
    if (!trimmed) return
    onAnswerText(trimmed)
    setDraft('')
    setIsTyping(false)
  }

  const endDrag = (swipedToSkip: boolean) => {
    dragStartXRef.current = null
    setIsDragging(false)
    setDragX(0)
    if (swipedToSkip) onSkip()
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (isTyping) return
    dragStartXRef.current = event.clientX
    setIsDragging(true)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartXRef.current === null) return
    const delta = event.clientX - dragStartXRef.current
    setDragX(Math.min(DRAG_RIGHT_CLAMP, Math.max(DRAG_LEFT_CLAMP, delta)))
  }

  const handlePointerUp = () => {
    if (dragStartXRef.current === null) return
    endDrag(dragX < -SWIPE_DISMISS_PX)
  }

  const handlePointerCancel = () => {
    if (dragStartXRef.current === null) return
    endDrag(false)
  }

  const fadeMs = prefersReducedMotion ? 0 : FADE_IN_MS
  const springMs = prefersReducedMotion ? 0 : SPRING_BACK_MS

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerLeave={isDragging ? handlePointerCancel : undefined}
      className="mx-auto w-full max-w-[420px] touch-pan-y select-none"
      style={{
        opacity: mounted ? 1 : 0,
        transform: `translateX(${dragX}px)`,
        transition: isDragging
          ? 'transform 0ms linear'
          : `opacity ${fadeMs}ms var(--ease-default), transform ${springMs}ms var(--ease-default)`,
      }}
    >
      {/* Progress: decorative dots only, never a visible counter — PRD §14.3
          "never make skipping feel like failure". */}
      {total > 1 && (
        <div className="mb-3 flex justify-center gap-1.5" aria-hidden="true">
          {Array.from({ length: total }, (_, dotIndex) => (
            <span
              key={dotIndex}
              className="h-1 w-1 rounded-full"
              style={{
                background:
                  dotIndex === index ? 'var(--color-primary)' : 'var(--color-primary-mid)',
                opacity: dotIndex === index ? 1 : 0.5,
              }}
            />
          ))}
        </div>
      )}

      {/* The question: a quiet caption, not a chat bubble. Duplicated for
          VoiceOver in the sr-only status region owned by the parent above. */}
      <p aria-hidden="true" className="px-2 text-center text-[17px] italic leading-[1.6] text-foreground/80">
        {question}
      </p>

      {isListening ? (
        <p className="mt-6 text-center text-[13px] italic text-muted-foreground">
          {LISTENING_COPY.activeCaption}
        </p>
      ) : !isTyping ? (
        // Voice and typed answers are co-equal — identical size and weight (design spec §8.3).
        <div className="mt-6 flex items-stretch justify-center gap-3">
          <button
            type="button"
            onClick={onAnswerVoice}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-border bg-background text-[15px] font-medium text-foreground transition-colors hover:border-[var(--color-primary-mid)] hover:bg-[var(--color-primary-light)]"
          >
            <MicIcon />
            {MODALITY_CHOICE_COPY.speakActionLabel}
          </button>
          <button
            type="button"
            onClick={() => setIsTyping(true)}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-border bg-background text-[15px] font-medium text-foreground transition-colors hover:border-[var(--color-primary-mid)] hover:bg-[var(--color-primary-light)]"
          >
            <TypeIcon />
            {TYPED_ENTRY_COPY.typedAnswerLabel}
          </button>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-2.5">
          <Textarea
            autoFocus
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                handleSubmitTyped()
              }
            }}
            aria-label={TYPED_ENTRY_COPY.typedAnswerLabel}
            className="min-h-16 text-[15px]"
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsTyping(false)
                setDraft('')
              }}
            >
              {TRANSCRIPT_REVIEW_COPY.discardLabel}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleSubmitTyped}
              disabled={!draft.trim()}
            >
              {TRANSCRIPT_REVIEW_COPY.saveLabel}
            </Button>
          </div>
        </div>
      )}

      {/* Skip: subdued text link, never an "X" — an "X" reads as cancelling the night. */}
      <div className="mt-5 flex justify-center">
        <button
          type="button"
          onClick={onSkip}
          aria-label="Skip this question"
          className="px-2 py-1 text-[13px] text-muted-foreground/70 underline-offset-4 transition-colors hover:text-muted-foreground hover:underline"
        >
          {FOLLOWUP_SKIP_LABEL}
        </button>
      </div>
    </div>
  )
}

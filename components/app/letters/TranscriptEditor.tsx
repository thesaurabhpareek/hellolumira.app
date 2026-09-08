/**
 * @module TranscriptEditor
 * @description The parent's raw words, editable before tonight's log is saved
 *   (Letters model change: capture -> LOG, letter is a later, optional choice —
 *   see docs/LETTERS-MODEL-CHANGE.md). Presentational only: all state here is
 *   local input state or debounce timers, all persistence and business logic
 *   live in the owning hook.
 *
 *   Two things this component is responsible for getting right:
 *     1. Entry-loss prevention (PRD §15.5, P0). Every keystroke is reported
 *        upward via `onDraftChange`, debounced, and flushed on blur and on
 *        unmount so a mistap or a killed tab never drops the last few words.
 *     2. Name correction (PRD §17.2-17.3). Names arrive pre-corrected. When a
 *        parent's manual edit looks like a name fix (detected with the pure,
 *        deterministic `learnCorrection` from lib/letters/names.ts — never an
 *        LLM), a quiet, non-modal, opt-in affordance offers to remember it.
 *        `onLearnName` is only ever called after the parent taps to confirm.
 *
 *   No red-line diff markup: an edit simply becomes the final text.
 *
 * @see docs/LETTERS-ENGINEERING-CONTRACT.md
 * @see docs/Lumira-Letters-PRD.md §15.5, §17.2, §17.3
 * @see docs/Lumira-Design-System-iOS.md §7.4 (keyboard), §8.2 (VoiceOver), §8.6 (undo over confirm)
 * @since Letters FE2
 */
'use client'

import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react'
import type { NameCorrection } from '@/types/letters'
import { learnCorrection } from '@/lib/letters/names'
import { TRANSCRIPT_REVIEW_COPY, DELETE_UNDO_TOAST } from '@/lib/letters/prompts/microcopy'

/** Debounce window for `onDraftChange`. Short enough that a mistap right
 *  after typing still has a persisted draft; always flushed on blur/unmount
 *  regardless, so this number is a UX nicety, not the safety guarantee. */
const DRAFT_DEBOUNCE_MS = 250

interface TranscriptEditorProps {
  /** Current transcript text. This component treats it as the source of
   *  truth on mount and whenever it changes from outside (a fresh transcript
   *  loading in); local keystrokes are reported up via `onChange`. */
  transcript: string
  /** Fires on every keystroke, immediately — keeps the parent's live value
   *  (e.g. for the Save action) in sync. Not debounced. */
  onChange: (value: string) => void
  /** Fires on every keystroke, debounced, so the owning hook can persist the
   *  draft locally before any network call (PRD §15.5). Always flushed on
   *  blur and on unmount. Never called from a fetch or a timer that could
   *  silently drop the last edit. */
  onDraftChange: (value: string) => void
  /** Names already known for this family (child, partner, siblings, pets,
   *  caregivers) — the universe `learnCorrection` is allowed to match against. */
  knownNames: string[]
  /** Called only when the parent explicitly confirms a detected name fix.
   *  This component never calls the API itself. */
  onLearnName: (correction: NameCorrection) => void
  onSave: () => void
  onDiscard: () => void
  disabled?: boolean
}

/** Case-insensitive dedupe key for a heard/correct pair. */
function correctionKey(c: NameCorrection): string {
  return `${c.heard.toLowerCase()}=>${c.correct.toLowerCase()}`
}

export default function TranscriptEditor({
  transcript,
  onChange,
  onDraftChange,
  knownNames,
  onLearnName,
  onSave,
  onDiscard,
  disabled = false,
}: TranscriptEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const discardTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Latest keystroke value, read by the blur/unmount flush and by the
  // name-fix diff — kept in a ref so those don't need to be re-created (and
  // re-debounced) on every render.
  const latestValueRef = useRef(transcript)
  // The transcript text as of the last time we checked it for a name fix.
  const baselineRef = useRef(transcript)
  // heard=>correct pairs already offered this session, so a dismissed or
  // confirmed suggestion never resurfaces for the same pair.
  const seenPairsRef = useRef<Set<string>>(new Set())

  const [pendingCorrection, setPendingCorrection] = useState<NameCorrection | null>(null)
  const [discardPending, setDiscardPending] = useState(false)

  // A fresh transcript loading in from outside resets the diff baseline.
  // An in-progress local edit owns the baseline itself (see handleBlur).
  useEffect(() => {
    latestValueRef.current = transcript
    baselineRef.current = transcript
  }, [transcript])

  // Design spec §8.2, rule 1: move focus to the transcript field the moment
  // the review step appears, or the parent is stranded on a now-dead mic
  // button. Runs once, on mount.
  useEffect(() => {
    if (!disabled) textareaRef.current?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Entry-loss prevention is P0 (PRD §15.5): a debounce timer must never be
  // the reason a keystroke is lost. Flush it on unmount.
  useEffect(() => {
    return () => {
      if (draftTimerRef.current) {
        clearTimeout(draftTimerRef.current)
        onDraftChange(latestValueRef.current)
      }
      if (discardTimerRef.current) clearTimeout(discardTimerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Design spec §7.4 (web note): keep the caret line above the on-screen
  // keyboard. The action bar is `position: sticky` (below, in normal flow)
  // so it can never overlap the text; this nudges the focused textarea back
  // into view when the visual viewport shrinks (keyboard opening/resizing).
  useEffect(() => {
    const vv = typeof window !== 'undefined' ? window.visualViewport : null
    if (!vv) return
    const handleViewportChange = () => {
      if (document.activeElement === textareaRef.current) {
        textareaRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' })
      }
    }
    vv.addEventListener('resize', handleViewportChange)
    return () => vv.removeEventListener('resize', handleViewportChange)
  }, [])

  const flushDraft = useCallback(
    (value: string) => {
      if (draftTimerRef.current) {
        clearTimeout(draftTimerRef.current)
        draftTimerRef.current = null
      }
      onDraftChange(value)
    },
    [onDraftChange]
  )

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    latestValueRef.current = value
    onChange(value)

    if (draftTimerRef.current) clearTimeout(draftTimerRef.current)
    draftTimerRef.current = setTimeout(() => {
      draftTimerRef.current = null
      onDraftChange(value)
    }, DRAFT_DEBOUNCE_MS)
  }

  const handleBlur = () => {
    flushDraft(latestValueRef.current)

    const before = baselineRef.current
    const after = latestValueRef.current
    baselineRef.current = after
    if (before === after || knownNames.length === 0 || disabled) return

    const correction = learnCorrection(before, after, knownNames)
    if (!correction) return
    if (seenPairsRef.current.has(correctionKey(correction))) return

    setPendingCorrection(correction)
  }

  const handleConfirmLearn = () => {
    if (!pendingCorrection) return
    seenPairsRef.current.add(correctionKey(pendingCorrection))
    onLearnName(pendingCorrection)
    setPendingCorrection(null)
  }

  const handleDismissLearn = () => {
    if (pendingCorrection) seenPairsRef.current.add(correctionKey(pendingCorrection))
    setPendingCorrection(null)
  }

  // Undo-over-confirm (design spec §8.6), never a confirm dialog. Tapping
  // Discard does not call `onDiscard` yet — it starts a visible, cancellable
  // countdown. The transcript itself is never touched, so there is nothing
  // to lose or restore; Undo just cancels the pending discard.
  const handleDiscardClick = () => {
    setDiscardPending(true)
    if (discardTimerRef.current) clearTimeout(discardTimerRef.current)
    discardTimerRef.current = setTimeout(() => {
      discardTimerRef.current = null
      onDiscard()
    }, DELETE_UNDO_TOAST.durationSeconds * 1000)
  }

  const handleUndoDiscard = () => {
    if (discardTimerRef.current) {
      clearTimeout(discardTimerRef.current)
      discardTimerRef.current = null
    }
    setDiscardPending(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-h3 text-foreground leading-[1.4]">
          {TRANSCRIPT_REVIEW_COPY.heading}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {TRANSCRIPT_REVIEW_COPY.subheading}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <textarea
          ref={textareaRef}
          value={transcript}
          onChange={handleTextChange}
          onBlur={handleBlur}
          disabled={disabled}
          aria-label="Tonight's entry, editable"
          aria-describedby="transcript-editor-hint"
          rows={10}
          className="w-full bg-background border rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground outline-none resize-none leading-[1.7] disabled:opacity-60"
          style={{ borderColor: 'var(--color-border)' }}
        />
        <p id="transcript-editor-hint" className="text-xs text-muted-foreground">
          {TRANSCRIPT_REVIEW_COPY.editHint}
        </p>
      </div>

      {pendingCorrection && (
        <div
          role="status"
          className="chip flex items-center justify-between gap-3 w-full"
          style={{ borderColor: 'var(--color-primary-mid)', background: 'var(--color-primary-light)' }}
        >
          <button
            type="button"
            onClick={handleConfirmLearn}
            className="text-left text-sm flex-1"
            style={{ color: 'var(--color-primary)' }}
          >
            {TRANSCRIPT_REVIEW_COPY.nameCorrectionHint}
          </button>
          <button
            type="button"
            onClick={handleDismissLearn}
            aria-label="Dismiss"
            className="shrink-0 w-11 h-11 flex items-center justify-center text-muted-foreground"
          >
            ✕
          </button>
        </div>
      )}

      <div className="sticky bottom-0 bg-background pt-2 pb-[env(safe-area-inset-bottom)]">
        {discardPending ? (
          <div
            role="status"
            aria-live="polite"
            className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <span className="text-sm text-muted-foreground">
              {TRANSCRIPT_REVIEW_COPY.discardA11yHint}
            </span>
            <button type="button" onClick={handleUndoDiscard} className="btn-ghost shrink-0 h-11 px-4">
              {DELETE_UNDO_TOAST.actionLabel}
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleDiscardClick}
              disabled={disabled}
              aria-describedby="transcript-editor-discard-hint"
              className="btn-ghost flex-1"
            >
              {TRANSCRIPT_REVIEW_COPY.discardLabel}
            </button>
            <span id="transcript-editor-discard-hint" className="sr-only">
              {TRANSCRIPT_REVIEW_COPY.discardA11yHint}
            </span>
            <button
              type="button"
              onClick={onSave}
              disabled={disabled}
              className="btn-primary flex-1"
            >
              {TRANSCRIPT_REVIEW_COPY.saveLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

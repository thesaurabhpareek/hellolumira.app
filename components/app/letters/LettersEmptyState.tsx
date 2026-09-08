/**
 * @module LettersEmptyState
 * @description Night one — the first time a parent opens the Journal tab with
 *   nothing in it yet, per PRD §15.6 and lib/letters/prompts/microcopy.ts §1.
 *   Rejects the old "Your journal is waiting" pattern: this addresses the
 *   reader, not the feature, in reading-view typography, and the tap target
 *   previews the actual listening interaction (a breathing aura) rather than
 *   describing it with a generic CTA button. No stats, no onboarding chrome,
 *   no skip. Presentational only — no fetching, no business logic. Lane FE5.
 * @version 1.0.0
 */
'use client'

import { useId } from 'react'
import {
  buildEmptyStateNightOneCopy,
  EMPTY_STATE_NIGHT_ONE_A11Y_LABEL,
  EMPTY_STATE_NIGHT_ONE_A11Y_HINT,
} from '@/lib/letters/prompts/microcopy'

interface LettersEmptyStateProps {
  onStart: () => void
  /** Null when the parent has not named the baby in-app yet. Handled by
   *  buildEmptyStateNightOneCopy, which falls back to the no-name variant. */
  babyName: string | null
}

export default function LettersEmptyState({ onStart, babyName }: LettersEmptyStateProps) {
  const hintId = useId()
  // Stable within a day, so a parent who reopens an empty timeline sees the
  // same line rather than a new one on every visit (microcopy.ts's own
  // seeding guidance — day-of-month is its own suggested example).
  const seed = new Date().getDate()
  const copy = buildEmptyStateNightOneCopy(seed, babyName)

  return (
    <div className="flex flex-col items-center justify-center gap-10 px-8 py-20 text-center">
      <p className="max-w-[360px] font-serif text-[19px] leading-[1.75] text-foreground/90">
        {copy}
      </p>

      <button
        type="button"
        onClick={onStart}
        aria-label={EMPTY_STATE_NIGHT_ONE_A11Y_LABEL}
        aria-describedby={hintId}
        className="relative flex h-[120px] w-[120px] items-center justify-center rounded-full"
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-[radial-gradient(circle,var(--color-primary)_0%,transparent_70%)] opacity-70 blur-xl motion-safe:[animation:lumira-aura-breathe_4000ms_ease-in-out_infinite]"
        />
        <span
          aria-hidden="true"
          className="relative h-[56px] w-[56px] rounded-full bg-[var(--color-primary)] opacity-90 motion-safe:[animation:lumira-aura-breathe_4000ms_ease-in-out_infinite]"
        />
      </button>
      <span id={hintId} className="sr-only">
        {EMPTY_STATE_NIGHT_ONE_A11Y_HINT}
      </span>

      <style>{`
        @keyframes lumira-aura-breathe {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.35); opacity: 0.9; }
        }
      `}</style>
    </div>
  )
}

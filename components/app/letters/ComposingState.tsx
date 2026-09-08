/**
 * @module ComposingState
 * @description The wait between "done talking" and "here is the entry" — for
 *   both a log (usually fast, low ceremony) and a letter (slower, composed
 *   from many logs). Never a spinner: a slow single-breath pulse that reads
 *   as a continuation of the listening aura, not a system-busy indicator.
 *   The failure phase is the important one — it must actively reassure the
 *   parent that their words are safe, never merely state it once and move on.
 * @version 1.0.0
 * @since March 2026
 *
 * Lane: FE4. Owns this file only (docs/LETTERS-ENGINEERING-CONTRACT.md §5).
 * Presentational only — no fetching, no Supabase, no timers driving state.
 * `phase` is supplied by the owning hook, which owns all wall-clock timing
 * (docs/Lumira-Letters-PRD.md §14.2, §15.5). This component only animates.
 *
 * Copy source: lib/letters/prompts/microcopy.ts (COMPOSING_COPY,
 * COMPOSE_FAILURE_COPY) — never hardcoded here, per the engineering contract.
 *
 * Phase → copy mapping (COMPOSING_COPY has four checkpoints — initial, ~8s,
 * ~12s, and the 20s hard timeout — but this component's contract only
 * exposes three non-failed phases). `slow` uses the ~8s line and `timeout`
 * uses the 20s hard-timeout line, matching each phase's name; the ~12s
 * "Almost there." checkpoint has no phase slot in the current contract and is
 * intentionally unused here rather than picked via a local wall-clock timer,
 * which would duplicate timing logic the hook already owns.
 */
'use client'

import { PremiumButton } from '@/components/ui/premium-button'
import { COMPOSING_COPY, COMPOSE_FAILURE_COPY } from '@/lib/letters/prompts/microcopy'

export type ComposingStatePhase = 'composing' | 'slow' | 'timeout' | 'failed'

interface Props {
  phase: ComposingStatePhase
  transcript: string
  onRetry: () => void
  onSaveRaw: () => void
}

/** Static, source-of-truth mapping — no derived timing, no rotation. */
const NON_FAILED_CAPTION: Record<Exclude<ComposingStatePhase, 'failed'>, string | null> = {
  composing: COMPOSING_COPY.initial,
  slow: COMPOSING_COPY.at8Seconds,
  timeout: COMPOSING_COPY.at20SecondsTimeout,
}

export default function ComposingState({ phase, transcript, onRetry, onSaveRaw }: Props) {
  const isFailed = phase === 'failed'
  const caption = isFailed ? null : NON_FAILED_CAPTION[phase]
  const hasTranscript = transcript.trim().length > 0

  return (
    <div className="flex flex-col items-center gap-6 px-6 py-10">
      {!isFailed && (
        <>
          <div
            role="presentation"
            aria-hidden="true"
            className="letters-composing-orb relative flex h-36 w-36 shrink-0 items-center justify-center rounded-full border"
            style={{
              borderColor: 'var(--color-primary-mid)',
              background:
                'radial-gradient(circle, var(--color-primary-light) 0%, transparent 72%)',
            }}
          >
            <div
              className="h-20 w-20 rounded-full"
              style={{ background: 'var(--color-primary-light)', opacity: 0.7 }}
            />
          </div>

          {/* Visible caption — mirrors the announced state below without duplicating
              the announcement (the live region is visually hidden). */}
          <p
            aria-hidden="true"
            className="min-h-[1.5em] text-center text-[15px] font-medium text-muted-foreground"
          >
            {caption ?? ' '}
          </p>

          {/* Announces phase changes politely. Renders once per `phase` prop change
              (this component runs no timers of its own), so VoiceOver hears each
              checkpoint once, never a tick-by-tick stream. */}
          <p role="status" aria-live="polite" className="sr-only">
            {caption ?? ''}
          </p>
        </>
      )}

      {isFailed && (
        <div
          className="w-full max-w-md rounded-2xl border bg-[var(--surface-primary)] px-6 py-6"
          style={{ borderColor: 'var(--color-primary-mid)' }}
        >
          {/* Assertive: this is the highest-stakes string in the app. A polite
              region can be missed under VoiceOver if the user has moved focus;
              this must not be. */}
          <div role="alert" aria-live="assertive">
            <h2 className="text-[17px] font-semibold leading-snug text-foreground">
              {COMPOSE_FAILURE_COPY.heading}
            </h2>
            <p className="mt-2 text-[15px] leading-[1.6] text-muted-foreground">
              {COMPOSE_FAILURE_COPY.body}
            </p>
          </div>

          {hasTranscript && (
            <blockquote
              className="mt-4 max-h-40 overflow-y-auto whitespace-pre-wrap rounded-lg px-4 py-3 text-[14px] italic leading-[1.6] text-foreground"
              style={{ background: 'var(--surface-sunken)' }}
            >
              {transcript}
            </blockquote>
          )}

          <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
            <PremiumButton
              type="button"
              variant="primary"
              fullWidth
              onClick={onRetry}
            >
              {COMPOSE_FAILURE_COPY.tryAgainLabel}
            </PremiumButton>
            <PremiumButton
              type="button"
              variant="secondary"
              fullWidth
              onClick={onSaveRaw}
            >
              {COMPOSE_FAILURE_COPY.saveAsIsLabel}
            </PremiumButton>
          </div>
        </div>
      )}

      <style>{`
        @keyframes lettersComposingPulse {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50% { transform: scale(1.02); opacity: 1; }
        }
        .letters-composing-orb {
          animation: lettersComposingPulse 1.4s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          /* Survives Reduce Motion — it conveys system state, not decoration
             (design spec §6.5) — but strips the scale and keeps opacity only. */
          @keyframes lettersComposingPulse {
            0%, 100% { transform: none; opacity: 0.85; }
            50% { transform: none; opacity: 1; }
          }
        }
      `}</style>
    </div>
  )
}

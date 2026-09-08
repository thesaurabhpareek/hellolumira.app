/**
 * @module ListeningAura
 * @description The signature listening surface for the Letters nightly flow.
 *   Deliberately not a waveform — a waveform reads as "this device is
 *   recording you" (surveillance grammar), and it needs legible chrome that
 *   fights a dark bedroom. Instead: one soft radial glow (Sage core, fading
 *   to transparent) whose size tracks the parent's voice.
 *
 *   Presentational only. This component owns no audio capture and no
 *   business logic — it renders whatever amplitude and state the capture
 *   hook (`useVoiceCapture`, lane FE10) gives it, per the engineering
 *   contract §2 ("no business logic in components, no hidden I/O"). The
 *   silence-driven idle-breathing loop and caption timing below are pure
 *   rendering concerns derived from props, not domain logic.
 *
 *   References:
 *   - docs/Lumira-Letters-PRD.md §15.1 (reject the waveform), §15.2
 *     (eyes-free contract)
 *   - docs/Lumira-Design-System-iOS.md §6.4 (motion spec), §6.5 (reduced
 *     motion), §8.2 (VoiceOver), §9 (component prop shape)
 *   - lib/letters/prompts/microcopy.ts (all copy; owned by CT5 — never
 *     hardcode strings here)
 *
 *   Owner: FE1. Lane: frontend. Do not edit outside this file — see
 *   docs/LETTERS-ENGINEERING-CONTRACT.md §5.
 * @version 1.0.0
 * @since September 2026
 */
'use client'

import type React from 'react'
import { useEffect, useId, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { LISTENING_COPY, VOICEOVER_COPY } from '@/lib/letters/prompts/microcopy'

export type ListeningAuraState = 'idle' | 'listening' | 'processing'

interface ListeningAuraProps {
  /** Latest amplitude tick from the capture hook, ~12Hz, roughly 0-1 RMS. */
  amplitude: number
  state: ListeningAuraState
  /**
   * Fires when the parent taps the aura. The hook (FE10) is the state
   * authority — this component only signals "the surface was tapped" while
   * a session is armed or recording ('idle' or 'listening'). It is inert
   * during 'processing', when there is nothing left to stop.
   */
  onStop: () => void
  /**
   * Seconds of continuous silence, when the capture hook has real voice-
   * activity detection. Optional — when omitted, this component derives an
   * approximate silence duration from the amplitude stream itself.
   */
  silenceSeconds?: number
  className?: string
}

/** PRD §15.1: base 120px, max amplitude scale 1.35 (162px). */
const BASE_DIAMETER_PX = 120
const MAX_AMPLITUDE_SCALE = 1.35
const AMPLITUDE_SCALE_COEFFICIENT = 0.35
const EMA_ALPHA = 0.3

/** Below this RMS, a tick counts as silence for idle-breathing/caption timing. */
const SILENCE_RMS_THRESHOLD = 0.02
const IDLE_BREATHE_AFTER_MS = 1500
const SILENCE_CAPTION_AT_SECONDS = 6
const SILENCE_REASSURANCE_AT_SECONDS = 90

/** Safety tick so silence timing still advances even if a host hook stops
 *  emitting amplitude ticks once truly silent, instead of continuing at ~12Hz. */
const SILENCE_WATCHDOG_MS = 250

export default function ListeningAura({
  amplitude,
  state,
  onStop,
  silenceSeconds,
  className,
}: ListeningAuraProps): JSX.Element {
  const prefersReducedMotion = useReducedMotion()
  const hintId = useId()

  const emaRef = useRef(0)
  const lastLoudAtRef = useRef<number>(Date.now())
  const prevStateRef = useRef<ListeningAuraState>(state)

  const [scale, setScale] = useState(1)
  const [isIdleBreathing, setIsIdleBreathing] = useState(false)
  const [derivedSilenceSeconds, setDerivedSilenceSeconds] = useState(0)
  const [announcement, setAnnouncement] = useState('')

  // Amplitude smoothing (EMA) and per-tick loudness bookkeeping. Rendering
  // concern only — the hook owns the actual audio capture and RMS math.
  useEffect(() => {
    if (state !== 'listening') return
    const clamped = Number.isFinite(amplitude) ? Math.max(0, amplitude) : 0
    emaRef.current = EMA_ALPHA * clamped + (1 - EMA_ALPHA) * emaRef.current
    if (clamped > SILENCE_RMS_THRESHOLD) {
      lastLoudAtRef.current = Date.now()
    }
    const nextScale = 1 + Math.min(emaRef.current, 1) * AMPLITUDE_SCALE_COEFFICIENT
    setScale(Math.min(nextScale, MAX_AMPLITUDE_SCALE))
  }, [amplitude, state])

  // Silence timing: prefer the hook's own VAD-derived value when given, else
  // fall back to time-since-last-loud-tick, refreshed on a watchdog interval
  // so it keeps advancing even through a run of unchanging (silent) ticks.
  useEffect(() => {
    if (state !== 'listening') {
      setIsIdleBreathing(false)
      setDerivedSilenceSeconds(0)
      lastLoudAtRef.current = Date.now()
      return
    }
    const tick = () => {
      const resolvedSeconds =
        silenceSeconds ?? (Date.now() - lastLoudAtRef.current) / 1000
      setDerivedSilenceSeconds(resolvedSeconds)
      setIsIdleBreathing(resolvedSeconds * 1000 >= IDLE_BREATHE_AFTER_MS)
    }
    tick()
    const interval = setInterval(tick, SILENCE_WATCHDOG_MS)
    return () => clearInterval(interval)
  }, [state, silenceSeconds])

  // VoiceOver announcements fire once per transition only — never on every
  // amplitude tick or a timer (design spec §8.2).
  useEffect(() => {
    const prev = prevStateRef.current
    if (prev !== state) {
      if (prev === 'idle' && state === 'listening') {
        setAnnouncement(VOICEOVER_COPY.onRecordingStart)
      } else if (prev === 'listening' && state === 'processing') {
        setAnnouncement(VOICEOVER_COPY.onRecordingStop)
      }
      prevStateRef.current = state
    }
  }, [state])

  const canInteract = state === 'idle' || state === 'listening'

  const handleTap = () => {
    if (!canInteract) return
    onStop()
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!canInteract) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onStop()
    }
  }

  // Caption under the aura. Sourced entirely from microcopy.ts.
  let caption: string | null = null
  if (state === 'idle') {
    caption = LISTENING_COPY.armedCaption
  } else if (state === 'listening') {
    if (derivedSilenceSeconds >= SILENCE_REASSURANCE_AT_SECONDS) {
      caption = LISTENING_COPY.silenceAt90s
    } else if (derivedSilenceSeconds >= SILENCE_CAPTION_AT_SECONDS) {
      caption = LISTENING_COPY.silenceAt6s
    } else {
      caption = LISTENING_COPY.activeCaption
    }
  } else if (state === 'processing') {
    caption = VOICEOVER_COPY.onRecordingStop
  }

  // Visual scale/opacity target for the glow itself.
  const showBreathing = state === 'idle' || (state === 'listening' && isIdleBreathing)
  const activeAmplitudeScale = prefersReducedMotion ? 1 : scale

  return (
    <div
      className={cn(
        'relative flex min-h-[100dvh] w-full flex-col items-center justify-center gap-8 bg-[#0B0A08] px-6',
        className
      )}
    >
      <div
        role="button"
        aria-label={VOICEOVER_COPY.micButton.label}
        aria-describedby={hintId}
        aria-busy={state === 'listening'}
        aria-disabled={!canInteract}
        tabIndex={canInteract ? 0 : -1}
        onClick={handleTap}
        onKeyDown={handleKeyDown}
        className="relative flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-[var(--sage-300)] focus-visible:ring-offset-4 focus-visible:ring-offset-[#0B0A08]"
        style={{ width: BASE_DIAMETER_PX * MAX_AMPLITUDE_SCALE, height: BASE_DIAMETER_PX * MAX_AMPLITUDE_SCALE }}
      >
        <span id={hintId} className="sr-only">
          {VOICEOVER_COPY.micButton.hint}
        </span>

        {/* Outer glow: 40-60px blur, Sage core fading to transparent. */}
        <motion.div
          aria-hidden="true"
          className="absolute rounded-full"
          style={{
            width: BASE_DIAMETER_PX,
            height: BASE_DIAMETER_PX,
            background:
              'radial-gradient(circle, var(--sage-500) 0%, var(--sage-500) 35%, transparent 72%)',
            filter: 'blur(50px)',
          }}
          animate={
            showBreathing
              ? {
                  scale: prefersReducedMotion ? 1 : [0.92, 1, 0.92],
                  opacity: [0.7, 0.85, 0.7],
                }
              : { scale: activeAmplitudeScale, opacity: 0.85 }
          }
          transition={
            showBreathing
              ? { duration: 4, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 0.18, ease: 'easeOut' }
          }
        />

        {/* Inner core: sharper, brighter, same motion, no extra blur. */}
        <motion.div
          aria-hidden="true"
          className="absolute rounded-full"
          style={{
            width: BASE_DIAMETER_PX * 0.55,
            height: BASE_DIAMETER_PX * 0.55,
            background: 'var(--sage-400)',
            filter: 'blur(6px)',
          }}
          animate={
            showBreathing
              ? {
                  scale: prefersReducedMotion ? 1 : [0.92, 1, 0.92],
                  opacity: [0.75, 0.95, 0.75],
                }
              : { scale: activeAmplitudeScale, opacity: 0.95 }
          }
          transition={
            showBreathing
              ? { duration: 4, repeat: Infinity, ease: 'easeInOut' }
              : { type: 'spring', stiffness: 220, damping: 26 }
          }
        />
      </div>

      {caption && (
        <p className="max-w-xs text-center text-[15px] leading-[1.5] text-[#8A8681] opacity-80">
          {caption}
        </p>
      )}

      {/* Fires once per state transition only — never on amplitude or a timer. */}
      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>
    </div>
  )
}

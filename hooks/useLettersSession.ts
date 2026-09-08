'use client'

/**
 * @module useLettersSession
 * @description The nightly Letters flow, end to end: state machine, capture,
 *   persistence, follow-ups, review and optional composition. Every component
 *   in the Tonight flow renders what this returns and calls its actions —
 *   nothing here belongs in a component (engineering contract §2).
 *
 *   THE P0 GUARANTEE (PRD §15.5, and the model-change doc: "a night is complete
 *   the moment the transcript is persisted"):
 *     1. The instant capture ends, the text is written to the in-memory draft
 *        exposed on `draft` — before any network call, before follow-ups,
 *        before compose.
 *     2. It is POSTed to /api/letters/transcript immediately. That route is
 *        idempotent per (profile, baby, day), so retries update rather than
 *        duplicate.
 *     3. A failed write retries with backoff in the background while the draft
 *        stays on screen. `draft.status` and `retrySave()` are the UI's handle
 *        on that. Nothing is ever silently dropped.
 *     4. Composition is a SEPARATE call. Its failure sets `composeError` and
 *        never touches the saved transcript or the draft.
 *
 *   No localStorage (repo rule): durability is the API plus a draft this hook
 *   keeps and never clears until the server confirms the write.
 * @version 1.0.0
 * @since September 2026
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { isLettersEnabled, type LettersFlagContext } from '@/lib/letters/flags'
import { selectFollowUps, type FollowUpSlot } from '@/lib/letters/followups'
import {
  FOLLOWUP_BABY_NAME_FALLBACK,
  FOLLOWUP_TEMPLATES_BY_ARCHETYPE,
} from '@/lib/letters/prompts/followup-templates'
import { buildNotMuchTodayEntry } from '@/lib/letters/prompts/microcopy'
import type {
  CaptureMode,
  ComposeMode,
  Letter,
  LetterPromptContext,
  NameCorrection,
  OpeningPrompt,
  SafetyResult,
  VoiceProfile,
} from '@/types/letters'
import {
  useVoiceCapture,
  type StartVoiceCaptureOptions,
  type UseVoiceCaptureResult,
} from './useVoiceCapture'

/** PRD §14.2. `idle`/`loading` precede ARMED while tonight's context loads. */
export type LettersSessionState =
  | 'idle'
  | 'loading'
  | 'armed'
  | 'listening'
  | 'closed'
  | 'followup'
  | 'review'
  | 'composing'
  | 'saved'
  | 'failed'

/** Lifecycle of the one write that must never be lost. */
export type DraftSaveStatus = 'empty' | 'unsaved' | 'saving' | 'retrying' | 'saved' | 'failed'

export type LettersDraft = {
  /** The parent's words. Authoritative until `status === 'saved'`. */
  text: string
  captureMode: CaptureMode
  durationSeconds: number | null
  entryDate: string
  status: DraftSaveStatus
  /** Failed attempts since the last success. */
  attempts: number
  /** Server row id, once the transcript is persisted. Required for compose. */
  entryId: string | null
  lastError: string | null
  /** True whenever text exists that the server has not confirmed. */
  unsaved: boolean
}

export type SessionFollowUp = {
  archetype: FollowUpSlot['archetype']
  templateKey: string
  /** Rendered question text. Never model-generated on the client. */
  question: string
  answer: string | null
  skipped: boolean
  sourceRef: string | null
}

export type LettersSessionContext = {
  babyId: string
  entryDate: string
  openingPrompt: OpeningPrompt | null
  promptContext: LetterPromptContext | null
  voiceProfile: VoiceProfile | null
  nameCorrections: NameCorrection[]
  contextualStrings: string[]
}

export type ComposeStatus = 'idle' | 'composing' | 'done' | 'failed'

export type UseLettersSessionOptions = {
  babyId: string | null
  /**
   * Client-side flag gate (contract §1.1). When supplied and disabled, this
   * hook makes no network calls at all. Routes gate independently server-side.
   */
  flagContext?: LettersFlagContext | null
  /** Injected for testability; defaults to the real clock. */
  now?: () => Date
}

export type UseLettersSessionResult = {
  state: LettersSessionState
  /** Recoverable, parent-facing. Not the same as an unsaved draft. */
  error: string | null
  /** True when Letters is off for this user; every surface should render nothing. */
  disabled: boolean
  session: LettersSessionContext | null
  draft: LettersDraft
  /** Live text: the draft while capturing/reviewing, the saved entry after. */
  transcript: string
  followUps: SessionFollowUp[]
  activeFollowUpIndex: number
  safety: SafetyResult | null
  entry: Letter | null
  composeStatus: ComposeStatus
  composeError: string | null
  composeModeUsed: ComposeMode | null
  composeFallbackReason: string | null
  voice: UseVoiceCaptureResult

  arm: () => Promise<void>
  /** Resolves true only when the microphone actually opened. */
  startListening: (options?: StartVoiceCaptureOptions) => Promise<boolean>
  stopListening: () => Promise<void>
  /** The typed path. Co-equal to voice (PRD §15.4). */
  submitTyped: (text: string) => Promise<void>
  /** One tap, a real entry, no performance asked. PRD §14.2. */
  notMuchToday: () => Promise<void>
  answerFollowUp: (index: number, answer: string) => void
  skipFollowUp: (index: number) => void
  finishFollowUps: () => Promise<void>
  /** Review edits. Writes the draft synchronously, then debounces the network. */
  updateTranscript: (text: string) => void
  finishReview: () => Promise<void>
  compose: (mode?: ComposeMode) => Promise<void>
  retrySave: () => Promise<void>
  reset: () => void
}

const MAX_PERSIST_ATTEMPTS = 6
const BACKOFF_MS = [1_000, 2_000, 4_000, 8_000, 15_000, 30_000] as const
const REVIEW_DEBOUNCE_MS = 1_200
const GENERIC_ERROR = 'Lumira is taking a moment. Your entry is safe — we will keep trying.'

type PersistOutcome =
  | { ok: true; entryId: string; safety: SafetyResult }
  | { ok: false; retryable: boolean; message: string }

function toLocalDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function emptyDraft(entryDate: string): LettersDraft {
  return {
    text: '',
    captureMode: 'typed',
    durationSeconds: null,
    entryDate,
    status: 'empty',
    attempts: 0,
    entryId: null,
    lastError: null,
    unsaved: false,
  }
}

/** First clause of a prior entry, for {priorFact}. Never invented — trimmed only. */
function shortenPriorFact(text: string): string {
  const words = text.trim().split(/\s+/).slice(0, 12)
  return words.join(' ').replace(/[.,;:!?]+$/, '')
}

/**
 * Renders a selected slot into question text. Deterministic: the template is
 * picked by a caller-supplied seed, never at random. Returns null when a
 * required fact is missing — we drop the question rather than fabricate one.
 */
function renderFollowUp(
  slot: FollowUpSlot,
  ctx: LetterPromptContext | null,
  seed: number
): SessionFollowUp | null {
  const pool = FOLLOWUP_TEMPLATES_BY_ARCHETYPE[slot.archetype]
  if (!pool || pool.length === 0) return null
  const template = pool[((seed % pool.length) + pool.length) % pool.length]
  const babyName = ctx?.babyName ?? FOLLOWUP_BABY_NAME_FALLBACK
  let text = template.text.replaceAll('{babyName}', babyName)
  if (text.includes('{priorFact}')) {
    const thread = ctx?.openThreads.find((t) => t.entryId === slot.sourceRef)
    if (!thread || !thread.text.trim()) return null
    text = text.replaceAll('{priorFact}', shortenPriorFact(thread.text))
  }
  return {
    archetype: slot.archetype,
    templateKey: template.id,
    question: text,
    answer: null,
    skipped: false,
    sourceRef: slot.sourceRef,
  }
}

export function useLettersSession(options: UseLettersSessionOptions): UseLettersSessionResult {
  const { babyId, flagContext = null, now } = options
  const clock = useRef(now ?? (() => new Date()))
  clock.current = now ?? clock.current

  const disabled = flagContext !== null && !isLettersEnabled(flagContext)

  const [state, setState] = useState<LettersSessionState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [session, setSession] = useState<LettersSessionContext | null>(null)
  const [draft, setDraft] = useState<LettersDraft>(() => emptyDraft(toLocalDate(new Date())))
  const [followUps, setFollowUps] = useState<SessionFollowUp[]>([])
  const [activeFollowUpIndex, setActiveFollowUpIndex] = useState(0)
  const [safety, setSafety] = useState<SafetyResult | null>(null)
  const [entry, setEntry] = useState<Letter | null>(null)
  const [composeStatus, setComposeStatus] = useState<ComposeStatus>('idle')
  const [composeError, setComposeError] = useState<string | null>(null)
  const [composeModeUsed, setComposeModeUsed] = useState<ComposeMode | null>(null)
  const [composeFallbackReason, setComposeFallbackReason] = useState<string | null>(null)

  const draftRef = useRef(draft)
  const sessionRef = useRef<LettersSessionContext | null>(null)
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const persistSeqRef = useRef(0)
  const mountedRef = useRef(true)

  const voice = useVoiceCapture({ contextualStrings: session?.contextualStrings })

  const patchDraft = useCallback((patch: Partial<LettersDraft>) => {
    const next = { ...draftRef.current, ...patch }
    draftRef.current = next
    if (mountedRef.current) setDraft(next)
  }, [])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (retryTimerRef.current !== null) clearTimeout(retryTimerRef.current)
      if (debounceTimerRef.current !== null) clearTimeout(debounceTimerRef.current)
      retryTimerRef.current = null
      debounceTimerRef.current = null
    }
  }, [])

  // A tab close with an unconfirmed entry is exactly the failure PRD §15.5 forbids.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const handler = (e: BeforeUnloadEvent) => {
      if (!draftRef.current.unsaved || draftRef.current.text.trim() === '') return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [])

  // -------------------------------------------------------------------------
  // Persistence — the one write that must never be lost.
  // -------------------------------------------------------------------------

  const postTranscript = useCallback(async (): Promise<PersistOutcome> => {
    const d = draftRef.current
    const targetBabyId = sessionRef.current?.babyId ?? babyId
    if (!targetBabyId) return { ok: false, retryable: false, message: GENERIC_ERROR }
    try {
      const res = await fetch('/api/letters/transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baby_id: targetBabyId,
          entry_date: d.entryDate,
          raw_transcript: d.text,
          capture_mode: d.captureMode,
          duration_seconds: d.durationSeconds,
        }),
      })
      const payload: unknown = await res.json().catch(() => null)
      if (!res.ok) {
        const message =
          payload && typeof payload === 'object' && typeof (payload as { message?: unknown }).message === 'string'
            ? (payload as { message: string }).message
            : GENERIC_ERROR
        // 4xx other than 429 will not succeed on retry; anything else might.
        const retryable = res.status === 429 || res.status >= 500
        return { ok: false, retryable, message }
      }
      const body = payload as { entryId?: string; safety?: SafetyResult } | null
      if (!body?.entryId) return { ok: false, retryable: true, message: GENERIC_ERROR }
      return {
        ok: true,
        entryId: body.entryId,
        safety: body.safety ?? { tier: 0, category: 'none', templateKey: null },
      }
    } catch {
      // Network/offline. Always retryable — the draft stays on screen.
      return { ok: false, retryable: true, message: GENERIC_ERROR }
    }
  }, [babyId])

  /** One attempt plus scheduled background retries. Resolves with this attempt's outcome. */
  const persist = useCallback(async (): Promise<PersistOutcome> => {
    if (draftRef.current.text.trim() === '') {
      return { ok: false, retryable: false, message: 'Nothing to save yet.' }
    }
    if (retryTimerRef.current !== null) {
      clearTimeout(retryTimerRef.current)
      retryTimerRef.current = null
    }
    const seq = ++persistSeqRef.current
    patchDraft({ status: draftRef.current.attempts > 0 ? 'retrying' : 'saving', unsaved: true })

    const outcome = await postTranscript()
    if (seq !== persistSeqRef.current) return outcome // superseded by a newer draft

    if (outcome.ok) {
      patchDraft({ status: 'saved', entryId: outcome.entryId, attempts: 0, lastError: null, unsaved: false })
      if (mountedRef.current) setSafety(outcome.safety)
      return outcome
    }

    const attempts = draftRef.current.attempts + 1
    const exhausted = !outcome.retryable || attempts >= MAX_PERSIST_ATTEMPTS
    patchDraft({
      status: exhausted ? 'failed' : 'retrying',
      attempts,
      lastError: outcome.message,
      unsaved: true,
    })
    if (!exhausted) {
      const delay = BACKOFF_MS[Math.min(attempts - 1, BACKOFF_MS.length - 1)]
      retryTimerRef.current = setTimeout(() => {
        retryTimerRef.current = null
        void persist()
      }, delay)
    }
    return outcome
  }, [patchDraft, postTranscript])

  const retrySave = useCallback(async (): Promise<void> => {
    patchDraft({ attempts: 0, lastError: null })
    const outcome = await persist()
    // FAILED is only ever entered after the parent finished the entry, so a
    // successful retry completes the night rather than reopening review.
    if (outcome.ok && mountedRef.current && state === 'failed') setState('saved')
  }, [patchDraft, persist, state])

  // -------------------------------------------------------------------------
  // Flow
  // -------------------------------------------------------------------------

  const arm = useCallback(async (): Promise<void> => {
    if (disabled || !babyId) return
    setState('loading')
    setError(null)
    const entryDate = toLocalDate(clock.current())
    // Context load must never block the habit: on failure we still arm, with
    // the generic prompt, because a parent can always speak or type.
    let loaded: LettersSessionContext = {
      babyId,
      entryDate,
      openingPrompt: null,
      promptContext: null,
      voiceProfile: null,
      nameCorrections: [],
      contextualStrings: [],
    }
    try {
      const res = await fetch('/api/letters/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baby_id: babyId }),
      })
      if (res.ok) {
        const data = (await res.json()) as Partial<LettersSessionContext> & { entryDate?: string }
        loaded = {
          babyId,
          entryDate: data.entryDate ?? entryDate,
          openingPrompt: data.openingPrompt ?? null,
          promptContext: data.promptContext ?? null,
          voiceProfile: data.voiceProfile ?? null,
          nameCorrections: data.nameCorrections ?? [],
          contextualStrings: data.contextualStrings ?? [],
        }
      } else if (mountedRef.current) {
        setError(res.status === 404 ? null : GENERIC_ERROR)
      }
    } catch {
      if (mountedRef.current) setError(GENERIC_ERROR)
    }
    sessionRef.current = loaded
    draftRef.current = { ...emptyDraft(loaded.entryDate) }
    if (!mountedRef.current) return
    setSession(loaded)
    setDraft(draftRef.current)
    setState('armed')
  }, [babyId, disabled])

  /**
   * Everything after capture funnels through here, so the persist-first
   * ordering has exactly one implementation.
   */
  const closeCapture = useCallback(
    async (text: string, captureMode: CaptureMode, durationSeconds: number | null, opts: { followUps: boolean }) => {
      const clean = text.trim()
      setState('closed')
      patchDraft({
        text: clean,
        captureMode,
        durationSeconds,
        status: clean ? 'unsaved' : 'empty',
        unsaved: clean.length > 0,
        attempts: 0,
        lastError: null,
      })
      if (!clean) {
        // Nothing was captured. Let the parent type rather than lose the night.
        if (mountedRef.current) setState('review')
        return
      }

      const outcome = await persist()
      if (!mountedRef.current) return

      if (!outcome.ok) {
        // Background retries continue; the draft stays on screen either way.
        // A one-tap path has no review screen to fall back to, so it surfaces
        // FAILED (with retrySave); a captured entry goes to REVIEW.
        setState(opts.followUps ? 'review' : 'failed')
        return
      }
      if (!opts.followUps) {
        setState('saved')
        return
      }

      const ctx = sessionRef.current?.promptContext ?? null
      const slots = ctx ? selectFollowUps(clean, ctx, outcome.safety) : []
      const seed = Number.parseInt(draftRef.current.entryDate.slice(-2), 10) || 0
      const rendered = slots
        .map((slot, i) => renderFollowUp(slot, ctx, seed + i))
        .filter((q): q is SessionFollowUp => q !== null)
      setFollowUps(rendered)
      setActiveFollowUpIndex(0)
      setState(rendered.length > 0 ? 'followup' : 'review')
    },
    [patchDraft, persist]
  )

  const startListening = useCallback(
    async (startOptions?: StartVoiceCaptureOptions): Promise<boolean> => {
      if (disabled) return false
      setError(null)
      const started = await voice.start(startOptions)
      // Only claim LISTENING if the mic really opened. A blocked or unsupported
      // capture must leave the parent on ARMED with the typing path in reach.
      if (started && mountedRef.current) setState('listening')
      return started
    },
    [disabled, voice]
  )

  const stopListening = useCallback(async (): Promise<void> => {
    // Only an explicit stop ends capture — silence never does (useVoiceCapture).
    const result = await voice.stop()
    await closeCapture(result.transcript, 'spoken', result.durationSeconds, { followUps: true })
  }, [closeCapture, voice])

  const submitTyped = useCallback(
    async (text: string): Promise<void> => {
      await closeCapture(text, 'typed', null, { followUps: true })
    },
    [closeCapture]
  )

  const notMuchToday = useCallback(async (): Promise<void> => {
    const date = sessionRef.current?.entryDate ?? draftRef.current.entryDate
    const parsed = new Date(`${date}T00:00:00`)
    const weekday = Number.isNaN(parsed.getTime()) ? clock.current().getDay() : parsed.getDay()
    const seed = Number.parseInt(date.slice(-2), 10) || 0
    const body = buildNotMuchTodayEntry(weekday, sessionRef.current?.promptContext?.babyName ?? null, seed)
    // One tap: no follow-ups, no review, no performance asked of the parent.
    await closeCapture(body, 'not_much', null, { followUps: false })
  }, [closeCapture])

  const answerFollowUp = useCallback((index: number, answer: string) => {
    setFollowUps((prev) =>
      prev.map((f, i) => (i === index ? { ...f, answer: answer.trim() || null, skipped: false } : f))
    )
  }, [])

  const skipFollowUp = useCallback((index: number) => {
    setFollowUps((prev) => prev.map((f, i) => (i === index ? { ...f, skipped: true, answer: null } : f)))
    setActiveFollowUpIndex((i) => (i === index ? i + 1 : i))
  }, [])

  const finishFollowUps = useCallback(async (): Promise<void> => {
    const answers = followUps
      .filter((f) => !f.skipped && f.answer && f.answer.trim().length > 0)
      .map((f) => (f.answer as string).trim())
    if (answers.length > 0) {
      const merged = [draftRef.current.text, ...answers].join('\n\n')
      patchDraft({ text: merged, captureMode: 'mixed', status: 'unsaved', unsaved: true, attempts: 0 })
      void persist() // idempotent update of the same row; never blocks the UI
    }
    if (mountedRef.current) setState('review')
  }, [followUps, patchDraft, persist])

  const updateTranscript = useCallback(
    (text: string) => {
      // Local draft first, always. The network is debounced behind it.
      patchDraft({ text, status: 'unsaved', unsaved: true, attempts: 0, lastError: null })
      if (debounceTimerRef.current !== null) clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = setTimeout(() => {
        debounceTimerRef.current = null
        void persist()
      }, REVIEW_DEBOUNCE_MS)
    },
    [patchDraft, persist]
  )

  const finishReview = useCallback(async (): Promise<void> => {
    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
    if (draftRef.current.text.trim() === '') {
      setError('There is nothing saved for tonight yet.')
      return
    }
    const outcome = draftRef.current.unsaved ? await persist() : { ok: true as const }
    if (!mountedRef.current) return
    setState(outcome.ok ? 'saved' : 'failed')
  }, [persist])

  const compose = useCallback(
    async (mode?: ComposeMode): Promise<void> => {
      const entryId = draftRef.current.entryId
      if (!entryId) {
        setComposeStatus('failed')
        setComposeError('Tonight’s entry is still saving. Your words are safe — try again in a moment.')
        return
      }
      setComposeStatus('composing')
      setComposeError(null)
      setState('composing')
      try {
        const res = await fetch('/api/letters/compose', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mode ? { entry_id: entryId, mode } : { entry_id: entryId }),
        })
        const payload = (await res.json().catch(() => null)) as
          | { entry?: Letter; compose_mode_used?: ComposeMode; fallback_reason?: string; message?: string }
          | null
        if (!mountedRef.current) return
        if (!res.ok || !payload?.entry) {
          // The transcript row is untouched by a compose failure, by contract.
          setComposeStatus('failed')
          setComposeError(payload?.message ?? 'We could not shape this entry right now. Your words are safe.')
          setState('saved')
          return
        }
        setEntry(payload.entry)
        setComposeModeUsed(payload.compose_mode_used ?? null)
        setComposeFallbackReason(payload.fallback_reason ?? null)
        setComposeStatus('done')
        setState('saved')
      } catch {
        if (!mountedRef.current) return
        setComposeStatus('failed')
        setComposeError('We could not shape this entry right now. Your words are safe.')
        setState('saved')
      }
    },
    []
  )

  const reset = useCallback(() => {
    if (retryTimerRef.current !== null) clearTimeout(retryTimerRef.current)
    if (debounceTimerRef.current !== null) clearTimeout(debounceTimerRef.current)
    retryTimerRef.current = null
    debounceTimerRef.current = null
    persistSeqRef.current += 1
    voice.reset()
    const fresh = emptyDraft(sessionRef.current?.entryDate ?? toLocalDate(clock.current()))
    draftRef.current = fresh
    if (!mountedRef.current) return
    setDraft(fresh)
    setFollowUps([])
    setActiveFollowUpIndex(0)
    setSafety(null)
    setEntry(null)
    setComposeStatus('idle')
    setComposeError(null)
    setComposeModeUsed(null)
    setComposeFallbackReason(null)
    setError(null)
    setState(sessionRef.current ? 'armed' : 'idle')
  }, [voice])

  const transcript = useMemo(() => entry?.body ?? draft.text, [entry, draft.text])

  return {
    state,
    error,
    disabled,
    session,
    draft,
    transcript,
    followUps,
    activeFollowUpIndex,
    safety,
    entry,
    composeStatus,
    composeError,
    composeModeUsed,
    composeFallbackReason,
    voice,
    arm,
    startListening,
    stopListening,
    submitTyped,
    notMuchToday,
    answerFollowUp,
    skipFollowUp,
    finishFollowUps,
    updateTranscript,
    finishReview,
    compose,
    retrySave,
    reset,
  }
}

'use client'

/**
 * @module useVoiceCapture
 * @description Browser microphone capture + speech-to-text for the Letters
 *   nightly flow. All capture state and I/O live here; components render what
 *   this returns (engineering contract §2, "no business logic in components").
 *
 *   HONESTY ABOUT THE WEB PATH (PRD §21.2). MDN lists `SpeechRecognition` as
 *   *limited availability, not Baseline*, and Chrome's default implementation
 *   is **server-based** — the audio leaves the device. Lumira's product promise
 *   is that a parent's nightly recording stays on their device. Those two facts
 *   cannot both be true, so this hook never silently resolves the conflict in
 *   favour of shipping voice:
 *
 *     - It probes for genuine on-device recognition
 *       (`SpeechRecognition.available({ processLocally: true })`, Chrome 138+).
 *     - When on-device recognition cannot be guaranteed, `privacyMode` is
 *       `'server'` and `start()` REFUSES, moving to `state: 'blocked'`.
 *       It does not quietly stream the parent to a remote recognizer.
 *     - The caller may opt in explicitly per session via
 *       `start({ allowServerTranscription: true })` — which is what an informed
 *       UI consent step passes. Absent that, the UI offers typing instead
 *       (PRD §15.4: voice and typing are co-equal, not primary and fallback).
 *
 *   Two other invariants, both P0:
 *     - **Never auto-stop on silence** (PRD §14.2). Chrome ends a recognition
 *       session on its own after a pause; `onend` restarts it while the parent
 *       has not asked to stop. Only `stop()` ends capture.
 *     - **Never leak a microphone.** Every stream track, AudioContext, timer
 *       and listener is released on stop and on unmount.
 * @version 1.0.0
 * @since September 2026
 */

import { useCallback, useEffect, useRef, useState } from 'react'

// ---------------------------------------------------------------------------
// Minimal local typings. `SpeechRecognition` is not in TypeScript's DOM lib, and
// the on-device members below are newer than any published lib. Declared
// locally (never as globals) so nothing here can clash with a future lib.dom.
// ---------------------------------------------------------------------------

interface WebSpeechRecognitionEvent extends Event {
  readonly resultIndex: number
  readonly results: SpeechRecognitionResultList
}

interface WebSpeechRecognitionErrorEvent extends Event {
  readonly error: string
  readonly message?: string
}

interface WebSpeechRecognition extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  /** Chrome 138+. Forces local processing; absent means server-based. */
  processLocally?: boolean
  onresult: ((event: WebSpeechRecognitionEvent) => void) | null
  onerror: ((event: WebSpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

type OnDeviceAvailability = 'available' | 'downloadable' | 'downloading' | 'unavailable'

interface WebSpeechRecognitionConstructor {
  new (): WebSpeechRecognition
  /** Chrome 138+. Absent on every server-based implementation. */
  available?: (options: { langs: string[]; processLocally: boolean }) => Promise<OnDeviceAvailability>
}

type SpeechCapableWindow = Window & {
  SpeechRecognition?: WebSpeechRecognitionConstructor
  webkitSpeechRecognition?: WebSpeechRecognitionConstructor
}

// ---------------------------------------------------------------------------
// Public contract
// ---------------------------------------------------------------------------

export type VoiceCaptureState =
  | 'idle'
  | 'unsupported'
  /** On-device recognition unavailable and the caller did not opt into a server. */
  | 'blocked'
  | 'requesting'
  | 'listening'
  | 'stopping'
  | 'stopped'
  | 'error'

/**
 * Where transcription actually happens. `'server'` means the audio would leave
 * the device — the UI must say so, or offer typing, before capture starts.
 */
export type VoicePrivacyMode = 'unknown' | 'on_device' | 'server' | 'unavailable'

export type VoiceCaptureErrorCode =
  | 'unsupported'
  | 'insecure_context'
  | 'server_transcription_refused'
  | 'permission_denied'
  | 'no_microphone'
  | 'audio_init_failed'
  | 'recognition_failed'

export type VoiceCaptureError = {
  code: VoiceCaptureErrorCode
  /** Parent-facing. Never blames the parent, never implies lost words. */
  message: string
}

/** What a completed capture yielded. Returned by `stop()`. */
export type VoiceCaptureResult = {
  transcript: string
  durationSeconds: number
}

export type StartVoiceCaptureOptions = {
  /**
   * Explicit, per-session consent to use a server-based recognizer. Default
   * false. Only pass true from a UI that told the parent audio leaves the
   * device.
   */
  allowServerTranscription?: boolean
}

export type UseVoiceCaptureOptions = {
  /** BCP-47 tag. Defaults to the browser locale, then 'en-US'. */
  lang?: string
  /**
   * Names the recognizer should bias toward (the session route returns these as
   * `contextualStrings`). Applied only where the browser exposes phrase biasing;
   * the deterministic name-correction layer server-side is the real mitigation.
   */
  contextualStrings?: readonly string[]
}

export type UseVoiceCaptureResult = {
  state: VoiceCaptureState
  /** Smoothed RMS, 0..1, sampled ~12Hz. Drives the aura (PRD §15.1). */
  amplitude: number
  partialTranscript: string
  finalTranscript: string
  /** Seconds of the most recent (or in-progress) capture. */
  durationSeconds: number
  isSupported: boolean
  privacyMode: VoicePrivacyMode
  error: VoiceCaptureError | null
  /** Resolves true only when capture actually began. False means see `state`/`error`. */
  start: (options?: StartVoiceCaptureOptions) => Promise<boolean>
  /** The ONLY thing that ends capture. Silence never does. */
  stop: () => Promise<VoiceCaptureResult>
  reset: () => void
}

/** ~12Hz, per the aura spec. */
const AMPLITUDE_INTERVAL_MS = 83
/** EMA smoothing factor from the design spec. */
const AMPLITUDE_SMOOTHING = 0.3
/** Recognition can end on its own. Above this many silent restarts in one
 *  capture we stop retrying rather than spin. */
const MAX_RESTARTS = 120
/** Longest we wait for a trailing final result after stop() before finalizing. */
const FINALIZE_GRACE_MS = 1200

const ERROR_MESSAGES: Record<VoiceCaptureErrorCode, string> = {
  unsupported: 'This browser cannot transcribe speech. You can type tonight’s entry instead.',
  insecure_context: 'Recording needs a secure connection. You can type tonight’s entry instead.',
  server_transcription_refused:
    'This browser would send your recording to a server to transcribe it. You can type tonight’s entry instead.',
  permission_denied: 'Lumira does not have microphone access yet. You can type tonight’s entry instead.',
  no_microphone: 'No microphone was found. You can type tonight’s entry instead.',
  audio_init_failed: 'The microphone could not start. You can type tonight’s entry instead.',
  recognition_failed: 'Transcription stopped. Anything already captured is safe.',
}

function getRecognitionConstructor(): WebSpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null
  const w = window as SpeechCapableWindow
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

function defaultLang(): string {
  if (typeof navigator === 'undefined') return 'en-US'
  return navigator.language || 'en-US'
}

/** RMS over one analyser frame, clamped to 0..1. */
function readRms(analyser: AnalyserNode, buffer: Float32Array): number {
  analyser.getFloatTimeDomainData(buffer as Float32Array<ArrayBuffer>)
  let sum = 0
  for (let i = 0; i < buffer.length; i++) sum += buffer[i] * buffer[i]
  const rms = Math.sqrt(sum / buffer.length)
  return Number.isFinite(rms) ? Math.min(1, Math.max(0, rms)) : 0
}

export function useVoiceCapture(options: UseVoiceCaptureOptions = {}): UseVoiceCaptureResult {
  const { lang, contextualStrings } = options

  const [state, setState] = useState<VoiceCaptureState>('idle')
  const [amplitude, setAmplitude] = useState(0)
  const [partialTranscript, setPartialTranscript] = useState('')
  const [finalTranscript, setFinalTranscript] = useState('')
  const [durationSeconds, setDurationSeconds] = useState(0)
  const [privacyMode, setPrivacyMode] = useState<VoicePrivacyMode>('unknown')
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState<VoiceCaptureError | null>(null)

  const recognitionRef = useRef<WebSpeechRecognition | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const meterTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const finalizeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const finalTextRef = useRef('')
  const startedAtRef = useRef<number | null>(null)
  const stopRequestedRef = useRef(false)
  const restartsRef = useRef(0)
  const smoothedRef = useRef(0)
  const mountedRef = useRef(true)
  const resolveStopRef = useRef<((result: VoiceCaptureResult) => void) | null>(null)
  const privacyModeRef = useRef<VoicePrivacyMode>('unknown')

  const fail = useCallback((code: VoiceCaptureErrorCode, nextState: VoiceCaptureState) => {
    if (!mountedRef.current) return
    setError({ code, message: ERROR_MESSAGES[code] })
    setState(nextState)
  }, [])

  /** Releases every OS resource. Safe to call repeatedly. */
  const teardown = useCallback(() => {
    if (meterTimerRef.current !== null) {
      clearInterval(meterTimerRef.current)
      meterTimerRef.current = null
    }
    const recognition = recognitionRef.current
    if (recognition) {
      recognition.onresult = null
      recognition.onerror = null
      recognition.onend = null
      recognition.onstart = null
      try {
        recognition.abort()
      } catch {
        // Already ended. Nothing to release.
      }
      recognitionRef.current = null
    }
    if (sourceRef.current) {
      try {
        sourceRef.current.disconnect()
      } catch {
        // Node already detached.
      }
      sourceRef.current = null
    }
    analyserRef.current = null
    const ctx = audioContextRef.current
    if (ctx) {
      audioContextRef.current = null
      void ctx.close().catch(() => undefined)
    }
    const stream = streamRef.current
    if (stream) {
      streamRef.current = null
      stream.getTracks().forEach((track) => track.stop())
    }
    smoothedRef.current = 0
  }, [])

  /** Idempotent end-of-capture. Called by stop(), by onend, and by the grace timer. */
  const finalize = useCallback(() => {
    if (finalizeTimerRef.current !== null) {
      clearTimeout(finalizeTimerRef.current)
      finalizeTimerRef.current = null
    }
    const started = startedAtRef.current
    const elapsed = started === null ? 0 : Math.max(0, Math.round((Date.now() - started) / 1000))
    startedAtRef.current = null
    teardown()

    const result: VoiceCaptureResult = { transcript: finalTextRef.current.trim(), durationSeconds: elapsed }

    if (mountedRef.current) {
      setAmplitude(0)
      setPartialTranscript('')
      setFinalTranscript(result.transcript)
      setDurationSeconds(elapsed)
      setState((prev) => (prev === 'error' ? 'error' : 'stopped'))
    }

    const resolve = resolveStopRef.current
    resolveStopRef.current = null
    if (resolve) resolve(result)
  }, [teardown])

  // Capability + privacy probe. Runs once on the client; never during SSR.
  useEffect(() => {
    let cancelled = false

    const probe = async () => {
      if (typeof window === 'undefined') return
      if (!window.isSecureContext) {
        if (!cancelled) {
          setIsSupported(false)
          setPrivacyMode('unavailable')
          privacyModeRef.current = 'unavailable'
          setState('unsupported')
          setError({ code: 'insecure_context', message: ERROR_MESSAGES.insecure_context })
        }
        return
      }
      const Ctor = getRecognitionConstructor()
      const hasMedia = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia
      if (!Ctor || !hasMedia) {
        if (!cancelled) {
          setIsSupported(false)
          setPrivacyMode('unavailable')
          privacyModeRef.current = 'unavailable'
          setState('unsupported')
          setError({ code: 'unsupported', message: ERROR_MESSAGES.unsupported })
        }
        return
      }

      // On-device recognition is the ONLY configuration whose privacy claim we
      // can honour. Anything else — including a probe that throws — is 'server'.
      let mode: VoicePrivacyMode = 'server'
      if (typeof Ctor.available === 'function') {
        try {
          const availability = await Ctor.available({ langs: [lang ?? defaultLang()], processLocally: true })
          if (availability === 'available') mode = 'on_device'
        } catch {
          mode = 'server'
        }
      }
      if (cancelled) return
      setIsSupported(true)
      setPrivacyMode(mode)
      privacyModeRef.current = mode
    }

    void probe()
    return () => {
      cancelled = true
    }
  }, [lang])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      // A leaked mic stream outlives the screen. Release everything.
      if (finalizeTimerRef.current !== null) clearTimeout(finalizeTimerRef.current)
      finalizeTimerRef.current = null
      const resolve = resolveStopRef.current
      resolveStopRef.current = null
      teardown()
      if (resolve) resolve({ transcript: finalTextRef.current.trim(), durationSeconds: 0 })
    }
  }, [teardown])

  const start = useCallback(
    async (startOptions: StartVoiceCaptureOptions = {}): Promise<boolean> => {
      if (recognitionRef.current || streamRef.current) return false

      const Ctor = getRecognitionConstructor()
      if (!isSupported || !Ctor) {
        fail('unsupported', 'unsupported')
        return false
      }
      // The privacy gate. Refusing here is the point of this hook.
      if (privacyModeRef.current !== 'on_device' && !startOptions.allowServerTranscription) {
        fail('server_transcription_refused', 'blocked')
        return false
      }

      setError(null)
      setState('requesting')
      finalTextRef.current = ''
      setFinalTranscript('')
      setPartialTranscript('')
      setDurationSeconds(0)
      stopRequestedRef.current = false
      restartsRef.current = 0

      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      } catch (err) {
        const name = err instanceof Error ? err.name : ''
        fail(name === 'NotFoundError' || name === 'OverconstrainedError' ? 'no_microphone' : 'permission_denied', 'error')
        return false
      }
      if (!mountedRef.current) {
        stream.getTracks().forEach((t) => t.stop())
        return false
      }
      streamRef.current = stream

      // Amplitude meter. Independent of recognition so the aura keeps moving
      // even if the recognizer hiccups.
      try {
        const AudioCtor: typeof AudioContext =
          window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        const ctx = new AudioCtor()
        audioContextRef.current = ctx
        if (ctx.state === 'suspended') await ctx.resume().catch(() => undefined)
        const analyser = ctx.createAnalyser()
        analyser.fftSize = 2048
        analyser.smoothingTimeConstant = 0
        const source = ctx.createMediaStreamSource(stream)
        source.connect(analyser)
        analyserRef.current = analyser
        sourceRef.current = source
        const buffer = new Float32Array(analyser.fftSize)
        meterTimerRef.current = setInterval(() => {
          const node = analyserRef.current
          if (!node || !mountedRef.current) return
          const rms = readRms(node, buffer)
          smoothedRef.current = AMPLITUDE_SMOOTHING * rms + (1 - AMPLITUDE_SMOOTHING) * smoothedRef.current
          setAmplitude(smoothedRef.current)
        }, AMPLITUDE_INTERVAL_MS)
      } catch {
        // The meter is cosmetic; capture must still work without it.
        teardown()
        fail('audio_init_failed', 'error')
        return false
      }

      let recognition: WebSpeechRecognition
      try {
        recognition = new Ctor()
      } catch {
        teardown()
        fail('audio_init_failed', 'error')
        return false
      }
      recognition.lang = lang ?? defaultLang()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.maxAlternatives = 1
      if ('processLocally' in recognition) {
        recognition.processLocally = privacyModeRef.current === 'on_device'
      }
      // Phrase biasing where the browser has it; harmless where it does not.
      const phrases = contextualStrings?.filter((s) => s.trim().length > 0) ?? []
      if (phrases.length > 0) {
        const target = recognition as unknown as Record<string, unknown>
        if ('phrases' in target) target.phrases = phrases
      }

      recognition.onresult = (event) => {
        let interim = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          const text = result[0]?.transcript ?? ''
          if (result.isFinal) {
            finalTextRef.current = `${finalTextRef.current}${finalTextRef.current ? ' ' : ''}${text.trim()}`
          } else {
            interim += text
          }
        }
        if (!mountedRef.current) return
        setPartialTranscript(interim.trim())
        if (finalTextRef.current) setFinalTranscript(finalTextRef.current.trim())
      }

      recognition.onerror = (event) => {
        // 'no-speech' and 'aborted' are normal. Silence must never end capture,
        // and abort is what stop()/teardown() themselves cause.
        if (event.error === 'no-speech' || event.error === 'aborted') return
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          stopRequestedRef.current = true
          fail('permission_denied', 'error')
          finalize()
          return
        }
        // Everything captured so far is already in finalTextRef and is kept.
        if (mountedRef.current) setError({ code: 'recognition_failed', message: ERROR_MESSAGES.recognition_failed })
      }

      recognition.onend = () => {
        if (stopRequestedRef.current) {
          finalize()
          return
        }
        // Chrome ends the session after a pause. The parent did not ask to
        // stop, so start a new one. This is the "never auto-stop" guarantee.
        if (restartsRef.current >= MAX_RESTARTS) {
          fail('recognition_failed', 'error')
          finalize()
          return
        }
        restartsRef.current += 1
        try {
          recognition.start()
        } catch {
          fail('recognition_failed', 'error')
          finalize()
        }
      }

      try {
        recognition.start()
      } catch {
        teardown()
        fail('recognition_failed', 'error')
        return false
      }
      recognitionRef.current = recognition
      startedAtRef.current = Date.now()
      if (mountedRef.current) setState('listening')
      return true
    },
    [contextualStrings, fail, finalize, isSupported, lang, teardown]
  )

  const stop = useCallback((): Promise<VoiceCaptureResult> => {
    if (!recognitionRef.current && !streamRef.current) {
      return Promise.resolve({ transcript: finalTextRef.current.trim(), durationSeconds })
    }
    stopRequestedRef.current = true
    if (mountedRef.current) setState('stopping')

    return new Promise<VoiceCaptureResult>((resolve) => {
      resolveStopRef.current = resolve
      try {
        recognitionRef.current?.stop()
      } catch {
        finalize()
        return
      }
      // A trailing final result usually arrives before 'end'. Do not wait forever.
      finalizeTimerRef.current = setTimeout(finalize, FINALIZE_GRACE_MS)
    })
  }, [durationSeconds, finalize])

  const reset = useCallback(() => {
    stopRequestedRef.current = true
    teardown()
    finalTextRef.current = ''
    startedAtRef.current = null
    if (!mountedRef.current) return
    setPartialTranscript('')
    setFinalTranscript('')
    setDurationSeconds(0)
    setAmplitude(0)
    setError(null)
    setState(isSupported ? 'idle' : 'unsupported')
  }, [isSupported, teardown])

  return {
    state,
    amplitude,
    partialTranscript,
    finalTranscript,
    durationSeconds,
    isSupported,
    privacyMode,
    error,
    start,
    stop,
    reset,
  }
}

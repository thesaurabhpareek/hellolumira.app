// app/(app)/journal/tonight/page.tsx — The nightly ritual screen
//
// Lane: FE9. Owns this file only (see docs/LETTERS-ENGINEERING-CONTRACT.md §5).
//
// Orchestrates components other lanes built (ListeningAura FE1, TranscriptEditor
// FE2, FollowUpQuestionCard FE3, ComposingState FE4) around the FE10
// `useLettersSession` hook. Pure wiring: all state, all I/O, all persistence
// live in the hook (engineering contract §2 — "no business logic in
// components... hooks own state and I/O"). This file makes no direct Supabase
// calls, no fetch calls, no localStorage reads/writes.
//
// State machine — PRD §14.2 — as the real FE10 hook implements it:
//   idle -> loading -> armed -> listening -> closed -> (followup|review)
//     -> review -> saved
// with `composing` as a state the hook visits FROM `saved` (compose() is a
// post-save action, never a gate — this is the model-change doc's "composition
// is never required to finish a night" enforced structurally, not just by
// convention) and `failed` reserved for a transcript PERSIST failure (not a
// compose failure — compose failures resolve back to `saved` with
// `composeError` set; the entry is untouched, by contract).
//
// Model correction — docs/LETTERS-MODEL-CHANGE.md supersedes the PRD's premise
// that a "letter" is the nightly unit: what this screen produces is a LOG
// (entry_kind='log', the habit). `saved` is a complete night. Turning tonight's
// log into a "letter" is a separate, opt-in, never-gating suggestion offered
// quietly after save.
//
// ListeningAura (FE1) is a full-viewport, self-contained surface: it owns the
// near-black eyes-free background, the idle-breathing loop, the 6s/90s silence
// captions, and its own VoiceOver announcements for the tap/record lifecycle.
// This page does not duplicate any of that — it renders ListeningAura bare for
// 'armed' (not typing), 'listening', and 'closed', and only overlays the two
// escape hatches ("Type instead", "Not much today") on top of it while armed,
// since PRD §15.4 requires them visible without being gated behind speaking.

'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { useBabyProfile } from '@/hooks/useBabyProfile'
import { useLettersSession } from '@/hooks/useLettersSession'
import { isSubFlagEnabled, type LettersFlagContext } from '@/lib/letters/flags'
import type { NameCorrection } from '@/types/letters'

import ListeningAura from '@/components/app/letters/ListeningAura'
import TranscriptEditor from '@/components/app/letters/TranscriptEditor'
import FollowUpQuestionCard from '@/components/app/letters/FollowUpQuestionCard'
import ComposingState from '@/components/app/letters/ComposingState'

import {
  NOT_MUCH_TODAY_BUTTON_LABEL,
  NOT_MUCH_TODAY_A11Y_HINT,
  MODALITY_CHOICE_COPY,
  TYPED_ENTRY_COPY,
  COMPOSE_FAILURE_COPY,
  buildTypedEntryPlaceholder,
  VOICEOVER_COPY,
  buildVoiceOverSaveAnnouncement,
} from '@/lib/letters/prompts/microcopy'

/** Parses a 'YYYY-MM-DD' entry_date without a UTC/local timezone shift. */
function formatEntryDateLabel(entryDate: string | undefined): string {
  if (!entryDate) return 'tonight'
  const [y, m, d] = entryDate.split('-').map(Number)
  if (!y || !m || !d) return entryDate
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
}

const COMPOSE_SLOW_MS = 8_000
const COMPOSE_TIMEOUT_MS = 20_000

export default function TonightPage() {
  const { profile, baby, loading: contextLoading } = useBabyProfile()

  // Only supplied once we know who the parent is — while it is null the hook
  // treats Letters as not-disabled rather than gating on a not-yet-loaded id.
  // REQUEST (FE10 / settings): the per-user `letters_settings.nightly_enabled`
  // layer of the flag (contract §4) is intentionally left `null` (unknown)
  // here rather than fetched by this page, per "no direct Supabase calls, no
  // fetch calls of your own" — the contract's own default for a missing row
  // is "no restriction beyond env+rollout" (`null !== false`), and the
  // per-user opt-out is enforced server-side by the API routes regardless
  // ("Routes gate independently server-side" — hooks/useLettersSession.ts).
  const flagContext: LettersFlagContext | null = profile?.id
    ? { profileId: profile.id, userEnabled: null }
    : null

  const session = useLettersSession({ babyId: baby?.id ?? null, flagContext })

  const shapedComposeAvailable = flagContext ? isSubFlagEnabled('shaped_compose', flagContext) : false

  // Every hook below runs unconditionally, on every render, in the same order
  // — React's Rules of Hooks. The flag-gate and loading/no-baby early exits
  // happen strictly after, never before, a hook call.
  const headingRef = useRef<HTMLHeadingElement>(null)
  const [announcement, setAnnouncement] = useState('')
  const [typedMode, setTypedMode] = useState(false)
  const [typedText, setTypedText] = useState('')
  const [composePhase, setComposePhase] = useState<'composing' | 'slow' | 'timeout'>('composing')
  const [composeDismissed, setComposeDismissed] = useState(false)
  // FollowUpQuestionCard (FE3) renders one question at a time (its own
  // index/total props say so) but the hook's `activeFollowUpIndex` only ever
  // advances from `skipFollowUp` — `answerFollowUp` does not move it (see
  // hooks/useLettersSession.ts). REQUEST (FE10): expose an explicit advance,
  // or have `answerFollowUp` advance like `skipFollowUp` does. Until then this
  // page tracks its own pointer and calls `finishFollowUps()` once it runs out.
  const [followUpIdx, setFollowUpIdx] = useState(0)
  // FollowUpQuestionCard has no built-in "stop recording" control — it only
  // exposes `onAnswerVoice` (start) and an `isListening` display prop, per its
  // own module doc ("capture itself happens outside this component"). This
  // page supplies the explicit stop tap the product principle requires
  // ("only an explicit tap ends capture" — never on silence).
  const [voiceAnsweringIndex, setVoiceAnsweringIndex] = useState<number | null>(null)
  const prevStateRef = useRef(session.state)
  const armedRef = useRef(false)

  // "The mic is warmed on screen entry, in ARMED state — not on tap." For a
  // web build there is no pre-tap microphone stream to open (getUserMedia
  // requires a user gesture) — what CAN be front-loaded on entry is
  // everything else the tap would otherwise wait on: today's opening prompt,
  // follow-up context, voice profile, name corrections. `arm()` does that.
  // REQUEST (FE10): if a true pre-tap mic warm becomes possible, it belongs
  // inside `startListening`/`useVoiceCapture`, not this page.
  useEffect(() => {
    if (baby?.id && session.state === 'idle' && !armedRef.current) {
      armedRef.current = true
      void session.arm()
    }
    // `session` is a fresh object every render (the hook does not memoize its
    // return value), so this effect body runs on every render regardless —
    // the `armedRef` guard, not the dependency array, is what makes `arm()`
    // fire exactly once. Depending on the whole object (rather than
    // `session.state`/`session.arm`) satisfies exhaustive-deps without lying
    // about which fields actually matter.
  }, [baby?.id, session])

  // Focus the active section's heading on every state transition — the only
  // reliable way a screen-reader user tracks an eyes-free, multi-stage flow.
  useEffect(() => {
    headingRef.current?.focus()
  }, [session.state])

  // VoiceOver announcements for transitions ListeningAura does not already
  // announce itself (it owns its own start/stop/silence announcements).
  useEffect(() => {
    if (prevStateRef.current === session.state) return
    prevStateRef.current = session.state

    if (session.state === 'review') {
      setAnnouncement(VOICEOVER_COPY.onTranscriptReady)
    } else if (session.state === 'failed') {
      // Closest fixed string available for "the save could not complete, but
      // nothing is lost" — see the module comment on VOICEOVER_COPY.
      setAnnouncement(VOICEOVER_COPY.onTranscriptionFailure)
    } else if (session.state === 'saved') {
      setAnnouncement(buildVoiceOverSaveAnnouncement(formatEntryDateLabel(session.draft.entryDate)))
    }
  }, [session.state, session.draft.entryDate])

  // Compose progression is a visual-only 8s/20s caption schedule the real
  // hook does not model (`composeStatus` is a plain idle/composing/done/failed
  // enum — see hooks/useLettersSession.ts `compose()`). REQUEST (FE10): if
  // compose() grows a client-side timeout, this local timer becomes
  // redundant and should be removed in favour of a hook-provided phase.
  useEffect(() => {
    if (session.composeStatus !== 'composing') {
      setComposePhase('composing')
      return
    }
    setComposeDismissed(false)
    setComposePhase('composing')
    const slow = setTimeout(() => setComposePhase('slow'), COMPOSE_SLOW_MS)
    const timeout = setTimeout(() => setComposePhase('timeout'), COMPOSE_TIMEOUT_MS)
    return () => {
      clearTimeout(slow)
      clearTimeout(timeout)
    }
  }, [session.composeStatus])

  // Fresh pointer every time the flow enters follow-ups.
  useEffect(() => {
    if (session.state === 'followup') {
      setFollowUpIdx(0)
      setVoiceAnsweringIndex(null)
    }
  }, [session.state])

  const typedPlaceholder = useMemo(
    () => buildTypedEntryPlaceholder(baby?.name ?? null),
    [baby?.name]
  )

  const knownNames = useMemo(() => {
    const names = new Set<string>()
    if (baby?.name) names.add(baby.name)
    const vp = session.session?.voiceProfile
    if (vp?.partner_name_for_child) names.add(vp.partner_name_for_child)
    if (vp?.self_name_for_child) names.add(vp.self_name_for_child)
    for (const c of session.session?.nameCorrections ?? []) names.add(c.correct)
    return Array.from(names)
  }, [baby?.name, session.session])

  const openingLine =
    session.session?.openingPrompt?.text ??
    (baby?.name
      ? TYPED_ENTRY_COPY.placeholderWithName.replaceAll('{name}', baby.name)
      : TYPED_ENTRY_COPY.placeholderNoName)

  // Flag-gated: this route does not exist when Letters is disabled for this user.
  if (session.disabled) {
    notFound()
  }

  if (contextLoading || session.state === 'idle' || session.state === 'loading') {
    return <div style={{ minHeight: '100%', background: 'var(--color-surface)' }} aria-busy="true" aria-label="Loading tonight" />
  }

  if (!baby) {
    return (
      <div style={{ minHeight: '100%', background: 'var(--color-surface)' }}>
        <div className="content-width mx-auto px-4 pt-6">
          <h1 ref={headingRef} tabIndex={-1} className="text-h1" style={{ color: 'var(--color-slate)' }}>
            Add your baby&rsquo;s profile first
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-muted)', marginTop: '8px' }}>
            Tonight&rsquo;s letter needs a baby profile to write to.
          </p>
          <Link href="/onboarding" className="btn-primary" style={{ display: 'inline-flex', marginTop: '16px' }}>
            Set up profile
          </Link>
        </div>
      </div>
    )
  }

  const handleAuraTap = () => {
    if (session.state === 'listening') {
      void session.stopListening()
    } else if (session.state === 'armed') {
      void session.startListening().then((started) => {
        // Mic blocked/unsupported: never leave the parent stranded on a dead
        // tap target — offer the co-equal typed path (PRD §15.4).
        if (!started) setTypedMode(true)
      })
    }
  }

  const advanceFollowUp = () => {
    setVoiceAnsweringIndex(null)
    setFollowUpIdx((i) => {
      const next = i + 1
      if (next >= session.followUps.length) void session.finishFollowUps()
      return next
    })
  }

  const handleFollowUpSkip = (index: number) => {
    session.skipFollowUp(index)
    advanceFollowUp()
  }

  const handleFollowUpAnswerText = (index: number, answer: string) => {
    session.answerFollowUp(index, answer)
    advanceFollowUp()
  }

  const handleFollowUpAnswerVoiceStart = (index: number) => {
    void session.voice.start().then((started) => {
      if (started) setVoiceAnsweringIndex(index)
    })
  }

  const handleFollowUpAnswerVoiceStop = async (index: number) => {
    const result = await session.voice.stop()
    session.answerFollowUp(index, result.transcript)
    advanceFollowUp()
  }

  const handleDiscard = () => {
    session.reset()
    setTypedMode(false)
    setTypedText('')
  }

  const showFullBleedAura =
    (session.state === 'armed' && !typedMode) || session.state === 'listening' || session.state === 'closed'

  return (
    <>
      <div aria-live="assertive" className="sr-only">
        {announcement}
      </div>

      {showFullBleedAura && (
        <div style={{ position: 'relative' }}>
          <h1 ref={headingRef} tabIndex={-1} className="sr-only">
            {session.state === 'listening' ? 'Listening' : session.state === 'closed' ? 'Saved' : "Tonight's letter"}
          </h1>

          <ListeningAura
            amplitude={session.voice.amplitude}
            state={session.state === 'listening' ? 'listening' : session.state === 'closed' ? 'processing' : 'idle'}
            onStop={handleAuraTap}
          />

          {/* Escape hatches — always visible while armed, never gated behind
              speaking, co-equal in size/weight to the mic (PRD §15.4). Overlaid
              because ListeningAura is itself a full-viewport surface it owns. */}
          {session.state === 'armed' && (
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 'max(24px, env(safe-area-inset-bottom))',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                padding: '0 24px',
              }}
            >
              <p style={{ fontSize: '13px', color: 'rgba(250,250,248,0.55)', textAlign: 'center', maxWidth: '320px' }}>
                {openingLine}
              </p>
              <button
                type="button"
                onClick={() => setTypedMode(true)}
                aria-label={MODALITY_CHOICE_COPY.typeActionA11yHint}
                style={{
                  width: '100%',
                  maxWidth: '320px',
                  minHeight: '52px',
                  borderRadius: '14px',
                  border: '1px solid rgba(250,250,248,0.24)',
                  background: 'rgba(250,250,248,0.05)',
                  color: '#FAFAF8',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {MODALITY_CHOICE_COPY.typeActionLabel}
              </button>
              <button
                type="button"
                onClick={() => void session.notMuchToday()}
                aria-label={NOT_MUCH_TODAY_A11Y_HINT}
                style={{
                  minHeight: '44px',
                  background: 'none',
                  border: 'none',
                  color: 'rgba(250,250,248,0.6)',
                  fontSize: '15px',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                }}
              >
                {NOT_MUCH_TODAY_BUTTON_LABEL}
              </button>
            </div>
          )}
        </div>
      )}

      {!showFullBleedAura && (
        <div style={{ minHeight: '100%', background: 'var(--color-surface)' }}>
          <div className="content-width mx-auto px-4 pt-6 pb-10">
            {/* ── ARMED, typed path — co-equal, not a fallback ── */}
            {session.state === 'armed' && typedMode && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '70vh' }}>
                <h1 ref={headingRef} tabIndex={-1} className="text-h1" style={{ color: 'var(--color-slate)' }}>
                  Write tonight&rsquo;s letter
                </h1>
                {session.voice.error && (
                  <p style={{ fontSize: '13px', color: 'var(--color-red)' }}>{session.voice.error.message}</p>
                )}
                <textarea
                  value={typedText}
                  onChange={(e) => setTypedText(e.target.value)}
                  placeholder={typedPlaceholder}
                  autoFocus
                  style={{
                    flex: 1,
                    minHeight: '240px',
                    background: 'var(--color-white)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '16px',
                    color: 'var(--color-slate)',
                    fontSize: '16px',
                    lineHeight: 1.75,
                    resize: 'none',
                    outline: 'none',
                  }}
                />
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" onClick={() => setTypedMode(false)} className="btn-ghost">
                    {MODALITY_CHOICE_COPY.speakActionLabel}
                  </button>
                  <button
                    type="button"
                    onClick={() => void session.submitTyped(typedText)}
                    disabled={!typedText.trim()}
                    className="btn-primary"
                  >
                    Done
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => void session.notMuchToday()}
                  aria-label={NOT_MUCH_TODAY_A11Y_HINT}
                  style={{ background: 'none', border: 'none', color: 'var(--color-muted)', fontSize: '15px', textDecoration: 'underline', cursor: 'pointer', padding: '12px 0', alignSelf: 'flex-start' }}
                >
                  {NOT_MUCH_TODAY_BUTTON_LABEL}
                </button>
              </div>
            )}

            {/* ── FOLLOW_UP — one at a time (FollowUpQuestionCard's own
                index/total props say so); this page tracks which one is
                active since the hook does not advance past an answer. ── */}
            {session.state === 'followup' && session.followUps[followUpIdx] && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '50vh', justifyContent: 'center' }}>
                <h1 ref={headingRef} tabIndex={-1} className="sr-only">
                  A quick follow-up
                </h1>
                <FollowUpQuestionCard
                  key={followUpIdx}
                  question={session.followUps[followUpIdx].question}
                  index={followUpIdx}
                  total={session.followUps.length}
                  isListening={voiceAnsweringIndex === followUpIdx}
                  onAnswerVoice={() => handleFollowUpAnswerVoiceStart(followUpIdx)}
                  onAnswerText={(answer) => handleFollowUpAnswerText(followUpIdx, answer)}
                  onSkip={() => handleFollowUpSkip(followUpIdx)}
                />
                {/* The card has no built-in stop control while isListening —
                    only an explicit tap may end capture (never silence). */}
                {voiceAnsweringIndex === followUpIdx && (
                  <button
                    type="button"
                    onClick={() => void handleFollowUpAnswerVoiceStop(followUpIdx)}
                    className="btn-primary"
                    style={{ maxWidth: '200px', margin: '0 auto' }}
                  >
                    Done
                  </button>
                )}
              </div>
            )}

            {/* ── REVIEW — TranscriptEditor owns its own heading, Save and
                Discard controls and copy; this page only wires callbacks. ── */}
            {session.state === 'review' && (
              <>
                <h1 ref={headingRef} tabIndex={-1} className="sr-only">
                  Review tonight&rsquo;s entry
                </h1>
                <TranscriptEditor
                  transcript={session.transcript}
                  onChange={session.updateTranscript}
                  onDraftChange={() => {}}
                  knownNames={knownNames}
                  onLearnName={(_correction: NameCorrection) => {
                    // REQUEST (FE10): the hook has no action yet to persist a
                    // learned name correction (no `learnName` in
                    // UseLettersSessionResult). Wired to a no-op so the UI does
                    // not silently drop the confirmation once one exists.
                  }}
                  onSave={() => void session.finishReview()}
                  onDiscard={handleDiscard}
                />
              </>
            )}

            {/* ── failed — the transcript PERSIST failed after retries. The
                draft text is still here; nothing is lost. ── */}
            {session.state === 'failed' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '50vh', justifyContent: 'center' }}>
                <h1 ref={headingRef} tabIndex={-1} className="text-h1" style={{ color: 'var(--color-slate)' }}>
                  {COMPOSE_FAILURE_COPY.heading}
                </h1>
                <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--color-muted)' }}>
                  {session.error ?? COMPOSE_FAILURE_COPY.body}
                </p>
                {session.draft.text && (
                  <blockquote
                    className="lumira-card"
                    style={{ fontStyle: 'italic', whiteSpace: 'pre-wrap', color: 'var(--color-slate)' }}
                  >
                    {session.draft.text}
                  </blockquote>
                )}
                <button type="button" onClick={() => void session.retrySave()} className="btn-primary">
                  {COMPOSE_FAILURE_COPY.tryAgainLabel}
                </button>
              </div>
            )}

            {/* ── composing — a post-save action (PRD/model-change: composition
                never gates the night); full-screen wait either way it was
                entered. ── */}
            {session.state === 'composing' && (
              <>
                <h1 ref={headingRef} tabIndex={-1} className="sr-only">
                  Finding the words
                </h1>
                <ComposingState
                  phase={composePhase}
                  transcript={session.transcript}
                  onRetry={() => void session.compose('shaped')}
                  onSaveRaw={() => setComposeDismissed(true)}
                />
              </>
            )}

            {/* ── saved — the night is complete. Composing is a quiet, skip-
                costs-nothing offer from here, never a gate. ── */}
            {session.state === 'saved' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '60vh', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                <h1 ref={headingRef} tabIndex={-1} className="text-h1" style={{ color: 'var(--color-slate)' }}>
                  Saved for {formatEntryDateLabel(session.draft.entryDate)}
                </h1>
                <p style={{ fontSize: '15px', color: 'var(--color-muted)', maxWidth: '320px' }}>
                  Tonight is in the book. That&rsquo;s the whole job, done.
                </p>

                {session.composeStatus === 'failed' && !composeDismissed && (
                  <ComposingState
                    phase="failed"
                    transcript={session.transcript}
                    onRetry={() => void session.compose('shaped')}
                    onSaveRaw={() => setComposeDismissed(true)}
                  />
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', marginTop: '8px' }}>
                  <Link href="/journal" className="btn-primary" style={{ display: 'inline-flex' }}>
                    Done
                  </Link>
                  {/* Quiet suggestion only — never a gate, skipping costs
                      nothing. Composing here reshapes THIS log's text
                      (compose_mode), not a separate "letter" entry — see the
                      model-change doc; a distinct letter-composition entry
                      point belongs to FE8/BE10 and is out of this lane. */}
                  {shapedComposeAvailable && session.composeStatus !== 'done' && session.draft.entryId && (
                    <button type="button" onClick={() => void session.compose('shaped')} className="btn-ghost">
                      Shape it for me
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

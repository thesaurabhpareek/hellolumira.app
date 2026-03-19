/**
 * @module CheckinThread
 * @description Conversational daily check-in UI. Renders the message thread,
 *   structured field chips for quick data entry, and handles the check-in
 *   completion flow with auto-scroll and typing indicators.
 * @version 1.0.0
 * @since March 2026
 */
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import LumiraTyping from './LumiraTyping'
import StructuredFieldChips from './StructuredFieldChips'
import WellbeingPrompt from './WellbeingPrompt'
import type { Profile, BabyProfile, DailyCheckin, ConversationMessage, StructuredField, EmotionalSignal } from '@/types/app'

interface Props {
  profile: Profile
  baby: BabyProfile
  existingCheckin: DailyCheckin | null
  prefill?: { field: string; value: string } | null
}

interface LumiraMessage {
  role: 'lumira'
  content: string
  timestamp: string
  structured_fields?: StructuredField[] | null
  checkin_complete?: boolean
}

interface ParentMessage {
  role: 'parent'
  content: string
  timestamp: string
}

type Message = LumiraMessage | ParentMessage

const PREGNANCY_INTRO = `Hi there! I'm Lumira — I'm here to check in with you every day, answer questions, and gently flag anything worth keeping an eye on.

How are you feeling today? Any nausea, energy shifts, or anything else on your mind?`

const INFANT_INTRO = `Hi! I'm Lumira — I'm here to check in with you every day, help you spot patterns, and work through any concerns together.

How did things go last night? How's your little one doing today?`

export default function CheckinThread({ profile, baby, existingCheckin, prefill }: Props) {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [_isComplete, setIsComplete] = useState(false)
  const [pendingFields, setPendingFields] = useState<StructuredField[] | null>(null)
  const [emotionalSignal, setEmotionalSignal] = useState<EmotionalSignal | null>(
    profile.emotional_state_latest
  )
  const [showWellbeing, setShowWellbeing] = useState(false)
  const [conversationLog, setConversationLog] = useState<ConversationMessage[]>(
    existingCheckin?.conversation_log || []
  )
  const [prefillToast, setPrefillToast] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputBarRef = useRef<HTMLDivElement>(null)
  const initialized = useRef(false)
  const prefillApplied = useRef(false)

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const sendToAPI = useCallback(
    async (userMessage: string, isOpening: boolean) => {
      setIsLoading(true)

      const attempt = async () => {
        const res = await fetch('/api/checkin-conversation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            baby_id: baby.id,
            profile_id: profile.id,
            stage: baby.stage,
            message: userMessage,
            is_opening: isOpening,
            conversation_so_far: conversationLog,
          }),
        })
        if (!res.ok) throw new Error('API error')
        return res.json()
      }

      try {
        let data
        try {
          data = await attempt()
        } catch {
          await new Promise((r) => setTimeout(r, 1000))
          data = await attempt()
        }

        const now = new Date().toISOString()
        const lumiraMsg: LumiraMessage = {
          role: 'lumira',
          content: data.message,
          timestamp: now,
          structured_fields: data.structured_fields || null,
          checkin_complete: data.checkin_complete || false,
        }

        setMessages((prev) => [...prev, lumiraMsg])
        setConversationLog(data.conversation_log || [])

        if (data.structured_fields?.length > 0) {
          setPendingFields(data.structured_fields)
        }

        if (data.checkin_complete) {
          setIsComplete(true)
        }

        if (data.emotional_signal === 'distressed') {
          setShowWellbeing(true)
        }
        setEmotionalSignal(data.emotional_signal)

        // Fire and forget pattern detection
        fetch('/api/detect-patterns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            baby_id: baby.id,
            profile_id: profile.id,
            stage: baby.stage,
          }),
        }).catch(() => {})
      } catch {
        const errorMsg: LumiraMessage = {
          role: 'lumira',
          content: "Something went wrong on my end — sorry about that. Feel free to try again.",
          timestamp: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, errorMsg])
      } finally {
        setIsLoading(false)
        setTimeout(scrollToBottom, 100)
      }
    },
    [baby, profile, conversationLog, scrollToBottom]
  )

  // Initialize conversation on mount
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    if (!profile.first_checkin_complete) {
      // First ever checkin — show hardcoded intro
      const introText = baby.stage === 'pregnancy' ? PREGNANCY_INTRO : INFANT_INTRO
      const introMsg: LumiraMessage = {
        role: 'lumira',
        content: introText,
        timestamp: new Date().toISOString(),
      }
      setMessages([introMsg])
    } else if (existingCheckin?.conversation_log && existingCheckin.conversation_log.length > 0) {
      // Restore existing conversation
      const restored: Message[] = existingCheckin.conversation_log.map((m) => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
      }))
      setMessages(restored)
      setIsComplete(true)
    } else {
      // Get adaptive opener from API
      sendToAPI('', true)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Handle email prefill — auto-submit the prefilled field value
  useEffect(() => {
    if (!prefill || prefillApplied.current) return
    prefillApplied.current = true

    const PREFILL_LABELS: Record<string, Record<string, string>> = {
      sleep_quality: {
        poor: 'Got it \u2014 sleep was rough last night',
        ok: 'Got it \u2014 sleep was okay last night',
        good: 'Got it \u2014 sleep went well last night',
      },
    }

    const toastMsg = PREFILL_LABELS[prefill.field]?.[prefill.value] || `Got it \u2014 ${prefill.field}: ${prefill.value}`
    setPrefillToast(toastMsg)

    // Auto-dismiss toast after 4 seconds
    const timer = setTimeout(() => setPrefillToast(null), 4000)

    // Submit the prefill as a field selection via the API
    fetch('/api/checkin-conversation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        baby_id: baby.id,
        profile_id: profile.id,
        stage: baby.stage,
        message: `${prefill.field}: ${prefill.value}`,
        is_opening: false,
        conversation_so_far: [],
      }),
    }).catch(() => {})

    return () => clearTimeout(timer)
  }, [prefill, baby.id, baby.stage, profile.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Handle virtual keyboard on mobile — adjust input bar position
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return

    const onResize = () => {
      if (!inputBarRef.current) return
      const keyboardOffset = window.innerHeight - vv.height - vv.offsetTop
      if (keyboardOffset > 0) {
        // Keyboard is open — position just above it (nav bar is hidden behind keyboard)
        inputBarRef.current.style.bottom = `${keyboardOffset}px`
      } else {
        // Keyboard closed — position above the bottom nav bar
        inputBarRef.current.style.bottom = ''
      }
      scrollToBottom()
    }

    vv.addEventListener('resize', onResize)
    vv.addEventListener('scroll', onResize)
    return () => {
      vv.removeEventListener('resize', onResize)
      vv.removeEventListener('scroll', onResize)
    }
  }, [scrollToBottom])

  const handleSend = async () => {
    const text = inputValue.trim()
    if (!text || isLoading) return

    const parentMsg: ParentMessage = {
      role: 'parent',
      content: text,
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, parentMsg])
    setInputValue('')
    setPendingFields(null)

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    await sendToAPI(text, false)
  }

  const handleFieldSelect = async (fieldId: string, value: string) => {
    // Update daily checkin with structured field
    const fieldMap: Record<string, string> = {
      sleep_quality: 'sleep_quality',
      feeding: 'feeding',
      mood: 'mood',
      diapers: 'diapers',
      nausea_level: 'nausea_level',
      energy_level: 'energy_level',
    }

    if (fieldMap[fieldId]) {
      try {
        await fetch('/api/checkin-conversation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            baby_id: baby.id,
            profile_id: profile.id,
            stage: baby.stage,
            message: `${fieldId}: ${value}`,
            is_opening: false,
            conversation_so_far: conversationLog,
          }),
        })
      } catch {
        // Non-fatal
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
    // Auto-grow textarea
    const ta = e.currentTarget
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 96)}px`
  }

  void emotionalSignal
  void _isComplete

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--color-surface)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Prefill toast from email link */}
      {prefillToast && (
        <div
          className="animate-fade-in"
          style={{
            position: 'fixed',
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--color-primary)',
            color: '#ffffff',
            padding: '10px 20px',
            borderRadius: 'var(--radius-md)',
            fontSize: '14px',
            fontWeight: 600,
            zIndex: 100,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            maxWidth: '90vw',
            textAlign: 'center',
          }}
        >
          {prefillToast}
        </div>
      )}

      {/* Wellbeing overlay */}
      {showWellbeing && (
        <WellbeingPrompt onDismiss={() => setShowWellbeing(false)} />
      )}

      {/* Messages area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch',
          padding: '16px',
          paddingBottom: 'calc(120px + 56px + max(0px, env(safe-area-inset-bottom)))',
        }}
      >
        <div className="content-width mx-auto">
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '24px',
              padding: '12px 0',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <button
              onClick={() => router.push('/home')}
              aria-label="Back to home"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-muted)',
                fontSize: '22px',
                padding: '4px',
                minHeight: '48px',
                minWidth: '48px',
                display: 'flex',
                alignItems: 'center',
                touchAction: 'manipulation',
              }}
            >
              ←
            </button>
            <div>
              <p style={{ fontWeight: 700, color: 'var(--color-slate)', fontSize: '16px' }}>
                Daily check-in
              </p>
              <p style={{ fontSize: '13px', color: 'var(--color-muted)' }}>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Message bubbles */}
          <div role="log" aria-label="Check-in conversation" aria-live="polite">
          {messages.map((msg, i) => {
            if (msg.role === 'lumira') {
              const lumiraMsg = msg as LumiraMessage
              return (
                <div key={i} className="animate-fade-in" style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                    {/* Avatar */}
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <span style={{ color: 'white', fontSize: '11px', fontWeight: 700 }}>L</span>
                    </div>

                    <div className="bubble-lumira">
                      <p style={{ fontSize: '15px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                        {lumiraMsg.content}
                      </p>
                    </div>
                  </div>

                  {/* Structured fields appear below last Lumira message */}
                  {i === messages.length - 1 && pendingFields && pendingFields.length > 0 && (
                    <div style={{ marginLeft: '36px', marginTop: '12px' }}>
                      <StructuredFieldChips
                        fields={pendingFields}
                        onSelect={handleFieldSelect}
                      />
                    </div>
                  )}

                  {/* Complete indicator */}
                  {lumiraMsg.checkin_complete && i === messages.length - 1 && (
                    <div
                      style={{
                        marginLeft: '36px',
                        marginTop: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '12px',
                          color: 'var(--color-green)',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        ✓ Check-in logged — you can keep chatting
                      </span>
                    </div>
                  )}
                </div>
              )
            }

            // Parent message
            return (
              <div
                key={i}
                className="animate-fade-in"
                style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}
              >
                <div className="bubble-parent">
                  <p style={{ fontSize: '15px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {msg.content}
                  </p>
                </div>
              </div>
            )
          })}

          </div>

          {/* Typing indicator */}
          {isLoading && <LumiraTyping />}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input bar */}
      <div
        ref={inputBarRef}
        style={{
          position: 'fixed',
          bottom: 'calc(56px + max(0px, env(safe-area-inset-bottom)))',
          left: 0,
          right: 0,
          background: 'var(--color-white)',
          borderTop: '1px solid var(--color-border)',
          padding: '12px 16px',
          paddingBottom: '12px',
          zIndex: 50,
          transition: 'bottom 0.1s ease',
        }}
      >
        <div
          className="content-width mx-auto"
          style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}
        >
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            disabled={isLoading}
            enterKeyHint="send"
            autoComplete="off"
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--color-border)',
              fontSize: '16px',
              lineHeight: 1.5,
              resize: 'none',
              outline: 'none',
              minHeight: '48px',
              maxHeight: '96px',
              fontFamily: 'inherit',
              color: 'var(--color-slate)',
              background: isLoading ? 'var(--color-surface)' : 'var(--color-white)',
              transition: 'border-color 0.15s ease',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)' }}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            aria-label="Send message"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              background: !inputValue.trim() || isLoading
                ? 'var(--color-border)'
                : 'var(--color-primary)',
              border: 'none',
              cursor: !inputValue.trim() || isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'background 0.15s ease',
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * @module CheckinThread
 * @description Conversational daily check-in UI. Renders the message thread,
 *   structured field chips for quick data entry, and handles the check-in
 *   completion flow with auto-scroll and typing indicators.
 * @version 1.0.0
 * @since March 2026
 */
'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import LumiraTyping from './LumiraTyping'
import { LumiraAvatar } from './LumiraAvatar'
import StructuredFieldChips from './StructuredFieldChips'
import WellbeingPrompt from './WellbeingPrompt'
import type { Profile, BabyProfile, DailyCheckin, ConversationMessage, StructuredField, EmotionalSignal } from '@/types/app'
import { pickFollowUpQuestion } from '@/lib/checkin-openers'

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

const PREGNANCY_INTROS = [
  `Hi there! I'm Lumira — I'm here to check in with you every day, answer questions, and gently flag anything worth keeping an eye on.\n\nHow are you feeling today? Any nausea, energy shifts, or anything else on your mind?`,
  `Hey! I'm Lumira, your daily parenting companion. I'm here to listen, help you track how things are going, and share anything useful for this stage of pregnancy.\n\nWhat's on your mind today?`,
  `Welcome! I'm Lumira — think of me as a warm, knowledgeable friend who checks in every day. No judgement, just support.\n\nHow's your body feeling right now? Anything new or different?`,
]

const INFANT_INTROS = [
  `Hi! I'm Lumira — I'm here to check in with you every day, help you spot patterns, and work through any concerns together.\n\nHow did things go last night? How's your little one doing today?`,
  `Hey there! I'm Lumira, your daily parenting companion. I'll help you track patterns, answer questions, and flag anything worth knowing.\n\nHow are things going — how's baby doing today?`,
  `Welcome! I'm Lumira. Every day I'll check in, help you notice patterns, and be here when you need to think something through.\n\nHow are you holding up? Tell me about your last 24 hours.`,
]

const TODDLER_INTROS = [
  `Hi! I'm Lumira — I'm here to check in every day, help you notice what's working, and be here when things get tricky.\n\nHow's your toddler doing today? Anything new or different?`,
  `Hey there! I'm Lumira, your daily parenting companion. Toddler life is an adventure — I'm here to help you navigate it.\n\nHow are things going? Any wins or challenges today?`,
  `Welcome! I'm Lumira. Every day I'll check in and help you spot patterns, celebrate milestones, and think through the tough bits.\n\nHow's your little explorer doing today?`,
]

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
      // First ever checkin — pick from varied intros
      const intros = baby.stage === 'pregnancy' ? PREGNANCY_INTROS : baby.stage === 'toddler' ? TODDLER_INTROS : INFANT_INTROS
      const introIndex = new Date().getHours() % intros.length
      const introMsg: LumiraMessage = {
        role: 'lumira',
        content: intros[introIndex],
        timestamp: new Date().toISOString(),
      }
      setMessages([introMsg])
    } else if (existingCheckin?.conversation_log && existingCheckin.conversation_log.length > 0) {
      // Restore existing conversation + add a fresh follow-up question
      const restored: Message[] = existingCheckin.conversation_log.map((m) => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
      }))

      // Pick a personalised follow-up question to keep the conversation going
      const mappedStage = (baby.stage === 'postpartum' ? 'infant' : baby.stage) as 'pregnancy' | 'infant' | 'toddler'
      const followUp = pickFollowUpQuestion(mappedStage)
      const followUpMsg: LumiraMessage = {
        role: 'lumira',
        content: `Welcome back! Your check-in is already logged for today.\n\nWhile you are here — ${followUp.charAt(0).toLowerCase() + followUp.slice(1)}`,
        timestamp: new Date().toISOString(),
      }
      setMessages([...restored, followUpMsg])
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
        poor: 'Got it — sleep was rough last night',
        ok: 'Got it — sleep was okay last night',
        good: 'Got it — sleep went well last night',
      },
    }

    const toastMsg = PREFILL_LABELS[prefill.field]?.[prefill.value] || `Got it — ${prefill.field}: ${prefill.value}`
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
    // Show the user's selection as a visible message
    const parentMsg: ParentMessage = {
      role: 'parent',
      content: `${fieldId.replace(/_/g, ' ')}: ${value}`,
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, parentMsg])
    setPendingFields(null)

    // Send to API and display Lumira's response
    await sendToAPI(`${fieldId}: ${value}`, false)
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
      className="flex flex-col"
      style={{ minHeight: '100dvh', background: 'var(--color-surface)' }}
    >
      {/* Prefill toast from email link */}
      {prefillToast && (
        <div
          className="animate-fade-in fixed top-4 left-1/2 bg-primary text-white rounded-md text-sm font-semibold z-[100] text-center max-w-[90vw]"
          style={{
            transform: 'translateX(-50%)',
            padding: '10px 20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
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
        className="flex-1 overflow-y-auto overflow-x-hidden p-4"
        style={{
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: 'calc(120px + 56px + max(0px, env(safe-area-inset-bottom)))',
        }}
      >
        <div className="content-width mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6 py-3 border-b border-border">
            <button
              onClick={() => router.push('/home')}
              aria-label="Back to home"
              className="bg-transparent border-none cursor-pointer text-primary text-sm font-semibold py-4 min-h-[48px] flex items-center gap-1"
              style={{ touchAction: 'manipulation' }}
            >
              &larr; Back
            </button>
            <div>
              <p className="font-bold text-foreground text-base">
                How are you?
              </p>
              <p className="text-[13px] text-muted-foreground">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Message bubbles */}
          <div role="log" aria-label="Daily check-in conversation" aria-live="polite">
          {messages.map((msg, i) => {
            if (msg.role === 'lumira') {
              const lumiraMsg = msg as LumiraMessage
              return (
                <div key={i} className="animate-fade-in mb-4">
                  <div className="flex items-end gap-2">
                    {/* Avatar */}
                    <div className="shrink-0">
                      <LumiraAvatar size={28} />
                    </div>

                    <div className="bubble-lumira">
                      <p className="text-[15px] leading-[1.6] whitespace-pre-wrap">
                        {lumiraMsg.content}
                      </p>
                    </div>
                  </div>

                  {/* Structured fields appear below last Lumira message */}
                  {i === messages.length - 1 && pendingFields && pendingFields.length > 0 && (
                    <div className="ml-9 mt-3">
                      <StructuredFieldChips
                        fields={pendingFields}
                        onSelect={handleFieldSelect}
                      />
                    </div>
                  )}

                  {/* Complete indicator */}
                  {lumiraMsg.checkin_complete && i === messages.length - 1 && (
                    <div className="ml-9 mt-3 flex items-center gap-[6px]">
                      <span className="text-[12px] text-status-green font-semibold flex items-center gap-1">
                        ✓ All logged — feel free to keep chatting
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
                className="animate-fade-in mb-4 flex justify-end"
              >
                <div className="bubble-parent">
                  <p className="text-[15px] leading-[1.6] whitespace-pre-wrap">
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
        className="fixed left-0 right-0 bg-white border-t border-border px-4 py-3 z-50 transition-[bottom] duration-100 ease-in-out"
        style={{
          bottom: 'calc(56px + max(0px, env(safe-area-inset-bottom)))',
        }}
      >
        <div className="content-width mx-auto flex gap-[10px] items-end">
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
            className="flex-1 rounded-md text-base leading-[1.5] resize-none outline-none min-h-[48px] max-h-[96px] text-foreground transition-[border-color] duration-150 ease-in-out"
            style={{
              padding: '12px 16px',
              border: '1.5px solid var(--color-border)',
              fontFamily: 'inherit',
              background: isLoading ? 'var(--color-surface)' : 'var(--color-white)',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)' }}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            aria-label="Send message"
            className="w-12 h-12 rounded-md border-none flex items-center justify-center shrink-0 transition-[background] duration-150 ease-in-out"
            style={{
              background: !inputValue.trim() || isLoading
                ? 'var(--color-border)'
                : 'var(--color-primary)',
              cursor: !inputValue.trim() || isLoading ? 'not-allowed' : 'pointer',
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

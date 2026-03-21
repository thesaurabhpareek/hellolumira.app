/**
 * @module ChatThreadView
 * @description Full conversation view for a single chat thread. Handles message
 *   rendering, input, auto-scroll, escalation banners, emergency overlays,
 *   and suggested prompt chips.
 * @version 1.0.0
 * @since March 2026
 */
'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useChatThread } from '@/hooks/useChatThread'
import LumiraTyping from '@/components/app/LumiraTyping'
import { LumiraAvatar } from '@/components/app/LumiraAvatar'
import WellbeingPrompt from '@/components/app/WellbeingPrompt'
import BabyContextCard from './BabyContextCard'
import EscalationBanner from './EscalationBanner'
import EmergencyOverlay from './EmergencyOverlay'
import SuggestedPromptsRow from './SuggestedPromptsRow'
import type { Profile, BabyProfile, BabyAgeInfo } from '@/types/app'
import type { ChatMessage, ChatThread, EscalationLevel } from '@/types/chat'
import type { ChatMsg } from '@/hooks/useChatThread'

interface Props {
  profile: Profile
  baby: BabyProfile
  ageInfo: BabyAgeInfo
  thread: ChatThread
  existingMessages: ChatMessage[]
}

export default function ChatThreadView({
  profile,
  baby,
  ageInfo,
  thread,
  existingMessages,
}: Props) {
  const router = useRouter()
  const [inputValue, setInputValue] = useState('')
  const [showWellbeing, setShowWellbeing] = useState(false)
  const [emergencyMessage, setEmergencyMessage] = useState<string | null>(null)
  const [emergencyActionUrl, setEmergencyActionUrl] = useState<string | null>(null)
  const [currentEscalation, setCurrentEscalation] = useState<EscalationLevel>(
    thread.highest_escalation_level as EscalationLevel
  )
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputBarRef = useRef<HTMLDivElement>(null)
  const initialized = useRef(false)

  // Convert existing DB messages to ChatMsg format
  const initialMsgs: ChatMsg[] = existingMessages.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
    timestamp: m.created_at,
    escalation: m.red_flag_detected
      ? {
          level: m.escalation_level as EscalationLevel,
          category: m.red_flag_pattern,
          immediateAction: null,
          actionUrl: null,
        }
      : null,
  }))

  const {
    messages,
    send,
    loading,
    escalation,
    emotionalSignal,
    suggestedPrompts,
  } = useChatThread(initialMsgs)

  const isNewThread = existingMessages.length === 0

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Check for initial message from sessionStorage (when created from suggested prompt)
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const storedMessage = sessionStorage.getItem(`chat_initial_${thread.id}`)
    if (storedMessage) {
      sessionStorage.removeItem(`chat_initial_${thread.id}`)
      send({
        baby_id: baby.id,
        profile_id: profile.id,
        thread_id: thread.id,
        message: storedMessage,
      })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll on new messages
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Handle escalation changes
  useEffect(() => {
    if (!escalation) return

    if (escalation.level === 'emergency') {
      // Find the emergency message
      const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant')
      setEmergencyMessage(lastAssistantMsg?.content || 'This needs immediate attention.')
      setEmergencyActionUrl(escalation.actionUrl)
      setCurrentEscalation('emergency')
    } else if (escalation.level === 'urgent' || escalation.level === 'call_doctor') {
      setCurrentEscalation(escalation.level)
    }
  }, [escalation, messages])

  // Handle distress signal
  useEffect(() => {
    if (emotionalSignal === 'distressed') {
      setShowWellbeing(true)
    }
  }, [emotionalSignal])

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
    if (!text || loading) return

    setInputValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    await send({
      baby_id: baby.id,
      profile_id: profile.id,
      thread_id: thread.id,
      message: text,
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
    const ta = e.currentTarget
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 96)}px`
  }

  const handlePromptSelect = (message: string) => {
    send({
      baby_id: baby.id,
      profile_id: profile.id,
      thread_id: thread.id,
      message,
    })
  }

  return (
    <div
      className="flex flex-col"
      style={{ minHeight: '100dvh', background: 'var(--color-surface)' }}
    >
      {/* Emergency overlay */}
      {emergencyMessage && (
        <EmergencyOverlay
          message={emergencyMessage}
          actionUrl={emergencyActionUrl}
          onAcknowledge={() => setEmergencyMessage(null)}
        />
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
          paddingBottom: 'calc(140px + 56px + max(0px, env(safe-area-inset-bottom)))',
        }}
      >
        <div className="content-width mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4 py-3 border-b border-border">
            <button
              onClick={() => router.push('/chat')}
              aria-label="Back to conversations"
              className="bg-transparent border-none cursor-pointer text-primary text-sm font-semibold py-4 min-h-[48px] flex items-center gap-1"
              style={{ touchAction: 'manipulation' }}
            >
              &larr; Back
            </button>
            <div className="flex-1">
              <p className="font-bold text-foreground text-base">
                {thread.title || 'Talk to Lumira'}
              </p>
              <p className="text-[13px] text-muted-foreground">
                {baby.stage === 'pregnancy'
                  ? `Week ${ageInfo.pregnancy_week || '?'}`
                  : (baby.name || 'Baby') + ' · ' + ageInfo.age_display_string}
              </p>
            </div>
          </div>

          {/* Baby context card (collapsible) */}
          <BabyContextCard baby={baby} ageInfo={ageInfo} />

          {/* Suggested prompts for new threads */}
          {isNewThread && messages.length === 0 && (
            <div className="mb-5">
              <SuggestedPromptsRow
                stage={baby.stage}
                babyAgeWeeks={ageInfo.age_in_weeks}
                pregnancyWeek={ageInfo.pregnancy_week}
                babyName={baby.name}
                onSelect={handlePromptSelect}
                layout="grid"
              />
            </div>
          )}

          {/* AI-generated suggested prompts (after first response) */}
          {suggestedPrompts && suggestedPrompts.length > 0 && messages.length <= 2 && (
            <div className="mb-4">
              <SuggestedPromptsRow
                stage={baby.stage}
                babyAgeWeeks={ageInfo.age_in_weeks}
                pregnancyWeek={ageInfo.pregnancy_week}
                babyName={baby.name}
                onSelect={handlePromptSelect}
                layout="scroll"
              />
            </div>
          )}

          {/* Escalation banner */}
          {currentEscalation !== 'none' && currentEscalation !== 'emergency' && (
            <EscalationBanner level={currentEscalation} />
          )}

          {/* Message bubbles */}
          <div role="log" aria-label="Chat messages" aria-live="polite">
          {messages.map((msg, i) => {
            if (msg.role === 'assistant') {
              return (
                <div key={i} className="animate-fade-in mb-4">
                  <div className="flex items-end gap-2">
                    {/* Lumira avatar */}
                    <div className="shrink-0">
                      <LumiraAvatar size={28} />
                    </div>

                    <div
                      className="bubble-lumira"
                      style={
                        msg.escalation?.level === 'emergency'
                          ? {
                              background: 'var(--color-red-light)',
                              borderColor: 'var(--color-red)',
                              borderLeftWidth: '3px',
                            }
                          : msg.escalation?.level === 'urgent'
                          ? {
                              background: 'var(--color-red-light)',
                              borderColor: '#FED7D7',
                              borderLeftWidth: '3px',
                              borderLeftColor: 'var(--color-red)',
                            }
                          : undefined
                      }
                    >
                      <div
                        className="text-[15px] leading-[1.6] whitespace-pre-wrap text-foreground"
                        dangerouslySetInnerHTML={{
                          __html: formatMarkdown(msg.content),
                        }}
                      />
                    </div>
                  </div>
                </div>
              )
            }

            // User message
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
          {loading && <LumiraTyping />}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Fixed bottom input */}
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
            placeholder="Ask Lumira anything..."
            rows={1}
            disabled={loading}
            enterKeyHint="send"
            autoComplete="off"
            className="flex-1 rounded-md text-base leading-[1.5] resize-none outline-none min-h-[48px] max-h-[96px] text-foreground transition-[border-color] duration-150 ease-in-out"
            style={{
              padding: '12px 16px',
              border: '1.5px solid var(--color-border)',
              fontFamily: 'inherit',
              background: loading ? 'var(--color-surface)' : 'var(--color-white)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-primary)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)'
            }}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || loading}
            aria-label="Send message"
            className="w-12 h-12 rounded-md border-none flex items-center justify-center shrink-0 transition-[background] duration-150 ease-in-out"
            style={{
              background:
                !inputValue.trim() || loading
                  ? 'var(--color-border)'
                  : 'var(--color-primary)',
              cursor: !inputValue.trim() || loading ? 'not-allowed' : 'pointer',
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

/**
 * Simple markdown formatter for Lumira responses.
 * Handles **bold**, headers, and line breaks.
 * Escapes HTML first to prevent XSS from any injected content.
 */
function formatMarkdown(text: string): string {
  // Escape HTML entities first to prevent XSS
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

  return escaped
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />')
}

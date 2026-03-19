/**
 * @module ChatThreadView
 * @description Full conversation view for a single chat thread. Handles message
 *   rendering, input, auto-scroll, escalation banners, emergency overlays,
 *   and suggested prompt chips.
 * @version 1.0.0
 * @since March 2026
 */
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useChatThread } from '@/hooks/useChatThread'
import LumiraTyping from '@/components/app/LumiraTyping'
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
      style={{
        minHeight: '100dvh',
        background: 'var(--color-surface)',
        display: 'flex',
        flexDirection: 'column',
      }}
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
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch',
          padding: '16px',
          paddingBottom: 'calc(140px + 56px + max(0px, env(safe-area-inset-bottom)))',
        }}
      >
        <div className="content-width mx-auto">
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px',
              padding: '12px 0',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <button
              onClick={() => router.push('/chat')}
              aria-label="Back to chat list"
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
              &#8592;
            </button>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, color: 'var(--color-slate)', fontSize: '16px' }}>
                {thread.title || 'Chat with Lumira'}
              </p>
              <p style={{ fontSize: '13px', color: 'var(--color-muted)' }}>
                {baby.stage === 'pregnancy'
                  ? `Week ${ageInfo.pregnancy_week || '?'}`
                  : (baby.name || 'Baby') + ' \u00B7 ' + ageInfo.age_display_string}
              </p>
            </div>
          </div>

          {/* Baby context card (collapsible) */}
          <BabyContextCard baby={baby} ageInfo={ageInfo} />

          {/* Suggested prompts for new threads */}
          {isNewThread && messages.length === 0 && (
            <div style={{ marginBottom: '20px' }}>
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
            <div style={{ marginBottom: '16px' }}>
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
                <div key={i} className="animate-fade-in" style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                    {/* Lumira avatar */}
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
                        style={{
                          fontSize: '15px',
                          lineHeight: 1.6,
                          whiteSpace: 'pre-wrap',
                          color: 'var(--color-slate)',
                        }}
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
          {loading && <LumiraTyping />}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Fixed bottom input */}
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
            placeholder="Ask Lumira anything..."
            rows={1}
            disabled={loading}
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
              background: loading ? 'var(--color-surface)' : 'var(--color-white)',
              transition: 'border-color 0.15s ease',
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
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              background:
                !inputValue.trim() || loading
                  ? 'var(--color-border)'
                  : 'var(--color-primary)',
              border: 'none',
              cursor: !inputValue.trim() || loading ? 'not-allowed' : 'pointer',
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

/**
 * @module useChatThread
 * @description React hook for managing chat thread state including messages,
 *   loading state, escalation levels, emotional signals, and suggested prompts.
 *   Uses a ref-based conversation history to maintain multi-turn context without
 *   causing re-renders. Includes a single automatic retry with 1s backoff on
 *   API failure.
 * @version 1.0.0
 * @since March 2026
 */

import { useState, useCallback, useRef } from 'react'
import type { EmotionalSignal } from '@/types/app'
import type { EscalationLevel, ConcernCategory } from '@/types/chat'

export interface ChatMsg {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  escalation?: {
    level: EscalationLevel
    category: string | null
    immediateAction: string | null
    actionUrl: string | null
  } | null
}

interface SendParams {
  baby_id: string
  profile_id: string
  thread_id: string
  message: string
}

interface UseChatThreadResult {
  messages: ChatMsg[]
  send: (params: SendParams) => Promise<void>
  loading: boolean
  error: string | null
  escalation: ChatMsg['escalation'] | null
  emotionalSignal: EmotionalSignal | null
  suggestedPrompts: string[] | null
  concernCategory: ConcernCategory | null
  setMessages: (msgs: ChatMsg[]) => void
}

/**
 * Manages a single chat thread's message history and related metadata.
 *
 * The `conversationHistory` ref stores the full user/assistant exchange
 * for multi-turn Claude calls without triggering re-renders. The `send`
 * callback is stable (no dependencies) so it can be safely passed to
 * child components without causing unnecessary re-renders.
 *
 * @param initialMessages - Optional seed messages (e.g. from a restored thread).
 * @returns Chat state and the `send` action.
 */
export function useChatThread(initialMessages: ChatMsg[] = []): UseChatThreadResult {
  const [messages, setMessages] = useState<ChatMsg[]>(initialMessages)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [escalation, setEscalation] = useState<ChatMsg['escalation'] | null>(null)
  const [emotionalSignal, setEmotionalSignal] = useState<EmotionalSignal | null>(null)
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[] | null>(null)
  const [concernCategory, setConcernCategory] = useState<ConcernCategory | null>(null)
  const conversationHistory = useRef<Array<{ role: 'user' | 'assistant'; content: string }>>([])

  const send = useCallback(async (params: SendParams) => {
    const { baby_id, profile_id, thread_id, message } = params

    // Add user message to UI immediately
    const userMsg: ChatMsg = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)
    setError(null)

    const attempt = async () => {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baby_id,
          profile_id,
          thread_id,
          message,
          conversation_history: conversationHistory.current,
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
        // One retry after 1 second
        await new Promise(r => setTimeout(r, 1000))
        data = await attempt()
      }

      // Update conversation history for multi-turn
      conversationHistory.current = [
        ...conversationHistory.current,
        { role: 'user', content: message },
        { role: 'assistant', content: data.message },
      ]

      const assistantMsg: ChatMsg = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toISOString(),
        escalation: data.escalation || null,
      }

      setMessages(prev => [...prev, assistantMsg])

      if (data.escalation) {
        setEscalation(data.escalation)
      }

      if (data.emotional_signal) {
        setEmotionalSignal(data.emotional_signal)
      }

      if (data.suggested_prompts) {
        setSuggestedPrompts(data.suggested_prompts)
      }

      if (data.concern_category) {
        setConcernCategory(data.concern_category)
      }
    } catch {
      setError("I'm having trouble connecting right now. Your conversation is saved — tap to try again.")
      const errorMsg: ChatMsg = {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Your conversation is saved — tap to try again.",
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    messages,
    send,
    loading,
    error,
    escalation,
    emotionalSignal,
    suggestedPrompts,
    concernCategory,
    setMessages,
  }
}

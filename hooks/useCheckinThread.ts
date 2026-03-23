/**
 * @module useCheckinThread
 * @description React hook for managing the conversational daily check-in flow.
 *   Tracks messages, structured field responses, and completion state. Includes
 *   a single automatic retry with 1s backoff on API failure.
 * @version 1.0.0
 * @since March 2026
 */

import { useState, useCallback } from 'react'
import type { ConversationMessage, StructuredField, Stage } from '@/types/app'

interface Message {
  role: 'lumira' | 'parent'
  content: string
  timestamp: string
  structured_fields?: StructuredField[] | null
  checkin_complete?: boolean
}

interface SendParams {
  baby_id: string
  profile_id: string
  stage: Stage
  message: string
  is_opening: boolean
}

interface UseCheckinThreadResult {
  messages: Message[]
  send: (params: SendParams) => Promise<void>
  loading: boolean
  structuredFields: StructuredField[] | null
  isComplete: boolean
  error: string | null
}

export function useCheckinThread(
  initialMessages: Message[] = []
): UseCheckinThreadResult {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [loading, setLoading] = useState(false)
  const [structuredFields, setStructuredFields] = useState<StructuredField[] | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversationLog, setConversationLog] = useState<ConversationMessage[]>([])

  const send = useCallback(async (params: SendParams) => {
    const { baby_id, profile_id, stage, message, is_opening } = params

    if (!is_opening && message.trim()) {
      const parentMsg: Message = {
        role: 'parent',
        content: message,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, parentMsg])
    }

    setLoading(true)
    setError(null)

    const attempt = async () => {
      const res = await fetch('/api/checkin-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baby_id,
          profile_id,
          stage,
          message,
          is_opening,
          conversation_so_far: conversationLog,
          // Send client's local hour so server uses correct time-of-day
          // instead of UTC (which would make PST users always appear as "late night")
          client_hour: new Date().getHours(),
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

      const lumiraMsg: Message = {
        role: 'lumira',
        content: data.message,
        timestamp: new Date().toISOString(),
        structured_fields: data.structured_fields || null,
        checkin_complete: data.checkin_complete || false,
      }

      setMessages((prev) => [...prev, lumiraMsg])
      setConversationLog(data.conversation_log || [])

      if (data.structured_fields?.length > 0) {
        setStructuredFields(data.structured_fields)
      }

      if (data.checkin_complete) {
        setIsComplete(true)
      }
    } catch {
      setError("Lumira is taking a moment. Try again.")
      // Add error message to thread
      const errorMsg: Message = {
        role: 'lumira',
        content: "Lumira is taking a moment. Please try again.",
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }, [conversationLog])

  return {
    messages,
    send,
    loading,
    structuredFields,
    isComplete,
    error,
  }
}

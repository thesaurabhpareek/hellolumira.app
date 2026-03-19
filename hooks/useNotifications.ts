/**
 * @module useNotifications
 * @description React hook for notification state management. Polls the
 *   unread-count endpoint every 60 seconds with proper cleanup on unmount
 *   (clearInterval + cancelled flag to prevent state updates on unmounted
 *   components). Full notification list is fetched on-demand when the
 *   panel opens, not on mount, to minimise unnecessary API calls.
 * @version 1.0.0
 * @since March 2026
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Notification } from '@/types/app'

/** Polling interval for unread badge count — 60s balances freshness vs. server load. */
const POLL_INTERVAL_MS = 60_000

interface NotificationsData {
  today: Notification[]
  earlier: Notification[]
  next_cursor: string | null
}

interface UseNotificationsResult {
  unreadCount: number
  notifications: NotificationsData | null
  loading: boolean
  error: string | null
  markRead: (notificationIds: string[]) => Promise<void>
  markAllRead: () => Promise<void>
  dismiss: (notificationId: string) => Promise<void>
  refresh: () => void
  fetchNotifications: () => Promise<void>
}

/**
 * Provides notification state, polling, and mutation methods.
 *
 * Lifecycle:
 * - On mount: starts polling `/api/notifications/unread-count` every 60s.
 * - On unmount: clears the interval and sets a `cancelled` flag to prevent
 *   state updates after unmount (avoids React memory leak warnings).
 * - `fetchNotifications()` is called explicitly when the panel opens.
 * - `markRead`, `markAllRead`, and `dismiss` apply optimistic local updates
 *   before the server confirms, rolling back implicitly on next poll if needed.
 *
 * @returns Notification state and action methods.
 */
export function useNotifications(): UseNotificationsResult {
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<NotificationsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)
  const prevCountRef = useRef(0)

  // Poll unread count
  useEffect(() => {
    let cancelled = false

    const fetchCount = async () => {
      try {
        const res = await fetch('/api/notifications/unread-count')
        if (!res.ok) return

        const data = await res.json() as { count: number }
        if (!cancelled) {
          prevCountRef.current = unreadCount
          setUnreadCount(data.count)
        }
      } catch {
        // Silent fail — badge is non-critical
      }
    }

    fetchCount()
    const interval = setInterval(fetchCount, POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick])

  // Fetch full notification list (called when panel opens)
  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/notifications?limit=20')
      if (!res.ok) {
        throw new Error('Failed to fetch notifications')
      }

      const data = await res.json() as NotificationsData
      setNotifications(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not load notifications'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const markRead = useCallback(async (notificationIds: string[]) => {
    try {
      const res = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification_ids: notificationIds }),
      })

      if (res.ok) {
        // Optimistically update local state
        setNotifications((prev) => {
          if (!prev) return prev
          const markIds = new Set(notificationIds)
          const now = new Date().toISOString()
          const update = (n: Notification): Notification =>
            markIds.has(n.id) ? { ...n, is_read: true, read_at: now } : n
          return {
            today: prev.today.map(update),
            earlier: prev.earlier.map(update),
            next_cursor: prev.next_cursor,
          }
        })
        setUnreadCount((c) => Math.max(0, c - notificationIds.length))
      }
    } catch {
      // Silent fail
    }
  }, [])

  const markAllRead = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (res.ok) {
        const now = new Date().toISOString()
        setNotifications((prev) => {
          if (!prev) return prev
          const update = (n: Notification): Notification => ({
            ...n,
            is_read: true,
            read_at: n.read_at ?? now,
          })
          return {
            today: prev.today.map(update),
            earlier: prev.earlier.map(update),
            next_cursor: prev.next_cursor,
          }
        })
        setUnreadCount(0)
      }
    } catch {
      // Silent fail
    }
  }, [])

  const dismiss = useCallback(async (notificationId: string) => {
    try {
      const res = await fetch('/api/notifications/dismiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification_id: notificationId }),
      })

      if (res.ok) {
        setNotifications((prev) => {
          if (!prev) return prev
          // Check if dismissed notification was unread using current state
          // (avoids stale closure by reading from the prev snapshot)
          const all = [...prev.today, ...prev.earlier]
          const dismissed = all.find((n) => n.id === notificationId)
          if (dismissed && !dismissed.is_read) {
            setUnreadCount((c) => Math.max(0, c - 1))
          }
          const filter = (n: Notification) => n.id !== notificationId
          return {
            today: prev.today.filter(filter),
            earlier: prev.earlier.filter(filter),
            next_cursor: prev.next_cursor,
          }
        })
      }
    } catch {
      // Silent fail — badge will self-correct on next poll
    }
  }, [])

  const refresh = useCallback(() => {
    setTick((t) => t + 1)
  }, [])

  return {
    unreadCount,
    notifications,
    loading,
    error,
    markRead,
    markAllRead,
    dismiss,
    refresh,
    fetchNotifications,
  }
}

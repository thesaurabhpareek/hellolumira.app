/**
 * @module NotificationBell
 * @description Animated notification bell icon with unread badge. Opens a
 *   dropdown NotificationPanel anchored below the bell icon.
 * @version 2.1.0 — Migrated inline styles → Tailwind; keyframes moved to globals.css
 * @since March 2026
 */
'use client'

import { useState, useEffect, useRef } from 'react'
import { BellIcon } from '@/components/icons'
import { NotificationPanel } from './NotificationPanel'
import { useNotifications } from '@/hooks/useNotifications'

export function NotificationBell() {
  const {
    unreadCount,
    notifications,
    loading,
    error,
    markRead,
    markAllRead,
    dismiss,
    fetchNotifications,
  } = useNotifications()

  const [panelOpen, setPanelOpen] = useState(false)
  const [shouldPulse, setShouldPulse] = useState(false)
  const prevCountRef = useRef(0)
  const bellRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (unreadCount > prevCountRef.current && prevCountRef.current >= 0) {
      setShouldPulse(true)
      const timer = setTimeout(() => setShouldPulse(false), 600)
      return () => clearTimeout(timer)
    }
    prevCountRef.current = unreadCount
  }, [unreadCount])

  const handleOpenPanel = () => {
    setPanelOpen(true)
    fetchNotifications()
  }

  const handleClosePanel = () => setPanelOpen(false)

  const handleNotificationTap = async (notificationId: string, actionUrl: string | null) => {
    await markRead([notificationId])
    setPanelOpen(false)
    if (actionUrl) window.location.href = actionUrl
  }

  const badgeDisplay = unreadCount > 9 ? '9+' : String(unreadCount)

  return (
    <div className="relative">
      <button
        ref={bellRef}
        type="button"
        onClick={handleOpenPanel}
        aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : 'Notifications'}
        className="relative w-12 h-12 flex items-center justify-center bg-transparent border-none rounded-md cursor-pointer text-muted-foreground p-0 [-webkit-tap-highlight-color:transparent]"
      >
        <BellIcon size={22} />

        {unreadCount > 0 && (
          <span
            className={`absolute top-1 right-1 min-w-[18px] h-[18px] rounded-[9px] bg-destructive text-white text-[11px] font-bold flex items-center justify-center px-1 leading-none pointer-events-none ${shouldPulse ? 'notification-pulse' : ''}`}
          >
            {badgeDisplay}
          </span>
        )}
      </button>

      {panelOpen && (
        <NotificationPanel
          notifications={notifications}
          loading={loading}
          error={error}
          onClose={handleClosePanel}
          onTap={handleNotificationTap}
          onMarkAllRead={markAllRead}
          onDismiss={dismiss}
        />
      )}
    </div>
  )
}

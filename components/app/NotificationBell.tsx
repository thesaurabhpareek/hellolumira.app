/**
 * @module NotificationBell
 * @description Animated notification bell icon with unread badge. Opens the
 *   NotificationPanel on click. Badge count polls via useNotifications hook.
 * @version 1.0.0
 * @since March 2026
 */
'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell } from 'lucide-react'
import { NotificationPanel } from './NotificationPanel'
import { useNotifications } from '@/hooks/useNotifications'

const SAND_500 = '#706D67'
const ROSE_500 = '#C53030'

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

  // Pulse animation when unread count increases
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

  const handleClosePanel = () => {
    setPanelOpen(false)
  }

  const handleNotificationTap = async (notificationId: string, actionUrl: string | null) => {
    await markRead([notificationId])
    setPanelOpen(false)
    if (actionUrl) {
      window.location.href = actionUrl
    }
  }

  const badgeDisplay = unreadCount > 9 ? '9+' : String(unreadCount)

  return (
    <>
      <button
        type="button"
        onClick={handleOpenPanel}
        aria-label={
          unreadCount > 0
            ? `Notifications (${unreadCount} unread)`
            : 'Notifications'
        }
        style={{
          position: 'relative',
          width: '48px',
          height: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          color: SAND_500,
          padding: 0,
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <Bell size={22} strokeWidth={2} />

        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              minWidth: '18px',
              height: '18px',
              borderRadius: '9px',
              background: ROSE_500,
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              lineHeight: 1,
              pointerEvents: 'none',
              animation: shouldPulse ? 'notification-pulse 0.6s ease-out' : 'none',
            }}
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

      {/* Inline keyframes for pulse animation */}
      <style jsx global>{`
        @keyframes notification-pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
      `}</style>
    </>
  )
}

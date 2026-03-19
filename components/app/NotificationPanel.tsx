/**
 * @module NotificationPanel
 * @description Slide-out notification panel displaying today's and earlier
 *   notifications. Supports mark-read, mark-all-read, and dismiss actions
 *   with optimistic UI updates.
 * @version 1.0.0
 * @since March 2026
 */
'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import type { Notification, NotificationType } from '@/types/app'

const SAGE_500 = '#3D8178'
const SAND_500 = '#706D67'
const SAND_100 = '#E8E6E1'
const AMBER_400 = '#D69E2E'
const TERRA_400 = '#C4956A'
const ROSE_400 = '#E53E3E'
const SAGE_400 = '#4FD1C5'

/**
 * Left-border colour per notification type, per PRD S6.3.
 */
function getBorderColor(type: NotificationType): string | null {
  switch (type) {
    case 'pattern_detected':
    case 'streak_at_risk':
      return AMBER_400
    case 'concern_followup':
    case 'badge_earned':
      return TERRA_400
    case 'escalation_reminder':
      return ROSE_400
    case 'milestone_approaching':
    case 'weekly_guide_ready':
    case 'partner_joined':
    case 'system_message':
      return SAGE_400
    default:
      return null
  }
}

function timeAgo(dateString: string): string {
  const now = Date.now()
  const then = new Date(dateString).getTime()
  const diffMs = now - then

  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  if (days === 1) return '1d ago'
  if (days < 7) return `${days}d ago`

  const weeks = Math.floor(days / 7)
  return `${weeks}w ago`
}

interface NotificationsData {
  today: Notification[]
  earlier: Notification[]
  next_cursor: string | null
}

interface NotificationPanelProps {
  notifications: NotificationsData | null
  loading: boolean
  error: string | null
  onClose: () => void
  onTap: (notificationId: string, actionUrl: string | null) => void
  onMarkAllRead: () => void
  onDismiss: (notificationId: string) => void
}

function NotificationRow({
  notification,
  onTap,
}: {
  notification: Notification
  onTap: (id: string, actionUrl: string | null) => void
}) {
  const borderColor = getBorderColor(notification.type)

  return (
    <button
      type="button"
      onClick={() => onTap(notification.id, notification.action_url)}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        width: '100%',
        padding: '14px 16px',
        minHeight: '48px',
        background: notification.is_read ? '#FFFFFF' : '#F7FAFC',
        border: 'none',
        borderLeft: borderColor ? `3px solid ${borderColor}` : '3px solid transparent',
        borderBottom: `1px solid ${SAND_100}`,
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        WebkitTapHighlightColor: 'transparent',
        transition: 'background 0.15s ease',
      }}
    >
      {/* Emoji */}
      <span
        style={{
          fontSize: '20px',
          lineHeight: 1,
          flexShrink: 0,
          marginTop: '2px',
        }}
        aria-hidden="true"
      >
        {notification.emoji || '🔔'}
      </span>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: '14px',
            fontWeight: notification.is_read ? 500 : 600,
            color: '#2D3748',
            lineHeight: 1.4,
            marginBottom: '2px',
          }}
        >
          {notification.title}
        </div>
        <div
          style={{
            fontSize: '13px',
            fontWeight: 400,
            color: SAND_500,
            lineHeight: 1.4,
          }}
        >
          {notification.body}
        </div>
      </div>

      {/* Time */}
      <span
        style={{
          fontSize: '12px',
          color: SAND_500,
          whiteSpace: 'nowrap',
          flexShrink: 0,
          marginTop: '2px',
        }}
      >
        {timeAgo(notification.created_at)}
      </span>
    </button>
  )
}

export function NotificationPanel({
  notifications,
  loading,
  error,
  onClose,
  onTap,
  onMarkAllRead,
  onDismiss: _onDismiss,
}: NotificationPanelProps) {
  void _onDismiss // Accepted for future swipe-to-dismiss feature
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  // Prevent body scroll when panel is open
  useEffect(() => {
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [])

  const hasNotifications =
    notifications &&
    (notifications.today.length > 0 || notifications.earlier.length > 0)

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.3)',
          zIndex: 200,
          animation: 'notif-backdrop-in 0.2s ease',
        }}
        aria-hidden="true"
      />

      {/* Bottom sheet */}
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Notifications"
        aria-modal="true"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          maxHeight: '70vh',
          zIndex: 201,
          background: '#FFFFFF',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          animation: 'notif-slide-up 0.25s ease',
          fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        {/* Handle bar */}
        <div
          style={{
            width: '36px',
            height: '4px',
            borderRadius: '2px',
            background: SAND_100,
            margin: '8px auto 0',
            touchAction: 'none',
          }}
        />

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px 8px',
            borderBottom: `1px solid ${SAND_100}`,
          }}
        >
          <h2
            style={{
              fontSize: '17px',
              fontWeight: 600,
              color: '#2D3748',
              margin: 0,
            }}
          >
            Notifications
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {hasNotifications && (
              <button
                type="button"
                onClick={onMarkAllRead}
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: SAGE_500,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  minHeight: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                Mark all as read
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="Close notifications"
              style={{
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '8px',
                color: SAND_500,
                padding: 0,
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <X size={20} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
            paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
          }}
        >
          {loading && (
            <div style={{ padding: '40px 16px', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}

          {error && !loading && (
            <div
              style={{
                padding: '40px 16px',
                textAlign: 'center',
                color: SAND_500,
                fontSize: '14px',
              }}
            >
              Could not load notifications. Pull down to retry.
            </div>
          )}

          {!loading && !error && !hasNotifications && (
            <div
              style={{
                padding: '60px 16px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>
                &#x2728;
              </div>
              <div
                style={{
                  fontSize: '15px',
                  fontWeight: 500,
                  color: '#2D3748',
                  marginBottom: '4px',
                }}
              >
                You&apos;re all caught up
              </div>
              <div
                style={{
                  fontSize: '13px',
                  color: SAND_500,
                }}
              >
                No new notifications right now
              </div>
            </div>
          )}

          {!loading && !error && notifications && (
            <>
              {notifications.today.length > 0 && (
                <>
                  <SectionHeader label="Today" />
                  {notifications.today.map((n) => (
                    <NotificationRow
                      key={n.id}
                      notification={n}
                      onTap={onTap}
                    />
                  ))}
                </>
              )}

              {notifications.earlier.length > 0 && (
                <>
                  <SectionHeader label="Earlier" />
                  {notifications.earlier.map((n) => (
                    <NotificationRow
                      key={n.id}
                      notification={n}
                      onTap={onTap}
                    />
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Animations */}
      <style jsx global>{`
        @keyframes notif-backdrop-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes notif-slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </>
  )
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div
      style={{
        padding: '12px 16px 6px',
        fontSize: '12px',
        fontWeight: 600,
        color: SAND_500,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}
    >
      {label}
    </div>
  )
}

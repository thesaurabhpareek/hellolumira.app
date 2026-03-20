/**
 * @module NotificationPanel
 * @description Dropdown notification panel that appears below the bell icon,
 *   Facebook-style. Displays today's and earlier notifications with mark-read,
 *   mark-all-read, and dismiss actions. Sized within the page (not full-screen).
 * @version 2.0.0
 * @since March 2026
 */
'use client'

import { useEffect, useRef } from 'react'
import { CloseIcon } from '@/components/icons'
import type { Notification, NotificationType } from '@/types/app'

const SAGE_500 = '#3D8178'
const SAND_0 = '#FAFAF8'
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
        padding: '12px 16px',
        minHeight: '48px',
        background: notification.is_read ? '#FFFFFF' : SAND_0,
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
        {notification.emoji || '\uD83D\uDD14'}
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
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {notification.body}
        </div>
      </div>

      {/* Time + unread dot */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '6px',
          flexShrink: 0,
          marginTop: '2px',
        }}
      >
        <span
          style={{
            fontSize: '12px',
            color: SAND_500,
            whiteSpace: 'nowrap',
          }}
        >
          {timeAgo(notification.created_at)}
        </span>
        {!notification.is_read && (
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: SAGE_500,
              flexShrink: 0,
            }}
          />
        )}
      </div>
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

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    // Delay listener to avoid catching the opening click
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 0)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  const hasNotifications =
    notifications &&
    (notifications.today.length > 0 || notifications.earlier.length > 0)

  return (
    <>
      {/* Backdrop overlay - transparent on desktop, subtle on mobile */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.15)',
          zIndex: 199,
          animation: 'notif-backdrop-in 0.15s ease',
        }}
        aria-hidden="true"
      />

      {/* Dropdown panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Notifications"
        aria-modal="true"
        style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '4px',
          width: 'min(400px, calc(100vw - 24px))',
          maxHeight: '70vh',
          zIndex: 200,
          background: '#FFFFFF',
          borderRadius: '12px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'notif-dropdown-in 0.2s ease',
          fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          overflow: 'hidden',
          border: `1px solid ${SAND_100}`,
        }}
      >
        {/* Arrow / caret pointing up toward the bell */}
        <div
          style={{
            position: 'absolute',
            top: '-6px',
            right: '18px',
            width: '12px',
            height: '12px',
            background: '#FFFFFF',
            border: `1px solid ${SAND_100}`,
            borderRight: 'none',
            borderBottom: 'none',
            transform: 'rotate(45deg)',
            zIndex: 1,
          }}
          aria-hidden="true"
        />

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px 10px',
            borderBottom: `1px solid ${SAND_100}`,
            position: 'relative',
            zIndex: 2,
            background: '#FFFFFF',
          }}
        >
          <h2
            style={{
              fontSize: '17px',
              fontWeight: 700,
              color: '#2D3748',
              margin: 0,
              letterSpacing: '-0.2px',
            }}
          >
            Notifications
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
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
                  padding: '6px 10px',
                  borderRadius: '6px',
                  minHeight: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  WebkitTapHighlightColor: 'transparent',
                  transition: 'background 0.15s ease',
                }}
              >
                Mark all read
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="Close notifications"
              style={{
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: SAND_0,
                border: 'none',
                cursor: 'pointer',
                borderRadius: '50%',
                color: SAND_500,
                padding: 0,
                WebkitTapHighlightColor: 'transparent',
                transition: 'background 0.15s ease',
              }}
            >
              <CloseIcon size={16} />
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
              Couldn&apos;t load notifications right now. Try closing and reopening.
            </div>
          )}

          {!loading && !error && !hasNotifications && (
            <div
              style={{
                padding: '48px 16px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '28px', marginBottom: '10px' }}>
                &#x2728;
              </div>
              <div
                style={{
                  fontSize: '15px',
                  fontWeight: 600,
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
        @keyframes notif-dropdown-in {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  )
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div
      style={{
        padding: '10px 16px 4px',
        fontSize: '12px',
        fontWeight: 600,
        color: SAND_500,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        background: SAND_0,
      }}
    >
      {label}
    </div>
  )
}

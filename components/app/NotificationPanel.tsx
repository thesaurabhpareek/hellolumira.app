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
      className="flex items-start gap-3 w-full min-h-[48px] border-none cursor-pointer text-left transition-[background] duration-150 ease-in-out"
      style={{
        padding: '12px 16px',
        background: notification.is_read ? '#FFFFFF' : SAND_0,
        borderLeft: borderColor ? `3px solid ${borderColor}` : '3px solid transparent',
        borderBottom: `1px solid ${SAND_100}`,
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* Emoji */}
      <span
        className="text-[20px] leading-none shrink-0 mt-0.5"
        aria-hidden="true"
      >
        {notification.emoji || '🔔'}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div
          className="text-sm leading-[1.4] mb-0.5"
          style={{
            fontWeight: notification.is_read ? 500 : 600,
            color: '#2D3748',
          }}
        >
          {notification.title}
        </div>
        <div
          className="text-[13px] font-normal leading-[1.4] overflow-hidden text-ellipsis"
          style={{
            color: SAND_500,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {notification.body}
        </div>
      </div>

      {/* Time + unread dot */}
      <div className="flex flex-col items-end gap-[6px] shrink-0 mt-0.5">
        <span className="text-[12px] whitespace-nowrap" style={{ color: SAND_500 }}>
          {timeAgo(notification.created_at)}
        </span>
        {!notification.is_read && (
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: SAGE_500 }}
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
        className="fixed inset-0 z-[199]"
        style={{
          background: 'rgba(0, 0, 0, 0.15)',
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
        className="absolute top-full right-0 mt-1 z-[200] bg-white flex flex-col overflow-hidden"
        style={{
          width: 'min(400px, calc(100vw - 24px))',
          maxHeight: '70vh',
          borderRadius: '12px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
          animation: 'notif-dropdown-in 0.2s ease',
          fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          border: `1px solid ${SAND_100}`,
        }}
      >
        {/* Arrow / caret pointing up toward the bell */}
        <div
          className="absolute right-[18px] w-3 h-3 bg-white z-[1]"
          style={{
            top: '-6px',
            border: `1px solid ${SAND_100}`,
            borderRight: 'none',
            borderBottom: 'none',
            transform: 'rotate(45deg)',
          }}
          aria-hidden="true"
        />

        {/* Header */}
        <div
          className="flex items-center justify-between relative z-[2] bg-white"
          style={{
            padding: '14px 16px 10px',
            borderBottom: `1px solid ${SAND_100}`,
          }}
        >
          <h2
            className="text-[17px] font-bold m-0"
            style={{ color: '#2D3748', letterSpacing: '-0.2px' }}
          >
            Notifications
          </h2>

          <div className="flex items-center gap-1">
            {hasNotifications && (
              <button
                type="button"
                onClick={onMarkAllRead}
                className="text-[13px] font-medium bg-transparent border-none cursor-pointer px-[10px] py-[6px] rounded-[6px] min-h-[32px] flex items-center transition-[background] duration-150 ease-in-out"
                style={{
                  color: SAGE_500,
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                Mark all read
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="Close notifications"
              className="w-8 h-8 flex items-center justify-center border-none cursor-pointer rounded-full p-0 transition-[background] duration-150 ease-in-out"
              style={{
                background: SAND_0,
                color: SAND_500,
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <CloseIcon size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          className="flex-1 overflow-y-auto"
          style={{
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
          }}
        >
          {loading && (
            <div className="py-10 px-4 text-center">
              <div className="flex justify-center gap-[6px]">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="py-10 px-4 text-center text-sm" style={{ color: SAND_500 }}>
              Couldn&apos;t load notifications right now. Try closing and reopening.
            </div>
          )}

          {!loading && !error && !hasNotifications && (
            <div className="py-12 px-4 text-center">
              <div className="text-[28px] mb-[10px]">
                &#x2728;
              </div>
              <div className="text-[15px] font-semibold mb-1" style={{ color: '#2D3748' }}>
                You&apos;re all caught up
              </div>
              <div className="text-[13px]" style={{ color: SAND_500 }}>
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
      className="text-[12px] font-semibold uppercase tracking-[0.5px]"
      style={{
        padding: '10px 16px 4px',
        color: SAND_500,
        background: SAND_0,
      }}
    >
      {label}
    </div>
  )
}

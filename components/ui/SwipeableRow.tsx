/**
 * @module SwipeableRow
 * @description iOS-style swipeable list item with hidden actions.
 *   Swipe right for positive actions, swipe left for negative actions.
 *   Includes snap thresholds, bounce, and destructive action confirmation.
 * @version 1.0.0
 * @since March 2026
 */
'use client'

import React, { useRef, useState, useCallback } from 'react'

/* ── Types ─────────────────────────────────────────────────────────────────── */

interface SwipeAction {
  label: string
  icon?: React.ReactNode
  color: string
  textColor?: string
  onClick: () => void | Promise<void>
  /** If true, requires full swipe to trigger (like iOS Mail delete) */
  destructive?: boolean
}

interface Props {
  children: React.ReactNode
  /** Actions revealed on swipe right (positive) */
  rightActions?: SwipeAction[]
  /** Actions revealed on swipe left (negative) */
  leftActions?: SwipeAction[]
  /** Width of each action button (px) */
  actionWidth?: number
  /** Disable swipe */
  disabled?: boolean
}

const SNAP_THRESHOLD = 0.4  // Fraction of total action width to snap open
const VELOCITY_THRESHOLD = 0.5  // px/ms to trigger snap
const FULL_SWIPE_THRESHOLD = 0.8 // Fraction to trigger destructive action

export default function SwipeableRow({
  children,
  rightActions = [],
  leftActions = [],
  actionWidth = 72,
  disabled = false,
}: Props) {
  const rowRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)
  const [swiping, setSwiping] = useState(false)
  const touchStartX = useRef(0)
  const touchStartTime = useRef(0)
  const currentOffset = useRef(0)
  const isSwipeActive = useRef(false)

  const maxLeftOffset = rightActions.length * actionWidth
  const maxRightOffset = leftActions.length * actionWidth

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return
    touchStartX.current = e.touches[0].clientX
    touchStartTime.current = Date.now()
    isSwipeActive.current = true
    setSwiping(true)
  }, [disabled])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSwipeActive.current || disabled) return

    const deltaX = e.touches[0].clientX - touchStartX.current + currentOffset.current

    // Clamp with rubber-banding beyond limits
    let clampedOffset = deltaX
    if (deltaX > maxRightOffset) {
      clampedOffset = maxRightOffset + (deltaX - maxRightOffset) * 0.2
    } else if (deltaX < -maxLeftOffset) {
      clampedOffset = -maxLeftOffset + (deltaX + maxLeftOffset) * 0.2
    }

    // Don't allow swipe in a direction with no actions
    if (clampedOffset > 0 && leftActions.length === 0) clampedOffset = 0
    if (clampedOffset < 0 && rightActions.length === 0) clampedOffset = 0

    setOffset(clampedOffset)
  }, [disabled, maxLeftOffset, maxRightOffset, leftActions.length, rightActions.length])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isSwipeActive.current) return
    isSwipeActive.current = false
    setSwiping(false)

    const endX = e.changedTouches[0].clientX
    const deltaX = endX - touchStartX.current
    const elapsed = Date.now() - touchStartTime.current
    const velocity = Math.abs(deltaX) / elapsed

    // Check for full-swipe destructive action
    if (offset < -maxLeftOffset * FULL_SWIPE_THRESHOLD) {
      const destructiveAction = rightActions.find(a => a.destructive)
      if (destructiveAction) {
        destructiveAction.onClick()
        setOffset(0)
        currentOffset.current = 0
        return
      }
    }
    if (offset > maxRightOffset * FULL_SWIPE_THRESHOLD) {
      const destructiveAction = leftActions.find(a => a.destructive)
      if (destructiveAction) {
        destructiveAction.onClick()
        setOffset(0)
        currentOffset.current = 0
        return
      }
    }

    // Snap logic
    let snapTo = 0
    if (velocity > VELOCITY_THRESHOLD || Math.abs(offset) > Math.abs(offset < 0 ? maxLeftOffset : maxRightOffset) * SNAP_THRESHOLD) {
      if (offset < 0 && rightActions.length > 0) {
        snapTo = -maxLeftOffset
      } else if (offset > 0 && leftActions.length > 0) {
        snapTo = maxRightOffset
      }
    }

    setOffset(snapTo)
    currentOffset.current = snapTo
  }, [offset, maxLeftOffset, maxRightOffset, rightActions, leftActions])

  const resetOffset = useCallback(() => {
    setOffset(0)
    currentOffset.current = 0
  }, [])

  return (
    <div className="swipeable-row" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Left actions (revealed on swipe right) */}
      {leftActions.length > 0 && (
        <div
          className="swipeable-row__actions swipeable-row__actions--left"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            display: 'flex',
            width: `${maxRightOffset}px`,
          }}
        >
          {leftActions.map((action, i) => (
            <button
              key={i}
              className="swipeable-row__action press-scale"
              onClick={() => { action.onClick(); resetOffset() }}
              style={{
                width: `${actionWidth}px`,
                backgroundColor: action.color,
                color: action.textColor || '#FFFFFF',
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                minHeight: 'auto',
              }}
              aria-label={action.label}
            >
              {action.icon}
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Right actions (revealed on swipe left) */}
      {rightActions.length > 0 && (
        <div
          className="swipeable-row__actions swipeable-row__actions--right"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            width: `${maxLeftOffset}px`,
          }}
        >
          {rightActions.map((action, i) => (
            <button
              key={i}
              className="swipeable-row__action press-scale"
              onClick={() => { action.onClick(); resetOffset() }}
              style={{
                width: `${actionWidth}px`,
                backgroundColor: action.color,
                color: action.textColor || '#FFFFFF',
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                minHeight: 'auto',
              }}
              aria-label={action.label}
            >
              {action.icon}
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Swipeable content */}
      <div
        ref={rowRef}
        className="swipeable-row__content"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(${offset}px)`,
          transition: swiping ? 'none' : 'transform 0.3s var(--ease-ios)',
          position: 'relative',
          zIndex: 1,
          backgroundColor: 'var(--color-white)',
        }}
      >
        {children}
      </div>
    </div>
  )
}

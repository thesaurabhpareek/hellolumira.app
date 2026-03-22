/**
 * @module PullToRefresh
 * @description Native-feel pull-to-refresh with resistance curve,
 *   haptic feedback at trigger point, and seed-sprouting spinner animation.
 * @version 1.0.0
 * @since March 2026
 */
'use client'

import React, { useRef, useState, useCallback, useEffect } from 'react'

interface Props {
  children: React.ReactNode
  onRefresh: () => Promise<void>
  /** Minimum display time for spinner (ms) */
  minDisplayTime?: number
  /** Pull distance to trigger refresh (px) */
  triggerDistance?: number
  disabled?: boolean
}

const RESISTANCE = 0.4 // Pull resistance factor (pulls less the further you go)
const MIN_DISPLAY = 500
const TRIGGER_DIST = 80

export default function PullToRefresh({
  children,
  onRefresh,
  minDisplayTime = MIN_DISPLAY,
  triggerDistance = TRIGGER_DIST,
  disabled = false,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [pullDistance, setPullDistance] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const [triggered, setTriggered] = useState(false)
  const touchStartY = useRef(0)
  const isPulling = useRef(false)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || refreshing) return
    const container = containerRef.current
    if (!container) return

    // Only allow pull when scrolled to top
    const scrollParent = container.closest('[class*="overflow-y"]') as HTMLElement
    if (scrollParent && scrollParent.scrollTop > 5) return

    touchStartY.current = e.touches[0].clientY
    isPulling.current = true
  }, [disabled, refreshing])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling.current || disabled || refreshing) return

    const deltaY = e.touches[0].clientY - touchStartY.current
    if (deltaY < 0) {
      isPulling.current = false
      setPullDistance(0)
      return
    }

    // Apply resistance curve
    const resistedDist = deltaY * RESISTANCE * (1 - Math.min(deltaY / 400, 0.6))
    setPullDistance(Math.max(0, resistedDist))

    if (resistedDist >= triggerDistance && !triggered) {
      setTriggered(true)
      // Haptic feedback at trigger point (if supported)
      if ('vibrate' in navigator) {
        navigator.vibrate(10)
      }
    } else if (resistedDist < triggerDistance && triggered) {
      setTriggered(false)
    }
  }, [disabled, refreshing, triggerDistance, triggered])

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current) return
    isPulling.current = false

    if (triggered && !refreshing) {
      setRefreshing(true)
      setPullDistance(triggerDistance * 0.6) // Hold position while refreshing

      const startTime = Date.now()
      try {
        await onRefresh()
      } catch {
        // Silently handle errors
      }

      // Ensure minimum display time
      const elapsed = Date.now() - startTime
      if (elapsed < minDisplayTime) {
        await new Promise(res => setTimeout(res, minDisplayTime - elapsed))
      }

      setRefreshing(false)
      setTriggered(false)
    }

    // Snap back
    setPullDistance(0)
  }, [triggered, refreshing, triggerDistance, onRefresh, minDisplayTime])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      isPulling.current = false
    }
  }, [])

  const progress = Math.min(pullDistance / triggerDistance, 1)
  const spinnerOpacity = Math.max(0, (progress - 0.2) / 0.8)
  const spinnerScale = 0.5 + progress * 0.5

  return (
    <div
      ref={containerRef}
      className="pull-to-refresh"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className="pull-to-refresh__indicator"
        style={{
          height: `${pullDistance}px`,
          opacity: spinnerOpacity,
          transition: isPulling.current ? 'none' : 'all 0.3s var(--ease-decelerate)',
        }}
      >
        <div
          className={`pull-to-refresh__spinner ${refreshing ? 'pull-to-refresh__spinner--active' : ''}`}
          style={{
            transform: `scale(${spinnerScale}) rotate(${pullDistance * 2}deg)`,
            transition: isPulling.current ? 'none' : 'transform 0.3s var(--ease-decelerate)',
          }}
        >
          {/* Seed sprouting icon */}
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle
              cx="14"
              cy="14"
              r="12"
              stroke="#3D8178"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={`${progress * 75} 75`}
              className={refreshing ? 'pull-to-refresh__ring' : ''}
            />
            {/* Seed/leaf shape */}
            <path
              d="M14 8c0 0-4 3-4 7s4 5 4 5 4-1 4-5-4-7-4-7z"
              fill="#3D8178"
              opacity={triggered || refreshing ? 1 : 0.4}
              style={{ transition: 'opacity 0.2s ease' }}
            />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          transform: `translateY(${pullDistance > 0 ? pullDistance * 0.3 : 0}px)`,
          transition: isPulling.current ? 'none' : 'transform 0.3s var(--ease-decelerate)',
        }}
      >
        {children}
      </div>
    </div>
  )
}

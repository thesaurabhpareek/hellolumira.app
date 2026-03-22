/**
 * @module SegmentedControl
 * @description iOS-style segmented control with animated sliding indicator,
 *   haptic feel on selection, and configurable colors.
 * @version 1.0.0
 * @since March 2026
 */
'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'

interface Segment {
  id: string
  label: string
  badge?: number
}

interface Props {
  segments: Segment[]
  activeId: string
  onChange: (id: string) => void
  /** Full width (equal segments) vs auto width */
  fullWidth?: boolean
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Color theme */
  color?: 'sage' | 'terra' | 'neutral'
}

const COLOR_MAP = {
  sage:    { bg: '#EDF4F2', active: '#3D8178', indicator: '#FFFFFF', text: '#718096', activeText: '#3D8178' },
  terra:   { bg: '#FDF0E6', active: '#C4844E', indicator: '#FFFFFF', text: '#718096', activeText: '#C4844E' },
  neutral: { bg: '#F5F3EF', active: '#2D3748', indicator: '#FFFFFF', text: '#9CA3AF', activeText: '#2D3748' },
}

const SIZE_MAP = {
  sm: { height: 32, fontSize: 12, padding: '0 10px', borderRadius: 8 },
  md: { height: 40, fontSize: 14, padding: '0 16px', borderRadius: 10 },
  lg: { height: 48, fontSize: 15, padding: '0 20px', borderRadius: 12 },
}

export default function SegmentedControl({
  segments,
  activeId,
  onChange,
  fullWidth = true,
  size = 'md',
  color = 'sage',
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({})
  const colors = COLOR_MAP[color]
  const sizing = SIZE_MAP[size]

  const updateIndicator = useCallback(() => {
    if (!containerRef.current) return
    const activeIndex = segments.findIndex(s => s.id === activeId)
    if (activeIndex < 0) return

    const buttons = containerRef.current.querySelectorAll<HTMLButtonElement>('[data-segment]')
    const activeBtn = buttons[activeIndex]
    if (!activeBtn) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const btnRect = activeBtn.getBoundingClientRect()

    setIndicatorStyle({
      width: `${btnRect.width - 4}px`,
      height: `${btnRect.height - 4}px`,
      transform: `translateX(${btnRect.left - containerRect.left + 2}px)`,
    })
  }, [activeId, segments])

  useEffect(() => {
    updateIndicator()
    window.addEventListener('resize', updateIndicator)
    return () => window.removeEventListener('resize', updateIndicator)
  }, [updateIndicator])

  const handleSelect = (id: string) => {
    if (id === activeId) return
    onChange(id)
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(5)
    }
  }

  return (
    <div
      ref={containerRef}
      className="segmented-control"
      role="tablist"
      style={{
        height: `${sizing.height}px`,
        borderRadius: `${sizing.borderRadius}px`,
        backgroundColor: colors.bg,
        display: 'flex',
        position: 'relative',
        padding: '2px',
      }}
    >
      {/* Sliding indicator */}
      <div
        className="segmented-control__indicator"
        style={{
          ...indicatorStyle,
          borderRadius: `${sizing.borderRadius - 2}px`,
          backgroundColor: colors.indicator,
          position: 'absolute',
          top: '2px',
          left: 0,
          transition: 'transform 0.25s var(--ease-ios), width 0.25s var(--ease-ios)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
          zIndex: 0,
        }}
      />

      {/* Segment buttons */}
      {segments.map((segment) => {
        const isActive = segment.id === activeId
        return (
          <button
            key={segment.id}
            data-segment={segment.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => handleSelect(segment.id)}
            className="segmented-control__btn"
            style={{
              flex: fullWidth ? 1 : 'none',
              padding: sizing.padding,
              fontSize: `${sizing.fontSize}px`,
              fontWeight: isActive ? 600 : 500,
              color: isActive ? colors.activeText : colors.text,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              zIndex: 1,
              transition: 'color 0.2s ease, font-weight 0.2s ease',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              minHeight: 'auto',
            }}
          >
            {segment.label}
            {segment.badge !== undefined && segment.badge > 0 && (
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  minWidth: '16px',
                  height: '16px',
                  borderRadius: '8px',
                  backgroundColor: isActive ? colors.active : '#9CA3AF',
                  color: '#FFFFFF',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                  transition: 'background-color 0.2s ease',
                }}
              >
                {segment.badge > 99 ? '99+' : segment.badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

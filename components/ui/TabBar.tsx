/**
 * @module TabBar
 * @description In-page tab navigation with animated sliding underline,
 *   badge support, scrollable overflow, and edge fade.
 * @version 1.0.0
 * @since March 2026
 */
'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'

/* ── Types ─────────────────────────────────────────────────────────────────── */

interface Tab {
  id: string
  label: string
  badge?: number
  icon?: React.ReactNode
}

interface Props {
  tabs: Tab[]
  activeId: string
  onChange: (id: string) => void
  /** Auto-width (content-sized) vs equal-width tabs */
  equalWidth?: boolean
  /** Color of active indicator and text */
  activeColor?: string
  /** Show edge fade when scrollable */
  showEdgeFade?: boolean
}

export default function TabBar({
  tabs,
  activeId,
  onChange,
  equalWidth = false,
  activeColor = '#3D8178',
  showEdgeFade = true,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({})
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateIndicator = useCallback(() => {
    if (!scrollRef.current) return
    const activeBtn = scrollRef.current.querySelector<HTMLButtonElement>(`[data-tab="${activeId}"]`)
    if (!activeBtn) return

    const scrollRect = scrollRef.current.getBoundingClientRect()
    const btnRect = activeBtn.getBoundingClientRect()

    setIndicatorStyle({
      width: `${btnRect.width}px`,
      transform: `translateX(${btnRect.left - scrollRect.left + scrollRef.current.scrollLeft}px)`,
    })

    // Scroll active tab into view
    const scrollLeft = scrollRef.current.scrollLeft
    const scrollWidth = scrollRef.current.clientWidth
    const btnLeft = activeBtn.offsetLeft
    const btnWidth = activeBtn.offsetWidth

    if (btnLeft < scrollLeft) {
      scrollRef.current.scrollTo({ left: btnLeft - 16, behavior: 'smooth' })
    } else if (btnLeft + btnWidth > scrollLeft + scrollWidth) {
      scrollRef.current.scrollTo({ left: btnLeft + btnWidth - scrollWidth + 16, behavior: 'smooth' })
    }
  }, [activeId])

  const updateScrollState = useCallback(() => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setCanScrollLeft(scrollLeft > 2)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2)
  }, [])

  useEffect(() => {
    updateIndicator()
    updateScrollState()
  }, [updateIndicator, updateScrollState])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', updateScrollState, { passive: true })
    window.addEventListener('resize', updateIndicator)
    return () => {
      el.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', updateIndicator)
    }
  }, [updateIndicator, updateScrollState])

  return (
    <div className="tab-bar" style={{ position: 'relative' }}>
      {/* Edge fade overlays */}
      {showEdgeFade && canScrollLeft && (
        <div className="tab-bar__fade tab-bar__fade--left" />
      )}
      {showEdgeFade && canScrollRight && (
        <div className="tab-bar__fade tab-bar__fade--right" />
      )}

      <div
        ref={scrollRef}
        className="tab-bar__scroll no-scrollbar"
        role="tablist"
        style={{
          display: 'flex',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          position: 'relative',
        }}
      >
        {/* Sliding underline indicator */}
        <div
          className="tab-bar__indicator"
          style={{
            ...indicatorStyle,
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: '2px',
            borderRadius: '1px 1px 0 0',
            backgroundColor: activeColor,
            transition: 'transform 0.25s var(--ease-ios), width 0.25s var(--ease-ios)',
          }}
        />

        {tabs.map((tab) => {
          const isActive = tab.id === activeId
          return (
            <button
              key={tab.id}
              data-tab={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className="tab-bar__tab"
              style={{
                flex: equalWidth ? 1 : 'none',
                padding: '12px 16px',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? activeColor : '#718096',
                background: 'none',
                border: 'none',
                borderBottom: '2px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'color 0.2s ease',
                minHeight: '48px',
                position: 'relative',
              }}
            >
              {tab.icon}
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className="tab-bar__badge"
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    minWidth: '16px',
                    height: '16px',
                    borderRadius: '8px',
                    backgroundColor: '#E53E3E',
                    color: '#FFFFFF',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                  }}
                >
                  {tab.badge > 99 ? '99+' : tab.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/**
 * @module PremiumBottomNav
 * @description Premium iOS-caliber bottom navigation bar with animated icons,
 *   glass morphism backdrop, badge indicators, and spring-feel press feedback.
 * @version 1.0.0
 * @since March 2026
 */
'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon, HomeIconFilled,
  ChatIcon, ChatIconFilled,
  TribeIcon, TribeIconFilled,
  BookIcon, BookIconFilled,
  UserIcon, UserIconFilled,
} from '@/components/icons'

/* ── Types ─────────────────────────────────────────────────────────────────── */

interface TabItem {
  label: string
  href: string
  icon: (props: { size?: number; color?: string }) => React.ReactNode
  iconFilled: (props: { size?: number; color?: string }) => React.ReactNode
  isCenter?: boolean
}

interface BadgeCounts {
  chat?: number
  content?: boolean // dot indicator for new content
}

interface Props {
  badges?: BadgeCounts
}

/* ── Tab config ────────────────────────────────────────────────────────────── */

const tabs: TabItem[] = [
  { label: 'Home',    href: '/home',    icon: HomeIcon,   iconFilled: HomeIconFilled },
  { label: 'Talk',    href: '/chat',    icon: ChatIcon,   iconFilled: ChatIconFilled, isCenter: true },
  { label: 'Tribes',  href: '/tribes',  icon: TribeIcon,  iconFilled: TribeIconFilled },
  { label: 'Read',    href: '/content', icon: BookIcon,   iconFilled: BookIconFilled },
  { label: 'Me',      href: '/profile', icon: UserIcon,   iconFilled: UserIconFilled },
]

const ACTIVE_COLOR   = '#3D8178'
const INACTIVE_COLOR = '#9CA3AF'

/* ── Component ─────────────────────────────────────────────────────────────── */

export default function PremiumBottomNav({ badges = {} }: Props) {
  const pathname = usePathname()
  const [pressedTab, setPressedTab] = useState<string | null>(null)
  const indicatorRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLElement>(null)

  function isTabActive(href: string): boolean {
    if (href === '/home') return pathname === '/home'
    if (href === '/checkin') return pathname.startsWith('/checkin')
    if (href === '/chat') return pathname.startsWith('/chat')
    return pathname.startsWith(href)
  }

  // Animate indicator position
  const activeIndex = tabs.findIndex(t => isTabActive(t.href))

  useEffect(() => {
    if (indicatorRef.current && activeIndex >= 0) {
      const pct = (activeIndex / tabs.length) * 100
      const tabWidth = 100 / tabs.length
      indicatorRef.current.style.transform = `translateX(${pct}%)`
      indicatorRef.current.style.width = `${tabWidth}%`
    }
  }, [activeIndex])

  return (
    <nav
      ref={navRef}
      aria-label="Main navigation"
      className="premium-bottom-nav"
    >
      {/* Sliding active indicator */}
      <div className="premium-bottom-nav__track">
        <div
          ref={indicatorRef}
          className="premium-bottom-nav__indicator"
          style={{
            width: `${100 / tabs.length}%`,
            transform: `translateX(${(activeIndex >= 0 ? activeIndex : 0) / tabs.length * 100}%)`,
          }}
        />
      </div>

      <div className="premium-bottom-nav__tabs">
        {tabs.map((tab) => {
          const active = isTabActive(tab.href)
          const color = active ? ACTIVE_COLOR : INACTIVE_COLOR
          const IconComponent = active ? tab.iconFilled : tab.icon
          const isPressed = pressedTab === tab.href
          const chatBadge = tab.href === '/chat' && badges.chat && badges.chat > 0
          const contentDot = tab.href === '/content' && badges.content

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? 'page' : undefined}
              className={`premium-bottom-nav__tab ${active ? 'premium-bottom-nav__tab--active' : ''} ${tab.isCenter ? 'premium-bottom-nav__tab--center' : ''}`}
              style={{
                transform: isPressed ? 'scale(0.88)' : 'scale(1)',
              }}
              onPointerDown={() => setPressedTab(tab.href)}
              onPointerUp={() => setPressedTab(null)}
              onPointerLeave={() => setPressedTab(null)}
            >
              <div className={`premium-bottom-nav__icon-wrap ${tab.isCenter ? 'premium-bottom-nav__icon-wrap--center' : ''}`}>
                {tab.isCenter ? (
                  <div className="premium-bottom-nav__center-bg">
                    <IconComponent size={24} color={active ? '#FFFFFF' : INACTIVE_COLOR} />
                  </div>
                ) : (
                  <IconComponent size={22} color={color} />
                )}

                {/* Chat badge */}
                {chatBadge && (
                  <span className="premium-bottom-nav__badge">
                    {badges.chat! > 99 ? '99+' : badges.chat}
                  </span>
                )}

                {/* Content dot */}
                {contentDot && (
                  <span className="premium-bottom-nav__dot" />
                )}
              </div>

              <span
                className="premium-bottom-nav__label"
                style={{
                  color,
                  fontWeight: active ? 700 : 500,
                }}
              >
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

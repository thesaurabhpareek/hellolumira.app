/**
 * @module AppShell
 * @description Root layout shell for the authenticated app experience.
 *   Provides bottom navigation, header, and notification integration.
 * @version 1.0.0
 * @since March 2026
 */
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, MessageCircle, Leaf, BookOpen, User } from 'lucide-react'
import { NotificationBell } from './NotificationBell'
import type { Profile, BabyProfile } from '@/types/app'

interface Props {
  children: React.ReactNode
  profile: Profile
  baby: BabyProfile | null
}

interface TabItem {
  label: string
  href: string
  icon: typeof Home
}

const tabs: TabItem[] = [
  { label: 'Home', href: '/home', icon: Home },
  { label: 'Chat', href: '/chat', icon: MessageCircle },
  { label: 'Tribes', href: '/tribes', icon: Leaf },
  { label: 'Content', href: '/content', icon: BookOpen },
  { label: 'Profile', href: '/profile', icon: User },
]

const SAGE_500 = '#3D8178'
const SAND_500 = '#706D67'
const SAND_100 = '#E8E6E1'

export default function AppShell({
  children,
  profile,
  baby,
}: Props) {
  void baby
  void profile

  const pathname = usePathname()

  function isTabActive(href: string): boolean {
    if (href === '/home') return pathname === '/home'
    return pathname.startsWith(href)
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        fontFamily:
          "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Header */}
      <header
        style={{
          background: '#FFFFFF',
          borderBottom: `1px solid ${SAND_100}`,
          position: 'sticky',
          top: 0,
          zIndex: 100,
          paddingTop: 'max(0px, env(safe-area-inset-top))',
        }}
      >
        <div
          style={{
            maxWidth: '480px',
            margin: '0 auto',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '56px',
            padding: '0 16px',
          }}
        >
          {/* Wordmark */}
          <Link
            href="/home"
            style={{
              fontSize: '22px',
              fontWeight: 700,
              color: SAGE_500,
              textDecoration: 'none',
              letterSpacing: '-0.3px',
            }}
          >
            Lumira
          </Link>

          {/* Notification bell */}
          <NotificationBell />
        </div>
      </header>

      {/* Content area */}
      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: 'calc(56px + max(0px, env(safe-area-inset-bottom)))',
        }}
      >
        <div
          style={{
            maxWidth: '480px',
            margin: '0 auto',
            width: '100%',
          }}
        >
          {children}
        </div>
      </main>

      {/* Bottom Tab Bar */}
      <nav
        aria-label="Main navigation"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: '#FFFFFF',
          borderTop: `1px solid ${SAND_100}`,
          paddingBottom: 'max(0px, env(safe-area-inset-bottom))',
        }}
      >
        <div
          style={{
            maxWidth: '480px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'stretch',
            justifyContent: 'space-around',
            minHeight: '56px',
          }}
        >
          {tabs.map((tab) => {
            const active = isTabActive(tab.href)
            const color = active ? SAGE_500 : SAND_500
            const IconComponent = tab.icon

            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? 'page' : undefined}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 1,
                  minHeight: '56px',
                  minWidth: '48px',
                  gap: '2px',
                  textDecoration: 'none',
                  color,
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation',
                  padding: '6px 0',
                }}
              >
                <IconComponent
                  size={22}
                  strokeWidth={active ? 2.5 : 2}
                  color={color}
                />
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    lineHeight: 1,
                    color,
                  }}
                >
                  {tab.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

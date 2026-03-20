/**
 * @module AppShell
 * @description Root layout shell for the authenticated app experience.
 *   Provides bottom navigation, header, and notification integration.
 * @version 1.1.0 — Migrated inline styles → Tailwind classes
 * @since March 2026
 */
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon, HomeIconFilled,
  HeartIcon, HeartIconFilled,
  BookIcon, BookIconFilled,
  UserIcon, UserIconFilled,
  TribeIcon,
} from '@/components/icons'
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
  icon: (props: { size?: number; color?: string }) => React.ReactNode
  iconFilled: (props: { size?: number; color?: string }) => React.ReactNode
}

const tabs: TabItem[] = [
  { label: 'Home',     href: '/home',    icon: HomeIcon,  iconFilled: HomeIconFilled  },
  { label: 'Check in', href: '/checkin', icon: HeartIcon, iconFilled: HeartIconFilled },
  { label: 'Tribes',   href: '/tribes',  icon: TribeIcon, iconFilled: TribeIcon       },
  { label: 'Read',     href: '/content', icon: BookIcon,  iconFilled: BookIconFilled  },
  { label: 'Me',       href: '/profile', icon: UserIcon,  iconFilled: UserIconFilled  },
]

const ACTIVE_COLOR   = '#3D8178'  // sage-500
const INACTIVE_COLOR = '#9CA3AF'  // gray-400

export default function AppShell({ children, profile, baby }: Props) {
  void baby
  void profile

  const pathname = usePathname()

  function isTabActive(href: string): boolean {
    if (href === '/home') return pathname === '/home'
    if (href === '/checkin') return pathname.startsWith('/checkin')
    if (href === '/tribes') return pathname.startsWith('/tribes')
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-dvh bg-white flex flex-col font-sans">

      {/* ── Header ── */}
      <header className="bg-white border-b border-border sticky top-0 z-[100] safe-top">
        <div className="max-w-content mx-auto w-full flex items-center justify-between h-14 px-4">
          {/* Wordmark */}
          <Link
            href="/home"
            className="text-[22px] font-bold text-primary no-underline tracking-tight [-webkit-tap-highlight-color:transparent]"
          >
            Lumira
          </Link>

          {/* Notification bell */}
          <NotificationBell />
        </div>
      </header>

      {/* ── Main content ── */}
      <main
        className="flex-1 overflow-y-auto overflow-x-hidden [-webkit-overflow-scrolling:touch]"
        style={{ paddingBottom: 'calc(56px + max(0px, env(safe-area-inset-bottom)))' }}
      >
        <div className="max-w-content mx-auto w-full">
          {children}
        </div>
      </main>

      {/* ── Bottom Tab Bar ── */}
      <nav
        aria-label="Main navigation"
        className="fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-border safe-bottom"
      >
        <div className="max-w-content mx-auto flex items-stretch justify-around min-h-14">
          {tabs.map((tab) => {
            const active = isTabActive(tab.href)
            const color  = active ? ACTIVE_COLOR : INACTIVE_COLOR
            const IconComponent = active ? tab.iconFilled : tab.icon

            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? 'page' : undefined}
                className="flex flex-col items-center justify-center flex-1 min-h-[56px] min-w-[48px] gap-[2px] no-underline touch-manipulation py-1.5 [-webkit-tap-highlight-color:transparent]"
                style={{ color }}
              >
                <IconComponent size={22} color={color} />
                <span
                  className="text-[10px] leading-none text-center max-w-full overflow-hidden text-ellipsis whitespace-nowrap"
                  style={{ fontWeight: active ? 700 : 600, color }}
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

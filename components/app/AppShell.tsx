/**
 * @module AppShell
 * @description Root layout shell for the authenticated app experience.
 *   Provides premium bottom navigation, header, page transitions,
 *   and notification integration. iOS-caliber native feel.
 * @version 2.0.0 — Premium navigation, glass morphism, page transitions
 * @since March 2026
 */
'use client'

import type React from 'react'
import { usePathname } from 'next/navigation'
import PremiumBottomNav from './PremiumBottomNav'
import PremiumHeader from './PremiumHeader'
import PageTransition from './PageTransition'
import ThemeToggleButton from './ThemeToggleButton'
import { NotificationBell } from './NotificationBell'
import type { Profile, BabyProfile } from '@/types/app'

interface Props {
  children: React.ReactNode
  profile: Profile
  baby: BabyProfile | null
}

export default function AppShell({ children, profile, baby }: Props) {
  void baby
  void profile

  const pathname = usePathname()

  // Determine if we're on a sub-page (not a root tab)
  const rootTabs = ['/home', '/chat', '/tribes', '/content', '/profile']
  const isRootTab = rootTabs.some(t => pathname === t)
  const isSubPage = !isRootTab && pathname !== '/'

  // Determine page title for sub-pages
  const getPageTitle = (): string | undefined => {
    if (isRootTab) return undefined // Root tabs show wordmark, not title
    if (pathname.startsWith('/chat/')) return 'Chat'
    if (pathname.startsWith('/tribes/')) return 'Tribe'
    if (pathname.startsWith('/content/')) return 'Article'
    if (pathname.startsWith('/settings')) return 'Settings'
    if (pathname.startsWith('/concern')) return 'Concern'
    if (pathname.startsWith('/quiz')) return 'Quiz'
    return undefined
  }

  return (
    <div className="h-dvh bg-[var(--color-white)] flex flex-col font-sans overflow-hidden">

      {/* -- Header -- */}
      <PremiumHeader
        title={getPageTitle()}
        showBack={isSubPage}
        backLabel="Back"
      >
        <ThemeToggleButton />
        <NotificationBell />
      </PremiumHeader>

      {/* -- Main content -- */}
      <main
        className="flex-1 flex flex-col overflow-hidden min-h-0"
        style={{ paddingBottom: 'calc(56px + max(0px, env(safe-area-inset-bottom)))' }}
      >
        <div className="max-w-content mx-auto w-full flex-1 flex flex-col min-h-0 overflow-y-auto overflow-x-hidden [-webkit-overflow-scrolling:touch]">
          <PageTransition>
            {children}
          </PageTransition>
        </div>
      </main>

      {/* -- Bottom Tab Bar -- */}
      <PremiumBottomNav />
    </div>
  )
}

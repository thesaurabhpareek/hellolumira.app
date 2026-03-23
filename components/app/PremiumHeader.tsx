/**
 * @module PremiumHeader
 * @description iOS-style collapsing header with large title, backdrop blur,
 *   search bar expansion, and action button slots.
 * @version 1.0.0
 * @since March 2026
 */
'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ArrowLeftIcon, SearchIcon } from '@/components/icons'
import { NotificationBell } from './NotificationBell'

interface Props {
  /** Large title text (shown in expanded state) */
  title?: string
  /** Show back button with optional label */
  showBack?: boolean
  backLabel?: string
  backHref?: string
  /** Right-side action buttons */
  rightActions?: React.ReactNode
  /** Show search bar */
  showSearch?: boolean
  searchPlaceholder?: string
  onSearch?: (query: string) => void
  /** Progress indicator (0-100) for multi-step flows */
  progress?: number
  /** Breadcrumb items */
  breadcrumbs?: { label: string; href?: string }[]
  /** Children rendered in the header area (e.g. notification bell) */
  children?: React.ReactNode
}

export default function PremiumHeader({
  title,
  showBack = false,
  backLabel = 'Back',
  backHref,
  rightActions,
  showSearch = false,
  searchPlaceholder = 'Search...',
  onSearch,
  progress,
  breadcrumbs,
  children,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [searchExpanded, setSearchExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const headerRef = useRef<HTMLElement>(null)

  // Track scroll for collapse/blur transition
  const getScrollParent = useCallback((): HTMLElement | null => {
    // The header is a sibling of <main>, so we find main via the shared parent
    const parent = headerRef.current?.parentElement
    if (!parent) return null
    const main = parent.querySelector('main')
    if (!main) return null
    // Find the scrollable child inside main
    return main.querySelector('[class*="overflow-y"]') as HTMLElement | null
  }, [])

  const handleScroll = useCallback(() => {
    const scrollParent = getScrollParent()
    if (scrollParent) {
      setScrolled(scrollParent.scrollTop > 20)
    }
  }, [getScrollParent])

  useEffect(() => {
    const scrollParent = getScrollParent()
    if (scrollParent) {
      scrollParent.addEventListener('scroll', handleScroll, { passive: true })
      return () => scrollParent.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll, getScrollParent])

  // Focus search input when expanded
  useEffect(() => {
    if (searchExpanded && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchExpanded])

  const handleBack = () => {
    if (backHref) {
      router.push(backHref)
    } else {
      router.back()
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(searchQuery)
  }

  // Determine if we're on a root tab page (show wordmark) or sub-page (show title)
  const isRootTab = ['/home', '/chat', '/checkin', '/content', '/profile', '/tribes'].includes(pathname)

  return (
    <header
      ref={headerRef}
      className={`premium-header ${scrolled ? 'premium-header--scrolled' : ''}`}
    >
      {/* Progress bar */}
      {progress !== undefined && (
        <div className="premium-header__progress-track">
          <div
            className="premium-header__progress-fill"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}

      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="premium-header__breadcrumbs">
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="premium-header__breadcrumb-sep">/</span>}
              {crumb.href ? (
                <Link href={crumb.href} className="premium-header__breadcrumb-link">
                  {crumb.label}
                </Link>
              ) : (
                <span className="premium-header__breadcrumb-current">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      <div className="premium-header__bar">
        {/* Left side */}
        <div className="premium-header__left">
          {showBack ? (
            <button
              onClick={handleBack}
              className="premium-header__back press-scale"
              aria-label={`Go back: ${backLabel}`}
            >
              <ArrowLeftIcon size={20} color="var(--color-primary)" />
              <span className="premium-header__back-label">{backLabel}</span>
            </button>
          ) : isRootTab && !title ? (
            <Link
              href="/home"
              className="premium-header__wordmark"
            >
              Lumira
            </Link>
          ) : null}
        </div>

        {/* Right side */}
        <div className="premium-header__right">
          {showSearch && !searchExpanded && (
            <button
              onClick={() => setSearchExpanded(true)}
              className="premium-header__search-btn press-scale"
              aria-label="Open search"
            >
              <SearchIcon size={20} color="var(--color-muted)" />
            </button>
          )}
          {rightActions}
          {children || <NotificationBell />}
        </div>
      </div>

      {/* Large title (collapses on scroll) */}
      {title && (
        <div className={`premium-header__title-row ${scrolled ? 'premium-header__title-row--collapsed' : ''}`}>
          <h1 className="premium-header__title">{title}</h1>
        </div>
      )}

      {/* Search bar (expandable) */}
      {searchExpanded && (
        <div className="premium-header__search-row animate-slideUp">
          <form onSubmit={handleSearchSubmit} className="premium-header__search-form">
            <SearchIcon size={18} color="#9CA3AF" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                onSearch?.(e.target.value)
              }}
              placeholder={searchPlaceholder}
              className="premium-header__search-input"
            />
          </form>
          <button
            onClick={() => {
              setSearchExpanded(false)
              setSearchQuery('')
              onSearch?.('')
            }}
            className="premium-header__search-cancel"
          >
            Cancel
          </button>
        </div>
      )}
    </header>
  )
}

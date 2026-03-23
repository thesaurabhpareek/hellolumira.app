/**
 * @module StoryViewer
 * @description Fullscreen overlay viewer for stories. Supports tap navigation
 *   (left 30% = prev, right 70% = next), hold-to-pause, swipe-down dismiss,
 *   and auto-advance with progress bar.
 * @version 1.0.0
 * @since March 2026
 */
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import type { StoryStripItem, Story } from '@/types/app'
import StoryProgressBar from './StoryProgressBar'
import StoryContent from './StoryContent'
import StoryReactionBar from './StoryReactionBar'
import StoryReplyInput from './StoryReplyInput'
import StoryViewersList from './StoryViewersList'
import StoryReportSheet from './StoryReportSheet'

const STORY_DURATION = 6000 // 6 seconds per story

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

interface StoryViewerProps {
  items: StoryStripItem[]
  initialGroupIndex: number
  currentUserId: string
  onClose: () => void
}

export default function StoryViewer({
  items,
  initialGroupIndex,
  currentUserId,
  onClose,
}: StoryViewerProps) {
  const [groupIndex, setGroupIndex] = useState(initialGroupIndex)
  const [storyIndex, setStoryIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [paused, setPaused] = useState(false)
  const [closing, setClosing] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showViewers, setShowViewers] = useState(false)
  const [showReport, setShowReport] = useState(false)

  // Transition animation state
  const [transitioning, setTransitioning] = useState(false)
  const [transitionDir, setTransitionDir] = useState<'left' | 'right'>('right')

  // Swipe dismiss state
  const [touchStartY, setTouchStartY] = useState<number | null>(null)
  const [translateY, setTranslateY] = useState(0)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const viewRecordedRef = useRef(new Set<string>())

  const group = items[groupIndex]
  const stories = group?.stories || []
  const currentStory = stories[storyIndex] as Story | undefined
  const isOwn = group?.profile_id === currentUserId

  // Record view
  useEffect(() => {
    if (!currentStory || isOwn) return
    if (viewRecordedRef.current.has(currentStory.id)) return
    viewRecordedRef.current.add(currentStory.id)

    fetch(`/api/stories/${currentStory.id}/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dwell_ms: STORY_DURATION }),
      credentials: 'same-origin',
    }).catch(() => {})
  }, [currentStory, isOwn])

  // Progress timer
  useEffect(() => {
    if (paused || closing || !currentStory) return

    const interval = 50 // update every 50ms
    const increment = (interval / STORY_DURATION) * 100

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment
        if (next >= 100) {
          // Auto advance
          goNext()
          return 0
        }
        return next
      })
    }, interval)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupIndex, storyIndex, paused, closing])

  const goNext = useCallback(() => {
    if (storyIndex < stories.length - 1 || groupIndex < items.length - 1) {
      setTransitionDir('right')
      setTransitioning(true)
      setTimeout(() => {
        setProgress(0)
        if (storyIndex < stories.length - 1) {
          setStoryIndex((i) => i + 1)
        } else if (groupIndex < items.length - 1) {
          setGroupIndex((i) => i + 1)
          setStoryIndex(0)
        }
        setTransitioning(false)
      }, 150)
    } else {
      handleClose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyIndex, stories.length, groupIndex, items.length])

  const goPrev = useCallback(() => {
    if (storyIndex > 0 || groupIndex > 0) {
      setTransitionDir('left')
      setTransitioning(true)
      setTimeout(() => {
        setProgress(0)
        if (storyIndex > 0) {
          setStoryIndex((i) => i - 1)
        } else if (groupIndex > 0) {
          setGroupIndex((i) => i - 1)
          setStoryIndex(0)
        }
        setTransitioning(false)
      }, 150)
    }
  }, [storyIndex, groupIndex])

  const handleClose = useCallback(() => {
    setClosing(true)
    setTimeout(onClose, 200)
  }, [onClose])

  // Tap zones
  const handleTapZone = (e: React.MouseEvent<HTMLDivElement>) => {
    if (showMenu || showViewers || showReport) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const threshold = rect.width * 0.3

    if (x < threshold) {
      goPrev()
    } else {
      goNext()
    }
  }

  // Hold to pause
  const handlePressStart = () => setPaused(true)
  const handlePressEnd = () => setPaused(false)

  // Swipe down dismiss
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY === null) return
    const deltaY = e.touches[0].clientY - touchStartY
    if (deltaY > 0) {
      setTranslateY(deltaY)
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY === null) return
    const deltaY = e.changedTouches[0].clientY - touchStartY
    const timeDelta = Date.now() // simplified velocity check
    void timeDelta

    if (deltaY > 80) {
      handleClose()
    } else {
      setTranslateY(0)
    }
    setTouchStartY(null)
  }

  // Lock body scroll
  useEffect(() => {
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [])

  // Keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleClose, goNext, goPrev])

  if (!currentStory || !group) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col ${
        closing ? 'animate-story-viewer-out' : 'animate-story-viewer-in'
      }`}
      style={{
        background: 'var(--story-bg-overlay)',
        paddingTop: 'env(safe-area-inset-top)',
        transform: translateY > 0 ? `translateY(${translateY}px)` : undefined,
        opacity: translateY > 0 ? Math.max(0.5, 1 - translateY / 300) : undefined,
        transition: translateY === 0 ? 'transform 0.2s ease, opacity 0.2s ease' : 'none',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Progress bar */}
      <div className="pt-2 pb-2 px-2">
        <StoryProgressBar
          totalStories={stories.length}
          currentIndex={storyIndex}
          progress={progress}
        />
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 pb-3">
        {/* Avatar */}
        {group.avatar_url && group.avatar_url.startsWith('http') ? (
          <Image
            src={group.avatar_url}
            alt={group.display_name}
            width={36}
            height={36}
            className="w-9 h-9 rounded-full object-cover"
            unoptimized
          />
        ) : group.avatar_url ? (
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-xl leading-none">{group.avatar_url}</span>
          </div>
        ) : (
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-sm font-semibold text-white">
              {group.display_name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Name + time */}
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold truncate">
            {isOwn ? 'Your story' : group.display_name}
          </p>
          <p className="text-white/60 text-xs">
            {timeAgo(currentStory.published_at)}
          </p>
        </div>

        {/* Menu (for others' stories) */}
        {!isOwn && (
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="w-10 h-10 flex items-center justify-center rounded-full touch-manipulation"
            style={{ WebkitTapHighlightColor: 'transparent' }}
            aria-label="More options"
          >
            <span className="text-white text-lg tracking-widest">...</span>
          </button>
        )}

        {/* Close */}
        <button
          type="button"
          onClick={handleClose}
          className="w-10 h-10 flex items-center justify-center rounded-full touch-manipulation"
          style={{ WebkitTapHighlightColor: 'transparent' }}
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Menu dropdown */}
      {showMenu && (
        <div className="absolute top-20 right-4 z-10 bg-[var(--color-white)] rounded-lg shadow-lg py-1 min-w-[160px] animate-fade-in">
          <button
            type="button"
            onClick={() => {
              setShowMenu(false)
              setShowReport(true)
              setPaused(true)
            }}
            className="w-full text-left px-4 py-3 text-sm text-destructive font-medium hover:bg-red-50 transition-colors"
            style={{ minHeight: '44px' }}
          >
            Report story
          </button>
        </div>
      )}

      {/* Content area (tap zones + visible nav arrows + transition) */}
      <div
        className="flex-1 flex flex-col mx-2 mb-2 overflow-hidden rounded-lg relative"
        style={{ background: currentStory.text_bg_color || 'var(--story-palette-1)' }}
        onClick={handleTapZone}
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onTouchStart={(e) => {
          handlePressStart()
          handleTouchStart(e)
        }}
        onTouchEnd={(e) => {
          handlePressEnd()
          handleTouchEnd(e)
        }}
        onTouchMove={handleTouchMove}
      >
        {/* Story content with slide transition */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.15s ease-out, opacity 0.15s ease-out',
            transform: transitioning
              ? `translateX(${transitionDir === 'right' ? '-12%' : '12%'}) scale(0.96)`
              : 'translateX(0) scale(1)',
            opacity: transitioning ? 0 : 1,
          }}
        >
          <StoryContent
            story={currentStory}
            isOwn={isOwn}
          />
        </div>

        {/* Prev arrow — Instagram style: small chevron, subtle bg */}
        {(storyIndex > 0 || groupIndex > 0) && (
          <button
            type="button"
            aria-label="Previous story"
            onClick={(e) => { e.stopPropagation(); goPrev() }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center rounded-full touch-manipulation active:scale-90 transition-transform"
            style={{
              width: '28px',
              height: '28px',
              background: 'rgba(255,255,255,0.25)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              WebkitTapHighlightColor: 'transparent',
              boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}

        {/* Next arrow — Instagram style */}
        {(storyIndex < stories.length - 1 || groupIndex < items.length - 1) && (
          <button
            type="button"
            aria-label="Next story"
            onClick={(e) => { e.stopPropagation(); goNext() }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center rounded-full touch-manipulation active:scale-90 transition-transform"
            style={{
              width: '28px',
              height: '28px',
              background: 'rgba(255,255,255,0.25)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              WebkitTapHighlightColor: 'transparent',
              boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 18l6-6-6-6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 pb-4 safe-bottom">
        {isOwn ? (
          /* Author: view count */
          <button
            type="button"
            onClick={() => {
              setShowViewers(true)
              setPaused(true)
            }}
            className="flex items-center gap-2 text-white/70 text-sm font-medium touch-manipulation"
            style={{ minHeight: '44px', WebkitTapHighlightColor: 'transparent' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            {currentStory.view_count} {currentStory.view_count === 1 ? 'view' : 'views'}
          </button>
        ) : (
          /* Viewer: reactions + reply */
          <div className="flex items-center gap-3">
            <StoryReactionBar storyId={currentStory.id} />
            <StoryReplyInput storyId={currentStory.id} />
          </div>
        )}
      </div>

      {/* Viewers list sheet */}
      {showViewers && (
        <StoryViewersList
          storyId={currentStory.id}
          viewCount={currentStory.view_count}
          onClose={() => {
            setShowViewers(false)
            setPaused(false)
          }}
        />
      )}

      {/* Report sheet */}
      {showReport && (
        <StoryReportSheet
          storyId={currentStory.id}
          onClose={() => {
            setShowReport(false)
            setPaused(false)
          }}
        />
      )}
    </div>
  )
}

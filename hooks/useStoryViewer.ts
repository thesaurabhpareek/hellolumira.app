'use client'

/**
 * @module useStoryViewer
 * @description Manages fullscreen story viewer state: progress, navigation,
 *   pause/resume, auto-advance, and swipe dismiss. Uses requestAnimationFrame
 *   for smooth progress bar animation and tracks view dwell time via
 *   POST /api/stories/[id]/view.
 * @version 1.0.0
 * @since March 2026
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import type { Story, StoryStripItem, StoryType } from '@/types/app'

/** Duration (ms) for each story type before auto-advancing. */
const DURATION_BY_TYPE: Record<StoryType, number> = {
  text: 5000,
  image: 6000,
  poll: 8000,
  question: 8000,
}

interface StoryViewerState {
  /** Whether the fullscreen viewer is open. */
  isOpen: boolean
  /** Index of the current user in the stories strip array. */
  currentUserIndex: number
  /** Index of the current story within the current user's stories array. */
  currentStoryIndex: number
  /** Whether the progress timer is paused (e.g. hold-to-pause). */
  isPaused: boolean
  /** Progress of the current story timer, 0 to 1. */
  progress: number
}

interface UseStoryViewerResult extends StoryViewerState {
  /** The currently displayed story object, or null if viewer is closed. */
  currentStory: Story | null
  /** The current user's strip item, or null if viewer is closed. */
  currentUser: StoryStripItem | null
  /** Open the viewer at a specific user's first story. */
  open: (userIndex: number) => void
  /** Close the viewer. */
  close: () => void
  /** Advance to the next story or next user. */
  next: () => void
  /** Go back one story. */
  prev: () => void
  /** Pause the progress timer (e.g. on long-press). */
  pause: () => void
  /** Resume the progress timer. */
  resume: () => void
  /** Jump to a specific user's first story. */
  goToUser: (index: number) => void
}

/**
 * State machine for the fullscreen story viewer.
 *
 * Progress is driven by `requestAnimationFrame` for a smooth 0-to-1
 * animation. When progress reaches 1, the hook auto-advances to the next
 * story, next user, or closes the viewer if all stories are exhausted.
 *
 * View tracking: each story view is reported via `POST /api/stories/[id]/view`
 * with the dwell time in milliseconds when the viewer advances or closes.
 *
 * @param stories - The story strip data (array of users with their stories).
 * @returns Viewer state and navigation methods.
 */
export function useStoryViewer(stories: StoryStripItem[]): UseStoryViewerResult {
  const [state, setState] = useState<StoryViewerState>({
    isOpen: false,
    currentUserIndex: 0,
    currentStoryIndex: 0,
    isPaused: false,
    progress: 0,
  })

  // Refs for the animation-frame timer
  const rafRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)
  const pausedAtRef = useRef<number>(0)
  const elapsedBeforePauseRef = useRef<number>(0)
  const dwellStartRef = useRef<number>(0)

  // Keep a ref to the latest state to avoid stale closures in rAF
  const stateRef = useRef(state)
  stateRef.current = state

  const storiesRef = useRef(stories)
  storiesRef.current = stories

  /** Get the current story object based on indices. */
  const getStory = useCallback(
    (userIdx: number, storyIdx: number): Story | null => {
      const user = storiesRef.current[userIdx]
      if (!user) return null
      return user.stories[storyIdx] ?? null
    },
    []
  )

  /** Report a view to the server (fire-and-forget). */
  const trackView = useCallback((storyId: string, dwellMs: number) => {
    fetch(`/api/stories/${storyId}/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dwell_ms: Math.round(dwellMs) }),
    }).catch(() => {
      // Silent fail — view tracking is non-critical
    })
  }, [])

  /** Send a view event for the current story using dwell time since dwellStartRef. */
  const trackCurrentView = useCallback(() => {
    const s = stateRef.current
    const story = getStory(s.currentUserIndex, s.currentStoryIndex)
    if (story && dwellStartRef.current > 0) {
      const dwell = performance.now() - dwellStartRef.current
      trackView(story.id, dwell)
    }
  }, [getStory, trackView])

  /** Cancel any running animation frame. */
  const cancelTimer = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  /** Start the progress timer for the current story. */
  const startTimer = useCallback(() => {
    cancelTimer()

    const s = stateRef.current
    const story = getStory(s.currentUserIndex, s.currentStoryIndex)
    if (!story) return

    const duration = DURATION_BY_TYPE[story.story_type] ?? 5000
    startTimeRef.current = performance.now()
    elapsedBeforePauseRef.current = 0
    dwellStartRef.current = performance.now()

    const tick = (now: number) => {
      const cur = stateRef.current
      if (!cur.isOpen || cur.isPaused) return

      const elapsed =
        elapsedBeforePauseRef.current + (now - startTimeRef.current)
      const pct = Math.min(elapsed / duration, 1)

      setState((prev) => ({ ...prev, progress: pct }))

      if (pct >= 1) {
        // Auto-advance
        rafRef.current = null
        advanceInternal()
        return
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cancelTimer, getStory])

  /** Internal advance: next story, next user, or close. */
  const advanceInternal = useCallback(() => {
    trackCurrentView()

    const s = stateRef.current
    const user = storiesRef.current[s.currentUserIndex]
    if (!user) return

    if (s.currentStoryIndex < user.stories.length - 1) {
      // Next story for same user
      setState((prev) => ({
        ...prev,
        currentStoryIndex: prev.currentStoryIndex + 1,
        progress: 0,
      }))
    } else if (s.currentUserIndex < storiesRef.current.length - 1) {
      // Next user
      setState((prev) => ({
        ...prev,
        currentUserIndex: prev.currentUserIndex + 1,
        currentStoryIndex: 0,
        progress: 0,
      }))
    } else {
      // Last story of last user — close viewer
      setState({
        isOpen: false,
        currentUserIndex: 0,
        currentStoryIndex: 0,
        isPaused: false,
        progress: 0,
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackCurrentView])

  // Re-start timer when the story changes (user or story index)
  useEffect(() => {
    if (state.isOpen && !state.isPaused) {
      startTimer()
    }
    return cancelTimer
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isOpen, state.currentUserIndex, state.currentStoryIndex])

  // ── Public methods ───────────────────────────────────────────────────────

  const open = useCallback((userIndex: number) => {
    setState({
      isOpen: true,
      currentUserIndex: userIndex,
      currentStoryIndex: 0,
      isPaused: false,
      progress: 0,
    })
  }, [])

  const close = useCallback(() => {
    cancelTimer()
    trackCurrentView()
    setState({
      isOpen: false,
      currentUserIndex: 0,
      currentStoryIndex: 0,
      isPaused: false,
      progress: 0,
    })
  }, [cancelTimer, trackCurrentView])

  const next = useCallback(() => {
    cancelTimer()
    advanceInternal()
  }, [cancelTimer, advanceInternal])

  const prev = useCallback(() => {
    cancelTimer()
    trackCurrentView()

    const s = stateRef.current
    if (s.currentStoryIndex > 0) {
      setState((prev) => ({
        ...prev,
        currentStoryIndex: prev.currentStoryIndex - 1,
        progress: 0,
      }))
    } else if (s.currentUserIndex > 0) {
      const prevUser = storiesRef.current[s.currentUserIndex - 1]
      setState((prev) => ({
        ...prev,
        currentUserIndex: prev.currentUserIndex - 1,
        currentStoryIndex: prevUser ? prevUser.stories.length - 1 : 0,
        progress: 0,
      }))
    }
    // If at the very first story of the first user, do nothing
  }, [cancelTimer, trackCurrentView])

  const pause = useCallback(() => {
    cancelTimer()
    elapsedBeforePauseRef.current +=
      performance.now() - startTimeRef.current
    pausedAtRef.current = performance.now()
    setState((prev) => ({ ...prev, isPaused: true }))
  }, [cancelTimer])

  const resume = useCallback(() => {
    startTimeRef.current = performance.now()
    setState((prev) => ({ ...prev, isPaused: false }))

    // Re-start the rAF loop
    const s = stateRef.current
    const story = getStory(s.currentUserIndex, s.currentStoryIndex)
    if (!story) return

    const duration = DURATION_BY_TYPE[story.story_type] ?? 5000

    const tick = (now: number) => {
      const cur = stateRef.current
      if (!cur.isOpen || cur.isPaused) return

      const elapsed =
        elapsedBeforePauseRef.current + (now - startTimeRef.current)
      const pct = Math.min(elapsed / duration, 1)

      setState((prev) => ({ ...prev, progress: pct }))

      if (pct >= 1) {
        rafRef.current = null
        advanceInternal()
        return
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [getStory, advanceInternal])

  const goToUser = useCallback(
    (index: number) => {
      cancelTimer()
      trackCurrentView()
      setState({
        isOpen: true,
        currentUserIndex: index,
        currentStoryIndex: 0,
        isPaused: false,
        progress: 0,
      })
    },
    [cancelTimer, trackCurrentView]
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelTimer()
    }
  }, [cancelTimer])

  // Derived values
  const currentStory = state.isOpen
    ? getStory(state.currentUserIndex, state.currentStoryIndex)
    : null

  const currentUser = state.isOpen
    ? storiesRef.current[state.currentUserIndex] ?? null
    : null

  return {
    ...state,
    currentStory,
    currentUser,
    open,
    close,
    next,
    prev,
    pause,
    resume,
    goToUser,
  }
}

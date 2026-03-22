/**
 * @module StoryStrip
 * @description Horizontal scrollable strip of story circles for the home feed.
 *   Fetches story data from GET /api/stories, renders OwnStoryCircle first
 *   then other users' circles sorted by recency. Opens StoryViewer on tap.
 * @version 1.0.0
 * @since March 2026
 */
'use client'

import { useState, useEffect, useCallback } from 'react'
import type { StoryStripItem } from '@/types/app'
import { createClient } from '@/lib/supabase/client'
import OwnStoryCircle from './OwnStoryCircle'
import StoryCircle from './StoryCircle'
import StoryViewer from './StoryViewer'
import StoryComposer from './StoryComposer'

export default function StoryStrip() {
  const [items, setItems] = useState<StoryStripItem[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerGroupIndex, setViewerGroupIndex] = useState(0)
  const [composerOpen, setComposerOpen] = useState(false)
  const [tick, setTick] = useState(0)

  // Fetch current user
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUserId(user.id)
    })
  }, [])

  // Fetch stories
  useEffect(() => {
    let cancelled = false

    async function fetchStories() {
      setLoading(true)
      setFetchError(false)
      try {
        const res = await fetch('/api/stories', { credentials: 'same-origin' })
        if (res.ok) {
          const data = await res.json()
          if (!cancelled) setItems(data.stories || [])
        } else {
          if (!cancelled) setFetchError(true)
        }
      } catch {
        if (!cancelled) setFetchError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchStories()
    return () => { cancelled = true }
  }, [tick])

  const refetch = useCallback(() => setTick((t) => t + 1), [])

  const ownItem = items.find((i) => i.profile_id === currentUserId)
  const otherItems = items.filter((i) => i.profile_id !== currentUserId)

  const hasOwnActiveStory = (ownItem?.stories.length ?? 0) > 0
  const ownPreviewUrl = ownItem?.stories[0]?.image_url || null

  const handleCircleClick = (groupIndex: number) => {
    setViewerGroupIndex(groupIndex)
    setViewerOpen(true)
  }

  // Compute the correct index in `items` array for each circle
  const getGroupIndex = (profileId: string) => {
    return items.findIndex((i) => i.profile_id === profileId)
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="mb-4">
        <div
          className="flex gap-3 px-1 py-2 overflow-x-auto no-scrollbar"
          style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}
        >
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 shrink-0">
              <div className="w-[68px] h-[68px] rounded-full lumira-skeleton" />
              <div className="w-10 h-3 rounded lumira-skeleton" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Always render the strip so the user can create their first story.
  // On fetch error, still show OwnStoryCircle so the composer remains accessible.
  return (
    <div className="mb-4">
      <div
        className="flex gap-3 px-1 py-2 overflow-x-auto no-scrollbar"
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          overflowX: 'auto',
        }}
      >
        {/* Own story circle (always first) */}
        <div className="shrink-0">
          <OwnStoryCircle
            hasActiveStory={hasOwnActiveStory}
            previewUrl={ownPreviewUrl}
            onClick={() => {
              if (ownItem) {
                handleCircleClick(getGroupIndex(ownItem.profile_id))
              }
            }}
            onComposerOpen={() => setComposerOpen(true)}
          />
        </div>

        {/* Other users' circles — only shown when fetch succeeded */}
        {!fetchError && otherItems.map((item) => {
          const hasUnread = item.has_unread
          return (
            <div key={item.profile_id} className="shrink-0">
              <StoryCircle
                profileId={item.profile_id}
                displayName={item.display_name}
                avatarUrl={item.avatar_url}
                hasUnread={hasUnread}
                storyCount={item.stories.length}
                onClick={() => handleCircleClick(getGroupIndex(item.profile_id))}
              />
            </div>
          )
        })}
      </div>

      {/* Story Viewer overlay */}
      {viewerOpen && currentUserId && items.length > 0 && (
        <StoryViewer
          items={items}
          initialGroupIndex={viewerGroupIndex}
          currentUserId={currentUserId}
          onClose={() => {
            setViewerOpen(false)
            refetch()
          }}
        />
      )}

      {/* Story Composer */}
      {composerOpen && (
        <StoryComposer
          onClose={() => setComposerOpen(false)}
          onPublished={refetch}
        />
      )}
    </div>
  )
}

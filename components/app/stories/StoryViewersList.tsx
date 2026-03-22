/**
 * @module StoryViewersList
 * @description Bottom sheet showing who has viewed the author's story.
 *   Fetches viewer list from GET /api/stories/[id]/views.
 * @version 1.0.0
 * @since March 2026
 */
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import type { StoryView } from '@/types/app'

interface StoryViewersListProps {
  storyId: string
  viewCount: number
  onClose: () => void
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function StoryViewersList({
  storyId,
  viewCount,
  onClose,
}: StoryViewersListProps) {
  const [viewers, setViewers] = useState<StoryView[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function fetchViewers() {
      try {
        const res = await fetch(`/api/stories/${storyId}/view`, {
          credentials: 'same-origin',
        })
        if (res.ok) {
          const data = await res.json()
          if (!cancelled) setViewers(data.views || [])
        }
      } catch {
        // Silently fail
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchViewers()
    return () => { cancelled = true }
  }, [storyId])

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Sheet */}
      <div
        className="relative w-full max-h-[60vh] bg-white rounded-t-2xl animate-story-sheet-up safe-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="px-5 pb-3 border-b border-border">
          <p className="font-semibold text-foreground text-[15px]">
            {viewCount} {viewCount === 1 ? 'viewer' : 'viewers'}
          </p>
        </div>

        {/* List */}
        <div className="overflow-y-auto px-5 py-3" style={{ maxHeight: 'calc(60vh - 90px)' }}>
          {loading && (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full lumira-skeleton" />
                  <div className="flex-1">
                    <div className="w-24 h-4 lumira-skeleton rounded mb-1" />
                    <div className="w-16 h-3 lumira-skeleton rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && viewers.length === 0 && (
            <p className="text-muted-foreground text-sm text-center py-6">
              No viewers yet
            </p>
          )}

          {!loading &&
            viewers.map((v) => (
              <div key={v.id} className="flex items-center gap-3 py-2.5">
                {v.viewer_avatar_url ? (
                  <Image
                    src={v.viewer_avatar_url}
                    alt={v.viewer_display_name || 'Viewer'}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-sage-50 flex items-center justify-center">
                    <span className="text-sm font-semibold text-sage-500">
                      {(v.viewer_display_name || '?').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {v.viewer_display_name || 'Anonymous'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {timeAgo(v.viewed_at)}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

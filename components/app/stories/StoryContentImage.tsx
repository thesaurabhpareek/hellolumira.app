/**
 * @module StoryContentImage
 * @description Full-bleed image story display with optional caption overlay
 *   at the bottom on a dark gradient.
 * @version 1.0.0
 * @since March 2026
 */
'use client'

import { useState } from 'react'

interface StoryContentImageProps {
  imageUrl: string | null
  imageCaption: string | null
}

export default function StoryContentImage({
  imageUrl,
  imageCaption,
}: StoryContentImageProps) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="flex-1 relative overflow-hidden rounded-lg bg-black">
      {/* Skeleton while loading */}
      {!loaded && (
        <div className="absolute inset-0 lumira-skeleton" />
      )}

      {imageUrl && (
        <img
          src={imageUrl}
          alt="Story"
          className="absolute inset-0 w-full h-full object-cover"
          onLoad={() => setLoaded(true)}
          style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.3s ease' }}
        />
      )}

      {/* Caption overlay */}
      {imageCaption && loaded && (
        <div
          className="absolute bottom-0 left-0 right-0 px-5 pb-6 pt-16"
          style={{
            background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
          }}
        >
          <p className="text-white text-[15px] leading-[1.5] font-medium">
            {imageCaption}
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * @module StoryComposerImage
 * @description Image composer tab for story creation. Provides file picker,
 *   image preview, optional caption input, and upload progress indicator.
 * @version 1.0.0
 * @since March 2026
 */
'use client'

import { useRef, useCallback } from 'react'

const MAX_CAPTION = 200
const ACCEPTED_TYPES = 'image/jpeg,image/png,image/webp'

interface StoryComposerImageProps {
  imageFile: File | null
  imagePreviewUrl: string | null
  caption: string
  onImageSelect: (file: File, previewUrl: string) => void
  onCaptionChange: (caption: string) => void
  uploading: boolean
  uploadProgress: number
}

export default function StoryComposerImage({
  imageFile,
  imagePreviewUrl,
  caption,
  onImageSelect,
  onCaptionChange,
  uploading,
  uploadProgress,
}: StoryComposerImageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      const url = URL.createObjectURL(file)
      onImageSelect(file, url)
    },
    [onImageSelect]
  )

  return (
    <div className="flex flex-col gap-4">
      {/* Image preview or picker */}
      {imagePreviewUrl ? (
        <div className="relative rounded-xl overflow-hidden" style={{ minHeight: '200px' }}>
          <img
            src={imagePreviewUrl}
            alt="Preview"
            className="w-full h-auto max-h-[300px] object-cover rounded-xl"
          />

          {/* Upload progress overlay */}
          {uploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-xl">
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full border-4 border-white/30 border-t-white animate-spin" />
                <span className="text-white text-sm font-medium">
                  {uploadProgress}%
                </span>
              </div>
            </div>
          )}

          {/* Change photo button */}
          {!uploading && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute top-3 right-3 bg-black/50 text-white text-xs font-medium px-3 py-1.5 rounded-full touch-manipulation"
              style={{ minHeight: '32px', WebkitTapHighlightColor: 'transparent' }}
            >
              Change photo
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border py-12 cursor-pointer touch-manipulation transition-colors hover:border-primary hover:bg-sage-50"
          style={{ minHeight: '180px', WebkitTapHighlightColor: 'transparent' }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="3" stroke="var(--color-muted)" strokeWidth="1.5" />
            <circle cx="8.5" cy="8.5" r="1.5" stroke="var(--color-muted)" strokeWidth="1.5" />
            <path d="M21 15L16 10L5 21" stroke="var(--color-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-sm font-medium text-muted-foreground">Choose a photo</span>
        </button>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Caption input */}
      {imageFile && (
        <div className="relative">
          <input
            type="text"
            value={caption}
            onChange={(e) => onCaptionChange(e.target.value.slice(0, MAX_CAPTION))}
            placeholder="Add a caption (optional)"
            maxLength={MAX_CAPTION}
            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none"
            style={{ fontSize: '16px' }}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {caption.length}/{MAX_CAPTION}
          </span>
        </div>
      )}
    </div>
  )
}

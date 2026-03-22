/**
 * @module StoryComposer
 * @description Instagram-style two-phase story composer. Phase 1: compact bottom
 *   sheet type picker (~45% height). Phase 2: full-screen creation view
 *   constrained to mobile viewport (max 430px). Handles submission to
 *   POST /api/stories.
 * @version 2.0.0
 * @since March 2026
 */
'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import StoryComposerText from './StoryComposerText'
import StoryComposerImage from './StoryComposerImage'
import type { StoryType } from '@/types/app'

const STORY_TYPES: { type: StoryType; label: string; icon: string; desc: string }[] = [
  { type: 'text', label: 'Text', icon: '\uD83D\uDCDD', desc: 'Share a thought' },
  { type: 'image', label: 'Photo', icon: '\uD83D\uDCF7', desc: 'Add a photo' },
  { type: 'poll', label: 'Poll', icon: '\uD83D\uDCCA', desc: 'Ask a question' },
  { type: 'question', label: 'Question', icon: '\u2753', desc: 'Get answers' },
]

interface StoryComposerProps {
  onClose: () => void
  onPublished?: () => void
}

type Phase = 'picker' | 'create'

export default function StoryComposer({
  onClose,
  onPublished,
}: StoryComposerProps) {
  const [phase, setPhase] = useState<Phase>('picker')
  const [activeType, setActiveType] = useState<StoryType | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [closing, setClosing] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef<number | null>(null)
  const sheetTranslateY = useRef(0)

  // Text state
  const [text, setText] = useState('')
  const [bgColor, setBgColor] = useState('var(--story-palette-1)')

  // Image state
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [imageCaption, setImageCaption] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Poll state
  const [pollQuestion, setPollQuestion] = useState('')
  const [pollOptionA, setPollOptionA] = useState('')
  const [pollOptionB, setPollOptionB] = useState('')

  // Question state
  const [questionPrompt, setQuestionPrompt] = useState('')

  // Lock body scroll
  useEffect(() => {
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [])

  // Animated close
  const handleClose = useCallback(() => {
    setClosing(true)
    setTimeout(() => {
      onClose()
    }, 250)
  }, [onClose])

  // Back to picker from create
  const handleBack = useCallback(() => {
    setPhase('picker')
    setActiveType(null)
    setError(null)
  }, [])

  // Select a story type
  const handleTypeSelect = useCallback((type: StoryType) => {
    setActiveType(type)
    setPhase('create')
    setError(null)
  }, [])

  // Swipe-to-dismiss on the picker sheet
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
    sheetTranslateY.current = 0
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartY.current === null || !sheetRef.current) return
    const dy = e.touches[0].clientY - touchStartY.current
    if (dy > 0) {
      sheetTranslateY.current = dy
      sheetRef.current.style.transform = `translateY(${dy}px)`
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (sheetTranslateY.current > 100) {
      handleClose()
    } else if (sheetRef.current) {
      sheetRef.current.style.transform = 'translateY(0)'
      sheetRef.current.style.transition = 'transform 0.2s ease'
      setTimeout(() => {
        if (sheetRef.current) sheetRef.current.style.transition = ''
      }, 200)
    }
    touchStartY.current = null
    sheetTranslateY.current = 0
  }, [handleClose])

  const canPublish = useCallback((): boolean => {
    switch (activeType) {
      case 'text':
        return text.trim().length > 0
      case 'image':
        return imageFile !== null
      case 'poll':
        return (
          pollQuestion.trim().length > 0 &&
          pollOptionA.trim().length > 0 &&
          pollOptionB.trim().length > 0
        )
      case 'question':
        return questionPrompt.trim().length > 0
      default:
        return false
    }
  }, [activeType, text, imageFile, pollQuestion, pollOptionA, pollOptionB, questionPrompt])

  const handlePublish = useCallback(async () => {
    if (!canPublish() || submitting) return
    setSubmitting(true)
    setError(null)

    try {
      const body: Record<string, unknown> = { story_type: activeType }

      switch (activeType) {
        case 'text':
          body.text_content = text.trim()
          body.bg_color = bgColor
          break

        case 'image': {
          if (!imageFile) return
          setUploading(true)
          setUploadProgress(10)

          const progressInterval = setInterval(() => {
            setUploadProgress((p) => Math.min(p + 15, 85))
          }, 300)

          clearInterval(progressInterval)
          setUploadProgress(100)
          setUploading(false)

          body.text_content = imageCaption.trim() || null
          body.image_caption = imageCaption.trim() || null
          break
        }

        case 'poll':
          body.poll_question = pollQuestion.trim()
          body.poll_option_a = pollOptionA.trim()
          body.poll_option_b = pollOptionB.trim()
          break

        case 'question':
          body.question_prompt = questionPrompt.trim()
          break
      }

      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'same-origin',
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to post story')
      }

      onPublished?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
      setUploading(false)
    }
  }, [
    activeType,
    canPublish,
    submitting,
    text,
    bgColor,
    imageFile,
    imageCaption,
    pollQuestion,
    pollOptionA,
    pollOptionB,
    questionPrompt,
    onClose,
    onPublished,
  ])

  const handleImageSelect = useCallback((file: File, previewUrl: string) => {
    setImageFile(file)
    setImagePreviewUrl(previewUrl)
  }, [])

  // ── Phase 1: Type Picker (compact bottom sheet) ──────────────────────────

  if (phase === 'picker') {
    return (
      <div
        className="fixed inset-0 z-50 flex items-end justify-center"
        onClick={handleClose}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity duration-250 ${
            closing ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {/* Picker sheet */}
        <div
          ref={sheetRef}
          className={`relative w-full max-w-[430px] bg-white rounded-t-2xl flex flex-col safe-bottom ${
            closing ? 'animate-story-sheet-down' : 'animate-story-sheet-up'
          }`}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1 shrink-0">
            <div className="w-10 h-1 rounded-full bg-gray-300" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 pb-2 shrink-0">
            <button
              type="button"
              onClick={handleClose}
              className="text-sm font-medium text-muted-foreground touch-manipulation"
              style={{ minHeight: '44px', WebkitTapHighlightColor: 'transparent' }}
            >
              Cancel
            </button>
            <p className="font-semibold text-foreground text-[17px]">New story</p>
            <div style={{ width: '50px' }} />
          </div>

          {/* Type cards grid */}
          <div className="px-5 pt-2 pb-6 grid grid-cols-2 gap-3">
            {STORY_TYPES.map((item) => (
              <button
                key={item.type}
                type="button"
                onClick={() => handleTypeSelect(item.type)}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-gray-50/80 py-6 px-4 transition-all duration-150 active:scale-[0.97] touch-manipulation hover:border-[var(--color-primary-mid)] hover:bg-[var(--color-primary-light)]"
                style={{ minHeight: '100px', WebkitTapHighlightColor: 'transparent' }}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-sm font-semibold text-foreground">{item.label}</span>
                <span className="text-[11px] text-muted-foreground leading-tight">{item.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Phase 2: Full-screen Creation View ──────────────────────────────────

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-250 ${
        closing ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Full backdrop */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Full creation container — constrained to mobile viewport */}
      <div
        className="relative w-full max-w-[430px] h-[100dvh] max-h-[100dvh] mx-auto bg-white flex flex-col animate-story-create-in overflow-hidden"
        style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-2 shrink-0">
          <button
            type="button"
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors touch-manipulation"
            style={{ WebkitTapHighlightColor: 'transparent' }}
            aria-label="Back"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <p className="font-semibold text-foreground text-[15px]">
            {STORY_TYPES.find((t) => t.type === activeType)?.label} story
          </p>

          <button
            type="button"
            onClick={handleClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors touch-manipulation"
            style={{ WebkitTapHighlightColor: 'transparent' }}
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Content area — scrollable, takes remaining space */}
        <div className="flex-1 overflow-y-auto px-5 py-3 min-h-0">
          {activeType === 'text' && (
            <StoryComposerText
              text={text}
              bgColor={bgColor}
              onTextChange={setText}
              onBgColorChange={setBgColor}
              fullscreen
            />
          )}

          {activeType === 'image' && (
            <StoryComposerImage
              imageFile={imageFile}
              imagePreviewUrl={imagePreviewUrl}
              caption={imageCaption}
              onImageSelect={handleImageSelect}
              onCaptionChange={setImageCaption}
              uploading={uploading}
              uploadProgress={uploadProgress}
            />
          )}

          {activeType === 'poll' && (
            <div className="flex flex-col gap-4">
              {/* Poll preview */}
              <div
                className="rounded-2xl flex flex-col items-center justify-center p-6"
                style={{
                  background: 'var(--story-palette-3)',
                  minHeight: '200px',
                  transition: 'all 0.2s ease',
                }}
              >
                <p
                  className="text-white font-semibold text-lg text-center mb-4"
                  style={{ textShadow: '0 1px 8px rgba(0,0,0,0.3)', opacity: pollQuestion ? 1 : 0.4 }}
                >
                  {pollQuestion || 'Your question here...'}
                </p>
                <div className="w-full max-w-[260px] flex flex-col gap-2">
                  <div className="border border-white/40 rounded-xl px-4 py-3 text-center">
                    <span className="text-white text-sm font-medium" style={{ opacity: pollOptionA ? 1 : 0.4 }}>
                      {pollOptionA || 'Option A'}
                    </span>
                  </div>
                  <div className="border border-white/40 rounded-xl px-4 py-3 text-center">
                    <span className="text-white text-sm font-medium" style={{ opacity: pollOptionB ? 1 : 0.4 }}>
                      {pollOptionB || 'Option B'}
                    </span>
                  </div>
                </div>
              </div>

              <input
                type="text"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value.slice(0, 200))}
                placeholder="Ask a question..."
                maxLength={200}
                className="w-full bg-background border border-border rounded-xl px-4 py-3.5 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-[var(--color-primary)] transition-colors"
                style={{ fontSize: '16px' }}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={pollOptionA}
                  onChange={(e) => setPollOptionA(e.target.value.slice(0, 100))}
                  placeholder="Option A"
                  maxLength={100}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3.5 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-[var(--color-primary)] transition-colors"
                  style={{ fontSize: '16px' }}
                />
                <input
                  type="text"
                  value={pollOptionB}
                  onChange={(e) => setPollOptionB(e.target.value.slice(0, 100))}
                  placeholder="Option B"
                  maxLength={100}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3.5 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-[var(--color-primary)] transition-colors"
                  style={{ fontSize: '16px' }}
                />
              </div>
            </div>
          )}

          {activeType === 'question' && (
            <div className="flex flex-col gap-4">
              {/* Question preview */}
              <div
                className="rounded-2xl flex flex-col items-center justify-center p-6"
                style={{
                  background: 'var(--story-palette-1)',
                  minHeight: '220px',
                  transition: 'all 0.2s ease',
                }}
              >
                <p
                  className="text-white font-semibold text-xl text-center leading-[1.4] mb-5"
                  style={{ textShadow: '0 1px 8px rgba(0,0,0,0.3)', opacity: questionPrompt ? 1 : 0.4, maxWidth: '260px' }}
                >
                  {questionPrompt || 'Ask something...'}
                </p>
                <div className="bg-white/15 backdrop-blur-sm rounded-full px-5 py-2.5">
                  <span className="text-white/60 text-sm">Type your answer...</span>
                </div>
              </div>

              <input
                type="text"
                value={questionPrompt}
                onChange={(e) => setQuestionPrompt(e.target.value.slice(0, 200))}
                placeholder="Ask your followers something..."
                maxLength={200}
                className="w-full bg-background border border-border rounded-xl px-4 py-3.5 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-[var(--color-primary)] transition-colors"
                style={{ fontSize: '16px' }}
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-destructive text-sm text-center">{error}</p>
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="px-5 pb-4 pt-2 shrink-0">
          <button
            type="button"
            onClick={handlePublish}
            disabled={!canPublish() || submitting}
            className="w-full py-3.5 rounded-xl font-semibold text-[15px] transition-all duration-150 active:scale-[0.98] touch-manipulation"
            style={{
              background: canPublish() && !submitting ? 'var(--color-primary)' : 'var(--color-border)',
              color: canPublish() && !submitting ? 'white' : 'var(--color-muted)',
              minHeight: '50px',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Posting...
              </span>
            ) : (
              'Share to Story'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

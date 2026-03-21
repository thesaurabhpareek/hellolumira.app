'use client'

/**
 * @module useStoryComposer
 * @description Manages story composer state: text input, type selection,
 *   background colour, image selection, poll/question fields, and submission.
 *   Supports draft persistence via localStorage and image preview URL
 *   lifecycle management (revoke on unmount or clear).
 * @version 1.0.0
 * @since March 2026
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import type { StoryType } from '@/types/app'
import { useStoryUpload } from './useStoryUpload'

/** Maximum character count for the main text content. */
const TEXT_MAX_LENGTH = 280
/** Maximum character count for image captions. */
const CAPTION_MAX_LENGTH = 200
/** localStorage key for draft persistence. */
const DRAFT_KEY = 'lumira_story_draft'
/** Allowed image MIME types. */
const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
])

interface ComposerState {
  storyType: StoryType
  textContent: string
  bgColor: string
  imageFile: File | null
  imagePreviewUrl: string | null
  imageCaption: string
  pollQuestion: string
  pollOptionA: string
  pollOptionB: string
  questionPrompt: string
  isSubmitting: boolean
  error: string | null
}

interface DraftData {
  storyType: StoryType
  textContent: string
  bgColor: string
  imageCaption: string
  pollQuestion: string
  pollOptionA: string
  pollOptionB: string
  questionPrompt: string
}

interface UseStoryComposerParams {
  /** Profile ID of the current user (needed for image uploads). */
  profileId: string
  /** Called after a successful submission. */
  onSuccess?: () => void
}

interface UseStoryComposerResult extends ComposerState {
  /** Switch the story type (text, image, poll, question). */
  setType: (type: StoryType) => void
  /** Set the main text content (enforces 280-char limit). */
  setText: (text: string) => void
  /** Set the background colour CSS variable name. */
  setBgColor: (color: string) => void
  /** Set an image file for an image story (validates type). */
  setImage: (file: File) => void
  /** Clear the selected image and revoke its preview URL. */
  clearImage: () => void
  /** Set the image caption (enforces 200-char limit). */
  setImageCaption: (caption: string) => void
  /** Set the poll question text. */
  setPollQuestion: (q: string) => void
  /** Set poll option A text. */
  setPollOptionA: (a: string) => void
  /** Set poll option B text. */
  setPollOptionB: (b: string) => void
  /** Set the question prompt text. */
  setQuestionPrompt: (q: string) => void
  /** Validate, compress, upload (if image), and POST the story. */
  submit: () => Promise<void>
  /** Reset all composer state to defaults. */
  reset: () => void
  /** Restore draft state from localStorage. */
  loadDraft: () => void
  /** Persist current state to localStorage (excludes imageFile). */
  saveDraft: () => void
  /** Whether the story upload hook is currently uploading an image. */
  imageUploading: boolean
}

const INITIAL_STATE: ComposerState = {
  storyType: 'text',
  textContent: '',
  bgColor: '--story-palette-1',
  imageFile: null,
  imagePreviewUrl: null,
  imageCaption: '',
  pollQuestion: '',
  pollOptionA: '',
  pollOptionB: '',
  questionPrompt: '',
  isSubmitting: false,
  error: null,
}

/**
 * Full-featured composer state for creating stories.
 *
 * Handles text, image, poll, and question story types. Image stories are
 * compressed client-side via {@link useStoryUpload} before uploading to
 * Supabase Storage. Draft state (excluding the image File) is persisted to
 * localStorage so users don't lose work on accidental navigation.
 *
 * @param params - Profile ID and optional success callback.
 * @returns Composer state and action methods.
 */
export function useStoryComposer(
  params: UseStoryComposerParams
): UseStoryComposerResult {
  const { profileId, onSuccess } = params
  const [state, setState] = useState<ComposerState>(INITIAL_STATE)
  const previewUrlRef = useRef<string | null>(null)
  const { upload, uploading: imageUploading } = useStoryUpload()

  // Revoke the current preview URL if one exists
  const revokePreview = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }
  }, [])

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      revokePreview()
    }
  }, [revokePreview])

  // ── Setters ──────────────────────────────────────────────────────────────

  const setType = useCallback((type: StoryType) => {
    setState((prev) => ({ ...prev, storyType: type, error: null }))
  }, [])

  const setText = useCallback((text: string) => {
    setState((prev) => ({
      ...prev,
      textContent: text.slice(0, TEXT_MAX_LENGTH),
      error: null,
    }))
  }, [])

  const setBgColor = useCallback((color: string) => {
    setState((prev) => ({ ...prev, bgColor: color }))
  }, [])

  const setImage = useCallback(
    (file: File) => {
      if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
        setState((prev) => ({
          ...prev,
          error: 'Only JPEG, PNG, and WebP images are allowed.',
        }))
        return
      }

      revokePreview()
      const previewUrl = URL.createObjectURL(file)
      previewUrlRef.current = previewUrl

      setState((prev) => ({
        ...prev,
        imageFile: file,
        imagePreviewUrl: previewUrl,
        error: null,
      }))
    },
    [revokePreview]
  )

  const clearImage = useCallback(() => {
    revokePreview()
    setState((prev) => ({
      ...prev,
      imageFile: null,
      imagePreviewUrl: null,
    }))
  }, [revokePreview])

  const setImageCaption = useCallback((caption: string) => {
    setState((prev) => ({
      ...prev,
      imageCaption: caption.slice(0, CAPTION_MAX_LENGTH),
    }))
  }, [])

  const setPollQuestion = useCallback((q: string) => {
    setState((prev) => ({ ...prev, pollQuestion: q }))
  }, [])

  const setPollOptionA = useCallback((a: string) => {
    setState((prev) => ({ ...prev, pollOptionA: a }))
  }, [])

  const setPollOptionB = useCallback((b: string) => {
    setState((prev) => ({ ...prev, pollOptionB: b }))
  }, [])

  const setQuestionPrompt = useCallback((q: string) => {
    setState((prev) => ({ ...prev, questionPrompt: q }))
  }, [])

  // ── Draft persistence ────────────────────────────────────────────────────

  const saveDraft = useCallback(() => {
    const draft: DraftData = {
      storyType: state.storyType,
      textContent: state.textContent,
      bgColor: state.bgColor,
      imageCaption: state.imageCaption,
      pollQuestion: state.pollQuestion,
      pollOptionA: state.pollOptionA,
      pollOptionB: state.pollOptionB,
      questionPrompt: state.questionPrompt,
    }

    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    } catch {
      // Silent fail — quota exceeded or private browsing
    }
  }, [state])

  const loadDraft = useCallback(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (!raw) return

      const draft = JSON.parse(raw) as DraftData
      setState((prev) => ({
        ...prev,
        storyType: draft.storyType ?? 'text',
        textContent: draft.textContent ?? '',
        bgColor: draft.bgColor ?? '--story-palette-1',
        imageCaption: draft.imageCaption ?? '',
        pollQuestion: draft.pollQuestion ?? '',
        pollOptionA: draft.pollOptionA ?? '',
        pollOptionB: draft.pollOptionB ?? '',
        questionPrompt: draft.questionPrompt ?? '',
        error: null,
      }))
    } catch {
      // Corrupted draft — ignore
    }
  }, [])

  // ── Reset ────────────────────────────────────────────────────────────────

  const reset = useCallback(() => {
    revokePreview()
    setState(INITIAL_STATE)

    try {
      localStorage.removeItem(DRAFT_KEY)
    } catch {
      // Silent fail
    }
  }, [revokePreview])

  // ── Submit ───────────────────────────────────────────────────────────────

  const submit = useCallback(async () => {
    setState((prev) => ({ ...prev, isSubmitting: true, error: null }))

    try {
      let imageUrl: string | null = null

      // If image story, compress and upload first
      if (state.storyType === 'image') {
        if (!state.imageFile) {
          throw new Error('Please select an image for your story.')
        }
        imageUrl = await upload(state.imageFile, profileId)
      }

      // Build the request body
      const body: Record<string, unknown> = {
        story_type: state.storyType,
        text_content: state.textContent || null,
        bg_color: state.bgColor,
      }

      if (state.storyType === 'image') {
        body.image_url = imageUrl
        body.image_caption = state.imageCaption || null
      }

      if (state.storyType === 'poll') {
        body.poll_question = state.pollQuestion
        body.poll_option_a = state.pollOptionA
        body.poll_option_b = state.pollOptionB
      }

      if (state.storyType === 'question') {
        body.question_prompt = state.questionPrompt
      }

      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(
          (data as { error?: string }).error || 'Failed to publish story'
        )
      }

      // Success — reset state and clear draft
      revokePreview()
      setState(INITIAL_STATE)

      try {
        localStorage.removeItem(DRAFT_KEY)
      } catch {
        // Silent fail
      }

      onSuccess?.()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong'
      setState((prev) => ({ ...prev, error: message }))
    } finally {
      setState((prev) => ({ ...prev, isSubmitting: false }))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.storyType,
    state.imageFile,
    state.textContent,
    state.bgColor,
    state.imageCaption,
    state.pollQuestion,
    state.pollOptionA,
    state.pollOptionB,
    state.questionPrompt,
    profileId,
    onSuccess,
    upload,
    revokePreview,
  ])

  return {
    ...state,
    imageUploading,
    setType,
    setText,
    setBgColor,
    setImage,
    clearImage,
    setImageCaption,
    setPollQuestion,
    setPollOptionA,
    setPollOptionB,
    setQuestionPrompt,
    submit,
    reset,
    loadDraft,
    saveDraft,
  }
}

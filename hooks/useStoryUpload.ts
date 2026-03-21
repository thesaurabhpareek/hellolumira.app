'use client'

/**
 * @module useStoryUpload
 * @description Handles client-side image compression and upload to Supabase
 *   Storage. Compresses images to a maximum width of 1200px at 0.85 JPEG
 *   quality before uploading to the `stories` bucket. Rejects files that
 *   exceed 5 MB after compression.
 * @version 1.0.0
 * @since March 2026
 */

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

/** Maximum width (px) for compressed story images. */
const MAX_WIDTH = 1200
/** JPEG compression quality (0–1). */
const JPEG_QUALITY = 0.85
/** Maximum compressed file size in bytes (5 MB). */
const MAX_FILE_SIZE = 5 * 1024 * 1024

interface UseStoryUploadResult {
  /** Whether an upload is currently in progress. */
  uploading: boolean
  /** Upload progress as a fraction 0–1 (currently binary: 0 or 1). */
  progress: number
  /** Error message from the most recent operation, or null. */
  error: string | null
  /**
   * Compress and upload an image file to Supabase Storage.
   * @param file - The original image File from the user.
   * @param profileId - The current user's profile ID (used in the storage path).
   * @returns The public URL of the uploaded image.
   */
  upload: (file: File, profileId: string) => Promise<string>
  /**
   * Compress an image without uploading. Useful for preview generation.
   * @param file - The original image File.
   * @returns A compressed JPEG Blob.
   */
  compressImage: (file: File) => Promise<Blob>
}

/**
 * Compress an image file using an off-screen canvas.
 *
 * - Scales down to {@link MAX_WIDTH} while maintaining aspect ratio.
 * - Encodes as JPEG at {@link JPEG_QUALITY}.
 * - Rejects if the result exceeds {@link MAX_FILE_SIZE}.
 */
function compressImageImpl(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      let { width, height } = img

      // Scale down if wider than MAX_WIDTH, preserving aspect ratio
      if (width > MAX_WIDTH) {
        height = Math.round((height * MAX_WIDTH) / width)
        width = MAX_WIDTH
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Could not create canvas context'))
        return
      }

      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Image compression failed'))
            return
          }

          if (blob.size > MAX_FILE_SIZE) {
            reject(
              new Error(
                'Image is too large after compression. Please choose a smaller image.'
              )
            )
            return
          }

          resolve(blob)
        },
        'image/jpeg',
        JPEG_QUALITY
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image for compression'))
    }

    img.src = url
  })
}

/**
 * Upload a compressed blob to Supabase Storage and return its public URL.
 */
async function uploadImageImpl(
  blob: Blob,
  profileId: string
): Promise<string> {
  const supabase = createClient()
  const path = `stories/${profileId}/${Date.now()}.jpg`

  const { error } = await supabase.storage
    .from('stories')
    .upload(path, blob, {
      contentType: 'image/jpeg',
      upsert: false,
    })

  if (error) {
    throw new Error(error.message || 'Upload failed')
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('stories').getPublicUrl(path)

  return publicUrl
}

/**
 * Provides image compression and Supabase Storage upload for story images.
 *
 * Usage:
 * ```ts
 * const { upload, uploading, error } = useStoryUpload()
 * const url = await upload(file, profileId)
 * ```
 *
 * @returns Upload state and action methods.
 */
export function useStoryUpload(): UseStoryUploadResult {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const compressImage = useCallback(async (file: File): Promise<Blob> => {
    return compressImageImpl(file)
  }, [])

  const upload = useCallback(
    async (file: File, profileId: string): Promise<string> => {
      setUploading(true)
      setProgress(0)
      setError(null)

      try {
        const compressed = await compressImageImpl(file)
        setProgress(0.5)

        const publicUrl = await uploadImageImpl(compressed, profileId)
        setProgress(1)

        return publicUrl
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Upload failed'
        setError(message)
        throw err
      } finally {
        setUploading(false)
      }
    },
    []
  )

  return { uploading, progress, error, upload, compressImage }
}

'use client'

/**
 * PasskeyNudge — client component that renders the passkey enrollment bottom sheet.
 * Import this in app/(app)/home/page.tsx and render <PasskeyNudge /> at the end of
 * the page content to show the enrollment prompt after a user signs in via magic link.
 *
 * Usage in page.tsx:
 *   import PasskeyNudge from './PasskeyNudge'
 *   // ... at the end of the returned JSX:
 *   <PasskeyNudge />
 */

import { useState, useEffect } from 'react'
import PasskeyEnrollmentSheet, { getPasskeyEnrollmentNudgeState } from '@/components/app/PasskeyEnrollmentSheet'

export default function PasskeyNudge() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Evaluate nudge state client-side after hydration
    const { shouldShow } = getPasskeyEnrollmentNudgeState()
    if (shouldShow) {
      // Small delay so the page renders first before sheet slides up
      const timer = setTimeout(() => setIsOpen(true), 1200)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleClose = () => {
    setIsOpen(false)
  }

  const handleEnrolled = () => {
    setIsOpen(false)
  }

  if (!isOpen) return null

  return (
    <PasskeyEnrollmentSheet
      isOpen={isOpen}
      onClose={handleClose}
      onEnrolled={handleEnrolled}
    />
  )
}

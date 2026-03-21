/**
 * @module DismissiblePatternFlag
 * @description Client-side wrapper that makes PatternFlagCard dismissible
 *   via local state (used in the server-rendered home page).
 * @version 1.0.0
 * @since March 2026
 */
'use client'

import { useState } from 'react'
import PatternFlagCard from './PatternFlagCard'
import type { PatternType } from '@/types/app'

interface Props {
  type: PatternType
  message: string
}

export default function DismissiblePatternFlag({ type, message }: Props) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="mb-4">
      <PatternFlagCard type={type} message={message} onDismiss={() => setDismissed(true)} />
    </div>
  )
}

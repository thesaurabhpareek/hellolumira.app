// components/app/ProfilePromptCard.tsx — Dismissible profile completion prompt
'use client'

import { useState } from 'react'
import Link from 'next/link'

interface ProfilePromptCardProps {
  missingItem?: string
}

export default function ProfilePromptCard({ missingItem }: ProfilePromptCardProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="relative bg-terra-50 border-[1.5px] border-accent rounded-lg p-5 mb-4">
      {/* Dismiss button */}
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="absolute top-3 right-3 w-12 h-12 flex items-center justify-center bg-transparent border-none cursor-pointer text-accent text-[20px] p-0"
      >
        ✕
      </button>

      <p className="text-[16px] font-bold text-foreground mb-[6px] pr-9">
        Help Lumira personalise your experience
      </p>
      <p className="text-sm text-muted-foreground leading-[1.5] mb-4">
        {missingItem || 'A couple of quick questions about your feeding approach'}
      </p>
      <Link
        href="/profile"
        className="inline-flex items-center justify-center h-12 px-6 rounded-md bg-accent text-white text-[15px] font-semibold no-underline transition-opacity duration-150 ease-out"
      >
        Answer 2 quick questions
      </Link>
    </div>
  )
}

/**
 * @module GreetingHeader
 * @description Client component that renders a time-aware, personalised h1
 *   greeting using the user's *local* browser time.
 * @version 1.1.0 — Migrated inline styles → Tailwind classes
 * @since March 2026
 */
'use client'

import { useEffect, useState } from 'react'
import { getGreeting } from '@/lib/greeting'

interface Props {
  firstName: string
}

export default function GreetingHeader({ firstName }: Props) {
  const [greeting, setGreeting] = useState<string>(`Hello, ${firstName}`)

  useEffect(() => {
    const localHour = new Date().getHours()
    setGreeting(getGreeting(localHour, firstName))
  }, [firstName])

  return (
    <h1 className="text-h2 text-foreground mb-1">
      {greeting}
    </h1>
  )
}

/**
 * @module GreetingHeader
 * @description Client component that renders a time-aware, personalised h1
 *   greeting using the user's *local* browser time.
 *
 *   Why a client component?
 *   The home page is a server component rendered at request time in UTC.
 *   Using server-time hours would give wrong results for users in different
 *   time zones (e.g. "Good night" at 8pm IST when the server says 2pm UTC).
 *   This component hydrates on the client and immediately corrects to the
 *   user's local hour, eliminating the mismatch.
 *
 *   SSR behaviour: renders "Hello, {name}" on the server (neutral, no flash)
 *   then immediately updates to the correct time-based greeting after mount.
 *
 * @version 1.0.0
 * @since March 2026
 */
'use client'

import { useEffect, useState } from 'react'
import { getGreeting } from '@/lib/greeting'

interface Props {
  firstName: string
}

export default function GreetingHeader({ firstName }: Props) {
  // Server-safe initial value: neutral, avoids hydration mismatch
  const [greeting, setGreeting] = useState<string>(`Hello, ${firstName}`)

  useEffect(() => {
    // Runs only on the client — reads the user's actual local time
    const localHour = new Date().getHours()
    setGreeting(getGreeting(localHour, firstName))
  }, [firstName])

  return (
    <h1
      className="text-h2"
      style={{ color: 'var(--color-slate)', marginBottom: '4px' }}
    >
      {greeting}
    </h1>
  )
}

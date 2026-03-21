// app/login/layout.tsx — Metadata for the login route
// Login page is a client component, so metadata lives here in a server layout.
import type React from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign in — Lumira',
  description: 'Sign in to Lumira, your AI parenting companion, with a magic link — no password needed.',
  robots: { index: false, follow: false },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

// app/legal/cookies/page.tsx — Cookie Policy
// Lumira uses minimal cookies (session auth only). Redirects to AI & Data Practices.
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy — Lumira',
  description: 'How Lumira uses cookies. We use only essential session cookies — no tracking, no advertising.',
}

export default function CookiePolicyPage() {
  redirect('/legal/data-practices')
}

// app/page.tsx — Landing page entry point
// v1.3 — Use Suspense boundary instead of force-dynamic + next/dynamic ssr:false
//         Fixes 404 on Vercel production (serverless function crash)
import { Suspense } from 'react'
import LandingPageClient from './LandingPageClient'

function LandingPageFallback() {
  return <div style={{ backgroundColor: 'var(--color-surface)', minHeight: '100dvh' }} />
}

export default function Page() {
  return (
    <Suspense fallback={<LandingPageFallback />}>
      <LandingPageClient />
    </Suspense>
  )
}

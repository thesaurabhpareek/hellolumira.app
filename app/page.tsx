// app/page.tsx — Landing page entry point
// v1.2 — Force dynamic rendering to avoid SSG prerender issues
import nextDynamic from 'next/dynamic'

// Force server-side dynamic rendering (skip SSG prerender)
export const dynamic = 'force-dynamic'

// Dynamic import with SSR disabled — LandingPageClient uses useSearchParams + client Supabase
const LandingPage = nextDynamic(() => import('./LandingPageClient'), {
  ssr: false,
  loading: () => <div style={{ backgroundColor: '#FAFAF8', minHeight: '100dvh' }} />,
})

export default function Page() {
  return <LandingPage />
}

// app/api/health/route.ts — Health check endpoint
// Returns 200 with service status for uptime monitoring and deployment gates

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SECURITY_HEADERS } from '@/lib/utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const start = Date.now()

  let dbStatus: 'ok' | 'error' = 'error'
  let dbLatencyMs: number | null = null

  try {
    const supabase = await createClient()
    const dbStart = Date.now()
    const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true })
    dbLatencyMs = Date.now() - dbStart
    if (!error) dbStatus = 'ok'
  } catch {
    // dbStatus remains 'error'
  }

  const healthy = dbStatus === 'ok'

  return NextResponse.json(
    {
      status: healthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        database: { status: dbStatus, latencyMs: dbLatencyMs },
      },
      responseTimeMs: Date.now() - start,
    },
    { status: healthy ? 200 : 503, headers: SECURITY_HEADERS }
  )
}

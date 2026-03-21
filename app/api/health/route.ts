// app/api/health/route.ts — Health check endpoint
// Returns 200 with service status for uptime monitoring and deployment gates

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SECURITY_HEADERS } from '@/lib/utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  let dbStatus: 'ok' | 'error' = 'error'

  try {
    const supabase = await createClient()
    const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true })
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
        database: { status: dbStatus },
      },
    },
    { status: healthy ? 200 : 503, headers: SECURITY_HEADERS }
  )
}

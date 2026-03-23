// app/api/auth/passkey/factors/route.ts
// Returns the list of passkeys registered by the authenticated user.

import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const service = await createServiceClient()
    const { data: passkeys } = await service
      .from('passkeys')
      .select('id, device_hint, device_type, backed_up, created_at, last_used_at, status')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    return NextResponse.json({ passkeys: passkeys ?? [] })
  } catch (err) {
    console.error('[passkey/factors]', err)
    return NextResponse.json({ error: 'Failed to load passkeys' }, { status: 500 })
  }
}

// app/login/callback/route.ts — Auth callback handler

export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // SECURITY: Validate next param to prevent open redirect attacks
  const rawNext = searchParams.get('next') ?? '/home'
  const next = (rawNext.startsWith('/') && !rawNext.startsWith('//')) ? rawNext : '/home'

  // No code param — could be an implicit-flow hash redirect (older Supabase versions)
  // or a broken link. Either way, send them back to login.
  if (!code) {
    console.error('[auth/callback] No code param in request:', request.url)
    return NextResponse.redirect(`${origin}/login?error=callback_failed`)
  }

  try {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('[auth/callback] exchangeCodeForSession error:', exchangeError.message)
      return NextResponse.redirect(`${origin}/login?error=callback_failed`)
    }

    // Session established — check onboarding state
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('[auth/callback] getUser error after exchange:', userError?.message)
      return NextResponse.redirect(`${origin}/login?error=callback_failed`)
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name')
      .eq('id', user.id)
      .single()

    // No profile → new user → onboarding
    if (!profile?.first_name) {
      return NextResponse.redirect(`${origin}/onboarding`)
    }

    // Existing user → home (or next param if set)
    return NextResponse.redirect(`${origin}${next}`)
  } catch (err) {
    console.error('[auth/callback] Unexpected error:', err)
    return NextResponse.redirect(`${origin}/login?error=callback_failed`)
  }
}

// app/auth/callback/route.ts — Auth callback handler
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/home'

  if (code) {
    try {
      const supabase = await createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error) {
        // Check if the user has completed onboarding
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name')
            .eq('id', user.id)
            .single()

          if (!profile?.first_name) {
            return NextResponse.redirect(`${origin}/onboarding`)
          }
        }

        return NextResponse.redirect(`${origin}${next}`)
      }
    } catch {
      // fall through to error redirect
    }
  }

  return NextResponse.redirect(`${origin}/auth?error=callback_failed`)
}

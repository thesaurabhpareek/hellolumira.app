/**
 * @module Middleware
 * @description Next.js edge middleware for authentication and security headers.
 *   Routes are classified as public (no auth) or protected (requires session).
 *   Logged-in users on /login are redirected to /home or /onboarding depending
 *   on profile completeness. All responses include security headers (X-Frame-Options,
 *   CSP, Referrer-Policy, Permissions-Policy).
 * @version 1.0.0
 * @since March 2026
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/** Set of public route prefixes that do not require authentication. */
const PUBLIC_PREFIXES = ['/', '/login', '/onboarding', '/terms', '/privacy', '/legal', '/invite']

/** Set of protected route prefixes that require an active session. */
const PROTECTED_PREFIXES = ['/home', '/checkin', '/concern', '/history', '/journal', '/milestones', '/settings', '/chat', '/tribes', '/content', '/profile']

/**
 * Edge middleware: handles auth redirects and security headers.
 *
 * Flow:
 * 1. Public routes pass through (except /login, which checks for logged-in redirect).
 * 2. If Supabase keys are missing, fail closed — only allow public paths.
 * 3. Protected routes redirect to /login if no session.
 * 4. Logged-in users on /login redirect to /home or /onboarding.
 * 5. Security headers are appended to all responses.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isApiRoute = pathname.startsWith('/api/')

  // Public routes — no auth required
  const isPublicRoute = pathname === '/' || PUBLIC_PREFIXES.some((p) => p !== '/' && pathname.startsWith(p))
  if (isPublicRoute && !isApiRoute) {
    // Still need to handle logged-in user redirects from /login below
    if (pathname !== '/login') {
      const response = NextResponse.next({ request })
      response.headers.set('X-Content-Type-Options', 'nosniff')
      response.headers.set('X-Frame-Options', 'DENY')
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
      response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
      return response
    }
  }

  // If Supabase keys aren't configured, fail closed — only allow public routes
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    const publicPaths = ['/', '/login', '/onboarding', '/terms', '/privacy', '/legal']
    const isPublic = publicPaths.some((p) => pathname === p || pathname.startsWith(p + '/'))
    if (!isPublic) {
      if (isApiRoute) {
        return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
      }
      return NextResponse.redirect(new URL('/login', request.url))
    }
    const response = NextResponse.next({ request })
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
    return response
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  // Always call getUser() — this triggers token refresh via setAll() when
  // the access token is expired but the refresh token is still valid.
  // Without this running for /api/ routes, client-side fetches fail with
  // 401 after the access token expires (~1 hour).
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // For API routes: only refresh the token (above), never redirect.
  // The API route handlers do their own auth checks and return JSON errors.
  if (isApiRoute) {
    supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff')
    return supabaseResponse
  }

  // Protected routes — redirect to /login if not logged in
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))

  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect logged-in users away from login page
  if (user && (pathname === '/login')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name')
      .eq('id', user.id)
      .single()

    if (!profile?.first_name) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
    return NextResponse.redirect(new URL('/home', request.url))
  }

  // Add security headers to all responses
  supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff')
  supabaseResponse.headers.set('X-Frame-Options', 'DENY')
  supabaseResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  supabaseResponse.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

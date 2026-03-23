// app/api/auth/check-account/route.ts
// Server-side check: does an account exist for this email?
// Used by the login page to show "you already have an account" UX.
// Rate-limited to prevent enumeration abuse.

import { NextResponse } from 'next/server'

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
}

// In-memory rate limiter: max 3 checks per email per 5 min
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(key: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(key)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + 5 * 60 * 1000 })
    return false
  }
  if (entry.count >= 3) return true
  entry.count++
  return false
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400, headers: SECURITY_HEADERS })
    }

    // Rate limit — fail open so UX isn't blocked if limit hit
    if (isRateLimited(email)) {
      return NextResponse.json({ exists: false }, { status: 200, headers: SECURITY_HEADERS })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ exists: false }, { status: 200, headers: SECURITY_HEADERS })
    }

    // Use GoTrue admin REST API with email filter — O(1), no full scan
    const response = await fetch(
      `${supabaseUrl}/auth/v1/admin/users?email=${encodeURIComponent(email)}&page=1&per_page=1`,
      {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
      }
    )

    if (!response.ok) {
      return NextResponse.json({ exists: false }, { status: 200, headers: SECURITY_HEADERS })
    }

    const data = await response.json()
    // GoTrue returns { users: [...], total: N }
    const exists = Array.isArray(data.users) ? data.users.length > 0 : false

    return NextResponse.json({ exists }, { status: 200, headers: SECURITY_HEADERS })
  } catch {
    return NextResponse.json({ exists: false }, { status: 200, headers: SECURITY_HEADERS })
  }
}

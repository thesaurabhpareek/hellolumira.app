/**
 * @module EarlyAccessAPI
 * @description POST /api/early-access — Adds an email to the early access
 *   waitlist queue. Treats duplicate emails as success to avoid revealing
 *   whether an address is already registered. Validates email format
 *   and enforces a 254-character limit per RFC 5321.
 * @version 1.0.0
 * @since March 2026
 */

export const dynamic = 'force-dynamic'

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { SECURITY_HEADERS } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    let body: { email?: unknown }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400, headers: SECURITY_HEADERS })
    }

    const { email } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Please enter a valid email.' }, { status: 400, headers: SECURITY_HEADERS })
    }

    // Sanitize and validate email
    const trimmedEmail = email.trim().slice(0, 254)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json({ error: 'Please enter a valid email.' }, { status: 400, headers: SECURITY_HEADERS })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { error } = await supabase
      .from('early_access_queue')
      .insert({ email: trimmedEmail.toLowerCase() })

    if (error) {
      // Duplicate email — treat as success (don't reveal they're already signed up)
      if (error.code === '23505') {
        return NextResponse.json({ success: true }, { headers: SECURITY_HEADERS })
      }
      console.error('[early-access] Insert error:', error)
      return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500, headers: SECURITY_HEADERS })
    }

    return NextResponse.json({ success: true }, { headers: SECURITY_HEADERS })
  } catch {
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500, headers: SECURITY_HEADERS })
  }
}

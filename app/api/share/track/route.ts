/**
 * @module ShareTrackAPI
 * @description GET /api/share/track?token=XXXXX — Records a share link click.
 *   Called when someone visits an invite link. Redirects to the main site.
 * @version 1.0.0
 * @since March 2026
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sha256 } from '@/lib/utils'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (!token || token.length !== 8) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  try {
    const serviceClient = await createServiceClient()

    // Look up the referrer by share_token
    const { data: referrer } = await serviceClient
      .from('profiles')
      .select('id')
      .eq('share_token', token)
      .maybeSingle()

    if (referrer) {
      // Hash IP for privacy
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
      const ipHash = await sha256(ip)
      const userAgent = request.headers.get('user-agent')?.slice(0, 500) || null

      // Record the click
      await serviceClient.from('share_tracking').insert({
        referrer_profile_id: referrer.id,
        share_token: token,
        ip_hash: ipHash,
        user_agent: userAgent,
      })
    }
  } catch (err) {
    console.error('[share/track] Error:', err)
  }

  // Always redirect to the main site regardless of tracking success
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hellolumira.app'
  return NextResponse.redirect(siteUrl)
}

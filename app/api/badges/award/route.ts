/**
 * @module BadgesAwardAPI
 * @description POST /api/badges/award — Awards a badge to the authenticated user.
 *   SECURITY: This endpoint is restricted to server-side callers only.
 *   All badge awarding should go through /api/badges/check which validates criteria.
 *   Direct badge self-awarding is not permitted from clients.
 * @version 2.0.0
 * @since March 2026
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { SECURITY_HEADERS } from '@/lib/utils'

export async function POST(_request: NextRequest) {
  // SECURITY: This endpoint is disabled for client-side callers.
  // Badge awarding is handled exclusively by /api/badges/check which validates criteria.
  return NextResponse.json(
    { error: 'Badge awarding is handled via /api/badges/check' },
    { status: 403, headers: SECURITY_HEADERS }
  )
}

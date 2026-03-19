/**
 * @module RequestDeletionAPI
 * @description POST /api/privacy/request-deletion — GDPR/CCPA right-to-erasure.
 *   Creates a pending deletion request with a verification token (does NOT
 *   immediately delete data). Requires explicit { confirmation: "DELETE" } to
 *   prevent accidental triggers. Returns a verification token that must be
 *   submitted to /api/privacy/verify-deletion to execute the actual deletion.
 *   Warns if co-parents are linked to shared baby profiles.
 * @version 2.0.0
 * @since March 2026
 */

export const dynamic = 'force-dynamic'

import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/audit'
import { SECURITY_HEADERS } from '@/lib/utils'

interface DeletionBody {
  confirmation: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: true, message: 'Unauthorized' }, { status: 401, headers: SECURITY_HEADERS })
    }

    let body: DeletionBody
    try {
      body = (await request.json()) as DeletionBody
    } catch {
      return NextResponse.json(
        { error: true, message: 'Invalid JSON body' },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }

    // Validate confirmation
    if (!body.confirmation || typeof body.confirmation !== 'string' || body.confirmation !== 'DELETE') {
      return NextResponse.json(
        {
          error: true,
          message: 'You must send { confirmation: "DELETE" } to confirm account deletion.',
        },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }

    const serviceClient = await createServiceClient()
    const now = new Date().toISOString()

    // Generate a secure verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')

    // Create deletion request with verification token
    const { data: deletionRequest, error: insertError } = await serviceClient
      .from('data_deletion_requests')
      .insert({
        profile_id: user.id,
        status: 'pending_verification',
        request_type: 'full_deletion',
        requested_at: now,
        verification_token: verificationToken,
      })
      .select()
      .single()

    if (insertError || !deletionRequest) {
      console.error('[request-deletion] Failed to create deletion request:', insertError?.message)
      return NextResponse.json(
        { error: true, message: 'Failed to create deletion request.' },
        { status: 500, headers: SECURITY_HEADERS }
      )
    }

    // Log audit event (non-critical)
    try {
      await logAudit(
        'data_deletion_requested',
        user.id,
        { request_id: deletionRequest.id, request_type: 'full_deletion' },
        request
      )
    } catch (auditErr) {
      console.error('[request-deletion] Audit log error (non-fatal):', auditErr)
    }

    // Check for co-parents on any baby profiles
    const { data: babyProfiles } = await supabase
      .from('baby_profiles')
      .select('id, name')
      .eq('created_by_profile_id', user.id)

    let coParentWarning: string | undefined

    if (babyProfiles && babyProfiles.length > 0) {
      const babyIds = babyProfiles.map((b) => b.id)
      const { count } = await supabase
        .from('baby_profile_members')
        .select('id', { count: 'exact', head: true })
        .in('baby_id', babyIds)
        .neq('profile_id', user.id)

      if (count && count > 0) {
        coParentWarning =
          'Your account is linked with a co-parent. Deleting your account will remove your data but will not affect your co-parent\'s access to shared baby profiles.'
      }
    }

    const response: Record<string, unknown> = {
      request_id: deletionRequest.id,
      status: 'pending_verification',
      verification_token: verificationToken,
      message:
        'Your deletion request has been received. Please verify by submitting the verification token to /api/privacy/verify-deletion.',
    }

    if (coParentWarning) {
      response.warning = coParentWarning
    }

    return NextResponse.json(response, { headers: SECURITY_HEADERS })
  } catch (err) {
    console.error('[request-deletion] Error:', err)
    return NextResponse.json(
      { error: true, message: 'Something went wrong. Try again.' },
      { status: 500, headers: SECURITY_HEADERS }
    )
  }
}

/**
 * @module ProfileUpdateFieldAPI
 * @description POST /api/profile/update-field — Updates a single profile or baby field.
 *   Used by the inline profile completion CTAs.
 * @version 1.0.0
 * @since March 2026
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SECURITY_HEADERS } from '@/lib/utils'

const ALLOWED_PROFILE_FIELDS = ['first_name'] as const
const ALLOWED_BABY_FIELDS = ['name', 'due_date', 'date_of_birth'] as const

type ProfileField = (typeof ALLOWED_PROFILE_FIELDS)[number]
type BabyField = (typeof ALLOWED_BABY_FIELDS)[number]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { field, value, baby_id } = body as {
      field: string
      value: string
      baby_id?: string
    }

    if (!field || !value) {
      return NextResponse.json(
        { error: 'Missing field or value' },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: SECURITY_HEADERS }
      )
    }

    // Check if it's a profile field
    if ((ALLOWED_PROFILE_FIELDS as readonly string[]).includes(field)) {
      const { error } = await supabase
        .from('profiles')
        .update({ [field as ProfileField]: value.trim().slice(0, 100) })
        .eq('id', user.id)

      if (error) {
        return NextResponse.json(
          { error: 'Failed to update profile' },
          { status: 500, headers: SECURITY_HEADERS }
        )
      }
      return NextResponse.json({ success: true })
    }

    // Check if it's a baby field
    if ((ALLOWED_BABY_FIELDS as readonly string[]).includes(field)) {
      if (!baby_id) {
        return NextResponse.json(
          { error: 'baby_id required for baby fields' },
          { status: 400, headers: SECURITY_HEADERS }
        )
      }

      // Verify user is a member of this baby profile
      const { data: membership } = await supabase
        .from('baby_profile_members')
        .select('baby_id')
        .eq('baby_id', baby_id)
        .eq('profile_id', user.id)
        .maybeSingle()

      if (!membership) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403, headers: SECURITY_HEADERS }
        )
      }

      const cleanValue = (field as BabyField) === 'name'
        ? value.trim().slice(0, 100)
        : value // date fields pass through

      const { error } = await supabase
        .from('baby_profiles')
        .update({ [field as BabyField]: cleanValue })
        .eq('id', baby_id)

      if (error) {
        return NextResponse.json(
          { error: 'Failed to update baby profile' },
          { status: 500, headers: SECURITY_HEADERS }
        )
      }
      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: 'Invalid field name' },
      { status: 400, headers: SECURITY_HEADERS }
    )
  } catch (err) {
    console.error('[profile/update-field] Error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: SECURITY_HEADERS }
    )
  }
}

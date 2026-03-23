/**
 * @module ProfileUpdateAPI
 * @description POST /api/profile/update — Full profile update endpoint.
 *   Validates all fields, updates the profile, and awards seeds for
 *   newly completed fields (profile completion gamification).
 * @version 1.0.0
 * @since March 2026
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { SECURITY_HEADERS } from '@/lib/utils'

/** Fields that can earn seeds when first completed, and their reward amounts */
const FIELD_SEED_REWARDS: Record<string, number> = {
  display_name: 5,
  pronouns: 5,
  location_city: 5,
  bio: 10,
  birth_month: 5,
  parenting_style: 5,
  feeding_method: 5,
  birth_type: 5,
  number_of_children: 5,
  languages_spoken: 5,
  work_status: 5,
  interests: 10,
  looking_for: 10,
  country_region: 10,
  support_network: 10,
  baby_temperament: 10,
  concerns_priority: 10,
}

const VALID_PRONOUNS = ['he/him', 'she/her', 'they/them', 'he/they', 'she/they', 'custom']
const VALID_PARENTING_STYLES = [
  'attachment', 'gentle', 'authoritative', 'permissive', 'helicopter',
  'free-range', 'montessori', 'exploring', 'other',
]
const VALID_FEEDING_METHODS = ['breastfeeding', 'formula', 'combo', 'solids', 'pumping', 'other']
const VALID_BIRTH_TYPES = ['vaginal', 'c-section', 'vbac', 'prefer_not_to_say']
const VALID_WORK_STATUSES = [
  'stay-at-home', 'working-full-time', 'working-part-time',
  'on-leave', 'freelance', 'other',
]
const VALID_INTERESTS = [
  'sleep', 'feeding', 'development', 'mental_health', 'finances',
  'relationships', 'fitness', 'nutrition', 'education', 'travel',
  'self-care', 'career',
]
const VALID_LOOKING_FOR = [
  'advice', 'friends', 'support', 'information', 'fun',
  'accountability', 'local_meetups', 'shared_experiences',
]
const VALID_COUNTRY_REGIONS = ['us', 'uk', 'in', 'au', 'ca', 'eu', 'other']
const VALID_SUPPORT_NETWORKS = ['strong', 'some', 'solo']
const VALID_BABY_TEMPERAMENTS = ['easygoing', 'moderate', 'spirited']
const VALID_CONCERNS_PRIORITIES = ['sleep', 'feeding', 'development', 'health', 'behavior', 'mental_health']

interface _ProfileUpdatePayload {
  display_name?: string | null
  pronouns?: string | null
  location_city?: string | null
  bio?: string | null
  birth_month?: string | null
  parenting_style?: string | null
  feeding_method?: string | null
  birth_type?: string | null
  number_of_children?: number | null
  languages_spoken?: string | null
  work_status?: string | null
  interests?: string[]
  looking_for?: string[]
  country_region?: string | null
  support_network?: string | null
  baby_temperament?: string | null
  concerns_priority?: string[]
  first_name?: string
}

function sanitizeString(val: unknown, maxLength: number): string | null {
  if (val === null || val === undefined || val === '') return null
  if (typeof val !== 'string') return null
  return val.trim().slice(0, maxLength)
}

function validatePayload(body: Record<string, unknown>): {
  valid: boolean
  data: Record<string, unknown>
  error?: string
} {
  const data: Record<string, unknown> = {}

  // first_name
  if ('first_name' in body) {
    const v = sanitizeString(body.first_name, 100)
    if (v !== null) data.first_name = v
  }

  // display_name
  if ('display_name' in body) {
    data.display_name = sanitizeString(body.display_name, 100)
  }

  // pronouns
  if ('pronouns' in body) {
    const v = sanitizeString(body.pronouns, 30)
    if (v !== null && !VALID_PRONOUNS.includes(v)) {
      return { valid: false, data: {}, error: `Invalid pronouns: ${v}` }
    }
    data.pronouns = v
  }

  // location_city
  if ('location_city' in body) {
    data.location_city = sanitizeString(body.location_city, 100)
  }

  // bio (280 char limit at app level)
  if ('bio' in body) {
    data.bio = sanitizeString(body.bio, 280)
  }

  // birth_month (YYYY-MM)
  if ('birth_month' in body) {
    const v = sanitizeString(body.birth_month, 7)
    if (v !== null && !/^\d{4}-(0[1-9]|1[0-2])$/.test(v)) {
      return { valid: false, data: {}, error: 'Invalid birth_month format (expected YYYY-MM)' }
    }
    data.birth_month = v
  }

  // parenting_style
  if ('parenting_style' in body) {
    const v = sanitizeString(body.parenting_style, 30)
    if (v !== null && !VALID_PARENTING_STYLES.includes(v)) {
      return { valid: false, data: {}, error: `Invalid parenting_style: ${v}` }
    }
    data.parenting_style = v
  }

  // feeding_method
  if ('feeding_method' in body) {
    const v = sanitizeString(body.feeding_method, 30)
    if (v !== null && !VALID_FEEDING_METHODS.includes(v)) {
      return { valid: false, data: {}, error: `Invalid feeding_method: ${v}` }
    }
    data.feeding_method = v
  }

  // birth_type
  if ('birth_type' in body) {
    const v = sanitizeString(body.birth_type, 30)
    if (v !== null && !VALID_BIRTH_TYPES.includes(v)) {
      return { valid: false, data: {}, error: `Invalid birth_type: ${v}` }
    }
    data.birth_type = v
  }

  // number_of_children
  if ('number_of_children' in body) {
    const v = body.number_of_children
    if (v === null || v === '' || v === undefined) {
      data.number_of_children = null
    } else {
      const n = Number(v)
      if (isNaN(n) || n < 0 || n > 20 || !Number.isInteger(n)) {
        return { valid: false, data: {}, error: 'number_of_children must be 0-20' }
      }
      data.number_of_children = n
    }
  }

  // languages_spoken
  if ('languages_spoken' in body) {
    data.languages_spoken = sanitizeString(body.languages_spoken, 200)
  }

  // work_status
  if ('work_status' in body) {
    const v = sanitizeString(body.work_status, 30)
    if (v !== null && !VALID_WORK_STATUSES.includes(v)) {
      return { valid: false, data: {}, error: `Invalid work_status: ${v}` }
    }
    data.work_status = v
  }

  // interests (string array)
  if ('interests' in body) {
    const arr = body.interests
    if (!Array.isArray(arr)) {
      return { valid: false, data: {}, error: 'interests must be an array' }
    }
    const cleaned = arr.filter((v): v is string => typeof v === 'string' && VALID_INTERESTS.includes(v))
    data.interests = cleaned
  }

  // looking_for (string array)
  if ('looking_for' in body) {
    const arr = body.looking_for
    if (!Array.isArray(arr)) {
      return { valid: false, data: {}, error: 'looking_for must be an array' }
    }
    const cleaned = arr.filter((v): v is string => typeof v === 'string' && VALID_LOOKING_FOR.includes(v))
    data.looking_for = cleaned
  }

  // country_region (enum string)
  if ('country_region' in body) {
    const val = body.country_region
    if (val === null || val === '') { data.country_region = null }
    else if (typeof val === 'string' && VALID_COUNTRY_REGIONS.includes(val)) { data.country_region = val }
    else { return { valid: false, data: {}, error: 'Invalid country_region value' } }
  }

  // support_network (enum string)
  if ('support_network' in body) {
    const val = body.support_network
    if (val === null || val === '') { data.support_network = null }
    else if (typeof val === 'string' && VALID_SUPPORT_NETWORKS.includes(val)) { data.support_network = val }
    else { return { valid: false, data: {}, error: 'Invalid support_network value' } }
  }

  // baby_temperament (enum string)
  if ('baby_temperament' in body) {
    const val = body.baby_temperament
    if (val === null || val === '') { data.baby_temperament = null }
    else if (typeof val === 'string' && VALID_BABY_TEMPERAMENTS.includes(val)) { data.baby_temperament = val }
    else { return { valid: false, data: {}, error: 'Invalid baby_temperament value' } }
  }

  // concerns_priority (string array)
  if ('concerns_priority' in body) {
    const arr = body.concerns_priority
    if (!Array.isArray(arr)) {
      return { valid: false, data: {}, error: 'concerns_priority must be an array' }
    }
    const cleaned = arr.filter((v): v is string => typeof v === 'string' && VALID_CONCERNS_PRIORITIES.includes(v))
    data.concerns_priority = cleaned
  }

  return { valid: true, data }
}

function isFieldFilled(key: string, value: unknown): boolean {
  if (value === null || value === undefined || value === '') return false
  if (Array.isArray(value)) return value.length > 0
  return true
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

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

    const { valid, data, error: validationError } = validatePayload(body)
    if (!valid) {
      return NextResponse.json(
        { error: validationError },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }

    // Fetch current profile to check which fields are newly filled
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('profile_completion_seeds_awarded, display_name, pronouns, location_city, bio, birth_month, parenting_style, feeding_method, birth_type, number_of_children, languages_spoken, work_status, interests, looking_for, country_region, support_network, baby_temperament, concerns_priority')
      .eq('id', user.id)
      .single()

    // Update profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', user.id)

    if (updateError) {
      console.error('[profile/update] Update error:', updateError.message)
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500, headers: SECURITY_HEADERS }
      )
    }

    // Award seeds for newly completed fields
    let totalSeedsEarned = 0
    const newlyRewarded: Record<string, boolean> = {}
    const alreadyAwarded: Record<string, boolean> = (currentProfile?.profile_completion_seeds_awarded as Record<string, boolean>) || {}

    for (const [key, value] of Object.entries(data)) {
      if (
        key in FIELD_SEED_REWARDS &&
        isFieldFilled(key, value) &&
        !alreadyAwarded[key]
      ) {
        totalSeedsEarned += FIELD_SEED_REWARDS[key]
        newlyRewarded[key] = true
      }
    }

    if (totalSeedsEarned > 0) {
      try {
        const serviceClient = await createServiceClient()

        // Update the seeds_awarded tracker
        const updatedAwarded = { ...alreadyAwarded, ...newlyRewarded }
        await serviceClient
          .from('profiles')
          .update({ profile_completion_seeds_awarded: updatedAwarded })
          .eq('id', user.id)

        // Insert seed transaction
        const referenceDate = new Date().toISOString().split('T')[0]
        await serviceClient
          .from('seed_transactions')
          .insert({
            profile_id: user.id,
            amount: totalSeedsEarned,
            reason: 'profile_field_completion',
            reference_date: referenceDate,
          })

        // Increment balance
        await serviceClient.rpc('increment_seeds_balance', {
          p_profile_id: user.id,
          p_amount: totalSeedsEarned,
        })
      } catch (seedErr) {
        // Seeds are non-critical — don't fail the request
        console.error('[profile/update] Seeds award error:', seedErr)
      }
    }

    return NextResponse.json({
      success: true,
      seeds_earned: totalSeedsEarned,
      fields_rewarded: Object.keys(newlyRewarded),
    })
  } catch (err) {
    console.error('[profile/update] Error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: SECURITY_HEADERS }
    )
  }
}

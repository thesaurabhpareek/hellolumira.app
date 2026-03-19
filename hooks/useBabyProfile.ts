/**
 * @module useBabyProfile
 * @description React hook that fetches the authenticated user's profile and
 *   their primary baby profile. Uses parallel queries for profile + baby
 *   membership, with a single automatic retry on failure. Includes proper
 *   cleanup via a `cancelled` flag to prevent state updates after unmount.
 * @version 1.0.0
 * @since March 2026
 */

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile, BabyProfile } from '@/types/app'

interface UseBabyProfileResult {
  baby: BabyProfile | null
  profile: Profile | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useBabyProfile(): UseBabyProfileResult {
  const [baby, setBaby] = useState<BabyProfile | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false

    const fetch = async () => {
      setLoading(true)
      setError(null)

      const supabase = createClient()

      const attempt = async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) throw new Error('Not authenticated')

        // Fetch profile and baby membership in parallel
        const [{ data: profileData, error: profileError }, { data: memberData }] = await Promise.all([
          supabase.from('profiles').select('id, first_name, first_time_parent, first_checkin_complete, emotional_state_latest, partner_invite_email, created_at, updated_at').eq('id', user.id).single(),
          supabase.from('baby_profile_members').select('baby_id').eq('profile_id', user.id).limit(1).maybeSingle(),
        ])

        if (profileError) throw profileError
        if (!cancelled) setProfile(profileData as Profile)

        if (!memberData?.baby_id) {
          if (!cancelled) setBaby(null)
          return
        }

        const { data: babyData, error: babyError } = await supabase
          .from('baby_profiles')
          .select('id, name, due_date, date_of_birth, stage, pending_proactive_type, pending_proactive_set_at, created_by_profile_id, created_at')
          .eq('id', memberData.baby_id)
          .single()

        if (babyError) throw babyError
        if (!cancelled) setBaby(babyData as BabyProfile)
      }

      try {
        try {
          await attempt()
        } catch {
          await new Promise((r) => setTimeout(r, 1000))
          await attempt()
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Couldn't load profile — tap to retry"
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetch()

    return () => {
      cancelled = true
    }
  }, [tick])

  const refetch = () => setTick((t) => t + 1)

  return { baby, profile, loading, error, refetch }
}

// app/(app)/checkin/page.tsx — Check-in thread
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CheckinThread from '@/components/app/CheckinThread'
import type { Profile, BabyProfile, DailyCheckin } from '@/types/app'

export default async function CheckinPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  // Fetch profile and baby membership in parallel
  const [{ data: profileData }, { data: memberData }] = await Promise.all([
    supabase.from('profiles').select('id, first_name, first_time_parent, first_checkin_complete, emotional_state_latest').eq('id', user.id).single(),
    supabase.from('baby_profile_members').select('baby_id').eq('profile_id', user.id).limit(1).maybeSingle(),
  ])

  if (!profileData) redirect('/onboarding')
  if (!memberData?.baby_id) redirect('/onboarding')

  const { data: babyData } = await supabase
    .from('baby_profiles')
    .select('id, name, due_date, date_of_birth, stage, pending_proactive_type, pending_proactive_set_at, created_by_profile_id, created_at')
    .eq('id', memberData.baby_id)
    .single()

  if (!babyData) redirect('/onboarding')

  const today = new Date().toISOString().split('T')[0]
  const { data: checkinData } = await supabase
    .from('daily_checkins')
    .select('id, baby_id, profile_id, stage, checkin_date, sleep_quality, night_wakings, feeding, mood, diapers, nausea_level, energy_level, kept_food_down, conversation_log, emotional_signal, created_at, updated_at')
    .eq('baby_id', babyData.id)
    .eq('checkin_date', today)
    .maybeSingle()

  return (
    <CheckinThread
      profile={profileData as Profile}
      baby={babyData as BabyProfile}
      existingCheckin={checkinData as DailyCheckin | null}
    />
  )
}

// app/(app)/layout.tsx — App shell layout (server component)
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/app/AppShell'
import type { Profile, BabyProfile } from '@/types/app'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch profile and baby membership in parallel
  const [{ data: profile }, { data: memberData }] = await Promise.all([
    supabase.from('profiles').select('id, first_name, first_time_parent, emotional_state_latest').eq('id', user.id).single(),
    supabase.from('baby_profile_members').select('baby_id').eq('profile_id', user.id).limit(1).maybeSingle(),
  ])

  if (!profile?.first_name) {
    redirect('/onboarding')
  }

  let baby: BabyProfile | null = null
  if (memberData?.baby_id) {
    const { data: babyData } = await supabase
      .from('baby_profiles')
      .select('id, name, due_date, date_of_birth, stage, pending_proactive_type, pending_proactive_set_at, created_by_profile_id, created_at')
      .eq('id', memberData.baby_id)
      .single()
    baby = babyData as BabyProfile | null
  }

  return (
    <AppShell profile={profile as Profile} baby={baby}>
      {children}
    </AppShell>
  )
}

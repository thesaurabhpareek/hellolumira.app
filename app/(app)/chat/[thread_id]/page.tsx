// app/(app)/chat/[thread_id]/page.tsx — Full chat thread view
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBabyAgeInfo } from '@/lib/baby-age'
import ChatThreadView from '@/components/app/chat/ChatThreadView'
import type { Profile, BabyProfile } from '@/types/app'
import type { ChatMessage } from '@/types/chat'

interface PageProps {
  params: Promise<{ thread_id: string }>
}

export default async function ChatThreadPage({ params }: PageProps) {
  const { thread_id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  // Fetch profile and baby membership in parallel
  const [{ data: profileData }, { data: memberData }] = await Promise.all([
    supabase.from('profiles').select('id, first_name, first_time_parent, emotional_state_latest').eq('id', user.id).single(),
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

  // Fetch thread and messages in parallel
  const [{ data: threadData }, { data: messagesData }] = await Promise.all([
    supabase.from('chat_threads').select('id, baby_id, profile_id, title, primary_concern_category, highest_escalation_level, message_count, last_message_at, is_archived, source_concern_session_id, source_checkin_id, created_at, updated_at').eq('id', thread_id).eq('profile_id', user.id).single(),
    supabase.from('chat_messages').select('id, thread_id, role, content, concern_category, escalation_level, red_flag_detected, red_flag_pattern, is_structured_response, model_version, created_at').eq('thread_id', thread_id).order('created_at', { ascending: true }),
  ])

  if (!threadData) redirect('/chat')

  const baby = babyData as BabyProfile
  const ageInfo = getBabyAgeInfo(baby)

  return (
    <ChatThreadView
      profile={profileData as Profile}
      baby={baby}
      ageInfo={ageInfo}
      thread={threadData}
      existingMessages={(messagesData || []) as ChatMessage[]}
    />
  )
}

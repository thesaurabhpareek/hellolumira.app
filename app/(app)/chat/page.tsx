// app/(app)/chat/page.tsx — Chat thread list / landing
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ChatLanding from '@/components/app/chat/ChatLanding'
import type { Profile, BabyProfile } from '@/types/app'

export default async function ChatPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

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

  // Fetch existing threads with specific columns
  const { data: threadsData } = await supabase
    .from('chat_threads')
    .select('id, baby_id, profile_id, title, primary_concern_category, highest_escalation_level, message_count, last_message_at, is_archived, source_concern_session_id, source_checkin_id, created_at, updated_at')
    .eq('baby_id', babyData.id)
    .eq('profile_id', user.id)
    .eq('is_archived', false)
    .order('last_message_at', { ascending: false, nullsFirst: false })
    .limit(50)

  const threadsList = threadsData || []

  // Batch fetch last messages for all threads in one query instead of N+1
  let threads = threadsList.map((thread) => ({
    ...thread,
    last_message_preview: null as string | null,
    last_message_role: null as string | null,
  }))

  if (threadsList.length > 0) {
    const threadIds = threadsList.map((t) => t.id)
    // Fetch enough messages to cover all threads (at least 1 per thread + buffer for active threads)
    const { data: recentMessages } = await supabase
      .from('chat_messages')
      .select('thread_id, content, role, created_at')
      .in('thread_id', threadIds)
      .order('created_at', { ascending: false })
      .limit(Math.max(threadIds.length * 3, 150))

    if (recentMessages) {
      const latestByThread = new Map<string, { content: string; role: string }>()
      for (const msg of recentMessages) {
        if (!latestByThread.has(msg.thread_id)) {
          latestByThread.set(msg.thread_id, msg)
        }
      }

      threads = threadsList.map((thread) => {
        const lastMsg = latestByThread.get(thread.id)
        return {
          ...thread,
          last_message_preview: lastMsg?.content
            ? lastMsg.content.slice(0, 100) + (lastMsg.content.length > 100 ? '...' : '')
            : null,
          last_message_role: lastMsg?.role || null,
        }
      })
    }
  }

  return (
    <ChatLanding
      profile={profileData as Profile}
      baby={babyData as BabyProfile}
      threads={threads}
    />
  )
}

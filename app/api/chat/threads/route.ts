/**
 * @module ChatThreadsAPI
 * @description GET/POST /api/chat/threads — Chat thread management.
 *   GET returns threads with last-message previews (batched in one query to
 *   avoid N+1). POST creates a new thread with optional source linking
 *   (checkin, concern, or direct).
 * @version 1.0.0
 * @since March 2026
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isValidUUID } from '@/lib/validation'
import { SECURITY_HEADERS } from '@/lib/utils'

// GET /api/chat/threads?baby_id=xxx
// Returns list of threads for the authenticated parent + baby
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: true, message: 'Unauthorized' }, { status: 401, headers: SECURITY_HEADERS })
    }

    const baby_id = request.nextUrl.searchParams.get('baby_id')
    if (!baby_id) {
      return NextResponse.json({ error: true, message: 'baby_id required' }, { status: 400, headers: SECURITY_HEADERS })
    }
    if (!isValidUUID(baby_id)) {
      return NextResponse.json({ error: true, message: 'Invalid baby_id format' }, { status: 400, headers: SECURITY_HEADERS })
    }

    // Verify baby ownership
    const { count } = await supabase
      .from('baby_profile_members')
      .select('id', { count: 'exact', head: true })
      .eq('baby_id', baby_id)
      .eq('profile_id', user.id)

    if (!count) {
      return NextResponse.json({ error: true, message: 'Forbidden' }, { status: 403, headers: SECURITY_HEADERS })
    }

    const { data: threads, error } = await supabase
      .from('chat_threads')
      .select('id, baby_id, profile_id, title, primary_concern_category, highest_escalation_level, message_count, last_message_at, is_archived, created_at')
      .eq('baby_id', baby_id)
      .eq('profile_id', user.id)
      .eq('is_archived', false)
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .limit(50)

    if (error) throw error

    const threadsList = threads || []

    // Batch fetch last messages for all threads in one query instead of N+1
    let threadsWithPreview = threadsList.map((thread) => ({
      ...thread,
      last_message_preview: null as string | null,
      last_message_role: null as string | null,
    }))

    if (threadsList.length > 0) {
      const threadIds = threadsList.map((t) => t.id)

      // Use a single query with distinct on thread_id to get last message per thread
      // Supabase doesn't support DISTINCT ON, so we fetch recent messages and group client-side
      const { data: recentMessages } = await supabase
        .from('chat_messages')
        .select('thread_id, content, role, created_at')
        .in('thread_id', threadIds)
        .order('created_at', { ascending: false })
        .limit(threadIds.length * 2) // fetch enough to cover one per thread

      if (recentMessages) {
        // Group by thread_id, taking only the latest message per thread
        const latestByThread = new Map<string, { content: string; role: string }>()
        for (const msg of recentMessages) {
          if (!latestByThread.has(msg.thread_id)) {
            latestByThread.set(msg.thread_id, msg)
          }
        }

        threadsWithPreview = threadsList.map((thread) => {
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

    return NextResponse.json({ threads: threadsWithPreview }, { headers: SECURITY_HEADERS })
  } catch (err) {
    console.error('[chat/threads GET] Error:', err)
    return NextResponse.json(
      { error: true, message: 'Failed to load threads' },
      { status: 500, headers: SECURITY_HEADERS }
    )
  }
}

// POST /api/chat/threads
// Creates a new thread, returns thread_id
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: true, message: 'Unauthorized' }, { status: 401, headers: SECURITY_HEADERS })
    }

    let body: { baby_id: string; source?: 'checkin' | 'concern' | 'direct'; source_id?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: true, message: 'Invalid JSON body' }, { status: 400, headers: SECURITY_HEADERS })
    }

    const { baby_id, source } = body

    if (!baby_id || typeof baby_id !== 'string') {
      return NextResponse.json({ error: true, message: 'Missing required field: baby_id' }, { status: 400, headers: SECURITY_HEADERS })
    }
    if (!isValidUUID(baby_id)) {
      return NextResponse.json({ error: true, message: 'Invalid baby_id format' }, { status: 400, headers: SECURITY_HEADERS })
    }

    // Validate source_id format if provided
    if (body.source_id !== undefined && typeof body.source_id === 'string' && body.source_id.length > 0 && !isValidUUID(body.source_id)) {
      return NextResponse.json({ error: true, message: 'Invalid source_id format' }, { status: 400, headers: SECURITY_HEADERS })
    }

    // Validate source if provided
    const VALID_SOURCES = ['checkin', 'concern', 'direct'] as const
    if (source !== undefined && !VALID_SOURCES.includes(source as typeof VALID_SOURCES[number])) {
      return NextResponse.json({ error: true, message: 'Invalid source value' }, { status: 400, headers: SECURITY_HEADERS })
    }

    // Verify baby ownership
    const { count } = await supabase
      .from('baby_profile_members')
      .select('id', { count: 'exact', head: true })
      .eq('baby_id', baby_id)
      .eq('profile_id', user.id)

    if (!count) {
      return NextResponse.json({ error: true, message: 'Forbidden' }, { status: 403, headers: SECURITY_HEADERS })
    }

    const now = new Date().toISOString()
    const { data: thread, error } = await supabase
      .from('chat_threads')
      .insert({
        baby_id,
        profile_id: user.id,
        title: null,
        primary_concern_category: null,
        highest_escalation_level: 'none',
        message_count: 0,
        last_message_at: null,
        is_archived: false,
        source_concern_session_id: source === 'concern' ? body.source_id || null : null,
        source_checkin_id: source === 'checkin' ? body.source_id || null : null,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ thread_id: thread.id, thread }, { headers: SECURITY_HEADERS })
  } catch (err) {
    console.error('[chat/threads POST] Error:', err)
    return NextResponse.json(
      { error: true, message: 'Failed to create thread' },
      { status: 500, headers: SECURITY_HEADERS }
    )
  }
}

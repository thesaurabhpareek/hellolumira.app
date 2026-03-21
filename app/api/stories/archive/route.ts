/**
 * @module StoryArchiveAPI
 * @description GET /api/stories/archive — Own story archive (including expired)
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SECURITY_HEADERS } from '@/lib/utils'

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: SECURITY_HEADERS })
    }

    // Return ALL own stories (including expired), ordered by published_at DESC
    const { data: stories, error } = await supabase
      .from('stories')
      .select('*')
      .eq('profile_id', user.id)
      .order('published_at', { ascending: false })

    if (error) {
      console.error('[GET /api/stories/archive] Query error:', error.message)
      return NextResponse.json({ error: 'Failed to fetch archive' }, { status: 500, headers: SECURITY_HEADERS })
    }

    return NextResponse.json({ stories: stories || [] }, { headers: SECURITY_HEADERS })
  } catch (err) {
    console.error('[GET /api/stories/archive] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: SECURITY_HEADERS })
  }
}

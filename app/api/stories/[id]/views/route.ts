/**
 * @module StoryViewsListAPI
 * @description GET /api/stories/[id]/views — Viewer list (author only)
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SECURITY_HEADERS } from '@/lib/utils'
import { isValidUUID } from '@/lib/validation'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storyId } = await params
    if (!isValidUUID(storyId)) {
      return NextResponse.json({ error: 'Invalid story ID' }, { status: 400, headers: SECURITY_HEADERS })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: SECURITY_HEADERS })
    }

    // Verify the story belongs to the authenticated user
    const { data: story, error: storyErr } = await supabase
      .from('stories')
      .select('id, profile_id')
      .eq('id', storyId)
      .single()

    if (storyErr || !story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404, headers: SECURITY_HEADERS })
    }

    if (story.profile_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden — you can only view analytics for your own stories' }, { status: 403, headers: SECURITY_HEADERS })
    }

    // Fetch viewers with profile info
    const { data: views, error: viewsErr } = await supabase
      .from('story_views')
      .select(`
        id, story_id, viewer_id, dwell_ms, viewed_at,
        profiles!story_views_viewer_id_fkey(display_name, avatar_url)
      `)
      .eq('story_id', storyId)
      .order('viewed_at', { ascending: false })

    if (viewsErr) {
      console.error('[GET /api/stories/[id]/views] Query error:', viewsErr.message)
      return NextResponse.json({ error: 'Failed to fetch views' }, { status: 500, headers: SECURITY_HEADERS })
    }

    // Flatten profile data into the view objects
    const formattedViews = (views || []).map(view => {
      const profile = view.profiles as unknown as { display_name: string; avatar_url: string | null } | null
      const { profiles: _profiles, ...viewData } = view
      return {
        ...viewData,
        viewer_display_name: profile?.display_name || 'Unknown',
        viewer_avatar_url: profile?.avatar_url || null,
      }
    })

    return NextResponse.json({ views: formattedViews }, { headers: SECURITY_HEADERS })
  } catch (err) {
    console.error('[GET /api/stories/[id]/views] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: SECURITY_HEADERS })
  }
}

/**
 * @module ContentArticlesAPI
 * @description GET /api/content/articles — Fetches content articles with optional
 *   filtering by stage, week/month, and category. Supports pagination.
 * @version 1.0.0
 * @since March 2026
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SECURITY_HEADERS } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
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

    const { searchParams } = new URL(request.url)
    const stage = searchParams.get('stage')
    const weekOrMonth = searchParams.get('week_or_month')
    const category = searchParams.get('category')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    let query = supabase
      .from('content_articles')
      .select('*', { count: 'exact' })
      .order('week_or_month', { ascending: true })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (stage) {
      query = query.eq('stage', stage)
    }

    if (weekOrMonth) {
      query = query.eq('week_or_month', parseInt(weekOrMonth, 10))
    }

    if (category) {
      query = query.eq('category', category)
    }

    const { data: articles, error, count } = await query

    if (error) {
      console.error('[ContentArticlesAPI] Query error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch articles' },
        { status: 500, headers: SECURITY_HEADERS }
      )
    }

    return NextResponse.json(
      {
        articles: articles || [],
        total: count || 0,
        limit,
        offset,
      },
      { headers: SECURITY_HEADERS }
    )
  } catch (err) {
    console.error('[ContentArticlesAPI] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: SECURITY_HEADERS }
    )
  }
}

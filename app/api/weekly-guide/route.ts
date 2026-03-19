/**
 * @module WeeklyGuideAPI
 * @description GET /api/weekly-guide — Returns a stage-specific developmental
 *   guide for a given week/month. Checks the weekly_guides cache table first;
 *   generates via Claude on cache miss and stores the result (fire-and-forget).
 * @version 1.0.0
 * @since March 2026
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { callClaudeJSON } from '@/lib/claude'
import type { Stage, WeeklyGuideContent } from '@/types/app'

const PREGNANCY_GUIDE_PROMPT = `You write weekly pregnancy guides. Warm, honest, occasionally witty. Respond ONLY with valid JSON (no markdown fences): { "opening": "2 sentences, warm, week-specific", "baby_development": "what's happening with the baby at exactly week N", "body_changes": ["thing parent may feel 1", "...2", "...3"], "whats_usually_normal": ["common worry 1 normalised", "...2"], "focus_this_week": ["actionable 1", "...2", "...3"], "watch_outs": ["specific cue — when to call midwife or OB"] }`

const INFANT_GUIDE_PROMPT = `You write weekly infant development guides. Warm, curious, occasionally witty. Respond ONLY with valid JSON (no markdown fences): { "opening": "2 sentences, warm, 'this week', optionally witty", "what_is_happening": "2-3 sentences developmental context for week N", "what_you_might_notice": ["observable behavior 1","...2","...3","...4"], "whats_usually_normal": ["common worry 1 normalised","...2"], "focus_this_week": ["actionable 1","...2","...3"], "watch_outs": ["calm escalation cue 1","...2 optional"] }`

export async function GET(request: NextRequest) {
  try {
    // Verify caller is authenticated (using anon client with session cookies)
    const anonSupabase = await createClient()
    const { data: { user } } = await anonSupabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const stage = searchParams.get('stage') as Stage | null
    const weekOrMonthStr = searchParams.get('week_or_month')

    if (!stage || !weekOrMonthStr) {
      return NextResponse.json(
        { error: true, fallback_message: 'Missing required parameters.' },
        { status: 400 }
      )
    }

    // Validate stage enum
    const VALID_STAGES: Stage[] = ['pregnancy', 'infant', 'toddler']
    if (!VALID_STAGES.includes(stage)) {
      return NextResponse.json(
        { error: true, fallback_message: 'Invalid stage value.' },
        { status: 400 }
      )
    }

    const week_or_month = parseInt(weekOrMonthStr, 10)
    if (isNaN(week_or_month) || !Number.isInteger(week_or_month)) {
      return NextResponse.json(
        { error: true, fallback_message: 'Invalid week/month value.' },
        { status: 400 }
      )
    }

    // Range check: pregnancy weeks 1-42, infant/toddler weeks 1-260
    const maxWeek = stage === 'pregnancy' ? 42 : 260
    if (week_or_month < 1 || week_or_month > maxWeek) {
      return NextResponse.json(
        { error: true, fallback_message: `week_or_month must be between 1 and ${maxWeek}.` },
        { status: 400 }
      )
    }

    // TODO: Add rate limiting - max 20 requests per minute per user

    const supabase = await createServiceClient()

    // Check cache first
    const { data: cached } = await supabase
      .from('weekly_guides')
      .select('content')
      .eq('stage', stage)
      .eq('week_or_month', week_or_month)
      .maybeSingle()

    if (cached?.content) {
      return NextResponse.json({ guide: cached.content, cached: true })
    }

    // Generate with Claude
    const systemPrompt = stage === 'pregnancy' ? PREGNANCY_GUIDE_PROMPT : INFANT_GUIDE_PROMPT

    const userMessage =
      stage === 'pregnancy'
        ? `Write the weekly pregnancy guide for Week ${week_or_month} of 40.`
        : `Write the weekly infant development guide for Week ${week_or_month} of life.`

    const guide = await callClaudeJSON<WeeklyGuideContent>(systemPrompt, userMessage, 1200)

    // Cache in DB (non-blocking — fire and forget)
    supabase
      .from('weekly_guides')
      .insert({ stage, week_or_month, content: guide })
      .then(({ error }) => {
        if (error) console.error('[weekly-guide] Cache insert failed:', error.message)
      })

    return NextResponse.json({ guide, cached: false })
  } catch (err) {
    console.error('[weekly-guide] Error:', err)
    return NextResponse.json(
      {
        error: true,
        fallback_message: 'Guide temporarily unavailable. Please try again in a moment.',
      },
      { status: 500 }
    )
  }
}

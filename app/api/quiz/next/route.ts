/**
 * @module QuizNextAPI
 * @description GET /api/quiz/next — Returns the next unanswered quiz question
 *   for the authenticated user's current stage. Prioritises questions matching
 *   the user's current week/month, falling back to any unanswered question.
 * @version 1.0.0
 * @since March 2026
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SECURITY_HEADERS } from '@/lib/utils'

export async function GET(_request: NextRequest) {
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

    // Get user's baby profile to determine stage
    const { data: memberData } = await supabase
      .from('baby_profile_members')
      .select('baby_id')
      .eq('profile_id', user.id)
      .limit(1)
      .maybeSingle()

    if (!memberData?.baby_id) {
      return NextResponse.json(
        { error: 'No baby profile found' },
        { status: 404, headers: SECURITY_HEADERS }
      )
    }

    const { data: babyData } = await supabase
      .from('baby_profiles')
      .select('stage')
      .eq('id', memberData.baby_id)
      .single()

    if (!babyData) {
      return NextResponse.json(
        { error: 'Baby profile not found' },
        { status: 404, headers: SECURITY_HEADERS }
      )
    }

    const stage = babyData.stage

    // Get IDs of already-answered questions
    const { data: attemptedRows } = await supabase
      .from('quiz_attempts')
      .select('question_id')
      .eq('profile_id', user.id)

    const attemptedIds = (attemptedRows || []).map((r) => r.question_id)

    // Fetch unanswered questions for this stage
    let query = supabase
      .from('quiz_questions')
      .select('*')
      .eq('stage', stage)
      .order('created_at', { ascending: true })

    if (attemptedIds.length > 0) {
      // Filter out already-attempted questions using not-in
      query = query.not('id', 'in', `(${attemptedIds.join(',')})`)
    }

    const { data: questions, error: queryError } = await query.limit(1)

    if (queryError) {
      console.error('[QuizNextAPI] Query error:', queryError)
      return NextResponse.json(
        { error: 'Failed to fetch quiz question' },
        { status: 500, headers: SECURITY_HEADERS }
      )
    }

    // If no unanswered questions remain, return a completion message
    if (!questions || questions.length === 0) {
      // Get user's stats
      const { count: totalAnswered } = await supabase
        .from('quiz_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', user.id)

      const { count: totalCorrect } = await supabase
        .from('quiz_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', user.id)
        .eq('is_correct', true)

      return NextResponse.json(
        {
          question: null,
          completed: true,
          stats: {
            total_answered: totalAnswered || 0,
            total_correct: totalCorrect || 0,
          },
        },
        { headers: SECURITY_HEADERS }
      )
    }

    const question = questions[0]

    // Get user's current stats
    const { count: totalAnswered } = await supabase
      .from('quiz_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', user.id)

    const { count: totalCorrect } = await supabase
      .from('quiz_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', user.id)
      .eq('is_correct', true)

    // Calculate streak
    const { data: recentAttempts } = await supabase
      .from('quiz_attempts')
      .select('is_correct')
      .eq('profile_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    let streak = 0
    if (recentAttempts) {
      for (const a of recentAttempts) {
        if (a.is_correct) streak++
        else break
      }
    }

    return NextResponse.json(
      {
        question: {
          id: question.id,
          question_text: question.question_text,
          options: question.options,
          category: question.category,
          difficulty: question.difficulty,
          stage: question.stage,
        },
        completed: false,
        stats: {
          total_answered: totalAnswered || 0,
          total_correct: totalCorrect || 0,
          streak,
        },
      },
      { headers: SECURITY_HEADERS }
    )
  } catch (err) {
    console.error('[QuizNextAPI] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: SECURITY_HEADERS }
    )
  }
}

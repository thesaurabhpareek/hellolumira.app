/**
 * @module QuizAnswerAPI
 * @description POST /api/quiz/answer — Records a quiz answer, validates it,
 *   and returns the explanation along with updated stats.
 * @version 1.0.0
 * @since March 2026
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SECURITY_HEADERS } from '@/lib/utils'

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { question_id, selected_option } = body

    if (!question_id || selected_option === undefined || selected_option === null) {
      return NextResponse.json(
        { error: 'Missing required fields: question_id, selected_option' },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }

    if (typeof selected_option !== 'number' || selected_option < 0) {
      return NextResponse.json(
        { error: 'selected_option must be a non-negative integer' },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }

    // Fetch the question to validate answer
    const { data: question, error: questionError } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('id', question_id)
      .single()

    if (questionError || !question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404, headers: SECURITY_HEADERS }
      )
    }

    // Check if already answered
    const { data: existingAttempt } = await supabase
      .from('quiz_attempts')
      .select('id')
      .eq('profile_id', user.id)
      .eq('question_id', question_id)
      .maybeSingle()

    if (existingAttempt) {
      return NextResponse.json(
        { error: 'Question already answered' },
        { status: 409, headers: SECURITY_HEADERS }
      )
    }

    const isCorrect = selected_option === question.correct_option_index

    // Record the attempt
    const { error: insertError } = await supabase.from('quiz_attempts').insert({
      profile_id: user.id,
      question_id: question_id,
      selected_option: selected_option,
      is_correct: isCorrect,
    })

    if (insertError) {
      console.error('[QuizAnswerAPI] Insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to record answer' },
        { status: 500, headers: SECURITY_HEADERS }
      )
    }

    // Get updated stats
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

    const options = question.options as string[]

    return NextResponse.json(
      {
        is_correct: isCorrect,
        correct_option_index: question.correct_option_index,
        correct_answer: options[question.correct_option_index],
        explanation: question.explanation,
        stats: {
          total_answered: totalAnswered || 0,
          total_correct: totalCorrect || 0,
          streak,
        },
      },
      { headers: SECURITY_HEADERS }
    )
  } catch (err) {
    console.error('[QuizAnswerAPI] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: SECURITY_HEADERS }
    )
  }
}

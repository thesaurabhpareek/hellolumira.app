/**
 * @module QuizPage
 * @description Full quiz experience with one question at a time, tappable
 *   option cards, celebration/correction animations, streak counter, and score.
 *   Mobile-first design with large tap targets (min 48px).
 *   Includes haptic feedback, sparkle effects, and streak celebrations.
 * @version 1.1.0
 * @since March 2026
 */
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import {
  triggerHaptic,
  triggerSparkle,
  triggerGreenFlash,
  triggerShake,
  triggerFloatingEmoji,
  triggerConfetti,
  animateCount,
  SKELETON_STYLES,
} from '@/lib/animations'

/* ── Types ─────────────────────────────────────────────────────────────────── */

type QuizQuestion = {
  id: string
  question_text: string
  options: string[]
  category: string
  difficulty: string
  stage: string
}

type Stats = {
  total_answered: number
  total_correct: number
  streak: number
}

type AnswerResult = {
  is_correct: boolean
  correct_option_index: number
  correct_answer: string
  explanation: string
  stats: Stats
}

/* ── Constants ─────────────────────────────────────────────────────────────── */

const DIFFICULTY_LABELS: Record<string, { label: string; color: string }> = {
  easy: { label: 'Easy', color: '#22C55E' },
  medium: { label: 'Medium', color: '#D97706' },
  hard: { label: 'Hard', color: '#DC2626' },
}

const CATEGORY_LABELS: Record<string, string> = {
  development: 'Development',
  nutrition: 'Nutrition',
  wellness: 'Wellness',
  safety: 'Safety',
  mental_health: 'Mental Health',
  myths_vs_facts: 'Myths vs Facts',
}

const STREAK_MILESTONES = [5, 10, 15, 20, 25, 50]

/* ── Component ─────────────────────────────────────────────────────────────── */

export default function QuizPage() {
  const [question, setQuestion] = useState<QuizQuestion | null>(null)
  const [stats, setStats] = useState<Stats>({ total_answered: 0, total_correct: 0, streak: 0 })
  const [loading, setLoading] = useState(true)
  const [completed, setCompleted] = useState(false)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null)
  const [answering, setAnswering] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [displayedScore, setDisplayedScore] = useState(0)

  const questionCardRef = useRef<HTMLDivElement>(null)
  const optionsContainerRef = useRef<HTMLDivElement>(null)
  const scoreRef = useRef<HTMLDivElement>(null)
  const confettiContainerRef = useRef<HTMLDivElement>(null)

  // Sync displayed score on initial load
  useEffect(() => {
    setDisplayedScore(stats.total_correct)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchNextQuestion = useCallback(async () => {
    setLoading(true)
    setError(null)
    setSelectedOption(null)
    setAnswerResult(null)
    setShowConfetti(false)

    try {
      const res = await fetch('/api/quiz/next')
      if (!res.ok) throw new Error('Failed to fetch question')
      const data = await res.json()

      if (data.completed) {
        setCompleted(true)
        setStats(data.stats)
        setDisplayedScore(data.stats.total_correct)
        setQuestion(null)
      } else {
        setQuestion(data.question)
        setStats(data.stats)
        setDisplayedScore(data.stats.total_correct)
        setCompleted(false)
      }
    } catch {
      setError('We couldn\'t load the quiz right now. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNextQuestion()
  }, [fetchNextQuestion])

  const handleSelectOption = async (optionIndex: number) => {
    if (answering || answerResult) return
    setSelectedOption(optionIndex)
    setAnswering(true)

    try {
      const res = await fetch('/api/quiz/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: question?.id,
          selected_option: optionIndex,
        }),
      })

      if (!res.ok) throw new Error('Failed to submit answer')
      const result: AnswerResult = await res.json()
      setAnswerResult(result)

      const prevScore = stats.total_correct
      setStats(result.stats)

      if (result.is_correct) {
        // --- Correct answer celebrations ---
        triggerHaptic('success')

        // Animate score counting up
        animateCount(prevScore, result.stats.total_correct, 400, (v) => {
          setDisplayedScore(v)
        })

        // Green flash on question card
        if (questionCardRef.current) {
          triggerGreenFlash(questionCardRef.current)
        }

        // Sparkle on the correct option
        const optionButtons = optionsContainerRef.current?.querySelectorAll('.quiz-option-card')
        if (optionButtons && optionButtons[result.correct_option_index]) {
          triggerSparkle(optionButtons[result.correct_option_index] as HTMLElement)
        }

        // Floating emoji
        if (optionsContainerRef.current) {
          triggerFloatingEmoji(optionsContainerRef.current, '\uD83C\uDF89')
        }

        // Check for streak milestone — extra celebration burst
        const isStreakMilestone = STREAK_MILESTONES.includes(result.stats.streak)
        if (isStreakMilestone && confettiContainerRef.current) {
          triggerConfetti(confettiContainerRef.current, 50)
          triggerHaptic('success')
          setTimeout(() => triggerHaptic('medium'), 200)
        }

        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 3000)
      } else {
        // --- Wrong answer feedback ---
        triggerHaptic('light')

        // Gentle shake on the wrong option
        const optionButtons = optionsContainerRef.current?.querySelectorAll('.quiz-option-card')
        if (optionButtons && optionButtons[optionIndex]) {
          triggerShake(optionButtons[optionIndex] as HTMLElement)
        }
      }
    } catch {
      setError('We couldn\'t save your answer. Please try again.')
      setSelectedOption(null)
    } finally {
      setAnswering(false)
    }
  }

  const getOptionStyle = (index: number): React.CSSProperties => {
    const base: React.CSSProperties = {
      width: '100%',
      textAlign: 'left',
      padding: '16px 18px',
      borderRadius: '12px',
      border: '2px solid',
      fontSize: '15px',
      fontWeight: 500,
      cursor: answerResult ? 'default' : 'pointer',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      touchAction: 'manipulation',
      WebkitTapHighlightColor: 'transparent',
      lineHeight: 1.5,
      minHeight: '52px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      background: 'var(--color-white)',
      position: 'relative',
      overflow: 'visible',
    }

    if (!answerResult) {
      if (selectedOption === index && answering) {
        return {
          ...base,
          borderColor: 'var(--color-primary)',
          background: 'var(--color-primary-light)',
          color: 'var(--color-primary)',
          transform: 'scale(0.98)',
        }
      }
      return {
        ...base,
        borderColor: 'var(--color-border)',
        color: 'var(--color-slate)',
      }
    }

    // Revealed states
    if (index === answerResult.correct_option_index) {
      return {
        ...base,
        background: '#F0FDF4',
        borderColor: '#22C55E',
        color: '#15803D',
        fontWeight: 600,
      }
    }
    if (index === selectedOption && !answerResult.is_correct) {
      return {
        ...base,
        background: '#FFF7ED',
        borderColor: '#C4844E',
        color: '#9A3412',
      }
    }
    return {
      ...base,
      borderColor: 'var(--color-border)',
      color: 'var(--color-muted)',
      opacity: 0.5,
    }
  }

  return (
    <div
      ref={confettiContainerRef}
      style={{
        minHeight: '100dvh',
        background: 'var(--color-surface)',
        paddingBottom: '100px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Confetti overlay */}
      {showConfetti && <ConfettiOverlay />}

      <div className="content-width mx-auto px-4 pt-6">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <Link
            href="/home"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-muted)',
              fontSize: '24px',
              padding: '4px 8px',
              minHeight: '48px',
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
            }}
          >
            &larr;
          </Link>
          <h1 className="text-h1" style={{ color: 'var(--color-slate)' }}>
            Quick Quiz
          </h1>
        </div>

        {/* Stats bar */}
        <div
          ref={scoreRef}
          style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '24px',
            padding: '12px 16px',
            background: 'var(--color-white)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <StatBadge label="Score" value={`${displayedScore}/${stats.total_answered}`} />
          <StatBadge label="Streak" value={`${stats.streak} in a row`} emoji={stats.streak >= 3 ? '\uD83D\uDD25' : undefined} />
          <StatBadge
            label="Accuracy"
            value={stats.total_answered > 0 ? `${Math.round((stats.total_correct / stats.total_answered) * 100)}%` : '--'}
          />
        </div>

        {/* Loading — skeleton pulse */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '8px 0' }}>
            <style>{SKELETON_STYLES}</style>
            <div className="lumira-skeleton" style={{ height: '24px', width: '40%' }} />
            <div className="lumira-skeleton" style={{ height: '100px', borderRadius: '12px' }} />
            <div className="lumira-skeleton" style={{ height: '56px', borderRadius: '12px' }} />
            <div className="lumira-skeleton" style={{ height: '56px', borderRadius: '12px' }} />
            <div className="lumira-skeleton" style={{ height: '56px', borderRadius: '12px' }} />
            <div className="lumira-skeleton" style={{ height: '56px', borderRadius: '12px' }} />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-slate)', marginBottom: '8px' }}>
              Hmm, something went wrong
            </p>
            <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: '16px' }}>{error}</p>
            <button onClick={fetchNextQuestion} className="btn-primary" style={{ maxWidth: '200px', margin: '0 auto' }}>
              Try again
            </button>
          </div>
        )}

        {/* Completed state */}
        {completed && !loading && !error && (
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <p style={{ fontSize: '48px', marginBottom: '16px' }}>{'\uD83C\uDF1F'}</p>
            <p style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-slate)', marginBottom: '8px' }}>
              All caught up!
            </p>
            <p style={{ fontSize: '15px', color: 'var(--color-muted)', lineHeight: 1.6, marginBottom: '8px' }}>
              You have answered all available questions for your current stage.
              New questions are added regularly.
            </p>
            <p style={{ fontSize: '15px', color: 'var(--color-primary)', fontWeight: 600, marginBottom: '24px' }}>
              Final score: {stats.total_correct} out of {stats.total_answered} correct
              {stats.total_answered > 0 && ` (${Math.round((stats.total_correct / stats.total_answered) * 100)}%)`}
            </p>
            <Link href="/home" className="btn-primary" style={{ maxWidth: '200px', margin: '0 auto', display: 'inline-flex' }}>
              Back to Home
            </Link>
          </div>
        )}

        {/* Question card */}
        {question && !loading && !error && !completed && (
          <div>
            {/* Question meta */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <span
                style={{
                  padding: '4px 12px',
                  borderRadius: '100px',
                  background: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                {CATEGORY_LABELS[question.category] || question.category}
              </span>
              {DIFFICULTY_LABELS[question.difficulty] && (
                <span
                  style={{
                    padding: '4px 12px',
                    borderRadius: '100px',
                    background: `${DIFFICULTY_LABELS[question.difficulty].color}15`,
                    color: DIFFICULTY_LABELS[question.difficulty].color,
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  {DIFFICULTY_LABELS[question.difficulty].label}
                </span>
              )}
            </div>

            {/* Question text */}
            <div
              ref={questionCardRef}
              style={{
                background: 'var(--color-white)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px 20px',
                marginBottom: '20px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <p
                style={{
                  fontSize: '17px',
                  fontWeight: 600,
                  color: 'var(--color-slate)',
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                {question.question_text}
              </p>
            </div>

            {/* Options */}
            <div ref={optionsContainerRef} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px', position: 'relative' }}>
              {(question.options as string[]).map((option: string, i: number) => (
                <button
                  key={i}
                  onClick={() => handleSelectOption(i)}
                  disabled={!!answerResult || answering}
                  style={getOptionStyle(i)}
                  className="quiz-option-card"
                >
                  {/* Indicator */}
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: `2px solid ${
                        answerResult && i === answerResult.correct_option_index
                          ? '#22C55E'
                          : answerResult && i === selectedOption && !answerResult.is_correct
                          ? '#C4844E'
                          : 'var(--color-border)'
                      }`,
                      background:
                        answerResult && i === answerResult.correct_option_index
                          ? '#22C55E'
                          : answerResult && i === selectedOption && !answerResult.is_correct
                          ? '#C4844E'
                          : 'transparent',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      color: '#fff',
                      fontWeight: 700,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {answerResult && i === answerResult.correct_option_index && '\u2713'}
                    {answerResult && i === selectedOption && !answerResult.is_correct && '\u2717'}
                    {!answerResult && String.fromCharCode(65 + i)}
                  </span>
                  <span style={{ flex: 1 }}>{option}</span>
                </button>
              ))}
            </div>

            {/* Streak milestone banner */}
            {answerResult && answerResult.is_correct && STREAK_MILESTONES.includes(answerResult.stats.streak) && (
              <div
                className="animate-fade-in"
                style={{
                  padding: '14px 16px',
                  background: 'linear-gradient(135deg, #3D8178 0%, #2D6B63 100%)',
                  borderRadius: 'var(--radius-lg)',
                  marginBottom: '12px',
                  textAlign: 'center',
                  color: '#fff',
                }}
              >
                <p style={{ fontSize: '20px', marginBottom: '4px' }}>{'\uD83D\uDD25'}{'\uD83C\uDF89'}{'\uD83D\uDD25'}</p>
                <p style={{ fontSize: '15px', fontWeight: 700 }}>
                  {answerResult.stats.streak}-question streak!
                </p>
                <p style={{ fontSize: '13px', opacity: 0.9 }}>You are on fire! Keep it going!</p>
              </div>
            )}

            {/* Answer result */}
            {answerResult && (
              <div
                className="animate-fade-in"
                style={{
                  padding: '20px',
                  background: answerResult.is_correct ? '#F0FDF4' : '#FFF7ED',
                  border: `1.5px solid ${answerResult.is_correct ? '#BBF7D0' : '#FED7AA'}`,
                  borderRadius: 'var(--radius-lg)',
                  marginBottom: '16px',
                }}
              >
                <p
                  style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: answerResult.is_correct ? '#15803D' : '#9A3412',
                    marginBottom: '8px',
                  }}
                >
                  {answerResult.is_correct
                    ? 'You got it! \uD83C\uDF89'
                    : 'Not quite \u2014 here\u2019s why:'}
                </p>
                <p
                  style={{
                    fontSize: '14px',
                    color: 'var(--color-slate)',
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  {answerResult.explanation}
                </p>
              </div>
            )}

            {/* Next question button */}
            {answerResult && (
              <button
                onClick={fetchNextQuestion}
                className="btn-primary"
                style={{ marginBottom: '16px' }}
              >
                Next Question &rarr;
              </button>
            )}

            {!answerResult && !answering && (
              <p
                style={{
                  fontSize: '13px',
                  color: 'var(--color-muted)',
                  textAlign: 'center',
                  marginTop: '8px',
                }}
              >
                Tap an option to answer
              </p>
            )}
          </div>
        )}

        {/* Disclaimer */}
        <div
          style={{
            marginTop: '32px',
            padding: '14px 16px',
            background: 'var(--color-white)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <p
            style={{
              fontSize: '12px',
              color: 'var(--color-muted)',
              lineHeight: 1.6,
              margin: 0,
              textAlign: 'center',
            }}
          >
            Quiz questions are for educational purposes only and should not replace
            medical advice from your healthcare provider.
          </p>
        </div>
      </div>

      {/* Hover animations for option cards */}
      <style>{`
        .quiz-option-card:not(:disabled):hover {
          transform: scale(1.02);
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
          border-color: var(--color-primary-mid) !important;
        }
        .quiz-option-card:not(:disabled):active {
          transform: scale(0.97);
        }
        @media (hover: hover) {
          .quiz-option-card:not(:disabled):hover {
            background: var(--color-primary-light) !important;
          }
        }
      `}</style>
    </div>
  )
}

/* ── Stat Badge ────────────────────────────────────────────────────────────── */

function StatBadge({ label, value, emoji }: { label: string; value: string; emoji?: string }) {
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
        {label}
      </p>
      <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-slate)', transition: 'transform 0.2s ease' }}>
        {emoji && <span>{emoji} </span>}
        {value}
      </p>
    </div>
  )
}

/* ── Confetti Overlay (CSS-only) ───────────────────────────────────────────── */

function ConfettiOverlay() {
  const pieces = Array.from({ length: 30 }, (_, i) => i)
  const colors = ['#3D8178', '#C4844E', '#F59E0B', '#22C55E', '#A8CECA', '#D97706', '#FFFFFF']
  const emojis = ['\uD83C\uDF89', '\u2728', '\uD83C\uDF1F', '\uD83C\uDFC6', '\uD83D\uDCAA', '\uD83C\uDF88']

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 1000,
        overflow: 'hidden',
      }}
    >
      {pieces.map((i) => {
        const left = Math.random() * 100
        const delay = Math.random() * 0.5
        const duration = 1.5 + Math.random() * 1.5
        const color = colors[i % colors.length]
        const isEmoji = i < 6
        const size = isEmoji ? 24 : 8 + Math.random() * 8
        const rotation = Math.random() * 720

        return (
          <span
            key={i}
            style={{
              position: 'absolute',
              left: `${left}%`,
              top: '-20px',
              width: isEmoji ? 'auto' : `${size}px`,
              height: isEmoji ? 'auto' : `${size}px`,
              background: isEmoji ? 'none' : color,
              borderRadius: isEmoji ? 'none' : Math.random() > 0.5 ? '50%' : '2px',
              fontSize: isEmoji ? `${size}px` : undefined,
              animation: `confetti-fall ${duration}s ${delay}s ease-in forwards`,
              transform: `rotate(${rotation}deg)`,
              opacity: 0,
            }}
          >
            {isEmoji ? emojis[i % emojis.length] : ''}
          </span>
        )
      })}
      <style>{`
        @keyframes confetti-fall {
          0% {
            opacity: 1;
            transform: translateY(0) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: translateY(100vh) rotate(720deg);
          }
        }
      `}</style>
    </div>
  )
}

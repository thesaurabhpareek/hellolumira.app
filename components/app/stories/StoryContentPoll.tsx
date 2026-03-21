/**
 * @module StoryContentPoll
 * @description Poll story display. Before voting, shows tappable outlined bars.
 *   After voting, shows filled bars with animated percentage fills.
 * @version 1.0.0
 * @since March 2026
 */
'use client'

import { useState, useCallback } from 'react'

interface StoryContentPollProps {
  storyId: string
  pollQuestion: string
  pollOptionA: string
  pollOptionB: string
  /** Pre-existing vote by current user, if any */
  userVote: 'A' | 'B' | null
  /** Current vote counts */
  votesA: number
  votesB: number
}

export default function StoryContentPoll({
  storyId,
  pollQuestion,
  pollOptionA,
  pollOptionB,
  userVote: initialVote,
  votesA: initialVotesA,
  votesB: initialVotesB,
}: StoryContentPollProps) {
  const [userVote, setUserVote] = useState<'A' | 'B' | null>(initialVote)
  const [votesA, setVotesA] = useState(initialVotesA)
  const [votesB, setVotesB] = useState(initialVotesB)
  const [submitting, setSubmitting] = useState(false)

  const totalVotes = votesA + votesB
  const pctA = totalVotes > 0 ? Math.round((votesA / totalVotes) * 100) : 50
  const pctB = totalVotes > 0 ? Math.round((votesB / totalVotes) * 100) : 50

  const castVote = useCallback(
    async (option: 'A' | 'B') => {
      if (userVote || submitting) return
      setSubmitting(true)

      // Optimistic update
      setUserVote(option)
      if (option === 'A') setVotesA((v) => v + 1)
      else setVotesB((v) => v + 1)

      try {
        await fetch(`/api/stories/${storyId}/poll`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ option }),
          credentials: 'same-origin',
        })
      } catch {
        // Revert on failure
        setUserVote(null)
        if (option === 'A') setVotesA((v) => v - 1)
        else setVotesB((v) => v - 1)
      } finally {
        setSubmitting(false)
      }
    },
    [storyId, userVote, submitting]
  )

  const hasVoted = userVote !== null

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6">
      {/* Question */}
      <p
        className="text-white text-xl font-semibold text-center mb-8 leading-[1.4]"
        style={{ textShadow: '0 1px 8px rgba(0,0,0,0.3)' }}
      >
        {pollQuestion}
      </p>

      {/* Option bars */}
      <div className="w-full max-w-[320px] flex flex-col gap-3">
        <PollBar
          label={pollOptionA}
          percentage={pctA}
          isSelected={userVote === 'A'}
          hasVoted={hasVoted}
          disabled={submitting}
          onClick={() => castVote('A')}
        />
        <PollBar
          label={pollOptionB}
          percentage={pctB}
          isSelected={userVote === 'B'}
          hasVoted={hasVoted}
          disabled={submitting}
          onClick={() => castVote('B')}
        />
      </div>

      {hasVoted && (
        <p className="text-white/60 text-xs mt-4">
          {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
        </p>
      )}
    </div>
  )
}

function PollBar({
  label,
  percentage,
  isSelected,
  hasVoted,
  disabled,
  onClick,
}: {
  label: string
  percentage: number
  isSelected: boolean
  hasVoted: boolean
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || hasVoted}
      className="relative w-full min-h-[52px] rounded-xl overflow-hidden text-left transition-all duration-200 touch-manipulation"
      style={{
        border: isSelected
          ? '2px solid white'
          : hasVoted
          ? '1.5px solid rgba(255,255,255,0.3)'
          : '1.5px solid rgba(255,255,255,0.5)',
        background: hasVoted ? 'rgba(255,255,255,0.08)' : 'transparent',
        cursor: hasVoted ? 'default' : 'pointer',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* Fill bar (after vote) */}
      {hasVoted && (
        <div
          className="absolute inset-y-0 left-0 rounded-xl"
          style={{
            width: `${percentage}%`,
            background: isSelected
              ? 'rgba(61, 129, 120, 0.4)'
              : 'rgba(255,255,255,0.1)',
            transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      )}

      {/* Content */}
      <div className="relative flex items-center justify-between px-4 py-3">
        <span className="text-white font-medium text-[15px]">{label}</span>
        {hasVoted && (
          <span className="text-white font-bold text-[15px] ml-2">
            {percentage}%
          </span>
        )}
      </div>
    </button>
  )
}

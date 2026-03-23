/**
 * @module ChatLanding
 * @description Chat landing page showing the thread list and new conversation
 *   entry point. Fetches threads for the active baby profile and routes to
 *   individual thread views.
 * @version 1.0.0
 * @since March 2026
 */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getBabyAgeInfo } from '@/lib/baby-age'
import { getGreeting } from '@/lib/greeting'
import SuggestedPromptsRow from './SuggestedPromptsRow'
import { LumiraAvatar } from '@/components/app/LumiraAvatar'
import type { Profile, BabyProfile } from '@/types/app'
import type { ChatThread } from '@/types/chat'

interface ThreadWithPreview extends ChatThread {
  last_message_preview: string | null
  last_message_role: string | null
}

interface Props {
  profile: Profile
  baby: BabyProfile
  threads: ThreadWithPreview[]
}

export default function ChatLanding({ profile, baby, threads }: Props) {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [greeting, setGreeting] = useState<string>(`Hello, ${profile.first_name}`)
  const ageInfo = getBabyAgeInfo(baby)

  // Resolve local-time greeting on mount
  useEffect(() => {
    const localHour = new Date().getHours()
    setGreeting(getGreeting(localHour, profile.first_name))
  }, [profile.first_name])

  const createNewThread = async (initialMessage?: string) => {
    if (isCreating) return
    setIsCreating(true)

    try {
      const res = await fetch('/api/chat/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baby_id: baby.id,
          source: 'direct',
        }),
      })
      if (!res.ok) throw new Error('Failed to create thread')
      const data = await res.json()

      if (initialMessage) {
        // Store the initial message in sessionStorage so the thread page can pick it up
        sessionStorage.setItem(`chat_initial_${data.thread_id}`, initialMessage)
      }

      router.push(`/chat/${data.thread_id}`)
    } catch {
      setIsCreating(false)
    }
  }

  const formatTime = (dateString: string | null) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const hasThreads = threads.length > 0

  return (
    <div
      style={{
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-surface)',
        paddingBottom: '24px',
      }}
    >
      <div className="content-width mx-auto px-4 pt-6">
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
          }}
        >
          <div>
            <h1
              className="text-h2"
              style={{ color: 'var(--color-slate)' }}
            >
              {greeting}
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginTop: '2px' }}>
              {baby.stage === 'pregnancy'
                ? 'What\'s on your mind today?'
                : `How is ${baby.name || 'your little one'} doing today?`}
            </p>
          </div>

          {hasThreads && (
            <button
              onClick={() => createNewThread()}
              disabled={isCreating}
              aria-label="Start new conversation"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-primary)',
                border: 'none',
                cursor: isCreating ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                opacity: isCreating ? 0.5 : 1,
                transition: 'opacity 0.15s ease',
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          )}
        </div>

        {/* Empty state with suggested prompts */}
        {!hasThreads && (
          <div>
            {/* Lumira intro card */}
            <div
              className="lumira-card"
              style={{ marginBottom: '24px', textAlign: 'center', padding: '32px 24px' }}
            >
              <div style={{ margin: '0 auto 16px', width: '56px' }}>
                <LumiraAvatar size={56} />
              </div>

              <h2
                className="text-h3"
                style={{ color: 'var(--color-slate)', marginBottom: '8px' }}
              >
                I&apos;m here for you, {profile.first_name}
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--color-muted)', lineHeight: 1.6 }}>
                {baby.stage === 'pregnancy'
                  ? 'Ask me anything about your pregnancy — symptoms, what to expect, or just what\'s on your mind.'
                  : `Ask me anything about ${baby.name || 'your baby'} — sleep, feeding, development, or whatever you\'re thinking about.`}
              </p>
            </div>

            {/* Suggested prompts */}
            <div style={{ marginBottom: '24px' }}>
              <p
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--color-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '12px',
                }}
              >
                Suggested topics
              </p>
              <SuggestedPromptsRow
                stage={baby.stage}
                babyAgeWeeks={ageInfo.age_in_weeks}
                pregnancyWeek={ageInfo.pregnancy_week}
                babyName={baby.name}
                onSelect={(message) => createNewThread(message)}
                layout="grid"
              />
            </div>

            {/* New thread button */}
            <button
              onClick={() => createNewThread()}
              disabled={isCreating}
              className="btn-primary"
              style={{ marginTop: '8px' }}
            >
              {isCreating ? 'Starting...' : 'Start a conversation'}
            </button>
          </div>
        )}

        {/* Thread list */}
        {hasThreads && (
          <div>
            {/* Quick suggested prompts row */}
            <div style={{ marginBottom: '20px' }}>
              <SuggestedPromptsRow
                stage={baby.stage}
                babyAgeWeeks={ageInfo.age_in_weeks}
                pregnancyWeek={ageInfo.pregnancy_week}
                babyName={baby.name}
                onSelect={(message) => createNewThread(message)}
                layout="scroll"
              />
            </div>

            <p
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '12px',
              }}
            >
              Recent conversations
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {threads.map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => router.push(`/chat/${thread.id}`)}
                  className="thread-card"
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '6px',
                    }}
                  >
                    <p
                      style={{
                        fontWeight: 600,
                        fontSize: '15px',
                        color: 'var(--color-slate)',
                        lineHeight: 1.3,
                        flex: 1,
                        marginRight: '12px',
                      }}
                    >
                      {thread.title || 'New conversation'}
                    </p>
                    <span
                      style={{
                        fontSize: '12px',
                        color: 'var(--color-muted)',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}
                    >
                      {formatTime(thread.last_message_at)}
                    </span>
                  </div>

                  {thread.last_message_preview && (
                    <p
                      style={{
                        fontSize: '13px',
                        color: 'var(--color-muted)',
                        lineHeight: 1.5,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {thread.last_message_role === 'assistant' ? 'Lumira: ' : 'You: '}
                      {thread.last_message_preview}
                    </p>
                  )}

                  {/* Escalation indicator */}
                  {thread.highest_escalation_level &&
                    thread.highest_escalation_level !== 'none' && (
                      <div
                        style={{
                          marginTop: '8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px',
                          fontWeight: 600,
                          color:
                            thread.highest_escalation_level === 'emergency'
                              ? 'var(--color-red)'
                              : thread.highest_escalation_level === 'urgent'
                              ? 'var(--color-red)'
                              : 'var(--color-amber)',
                          background:
                            thread.highest_escalation_level === 'emergency' ||
                            thread.highest_escalation_level === 'urgent'
                              ? 'var(--color-red-light)'
                              : 'var(--color-amber-light)',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        {thread.highest_escalation_level === 'emergency' && 'Emergency'}
                        {thread.highest_escalation_level === 'urgent' && 'Urgent'}
                        {thread.highest_escalation_level === 'call_doctor' && 'Doctor advised'}
                        {thread.highest_escalation_level === 'monitor' && 'Monitoring'}
                      </div>
                    )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

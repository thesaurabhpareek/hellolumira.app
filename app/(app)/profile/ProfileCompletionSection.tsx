// app/(app)/profile/ProfileCompletionSection.tsx — Journey-style profile completion
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface CompletionItem {
  key: string
  label: string
  warmLabel: string
  done: boolean
  actionType: 'link' | 'date' | 'text' | 'none'
  href?: string
  placeholder?: string
}

interface ProfileCompletionSectionProps {
  items: CompletionItem[]
  initialPercentage: number
  babyId?: string
}

export default function ProfileCompletionSection({
  items: initialItems,
  initialPercentage: _initialPercentage,
  babyId,
}: ProfileCompletionSectionProps) {
  const [items, setItems] = useState(initialItems)
  const [expandedKey, setExpandedKey] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [isPending, startTransition] = useTransition()
  const [toast, setToast] = useState<string | null>(null)
  const router = useRouter()

  const completedCount = items.filter((i) => i.done).length
  const percentage = Math.round((completedCount / items.length) * 100)
  const allDone = completedCount === items.length

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const handleSave = async (item: CompletionItem) => {
    if (!inputValue.trim()) return

    try {
      const res = await fetch('/api/profile/update-field', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          field: item.key,
          value: inputValue.trim(),
          baby_id: babyId,
        }),
      })

      if (res.ok) {
        setItems((prev) =>
          prev.map((i) => (i.key === item.key ? { ...i, done: true } : i))
        )
        setExpandedKey(null)
        setInputValue('')
        showToast('Saved! Nice work.')

        // Try to award seeds for profile completion
        const allOthersDone = items.filter((i) => i.key !== item.key).every((i) => i.done)
        if (allOthersDone) {
          fetch('/api/seeds/award', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason: 'complete_profile' }),
          }).catch(() => {})
        }

        startTransition(() => {
          router.refresh()
        })
      } else {
        showToast("Hmm, that didn't save. Please try again.")
      }
    } catch {
      showToast('Something went wrong — please try again.')
    }
  }

  return (
    <div className="lumira-card mb-4">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <p
          style={{
            fontSize: '13px',
            fontWeight: 700,
            color: 'var(--color-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Your Journey
        </p>
        <span
          style={{
            fontSize: '12px',
            fontWeight: 700,
            color: allDone ? '#22C55E' : 'var(--color-primary)',
            background: allDone ? '#F0FDF4' : 'var(--color-primary-light)',
            padding: '3px 10px',
            borderRadius: '100px',
          }}
        >
          {allDone ? 'Complete!' : `${completedCount}/${items.length}`}
        </span>
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: '6px',
          borderRadius: '3px',
          background: '#F3F4F6',
          marginBottom: '20px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${percentage}%`,
            borderRadius: '3px',
            background: allDone
              ? 'linear-gradient(90deg, #22C55E, #16A34A)'
              : 'linear-gradient(90deg, var(--color-primary), #5BA89F)',
            transition: 'width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        />
      </div>

      {/* Journey steps */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          const isExpanded = expandedKey === item.key

          return (
            <div key={item.key} style={{ display: 'flex', gap: '14px' }}>
              {/* Timeline connector */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flexShrink: 0,
                  width: '28px',
                }}
              >
                {/* Step circle */}
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    background: item.done ? '#22C55E' : '#F3F4F6',
                    border: item.done ? 'none' : '2px solid #D1D5DB',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {item.done ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 7L6 10L11 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF' }}>
                      {index + 1}
                    </span>
                  )}
                </div>
                {/* Connecting line */}
                {!isLast && (
                  <div
                    style={{
                      width: '2px',
                      flex: 1,
                      minHeight: '20px',
                      background: item.done ? '#22C55E' : '#E5E7EB',
                      borderRadius: '1px',
                      ...(item.done ? {} : { backgroundImage: 'repeating-linear-gradient(to bottom, #D1D5DB 0px, #D1D5DB 4px, transparent 4px, transparent 8px)', background: 'transparent' }),
                    }}
                  />
                )}
              </div>

              {/* Content */}
              <div style={{ flex: 1, paddingBottom: isLast ? '0' : '16px', minWidth: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    minHeight: '28px',
                  }}
                >
                  <p
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: item.done ? '#22C55E' : 'var(--color-slate)',
                      textDecoration: item.done ? 'none' : 'none',
                      transition: 'color 0.3s ease',
                    }}
                  >
                    {item.label}
                    {item.done && (
                      <span style={{ fontSize: '11px', fontWeight: 500, color: '#86EFAC', marginLeft: '8px' }}>
                        Done
                      </span>
                    )}
                  </p>

                  {/* Action CTA for incomplete items */}
                  {!item.done && item.actionType !== 'none' && (
                    <>
                      {item.actionType === 'link' && item.href && (
                        <a
                          href={item.href}
                          style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            color: 'var(--color-primary)',
                            textDecoration: 'none',
                            padding: '5px 14px',
                            borderRadius: '100px',
                            background: 'var(--color-primary-light)',
                            whiteSpace: 'nowrap',
                            transition: 'opacity 0.15s ease',
                          }}
                        >
                          {item.warmLabel}
                        </a>
                      )}
                      {(item.actionType === 'date' || item.actionType === 'text') && (
                        <button
                          onClick={() => {
                            setExpandedKey(isExpanded ? null : item.key)
                            setInputValue('')
                          }}
                          style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            color: 'var(--color-primary)',
                            background: 'var(--color-primary-light)',
                            border: 'none',
                            padding: '5px 14px',
                            borderRadius: '100px',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            transition: 'opacity 0.15s ease',
                          }}
                        >
                          {item.warmLabel}
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* Inline editor */}
                {!item.done && isExpanded && (
                  <div
                    style={{
                      marginTop: '10px',
                      padding: '12px',
                      background: 'var(--color-surface)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center',
                    }}
                  >
                    <input
                      type={item.actionType === 'date' ? 'date' : 'text'}
                      placeholder={item.placeholder || ''}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      autoFocus
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid var(--color-border)',
                        background: 'var(--color-white)',
                        fontSize: '14px',
                        color: 'var(--color-slate)',
                        outline: 'none',
                        minHeight: '44px',
                      }}
                    />
                    <button
                      onClick={() => handleSave(item)}
                      disabled={isPending || !inputValue.trim()}
                      style={{
                        padding: '10px 16px',
                        borderRadius: 'var(--radius-md)',
                        border: 'none',
                        background: isPending || !inputValue.trim() ? '#E5E7EB' : 'var(--color-primary)',
                        color: isPending || !inputValue.trim() ? '#9CA3AF' : '#FFFFFF',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: isPending || !inputValue.trim() ? 'default' : 'pointer',
                        minHeight: '44px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {isPending ? '...' : 'Save'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* All done celebration */}
      {allDone && (
        <div
          style={{
            marginTop: '16px',
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            background: '#F0FDF4',
            border: '1px solid #BBF7D0',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#15803D' }}>
            🎉 Your profile is complete!
          </p>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--color-slate)',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: '100px',
            fontSize: '14px',
            fontWeight: 500,
            zIndex: 100,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          {toast}
        </div>
      )}
    </div>
  )
}

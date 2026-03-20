// app/(app)/profile/ProfileCompletionSection.tsx — Interactive profile completion with inline CTAs
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import ProfileCompletionArc from './ProfileCompletionArc'

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
        const allDone = items.filter((i) => i.key !== item.key).every((i) => i.done)
        if (allDone) {
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
        showToast('Hmm, that didn\'t save. Please try again.')
      }
    } catch {
      showToast('Something went wrong — please try again.')
    }
  }

  return (
    <div className="lumira-card mb-4">
      <p
        style={{
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--color-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '16px',
        }}
      >
        Profile Completeness
      </p>
      <ProfileCompletionArc percentage={percentage} />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          marginTop: '16px',
        }}
      >
        {items.map((item) => (
          <div key={item.key}>
            {/* Status pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  borderRadius: '100px',
                  background: item.done ? 'var(--color-primary-light)' : '#F3F4F6',
                  color: item.done ? 'var(--color-primary)' : '#9CA3AF',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                {item.done ? '✓' : '○'} {item.label}
              </span>

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
                        padding: '4px 12px',
                        borderRadius: '100px',
                        background: 'var(--color-primary-light)',
                        transition: 'opacity 0.15s ease',
                      }}
                    >
                      {item.warmLabel}
                    </a>
                  )}
                  {(item.actionType === 'date' || item.actionType === 'text') && (
                    <button
                      onClick={() => {
                        setExpandedKey(expandedKey === item.key ? null : item.key)
                        setInputValue('')
                      }}
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'var(--color-primary)',
                        background: 'var(--color-primary-light)',
                        border: 'none',
                        padding: '4px 12px',
                        borderRadius: '100px',
                        cursor: 'pointer',
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
            {!item.done && expandedKey === item.key && (
              <div
                style={{
                  marginTop: '8px',
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
                    background:
                      isPending || !inputValue.trim()
                        ? '#E5E7EB'
                        : 'var(--color-primary)',
                    color:
                      isPending || !inputValue.trim()
                        ? '#9CA3AF'
                        : '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: isPending || !inputValue.trim() ? 'default' : 'pointer',
                    minHeight: '44px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

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

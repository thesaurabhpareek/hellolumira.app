// app/(app)/concern/ConcernSelectorClient.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Stage } from '@/types/app'

export default function ConcernSelectorClient({ stage }: { stage: Stage }) {
  const router = useRouter()
  const [showInput, setShowInput] = useState(false)
  const [freeText, setFreeText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFreeText = async () => {
    if (!freeText.trim()) return
    setLoading(true)
    setError('')

    const attempt = async (): Promise<{ concern_type: string }> => {
      const res = await fetch('/api/route-concern', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ free_text: freeText.trim(), stage }),
      })
      if (!res.ok) throw new Error('Failed to classify concern')
      return res.json()
    }

    try {
      const data = await attempt()
      router.push(`/concern/${data.concern_type}`)
    } catch {
      try {
        await new Promise((r) => setTimeout(r, 1000))
        const data = await attempt()
        router.push(`/concern/${data.concern_type}`)
      } catch {
        setError("Couldn't classify — try picking a topic above.")
        setLoading(false)
      }
    }
  }

  if (!showInput) {
    return (
      <button
        onClick={() => setShowInput(true)}
        style={{
          width: '100%',
          padding: '20px',
          background: 'var(--color-white)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{ fontSize: '28px' }}>💬</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 600, color: 'var(--color-slate)', fontSize: '15px' }}>
            Something else
          </p>
          <p style={{ color: 'var(--color-muted)', fontSize: '13px' }}>
            Describe what&apos;s going on
          </p>
        </div>
        <span style={{ color: 'var(--color-muted)', fontSize: '18px' }}>›</span>
      </button>
    )
  }

  return (
    <div
      className="lumira-card animate-fade-in"
      style={{ marginTop: '0' }}
    >
      <p style={{ fontWeight: 600, color: 'var(--color-slate)', marginBottom: '12px' }}>
        Tell me what&apos;s on your mind
      </p>
      <textarea
        value={freeText}
        onChange={(e) => setFreeText(e.target.value)}
        placeholder="Describe what you're noticing or worried about..."
        rows={4}
        autoFocus
        style={{
          width: '100%',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          border: '1.5px solid var(--color-border)',
          fontSize: '15px',
          lineHeight: 1.6,
          resize: 'none',
          marginBottom: '12px',
        }}
      />
      {error && (
        <p style={{ color: 'var(--color-red)', fontSize: '13px', marginBottom: '8px' }}>
          {error}
        </p>
      )}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setShowInput(false)}
          className="btn-ghost"
          style={{ flex: '0 0 80px' }}
        >
          Back
        </button>
        <button
          onClick={handleFreeText}
          disabled={!freeText.trim() || loading}
          className="btn-primary"
        >
          {loading ? 'Working out the best path...' : 'Continue'}
        </button>
      </div>
    </div>
  )
}

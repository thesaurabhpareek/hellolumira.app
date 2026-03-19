// app/(app)/journal/new/page.tsx — Journal entry
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function NewJournalEntryPage() {
  const router = useRouter()
  const [body, setBody] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id)
      } else {
        router.push('/auth')
      }
    })
  }, [router])

  const handleSave = async () => {
    if (!body.trim() || !userId) return
    setSaving(true)
    setError('')

    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]

    const attempt = async () => {
      const { error: insertError } = await supabase.from('journal_entries').insert({
        profile_id: userId,
        body: body.trim(),
        entry_date: today,
      })
      if (insertError) throw insertError
    }

    try {
      await attempt()
      router.push('/home')
    } catch {
      try {
        await new Promise((r) => setTimeout(r, 1000))
        await attempt()
        router.push('/home')
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Couldn't save your entry. Please try again."
        )
        setSaving(false)
      }
    }
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--color-surface)',
        paddingBottom: '32px',
      }}
    >
      <div className="content-width mx-auto px-4 pt-6">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <button
            onClick={() => router.back()}
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
            }}
          >
            ←
          </button>
          <h1 className="text-h1" style={{ color: 'var(--color-slate)' }}>
            New journal entry
          </h1>
        </div>

        <div className="lumira-card">
          <p
            style={{
              fontSize: '13px',
              color: 'var(--color-muted)',
              marginBottom: '12px',
            }}
          >
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write whatever&apos;s on your mind. This is just for you."
            autoFocus
            style={{
              width: '100%',
              minHeight: '200px',
              padding: '0',
              border: 'none',
              outline: 'none',
              fontSize: '16px',
              lineHeight: 1.7,
              color: 'var(--color-slate)',
              background: 'transparent',
              resize: 'none',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {error && (
          <div
            style={{
              background: 'var(--color-red-light)',
              border: '1px solid #FEB2B2',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              marginTop: '12px',
              color: 'var(--color-red)',
              fontSize: '14px',
            }}
          >
            {error}
          </div>
        )}

        <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
          <button
            onClick={() => router.back()}
            className="btn-ghost"
            style={{ flex: '0 0 auto', width: '80px' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!body.trim() || saving}
            className="btn-primary"
          >
            {saving ? 'Saving...' : 'Save entry'}
          </button>
        </div>
      </div>
    </div>
  )
}

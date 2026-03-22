// app/(app)/milestones/new/page.tsx — Log milestone
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { MilestoneType, Stage } from '@/types/app'

const PREGNANCY_MILESTONES: { id: MilestoneType; label: string; emoji: string }[] = [
  { id: 'first_scan', label: 'First scan', emoji: '🖥️' },
  { id: 'anatomy_scan', label: 'Anatomy scan', emoji: '🩻' },
  { id: 'first_kick', label: 'First kick felt', emoji: '👟' },
  { id: 'third_trimester', label: 'Third trimester', emoji: '🌙' },
  { id: 'birth_plan_done', label: 'Birth plan done', emoji: '📋' },
  { id: 'other', label: 'Other milestone', emoji: '⭐' },
]

const INFANT_MILESTONES: { id: MilestoneType; label: string; emoji: string }[] = [
  { id: 'rolling', label: 'Rolling over', emoji: '🔄' },
  { id: 'sitting', label: 'Sitting up', emoji: '🧸' },
  { id: 'crawling', label: 'Crawling', emoji: '🐾' },
  { id: 'pulling_to_stand', label: 'Pulling to stand', emoji: '🙌' },
  { id: 'first_word', label: 'First word', emoji: '💬' },
  { id: 'pincer_grip', label: 'Pincer grip', emoji: '✌️' },
  { id: 'walking', label: 'Walking', emoji: '👣' },
  { id: 'other', label: 'Other milestone', emoji: '⭐' },
]

export default function NewMilestonePage() {
  const router = useRouter()
  const [stage, setStage] = useState<Stage>('infant')
  const [selectedType, setSelectedType] = useState<MilestoneType | null>(null)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [babyId, setBabyId] = useState<string | null>(null)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    const supabase = createClient()
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const { data: memberData } = await supabase
        .from('baby_profile_members')
        .select('baby_id')
        .eq('profile_id', user.id)
        .limit(1)
        .maybeSingle()

      if (memberData?.baby_id) {
        setBabyId(memberData.baby_id)
        const { data: babyData } = await supabase
          .from('baby_profiles')
          .select('stage')
          .eq('id', memberData.baby_id)
          .single()
        if (babyData) setStage(babyData.stage as Stage)
      }
    }
    load()
  }, [router])

  const milestones = stage === 'pregnancy' ? PREGNANCY_MILESTONES : INFANT_MILESTONES

  const handleSave = async () => {
    if (!selectedType || !userId || !babyId) return
    setSaving(true)
    setError('')

    const supabase = createClient()

    const attempt = async () => {
      const { error: insertError } = await supabase.from('milestones').insert({
        baby_id: babyId,
        profile_id: userId,
        stage,
        milestone_type: selectedType,
        milestone_date: date,
        notes: notes.trim() || null,
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
          err instanceof Error ? err.message : "Couldn't save milestone. Please try again."
        )
        setSaving(false)
      }
    }
  }

  return (
    <div
      style={{
        minHeight: '100%',
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
              color: '#3D8178',
              fontSize: '14px',
              fontWeight: 600,
              padding: '16px 0',
              minHeight: '48px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            &larr; Back
          </button>
          <h1 className="text-h1" style={{ color: 'var(--color-slate)' }}>
            Log a milestone
          </h1>
        </div>

        {/* Milestone type selection */}
        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-slate)', marginBottom: '12px' }}>
            What milestone?
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '10px',
            }}
          >
            {milestones.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedType(m.id)}
                style={{
                  padding: '16px 12px',
                  borderRadius: 'var(--radius-lg)',
                  border: `2px solid ${selectedType === m.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: selectedType === m.id ? 'var(--color-primary-light)' : 'var(--color-white)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  minHeight: '80px',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontSize: '24px' }}>{m.emoji}</span>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: selectedType === m.id ? 'var(--color-primary)' : 'var(--color-slate)',
                    textAlign: 'center',
                    lineHeight: 1.3,
                  }}
                >
                  {m.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Date picker */}
        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--color-slate)',
              marginBottom: '8px',
            }}
          >
            When did this happen?
          </label>
          <input
            type="date"
            value={date}
            max={today}
            onChange={(e) => setDate(e.target.value)}
            style={{
              width: '100%',
              height: '52px',
              padding: '0 16px',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--color-border)',
              fontSize: '16px',
              color: 'var(--color-slate)',
              background: 'var(--color-white)',
            }}
          />
        </div>

        {/* Notes */}
        <div style={{ marginBottom: '24px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--color-slate)',
              marginBottom: '8px',
            }}
          >
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any details worth remembering..."
            rows={3}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--color-border)',
              fontSize: '15px',
              lineHeight: 1.6,
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
              marginBottom: '16px',
              color: 'var(--color-red)',
              fontSize: '14px',
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => router.back()}
            className="btn-ghost"
            style={{ flex: '0 0 80px' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!selectedType || saving}
            className="btn-primary"
          >
            {saving ? 'Saving...' : 'Save milestone 🎉'}
          </button>
        </div>
      </div>
    </div>
  )
}

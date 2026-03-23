'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type {
  PrivacyPreferences,
  ConsentRecord,
} from '@/types/app'
import IOSToggle from '@/components/ui/ios-toggle'

/* ------------------------------------------------------------------ */
/*  State types                                                        */
/* ------------------------------------------------------------------ */

type LoadingState = 'loading' | 'ready' | 'error'

type DeleteModalState = {
  open: boolean
  confirmText: string
  submitting: boolean
}

/* ------------------------------------------------------------------ */
/*  Section header                                                     */
/* ------------------------------------------------------------------ */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
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
      {children}
    </p>
  )
}

/* ------------------------------------------------------------------ */
/*  Skeleton card                                                      */
/* ------------------------------------------------------------------ */

function SkeletonCard({ rows = 3 }: { rows?: number }) {
  return (
    <div className="lumira-card mb-6" style={{ borderRadius: '14px' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="shimmer"
          style={{
            height: '20px',
            borderRadius: '6px',
            marginBottom: i < rows - 1 ? '12px' : 0,
            width: i === 0 ? '40%' : '80%',
          }}
        />
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function PrivacySettingsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [state, setState] = useState<LoadingState>('loading')
  const [userId, setUserId] = useState<string | null>(null)

  // Privacy preferences
  const [prefs, setPrefs] = useState<PrivacyPreferences | null>(null)
  const [saving, setSaving] = useState(false)

  // Consent history
  const [consentRecords, setConsentRecords] = useState<ConsentRecord[]>([])

  // Data export
  const [exportDownloaded, setExportDownloaded] = useState(false)
  const [exportSubmitting, setExportSubmitting] = useState(false)

  // Delete modal
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    open: false,
    confirmText: '',
    submitting: false,
  })

  /* ---------------------------------------------------------------- */
  /*  Load data                                                        */
  /* ---------------------------------------------------------------- */

  const loadData = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setUserId(user.id)

      // Load privacy preferences (upsert default if none exists)
      const { data: prefData } = await supabase
        .from('privacy_preferences')
        .select('*')
        .eq('profile_id', user.id)
        .maybeSingle()

      if (prefData) {
        setPrefs(prefData as PrivacyPreferences)
      } else {
        // Create default preferences
        const defaults: Omit<PrivacyPreferences, 'id'> = {
          profile_id: user.id,
          ai_processing_enabled: true,
          analytics_enabled: true,
          product_improvement_enabled: true,
          data_retention_months: 24,
          gdpr_applicable: false,
          ccpa_applicable: false,
          updated_at: new Date().toISOString(),
        }
        const { data: newPref } = await supabase
          .from('privacy_preferences')
          .insert(defaults)
          .select()
          .single()
        if (newPref) setPrefs(newPref as PrivacyPreferences)
      }

      // Load consent records
      const { data: consents } = await supabase
        .from('consent_records')
        .select('*')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (consents) setConsentRecords(consents as ConsentRecord[])

      setState('ready')
    } catch {
      setState('error')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  /* ---------------------------------------------------------------- */
  /*  Update preference                                                */
  /* ---------------------------------------------------------------- */

  async function updatePref(
    field: keyof PrivacyPreferences,
    value: boolean | number
  ) {
    if (!prefs || !userId) return
    setSaving(true)

    const updated = { ...prefs, [field]: value, updated_at: new Date().toISOString() }
    setPrefs(updated)

    await supabase
      .from('privacy_preferences')
      .update({ [field]: value, updated_at: updated.updated_at })
      .eq('profile_id', userId)

    // Record consent change for relevant toggles
    if (field === 'ai_processing_enabled' || field === 'analytics_enabled') {
      const consentType = field === 'ai_processing_enabled' ? 'data_processing' : 'analytics'
      const action = value ? 'granted' : 'withdrawn'
      await supabase.from('consent_records').insert({
        profile_id: userId,
        consent_type: consentType,
        action,
        capture_method: 'settings_toggle',
        page_url: '/settings/privacy',
        created_at: new Date().toISOString(),
      })

      // Refresh consent history
      const { data: consents } = await supabase
        .from('consent_records')
        .select('*')
        .eq('profile_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (consents) setConsentRecords(consents as ConsentRecord[])
    }

    setSaving(false)
  }

  /* ---------------------------------------------------------------- */
  /*  Data export                                                      */
  /* ---------------------------------------------------------------- */

  async function requestExport() {
    setExportSubmitting(true)

    try {
      const res = await fetch('/api/privacy/request-export', { method: 'POST' })
      if (!res.ok) throw new Error('Export request failed')

      const result = await res.json()
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const date = new Date().toISOString().slice(0, 10)
      const a = document.createElement('a')
      a.href = url
      a.download = `lumira-export-${date}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      setExportDownloaded(true)
    } catch {
      // silently fail — user can retry
    } finally {
      setExportSubmitting(false)
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Delete account                                                   */
  /* ---------------------------------------------------------------- */

  async function requestDeletion() {
    if (!userId) return
    setDeleteModal((m) => ({ ...m, submitting: true }))

    await supabase.from('data_deletion_requests').insert({
      profile_id: userId,
      status: 'pending',
      requested_at: new Date().toISOString(),
    })

    await supabase.auth.signOut()
    router.push('/')
  }

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  if (state === 'loading') {
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
            <div className="shimmer" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
            <div className="shimmer" style={{ width: '180px', height: '28px', borderRadius: '6px' }} />
          </div>
          <SkeletonCard rows={4} />
          <SkeletonCard rows={3} />
          <SkeletonCard rows={2} />
          <SkeletonCard rows={5} />
        </div>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div
        style={{
          minHeight: '100%',
          background: 'var(--color-surface)',
          paddingBottom: '32px',
        }}
      >
        <div className="content-width mx-auto px-4 pt-6">
          <button
            onClick={() => router.push('/settings')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-primary)',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              padding: 0,
              marginBottom: '24px',
            }}
          >
            &larr; Back to Settings
          </button>
          <div className="lumira-card" style={{ borderRadius: '14px', textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ color: 'var(--color-slate)', fontWeight: 600, marginBottom: '8px' }}>
              Hmm, that didn&apos;t work
            </p>
            <p style={{ color: 'var(--color-muted)', fontSize: '14px', marginBottom: '16px' }}>
              We couldn&apos;t load your privacy settings. Let&apos;s try again.
            </p>
            <button className="btn-primary" style={{ maxWidth: '200px', margin: '0 auto' }} onClick={loadData}>
              Try again
            </button>
          </div>
        </div>
      </div>
    )
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
        {/* Header */}
        <button
          onClick={() => router.push('/settings')}
          style={{
            background: 'none',
            border: 'none',
            color: '#3D8178',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '16px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          &larr; Settings
        </button>
        <h1 className="text-h1 mb-6" style={{ color: 'var(--color-slate)' }}>
          Privacy &amp; Data
        </h1>

        {/* ---- AI Processing ---- */}
        <div className="lumira-card" style={{ borderRadius: '14px', marginBottom: '24px' }}>
          <SectionLabel>AI Processing</SectionLabel>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              minHeight: '48px',
            }}
          >
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, color: 'var(--color-slate)', fontSize: '15px', marginBottom: '4px' }}>
                Personalised AI responses
              </p>
              <p style={{ fontSize: '13px', color: 'var(--color-muted)', lineHeight: 1.5 }}>
                {prefs?.ai_processing_enabled
                  ? 'Lumira uses AI to provide personalised guidance based on your check-ins.'
                  : 'AI responses are turned off. Lumira will track check-ins but won\u2019t generate personalised responses.'}
              </p>
            </div>
            <IOSToggle
              checked={prefs?.ai_processing_enabled ?? true}
              onChange={(v) => updatePref('ai_processing_enabled', v)}
              disabled={saving}
            />
          </div>
        </div>

        {/* ---- Data Retention ---- */}
        <div className="lumira-card" style={{ borderRadius: '14px', marginBottom: '24px' }}>
          <SectionLabel>Data Retention</SectionLabel>
          <p style={{ fontSize: '13px', color: 'var(--color-muted)', lineHeight: 1.5, marginBottom: '16px' }}>
            Choose how long Lumira keeps your check-in data. Older data will be automatically deleted.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {([12, 24, 36] as const).map((months) => (
              <label
                key={months}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  borderRadius: '10px',
                  border: `1.5px solid ${prefs?.data_retention_months === months ? '#3D8178' : 'var(--color-border)'}`,
                  background:
                    prefs?.data_retention_months === months
                      ? 'rgba(91, 140, 107, 0.06)'
                      : 'var(--color-white)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  minHeight: '48px',
                }}
              >
                <input
                  type="radio"
                  name="data_retention"
                  checked={prefs?.data_retention_months === months}
                  onChange={() => updatePref('data_retention_months', months)}
                  style={{
                    accentColor: '#3D8178',
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer',
                  }}
                />
                <span style={{ fontWeight: 500, color: 'var(--color-slate)', fontSize: '15px' }}>
                  {months} months
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* ---- Analytics ---- */}
        <div className="lumira-card" style={{ borderRadius: '14px', marginBottom: '24px' }}>
          <SectionLabel>Analytics</SectionLabel>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              minHeight: '48px',
            }}
          >
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, color: 'var(--color-slate)', fontSize: '15px', marginBottom: '4px' }}>
                Usage analytics
              </p>
              <p style={{ fontSize: '13px', color: 'var(--color-muted)', lineHeight: 1.5 }}>
                Help improve Lumira by sharing anonymous usage data. No personal information is included.
              </p>
            </div>
            <IOSToggle
              checked={prefs?.analytics_enabled ?? true}
              onChange={(v) => updatePref('analytics_enabled', v)}
              disabled={saving}
            />
          </div>
        </div>

        {/* ---- Consent History ---- */}
        <div className="lumira-card" style={{ borderRadius: '14px', marginBottom: '24px' }}>
          <SectionLabel>My Consent History</SectionLabel>
          {consentRecords.length === 0 ? (
            <p style={{ fontSize: '14px', color: 'var(--color-muted)' }}>
              No consent records yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {consentRecords.map((record) => (
                <div
                  key={record.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: 'var(--color-slate)',
                        textTransform: 'capitalize',
                      }}
                    >
                      {record.consent_type.replace(/_/g, ' ')}
                    </span>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '100px',
                        background:
                          record.action === 'granted'
                            ? 'var(--color-green-light)'
                            : 'var(--color-red-light)',
                        color:
                          record.action === 'granted'
                            ? 'var(--color-green)'
                            : 'var(--color-red)',
                      }}
                    >
                      {record.action}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--color-muted)' }}>
                    <span>
                      {new Date(record.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span style={{ textTransform: 'capitalize' }}>
                      {record.capture_method.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ---- Download My Data ---- */}
        <div className="lumira-card" style={{ borderRadius: '14px', marginBottom: '24px' }}>
          <SectionLabel>Download My Data</SectionLabel>
          <p style={{ fontSize: '13px', color: 'var(--color-muted)', lineHeight: 1.5, marginBottom: '16px' }}>
            Download a copy of all the data Lumira holds about you. This is your right under GDPR Article 20.
            Your file will be prepared and downloaded immediately.
          </p>

          {exportDownloaded && (
            <div
              style={{
                padding: '14px 16px',
                borderRadius: '10px',
                background: 'var(--color-primary-light)',
                border: '1px solid var(--color-primary-mid)',
                marginBottom: '12px',
              }}
            >
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-primary)' }}>
                Your data has been downloaded
              </p>
            </div>
          )}

          <button
            className="btn-ghost"
            onClick={requestExport}
            disabled={exportSubmitting}
            style={{ maxWidth: '220px' }}
          >
            {exportSubmitting ? 'Preparing...' : 'Download my data'}
          </button>

          <p style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '12px', lineHeight: 1.5 }}>
            Your data export will include check-ins, journal entries, consent records, and profile information.
            It does not include data from other members linked to your baby profile.
          </p>
        </div>

        {/* ---- Delete My Account ---- */}
        <div
          style={{
            background: '#FFF5F5',
            border: '1px solid #FEB2B2',
            borderRadius: '14px',
            padding: '20px',
            marginBottom: '24px',
          }}
        >
          <SectionLabel>Delete My Account</SectionLabel>
          <p style={{ fontSize: '13px', color: 'var(--color-muted)', lineHeight: 1.5, marginBottom: '12px' }}>
            Permanently delete your Lumira account and all associated data. This action cannot be undone.
          </p>
          <p
            style={{
              fontSize: '13px',
              color: 'var(--color-red)',
              lineHeight: 1.5,
              marginBottom: '16px',
              fontWeight: 500,
            }}
          >
            If you share a baby profile with a co-parent, your check-in history will also be removed from their view.
          </p>
          <button
            onClick={() => setDeleteModal({ open: true, confirmText: '', submitting: false })}
            style={{
              height: '48px',
              padding: '0 24px',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--color-red)',
              background: 'transparent',
              color: 'var(--color-red)',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Delete my account
          </button>
        </div>
      </div>

      {/* ---- Delete Confirmation Modal ---- */}
      {deleteModal.open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
          onClick={() => {
            if (!deleteModal.submitting) {
              setDeleteModal({ open: false, confirmText: '', submitting: false })
            }
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--color-white)',
              borderRadius: '16px',
              padding: '28px 24px',
              maxWidth: '400px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }}
          >
            <h2
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: 'var(--color-red)',
                marginBottom: '12px',
              }}
            >
              Delete your account?
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--color-muted)', lineHeight: 1.6, marginBottom: '20px' }}>
              This will permanently delete all your data including check-ins, journal entries, and consent records.
              This action cannot be undone.
            </p>
            <label style={{ display: 'block', marginBottom: '16px' }}>
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-slate)', marginBottom: '8px' }}>
                Type <span style={{ fontFamily: 'monospace', background: 'var(--color-surface)', padding: '2px 6px', borderRadius: '4px' }}>DELETE</span> to confirm
              </p>
              <input
                type="text"
                value={deleteModal.confirmText}
                onChange={(e) => setDeleteModal((m) => ({ ...m, confirmText: e.target.value }))}
                placeholder="DELETE"
                autoFocus
                style={{
                  width: '100%',
                  height: '48px',
                  padding: '0 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  fontSize: '15px',
                  fontFamily: 'monospace',
                  color: 'var(--color-slate)',
                  outline: 'none',
                }}
              />
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className="btn-ghost"
                onClick={() => setDeleteModal({ open: false, confirmText: '', submitting: false })}
                disabled={deleteModal.submitting}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                onClick={requestDeletion}
                disabled={deleteModal.confirmText !== 'DELETE' || deleteModal.submitting}
                style={{
                  flex: 1,
                  height: '52px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: deleteModal.confirmText === 'DELETE' ? 'var(--color-red)' : '#E2E8F0',
                  color: deleteModal.confirmText === 'DELETE' ? 'white' : 'var(--color-muted)',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: deleteModal.confirmText === 'DELETE' ? 'pointer' : 'not-allowed',
                  transition: 'all 0.15s ease',
                }}
              >
                {deleteModal.submitting ? 'Deleting...' : 'Delete forever'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

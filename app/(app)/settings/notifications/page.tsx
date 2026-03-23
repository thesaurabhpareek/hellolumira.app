'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { CommunicationPreferences } from '@/types/app'
import IOSToggle from '@/components/ui/ios-toggle'

/* ------------------------------------------------------------------ */
/*  State types                                                        */
/* ------------------------------------------------------------------ */

type LoadingState = 'loading' | 'ready' | 'error'

/* ------------------------------------------------------------------ */
/*  Toggle row component                                               */
/* ------------------------------------------------------------------ */

function ToggleRow({
  label,
  description,
  checked,
  onChange,
  disabled,
  indent,
}: {
  label: string
  description?: string
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
  indent?: boolean
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        minHeight: '48px',
        paddingLeft: indent ? '16px' : 0,
      }}
    >
      <div style={{ flex: 1 }}>
        <p
          style={{
            fontWeight: indent ? 500 : 600,
            color: disabled ? 'var(--color-muted)' : 'var(--color-slate)',
            fontSize: '15px',
            marginBottom: description ? '2px' : 0,
          }}
        >
          {label}
        </p>
        {description && (
          <p style={{ fontSize: '13px', color: 'var(--color-muted)', lineHeight: 1.4 }}>
            {description}
          </p>
        )}
      </div>
      <IOSToggle checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  )
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
/*  Hour options helper                                                */
/* ------------------------------------------------------------------ */

function formatHour(hour: number): string {
  if (hour === 0) return '12:00 AM'
  if (hour === 12) return '12:00 PM'
  if (hour < 12) return `${hour}:00 AM`
  return `${hour - 12}:00 PM`
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function NotificationSettingsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [state, setState] = useState<LoadingState>('loading')
  const [userId, setUserId] = useState<string | null>(null)
  const [prefs, setPrefs] = useState<CommunicationPreferences | null>(null)
  const [saving, setSaving] = useState(false)

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

      const { data: prefData } = await supabase
        .from('communication_preferences')
        .select('*')
        .eq('profile_id', user.id)
        .maybeSingle()

      if (prefData) {
        setPrefs(prefData as CommunicationPreferences)
      } else {
        // Detect timezone
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone

        const defaults: Omit<CommunicationPreferences, 'id'> = {
          profile_id: user.id,
          email_enabled: true,
          email_daily_checkin: true,
          email_pattern_alerts: true,
          email_weekly_guide: true,
          email_concern_followup: true,
          whatsapp_enabled: false,
          sms_enabled: false,
          checkin_hour: 9,
          timezone: tz,
          quiet_hours_start: 22,
          quiet_hours_end: 7,
          updated_at: new Date().toISOString(),
        }
        const { data: newPref } = await supabase
          .from('communication_preferences')
          .insert(defaults)
          .select()
          .single()
        if (newPref) setPrefs(newPref as CommunicationPreferences)
      }

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
    field: keyof CommunicationPreferences,
    value: boolean | number | string
  ) {
    if (!prefs || !userId) return
    setSaving(true)

    const updated = { ...prefs, [field]: value, updated_at: new Date().toISOString() }

    // If email master toggle is turned off, disable all sub-toggles
    if (field === 'email_enabled' && value === false) {
      updated.email_daily_checkin = false
      updated.email_pattern_alerts = false
      updated.email_weekly_guide = false
      updated.email_concern_followup = false
    }

    // If email master toggle is turned on, enable all sub-toggles
    if (field === 'email_enabled' && value === true) {
      updated.email_daily_checkin = true
      updated.email_pattern_alerts = true
      updated.email_weekly_guide = true
      updated.email_concern_followup = true
    }

    setPrefs(updated)

    const updatePayload: Record<string, unknown> = {
      [field]: value,
      updated_at: updated.updated_at,
    }

    // Include sub-toggle changes when master toggle changes
    if (field === 'email_enabled') {
      updatePayload.email_daily_checkin = updated.email_daily_checkin
      updatePayload.email_pattern_alerts = updated.email_pattern_alerts
      updatePayload.email_weekly_guide = updated.email_weekly_guide
      updatePayload.email_concern_followup = updated.email_concern_followup
    }

    await supabase
      .from('communication_preferences')
      .update(updatePayload)
      .eq('profile_id', userId)

    setSaving(false)
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
            <div className="shimmer" style={{ width: '160px', height: '28px', borderRadius: '6px' }} />
          </div>
          <SkeletonCard rows={3} />
          <SkeletonCard rows={3} />
          <SkeletonCard rows={5} />
          <SkeletonCard rows={2} />
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
              We couldn&apos;t load your notification settings. Let&apos;s try again.
            </p>
            <button className="btn-primary" style={{ maxWidth: '200px', margin: '0 auto' }} onClick={loadData}>
              Try again
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Checkin hour options: 5am - 10pm
  const checkinHours: number[] = []
  for (let h = 5; h <= 22; h++) checkinHours.push(h)

  // Quiet hours options: all 24 hours
  const allHours: number[] = []
  for (let h = 0; h < 24; h++) allHours.push(h)

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
          Notifications
        </h1>

        {/* ---- Daily Check-in Time ---- */}
        <div className="lumira-card" style={{ borderRadius: '14px', marginBottom: '24px' }}>
          <SectionLabel>Daily Check-in Time</SectionLabel>
          <p style={{ fontSize: '13px', color: 'var(--color-muted)', lineHeight: 1.5, marginBottom: '14px' }}>
            When would you like your daily check-in reminder?
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <select
              value={prefs?.checkin_hour ?? 9}
              onChange={(e) => updatePref('checkin_hour', parseInt(e.target.value))}
              disabled={saving}
              style={{
                height: '48px',
                padding: '0 36px 0 14px',
                borderRadius: '10px',
                border: '1.5px solid var(--color-border)',
                background: 'var(--color-white)',
                fontSize: '15px',
                fontWeight: 500,
                color: 'var(--color-slate)',
                cursor: 'pointer',
                appearance: 'none',
                backgroundImage:
                  'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'8\' viewBox=\'0 0 12 8\'%3E%3Cpath d=\'M1 1l5 5 5-5\' stroke=\'%23718096\' stroke-width=\'2\' fill=\'none\'/%3E%3C/svg%3E")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 14px center',
                minWidth: '140px',
              }}
            >
              {checkinHours.map((h) => (
                <option key={h} value={h}>
                  {formatHour(h)}
                </option>
              ))}
            </select>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '10px' }}>
            Timezone: {prefs?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone}
          </p>
        </div>

        {/* ---- Quiet Hours ---- */}
        <div className="lumira-card" style={{ borderRadius: '14px', marginBottom: '24px' }}>
          <SectionLabel>Quiet Hours</SectionLabel>
          <p style={{ fontSize: '13px', color: 'var(--color-muted)', lineHeight: 1.5, marginBottom: '14px' }}>
            Lumira won&apos;t send you any notifications during these hours.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--color-muted)', marginBottom: '6px', fontWeight: 500 }}>
                Start
              </p>
              <select
                value={prefs?.quiet_hours_start ?? 22}
                onChange={(e) => updatePref('quiet_hours_start', parseInt(e.target.value))}
                disabled={saving}
                style={{
                  height: '48px',
                  padding: '0 36px 0 14px',
                  borderRadius: '10px',
                  border: '1.5px solid var(--color-border)',
                  background: 'var(--color-white)',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: 'var(--color-slate)',
                  cursor: 'pointer',
                  appearance: 'none',
                  backgroundImage:
                    'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'8\' viewBox=\'0 0 12 8\'%3E%3Cpath d=\'M1 1l5 5 5-5\' stroke=\'%23718096\' stroke-width=\'2\' fill=\'none\'/%3E%3C/svg%3E")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 14px center',
                  minWidth: '130px',
                }}
              >
                {allHours.map((h) => (
                  <option key={h} value={h}>
                    {formatHour(h)}
                  </option>
                ))}
              </select>
            </div>
            <span style={{ fontSize: '14px', color: 'var(--color-muted)', paddingTop: '22px' }}>to</span>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--color-muted)', marginBottom: '6px', fontWeight: 500 }}>
                End
              </p>
              <select
                value={prefs?.quiet_hours_end ?? 7}
                onChange={(e) => updatePref('quiet_hours_end', parseInt(e.target.value))}
                disabled={saving}
                style={{
                  height: '48px',
                  padding: '0 36px 0 14px',
                  borderRadius: '10px',
                  border: '1.5px solid var(--color-border)',
                  background: 'var(--color-white)',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: 'var(--color-slate)',
                  cursor: 'pointer',
                  appearance: 'none',
                  backgroundImage:
                    'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'8\' viewBox=\'0 0 12 8\'%3E%3Cpath d=\'M1 1l5 5 5-5\' stroke=\'%23718096\' stroke-width=\'2\' fill=\'none\'/%3E%3C/svg%3E")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 14px center',
                  minWidth: '130px',
                }}
              >
                {allHours.map((h) => (
                  <option key={h} value={h}>
                    {formatHour(h)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ---- Email Notifications ---- */}
        <div className="lumira-card" style={{ borderRadius: '14px', marginBottom: '24px' }}>
          <SectionLabel>Email Notifications</SectionLabel>

          {/* Master toggle */}
          <ToggleRow
            label="Email notifications"
            description="Receive updates and reminders by email"
            checked={prefs?.email_enabled ?? true}
            onChange={(v) => updatePref('email_enabled', v)}
            disabled={saving}
          />

          {/* Divider */}
          <div style={{ height: '1px', background: 'var(--color-border)', margin: '14px 0' }} />

          {/* Sub-toggles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <ToggleRow
              label="Daily check-in reminder"
              checked={prefs?.email_daily_checkin ?? true}
              onChange={(v) => updatePref('email_daily_checkin', v)}
              disabled={saving || !prefs?.email_enabled}
              indent
            />
            <ToggleRow
              label="Pattern alerts"
              description="When Lumira notices a trend in your data"
              checked={prefs?.email_pattern_alerts ?? true}
              onChange={(v) => updatePref('email_pattern_alerts', v)}
              disabled={saving || !prefs?.email_enabled}
              indent
            />
            <ToggleRow
              label="Weekly guide"
              description="Stage-relevant guidance each week"
              checked={prefs?.email_weekly_guide ?? true}
              onChange={(v) => updatePref('email_weekly_guide', v)}
              disabled={saving || !prefs?.email_enabled}
              indent
            />
            <ToggleRow
              label="Concern follow-ups"
              description="Check-back messages after a concern"
              checked={prefs?.email_concern_followup ?? true}
              onChange={(v) => updatePref('email_concern_followup', v)}
              disabled={saving || !prefs?.email_enabled}
              indent
            />
          </div>
        </div>

      </div>
    </div>
  )
}

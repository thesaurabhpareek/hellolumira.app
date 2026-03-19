// app/onboarding/page.tsx — 3-step onboarding
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import OnboardingStep from '@/components/app/OnboardingStep'
import ConsentCheckbox from '@/components/app/ConsentCheckbox'
import type { Stage, ConsentType } from '@/types/app'

type ParentingMode = 'pregnancy' | 'born'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [userId, setUserId] = useState<string | null>(null)

  // Step 1
  const [firstName, setFirstName] = useState('')

  // Step 2
  const [mode, setMode] = useState<ParentingMode | null>(null)
  const [dueDate, setDueDate] = useState('')
  const [babyName, setBabyName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')

  // Step 3
  const [firstTimeParent, setFirstTimeParent] = useState<boolean | null>(null)
  const [initialConcern, setInitialConcern] = useState('')

  // Invite step
  const [showInvite, setShowInvite] = useState(false)
  const [partnerEmail, setPartnerEmail] = useState('')
  const [babyId, setBabyId] = useState<string | null>(null)
  const [inviteSent, setInviteSent] = useState(false)
  const [inviteLoading, setInviteLoading] = useState(false)

  // Consent
  const [consentChecked, setConsentChecked] = useState(false)
  const [consentError, setConsentError] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const today = new Date().toISOString().split('T')[0]
  const maxDueDate = new Date()
  maxDueDate.setMonth(maxDueDate.getMonth() + 10)
  const maxDueDateStr = maxDueDate.toISOString().split('T')[0]

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

  const handleStep1 = () => {
    if (!firstName.trim()) return
    setStep(2)
  }

  const handleStep2 = () => {
    if (!mode) return
    if (mode === 'pregnancy' && !dueDate) return
    if (mode === 'born' && !dateOfBirth) return
    setStep(3)
  }

  const handleComplete = async () => {
    if (firstTimeParent === null || !userId) return

    // Validate consent
    if (!consentChecked) {
      setConsentError('Please agree to continue')
      return
    }
    setConsentError('')
    setIsSubmitting(true)
    setError('')

    try {
      const supabase = createClient()

      // Upsert profile
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: userId,
        first_name: firstName.trim(),
        first_time_parent: firstTimeParent,
        first_checkin_complete: false,
        updated_at: new Date().toISOString(),
      })
      if (profileError) throw profileError

      // Determine stage
      const stage: Stage = mode === 'pregnancy' ? 'pregnancy' : 'infant'

      // Insert baby profile
      const babyInsertData: Record<string, unknown> = {
        stage,
        created_by_profile_id: userId,
      }

      if (mode === 'pregnancy') {
        babyInsertData.due_date = dueDate
        if (babyName.trim()) babyInsertData.name = babyName.trim()
      } else {
        babyInsertData.date_of_birth = dateOfBirth
        babyInsertData.name = babyName.trim() || null
      }

      const { data: babyData, error: babyError } = await supabase
        .from('baby_profiles')
        .insert(babyInsertData)
        .select()
        .single()

      if (babyError) throw babyError

      const newBabyId = babyData.id
      setBabyId(newBabyId)

      // Insert baby_profile_members
      const { error: memberError } = await supabase.from('baby_profile_members').insert({
        baby_id: newBabyId,
        profile_id: userId,
      })
      if (memberError) throw memberError

      // Insert consent records (BLOCKING — consent must be recorded before proceeding)
      const consentTypes: ConsentType[] = [
        'terms_of_service',
        'privacy_policy',
        'data_processing',
        'sensitive_data',
      ]
      const consentRows = consentTypes.map((consentType) => ({
        profile_id: userId,
        consent_type: consentType,
        action: 'granted' as const,
        capture_method: 'onboarding_explicit' as const,
        document_version: '2026-03-01',
        ip_address: null,
        page_url: '/onboarding',
      }))

      const { error: consentInsertError } = await supabase
        .from('consent_records')
        .insert(consentRows)

      if (consentInsertError) {
        console.error('[onboarding] Failed to insert consent records:', consentInsertError.message)
        throw new Error('We could not record your consent. Please try again.')
      }

      // Store consent in sessionStorage as backup
      try {
        sessionStorage.setItem(
          'lumira_consent_backup',
          JSON.stringify({
            profile_id: userId,
            consent_types: consentTypes,
            action: 'granted',
            capture_method: 'onboarding_explicit',
            document_version: '2026-03-01',
            page_url: '/onboarding',
            timestamp: new Date().toISOString(),
          })
        )
      } catch {
        // sessionStorage may not be available
      }

      // Store initial concern if provided (non-blocking)
      if (initialConcern.trim()) {
        void supabase.from('concern_sessions').insert({
          baby_id: newBabyId,
          profile_id: userId,
          concern_type: 'general',
          initial_message: initialConcern.trim().slice(0, 2000),
          created_at: new Date().toISOString(),
        })
      }

      // Audit log — account created (non-blocking, client-side insert)
      void supabase.from('audit_log').insert({
        event_type: 'account_created',
        profile_id: userId,
        metadata: { method: 'onboarding' },
        ip_hash: null,
        user_agent: navigator.userAgent || null,
        created_at: new Date().toISOString(),
      })

      // Show invite step
      setShowInvite(true)
      setIsSubmitting(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not complete setup. Please check your connection and try again.')
      setIsSubmitting(false)
    }
  }

  const handleSendInvite = async () => {
    if (!partnerEmail.trim() || !babyId) return
    setInviteLoading(true)
    try {
      const res = await fetch('/api/invite-partner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baby_id: babyId, email: partnerEmail.trim() }),
      })
      if (!res.ok) throw new Error('Failed to send invite')
      setInviteSent(true)
    } catch {
      // Non-critical — just proceed
    } finally {
      setInviteLoading(false)
    }
  }

  const handleFinish = () => {
    router.push('/home')
  }

  if (showInvite) {
    return (
      <div
        className="flex flex-col items-center justify-center px-6"
        style={{ background: 'var(--color-surface)', minHeight: '100dvh' }}
      >
        <div className="content-width w-full animate-fade-in">
          <div className="lumira-card">
            <div className="text-center mb-6">
              <span style={{ fontSize: '40px' }}>💌</span>
            </div>
            <h2 className="text-h1 mb-2 text-center" style={{ color: 'var(--color-slate)' }}>
              Invite your partner?
            </h2>
            <p className="text-body-muted text-center mb-6">
              They&apos;ll get their own view and can log check-ins too.
            </p>

            {inviteSent ? (
              <div
                style={{
                  background: 'var(--color-green-light)',
                  border: '1px solid #9AE6B4',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  textAlign: 'center',
                  marginBottom: '20px',
                }}
              >
                <p style={{ color: 'var(--color-green)', fontWeight: 600 }}>
                  ✓ Invite sent to {partnerEmail}
                </p>
              </div>
            ) : (
              <div className="mb-4">
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={partnerEmail}
                  onChange={(e) => setPartnerEmail(e.target.value)}
                  placeholder="partner@example.com"
                  style={{
                    width: '100%',
                    height: '52px',
                    padding: '0 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--color-border)',
                    fontSize: '16px',
                    marginBottom: '12px',
                  }}
                />
                <button
                  onClick={handleSendInvite}
                  disabled={!partnerEmail.trim() || inviteLoading}
                  className="btn-primary"
                >
                  {inviteLoading ? 'Sending...' : 'Send invite'}
                </button>
              </div>
            )}

            <button
              onClick={handleFinish}
              style={{
                width: '100%',
                textAlign: 'center',
                padding: '12px',
                minHeight: '48px',
                color: 'var(--color-muted)',
                fontSize: '15px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                touchAction: 'manipulation',
              }}
            >
              {inviteSent ? "Let's go →" : 'Skip for now'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex flex-col items-center justify-start px-6 py-8"
      style={{ background: 'var(--color-surface)', minHeight: '100dvh' }}
    >
      <div className="content-width w-full">
        {/* Logo */}
        <div className="text-center mb-6">
          <span
            style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-primary)' }}
          >
            Lumira
          </span>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <OnboardingStep step={1} total={3} title="What should we call you?">
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Your first name"
              autoFocus
              autoComplete="given-name"
              enterKeyHint="next"
              onKeyDown={(e) => e.key === 'Enter' && handleStep1()}
              style={{
                width: '100%',
                height: '52px',
                padding: '0 16px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--color-border)',
                fontSize: '18px',
                color: 'var(--color-slate)',
                background: 'var(--color-white)',
                outline: 'none',
                marginBottom: '20px',
              }}
            />
            <button
              onClick={handleStep1}
              disabled={!firstName.trim()}
              className="btn-primary"
            >
              Continue
            </button>
          </OnboardingStep>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <OnboardingStep
            step={2}
            total={3}
            title="Where are you in your journey?"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {/* Pregnancy card */}
              <button
                onClick={() => setMode('pregnancy')}
                style={{
                  padding: '20px',
                  borderRadius: 'var(--radius-lg)',
                  border: `2px solid ${mode === 'pregnancy' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: mode === 'pregnancy' ? 'var(--color-primary-light)' : 'var(--color-white)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>🤰</div>
                <div style={{ fontWeight: 700, fontSize: '17px', color: 'var(--color-slate)', marginBottom: 4 }}>
                  I&apos;m pregnant
                </div>
                <div style={{ fontSize: '14px', color: 'var(--color-muted)' }}>
                  Track your pregnancy week by week
                </div>
              </button>

              {/* Born card */}
              <button
                onClick={() => setMode('born')}
                style={{
                  padding: '20px',
                  borderRadius: 'var(--radius-lg)',
                  border: `2px solid ${mode === 'born' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: mode === 'born' ? 'var(--color-primary-light)' : 'var(--color-white)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>👶</div>
                <div style={{ fontWeight: 700, fontSize: '17px', color: 'var(--color-slate)', marginBottom: 4 }}>
                  My baby is already here
                </div>
                <div style={{ fontSize: '14px', color: 'var(--color-muted)' }}>
                  Get support from day one
                </div>
              </button>
            </div>

            {/* Conditional date fields */}
            {mode === 'pregnancy' && (
              <div className="animate-fade-in" style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--color-slate)',
                    marginBottom: '8px',
                  }}
                >
                  When is your due date?
                </label>
                <input
                  type="date"
                  value={dueDate}
                  min={today}
                  max={maxDueDateStr}
                  onChange={(e) => setDueDate(e.target.value)}
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
            )}

            {mode === 'born' && (
              <div className="animate-fade-in" style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--color-slate)',
                    marginBottom: '8px',
                  }}
                >
                  Baby&apos;s name (optional)
                </label>
                <input
                  type="text"
                  value={babyName}
                  onChange={(e) => setBabyName(e.target.value)}
                  placeholder="e.g. Meera"
                  style={{
                    width: '100%',
                    height: '52px',
                    padding: '0 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--color-border)',
                    fontSize: '16px',
                    color: 'var(--color-slate)',
                    background: 'var(--color-white)',
                    marginBottom: '12px',
                  }}
                />
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--color-slate)',
                    marginBottom: '8px',
                  }}
                >
                  Date of birth
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  max={today}
                  onChange={(e) => setDateOfBirth(e.target.value)}
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
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setStep(1)}
                className="btn-ghost"
                style={{ flex: '0 0 auto', width: '80px' }}
              >
                Back
              </button>
              <button
                onClick={handleStep2}
                disabled={
                  !mode ||
                  (mode === 'pregnancy' && !dueDate) ||
                  (mode === 'born' && !dateOfBirth)
                }
                className="btn-primary"
              >
                Continue
              </button>
            </div>
          </OnboardingStep>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <OnboardingStep
            step={3}
            total={3}
            title="Almost there"
            subtitle="Just a couple more things to personalise your experience."
          >
            {/* Baby name (pregnancy only, if not set) */}
            {mode === 'pregnancy' && (
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
                  Have a name in mind for baby? (optional)
                </label>
                <input
                  type="text"
                  value={babyName}
                  onChange={(e) => setBabyName(e.target.value)}
                  placeholder="Skip if not yet decided"
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
            )}

            {/* First time parent */}
            <div style={{ marginBottom: '20px' }}>
              <p
                style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'var(--color-slate)',
                  marginBottom: '12px',
                }}
              >
                First-time parent?
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setFirstTimeParent(true)}
                  className={firstTimeParent === true ? 'chip chip-selected' : 'chip'}
                  style={{ flex: 1 }}
                >
                  Yes ✨
                </button>
                <button
                  onClick={() => setFirstTimeParent(false)}
                  className={firstTimeParent === false ? 'chip chip-selected' : 'chip'}
                  style={{ flex: 1 }}
                >
                  No, I&apos;ve done this before
                </button>
              </div>
            </div>

            {/* Optional concern */}
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
                Anything specific on your mind? (optional)
              </label>
              <textarea
                value={initialConcern}
                onChange={(e) => setInitialConcern(e.target.value)}
                placeholder="Whatever's on your mind — no pressure"
                rows={3}
                enterKeyHint="done"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  fontSize: '16px',
                  color: 'var(--color-slate)',
                  background: 'var(--color-white)',
                  resize: 'none',
                  lineHeight: 1.6,
                }}
              />
            </div>

            {/* Consent */}
            <ConsentCheckbox
              checked={consentChecked}
              onChange={(checked) => {
                setConsentChecked(checked)
                if (checked) setConsentError('')
              }}
              error={consentError}
            />

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
                onClick={() => setStep(2)}
                className="btn-ghost"
                style={{ flex: '0 0 auto', width: '80px' }}
              >
                Back
              </button>
              <button
                onClick={handleComplete}
                disabled={firstTimeParent === null || isSubmitting}
                className="btn-primary"
              >
                {isSubmitting ? "Setting up..." : "Let's go"}
              </button>
            </div>
          </OnboardingStep>
        )}
      </div>
    </div>
  )
}

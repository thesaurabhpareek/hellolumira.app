// app/(app)/settings/page.tsx — Settings
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBabyAgeInfo } from '@/lib/baby-age'
import SignOutButton from './SignOutButton'
import type { Profile, BabyProfile } from '@/types/app'

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch profile, baby membership, and partner info in parallel
  const [{ data: profileData }, { data: memberData }, { data: partnerInvites }] = await Promise.all([
    supabase.from('profiles').select('id, first_name, first_time_parent, partner_invite_email').eq('id', user.id).single(),
    supabase.from('baby_profile_members').select('baby_id').eq('profile_id', user.id).limit(1).maybeSingle(),
    supabase.from('partner_invites').select('id, invited_email, accepted_at').eq('invited_by_profile_id', user.id).order('created_at', { ascending: false }).limit(5),
  ])

  if (!profileData) redirect('/onboarding')

  const profile = profileData as Profile

  let baby: BabyProfile | null = null
  if (memberData?.baby_id) {
    const { data: babyData } = await supabase
      .from('baby_profiles')
      .select('id, name, due_date, date_of_birth, stage, pending_proactive_type, pending_proactive_set_at, created_by_profile_id, created_at')
      .eq('id', memberData.baby_id)
      .single()
    baby = babyData
  }

  const ageInfo = baby ? getBabyAgeInfo(baby) : null

  // Find connected partner (another member on the same baby profile)
  let connectedPartnerName: string | null = null
  if (baby) {
    const { data: otherMembers } = await supabase
      .from('baby_profile_members')
      .select('profile_id')
      .eq('baby_id', baby.id)
      .neq('profile_id', user.id)
      .limit(1)
      .maybeSingle()

    if (otherMembers?.profile_id) {
      const { data: partnerProfile } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('id', otherMembers.profile_id)
        .single()
      connectedPartnerName = partnerProfile?.first_name || null
    }
  }

  const acceptedInvite = partnerInvites?.find((inv: { accepted_at: string | null }) => inv.accepted_at !== null)
  const pendingInvite = partnerInvites?.find((inv: { accepted_at: string | null }) => inv.accepted_at === null)
  void acceptedInvite

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--color-surface)',
        paddingBottom: '32px',
      }}
    >
      <div className="content-width mx-auto px-4 pt-6">
        <h1 className="text-h1 mb-6" style={{ color: 'var(--color-slate)' }}>
          Settings
        </h1>

        {/* Profile card */}
        <div className="lumira-card mb-4">
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
            Your profile
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: '2px' }}>Name</p>
              <p style={{ fontWeight: 600, color: 'var(--color-slate)' }}>
                {profile.first_name}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: '2px' }}>Email</p>
              <p style={{ fontWeight: 600, color: 'var(--color-slate)' }}>
                {user.email}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: '2px' }}>First-time parent</p>
              <p style={{ fontWeight: 600, color: 'var(--color-slate)' }}>
                {profile.first_time_parent ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
        </div>

        {/* Baby card */}
        {baby && (
          <div className="lumira-card mb-4">
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
              {baby.name || 'Baby'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Stage badge */}
              <div>
                <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: '4px' }}>Stage</p>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '4px 12px',
                    borderRadius: '100px',
                    background: 'var(--color-primary-light)',
                    color: 'var(--color-primary)',
                    fontWeight: 600,
                    fontSize: '14px',
                  }}
                >
                  {ageInfo?.age_display_string || baby.stage}
                </span>
              </div>

              {baby.due_date && (
                <div>
                  <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: '2px' }}>Due date</p>
                  <p style={{ fontWeight: 600, color: 'var(--color-slate)' }}>
                    {new Date(baby.due_date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              )}

              {baby.date_of_birth && (
                <div>
                  <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: '2px' }}>Date of birth</p>
                  <p style={{ fontWeight: 600, color: 'var(--color-slate)' }}>
                    {new Date(baby.date_of_birth).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Connected parent */}
        <div className="lumira-card mb-4">
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
            Connected parent
          </p>
          {connectedPartnerName ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontWeight: 600, color: 'var(--color-slate)' }}>{connectedPartnerName}</p>
                  <p style={{ fontSize: '13px', color: 'var(--color-muted)' }}>Connected</p>
                </div>
                <button
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid #FEB2B2',
                    background: 'var(--color-red-light)',
                    color: 'var(--color-red)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ) : pendingInvite ? (
            <div>
              <p style={{ fontSize: '14px', color: 'var(--color-muted)', marginBottom: '4px' }}>
                Invite sent to <span style={{ fontWeight: 600 }}>{pendingInvite.invited_email}</span>
              </p>
              <p style={{ fontSize: '13px', color: 'var(--color-muted)' }}>Waiting for them to accept</p>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '14px', color: 'var(--color-muted)', marginBottom: '12px' }}>
                No partner connected yet. Invite another parent to share updates and track together.
              </p>
              <a
                href="/share"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-primary)',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Share Lumira with your partner
              </a>
            </div>
          )}
        </div>

        {/* Settings navigation */}
        <div className="lumira-card mb-4">
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
            Preferences
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <a
              href="/settings/privacy"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 4px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: 'var(--color-slate)',
                transition: 'background 0.15s ease',
                minHeight: '48px',
              }}
            >
              <div>
                <p style={{ fontWeight: 600, fontSize: '15px', marginBottom: '2px' }}>Privacy &amp; Data</p>
                <p style={{ fontSize: '13px', color: 'var(--color-muted)' }}>AI processing, data retention, exports</p>
              </div>
              <span style={{ color: 'var(--color-muted)', fontSize: '18px' }}>&rsaquo;</span>
            </a>
            <div style={{ height: '1px', background: 'var(--color-border)', margin: '0 4px' }} />
            <a
              href="/settings/notifications"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 4px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: 'var(--color-slate)',
                transition: 'background 0.15s ease',
                minHeight: '48px',
              }}
            >
              <div>
                <p style={{ fontWeight: 600, fontSize: '15px', marginBottom: '2px' }}>Notifications</p>
                <p style={{ fontSize: '13px', color: 'var(--color-muted)' }}>Check-in time, email, quiet hours</p>
              </div>
              <span style={{ color: 'var(--color-muted)', fontSize: '18px' }}>&rsaquo;</span>
            </a>
          </div>
        </div>

        {/* About */}
        <div className="lumira-card mb-6">
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
            About Lumira
          </p>
          <p style={{ fontSize: '14px', color: 'var(--color-muted)', lineHeight: 1.6, marginBottom: '16px' }}>
            Lumira is a calm parenting companion from hellolumira.app. It is not a substitute for obstetric or pediatric medical care. Always consult your healthcare provider for medical concerns.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <a
              href="/legal"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 4px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: 'var(--color-slate)',
                minHeight: '48px',
              }}
            >
              <p style={{ fontWeight: 600, fontSize: '15px' }}>Legal</p>
              <span style={{ color: 'var(--color-muted)', fontSize: '18px' }}>&rsaquo;</span>
            </a>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '12px' }}>
            Version 0.1.0
          </p>
        </div>

        {/* Sign out */}
        <SignOutButton />

        {/* Delete account */}
        <div style={{ textAlign: 'center', marginTop: '16px', paddingBottom: '16px' }}>
          <a
            href="/settings/privacy"
            style={{
              fontSize: '14px',
              color: 'var(--color-red)',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            Delete my account
          </a>
        </div>
      </div>
    </div>
  )
}

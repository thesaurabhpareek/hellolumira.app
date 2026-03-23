// app/(app)/settings/page.tsx — Settings with enhanced partner invite
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getBabyAgeInfo } from '@/lib/baby-age'
import SignOutButton from './SignOutButton'
import InvitePartnerForm from './InvitePartnerForm'
import RemovePartnerButton from './RemovePartnerButton'
import { ArrowLeftIcon, ChevronRightIcon, ShieldIcon, BellIcon } from '@/components/icons'

// Inline lock icon for Security row — matches Lumira's stroke-based icon style
function LockIcon({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 11V7a5 5 0 0110 0v4" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
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
      .select('id, name, due_date, date_of_birth, stage, pending_proactive_type, pending_proactive_set_at, created_by_profile_id, created_at, planning_sub_option, planning_expected_month')
      .eq('id', memberData.baby_id)
      .single()
    baby = babyData
  }

  const ageInfo = baby ? getBabyAgeInfo(baby) : null

  // Find connected partner (another member on the same baby profile)
  let connectedPartnerName: string | null = null
  let connectedPartnerProfileId: string | null = null
  if (baby) {
    const { data: otherMembers } = await supabase
      .from('baby_profile_members')
      .select('profile_id')
      .eq('baby_id', baby.id)
      .neq('profile_id', user.id)
      .limit(1)
      .maybeSingle()

    if (otherMembers?.profile_id) {
      connectedPartnerProfileId = otherMembers.profile_id
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
        minHeight: '100%',
        background: 'var(--color-surface)',
        paddingBottom: '32px',
      }}
    >
      <div className="content-width mx-auto px-4 pt-6">
        <Link
          href="/home"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            color: '#3D8178',
            fontSize: '14px',
            fontWeight: 600,
            textDecoration: 'none',
            padding: '16px 0',
          }}
        >
          <ArrowLeftIcon size={16} color="#3D8178" /> Back
        </Link>
        <h1 className="text-h1 mb-6" style={{ color: 'var(--color-slate)' }}>
          My Settings
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
                {baby && connectedPartnerProfileId && (
                  <RemovePartnerButton babyId={baby.id} partnerProfileId={connectedPartnerProfileId} />
                )}
              </div>
            </div>
          ) : pendingInvite ? (
            <div>
              <p style={{ fontSize: '14px', color: 'var(--color-muted)', marginBottom: '4px' }}>
                Invite sent to <span style={{ fontWeight: 600 }}>{pendingInvite.invited_email}</span>
              </p>
              <p style={{ fontSize: '13px', color: 'var(--color-muted)' }}>Waiting for them to accept</p>
            </div>
          ) : baby ? (
            <InvitePartnerForm babyId={baby.id} />
          ) : (
            <p style={{ fontSize: '14px', color: 'var(--color-muted)', lineHeight: 1.5 }}>
              Complete onboarding to invite your partner.
            </p>
          )}
        </div>

        {/* Security */}
        <div className="lumira-card mb-4">
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
            Security
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Link
              href="/settings/security"
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
                gap: '12px',
              }}
            >
              <LockIcon size={20} color="var(--color-muted)" />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: '15px', marginBottom: '2px' }}>Sign-in &amp; Security</p>
                <p style={{ fontSize: '13px', color: 'var(--color-muted)' }}>Passkeys, biometrics, sign-in methods</p>
              </div>
              <ChevronRightIcon size={18} color="var(--color-muted)" />
            </Link>
          </div>
        </div>

        {/* Settings navigation */}
        <div className="lumira-card mb-4">
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
            Preferences
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Link
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
                gap: '12px',
              }}
            >
              <ShieldIcon size={20} color="var(--color-muted)" />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: '15px', marginBottom: '2px' }}>Privacy &amp; Data</p>
                <p style={{ fontSize: '13px', color: 'var(--color-muted)' }}>AI processing, data retention, exports</p>
              </div>
              <ChevronRightIcon size={18} color="var(--color-muted)" />
            </Link>
            <div style={{ height: '1px', background: 'var(--color-border)', margin: '0 4px' }} />
            <Link
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
                gap: '12px',
              }}
            >
              <BellIcon size={20} color="var(--color-muted)" />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: '15px', marginBottom: '2px' }}>Notifications</p>
                <p style={{ fontSize: '13px', color: 'var(--color-muted)' }}>Check-in time, email, quiet hours</p>
              </div>
              <ChevronRightIcon size={18} color="var(--color-muted)" />
            </Link>
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
            <Link
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
              <ChevronRightIcon size={18} color="var(--color-muted)" />
            </Link>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '12px' }}>
            Version 0.1.0
          </p>
        </div>

        {/* Sign out */}
        <SignOutButton />

        {/* Delete account */}
        <div style={{ textAlign: 'center', marginTop: '16px', paddingBottom: '16px' }}>
          <Link
            href="/settings/privacy"
            style={{
              fontSize: '14px',
              color: 'var(--color-red)',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            Delete my account
          </Link>
        </div>
      </div>
    </div>
  )
}

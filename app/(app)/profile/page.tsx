// app/(app)/profile/page.tsx — Profile
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getBabyAgeInfo } from '@/lib/baby-age'
import SignOutButton from './SignOutButton'
import type { Profile, BabyProfile } from '@/types/app'

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  // Fetch profile, baby membership, and partner count in parallel
  const [{ data: profileData }, { data: memberData }, { count: partnerCount }] =
    await Promise.all([
      supabase
        .from('profiles')
        .select('id, first_name, first_time_parent, partner_invite_email, created_at')
        .eq('id', user.id)
        .single(),
      supabase
        .from('baby_profile_members')
        .select('baby_id')
        .eq('profile_id', user.id)
        .limit(1)
        .maybeSingle(),
      supabase
        .from('baby_profile_members')
        .select('*', { count: 'exact', head: true })
        .neq('profile_id', user.id),
    ])

  if (!profileData) redirect('/onboarding')

  const profile = profileData as Profile

  let baby: BabyProfile | null = null
  if (memberData?.baby_id) {
    const { data: babyData } = await supabase
      .from('baby_profiles')
      .select(
        'id, name, due_date, date_of_birth, stage, pending_proactive_type, pending_proactive_set_at, created_by_profile_id, created_at'
      )
      .eq('id', memberData.baby_id)
      .single()
    baby = babyData
  }

  const ageInfo = baby ? getBabyAgeInfo(baby) : null
  const hasPartner = (partnerCount ?? 0) > 0

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--color-surface)',
        paddingBottom: '32px',
      }}
    >
      <div className="content-width mx-auto px-4 pt-6">
        {/* Page heading */}
        <h1 className="text-h1 mb-6" style={{ color: 'var(--color-slate)' }}>
          Profile
        </h1>

        {/* Avatar + name card */}
        <div
          className="lumira-card mb-4"
          style={{ display: 'flex', alignItems: 'center', gap: '16px' }}
        >
          {/* Avatar circle */}
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--color-primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: '22px',
                fontWeight: 700,
                color: 'var(--color-primary)',
              }}
            >
              {profile.first_name?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </div>
          <div>
            <p
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--color-slate)',
                marginBottom: '2px',
              }}
            >
              {profile.first_name}
            </p>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--color-muted)',
              }}
            >
              {user.email}
            </p>
          </div>
        </div>

        {/* Baby info card */}
        {baby && (
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
              {baby.name || 'Baby'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Stage badge */}
              <div>
                <p
                  style={{
                    fontSize: '13px',
                    color: 'var(--color-muted)',
                    marginBottom: '4px',
                  }}
                >
                  Stage
                </p>
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
                  <p
                    style={{
                      fontSize: '13px',
                      color: 'var(--color-muted)',
                      marginBottom: '2px',
                    }}
                  >
                    Due date
                  </p>
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
                  <p
                    style={{
                      fontSize: '13px',
                      color: 'var(--color-muted)',
                      marginBottom: '2px',
                    }}
                  >
                    Date of birth
                  </p>
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

        {/* Partner status */}
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
            Partner
          </p>
          {hasPartner ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '4px 12px',
                  borderRadius: '100px',
                  background: 'var(--color-green-light)',
                  color: 'var(--color-green)',
                  fontWeight: 600,
                  fontSize: '13px',
                }}
              >
                Connected
              </span>
            </div>
          ) : profile.partner_invite_email ? (
            <div>
              <p style={{ fontSize: '14px', color: 'var(--color-muted)', lineHeight: 1.5 }}>
                Invite sent to{' '}
                <span style={{ fontWeight: 600, color: 'var(--color-slate)' }}>
                  {profile.partner_invite_email}
                </span>
              </p>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '4px 12px',
                  borderRadius: '100px',
                  background: 'var(--color-amber-light)',
                  color: 'var(--color-amber)',
                  fontWeight: 600,
                  fontSize: '13px',
                  marginTop: '8px',
                }}
              >
                Pending
              </span>
            </div>
          ) : (
            <p style={{ fontSize: '14px', color: 'var(--color-muted)', lineHeight: 1.5 }}>
              No partner connected yet. You can invite them from Settings.
            </p>
          )}
        </div>

        {/* Quick links */}
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
            Quick links
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Link
              href="/settings"
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
                <p style={{ fontWeight: 600, fontSize: '15px', marginBottom: '2px' }}>
                  Settings
                </p>
                <p style={{ fontSize: '13px', color: 'var(--color-muted)' }}>
                  Account preferences, notifications
                </p>
              </div>
              <span style={{ color: 'var(--color-muted)', fontSize: '18px' }}>
                &rsaquo;
              </span>
            </Link>
            <div
              style={{
                height: '1px',
                background: 'var(--color-border)',
                margin: '0 4px',
              }}
            />
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
              }}
            >
              <div>
                <p style={{ fontWeight: 600, fontSize: '15px', marginBottom: '2px' }}>
                  Privacy &amp; Data
                </p>
                <p style={{ fontSize: '13px', color: 'var(--color-muted)' }}>
                  AI processing, data retention, exports
                </p>
              </div>
              <span style={{ color: 'var(--color-muted)', fontSize: '18px' }}>
                &rsaquo;
              </span>
            </Link>
          </div>
        </div>

        {/* Sign out */}
        <SignOutButton />

        {/* Member since */}
        <p
          style={{
            textAlign: 'center',
            fontSize: '12px',
            color: 'var(--color-muted)',
            marginTop: '24px',
          }}
        >
          Member since{' '}
          {new Date(profile.created_at).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>
    </div>
  )
}

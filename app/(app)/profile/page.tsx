// app/(app)/profile/page.tsx — Enhanced Profile with gamification
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getBabyAgeInfo } from '@/lib/baby-age'
import { BADGES } from '@/lib/badges'
import SignOutButton from './SignOutButton'
import DeleteAccountLink from './DeleteAccountLink'
import ProfileCompletionArc from './ProfileCompletionArc'
import BadgesGrid from './BadgesGrid'
import type { Profile, BabyProfile } from '@/types/app'

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch profile, baby membership, partner count, and checkin count in parallel
  const [{ data: profileData }, { data: memberData }, { count: partnerCount }, { count: checkinCount }] =
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
      supabase
        .from('daily_checkins')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', user.id),
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
  const hasCheckin = (checkinCount ?? 0) > 0

  // Profile completeness calculation
  const completionFactors = {
    hasName: !!profile.first_name,
    hasBaby: !!baby,
    hasCheckin,
    hasNotifications: false, // placeholder — no notification prefs check yet
    hasPrivacy: false, // placeholder — no privacy prefs check yet
  }
  const completionPct =
    (completionFactors.hasName ? 20 : 0) +
    (completionFactors.hasBaby ? 20 : 0) +
    (completionFactors.hasCheckin ? 20 : 0) +
    (completionFactors.hasNotifications ? 20 : 0) +
    (completionFactors.hasPrivacy ? 20 : 0)

  // Placeholder points (no badge tracking in DB yet)
  const totalPoints = 0

  // First 6 badges as unearned for display
  const displayBadges = BADGES.slice(0, 6)

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
          {/* Large emoji avatar circle */}
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary-mid))',
              border: '2.5px solid var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: '32px' }}>🌿</span>
          </div>
          <div>
            <p
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: 'var(--color-slate)',
                marginBottom: '4px',
              }}
            >
              {profile.first_name}
            </p>
            {profile.first_time_parent && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '3px 10px',
                  borderRadius: '100px',
                  background: 'var(--color-accent-light)',
                  color: 'var(--color-accent)',
                  fontWeight: 600,
                  fontSize: '12px',
                  marginBottom: '4px',
                }}
              >
                First-time parent
              </span>
            )}
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

        {/* Points display */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px',
            marginBottom: '16px',
          }}
        >
          <span
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--color-accent)',
            }}
          >
            ✨ {totalPoints} points
          </span>
        </div>

        {/* Completion arc */}
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
          <ProfileCompletionArc percentage={completionPct} />
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              marginTop: '16px',
            }}
          >
            {[
              { label: 'Name', done: completionFactors.hasName },
              { label: 'Baby', done: completionFactors.hasBaby },
              { label: 'Check-in', done: completionFactors.hasCheckin },
              { label: 'Notifications', done: completionFactors.hasNotifications },
              { label: 'Privacy', done: completionFactors.hasPrivacy },
            ].map((item) => (
              <span
                key={item.label}
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
            ))}
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

        {/* Badges section */}
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
            Your Badges
          </p>
          <BadgesGrid badges={displayBadges} earnedIds={[]} />
        </div>

        {/* About You section */}
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
            About You
          </p>
          <p
            style={{
              fontSize: '14px',
              color: 'var(--color-muted)',
              lineHeight: 1.6,
            }}
          >
            As you use Lumira, we&apos;ll learn more about your preferences and parenting style. This section will grow with you.
          </p>
        </div>

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
            <Link
              href="/settings"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '48px',
                padding: '0 20px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'opacity 0.15s ease',
              }}
            >
              Invite your partner
            </Link>
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
            {[
              { href: '/settings', title: 'Settings', subtitle: 'Account preferences, notifications' },
              { href: '/settings/privacy', title: 'Privacy & Data', subtitle: 'AI processing, data retention, exports' },
              { href: '/share', title: 'Share Lumira', subtitle: 'Invite friends and family' },
            ].map((link, i, arr) => (
              <div key={link.href}>
                <Link
                  href={link.href}
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
                      {link.title}
                    </p>
                    <p style={{ fontSize: '13px', color: 'var(--color-muted)' }}>
                      {link.subtitle}
                    </p>
                  </div>
                  <span style={{ color: 'var(--color-muted)', fontSize: '18px' }}>
                    &rsaquo;
                  </span>
                </Link>
                {i < arr.length - 1 && (
                  <div
                    style={{
                      height: '1px',
                      background: 'var(--color-border)',
                      margin: '0 4px',
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sign out */}
        <SignOutButton />

        {/* Delete account */}
        <DeleteAccountLink />

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

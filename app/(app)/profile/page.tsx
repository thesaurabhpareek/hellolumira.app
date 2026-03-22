// app/(app)/profile/page.tsx — Enhanced Profile with gamification, seeds, badges, and inline completion
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getBabyAgeInfo } from '@/lib/baby-age'
import { BADGES } from '@/lib/badges'
import SignOutButton from './SignOutButton'
import DeleteAccountLink from './DeleteAccountLink'
import ProfileCompletionSection from './ProfileCompletionSection'
import ProfileCompletionCard from './ProfileCompletionCard'
import BadgesGrid from './BadgesGrid'
import AvatarPicker, { AvatarCircle } from './AvatarPicker'
import BadgeChecker from './BadgeChecker'
import { ArrowLeftIcon, SeedIcon, ChevronRightIcon, SettingsIcon, ShieldIcon, ShareIcon, EditIcon } from '@/components/icons'
import type { Profile, BabyProfile } from '@/types/app'

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch profile separately so we can handle errors gracefully
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('id, first_name, first_time_parent, partner_invite_email, avatar_emoji, seeds_balance, current_streak, created_at, display_name, pronouns, location_city, bio, birth_month, parenting_style, feeding_method, birth_type, number_of_children, languages_spoken, work_status, interests, looking_for, profile_completion_seeds_awarded')
    .eq('id', user.id)
    .single()

  // Only redirect to onboarding if profile genuinely doesn't exist
  if (!profileData) {
    if (profileError?.code === 'PGRST116') {
      // No rows found — user hasn't onboarded
      redirect('/onboarding')
    }
    // For other errors, log and show a fallback
    console.error('[ProfilePage] Profile fetch error:', profileError?.message)
    redirect('/onboarding')
  }

  // Fetch baby membership first (needed for partner count query)
  const { data: memberData } = await supabase
    .from('baby_profile_members')
    .select('baby_id')
    .eq('profile_id', user.id)
    .limit(1)
    .maybeSingle()

  // Fetch remaining data in parallel (non-critical — failures won't block the page)
  const [
    { count: partnerCount },
    { count: checkinCount },
    { data: earnedBadgeRows },
  ] = await Promise.all([
    memberData?.baby_id
      ? supabase
          .from('baby_profile_members')
          .select('*', { count: 'exact', head: true })
          .eq('baby_id', memberData.baby_id)
          .neq('profile_id', user.id)
      : Promise.resolve({ count: 0 } as { count: number }),
    supabase
      .from('daily_checkins')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', user.id),
    supabase
      .from('earned_badges')
      .select('badge_id, awarded_at')
      .eq('profile_id', user.id)
      .order('awarded_at', { ascending: false }),
  ])

  const profile = profileData as unknown as Profile

  let baby: BabyProfile | null = null
  if (memberData?.baby_id) {
    const { data: babyData } = await supabase
      .from('baby_profiles')
      .select(
        'id, name, due_date, date_of_birth, stage, planning_sub_option, planning_expected_month, pending_proactive_type, pending_proactive_set_at, created_by_profile_id, created_at'
      )
      .eq('id', memberData.baby_id)
      .single()
    baby = babyData
  }

  const ageInfo = baby ? getBabyAgeInfo(baby) : null
  const hasPartner = (partnerCount ?? 0) > 0
  const hasCheckin = (checkinCount ?? 0) > 0
  const seedsBalance = profile.seeds_balance ?? 0
  const currentStreak = profile.current_streak ?? 0
  const avatarEmoji = profile.avatar_emoji || '🌿'

  // Earned badge IDs
  const earnedIds = (earnedBadgeRows ?? []).map((b: { badge_id: string }) => b.badge_id)

  // Profile completeness — only actionable items the user can control
  const completionItems = [
    {
      key: 'first_name',
      label: 'Name',
      warmLabel: 'Add your name',
      done: !!profile.first_name,
      actionType: 'text' as const,
      placeholder: 'Your first name',
    },
    {
      key: 'name',
      label: 'Baby name',
      warmLabel: "What's baby's name?",
      done: !!baby?.name,
      actionType: 'text' as const,
      placeholder: "Baby's name (or a nickname)",
    },
    {
      key: 'due_date',
      label: 'Due date',
      warmLabel: 'When are you due?',
      done: !!baby?.due_date || !!baby?.date_of_birth,
      actionType: 'date' as const,
      placeholder: 'YYYY-MM-DD',
    },
    {
      key: 'hasCheckin',
      label: 'First check-in',
      warmLabel: "Let's go!",
      done: hasCheckin,
      actionType: 'link' as const,
      href: '/checkin',
    },
  ]

  const completionPct = Math.round(
    (completionItems.filter((i) => i.done).length / completionItems.length) * 100
  )

  return (
    <div
      style={{
        minHeight: '100%',
        background: 'var(--color-surface)',
        paddingBottom: '32px',
      }}
    >
      <BadgeChecker />
      <div className="content-width mx-auto px-4 pt-6">
        {/* Back button */}
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

        {/* Page heading + Edit button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h1 className="text-h1" style={{ color: 'var(--color-slate)', margin: 0 }}>
            Me
          </h1>
          <Link
            href="/profile/edit"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-primary-light)',
              color: '#3D8178',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'opacity 0.15s ease',
            }}
          >
            <EditIcon size={16} color="#3D8178" />
            Edit Profile
          </Link>
        </div>

        {/* Avatar + name card with Seeds pill */}
        <div
          className="lumira-card mb-4"
          style={{ display: 'flex', alignItems: 'center', gap: '16px' }}
        >
          {/* Avatar circle */}
          <AvatarCircle avatarId={avatarEmoji} size={72} />
          <div style={{ flex: 1 }}>
            <p
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: 'var(--color-slate)',
                marginBottom: '2px',
              }}
            >
              {profile.display_name || profile.first_name}
            </p>
            {profile.pronouns && (
              <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: '4px' }}>
                {profile.pronouns}
              </p>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '4px' }}>
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
                  }}
                >
                  First-time parent
                </span>
              )}
              {profile.location_city && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '3px 10px',
                    borderRadius: '100px',
                    background: 'var(--color-primary-light)',
                    color: 'var(--color-primary)',
                    fontWeight: 600,
                    fontSize: '12px',
                  }}
                >
                  {profile.location_city}
                </span>
              )}
            </div>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--color-muted)',
              }}
            >
              {user.email}
            </p>
          </div>

          {/* Seeds balance pill */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '8px 14px',
              borderRadius: '14px',
              background: 'var(--color-accent-light)',
              flexShrink: 0,
            }}
          >
            <SeedIcon size={20} color="var(--color-accent)" />
            <span
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: 'var(--color-accent)',
              }}
            >
              {seedsBalance}
            </span>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 600,
                color: 'var(--color-accent)',
                opacity: 0.8,
              }}
            >
              Seeds
            </span>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div
            className="lumira-card mb-4"
            style={{ padding: '16px' }}
          >
            <p
              style={{
                fontSize: '14px',
                color: 'var(--color-slate)',
                lineHeight: 1.6,
              }}
            >
              {profile.bio}
            </p>
          </div>
        )}

        {/* Stats row */}
        <div
          style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: '14px',
              background: 'var(--color-primary-light)',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-primary)' }}>
              {currentStreak}
            </p>
            <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-primary)', opacity: 0.8 }}>
              Day streak
            </p>
          </div>
          <div
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: '14px',
              background: 'var(--color-accent-light)',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-accent)' }}>
              {earnedIds.length}
            </p>
            <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-accent)', opacity: 0.8 }}>
              Badges earned
            </p>
          </div>
          <div
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: '14px',
              background: '#FEF3F2',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: '22px', fontWeight: 700, color: '#B91C1C' }}>
              {checkinCount ?? 0}
            </p>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#B91C1C', opacity: 0.8 }}>
              Check-ins
            </p>
          </div>
        </div>

        {/* Avatar picker */}
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
            Choose Your Avatar
          </p>
          <AvatarPicker
            profileId={profile.id}
            currentAvatar={avatarEmoji}
          />
        </div>

        {/* Profile completion gamification card */}
        <ProfileCompletionCard profile={profile as unknown as Record<string, unknown>} />

        {/* Interactive profile completeness with inline actions */}
        <ProfileCompletionSection
          items={completionItems}
          initialPercentage={completionPct}
          babyId={baby?.id}
        />

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
              {baby.stage === 'planning' ? 'Your Journey' : (baby.name || 'Baby')}
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

              {/* Planning-specific info */}
              {baby.stage === 'planning' && baby.planning_sub_option && (
                <div>
                  <p
                    style={{
                      fontSize: '13px',
                      color: 'var(--color-muted)',
                      marginBottom: '2px',
                    }}
                  >
                    Path
                  </p>
                  <p style={{ fontWeight: 600, color: 'var(--color-slate)' }}>
                    {{
                      trying_naturally: 'Trying to conceive naturally',
                      ivf_fertility: 'IVF / fertility treatment',
                      adopting: 'Adoption',
                      surrogacy: 'Surrogacy',
                      exploring: 'Exploring options',
                    }[baby.planning_sub_option] || baby.planning_sub_option}
                  </p>
                </div>
              )}

              {baby.stage === 'planning' && baby.planning_expected_month && (
                <div>
                  <p
                    style={{
                      fontSize: '13px',
                      color: 'var(--color-muted)',
                      marginBottom: '2px',
                    }}
                  >
                    Hoping to welcome baby
                  </p>
                  <p style={{ fontWeight: 600, color: 'var(--color-slate)' }}>
                    {(() => {
                      const [y, m] = baby.planning_expected_month.split('-').map(Number)
                      return new Date(y, m - 1).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric',
                      })
                    })()}
                  </p>
                </div>
              )}

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

        {/* Badges section — categorized with earned state */}
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
            Your Badges ({earnedIds.length}/{BADGES.length})
          </p>
          <BadgesGrid badges={BADGES} earnedIds={earnedIds} />
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
            {([
              { href: '/settings', title: 'My Settings', subtitle: 'Account preferences, notifications', icon: <SettingsIcon size={20} color="var(--color-muted)" /> },
              { href: '/settings/privacy', title: 'Privacy & Data', subtitle: 'AI processing, data retention, exports', icon: <ShieldIcon size={20} color="var(--color-muted)" /> },
              { href: '/share', title: 'Share the Love', subtitle: 'Invite friends and family', icon: <ShareIcon size={20} color="var(--color-muted)" /> },
            ] as const).map((link, i, arr) => (
              <div key={link.href}>
                <Link
                  href={link.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 4px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: 'var(--color-slate)',
                    transition: 'background 0.15s ease',
                    minHeight: '48px',
                  }}
                >
                  {link.icon}
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: '15px', marginBottom: '2px' }}>
                      {link.title}
                    </p>
                    <p style={{ fontSize: '13px', color: 'var(--color-muted)' }}>
                      {link.subtitle}
                    </p>
                  </div>
                  <ChevronRightIcon size={18} color="var(--color-muted)" />
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

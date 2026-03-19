// app/invite/[token]/page.tsx — Partner invite
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PartnerInviteClient from './PartnerInviteClient'

interface Props {
  params: Promise<{ token: string }>
}

export default async function InvitePage({ params }: Props) {
  const { token } = await params
  const supabase = await createClient()

  // Validate the invite token
  const { data: invite, error } = await supabase
    .from('partner_invites')
    .select('*, baby_profiles(*)')
    .eq('token', token)
    .eq('used', false)
    .maybeSingle()

  if (error || !invite) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          background: 'var(--color-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        <div className="lumira-card content-width" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '40px', marginBottom: '16px' }}>🔗</p>
          <h2 className="text-h2 mb-2" style={{ color: 'var(--color-slate)' }}>
            Invalid invite link
          </h2>
          <p style={{ color: 'var(--color-muted)', marginBottom: '24px' }}>
            This invite link is invalid, expired, or has already been used.
          </p>
          <a href="/auth" className="btn-primary">
            Sign in to Lumira
          </a>
        </div>
      </div>
    )
  }

  // Check if expired (7 days)
  const createdAt = new Date(invite.created_at)
  const expiresAt = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000)
  if (new Date() > expiresAt) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          background: 'var(--color-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        <div className="lumira-card content-width" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '40px', marginBottom: '16px' }}>⏰</p>
          <h2 className="text-h2 mb-2" style={{ color: 'var(--color-slate)' }}>
            Invite expired
          </h2>
          <p style={{ color: 'var(--color-muted)', marginBottom: '24px' }}>
            Ask your partner to send a new invite.
          </p>
        </div>
      </div>
    )
  }

  const baby = invite.baby_profiles as { name: string | null } | null
  const babyName = baby?.name || 'your baby'

  // Check if already logged in
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    // Already logged in — link them to this baby
    try {
      // Check if already a member
      const { data: existing } = await supabase
        .from('baby_profile_members')
        .select('id')
        .eq('baby_id', invite.baby_id)
        .eq('profile_id', user.id)
        .maybeSingle()

      if (!existing) {
        await supabase.from('baby_profile_members').insert({
          baby_id: invite.baby_id,
          profile_id: user.id,
        })
        // Mark invite as used
        await supabase
          .from('partner_invites')
          .update({ used: true, used_at: new Date().toISOString(), used_by_profile_id: user.id })
          .eq('token', token)
      }
    } catch {
      // Non-critical
    }
    redirect('/home')
  }

  return (
    <PartnerInviteClient
      babyName={babyName}
      token={token}
      babyId={invite.baby_id}
    />
  )
}

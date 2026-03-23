// app/api/auth/passkey/[factorId]/route.ts
// Deletes (revokes) a specific passkey owned by the authenticated user.

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { sendPasskeyRemovedAlertEmail } from '@/lib/passkey-email'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ factorId: string }> },
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { factorId } = await params
    const service = await createServiceClient()

    // Verify ownership — critical IDOR prevention
    const { data: passkey } = await service
      .from('passkeys')
      .select('id, device_hint, user_id')
      .eq('id', factorId)
      .single()

    if (!passkey || (passkey.user_id as string) !== user.id) {
      return NextResponse.json({ error: 'Passkey not found.' }, { status: 403 })
    }

    // Rate limit: max 2 revocations per 24 hours
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const revocationResult = await Promise.resolve(
      service
        .from('passkey_revocations_log')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', since),
    ).catch(() => ({ count: 0 as number | null }))
    const recentDeletions = revocationResult.count

    if ((recentDeletions ?? 0) >= 2) {
      return NextResponse.json(
        {
          error:
            'Too many passkeys removed recently. Please wait 24 hours or contact support.',
        },
        { status: 429 },
      )
    }

    // Delete the passkey
    await service.from('passkeys').delete().eq('id', passkey.id)

    // Audit log — best-effort (table may not be available in all envs)
    await Promise.resolve(
      service.from('passkey_revocations_log').insert({
        user_id: user.id,
        device_hint: passkey.device_hint,
      }),
    ).catch(() => {})

    // Fetch profile for email personalisation
    const { data: profile } = await service
      .from('profiles')
      .select('first_name')
      .eq('id', user.id)
      .single()

    // Fire-and-forget removal alert
    sendPasskeyRemovedAlertEmail({
      email: user.email!,
      firstName: (profile?.first_name as string | null) ?? 'there',
      deviceHint: passkey.device_hint as string,
    }).catch(() => {})

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[passkey/factorId DELETE]', err)
    return NextResponse.json({ error: 'Failed to remove passkey.' }, { status: 500 })
  }
}

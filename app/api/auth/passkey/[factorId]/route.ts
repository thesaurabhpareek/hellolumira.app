import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { sendPasskeyRemovedAlertEmail } from '@/lib/passkey-email'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ factorId: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 })

    const { factorId } = await params
    const service = await createServiceClient()

    const { data: passkey } = await service
      .from('passkeys')
      .select('id, device_hint, user_id')
      .eq('id', factorId)
      .single()

    if (!passkey || passkey.user_id !== user.id)
      return NextResponse.json({ error: 'Passkey not found.' }, { status: 403 })

    // Rate limit: 2 revocations per 24h
    const since = new Date(Date.now() - 86400000).toISOString()
    const { count: recent } = await service
      .from('passkey_revocations_log')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', since)

    if ((recent ?? 0) >= 2) {
      return NextResponse.json(
        {
          error:
            'Too many passkeys removed recently. Wait 24 hours or contact support.',
        },
        { status: 429 }
      )
    }

    await service.from('passkeys').delete().eq('id', passkey.id)
    void service
      .from('passkey_revocations_log')
      .insert({ user_id: user.id, device_hint: passkey.device_hint })

    const { data: profile } = await service
      .from('profiles')
      .select('first_name')
      .eq('id', user.id)
      .single()

    const now = new Date().toISOString()
    sendPasskeyRemovedAlertEmail({
      email: user.email!,
      firstName: profile?.first_name ?? 'there',
      deviceHint: passkey.device_hint,
      removedAt: now,
    }).catch(() => {})

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[passkey/factorId DELETE]', err)
    return NextResponse.json({ error: 'Failed to remove passkey.' }, { status: 500 })
  }
}

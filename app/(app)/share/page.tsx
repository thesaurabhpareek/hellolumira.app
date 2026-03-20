// app/(app)/share/page.tsx — Personalized share page with unique link and tracking
import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import SharePageClient from './SharePageClient'

function generateShareToken(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let token = ''
  for (let i = 0; i < 8; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

export default async function SharePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch profile with share_token
  const { data: profileData } = await supabase
    .from('profiles')
    .select('id, first_name, share_token')
    .eq('id', user.id)
    .single()

  if (!profileData) redirect('/onboarding')

  let shareToken = (profileData as Record<string, unknown>).share_token as string | null

  // Generate share token if not yet assigned
  if (!shareToken) {
    shareToken = generateShareToken()
    const serviceClient = await createServiceClient()

    // Try to save; if there's a collision on the unique constraint, regenerate
    let attempts = 0
    let saved = false
    while (!saved && attempts < 3) {
      const { error } = await serviceClient
        .from('profiles')
        .update({ share_token: shareToken })
        .eq('id', user.id)

      if (!error) {
        saved = true
      } else {
        shareToken = generateShareToken()
        attempts++
      }
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hellolumira.app'
  const personalizedLink = `${siteUrl}/invite/${shareToken}`

  // Get share click count
  let shareCount = 0
  if (shareToken) {
    const { count } = await supabase
      .from('share_tracking')
      .select('*', { count: 'exact', head: true })
      .eq('share_token', shareToken)

    shareCount = count ?? 0
  }

  return (
    <SharePageClient
      personalizedLink={personalizedLink}
      shareToken={shareToken || ''}
      shareCount={shareCount}
      firstName={profileData.first_name}
    />
  )
}

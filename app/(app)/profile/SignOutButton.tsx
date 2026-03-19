// app/(app)/profile/SignOutButton.tsx
'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignOutButton() {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <button
      onClick={handleSignOut}
      style={{
        width: '100%',
        height: '52px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-md)',
        border: '1.5px solid #FEB2B2',
        background: 'var(--color-red-light)',
        color: 'var(--color-red)',
        fontSize: '15px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'opacity 0.15s ease',
      }}
    >
      Sign out
    </button>
  )
}

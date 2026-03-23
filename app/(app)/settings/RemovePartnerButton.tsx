/**
 * @module RemovePartnerButton
 * @description Client component for removing a connected partner from the baby profile.
 * @version 1.0.0
 * @since March 2026
 */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  babyId: string
  partnerProfileId: string
}

export default function RemovePartnerButton({ babyId, partnerProfileId }: Props) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [removeError, setRemoveError] = useState('')

  const handleRemove = async () => {
    if (!confirming) {
      setConfirming(true)
      return
    }

    setRemoving(true)
    setRemoveError('')
    try {
      const res = await fetch('/api/partner/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baby_id: babyId, partner_profile_id: partnerProfileId }),
      })
      if (res.ok) {
        router.refresh()
      } else {
        setRemoveError("We couldn't remove partner access right now. Please try again.")
        setConfirming(false)
      }
    } catch {
      setRemoveError("We couldn't remove partner access right now. Please try again.")
      setConfirming(false)
    } finally {
      setRemoving(false)
    }
  }

  if (confirming) {
    return (
      <div>
        {removeError && (
          <p style={{ fontSize: '13px', color: 'var(--color-red)', marginBottom: '8px' }}>
            {removeError}
          </p>
        )}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handleRemove}
          disabled={removing}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid #FEB2B2',
            background: '#C53030',
            color: '#fff',
            fontSize: '13px',
            fontWeight: 600,
            cursor: removing ? 'not-allowed' : 'pointer',
            minHeight: '48px',
            opacity: removing ? 0.6 : 1,
          }}
        >
          {removing ? 'Removing...' : 'Confirm remove'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={removing}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--color-border)',
            background: 'var(--color-white)',
            color: 'var(--color-slate)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            minHeight: '48px',
          }}
        >
          Cancel
        </button>
      </div>
      </div>
    )
  }

  return (
    <button
      onClick={handleRemove}
      style={{
        padding: '8px 16px',
        borderRadius: 'var(--radius-md)',
        border: '1.5px solid #FEB2B2',
        background: 'var(--color-red-light)',
        color: 'var(--color-red)',
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
        minHeight: '48px',
      }}
    >
      Remove
    </button>
  )
}

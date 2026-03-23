'use client'

// DeleteEntryButton — client component for confirming + triggering entry deletion
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteEntryButton({ entryId }: { entryId: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    setDeleting(true)
    setError('')
    try {
      const res = await fetch(`/api/journal/${entryId}`, { method: 'DELETE' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.message ?? 'Failed to delete entry')
      }
      router.push('/journal')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setDeleting(false)
      setConfirming(false)
    }
  }

  if (confirming) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>
            Delete this entry?
          </span>
          <button
            onClick={() => setConfirming(false)}
            className="btn-ghost"
            disabled={deleting}
            style={{ fontSize: '13px', padding: '8px 12px', height: 'auto', minHeight: '40px' }}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              background: 'var(--color-red, #E53E3E)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              fontWeight: 600,
              padding: '8px 14px',
              minHeight: '40px',
              cursor: deleting ? 'not-allowed' : 'pointer',
              opacity: deleting ? 0.6 : 1,
            }}
          >
            {deleting ? 'Deleting…' : 'Yes, delete'}
          </button>
        </div>
        {error && (
          <p style={{ fontSize: '13px', color: 'var(--color-red, #E53E3E)', margin: 0 }}>
            {error}
          </p>
        )}
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      style={{
        background: 'none',
        border: '1.5px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        fontSize: '13px',
        fontWeight: 600,
        color: 'var(--color-red, #E53E3E)',
        padding: '8px 14px',
        minHeight: '40px',
        cursor: 'pointer',
      }}
    >
      Delete
    </button>
  )
}

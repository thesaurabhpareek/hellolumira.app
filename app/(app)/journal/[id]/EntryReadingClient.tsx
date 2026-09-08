'use client'

/**
 * @module EntryReadingClient
 * @description Client boundary for the single-entry reading view.
 *   EntryReadingView (lane FE6) is presentational-only and requires
 *   onEdit/onDelete handlers, which must live in a Client Component. This
 *   thin wrapper supplies them so app/(app)/journal/[id]/page.tsx can stay
 *   a server component (this repo's established pattern):
 *     - onEdit navigates to the entry's edit route.
 *     - onDelete implements "undo over confirm, never a confirm dialog"
 *       (docs/Lumira-Design-System-iOS.md §8.6) — a 10s undo window, then
 *       the same DELETE /api/journal/[id] route DeleteEntryButton uses.
 *   onOpenSource is intentionally omitted — per EntryReadingView's own
 *   contract, omitting it hides the affordance because there is no
 *   source-entries viewing surface yet.
 *
 *   Known limitation: the undo window is local to this component's mounted
 *   lifetime. Navigating away before the 10s elapses cancels the pending
 *   delete rather than committing it in the background — the safer failure
 *   mode without a global toast/undo system, which is out of this lane's
 *   scope. REQUEST: a shared toast/undo primitive would let this commit
 *   across navigation like the design spec's "toast" language implies.
 * @version 1.0.0
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import EntryReadingView from '@/components/app/letters/EntryReadingView'
import type { JournalEntryRow } from '@/types/letters'

const UNDO_WINDOW_MS = 10_000

interface Props {
  entry: JournalEntryRow
  babyName: string | null
  ageAtEntry: string | null
}

export default function EntryReadingClient({ entry, babyName, ageAtEntry }: Props) {
  const router = useRouter()
  const [pendingDelete, setPendingDelete] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const handleEdit = useCallback(
    (entryId: string) => {
      router.push(`/journal/${entryId}/edit`)
    },
    [router]
  )

  const handleDelete = useCallback(
    (entryId: string) => {
      setPendingDelete(true)
      timeoutRef.current = setTimeout(async () => {
        timeoutRef.current = null
        try {
          await fetch(`/api/journal/${entryId}`, { method: 'DELETE' })
        } finally {
          router.push('/journal')
          router.refresh()
        }
      }, UNDO_WINDOW_MS)
    },
    [router]
  )

  const cancelDelete = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = null
    setPendingDelete(false)
  }, [])

  if (pendingDelete) {
    return (
      <div
        className="lumira-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <p style={{ fontSize: '14px', color: 'var(--color-slate)', margin: 0 }}>
          Entry deleted.
        </p>
        <button
          type="button"
          onClick={cancelDelete}
          className="btn-ghost"
          style={{ fontSize: '13px', padding: '8px 14px', height: 'auto', minHeight: '40px' }}
        >
          Undo
        </button>
      </div>
    )
  }

  return (
    <EntryReadingView
      entry={entry}
      onEdit={handleEdit}
      onDelete={handleDelete}
      babyName={babyName}
      ageAtEntry={ageAtEntry}
    />
  )
}

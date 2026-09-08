'use client'

/**
 * @module JournalTimelineClient
 * @description Client boundary for the Journal tab's new-model timeline.
 *   EntryTimeline (lane FE7) is presentational-only and fully controlled;
 *   its data and state come from useEntryTimeline (lane FE10), which does
 *   its own client-side fetching against GET /api/letters/entries. Both are
 *   client modules, so this thin wrapper is what lets
 *   app/(app)/journal/page.tsx stay a server component (this repo's
 *   established pattern) while still rendering them. No business logic
 *   lives here — it wires the hook's state to the component's props and to
 *   navigation; the hook owns fetching, EntryTimeline owns presentation.
 * @version 1.0.0
 */
import { useCallback, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useEntryTimeline, type EntryKindFilter } from '@/hooks/useEntryTimeline'
import EntryTimeline, {
  type EntryTimelineView,
  type MilestoneFilterState,
} from '@/components/app/letters/EntryTimeline'
import LettersEmptyState from '@/components/app/letters/LettersEmptyState'
import type { LettersFlagContext } from '@/lib/letters/flags'

const VIEW_TO_KIND: Record<EntryTimelineView, EntryKindFilter> = {
  entries: 'log',
  letters: 'letter',
}

interface Props {
  flagCtx: LettersFlagContext
  /** Null when the parent has not named the baby yet; LettersEmptyState has its own copy fallback. */
  babyName: string | null
}

export default function JournalTimelineClient({ flagCtx, babyName }: Props) {
  const router = useRouter()
  const [view, setView] = useState<EntryTimelineView>('entries')
  const [milestonesActive, setMilestonesActive] = useState(false)

  const timeline = useEntryTimeline({
    initialKind: VIEW_TO_KIND.entries,
    flagContext: flagCtx,
  })

  const handleViewChange = useCallback(
    (next: EntryTimelineView) => {
      setView(next)
      timeline.setKind(VIEW_TO_KIND[next])
    },
    [timeline]
  )

  const handleJumpToMonth = useCallback(
    (year: number, month: number) => {
      timeline.setMonth(`${year}-${String(month).padStart(2, '0')}`)
    },
    [timeline]
  )

  const handleOpenEntry = useCallback(
    (entryId: string) => {
      router.push(`/journal/${entryId}`)
    },
    [router]
  )

  const handleStart = useCallback(() => {
    router.push('/journal/tonight')
  }, [router])

  // No milestone-detection join is wired up anywhere yet (per EntryTimeline's
  // own docs, that is computed upstream from a separate milestones join).
  // An honest empty set rather than a fabricated one — the filter bar itself
  // only renders once entryIds is non-empty, so this just keeps the control
  // hidden until that data source exists.
  const milestoneFilter: MilestoneFilterState = useMemo(
    () => ({
      entryIds: new Set<string>(),
      active: milestonesActive,
      onToggle: setMilestonesActive,
    }),
    [milestonesActive]
  )

  if (timeline.error && timeline.entries.length === 0) {
    return (
      <p
        style={{
          fontSize: '14px',
          color: 'var(--color-muted)',
          textAlign: 'center',
          padding: '48px 24px',
        }}
      >
        {timeline.error}
      </p>
    )
  }

  // "Night one": the default Entries view, unfiltered, has never had a log —
  // the real, unfiltered zero state (not just "no letters yet", which
  // EntryTimeline already renders inline for the Letters view).
  const isFirstRun =
    !timeline.loading &&
    view === 'entries' &&
    !timeline.month &&
    !timeline.search &&
    timeline.total === 0

  if (isFirstRun) {
    return <LettersEmptyState onStart={handleStart} babyName={babyName} />
  }

  return (
    <EntryTimeline
      entries={timeline.entries}
      view={view}
      onViewChange={handleViewChange}
      onJumpToMonth={handleJumpToMonth}
      milestoneFilter={milestoneFilter}
      onSearch={timeline.setSearch}
      onLoadMore={timeline.loadMore}
      isLoading={timeline.loading || timeline.loadingMore}
      onOpenEntry={handleOpenEntry}
    />
  )
}

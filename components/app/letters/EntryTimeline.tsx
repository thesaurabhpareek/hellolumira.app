/**
 * @module EntryTimeline
 * @description The Journal tab's core surface: hundreds of entries over years,
 *   reverse-chronological, grouped under sticky month/year headers (the iOS
 *   Photos pattern) with a segmented Entries | Letters view — per
 *   docs/LETTERS-MODEL-CHANGE.md, the log is the habit and the letter is the
 *   opt-in artifact composed from it, so they read as two views of one
 *   timeline rather than one merged feed.
 *
 *   Presentational only. This component never fetches, sorts authoritatively,
 *   or decides pagination — it renders whatever `entries` it is given, in the
 *   order given, and calls back up to the owning hook (FE10's
 *   `useLetterTimeline`) for search, pagination, and month jumps.
 *
 *   No streak. No target. No broken state. Per PRD §14.6, a consistency
 *   indicator on a baby's journal may only count accumulation and only ever
 *   go up — this component does not render one at all; it is not wired to
 *   the seeds/badges/levels system, and nothing here belongs on Home.
 * @version 1.0.0
 * @since March 2026
 */
'use client'

import * as React from 'react'
import type { JournalEntryRow } from '@/types/letters'
import SegmentedControl from '@/components/ui/SegmentedControl'
import EntryCard from './EntryCard'
import { MonthYearJumpSheet, type MonthYearOption } from './MonthYearJumpSheet'
import { SearchIcon, CloseIcon, ChevronRightIcon } from '@/components/icons'

export type EntryTimelineView = 'entries' | 'letters'

/** Milestone anchoring is computed upstream (a join against detected/flagged
 *  milestones) and handed down as plain data — this component never infers
 *  which entries are milestones itself. */
export interface MilestoneFilterState {
  /** IDs of entries flagged as containing a likely milestone. */
  entryIds: ReadonlySet<string>
  /** Whether "milestones only" is currently active. */
  active: boolean
  onToggle: (active: boolean) => void
}

export interface EntryTimelineProps {
  entries: JournalEntryRow[]
  view: EntryTimelineView
  onViewChange: (view: EntryTimelineView) => void
  onJumpToMonth: (year: number, month: number) => void
  milestoneFilter: MilestoneFilterState
  onSearch: (query: string) => void
  onLoadMore: () => void
  isLoading: boolean
  onOpenEntry: (entryId: string) => void
}

interface MonthGroup {
  year: number
  month: number
  label: string
  entries: JournalEntryRow[]
}

const MONTH_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const SEARCH_DEBOUNCE_MS = 300

function entryYearMonth(entry: JournalEntryRow): { year: number; month: number } {
  return { year: Number(entry.entry_date.slice(0, 4)), month: Number(entry.entry_date.slice(5, 7)) }
}

/** Groups an already-ordered list of entries into consecutive month runs.
 *  Does not reorder — the incoming order (owned by the hook) is authoritative. */
function groupByMonth(ordered: JournalEntryRow[]): MonthGroup[] {
  const groups: MonthGroup[] = []
  let current: MonthGroup | null = null
  for (const entry of ordered) {
    const { year, month } = entryYearMonth(entry)
    if (!current || current.year !== year || current.month !== month) {
      current = { year, month, label: `${MONTH_FULL[month - 1]} ${year}`, entries: [] }
      groups.push(current)
    }
    current.entries.push(entry)
  }
  return groups
}

function deriveMonthOptions(entries: JournalEntryRow[]): MonthYearOption[] {
  const byKey = new Map<string, MonthYearOption>()
  for (const entry of entries) {
    const { year, month } = entryYearMonth(entry)
    const key = `${year}-${month}`
    const existing = byKey.get(key)
    if (existing) existing.count = (existing.count ?? 0) + 1
    else byKey.set(key, { year, month, count: 1 })
  }
  return Array.from(byKey.values())
}

export function EntryTimeline({
  entries,
  view,
  onViewChange,
  onJumpToMonth,
  milestoneFilter,
  onSearch,
  onLoadMore,
  isLoading,
  onOpenEntry,
}: EntryTimelineProps) {
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const [activeQuery, setActiveQuery] = React.useState('')
  const [jumpSheetOpen, setJumpSheetOpen] = React.useState(false)
  const [milestoneCursor, setMilestoneCursor] = React.useState(0)
  const [announcement, setAnnouncement] = React.useState('')

  const searchDebounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const nodeRefs = React.useRef<Map<string, HTMLDivElement>>(new Map())
  const sentinelRef = React.useRef<HTMLDivElement | null>(null)
  const wasLoadingRef = React.useRef(false)
  const lengthBeforeLoadRef = React.useRef(entries.length)
  const [exhausted, setExhausted] = React.useState(false)

  const isSearching = searchOpen && activeQuery.trim().length > 0

  // Entry kind is the source of truth for which view an entry belongs to —
  // defensive even if the hook already scopes `entries` to the active view.
  const viewEntries = React.useMemo(
    () => entries.filter((entry) => entry.entry_kind === (view === 'entries' ? 'log' : 'letter')),
    [entries, view],
  )

  const filteredEntries = React.useMemo(() => {
    if (isSearching) return entries
    if (milestoneFilter.active) {
      return viewEntries.filter((entry) => milestoneFilter.entryIds.has(entry.id))
    }
    return viewEntries
  }, [isSearching, entries, viewEntries, milestoneFilter.active, milestoneFilter.entryIds])

  const monthGroups = React.useMemo(
    () => (isSearching ? [] : groupByMonth(filteredEntries)),
    [isSearching, filteredEntries],
  )

  const monthOptions = React.useMemo(() => deriveMonthOptions(viewEntries), [viewEntries])

  const milestoneIdsInView = React.useMemo(
    () => viewEntries.filter((entry) => milestoneFilter.entryIds.has(entry.id)).map((entry) => entry.id),
    [viewEntries, milestoneFilter.entryIds],
  )

  const currentMonthLabel =
    monthGroups.length > 0 ? monthGroups[0].label : null
  const currentGroup = monthGroups[0] ?? null

  // ── Announce result-set changes for screen reader users ──────────────────
  React.useEffect(() => {
    if (isSearching) {
      setAnnouncement(
        filteredEntries.length === 0
          ? `No results for "${activeQuery.trim()}".`
          : `${filteredEntries.length} ${filteredEntries.length === 1 ? 'result' : 'results'} for "${activeQuery.trim()}".`,
      )
      return
    }
    const noun = view === 'entries' ? 'entries' : 'letters'
    if (milestoneFilter.active) {
      setAnnouncement(`Showing ${filteredEntries.length} milestone ${filteredEntries.length === 1 ? noun.slice(0, -1) : noun}.`)
    } else {
      setAnnouncement(`Showing ${filteredEntries.length} ${noun}.`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSearching, view, milestoneFilter.active, filteredEntries.length])

  // ── Search: debounced, owner (the hook) does the real full-text query ────
  const handleQueryChange = React.useCallback(
    (value: string) => {
      setQuery(value)
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
      searchDebounceRef.current = setTimeout(() => {
        const trimmed = value.trim()
        setActiveQuery(trimmed)
        onSearch(trimmed)
      }, SEARCH_DEBOUNCE_MS)
    },
    [onSearch],
  )

  const closeSearch = React.useCallback(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    setSearchOpen(false)
    setQuery('')
    setActiveQuery('')
    onSearch('')
  }, [onSearch])

  React.useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    }
  }, [])

  // ── Infinite scroll ────────────────────────────────────────────────────
  // No `hasMore` is passed down; end-of-list is inferred: once a load
  // completes without growing `entries`, stop observing until the view,
  // search, or milestone filter changes (each of which implies a fresh
  // page from the hook).
  React.useEffect(() => {
    setExhausted(false)
    lengthBeforeLoadRef.current = entries.length
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, activeQuery, milestoneFilter.active])

  React.useEffect(() => {
    if (wasLoadingRef.current && !isLoading && entries.length === lengthBeforeLoadRef.current) {
      setExhausted(true)
    }
    wasLoadingRef.current = isLoading
    if (!isLoading) lengthBeforeLoadRef.current = entries.length
  }, [isLoading, entries.length])

  React.useEffect(() => {
    const node = sentinelRef.current
    if (!node || exhausted || isSearching) return
    const observer = new IntersectionObserver(
      ([sentinelEntry]) => {
        if (sentinelEntry.isIntersecting && !isLoading) {
          onLoadMore()
        }
      },
      { rootMargin: '400px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [exhausted, isSearching, isLoading, onLoadMore, entries.length])

  // ── Milestone prev/next ────────────────────────────────────────────────
  const jumpToMilestone = React.useCallback(
    (delta: number) => {
      if (milestoneIdsInView.length === 0) return
      const next = ((milestoneCursor + delta) % milestoneIdsInView.length + milestoneIdsInView.length) % milestoneIdsInView.length
      setMilestoneCursor(next)
      nodeRefs.current.get(milestoneIdsInView[next])?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    },
    [milestoneCursor, milestoneIdsInView],
  )

  const registerNode = React.useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) nodeRefs.current.set(id, el)
    else nodeRefs.current.delete(id)
  }, [])

  const emptyMessage = isSearching
    ? `No matches for "${activeQuery.trim()}".`
    : milestoneFilter.active
      ? 'No milestones flagged yet.'
      : view === 'entries'
        ? 'No entries yet.'
        : 'No letters yet. Turn a night into one from Tonight.'

  return (
    <div className="flex flex-col">
      {/* ── Controls row: Entries | Letters + search ─────────────────────── */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <div className="flex-1">
          <SegmentedControl
            segments={[
              { id: 'entries', label: 'Entries' },
              { id: 'letters', label: 'Letters' },
            ]}
            activeId={view}
            onChange={(id) => onViewChange(id as EntryTimelineView)}
            color="terra"
          />
        </div>
        <button
          type="button"
          onClick={() => (searchOpen ? closeSearch() : setSearchOpen(true))}
          aria-label={searchOpen ? 'Close search' : 'Search entries'}
          aria-pressed={searchOpen}
          className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 border border-border bg-background"
        >
          {searchOpen ? <CloseIcon size={18} color="var(--color-slate)" /> : <SearchIcon size={18} color="var(--color-slate)" />}
        </button>
      </div>

      {searchOpen && (
        <div className="px-4 pb-3">
          <input
            type="search"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder={view === 'entries' ? 'Search your entries' : 'Search your letters'}
            aria-label="Search entries and letters"
            autoFocus
            className="w-full min-h-[44px] px-3.5 rounded-[10px] text-[15px] border border-border bg-white text-foreground outline-none"
          />
        </div>
      )}

      {/* ── Milestone filter bar ─────────────────────────────────────────── */}
      {!isSearching && milestoneFilter.entryIds.size > 0 && (
        <div className="flex items-center gap-2 px-4 pb-3">
          <button
            type="button"
            onClick={() => milestoneFilter.onToggle(!milestoneFilter.active)}
            aria-pressed={milestoneFilter.active}
            className="inline-flex items-center gap-1.5 min-h-[36px] px-3 rounded-full text-[13px] font-semibold"
            style={{
              border: milestoneFilter.active ? '1.5px solid var(--terra-400)' : '1px solid var(--color-border)',
              background: milestoneFilter.active ? 'var(--terra-50)' : 'var(--color-white)',
              color: milestoneFilter.active ? 'var(--terra-600)' : 'var(--color-muted)',
            }}
          >
            <span
              aria-hidden="true"
              className="w-2 h-2 rounded-full"
              style={{ background: 'var(--terra-400)' }}
            />
            Milestones ({milestoneFilter.entryIds.size})
          </button>
          {milestoneFilter.active && milestoneIdsInView.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => jumpToMilestone(-1)}
                aria-label="Previous milestone"
                className="w-8 h-8 rounded-full flex items-center justify-center border border-border"
              >
                <ChevronRightIcon size={14} color="var(--color-slate)" className="rotate-180" />
              </button>
              <button
                type="button"
                onClick={() => jumpToMilestone(1)}
                aria-label="Next milestone"
                className="w-8 h-8 rounded-full flex items-center justify-center border border-border"
              >
                <ChevronRightIcon size={14} color="var(--color-slate)" />
              </button>
            </>
          )}
        </div>
      )}

      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>

      {/* ── Sticky month header (also the jump affordance) ───────────────── */}
      {!isSearching && currentMonthLabel && (
        <button
          type="button"
          onClick={() => setJumpSheetOpen(true)}
          className="sticky top-0 z-10 flex items-center justify-between w-full px-4 py-2.5 text-left"
          style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}
          aria-label={`Jump to a different month. Currently showing ${currentMonthLabel}.`}
        >
          <span className="text-[13px] font-bold uppercase tracking-[0.4px]" style={{ color: 'var(--color-slate)' }}>
            {currentMonthLabel}
          </span>
          <ChevronRightIcon size={14} color="var(--color-muted)" className="rotate-90" />
        </button>
      )}

      {/* ── List ───────────────────────────────────────────────────────────── */}
      <div className="px-4 pt-2">
        {isLoading && filteredEntries.length === 0 && (
          <div className="flex flex-col gap-3 py-2" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="lumira-card !p-4 animate-pulse" style={{ height: 88 }} />
            ))}
          </div>
        )}

        {!isLoading || filteredEntries.length > 0 ? (
          filteredEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">{emptyMessage}</p>
          ) : isSearching ? (
            <div className="flex flex-col gap-3 pb-4">
              {filteredEntries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} onPress={() => onOpenEntry(entry.id)} />
              ))}
            </div>
          ) : (
            monthGroups.map((group) => (
              <section
                key={`${group.year}-${group.month}`}
                aria-label={group.label}
                className="relative pl-4 pb-2"
              >
                <div
                  aria-hidden="true"
                  className="absolute top-0 bottom-0"
                  style={{ left: 7, width: 1, background: 'var(--color-border)' }}
                />
                <div className="flex flex-col gap-3">
                  {group.entries.map((entry) => {
                    const isMilestone = milestoneFilter.entryIds.has(entry.id)
                    return (
                      <div
                        key={entry.id}
                        ref={(el) => registerNode(entry.id, el)}
                        className="relative"
                      >
                        {isMilestone && (
                          <span
                            aria-hidden="true"
                            className="absolute rounded-full"
                            style={{
                              left: -13,
                              top: 18,
                              width: 8,
                              height: 8,
                              background: 'var(--terra-400)',
                              boxShadow: '0 0 0 3px var(--color-surface)',
                            }}
                          />
                        )}
                        <EntryCard entry={entry} onPress={() => onOpenEntry(entry.id)} />
                      </div>
                    )
                  })}
                </div>
              </section>
            ))
          )
        ) : null}

        {!isSearching && (
          <div ref={sentinelRef} aria-hidden="true" style={{ height: 1 }} />
        )}

        {isLoading && filteredEntries.length > 0 && (
          <p className="text-xs text-muted-foreground text-center py-4" role="status">
            Loading more…
          </p>
        )}
      </div>

      <MonthYearJumpSheet
        isOpen={jumpSheetOpen}
        onClose={() => setJumpSheetOpen(false)}
        months={monthOptions}
        activeYear={currentGroup?.year ?? null}
        activeMonth={currentGroup?.month ?? null}
        onSelect={onJumpToMonth}
      />
    </div>
  )
}

export default EntryTimeline

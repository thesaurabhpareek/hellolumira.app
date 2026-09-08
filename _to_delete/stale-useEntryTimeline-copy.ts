'use client'

/**
 * @module useEntryTimeline
 * @description The Journal timeline: paginated fetch against
 *   GET /api/letters/entries, plus the three controls the tab needs — the
 *   Entries|Letters segmented control (`entry_kind`), month jump, and search.
 *
 *   The tab names the habit, not the artifact (docs/LETTERS-MODEL-CHANGE.md):
 *   logs and letters live in one feed, and `kind` picks the view. Default is
 *   `'all'`, which is both.
 *
 *   All filtering and searching happens server-side — `q` uses the Postgres
 *   full-text index, not a client-side filter over a partial page, so search
 *   reaches entries that were never fetched. Paging is offset-based because
 *   that is what the route exposes.
 *
 *   Every fetch is sequenced and abortable: a stale response can never
 *   overwrite a newer one, and nothing is set after unmount.
 * @version 1.0.0
 * @since September 2026
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { isLettersEnabled, type LettersFlagContext } from '@/lib/letters/flags'
import type { Letter } from '@/types/letters'

/** Matches the route's `entry_kind` param. 'all' = logs and letters together. */
export type EntryKindFilter = 'log' | 'letter' | 'all'

export type UseEntryTimelineOptions = {
  /** Scope to one baby. Null/undefined returns every baby the parent can see. */
  babyId?: string | null
  /** Initial view for the segmented control. Defaults to 'all'. */
  initialKind?: EntryKindFilter
  /** Page size. The route clamps to 1..50. */
  pageSize?: number
  /** Also surface the pre-existing AI weekly summaries in the same feed. */
  includeAiSummary?: boolean
  /** Client-side flag gate (contract §1.1). Disabled means no network at all. */
  flagContext?: LettersFlagContext | null
}

export type UseEntryTimelineResult = {
  entries: Letter[]
  /** Total matching rows server-side, not the number loaded. */
  total: number
  /** True only for a first page / filter change, never for `loadMore`. */
  loading: boolean
  loadingMore: boolean
  error: string | null
  hasMore: boolean
  disabled: boolean
  kind: EntryKindFilter
  setKind: (kind: EntryKindFilter) => void
  /** 'YYYY-MM', or null for no month restriction. */
  month: string | null
  setMonth: (month: string | null) => void
  search: string
  /** Debounced internally; safe to call on every keystroke. */
  setSearch: (query: string) => void
  loadMore: () => void
  refresh: () => void
}

const DEFAULT_PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 300
const MAX_SEARCH_LEN = 200
const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/
const LOAD_ERROR = 'We could not load your journal just now. Pull to try again.'

type EntriesResponse = {
  entries?: Letter[]
  total?: number
  has_more?: boolean
}

export function useEntryTimeline(options: UseEntryTimelineOptions = {}): UseEntryTimelineResult {
  const {
    babyId = null,
    initialKind = 'all',
    pageSize = DEFAULT_PAGE_SIZE,
    includeAiSummary = false,
    flagContext = null,
  } = options

  const disabled = flagContext !== null && !isLettersEnabled(flagContext)

  const [entries, setEntries] = useState<Letter[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(!disabled)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [kind, setKindState] = useState<EntryKindFilter>(initialKind)
  const [month, setMonthState] = useState<string | null>(null)
  const [search, setSearchInput] = useState('')
  /** The debounced value actually sent to the server. */
  const [activeSearch, setActiveSearch] = useState('')
  const [reloadToken, setReloadToken] = useState(0)

  const mountedRef = useRef(true)
  const abortRef = useRef<AbortController | null>(null)
  const seqRef = useRef(0)
  const offsetRef = useRef(0)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (debounceRef.current !== null) clearTimeout(debounceRef.current)
      debounceRef.current = null
      abortRef.current?.abort()
      abortRef.current = null
    }
  }, [])

  const buildUrl = useCallback(
    (offset: number): string => {
      const params = new URLSearchParams()
      params.set('entry_kind', kind)
      params.set('limit', String(pageSize))
      params.set('offset', String(offset))
      if (babyId) params.set('baby_id', babyId)
      if (month && MONTH_RE.test(month)) params.set('month', month)
      const q = activeSearch.trim().slice(0, MAX_SEARCH_LEN)
      if (q) params.set('q', q)
      if (includeAiSummary) params.set('include_ai_summary', 'true')
      return `/api/letters/entries?${params.toString()}`
    },
    [activeSearch, babyId, includeAiSummary, kind, month, pageSize]
  )

  const fetchPage = useCallback(
    async (offset: number, mode: 'replace' | 'append'): Promise<void> => {
      if (disabled) return
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      const seq = ++seqRef.current

      if (mode === 'replace') {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }
      setError(null)

      try {
        const res = await fetch(buildUrl(offset), { signal: controller.signal })
        const payload = (await res.json().catch(() => null)) as (EntriesResponse & { message?: string }) | null
        // A newer request已 started, or the component is gone — drop this result.
        if (seq !== seqRef.current || !mountedRef.current) return

        if (!res.ok) {
          // 404 means Letters is off for this user; show an empty feed, not an error.
          if (res.status === 404) {
            setEntries([])
            setTotal(0)
            setHasMore(false)
            return
          }
          setError(payload?.message ?? LOAD_ERROR)
          return
        }

        const page = payload?.entries ?? []
        offsetRef.current = offset + page.length
        setTotal(payload?.total ?? page.length)
        setHasMore(payload?.has_more ?? false)
        setEntries((prev) => {
          if (mode === 'replace') return page
          // Offset paging can repeat a row if one was written mid-scroll.
          const seen = new Set(prev.map((e) => e.id))
          return [...prev, ...page.filter((e) => !seen.has(e.id))]
        })
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        if (seq !== seqRef.current || !mountedRef.current) return
        setError(LOAD_ERROR)
      } finally {
        if (seq === seqRef.current && mountedRef.current) {
          setLoading(false)
          setLoadingMore(false)
        }
      }
    },
    [buildUrl, disabled]
  )

  // First page, and any time a filter changes. Offset resets with it.
  useEffect(() => {
    if (disabled) {
      setLoading(false)
      setEntries([])
      setTotal(0)
      setHasMore(false)
      return
    }
    offsetRef.current = 0
    void fetchPage(0, 'replace')
  }, [disabled, fetchPage, reloadToken])

  const setKind = useCallback((next: EntryKindFilter) => {
    setKindState(next)
  }, [])

  const setMonth = useCallback((next: string | null) => {
    setMonthState(next !== null && MONTH_RE.test(next) ? next : null)
  }, [])

  const setSearch = useCallback((query: string) => {
    setSearchInput(query)
    if (debounceRef.current !== null) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null
      if (mountedRef.current) setActiveSearch(query)
    }, SEARCH_DEBOUNCE_MS)
  }, [])

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore || disabled) return
    void fetchPage(offsetRef.current, 'append')
  }, [disabled, fetchPage, hasMore, loading, loadingMore])

  const refresh = useCallback(() => {
    setReloadToken((t) => t + 1)
  }, [])

  return {
    entries,
    total,
    loading,
    loadingMore,
    error,
    hasMore,
    disabled,
    kind,
    setKind,
    month,
    setMonth,
    search,
    setSearch,
    loadMore,
    refresh,
  }
}

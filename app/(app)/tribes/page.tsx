'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

type Tribe = {
  id: string
  name: string
  slug: string
  description: string
  emoji: string
  member_count: number
  post_count: number
  color: string
  created_at: string
  is_member: boolean
  latest_post: {
    id: string
    title: string | null
    body: string
    created_at: string
    ai_parent_profiles: { display_name: string; avatar_emoji: string } | null
  } | null
}

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHrs = Math.floor(diffMin / 60)
  if (diffHrs < 24) return `${diffHrs}h ago`
  const diffDays = Math.floor(diffHrs / 24)
  if (diffDays < 7) return `${diffDays}d ago`
  return `${Math.floor(diffDays / 7)}w ago`
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`
  return n.toString()
}

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'my', label: 'Joined' },
  { id: 'pregnancy', label: '🤰 Pregnancy' },
  { id: 'newborn', label: '👶 Newborn' },
  { id: 'toddler', label: '🧒 Toddler' },
  { id: 'finance', label: '💰 Finance' },
  { id: 'preparation', label: '🎒 Prep' },
  { id: 'support', label: '💚 Support' },
  { id: 'community', label: '🤝 Community' },
] as const

const SORT_OPTIONS = [
  { id: 'most-popular', label: 'Most Popular' },
  { id: 'newest', label: 'Newest' },
  { id: 'alphabetical', label: 'A-Z' },
] as const

type SortOption = typeof SORT_OPTIONS[number]['id']

function sortTribes(tribes: Tribe[], sortBy: SortOption): Tribe[] {
  return [...tribes].sort((a, b) => {
    switch (sortBy) {
      case 'most-popular':
        return b.member_count - a.member_count
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case 'alphabetical':
        return a.name.localeCompare(b.name)
      default:
        return 0
    }
  })
}

// Map tribes to filter categories based on slug keywords
function getTribeCategory(slug: string): string[] {
  const cats: string[] = []
  if (/trimester|pregnan|birth-prep/.test(slug)) cats.push('pregnancy')
  if (/newborn|infant|0-to-3|3-to-6|6-to-9|9-to-12|feeding|sleep|weaning/.test(slug)) cats.push('newborn')
  if (/toddler/.test(slug)) cats.push('toddler')
  if (/budget|financ|parental-leave/.test(slug)) cats.push('finance')
  if (/nursery|gear|birth-plan|hospital|baby-names|milestone/.test(slug)) cats.push('preparation')
  if (/anxiety|ppd|support|recovery|nicu|rainbow|postpartum|self-care/.test(slug)) cats.push('support')
  if (/dad|partner|lgbtq|single|multicultural|adoption|working|multiples|pumping|back-to-work|returning/.test(slug)) cats.push('community')
  return cats.length ? cats : ['community']
}

export default function TribesPage() {
  const router = useRouter()
  const [tribes, setTribes] = useState<Tribe[]>([])
  const [loading, setLoading] = useState(true)
  const [joiningSlug, setJoiningSlug] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('most-popular')
  const [sortOpen, setSortOpen] = useState(false)

  const fetchTribes = useCallback(async () => {
    try {
      const res = await fetch('/api/tribes')
      const data = await res.json()
      if (data.tribes) setTribes(data.tribes)
    } catch (err) {
      console.error('Failed to fetch tribes:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTribes() }, [fetchTribes])

  const handleJoin = async (slug: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setJoiningSlug(slug)
    try {
      const res = await fetch(`/api/tribes/${slug}/join`, { method: 'POST' })
      if (res.ok) {
        setTribes(prev => prev.map(t =>
          t.slug === slug ? { ...t, is_member: true, member_count: t.member_count + 1 } : t
        ))
      } else {
        console.error('Failed to join tribe:', res.status)
      }
    } catch (err) {
      console.error('Failed to join tribe:', err)
    } finally {
      setJoiningSlug(null)
    }
  }

  const handleLeave = async (slug: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setJoiningSlug(slug)
    try {
      const res = await fetch(`/api/tribes/${slug}/join`, { method: 'DELETE' })
      if (res.ok) {
        setTribes(prev => prev.map(t =>
          t.slug === slug ? { ...t, is_member: false, member_count: t.member_count - 1 } : t
        ))
      } else {
        console.error('Failed to leave tribe:', res.status)
      }
    } catch (err) {
      console.error('Failed to leave tribe:', err)
    } finally {
      setJoiningSlug(null)
    }
  }

  // Apply filter + search
  const filteredTribes = tribes.filter(t => {
    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      if (!t.name.toLowerCase().includes(q) && !t.description.toLowerCase().includes(q)) return false
    }
    // Category filter
    if (activeFilter === 'all') return true
    if (activeFilter === 'my') return t.is_member
    if (activeFilter === 'discover') return !t.is_member
    return getTribeCategory(t.slug).includes(activeFilter)
  })

  const sortedTribes = sortTribes(filteredTribes, sortBy)
  const myTribes = sortedTribes.filter(t => t.is_member)
  const otherTribes = sortedTribes.filter(t => !t.is_member)

  if (loading) {
    return (
      <div style={{ minHeight: '100%', background: 'var(--color-surface)', paddingBottom: '24px' }}>
        <div className="content-width mx-auto px-4 pt-6">
          <h1 className="text-h1" style={{ color: 'var(--color-slate)', marginBottom: '4px' }}>My Tribes</h1>
          <p className="text-body" style={{ color: 'var(--color-muted)', marginBottom: '24px' }}>Connect with parents in your moment</p>
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: '14px',
              padding: '14px 16px', marginBottom: '10px', borderRadius: '14px',
              background: 'var(--color-white)', border: '1px solid var(--color-border)',
            }}>
              <div className="lumira-skeleton" style={{ width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="lumira-skeleton" style={{ height: '18px', width: '55%', borderRadius: '6px', marginBottom: '8px' }} />
                <div className="lumira-skeleton" style={{ height: '14px', width: '85%', borderRadius: '6px', marginBottom: '8px' }} />
                <div className="lumira-skeleton" style={{ height: '12px', width: '45%', borderRadius: '4px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100%', background: 'var(--color-surface)', paddingBottom: '24px' }}>
      <div className="content-width mx-auto px-4 pt-6">
        <h1 className="text-h1" style={{ color: 'var(--color-slate)', marginBottom: '4px' }}>My Tribes</h1>
        <p className="text-body" style={{ color: 'var(--color-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
          Connect with parents in your moment
        </p>

        {/* Search bar */}
        <div style={{ marginBottom: '12px' }}>
          <input
            type="text"
            placeholder="Search tribes..."
            aria-label="Search tribes"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--color-border)',
              background: 'var(--color-white)',
              fontSize: '14px',
              color: 'var(--color-slate)',
              outline: 'none',
              minHeight: '44px',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Filter pills + Sort */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <div
            style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '4px',
              flex: 1,
              WebkitOverflowScrolling: 'touch',
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
            }}
          >
            {FILTERS.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '100px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  minHeight: '36px',
                  transition: 'all 0.15s ease',
                  background: activeFilter === filter.id ? 'var(--color-primary)' : 'var(--color-white)',
                  color: activeFilter === filter.id ? '#fff' : 'var(--color-muted)',
                  boxShadow: activeFilter === filter.id ? 'none' : '0 1px 3px rgba(0,0,0,0.06)',
                }}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Sort dropdown */}
          <div style={{ position: 'relative', flexShrink: 0, paddingBottom: '4px' }}>
            <button
              onClick={() => setSortOpen(!sortOpen)}
              aria-label="Sort tribes"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                borderRadius: '100px',
                border: 'none',
                fontSize: '13px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                minHeight: '36px',
                background: 'var(--color-white)',
                color: 'var(--color-muted)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                transition: 'all 0.15s ease',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18M6 12h12M9 18h6" />
              </svg>
              {SORT_OPTIONS.find(o => o.id === sortBy)?.label}
            </button>
            {sortOpen && (
              <>
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 10 }}
                  onClick={() => setSortOpen(false)}
                />
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '4px',
                  background: 'var(--color-white)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                  border: '1px solid var(--color-border)',
                  zIndex: 20,
                  minWidth: '160px',
                  overflow: 'hidden',
                }}>
                  {SORT_OPTIONS.map(option => (
                    <button
                      key={option.id}
                      onClick={() => { setSortBy(option.id); setSortOpen(false) }}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '10px 16px',
                        border: 'none',
                        background: sortBy === option.id ? 'var(--color-surface)' : 'transparent',
                        color: sortBy === option.id ? 'var(--color-primary)' : 'var(--color-slate)',
                        fontSize: '13px',
                        fontWeight: sortBy === option.id ? 600 : 400,
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'background 0.1s ease',
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Empty state */}
        {filteredTribes.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'var(--color-muted)',
          }}>
            <p style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</p>
            <p style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>No tribes found</p>
            <p style={{ fontSize: '13px' }}>Try a different filter or search term</p>
          </div>
        )}

        {/* My Tribes */}
        {myTribes.length > 0 && (
          <>
            <p style={{
              fontSize: '13px', fontWeight: 600, color: 'var(--color-muted)',
              textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px',
            }}>
              My Tribes
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
              {myTribes.map(tribe => (
                <TribeCard
                  key={tribe.id}
                  tribe={tribe}
                  onClick={() => router.push(`/tribes/${tribe.slug}`)}
                  onJoin={(e) => handleLeave(tribe.slug, e)}
                  joining={joiningSlug === tribe.slug}
                  isMember
                />
              ))}
            </div>
          </>
        )}

        {/* Discover Tribes */}
        <p style={{
          fontSize: '13px', fontWeight: 600, color: 'var(--color-muted)',
          textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px',
        }}>
          {myTribes.length > 0 ? 'Discover More' : 'All Tribes'}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
          {otherTribes.map(tribe => (
            <TribeCard
              key={tribe.id}
              tribe={tribe}
              onClick={() => router.push(`/tribes/${tribe.slug}`)}
              onJoin={(e) => handleJoin(tribe.slug, e)}
              joining={joiningSlug === tribe.slug}
              isMember={false}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function TribeCard({
  tribe,
  onClick,
  onJoin,
  joining,
  isMember,
}: {
  tribe: Tribe
  onClick: () => void
  onJoin: (e: React.MouseEvent) => void
  joining: boolean
  isMember: boolean
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '14px', width: '100%',
        padding: '14px 16px', background: hovered ? '#FBF9F6' : 'var(--color-white)',
        border: isMember ? '1px solid var(--color-border)' : '1px dashed var(--color-border)',
        borderRadius: '14px', cursor: 'pointer', textAlign: 'left',
        transition: 'all 0.2s ease', position: 'relative',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered ? '0 6px 16px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.02)',
        minHeight: '44px',
      }}
    >
      <span style={{ fontSize: '28px', flexShrink: 0, marginTop: '2px' }}>{tribe.emoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '3px' }}>
          <p style={{ fontWeight: 600, fontSize: '15px', color: 'var(--color-slate)' }}>
            {tribe.name}
          </p>
          <button
            type="button"
            onClick={onJoin}
            aria-label={isMember ? 'Leave tribe' : 'Join tribe'}
            style={{
              padding: isMember ? '6px 14px' : '6px 18px',
              borderRadius: '100px',
              fontSize: '13px',
              fontWeight: 600,
              flexShrink: 0,
              background: isMember ? 'transparent' : 'var(--color-primary)',
              color: isMember ? 'var(--color-muted)' : '#FFFFFF',
              border: isMember ? '1.5px solid var(--color-border)' : '1.5px solid var(--color-primary)',
              opacity: joining ? 0.5 : 1,
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              letterSpacing: '0.1px',
              minWidth: isMember ? '72px' : '64px',
            }}
          >
            {joining ? '...' : isMember ? 'Joined ✓' : 'Join'}
          </button>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--color-muted)', lineHeight: 1.4, marginBottom: '6px' }}>
          {tribe.description}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--color-muted)' }}>
          <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
            {formatCount(tribe.member_count)} members
          </span>
          <span>{formatCount(tribe.post_count)} posts</span>
          {tribe.latest_post && (
            <span>Active {timeAgo(tribe.latest_post.created_at)}</span>
          )}
        </div>
        {tribe.latest_post && (
          <div style={{
            marginTop: '8px', padding: '8px 10px', borderRadius: '8px',
            background: 'var(--color-surface)', fontSize: '13px', color: 'var(--color-slate)',
          }}>
            <span style={{ color: 'var(--color-muted)', fontSize: '12px' }}>
              {tribe.latest_post.ai_parent_profiles?.avatar_emoji}{' '}
              {tribe.latest_post.ai_parent_profiles?.display_name}:{' '}
            </span>
            {(tribe.latest_post.title || tribe.latest_post.body).slice(0, 60)}
            {(tribe.latest_post.title || tribe.latest_post.body).length > 60 ? '...' : ''}
          </div>
        )}
      </div>
    </button>
  )
}

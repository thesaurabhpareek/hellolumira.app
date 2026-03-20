'use client'

import { useState, useEffect, useCallback } from 'react'
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

export default function TribesPage() {
  const router = useRouter()
  const [tribes, setTribes] = useState<Tribe[]>([])
  const [loading, setLoading] = useState(true)
  const [joiningSlug, setJoiningSlug] = useState<string | null>(null)

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
      await fetch(`/api/tribes/${slug}/join`, { method: 'POST' })
      setTribes(prev => prev.map(t =>
        t.slug === slug ? { ...t, is_member: true, member_count: t.member_count + 1 } : t
      ))
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
      await fetch(`/api/tribes/${slug}/join`, { method: 'DELETE' })
      setTribes(prev => prev.map(t =>
        t.slug === slug ? { ...t, is_member: false, member_count: t.member_count - 1 } : t
      ))
    } catch (err) {
      console.error('Failed to leave tribe:', err)
    } finally {
      setJoiningSlug(null)
    }
  }

  const myTribes = tribes.filter(t => t.is_member)
  const otherTribes = tribes.filter(t => !t.is_member)

  if (loading) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--color-surface)', paddingBottom: '100px' }}>
        <div className="content-width mx-auto px-4 pt-6">
          <h1 className="text-h1" style={{ color: 'var(--color-slate)', marginBottom: '4px' }}>My Tribes</h1>
          <p className="text-body" style={{ color: 'var(--color-muted)', marginBottom: '24px' }}>Connect with parents in your moment</p>
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              height: '88px', marginBottom: '10px', borderRadius: '14px',
              background: 'var(--color-white)', border: '1px solid var(--color-border)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          ))}
          <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-surface)', paddingBottom: '100px' }}>
      <div className="content-width mx-auto px-4 pt-6">
        <h1 className="text-h1" style={{ color: 'var(--color-slate)', marginBottom: '4px' }}>My Tribes</h1>
        <p className="text-body" style={{ color: 'var(--color-muted)', marginBottom: '24px', lineHeight: 1.5 }}>
          Connect with parents in your moment
        </p>

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
          <span
            onClick={onJoin}
            style={{
              padding: '4px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: 600, flexShrink: 0,
              background: isMember ? 'var(--color-surface)' : 'var(--color-primary-light)',
              color: isMember ? 'var(--color-muted)' : 'var(--color-primary)',
              border: isMember ? '1px solid var(--color-border)' : 'none',
              opacity: joining ? 0.5 : 1,
              minHeight: '44px', display: 'flex', alignItems: 'center',
              transition: 'all 0.2s ease',
            }}
          >
            {joining ? '...' : isMember ? 'Joined' : 'Join'}
          </span>
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

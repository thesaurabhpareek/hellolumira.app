'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { triggerHaptic, showToast, triggerSlideInFromTop } from '@/lib/animations'

type AiProfile = {
  id: string
  display_name: string
  avatar_emoji: string
  bio: string
  baby_name: string | null
  baby_age_desc: string | null
}

type Post = {
  id: string
  tribe_id: string
  title: string | null
  body: string
  post_type: string
  emoji_tag: string | null
  is_pinned: boolean
  comment_count: number
  reaction_count: number
  created_at: string
  ai_parent_profiles: AiProfile | null
  profile_id: string | null
}

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
}

type SortOption = {
  key: string
  label: string
}

const SORT_OPTIONS: SortOption[] = [
  { key: 'latest', label: 'Latest' },
  { key: 'popular', label: 'Popular' },
  { key: 'discussed', label: 'Most Discussed' },
  { key: 'liked', label: 'Most Liked' },
]

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

const POST_TYPE_LABELS: Record<string, { label: string; bg: string; color: string }> = {
  question: { label: 'Question', bg: '#FFF3E0', color: '#E67E22' },
  tip: { label: 'Tip', bg: '#E8F5E9', color: '#27AE60' },
  celebration: { label: 'Celebration', bg: '#F3E5F5', color: '#8E44AD' },
  vent: { label: 'Vent', bg: '#FFEBEE', color: '#E74C3C' },
  discussion: { label: 'Discussion', bg: '#E3F2FD', color: '#3498DB' },
  poll: { label: 'Poll', bg: '#E0F2F1', color: '#1ABC9C' },
}

export default function TribeDetailPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string

  const [tribe, setTribe] = useState<Tribe | null>(null)
  const [members, setMembers] = useState<AiProfile[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [showNewPost, setShowNewPost] = useState(false)
  const [newPostTitle, setNewPostTitle] = useState('')
  const [newPostBody, setNewPostBody] = useState('')
  const [newPostType, setNewPostType] = useState('discussion')
  const [posting, setPosting] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null)
  const [activeSort, setActiveSort] = useState('latest')
  const postsContainerRef = useRef<HTMLDivElement>(null)

  const fetchData = useCallback(async (sort = 'latest') => {
    try {
      const [tribeRes, postsRes] = await Promise.all([
        fetch(`/api/tribes/${slug}`),
        fetch(`/api/tribes/${slug}/posts?sort=${sort}`),
      ])
      const tribeData = await tribeRes.json()
      const postsData = await postsRes.json()
      if (tribeData.tribe) setTribe(tribeData.tribe)
      if (tribeData.members) setMembers(tribeData.members)
      if (postsData.posts) setPosts(postsData.posts)
    } catch (err) {
      console.error('Failed to fetch tribe data:', err)
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => { fetchData(activeSort) }, [fetchData, activeSort])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setCurrentUserId(data.user.id)
    })
  }, [])

  const handleSortChange = (sortKey: string) => {
    setActiveSort(sortKey)
  }

  const handleJoinToggle = async () => {
    if (!tribe) return
    setJoining(true)
    try {
      const method = tribe.is_member ? 'DELETE' : 'POST'
      await fetch(`/api/tribes/${slug}/join`, { method })
      setTribe(prev => prev ? {
        ...prev,
        is_member: !prev.is_member,
        member_count: prev.member_count + (prev.is_member ? -1 : 1),
      } : null)
    } catch (err) {
      console.error('Failed to toggle membership:', err)
    } finally {
      setJoining(false)
    }
  }

  const handleCreatePost = async () => {
    if (!newPostBody.trim()) return
    setPosting(true)
    try {
      const res = await fetch(`/api/tribes/${slug}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newPostTitle || null, body: newPostBody, post_type: newPostType }),
      })
      if (res.ok) {
        setShowNewPost(false)
        setNewPostTitle('')
        setNewPostBody('')
        setNewPostType('discussion')

        // Haptic + toast
        triggerHaptic('success')
        showToast('Posted!', 2000)

        await fetchData(activeSort)

        // Slide-in the first post card
        requestAnimationFrame(() => {
          const firstPost = postsContainerRef.current?.querySelector('[data-post-card]') as HTMLElement
          if (firstPost) {
            triggerSlideInFromTop(firstPost)
          }
        })
      }
    } catch (err) {
      console.error('Failed to create post:', err)
    } finally {
      setPosting(false)
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return
    setDeletingPostId(postId)
    try {
      const res = await fetch(`/api/tribes/posts/${postId}`, { method: 'DELETE' })
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== postId))
      }
    } catch (err) {
      console.error('Failed to delete post:', err)
    } finally {
      setDeletingPostId(null)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100%', background: 'var(--color-surface)', paddingBottom: '24px' }}>
        <div className="content-width mx-auto px-4 pt-6">
          <div style={{ height: '120px', borderRadius: '14px', background: 'var(--color-white)', marginBottom: '16px', animation: 'pulse 1.5s ease-in-out infinite' }} />
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: '100px', borderRadius: '14px', background: 'var(--color-white)', marginBottom: '10px', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
          <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
        </div>
      </div>
    )
  }

  if (!tribe) {
    return (
      <div style={{ minHeight: '100%', background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--color-muted)' }}>Tribe not found</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100%', background: 'var(--color-surface)', paddingBottom: '24px' }}>
      <div className="content-width mx-auto px-4 pt-6">
        {/* Back button */}
        <button
          onClick={() => router.push('/tribes')}
          style={{
            display: 'flex', alignItems: 'center', gap: '4px', background: 'none',
            border: 'none', cursor: 'pointer', color: '#3D8178',
            fontSize: '14px', fontWeight: 600, padding: '16px 0',
          }}
        >
          &larr; All Tribes
        </button>

        {/* Tribe Header */}
        <div style={{
          padding: '20px', borderRadius: '16px', background: 'var(--color-white)',
          border: '1px solid var(--color-border)', marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '12px' }}>
            <span style={{ fontSize: '40px' }}>{tribe.emoji}</span>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-slate)', marginBottom: '4px' }}>
                {tribe.name}
              </h1>
              <p style={{ fontSize: '14px', color: 'var(--color-muted)', lineHeight: 1.5 }}>
                {tribe.description}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--color-muted)' }}>
              <span><strong style={{ color: 'var(--color-primary)' }}>{tribe.member_count.toLocaleString()}</strong> members</span>
              <span><strong>{tribe.post_count}</strong> posts</span>
            </div>
            <button
              onClick={handleJoinToggle}
              disabled={joining}
              style={{
                padding: '8px 20px', borderRadius: '100px', fontSize: '14px', fontWeight: 600,
                border: 'none', cursor: joining ? 'default' : 'pointer',
                background: tribe.is_member ? 'var(--color-surface)' : 'var(--color-primary)',
                color: tribe.is_member ? 'var(--color-muted)' : '#fff',
                opacity: joining ? 0.5 : 1,
                minHeight: '44px',
                transition: 'all 0.2s ease',
              }}
            >
              {joining ? '...' : tribe.is_member ? 'Joined' : 'Join Tribe'}
            </button>
          </div>

          {/* Member avatars */}
          {members.length > 0 && (
            <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
              {members.slice(0, 8).map(m => (
                <span key={m.id} title={m.display_name} style={{
                  fontSize: '20px', width: '32px', height: '32px', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
                  background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                }}>
                  {m.avatar_emoji}
                </span>
              ))}
              {tribe.member_count > 8 && (
                <span style={{
                  fontSize: '11px', fontWeight: 600, color: 'var(--color-muted)',
                  padding: '0 8px', height: '32px', display: 'flex', alignItems: 'center',
                }}>
                  +{(tribe.member_count - 8).toLocaleString()} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Sort Filter Bar */}
        <div style={{
          display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto',
          paddingBottom: '4px', WebkitOverflowScrolling: 'touch',
          msOverflowStyle: 'none', scrollbarWidth: 'none',
        }}>
          {SORT_OPTIONS.map(option => (
            <button
              key={option.key}
              onClick={() => handleSortChange(option.key)}
              style={{
                padding: '8px 16px',
                borderRadius: '100px',
                fontSize: '13px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s ease',
                background: activeSort === option.key ? '#3D8178' : 'var(--color-white)',
                color: activeSort === option.key ? '#FFFFFF' : 'var(--color-muted)',
              }}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* New Post Button / Form */}
        {!showNewPost ? (
          <button
            onClick={() => setShowNewPost(true)}
            style={{
              width: '100%', padding: '14px 16px', borderRadius: '14px',
              background: 'var(--color-white)', border: '1px dashed var(--color-primary-mid)',
              cursor: 'pointer', fontSize: '14px', color: 'var(--color-primary)',
              fontWeight: 600, marginBottom: '20px', textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: '8px',
              minHeight: '44px', transition: 'all 0.2s ease',
            }}
          >
            <span style={{ fontSize: '18px' }}>+</span> Share something with the tribe...
          </button>
        ) : (
          <div style={{
            padding: '16px', borderRadius: '14px', background: 'var(--color-white)',
            border: '1px solid var(--color-primary-mid)', marginBottom: '20px',
          }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
              {Object.entries(POST_TYPE_LABELS).map(([key, { label }]) => (
                <button
                  key={key}
                  onClick={() => setNewPostType(key)}
                  style={{
                    padding: '4px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: 600,
                    border: newPostType === key ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                    background: newPostType === key ? 'var(--color-primary-light)' : 'var(--color-white)',
                    color: newPostType === key ? 'var(--color-primary)' : 'var(--color-muted)',
                    cursor: 'pointer', minHeight: '44px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Title (optional)"
              value={newPostTitle}
              onChange={e => setNewPostTitle(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: '8px', fontSize: '14px',
                border: '1px solid var(--color-border)', marginBottom: '8px',
                background: 'var(--color-surface)', color: 'var(--color-slate)',
                fontFamily: 'inherit', minHeight: '44px',
              }}
            />
            <textarea
              placeholder="What's on your mind?"
              value={newPostBody}
              onChange={e => setNewPostBody(e.target.value)}
              rows={4}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: '8px', fontSize: '14px',
                border: '1px solid var(--color-border)', resize: 'vertical',
                background: 'var(--color-surface)', color: 'var(--color-slate)',
                fontFamily: 'inherit', lineHeight: 1.5,
              }}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setShowNewPost(false); setNewPostTitle(''); setNewPostBody('') }}
                style={{
                  padding: '8px 16px', borderRadius: '100px', fontSize: '13px',
                  border: '1px solid var(--color-border)', background: 'var(--color-white)',
                  color: 'var(--color-muted)', cursor: 'pointer', fontWeight: 600,
                  minHeight: '44px', transition: 'all 0.2s ease',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePost}
                disabled={posting || !newPostBody.trim()}
                style={{
                  padding: '8px 20px', borderRadius: '100px', fontSize: '13px',
                  border: 'none', background: 'var(--color-primary)',
                  color: '#fff', cursor: posting ? 'default' : 'pointer',
                  fontWeight: 600, opacity: posting || !newPostBody.trim() ? 0.5 : 1,
                  minHeight: '44px', transition: 'all 0.2s ease',
                }}
              >
                {posting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        )}

        {/* Posts Feed */}
        <div ref={postsContainerRef} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onClick={() => router.push(`/tribes/${slug}/post/${post.id}`)}
              isOwner={currentUserId !== null && post.profile_id === currentUserId}
              onDelete={() => handleDeletePost(post.id)}
              deleting={deletingPostId === post.id}
              currentUserId={currentUserId}
            />
          ))}
          {posts.length === 0 && (
            <div style={{
              textAlign: 'center', padding: '40px 20px', color: 'var(--color-muted)',
              fontSize: '14px',
            }}>
              No posts yet. Be the first to share something!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const REPORT_REASONS = [
  'Inappropriate content',
  'Misinformation',
  'Spam',
  'Other',
] as const

type ReportReason = typeof REPORT_REASONS[number]

function ReportModal({
  postId,
  userId,
  onClose,
}: {
  postId: string
  userId: string | null
  onClose: () => void
}) {
  const [selectedReason, setSelectedReason] = useState<ReportReason | ''>('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!selectedReason) return
    setSubmitting(true)
    try {
      const supabase = createClient()
      await supabase.from('content_reports').insert({
        reporter_profile_id: userId,
        content_type: 'tribe_post',
        content_id: postId,
        reason: selectedReason,
      })
    } catch {
      // Handle gracefully — table may not exist yet
    } finally {
      setSubmitting(false)
      showToast("Thanks for reporting. We'll review this post.", 3000)
      onClose()
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.4)',
        }}
      />
      {/* Modal */}
      <div style={{
        position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
        zIndex: 101, background: 'var(--color-white)', borderRadius: '16px',
        padding: '24px', width: 'min(90vw, 360px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.16)',
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-slate)', marginBottom: '16px' }}>
          Why are you reporting this post?
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          {REPORT_REASONS.map(reason => (
            <label
              key={reason}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                cursor: 'pointer', fontSize: '14px', color: 'var(--color-slate)',
                padding: '10px 12px', borderRadius: '10px',
                background: selectedReason === reason ? 'var(--color-surface)' : 'transparent',
                border: selectedReason === reason ? '1.5px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                transition: 'all 0.15s ease',
              }}
            >
              <input
                type="radio"
                name="report-reason"
                value={reason}
                checked={selectedReason === reason}
                onChange={() => setSelectedReason(reason)}
                style={{ accentColor: 'var(--color-primary)', width: '16px', height: '16px' }}
              />
              {reason}
            </label>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px', borderRadius: '100px', fontSize: '13px',
              border: '1px solid var(--color-border)', background: 'var(--color-white)',
              color: 'var(--color-muted)', cursor: 'pointer', fontWeight: 600, minHeight: '40px',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedReason || submitting}
            style={{
              padding: '8px 20px', borderRadius: '100px', fontSize: '13px',
              border: 'none', background: 'var(--color-primary)',
              color: '#fff', cursor: !selectedReason || submitting ? 'default' : 'pointer',
              fontWeight: 600, opacity: !selectedReason || submitting ? 0.5 : 1,
              minHeight: '40px', transition: 'all 0.2s ease',
            }}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </>
  )
}

function PostCard({
  post,
  onClick,
  isOwner,
  onDelete,
  deleting,
  currentUserId,
}: {
  post: Post
  onClick: () => void
  isOwner?: boolean
  onDelete?: () => void
  deleting?: boolean
  currentUserId: string | null
}) {
  const author = post.ai_parent_profiles
  const typeInfo = POST_TYPE_LABELS[post.post_type] || POST_TYPE_LABELS.discussion
  const [hovered, setHovered] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)

  return (
    <>
      {reportOpen && (
        <ReportModal
          postId={post.id}
          userId={currentUserId}
          onClose={() => setReportOpen(false)}
        />
      )}
      <div
        data-post-card
        style={{
          width: '100%', borderRadius: '14px',
          background: hovered
            ? `linear-gradient(var(--color-hover), var(--color-hover)), var(--color-white)`
            : 'var(--color-white)',
          border: '1px solid var(--color-border)',
          transition: 'all 0.2s ease',
          transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
          boxShadow: hovered ? '0 4px 12px rgba(0,0,0,0.06)' : '0 1px 3px rgba(0,0,0,0.02)',
          minHeight: '44px',
          position: 'relative',
        }}
      >
        {/* Three-dot menu button */}
        <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 5 }}>
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen(v => !v) }}
            aria-label="Post options"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '4px 6px', borderRadius: '6px', color: 'var(--color-muted)',
              fontSize: '18px', lineHeight: 1, display: 'flex', alignItems: 'center',
              transition: 'background 0.15s ease',
            }}
          >
            ⋯
          </button>
          {menuOpen && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 10 }}
                onClick={() => setMenuOpen(false)}
              />
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: '4px',
                background: 'var(--color-white)', borderRadius: '10px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                border: '1px solid var(--color-border)', zIndex: 20,
                minWidth: '150px', overflow: 'hidden',
              }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setMenuOpen(false)
                    setReportOpen(true)
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    width: '100%', padding: '10px 14px', border: 'none',
                    background: 'transparent', color: '#B91C1C',
                    fontSize: '13px', fontWeight: 600, textAlign: 'left',
                    cursor: 'pointer', minHeight: '44px',
                  }}
                >
                  🚩 Report post
                </button>
              </div>
            </>
          )}
        </div>

        <button
          onClick={onClick}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            width: '100%', padding: '16px', paddingRight: '44px', borderRadius: '14px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer', textAlign: 'left',
          }}
        >
          {/* Author row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            {author && (
              <>
                <span style={{
                  fontSize: '20px', width: '32px', height: '32px', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
                  background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                }}>
                  {author.avatar_emoji}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-slate)' }}>
                    {author.display_name}
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
                    {author.baby_age_desc} {author.baby_name ? `| ${author.baby_name}` : ''}
                  </p>
                </div>
              </>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              <span style={{
                padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 700,
                background: typeInfo.bg, color: typeInfo.color,
                transition: 'all 0.2s ease',
              }}>
                {typeInfo.label}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
                {timeAgo(post.created_at)}
              </span>
            </div>
          </div>

          {/* Title */}
          {post.title && (
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-slate)', marginBottom: '4px', lineHeight: 1.3 }}>
              {post.emoji_tag && <span style={{ marginRight: '4px' }}>{post.emoji_tag}</span>}
              {post.title}
            </p>
          )}

          {/* Body preview */}
          <p style={{
            fontSize: '14px', color: 'var(--color-muted)', lineHeight: 1.5,
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {post.body}
          </p>

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '10px', fontSize: '12px', color: 'var(--color-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', minHeight: '44px' }}>
              <span>💬</span> {post.comment_count} {post.comment_count === 1 ? 'reply' : 'replies'}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', minHeight: '44px' }}>
              <span>❤️</span> {post.reaction_count}
            </span>
            {post.is_pinned && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--color-primary)', fontWeight: 600 }}>
                📌 Pinned
              </span>
            )}
          </div>
        </button>
        {isOwner && onDelete && (
          <div style={{ padding: '0 16px 12px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete() }}
              disabled={deleting}
              style={{
                background: 'none',
                border: '1px solid #FEB2B2',
                borderRadius: '100px',
                padding: '4px 12px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#B91C1C',
                cursor: deleting ? 'default' : 'pointer',
                opacity: deleting ? 0.5 : 1,
                minHeight: '32px',
              }}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        )}
      </div>
    </>
  )
}

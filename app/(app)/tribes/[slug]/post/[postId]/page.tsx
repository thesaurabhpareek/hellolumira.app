'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type AiProfile = {
  id: string
  display_name: string
  avatar_emoji: string
  bio: string
  baby_name: string | null
  baby_age_desc: string | null
  location?: string | null
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

type Comment = {
  id: string
  post_id: string
  parent_id: string | null
  body: string
  reaction_count: number
  created_at: string
  ai_parent_profiles: AiProfile | null
  profile_id: string | null
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

const POST_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  question: { label: 'Question', color: '#E67E22' },
  tip: { label: 'Tip', color: '#27AE60' },
  celebration: { label: 'Celebration', color: '#8E44AD' },
  vent: { label: 'Vent', color: '#E74C3C' },
  discussion: { label: 'Discussion', color: '#3498DB' },
  poll: { label: 'Poll', color: '#1ABC9C' },
}

const REACTION_EMOJIS = ['❤️', '👏', '🤗', '😂', '💪', '🙏']

export default function PostDetailPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string
  const postId = params.postId as string

  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [reactions, setReactions] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showReactions, setShowReactions] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/tribes/posts/${postId}`)
      const data = await res.json()
      if (data.post) setPost(data.post)
      if (data.comments) setComments(data.comments)
      if (data.reactions) setReactions(data.reactions)
    } catch (err) {
      console.error('Failed to fetch post:', err)
    } finally {
      setLoading(false)
    }
  }, [postId])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setCurrentUserId(data.user.id)
    })
  }, [])

  const handleDeletePost = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/tribes/posts/${postId}`, { method: 'DELETE' })
      if (res.ok) {
        router.push(`/tribes/${slug}`)
      }
    } catch (err) {
      console.error('Failed to delete post:', err)
    } finally {
      setDeleting(false)
    }
  }

  const handleComment = async () => {
    if (!commentText.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/tribes/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: commentText }),
      })
      if (res.ok) {
        setCommentText('')
        fetchData()
      }
    } catch (err) {
      console.error('Failed to post comment:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReaction = async (reactionType: string) => {
    try {
      await fetch(`/api/tribes/posts/${postId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reaction_type: reactionType }),
      })
      setShowReactions(false)
      fetchData()
    } catch (err) {
      console.error('Failed to react:', err)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--color-surface)', paddingBottom: '100px' }}>
        <div className="content-width mx-auto px-4 pt-6">
          <div style={{ height: '200px', borderRadius: '14px', background: 'var(--color-white)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--color-muted)' }}>Post not found</p>
      </div>
    )
  }

  const author = post.ai_parent_profiles
  const typeInfo = POST_TYPE_LABELS[post.post_type] || POST_TYPE_LABELS.discussion

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-surface)', paddingBottom: '120px' }}>
      <div className="content-width mx-auto px-4 pt-6">
        {/* Back button */}
        <button
          onClick={() => router.push(`/tribes/${slug}`)}
          style={{
            display: 'flex', alignItems: 'center', gap: '4px', background: 'none',
            border: 'none', cursor: 'pointer', color: '#3D8178',
            fontSize: '14px', fontWeight: 600, padding: '16px 0',
          }}
        >
          &larr; Back to tribe
        </button>

        {/* Post */}
        <div style={{
          padding: '20px', borderRadius: '16px', background: 'var(--color-white)',
          border: '1px solid var(--color-border)', marginBottom: '16px',
        }}>
          {/* Author */}
          {author && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <span style={{
                fontSize: '24px', width: '40px', height: '40px', display: 'flex',
                alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              }}>
                {author.avatar_emoji}
              </span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-slate)' }}>
                  {author.display_name}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                  {author.baby_age_desc}
                  {author.location ? ` | ${author.location}` : ''}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 600,
                  background: `${typeInfo.color}15`, color: typeInfo.color,
                }}>
                  {typeInfo.label}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                  {timeAgo(post.created_at)}
                </span>
              </div>
            </div>
          )}

          {/* Bio tooltip */}
          {author?.bio && (
            <div style={{
              padding: '8px 12px', borderRadius: '8px', background: 'var(--color-surface)',
              fontSize: '12px', color: 'var(--color-muted)', marginBottom: '14px',
              fontStyle: 'italic', lineHeight: 1.4,
            }}>
              {author.bio}
            </div>
          )}

          {/* Title */}
          {post.title && (
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-slate)', marginBottom: '8px', lineHeight: 1.3 }}>
              {post.emoji_tag && <span style={{ marginRight: '6px' }}>{post.emoji_tag}</span>}
              {post.title}
            </h2>
          )}

          {/* Body */}
          <div style={{ fontSize: '15px', color: 'var(--color-slate)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
            {post.body}
          </div>

          {/* Reactions */}
          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {Object.entries(reactions).map(([emoji, count]) => (
                <span
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px',
                    borderRadius: '100px', background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)', fontSize: '13px',
                    cursor: 'pointer', userSelect: 'none',
                  }}
                >
                  {emoji} <span style={{ fontWeight: 600, color: 'var(--color-muted)' }}>{count}</span>
                </span>
              ))}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowReactions(!showReactions)}
                  style={{
                    width: '32px', height: '28px', borderRadius: '100px', fontSize: '14px',
                    background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  +
                </button>
                {showReactions && (
                  <div style={{
                    position: 'absolute', bottom: '36px', left: '0',
                    display: 'flex', gap: '4px', padding: '6px 10px',
                    borderRadius: '100px', background: 'var(--color-white)',
                    border: '1px solid var(--color-border)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10,
                  }}>
                    {REACTION_EMOJIS.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => handleReaction(emoji)}
                        style={{
                          fontSize: '18px', background: 'none', border: 'none',
                          cursor: 'pointer', padding: '2px', borderRadius: '4px',
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

          {/* Delete button for own posts */}
          {currentUserId && post.profile_id === currentUserId && (
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleDeletePost}
                disabled={deleting}
                style={{
                  background: 'none',
                  border: '1px solid #FEB2B2',
                  borderRadius: '100px',
                  padding: '6px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#B91C1C',
                  cursor: deleting ? 'default' : 'pointer',
                  opacity: deleting ? 0.5 : 1,
                  minHeight: '36px',
                }}
              >
                {deleting ? 'Deleting...' : 'Delete this post'}
              </button>
            </div>
          )}
          </div>
        </div>

        {/* Comments Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <p style={{
            fontSize: '13px', fontWeight: 600, color: 'var(--color-muted)',
            textTransform: 'uppercase', letterSpacing: '0.5px',
          }}>
            {comments.length} {comments.length === 1 ? 'Reply' : 'Replies'}
          </p>
        </div>

        {/* Comments List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
          {comments.map(comment => (
            <CommentCard key={comment.id} comment={comment} postId={postId} onReact={fetchData} />
          ))}
          {comments.length === 0 && (
            <p style={{ textAlign: 'center', padding: '20px', color: 'var(--color-muted)', fontSize: '14px' }}>
              No replies yet. Be the first to respond!
            </p>
          )}
        </div>

        {/* Comment Input - Fixed bottom */}
        <div style={{
          position: 'fixed', bottom: '68px', left: 0, right: 0,
          background: 'var(--color-white)', borderTop: '1px solid var(--color-border)',
          padding: '12px 16px', zIndex: 20,
        }}>
          <div className="content-width mx-auto" style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
            <textarea
              placeholder="Write a reply..."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              rows={1}
              style={{
                flex: 1, padding: '10px 14px', borderRadius: '20px', fontSize: '14px',
                border: '1px solid var(--color-border)', resize: 'none',
                background: 'var(--color-surface)', color: 'var(--color-slate)',
                fontFamily: 'inherit', lineHeight: 1.4, maxHeight: '80px',
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = 'auto'
                target.style.height = Math.min(target.scrollHeight, 80) + 'px'
              }}
            />
            <button
              onClick={handleComment}
              disabled={submitting || !commentText.trim()}
              style={{
                padding: '10px 18px', borderRadius: '20px', fontSize: '14px',
                border: 'none', background: 'var(--color-primary)',
                color: '#fff', cursor: submitting ? 'default' : 'pointer',
                fontWeight: 600, opacity: submitting || !commentText.trim() ? 0.5 : 1,
                flexShrink: 0,
              }}
            >
              {submitting ? '...' : 'Reply'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CommentCard({ comment, postId, onReact }: { comment: Comment; postId: string; onReact: () => void }) {
  const author = comment.ai_parent_profiles
  const [showReactionPicker, setShowReactionPicker] = useState(false)

  const handleReaction = async (emoji: string) => {
    try {
      await fetch(`/api/tribes/posts/${postId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reaction_type: emoji, comment_id: comment.id }),
      })
      setShowReactionPicker(false)
      onReact()
    } catch (err) {
      console.error('Failed to react:', err)
    }
  }

  return (
    <div style={{
      padding: '12px 14px', borderRadius: '12px', background: 'var(--color-white)',
      border: '1px solid var(--color-border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
        {author && (
          <>
            <span style={{
              fontSize: '16px', width: '28px', height: '28px', display: 'flex',
              alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            }}>
              {author.avatar_emoji}
            </span>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-slate)', flex: 1 }}>
              {author.display_name}
              {author.baby_age_desc && (
                <span style={{ fontWeight: 400, color: 'var(--color-muted)', marginLeft: '6px', fontSize: '11px' }}>
                  {author.baby_age_desc}
                </span>
              )}
            </p>
          </>
        )}
        <span style={{ fontSize: '11px', color: 'var(--color-muted)', flexShrink: 0 }}>
          {timeAgo(comment.created_at)}
        </span>
      </div>
      <p style={{ fontSize: '14px', color: 'var(--color-slate)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
        {comment.body}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', position: 'relative' }}>
        {comment.reaction_count > 0 && (
          <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
            ❤️ {comment.reaction_count}
          </span>
        )}
        <button
          onClick={() => setShowReactionPicker(!showReactionPicker)}
          style={{
            background: 'none', border: 'none', fontSize: '12px',
            color: 'var(--color-muted)', cursor: 'pointer', padding: '2px 4px',
          }}
        >
          React
        </button>
        {showReactionPicker && (
          <div style={{
            position: 'absolute', bottom: '24px', left: '0',
            display: 'flex', gap: '4px', padding: '4px 8px',
            borderRadius: '100px', background: 'var(--color-white)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10,
          }}>
            {REACTION_EMOJIS.map(emoji => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                style={{
                  fontSize: '16px', background: 'none', border: 'none',
                  cursor: 'pointer', padding: '2px',
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

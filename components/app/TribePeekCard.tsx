/**
 * @module TribePeekCard
 * @description Home feed card showing 2–3 recent posts from tribes relevant
 *   to the user's stage. Server-renderable via props. Encourages community
 *   engagement without being intrusive.
 * @version 1.0.0
 * @since March 2026
 */

import Link from 'next/link'

export interface TribePostPreview {
  id: string
  body: string
  post_type: string
  emoji_tag: string | null
  reaction_count: number
  comment_count: number
  tribe_name: string
  tribe_emoji: string
  tribe_slug: string
  author_name: string
  author_avatar: string
}

const POST_TYPE_LABELS: Record<string, string> = {
  discussion: 'Discussion',
  question:   'Question',
  tip:        'Tip',
  celebration:'🎉 Win',
  vent:       'Vent',
  poll:       'Poll',
}

const REACTION_EMOJI = '❤️'
const COMMENT_EMOJI = '💬'

export default function TribePeekCard({ posts }: { posts: TribePostPreview[] }) {
  if (!posts.length) return null

  return (
    <div
      style={{
        background: 'var(--color-white)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        marginBottom: '16px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <p
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--color-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
          }}
        >
          👥 FROM YOUR TRIBE
        </p>
        <Link
          href="/tribe"
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--color-primary)',
            textDecoration: 'none',
          }}
        >
          See all →
        </Link>
      </div>

      {/* Posts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {posts.map((post, i) => {
          const preview = post.body.length > 110
            ? post.body.slice(0, 110).trimEnd() + '…'
            : post.body

          return (
            <div key={post.id}>
              {i > 0 && (
                <div
                  style={{
                    height: '1px',
                    background: 'var(--color-border)',
                    marginBottom: '14px',
                  }}
                />
              )}
              <Link
                href={`/tribe/${post.tribe_slug}`}
                style={{ textDecoration: 'none', display: 'block' }}
              >
                {/* Author + tribe */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '6px',
                  }}
                >
                  <span style={{ fontSize: '18px', lineHeight: 1, flexShrink: 0 }}>
                    {post.author_avatar}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: 'var(--color-slate)',
                        marginRight: '6px',
                      }}
                    >
                      {post.author_name}
                    </span>
                    <span
                      style={{
                        fontSize: '12px',
                        color: 'var(--color-muted)',
                      }}
                    >
                      in {post.tribe_emoji} {post.tribe_name}
                    </span>
                  </div>
                  {post.post_type !== 'discussion' && (
                    <span
                      style={{
                        marginLeft: 'auto',
                        fontSize: '11px',
                        color: 'var(--color-muted)',
                        flexShrink: 0,
                        background: 'var(--color-surface)',
                        padding: '2px 7px',
                        borderRadius: '8px',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      {POST_TYPE_LABELS[post.post_type] ?? post.post_type}
                    </span>
                  )}
                </div>

                {/* Body preview */}
                <p
                  style={{
                    fontSize: '14px',
                    color: 'var(--color-slate)',
                    lineHeight: 1.55,
                    margin: '0 0 8px 26px',
                  }}
                >
                  {post.emoji_tag && (
                    <span style={{ marginRight: '4px' }}>{post.emoji_tag}</span>
                  )}
                  &ldquo;{preview}&rdquo;
                </p>

                {/* Reactions / comments */}
                <div
                  style={{
                    display: 'flex',
                    gap: '12px',
                    marginLeft: '26px',
                  }}
                >
                  <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                    {REACTION_EMOJI} {post.reaction_count}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                    {COMMENT_EMOJI} {post.comment_count}
                  </span>
                </div>
              </Link>
            </div>
          )
        })}
      </div>

      {/* Join prompt */}
      <div
        style={{
          marginTop: '16px',
          paddingTop: '14px',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <p style={{ fontSize: '13px', color: 'var(--color-muted)', margin: 0 }}>
          Join the conversation with other parents
        </p>
        <Link
          href="/tribe"
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--color-white)',
            background: 'var(--color-primary)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-md)',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          Explore tribes
        </Link>
      </div>
    </div>
  )
}

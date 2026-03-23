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
    <div className="bg-[var(--color-white)] border border-border rounded-lg p-5 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.8px]">
          👥 FROM YOUR TRIBE
        </p>
        <Link
          href="/tribe"
          className="text-[12px] font-semibold text-primary no-underline"
        >
          See all →
        </Link>
      </div>

      {/* Posts */}
      <div className="flex flex-col gap-[14px]">
        {posts.map((post, i) => {
          const preview = post.body.length > 110
            ? post.body.slice(0, 110).trimEnd() + '…'
            : post.body

          return (
            <div key={post.id}>
              {i > 0 && (
                <div className="h-px bg-border mb-[14px]" />
              )}
              <Link
                href={`/tribe/${post.tribe_slug}`}
                className="no-underline block"
              >
                {/* Author + tribe */}
                <div className="flex items-center gap-2 mb-[6px]">
                  <span className="text-[18px] leading-none shrink-0">
                    {post.author_avatar}
                  </span>
                  <div className="min-w-0">
                    <span className="text-[13px] font-semibold text-foreground mr-[6px]">
                      {post.author_name}
                    </span>
                    <span className="text-[12px] text-muted-foreground">
                      in {post.tribe_emoji} {post.tribe_name}
                    </span>
                  </div>
                  {post.post_type !== 'discussion' && (
                    <span className="ml-auto text-[11px] text-muted-foreground shrink-0 bg-background px-[7px] py-[2px] rounded-[8px] border border-border">
                      {POST_TYPE_LABELS[post.post_type] ?? post.post_type}
                    </span>
                  )}
                </div>

                {/* Body preview */}
                <p
                  className="text-sm text-foreground leading-[1.55] mb-2"
                  style={{ margin: '0 0 8px 26px' }}
                >
                  {post.emoji_tag && (
                    <span className="mr-1">{post.emoji_tag}</span>
                  )}
                  &ldquo;{preview}&rdquo;
                </p>

                {/* Reactions / comments */}
                <div className="flex gap-3" style={{ marginLeft: '26px' }}>
                  <span className="text-[12px] text-muted-foreground">
                    {REACTION_EMOJI} {post.reaction_count}
                  </span>
                  <span className="text-[12px] text-muted-foreground">
                    {COMMENT_EMOJI} {post.comment_count}
                  </span>
                </div>
              </Link>
            </div>
          )
        })}
      </div>

      {/* Join prompt */}
      <div className="mt-4 pt-[14px] border-t border-border flex items-center justify-between">
        <p className="text-[13px] text-muted-foreground m-0">
          Join the conversation with other parents
        </p>
        <Link
          href="/tribe"
          className="text-[13px] font-semibold text-white bg-primary px-[14px] py-[6px] rounded-md no-underline whitespace-nowrap"
        >
          Explore tribes
        </Link>
      </div>
    </div>
  )
}

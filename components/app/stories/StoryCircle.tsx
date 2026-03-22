/**
 * @module StoryCircle
 * @description Individual story circle avatar with gradient ring for unread
 *   and muted ring for viewed stories. Displays user avatar and truncated name.
 * @version 1.0.0
 * @since March 2026
 */
import Image from 'next/image'

interface StoryCircleProps {
  profileId: string
  displayName: string
  avatarUrl: string | null
  hasUnread: boolean
  storyCount: number
  onClick: () => void
}

export default function StoryCircle({
  displayName,
  avatarUrl,
  hasUnread,
  onClick,
}: StoryCircleProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 bg-transparent border-none cursor-pointer p-0 touch-manipulation"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {/* Ring container */}
      <div
        className={`relative w-[68px] h-[68px] rounded-full flex items-center justify-center shrink-0 ${
          hasUnread ? 'animate-story-ring-pulse' : ''
        }`}
        style={
          hasUnread
            ? {
                background:
                  'conic-gradient(var(--story-ring-sage), var(--story-ring-terra), var(--story-ring-sage))',
                padding: '3px',
              }
            : {
                border: '2px solid var(--story-ring-viewed)',
                opacity: 0.65,
                padding: '3px',
              }
        }
      >
        {/* Inner white ring */}
        <div className="w-full h-full rounded-full bg-white flex items-center justify-center p-[2px]">
          {/* Avatar */}
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={displayName}
              width={52}
              height={52}
              className="w-[52px] h-[52px] rounded-full object-cover"
              unoptimized
            />
          ) : (
            <div className="w-[52px] h-[52px] rounded-full bg-sage-50 flex items-center justify-center">
              <span className="text-lg font-semibold text-sage-500">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Name */}
      <span
        className="text-[11px] font-medium text-muted-foreground leading-tight text-center overflow-hidden text-ellipsis whitespace-nowrap"
        style={{ maxWidth: '60px' }}
      >
        {displayName}
      </span>
    </button>
  )
}

/**
 * @module OwnStoryCircle
 * @description User's own story circle. Shows "+" to create if no active story,
 *   or a preview thumbnail with gradient ring if stories exist.
 * @version 1.0.0
 * @since March 2026
 */

interface OwnStoryCircleProps {
  hasActiveStory: boolean
  previewUrl?: string | null
  onClick: () => void
  onComposerOpen: () => void
}

export default function OwnStoryCircle({
  hasActiveStory,
  previewUrl,
  onClick,
  onComposerOpen,
}: OwnStoryCircleProps) {
  const handleClick = () => {
    if (hasActiveStory) {
      onClick()
    } else {
      onComposerOpen()
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex flex-col items-center gap-1.5 bg-transparent border-none cursor-pointer p-0 touch-manipulation"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {/* Ring container */}
      <div
        className="relative w-[68px] h-[68px] rounded-full flex items-center justify-center shrink-0"
        style={
          hasActiveStory
            ? {
                background:
                  'conic-gradient(var(--story-ring-sage), var(--story-ring-terra), var(--story-ring-sage))',
                padding: '3px',
              }
            : {
                border: '2px dashed var(--color-border)',
                padding: '3px',
              }
        }
      >
        <div className="w-full h-full rounded-full bg-white flex items-center justify-center p-[2px]">
          {hasActiveStory && previewUrl ? (
            <img
              src={previewUrl}
              alt="Your story"
              className="w-[52px] h-[52px] rounded-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-[52px] h-[52px] rounded-full bg-sage-50 flex items-center justify-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M12 5V19M5 12H19"
                  stroke="var(--color-primary)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Label */}
      <span
        className="text-[11px] font-medium text-muted-foreground leading-tight text-center overflow-hidden text-ellipsis whitespace-nowrap"
        style={{ maxWidth: '60px' }}
      >
        Your story
      </span>
    </button>
  )
}

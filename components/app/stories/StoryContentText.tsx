/**
 * @module StoryContentText
 * @description Full-screen text story display with coloured background.
 *   Renders centred text on a solid colour with text shadow for readability.
 * @version 1.0.0
 * @since March 2026
 */

interface StoryContentTextProps {
  textContent: string
  bgColor: string | null
}

export default function StoryContentText({
  textContent,
  bgColor,
}: StoryContentTextProps) {
  return (
    <div
      className="flex-1 flex items-center justify-center rounded-lg"
      style={{ background: bgColor || 'var(--story-palette-1)' }}
    >
      <p
        className="text-white text-2xl font-semibold text-center leading-[1.45] px-4"
        style={{
          maxWidth: '280px',
          textShadow: '0 1px 8px rgba(0,0,0,0.3)',
        }}
      >
        {textContent}
      </p>
    </div>
  )
}

/**
 * @module StoryProgressBar
 * @description Multi-segment progress bar for the story viewer. Shows completed,
 *   current (filling), and future segments.
 * @version 1.0.0
 * @since March 2026
 */

interface StoryProgressBarProps {
  totalStories: number
  currentIndex: number
  progress: number // 0 to 100
}

export default function StoryProgressBar({
  totalStories,
  currentIndex,
  progress,
}: StoryProgressBarProps) {
  return (
    <div className="flex w-full gap-[3px] px-2" role="progressbar" aria-valuenow={progress}>
      {Array.from({ length: totalStories }, (_, i) => (
        <div
          key={i}
          className="flex-1 h-[2px] rounded-full overflow-hidden"
          style={{ background: 'rgba(255, 255, 255, 0.25)' }}
        >
          <div
            className="h-full rounded-full"
            style={{
              background: 'white',
              width:
                i < currentIndex
                  ? '100%'
                  : i === currentIndex
                  ? `${progress}%`
                  : '0%',
              transition: i === currentIndex ? 'width 0.1s linear' : 'none',
            }}
          />
        </div>
      ))}
    </div>
  )
}

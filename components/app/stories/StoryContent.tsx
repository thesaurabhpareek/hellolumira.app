/**
 * @module StoryContent
 * @description Content renderer that switches on story_type to render
 *   the appropriate content component (text, image, poll, question).
 * @version 1.0.0
 * @since March 2026
 */

import type { Story } from '@/types/app'
import StoryContentText from './StoryContentText'
import StoryContentImage from './StoryContentImage'
import StoryContentPoll from './StoryContentPoll'
import StoryContentQuestion from './StoryContentQuestion'

interface StoryContentProps {
  story: Story
  isOwn: boolean
  userPollVote?: 'A' | 'B' | null
  pollVotesA?: number
  pollVotesB?: number
  questionAnswers?: Array<{ answer_text: string; created_at: string }>
}

export default function StoryContent({
  story,
  isOwn,
  userPollVote = null,
  pollVotesA = 0,
  pollVotesB = 0,
  questionAnswers = [],
}: StoryContentProps) {
  switch (story.story_type) {
    case 'text':
      return (
        <StoryContentText
          textContent={story.text_content || ''}
          bgColor={story.bg_color}
        />
      )

    case 'image':
      return (
        <StoryContentImage
          imageUrl={story.image_url}
          imageCaption={story.image_caption}
        />
      )

    case 'poll':
      return (
        <StoryContentPoll
          storyId={story.id}
          pollQuestion={story.poll_question || ''}
          pollOptionA={story.poll_option_a || 'Option A'}
          pollOptionB={story.poll_option_b || 'Option B'}
          userVote={userPollVote}
          votesA={pollVotesA}
          votesB={pollVotesB}
        />
      )

    case 'question':
      return (
        <StoryContentQuestion
          storyId={story.id}
          questionPrompt={story.question_prompt || ''}
          isOwn={isOwn}
          answers={questionAnswers}
        />
      )

    default:
      return (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-white/60 text-sm">Unsupported story type</p>
        </div>
      )
  }
}

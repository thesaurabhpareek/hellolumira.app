// lib/badges.ts — Badge definitions for gamification

export interface Badge {
  id: string
  name: string
  description: string
  emoji: string
  category: 'engagement' | 'community' | 'learning' | 'parenting' | 'streaks' | 'special'
  points: number
  /** Criteria description for display */
  criteria: string
}

export const BADGES: Badge[] = [
  // ── Engagement ──
  {
    id: 'first_checkin',
    name: 'First Check-in',
    description: 'Completed your first daily check-in',
    emoji: '🌱',
    category: 'engagement',
    points: 10,
    criteria: 'Complete 1 daily check-in',
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Checked in 7 days in a row',
    emoji: '⚡',
    category: 'engagement',
    points: 50,
    criteria: 'Check in for 7 consecutive days',
  },
  {
    id: 'month_champion',
    name: 'Month Champion',
    description: '30 consecutive daily check-ins',
    emoji: '🏆',
    category: 'engagement',
    points: 200,
    criteria: 'Check in for 30 consecutive days',
  },
  {
    id: 'first_chat',
    name: 'First Conversation',
    description: 'Had your first chat with Lumira',
    emoji: '💬',
    category: 'engagement',
    points: 10,
    criteria: 'Start 1 chat thread',
  },
  {
    id: 'chats_10',
    name: 'Getting Comfortable',
    description: 'Started 10 chat threads',
    emoji: '🤝',
    category: 'engagement',
    points: 50,
    criteria: 'Start 10 chat threads',
  },

  // ── Community ──
  {
    id: 'first_post',
    name: 'First Post',
    description: 'Shared your first post in a tribe',
    emoji: '📣',
    category: 'community',
    points: 15,
    criteria: 'Create 1 tribe post',
  },
  {
    id: 'conversation_starter',
    name: 'Conversation Starter',
    description: 'Created 5 posts in tribes',
    emoji: '🗣️',
    category: 'community',
    points: 40,
    criteria: 'Create 5 tribe posts',
  },
  {
    id: 'tribe_leader',
    name: 'Tribe Leader',
    description: 'Joined 3 different tribes',
    emoji: '👑',
    category: 'community',
    points: 30,
    criteria: 'Join 3 tribes',
  },
  {
    id: 'partner_invited',
    name: 'Better Together',
    description: 'Invited your partner to Lumira',
    emoji: '👫',
    category: 'community',
    points: 20,
    criteria: 'Send a partner invite',
  },
  {
    id: 'first_share',
    name: 'Spread the Word',
    description: 'Shared Lumira with a friend',
    emoji: '💛',
    category: 'community',
    points: 15,
    criteria: 'Share your invite link',
  },

  // ── Learning ──
  {
    id: 'knowledge_seeker',
    name: 'Knowledge Seeker',
    description: 'Read 5 articles',
    emoji: '📚',
    category: 'learning',
    points: 30,
    criteria: 'Read 5 articles',
  },
  {
    id: 'quiz_master',
    name: 'Quiz Master',
    description: 'Completed 5 quizzes',
    emoji: '🧠',
    category: 'learning',
    points: 30,
    criteria: 'Complete 5 quizzes',
  },
  {
    id: 'first_article',
    name: 'Curious Mind',
    description: 'Read your first article',
    emoji: '📖',
    category: 'learning',
    points: 10,
    criteria: 'Read 1 article',
  },

  // ── Parenting ──
  {
    id: 'milestone_tracker',
    name: 'Milestone Tracker',
    description: 'Logged your first milestone',
    emoji: '🎉',
    category: 'parenting',
    points: 15,
    criteria: 'Log 1 milestone',
  },
  {
    id: 'concern_logger',
    name: 'Concern Logger',
    description: 'Completed your first concern assessment',
    emoji: '🩺',
    category: 'parenting',
    points: 15,
    criteria: 'Complete 1 concern flow',
  },
  {
    id: 'memory_keeper',
    name: 'Memory Keeper',
    description: 'Logged 5 milestones',
    emoji: '📸',
    category: 'parenting',
    points: 50,
    criteria: 'Log 5 milestones',
  },
  {
    id: 'first_journal',
    name: 'Dear Diary',
    description: 'Wrote your first journal entry',
    emoji: '📝',
    category: 'parenting',
    points: 15,
    criteria: 'Write 1 journal entry',
  },

  // ── Streaks ──
  {
    id: 'streak_3',
    name: '3-Day Streak',
    description: 'Checked in 3 days in a row',
    emoji: '🔥',
    category: 'streaks',
    points: 25,
    criteria: '3 consecutive check-ins',
  },
  {
    id: 'streak_7',
    name: '7-Day Streak',
    description: '7 consecutive daily check-ins',
    emoji: '🌟',
    category: 'streaks',
    points: 50,
    criteria: '7 consecutive check-ins',
  },
  {
    id: 'streak_30',
    name: '30-Day Streak',
    description: '30 consecutive daily check-ins',
    emoji: '💎',
    category: 'streaks',
    points: 200,
    criteria: '30 consecutive check-ins',
  },

  // ── Special ──
  {
    id: 'profile_complete',
    name: 'All Set',
    description: 'Completed your profile',
    emoji: '✅',
    category: 'special',
    points: 25,
    criteria: 'Fill in all profile fields',
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Checked in between midnight and 4am',
    emoji: '🦉',
    category: 'special',
    points: 10,
    criteria: 'Check in between midnight and 4am',
  },
  {
    id: 'early_adopter',
    name: 'Early Adopter',
    description: 'Joined Lumira in its first month',
    emoji: '⭐',
    category: 'special',
    points: 50,
    criteria: 'Sign up during launch month',
  },
]

export function getBadgeById(id: string): Badge | undefined {
  return BADGES.find(b => b.id === id)
}

export function getBadgesByCategory(category: Badge['category']): Badge[] {
  return BADGES.filter(b => b.category === category)
}

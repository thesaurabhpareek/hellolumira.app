// lib/badges.ts — Badge definitions for gamification

export interface Badge {
  id: string
  name: string
  description: string
  emoji: string
  category: 'engagement' | 'milestone' | 'community' | 'special'
  points: number
}

export const BADGES: Badge[] = [
  // Engagement
  { id: 'first_checkin', name: 'First Check-in', description: 'Completed your first daily check-in', emoji: '🌱', category: 'engagement', points: 10 },
  { id: 'streak_3', name: '3-Day Streak', description: 'Checked in 3 days in a row', emoji: '🔥', category: 'engagement', points: 25 },
  { id: 'streak_7', name: 'Week Warrior', description: '7 consecutive daily check-ins', emoji: '⚡', category: 'engagement', points: 50 },
  { id: 'streak_30', name: 'Monthly Champion', description: '30 consecutive daily check-ins', emoji: '🏆', category: 'engagement', points: 200 },
  { id: 'first_chat', name: 'First Conversation', description: 'Had your first chat with Lumira', emoji: '💬', category: 'engagement', points: 10 },
  { id: 'chats_10', name: 'Getting Comfortable', description: 'Started 10 chat threads', emoji: '🤝', category: 'engagement', points: 50 },
  // Milestones
  { id: 'first_milestone', name: 'First Milestone', description: 'Logged your first milestone', emoji: '🎉', category: 'milestone', points: 15 },
  { id: 'milestones_5', name: 'Memory Keeper', description: 'Logged 5 milestones', emoji: '📸', category: 'milestone', points: 50 },
  { id: 'first_journal', name: 'Dear Diary', description: 'Wrote your first journal entry', emoji: '📝', category: 'milestone', points: 15 },
  { id: 'first_concern', name: 'First Concern Flow', description: 'Completed your first concern assessment', emoji: '🩺', category: 'milestone', points: 15 },
  // Community
  { id: 'avatar_set', name: 'Made It Personal', description: 'Selected your avatar', emoji: '🎨', category: 'community', points: 5 },
  { id: 'partner_invited', name: 'Better Together', description: 'Invited your partner to Lumira', emoji: '👫', category: 'community', points: 20 },
  { id: 'first_share', name: 'Spread the Word', description: 'Shared Lumira with a friend', emoji: '💛', category: 'community', points: 15 },
  // Special
  { id: 'night_owl', name: 'Night Owl', description: 'Checked in between midnight and 4am', emoji: '🦉', category: 'special', points: 10 },
  { id: 'early_adopter', name: 'Early Adopter', description: 'Joined Lumira in its first month', emoji: '⭐', category: 'special', points: 50 },
]

export function getBadgeById(id: string): Badge | undefined {
  return BADGES.find(b => b.id === id)
}

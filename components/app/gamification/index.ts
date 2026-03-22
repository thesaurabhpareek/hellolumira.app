/**
 * @module gamification
 * @description Barrel export for all gamification components.
 *   Import from '@/components/app/gamification' for clean imports.
 * @version 1.0.0
 * @since March 2026
 */

export { default as StreakCounter } from './StreakCounter'
export { default as SeedsDisplay } from './SeedsDisplay'
export { default as AchievementCard, AchievementGrid } from './AchievementCard'
export { default as AchievementUnlock } from './AchievementUnlock'
export { default as LevelRing } from './LevelRing'
export { default as DailyChallenge } from './DailyChallenge'
export { default as LeaderboardRow, Leaderboard } from './LeaderboardRow'
export { default as MilestoneTimeline } from './MilestoneTimeline'
export { default as Confetti } from './Confetti'

// Re-export types
export type { Achievement, AchievementTier } from './AchievementCard'
export type { Challenge } from './DailyChallenge'
export type { LeaderboardEntry } from './LeaderboardRow'
export type { TimelineMilestone } from './MilestoneTimeline'

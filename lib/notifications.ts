/**
 * @module Notifications
 * @description Server-side notification creation with rate limiting (max 5/day),
 *   reaction batching, default emoji/priority mappings, and automatic 14-day
 *   expiry. All notification mutations go through this module to enforce
 *   consistent business rules.
 * @version 1.0.0
 * @since March 2026
 */

import { createClient } from '@/lib/supabase/server'
import type { NotificationType, NotificationPriority } from '@/types/app'

const DEFAULT_EMOJIS: Record<NotificationType, string> = {
  pattern_detected: '📊',
  concern_followup: '📋',
  escalation_reminder: '⚡',
  milestone_approaching: '🎉',
  weekly_guide_ready: '🌱',
  tribe_reply: '💬',
  tribe_reaction: '❤️',
  tribe_mention: '💬',
  partner_joined: '👫',
  streak_at_risk: '🔥',
  badge_earned: '🏆',
  new_article: '📖',
  system_message: '🔔',
}

const DEFAULT_PRIORITIES: Record<NotificationType, NotificationPriority> = {
  pattern_detected: 1,
  concern_followup: 1,
  escalation_reminder: 1,
  milestone_approaching: 2,
  weekly_guide_ready: 2,
  tribe_reply: 2,
  tribe_reaction: 3,
  tribe_mention: 2,
  partner_joined: 2,
  streak_at_risk: 1,
  badge_earned: 2,
  new_article: 3,
  system_message: 2,
}

/** Returns the default emoji for a notification type. */
export function getDefaultEmoji(type: NotificationType): string {
  return DEFAULT_EMOJIS[type]
}

/** Returns the default priority (1=high, 3=low) for a notification type. */
export function getDefaultPriority(type: NotificationType): NotificationPriority {
  return DEFAULT_PRIORITIES[type]
}

interface CreateNotificationOptions {
  baby_id?: string
  emoji?: string
  action_url?: string
  priority?: NotificationPriority
  source_type?: string
  source_id?: string
  expires_at?: string
}

interface CreateNotificationResult {
  success: boolean
  notification_id?: string
  error?: string
}

export async function createNotification(
  profile_id: string,
  type: NotificationType,
  title: string,
  body: string,
  options: CreateNotificationOptions = {}
): Promise<CreateNotificationResult> {
  // Guard: required fields
  if (!profile_id || typeof profile_id !== 'string') {
    return { success: false, error: 'profile_id is required' }
  }
  if (!type || typeof type !== 'string') {
    return { success: false, error: 'type is required' }
  }
  // Validate notification type against allowed list
  const VALID_TYPES: NotificationType[] = [
    'pattern_detected', 'concern_followup', 'escalation_reminder',
    'milestone_approaching', 'weekly_guide_ready',
    'tribe_reply', 'tribe_reaction', 'tribe_mention',
    'partner_joined', 'streak_at_risk', 'badge_earned',
    'new_article', 'system_message',
  ]
  if (!VALID_TYPES.includes(type)) {
    return { success: false, error: `Invalid notification type: ${type}` }
  }
  if (!title || typeof title !== 'string' || !title.trim()) {
    return { success: false, error: 'title is required and must be a non-empty string' }
  }
  if (!body || typeof body !== 'string' || !body.trim()) {
    return { success: false, error: 'body is required and must be a non-empty string' }
  }

  // Guard: truncate very long title/body to prevent DB issues
  const MAX_TITLE_LENGTH = 200
  const MAX_BODY_LENGTH = 2000
  const sanitizedTitle = title.slice(0, MAX_TITLE_LENGTH)
  const sanitizedBody = body.slice(0, MAX_BODY_LENGTH)

  try {
    const supabase = await createClient()

    // Enforce max 5 notifications per day per profile
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const { count: todayCount } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('profile_id', profile_id)
      .gte('created_at', todayStart.toISOString())

    if ((todayCount ?? 0) >= 5) {
      return { success: false, error: 'Daily notification limit reached (5 per day)' }
    }

    // Batch tribe_reaction notifications: if there's an existing unread notification
    // for the same source, update it instead of creating a new one
    if (type === 'tribe_reaction' && options.source_type && options.source_id) {
      const { data: existing } = await supabase
        .from('notifications')
        .select('id, title, body')
        .eq('profile_id', profile_id)
        .eq('type', 'tribe_reaction')
        .eq('source_type', options.source_type)
        .eq('source_id', options.source_id)
        .eq('is_read', false)
        .eq('is_dismissed', false)
        .maybeSingle()

      if (existing) {
        // Update the existing notification with new title/body (batched count)
        const { error: updateError } = await supabase
          .from('notifications')
          .update({
            title: sanitizedTitle,
            body: sanitizedBody,
            created_at: new Date().toISOString(),
          })
          .eq('id', existing.id)

        if (updateError) {
          return { success: false, error: updateError.message }
        }

        return { success: true, notification_id: existing.id }
      }
    }

    // Set defaults
    const emoji = options.emoji ?? getDefaultEmoji(type)
    const priority = options.priority ?? getDefaultPriority(type)

    // Default expiry: 14 days from now
    const defaultExpiry = new Date()
    defaultExpiry.setDate(defaultExpiry.getDate() + 14)
    const expires_at = options.expires_at ?? defaultExpiry.toISOString()

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        profile_id,
        baby_id: options.baby_id ?? null,
        type,
        title: sanitizedTitle,
        body: sanitizedBody,
        emoji,
        action_url: options.action_url ?? null,
        is_read: false,
        is_dismissed: false,
        read_at: null,
        source_type: options.source_type ?? null,
        source_id: options.source_id ?? null,
        priority,
        expires_at,
      })
      .select('id')
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, notification_id: data.id }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error creating notification'
    console.error('[createNotification] Error:', message)
    return { success: false, error: message }
  }
}

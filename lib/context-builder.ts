/**
 * @module ContextBuilder
 * @description Assembles a structured text block of contextual data for Claude
 *   system prompts. All six Supabase queries run in parallel via Promise.all()
 *   to minimise latency. The output feeds into the MASTER_SYSTEM_PROMPT so
 *   Claude has full awareness of the baby's stage, recent check-ins, patterns,
 *   and parent emotional state.
 * @version 1.0.0
 * @since March 2026
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { getBabyAgeInfo, getTimeOfDay } from './baby-age'
import type { BabyProfile, Profile, DailyCheckin } from '@/types/app'

// Module-level cache: key = `${userId}:${babyId}`, value = { context: string, cachedAt: number }
const contextCache = new Map<string, { context: string; cachedAt: number }>()
const CONTEXT_TTL_MS = 5 * 60 * 1000 // 5 minutes

/**
 * Builds a multi-line context string for Claude system prompts.
 *
 * Fetches baby profile, parent profiles, weekly summary, recent check-ins,
 * latest concern session, and pattern observations — all in a single
 * parallelised Promise.all() to avoid sequential N+1 queries.
 *
 * @param supabase             - Authenticated Supabase client (inherits caller's RLS context).
 * @param baby_id              - UUID of the baby profile.
 * @param requesting_profile_id - UUID of the parent making the request.
 * @returns A formatted string block suitable for injection into a system prompt.
 * @throws If the baby profile is not found.
 */
export async function buildContextBlock(
  supabase: SupabaseClient,
  baby_id: string,
  requesting_profile_id: string
): Promise<string> {
  const cacheKey = `${requesting_profile_id}:${baby_id}`
  const cached = contextCache.get(cacheKey)
  if (cached && Date.now() - cached.cachedAt < CONTEXT_TTL_MS) {
    return cached.context
  }

  // Parallel fetch all context data
  const [babyRes, membersRes, summaryRes, checkinsRes, concernRes, patternsRes] =
    await Promise.all([
      supabase.from('baby_profiles').select('id, name, due_date, date_of_birth, stage, planning_sub_option, planning_expected_month').eq('id', baby_id).single(),
      supabase
        .from('baby_profile_members')
        .select('profile_id, profiles(id, first_name, first_time_parent, emotional_state_latest)')
        .eq('baby_id', baby_id),
      supabase
        .from('weekly_summaries')
        .select('content')
        .eq('baby_id', baby_id)
        .order('generated_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('daily_checkins')
        .select('checkin_date, sleep_quality, feeding, mood, nausea_level, energy_level, kept_food_down, emotional_signal')
        .eq('baby_id', baby_id)
        .order('checkin_date', { ascending: false })
        .limit(6),
      supabase
        .from('concern_sessions')
        .select('concern_type, created_at, ai_summary')
        .eq('baby_id', baby_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('pattern_observations')
        .select('pattern_type, message_text, triggered_at')
        .eq('baby_id', baby_id)
        .order('triggered_at', { ascending: false })
        .limit(5),
    ])

  if (!babyRes.data) throw new Error('Baby profile not found')
  const baby = babyRes.data as BabyProfile
  const info = getBabyAgeInfo(baby)
  const tod = getTimeOfDay()

  type PartialProfile = Pick<Profile, 'id' | 'first_name' | 'first_time_parent' | 'emotional_state_latest'>
  const profiles: PartialProfile[] = (membersRes.data || [])
    .map((m: { profile_id: string; profiles: PartialProfile | PartialProfile[] }) =>
      Array.isArray(m.profiles) ? m.profiles[0] : m.profiles
    )
    .filter(Boolean)

  const currentParent = profiles.find((p) => p.id === requesting_profile_id)
  const otherParent = profiles.find((p) => p.id !== requesting_profile_id)
  const checkins = (checkinsRes.data || []) as DailyCheckin[]
  const summary = summaryRes.data?.content || null
  const latestConcern = concernRes.data
  const patterns = patternsRes.data || []

  const lines: string[] = []

  if (baby.stage === 'planning') {
    const subLabels: Record<string, string> = {
      trying_naturally: 'trying to conceive naturally',
      ivf_fertility: 'going through IVF/fertility treatment',
      adopting: 'in the adoption process',
      surrogacy: 'using a surrogate',
      exploring: 'exploring options',
    }
    const pathDesc = baby.planning_sub_option ? subLabels[baby.planning_sub_option] || 'planning' : 'planning a baby'
    lines.push(`Planning stage: ${pathDesc}`)
    if (baby.planning_expected_month) {
      lines.push(`Hoping to welcome baby around: ${baby.planning_expected_month}`)
    }
  } else if (baby.stage === 'pregnancy') {
    lines.push(`Pregnancy: Week ${info.pregnancy_week || '?'} of 40 (due ${baby.due_date || 'unknown'})`)
  } else {
    const ageDetail = (info.age_in_months ?? 0) < 3
      ? `${info.age_in_weeks ?? 0} weeks old`
      : `${info.age_in_months ?? 0} months old (${info.age_in_weeks ?? 0} weeks)`
    lines.push(`Baby: ${baby.name || 'Baby'}, ${ageDetail}`)
  }

  lines.push(
    `Parents: ${currentParent?.first_name || 'Parent'} (current)${otherParent ? ` and ${otherParent.first_name}` : ''}`,
    `First-time parents: ${currentParent?.first_time_parent ? 'Yes' : 'No'}`
  )

  if (summary) {
    lines.push('\nThis week\'s summary:')
    const s = summary as Record<string, string>
    Object.entries(s).forEach(([k, v]) => {
      if (typeof v === 'string') lines.push(`  ${k.replace(/_/g, ' ')}: ${v}`)
    })
  } else {
    lines.push('\nThis week\'s summary: Not yet generated')
  }

  if (checkins.length > 0) {
    lines.push(`\nLast ${checkins.length} check-ins:`)
    for (const c of checkins) {
      if (baby.stage === 'pregnancy') {
        lines.push(
          `  ${c.checkin_date}: nausea=${c.nausea_level || 'n/a'}, energy=${c.energy_level || 'n/a'}, kept_food=${c.kept_food_down ?? 'n/a'}`
        )
      } else {
        lines.push(
          `  ${c.checkin_date}: sleep=${c.sleep_quality || 'n/a'}, feeding=${c.feeding || 'n/a'}, mood=${c.mood || 'n/a'}`
        )
      }
    }
  }

  if (latestConcern) {
    const concernDate = latestConcern.created_at?.split('T')[0] ?? 'unknown date'
    lines.push(`\nMost recent concern: ${latestConcern.concern_type} (${concernDate})`)
  }

  if (patterns.length > 0) {
    lines.push('\nRecent pattern flags:')
    patterns.forEach((p: { pattern_type: string; message_text: string }) =>
      lines.push(`  - ${p.pattern_type}: ${p.message_text}`)
    )
  }

  lines.push(`\n${currentParent?.first_name || 'Parent'}'s emotional state: ${currentParent?.emotional_state_latest || 'unknown'}`)
  if (otherParent) {
    lines.push(`${otherParent.first_name}'s emotional state: ${otherParent.emotional_state_latest || 'unknown'}`)
  }
  lines.push(
    `Current session parent: ${currentParent?.first_name || 'Parent'}`,
    `Time of day: ${tod.display} (${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })})`
  )

  const result = lines.join('\n')

  contextCache.set(cacheKey, { context: result, cachedAt: Date.now() })
  // Prevent unbounded growth
  if (contextCache.size > 500) {
    const oldestKey = contextCache.keys().next().value
    if (oldestKey) contextCache.delete(oldestKey)
  }

  return result
}

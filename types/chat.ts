// types/chat.ts — Chat module types

export type ConcernCategory =
  | 'sleep' | 'feeding' | 'crying' | 'digestion' | 'teething'
  | 'illness' | 'development' | 'skin' | 'safety'
  | 'mental_health_parent' | 'cultural_practice'
  | 'general' | 'emergency' | 'multiple'

export type EscalationLevel = 'none' | 'monitor' | 'call_doctor' | 'urgent' | 'emergency'

export type ChatRole = 'user' | 'assistant'

export type RedFlagCategory =
  | 'breathing_emergency' | 'choking' | 'seizure' | 'high_fever_newborn'
  | 'unresponsive' | 'severe_bleeding' | 'head_injury' | 'ingestion_poison'
  | 'severe_allergic_reaction' | 'reduced_fetal_movement'
  | 'preterm_labor_signs' | 'suicidal_ideation'

export type ChatThread = {
  id: string
  baby_id: string
  profile_id: string
  title: string | null
  primary_concern_category: ConcernCategory | null
  highest_escalation_level: EscalationLevel
  message_count: number
  last_message_at: string | null
  is_archived: boolean
  source_concern_session_id: string | null
  source_checkin_id: string | null
  created_at: string
  updated_at: string
}

export type ChatMessage = {
  id: string
  thread_id: string
  role: ChatRole
  content: string
  concern_category: ConcernCategory | null
  escalation_level: EscalationLevel
  red_flag_detected: boolean
  red_flag_pattern: string | null
  is_structured_response: boolean
  model_version: string | null
  input_tokens: number | null
  output_tokens: number | null
  created_at: string
}

export type RedFlagResult = {
  level: EscalationLevel
  category: RedFlagCategory | null
  pattern: string | null
  /** @deprecated Use immediate_action. Kept for backward compatibility. */
  immediateAction: string | null
  /** snake_case canonical name */
  immediate_action: string | null
  /** @deprecated Use pre_authored_message. Kept for backward compatibility. */
  preAuthoredMessage: string | null
  /** snake_case canonical name */
  pre_authored_message: string | null
  /** @deprecated Use action_url. Kept for backward compatibility. */
  actionUrl: string | null
  /** snake_case canonical name */
  action_url: string | null
  severity: 'emergency' | 'urgent' | 'same_day' | null
  /** Deterministic guidance text to inject into system prompt. Null if no specific guidance. */
  guidance_text: string | null
}

export type ChatSuggestedPrompt = {
  id: string
  label: string
  message: string
  concern_category: ConcernCategory
  applicable_stages: string[]
}

export const ESCALATION_CONFIG: Record<EscalationLevel, {
  label: string
  colour: string
  icon: string
  cardType: 'standard' | 'watch' | 'escalate' | 'emergency'
}> = {
  none:        { label: 'Normal',             colour: 'sage',  icon: '',  cardType: 'standard' },
  monitor:     { label: 'Keep an eye on',     colour: 'amber', icon: '',  cardType: 'watch' },
  call_doctor: { label: 'Call pediatrician',  colour: 'rose',  icon: '',  cardType: 'escalate' },
  urgent:      { label: 'Seek help today',    colour: 'rose',  icon: '',  cardType: 'escalate' },
  emergency:   { label: 'Emergency',          colour: 'red',   icon: '',  cardType: 'emergency' },
}

export type Stage = 'pregnancy' | 'infant' | 'toddler'
export type EmotionalSignal = 'ok' | 'tired' | 'struggling' | 'distressed'

export type Profile = {
  id: string
  first_name: string
  first_time_parent: boolean
  first_checkin_complete: boolean
  emotional_state_latest: EmotionalSignal | null
  emotional_state_updated_at: string | null
  partner_invite_email: string | null
  created_at: string
  updated_at: string
}

export type BabyProfile = {
  id: string
  name: string | null
  due_date: string | null
  date_of_birth: string | null
  stage: Stage
  pending_proactive_type: PatternType | null
  pending_proactive_set_at: string | null
  created_by_profile_id: string
  created_at: string
}

export type BabyAgeInfo = {
  stage: Stage
  pregnancy_week?: number
  trimester?: 1 | 2 | 3
  days_until_due?: number
  age_in_weeks?: number
  age_in_months?: number
  age_display_string: string
}

export type DailyCheckin = {
  id: string
  baby_id: string
  profile_id: string
  stage: Stage
  checkin_date: string
  sleep_quality: 'poor' | 'ok' | 'good' | null
  night_wakings: number | null
  feeding: 'less' | 'normal' | 'more' | null
  mood: 'calm' | 'fussy' | 'very_fussy' | null
  diapers: 'normal' | 'fewer' | 'more' | 'unusual' | null
  nausea_level: 'none' | 'mild' | 'moderate' | 'severe' | null
  energy_level: 'low' | 'ok' | 'good' | null
  symptoms_log: string[] | null
  kept_food_down: boolean | null
  concern_text: string | null
  conversation_log: ConversationMessage[] | null
  emotional_signal: EmotionalSignal | null
  created_at: string
  updated_at: string
}

export type ConversationMessage = {
  role: 'lumira' | 'parent'
  content: string
  timestamp: string
}

export type StructuredField = {
  id: string
  label: string
  options: { value: string; label: string; emoji?: string }[]
}

export type StructuredFieldGroup = {
  group_label: string
  fields: StructuredField[]
}

export type ConcernType =
  | 'morning_sickness' | 'prenatal_symptoms' | 'reduced_fetal_movement'
  | 'prenatal_anxiety' | 'birth_preparation'
  | 'feeding_drop' | 'crying_increase' | 'sleep_regression'
  | 'constipation' | 'fever' | 'teething' | 'other'

export type ConcernQuestion = {
  id: string
  text: string
  /** @deprecated Use input_type. Kept for backward compatibility. */
  inputType: 'single_choice' | 'multi_choice' | 'scale' | 'free_text'
  /** snake_case canonical name */
  input_type: 'single_choice' | 'multi_choice' | 'scale' | 'free_text'
  options?: { value: string; label: string }[]
  scale_min_label?: string
  scale_max_label?: string
}

export type ConcernFlow = {
  id: ConcernType
  stage: Stage | 'both'
  label: string
  intro: string
  questions: ConcernQuestion[]
}

export type ConcernAnswer = {
  question_id: string
  question_text: string
  answer: string | string[]
}

export type AISummary = {
  likely_causes: string[]
  try_first: string[]
  monitor: string[]
  escalate_when: string[]
}

export type ConcernSession = {
  id: string
  baby_id: string
  profile_id: string
  stage: Stage
  concern_type: ConcernType
  answers: ConcernAnswer[]
  ai_summary: AISummary
  follow_up_due: string | null
  follow_up_sent: boolean
  created_at: string
}

export type PatternType =
  | 'sleep' | 'feeding' | 'mood' | 'concern_followup' | 'milestone_proximity'
  | 'parent_gap' | 'partner_divergence' | 'nausea_severity'
  | 'prenatal_anxiety' | 'appointment_proximity'

export type PatternObservation = {
  id: string
  baby_id: string
  profile_id: string
  pattern_type: PatternType
  message_text: string
  triggered_at: string
}

export type WeeklyGuideContent = {
  opening: string
  baby_development?: string
  body_changes?: string[]
  what_is_happening?: string
  what_you_might_notice?: string[]
  whats_usually_normal: string[]
  focus_this_week: string[]
  watch_outs: string[]
}

export type MilestoneType =
  | 'first_scan' | 'anatomy_scan' | 'first_kick' | 'third_trimester' | 'birth_plan_done'
  | 'rolling' | 'sitting' | 'crawling' | 'pulling_to_stand' | 'first_word'
  | 'pincer_grip' | 'walking' | 'other'

export type Milestone = {
  id: string
  baby_id: string
  profile_id: string
  stage: Stage
  milestone_type: MilestoneType
  milestone_date: string
  notes: string | null
  created_at: string
}

export type JournalEntry = {
  id: string
  profile_id: string
  body: string
  entry_date: string
  created_at: string
}

export type PregnancyAppointment = {
  id: string
  baby_id: string
  profile_id: string
  appointment_type: string
  appointment_date: string
  notes: string | null
  prep_message_sent: boolean
  created_at: string
}

export type ConsentType =
  | 'terms_of_service' | 'privacy_policy' | 'data_processing' | 'sensitive_data'
  | 'community_guidelines' | 'acceptable_use' | 'ai_data_practices'
  | 'marketing_email' | 'marketing_sms' | 'marketing_whatsapp'
  | 'analytics' | 'product_improvement' | 'third_party_sharing'

export type ConsentRecord = {
  id: string
  profile_id: string
  consent_type: ConsentType
  action: 'granted' | 'withdrawn'
  capture_method: 'onboarding_explicit' | 'settings_explicit' | 'settings_toggle' | 'api'
  user_agent?: string | null
  document_version: string
  ip_address: string | null
  page_url: string
  created_at: string
}

export type PrivacyPreferences = {
  id: string
  profile_id: string
  ai_processing_enabled: boolean
  analytics_enabled: boolean
  product_improvement_enabled: boolean
  data_retention_months: 12 | 24 | 36
  gdpr_applicable: boolean
  ccpa_applicable: boolean
  updated_at: string
}

export type CommunicationPreferences = {
  id: string
  profile_id: string
  email_enabled: boolean
  email_daily_checkin: boolean
  email_pattern_alerts: boolean
  email_weekly_guide: boolean
  email_concern_followup: boolean
  whatsapp_enabled: boolean
  sms_enabled: boolean
  checkin_hour: number
  timezone: string
  quiet_hours_start: number
  quiet_hours_end: number
  updated_at: string
}

export type DataExportRequest = {
  id: string
  profile_id: string
  status: 'pending' | 'generating' | 'ready' | 'expired'
  download_url: string | null
  requested_at: string
  completed_at: string | null
  expires_at: string | null
}

export type DataDeletionRequest = {
  id: string
  profile_id: string
  request_type: 'full_deletion' | 'partial_deletion'
  status: 'pending' | 'processing' | 'completed'
  requested_at: string
  completed_at: string | null
}

export type TimeOfDay = 'early_morning' | 'late_morning' | 'afternoon' | 'evening' | 'late_night'

export type WeeklySummary = {
  id: string
  baby_id: string
  week_number: number
  year: number
  content: Record<string, unknown>
  generated_at: string
}

export type NotificationType =
  | 'pattern_detected' | 'concern_followup' | 'escalation_reminder'
  | 'milestone_approaching' | 'weekly_guide_ready'
  | 'tribe_reply' | 'tribe_reaction' | 'tribe_mention'
  | 'partner_joined' | 'streak_at_risk' | 'badge_earned'
  | 'new_article' | 'system_message'

export type NotificationPriority = 1 | 2 | 3

export type Notification = {
  id: string
  profile_id: string
  baby_id: string | null
  type: NotificationType
  title: string
  body: string
  emoji: string | null
  action_url: string | null
  is_read: boolean
  is_dismissed: boolean
  read_at: string | null
  source_type: string | null
  source_id: string | null
  priority: NotificationPriority
  expires_at: string | null
  created_at: string
}

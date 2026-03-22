'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeftIcon, CheckIcon } from '@/components/icons'

// ── Option definitions ────────────────────────────────────────────────────

const PRONOUNS_OPTIONS = [
  { value: 'she/her', label: 'She/Her' },
  { value: 'he/him', label: 'He/Him' },
  { value: 'they/them', label: 'They/Them' },
  { value: 'he/they', label: 'He/They' },
  { value: 'she/they', label: 'She/They' },
  { value: 'custom', label: 'Custom' },
]

const PARENTING_STYLE_OPTIONS = [
  { value: 'attachment', label: 'Attachment' },
  { value: 'gentle', label: 'Gentle' },
  { value: 'authoritative', label: 'Authoritative' },
  { value: 'permissive', label: 'Permissive' },
  { value: 'helicopter', label: 'Helicopter' },
  { value: 'free-range', label: 'Free-Range' },
  { value: 'montessori', label: 'Montessori' },
  { value: 'exploring', label: 'Still Exploring' },
  { value: 'other', label: 'Other' },
]

const FEEDING_METHOD_OPTIONS = [
  { value: 'breastfeeding', label: 'Breastfeeding' },
  { value: 'formula', label: 'Formula' },
  { value: 'combo', label: 'Combo' },
  { value: 'pumping', label: 'Pumping' },
  { value: 'solids', label: 'Solids' },
  { value: 'other', label: 'Other' },
]

const BIRTH_TYPE_OPTIONS = [
  { value: 'vaginal', label: 'Vaginal' },
  { value: 'c-section', label: 'C-Section' },
  { value: 'vbac', label: 'VBAC' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
]

const WORK_STATUS_OPTIONS = [
  { value: 'stay-at-home', label: 'Stay-at-home' },
  { value: 'working-full-time', label: 'Full-time' },
  { value: 'working-part-time', label: 'Part-time' },
  { value: 'on-leave', label: 'On leave' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'other', label: 'Other' },
]

const INTEREST_OPTIONS = [
  { value: 'sleep', label: 'Sleep' },
  { value: 'feeding', label: 'Feeding' },
  { value: 'development', label: 'Development' },
  { value: 'mental_health', label: 'Mental Health' },
  { value: 'finances', label: 'Finances' },
  { value: 'relationships', label: 'Relationships' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'nutrition', label: 'Nutrition' },
  { value: 'education', label: 'Education' },
  { value: 'travel', label: 'Travel' },
  { value: 'self-care', label: 'Self-Care' },
  { value: 'career', label: 'Career' },
]

const LOOKING_FOR_OPTIONS = [
  { value: 'advice', label: 'Advice' },
  { value: 'friends', label: 'Friends' },
  { value: 'support', label: 'Support' },
  { value: 'information', label: 'Information' },
  { value: 'fun', label: 'Fun' },
  { value: 'accountability', label: 'Accountability' },
  { value: 'local_meetups', label: 'Local Meetups' },
  { value: 'shared_experiences', label: 'Shared Experiences' },
]

// ── Types ──────────────────────────────────────────────────────────────────

interface ProfileFormData {
  first_name: string
  display_name: string
  pronouns: string
  location_city: string
  bio: string
  birth_month: string
  parenting_style: string
  feeding_method: string
  birth_type: string
  number_of_children: string
  languages_spoken: string
  work_status: string
  interests: string[]
  looking_for: string[]
}

const EMPTY_FORM: ProfileFormData = {
  first_name: '',
  display_name: '',
  pronouns: '',
  location_city: '',
  bio: '',
  birth_month: '',
  parenting_style: '',
  feeding_method: '',
  birth_type: '',
  number_of_children: '',
  languages_spoken: '',
  work_status: '',
  interests: [],
  looking_for: [],
}

// ── Component ──────────────────────────────────────────────────────────────

export default function ProfileEditPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const focusField = searchParams.get('focus')

  const [form, setForm] = useState<ProfileFormData>(EMPTY_FORM)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [seedsEarned, setSeedsEarned] = useState(0)

  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  // Load current profile
  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('first_name, display_name, pronouns, location_city, bio, birth_month, parenting_style, feeding_method, birth_type, number_of_children, languages_spoken, work_status, interests, looking_for')
        .eq('id', user.id)
        .single()

      if (data) {
        setForm({
          first_name: data.first_name || '',
          display_name: data.display_name || '',
          pronouns: data.pronouns || '',
          location_city: data.location_city || '',
          bio: data.bio || '',
          birth_month: data.birth_month || '',
          parenting_style: data.parenting_style || '',
          feeding_method: data.feeding_method || '',
          birth_type: data.birth_type || '',
          number_of_children: data.number_of_children != null ? String(data.number_of_children) : '',
          languages_spoken: data.languages_spoken || '',
          work_status: data.work_status || '',
          interests: data.interests || [],
          looking_for: data.looking_for || [],
        })
      }
      setLoading(false)
    }
    load()
  }, [router])

  // Auto-scroll to focused field
  useEffect(() => {
    if (!loading && focusField && fieldRefs.current[focusField]) {
      setTimeout(() => {
        fieldRefs.current[focusField]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 200)
    }
  }, [loading, focusField])

  const handleChange = (field: keyof ProfileFormData, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const toggleArrayItem = (field: 'interests' | 'looking_for', value: string) => {
    setForm((prev) => {
      const arr = prev[field]
      const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]
      return { ...prev, [field]: next }
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload: Record<string, unknown> = {
        first_name: form.first_name || null,
        display_name: form.display_name || null,
        pronouns: form.pronouns || null,
        location_city: form.location_city || null,
        bio: form.bio || null,
        birth_month: form.birth_month || null,
        parenting_style: form.parenting_style || null,
        feeding_method: form.feeding_method || null,
        birth_type: form.birth_type || null,
        number_of_children: form.number_of_children ? parseInt(form.number_of_children, 10) : null,
        languages_spoken: form.languages_spoken || null,
        work_status: form.work_status || null,
        interests: form.interests,
        looking_for: form.looking_for,
      }

      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json()
        showToast(err.error || 'Failed to save', 'error')
        return
      }

      const result = await res.json()
      if (result.seeds_earned > 0) {
        setSeedsEarned(result.seeds_earned)
        showToast(`Saved! You earned ${result.seeds_earned} seeds!`)
      } else {
        showToast('Profile saved successfully!')
      }
    } catch {
      showToast('Something went wrong. Please try again.', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          background: 'var(--color-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            border: '3px solid var(--color-border)',
            borderTopColor: 'var(--color-primary)',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--color-surface)',
        paddingBottom: '120px',
      }}
    >
      <div className="content-width mx-auto px-4 pt-6">
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
          }}
        >
          <Link
            href="/profile"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              color: '#3D8178',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
              padding: '16px 0',
            }}
          >
            <ArrowLeftIcon size={16} color="#3D8178" /> Back
          </Link>

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 20px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: saving ? '#E5E7EB' : '#3D8178',
              color: saving ? '#9CA3AF' : '#FFFFFF',
              fontSize: '14px',
              fontWeight: 600,
              cursor: saving ? 'default' : 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {saving ? 'Saving...' : (
              <>
                <CheckIcon size={16} color="#FFFFFF" />
                Save
              </>
            )}
          </button>
        </div>

        <h1
          className="text-h1 mb-2"
          style={{ color: 'var(--color-slate)' }}
        >
          Edit Profile
        </h1>
        <p
          style={{
            fontSize: '14px',
            color: 'var(--color-muted)',
            marginBottom: '28px',
            lineHeight: 1.5,
          }}
        >
          All fields are optional. Share as much or as little as you like.
        </p>

        {/* ── Section: About You ──────────────────────────── */}
        <SectionHeader title="About You" />

        <div ref={(el) => { fieldRefs.current['first_name'] = el }}>
          <FormField label="First Name" highlight={focusField === 'first_name'}>
            <TextInput
              value={form.first_name}
              onChange={(v) => handleChange('first_name', v)}
              placeholder="Your first name"
              maxLength={100}
            />
          </FormField>
        </div>

        <div ref={(el) => { fieldRefs.current['display_name'] = el }}>
          <FormField label="Display Name" highlight={focusField === 'display_name'}>
            <TextInput
              value={form.display_name}
              onChange={(v) => handleChange('display_name', v)}
              placeholder="How others will see you"
              maxLength={100}
            />
          </FormField>
        </div>

        <div ref={(el) => { fieldRefs.current['pronouns'] = el }}>
          <FormField label="Pronouns" highlight={focusField === 'pronouns'}>
            <SelectInput
              value={form.pronouns}
              onChange={(v) => handleChange('pronouns', v)}
              options={PRONOUNS_OPTIONS}
              placeholder="Select pronouns"
            />
          </FormField>
        </div>

        <div ref={(el) => { fieldRefs.current['bio'] = el }}>
          <FormField label="Bio" highlight={focusField === 'bio'}>
            <BioInput
              value={form.bio}
              onChange={(v) => handleChange('bio', v)}
              placeholder="Tell us a little about yourself..."
              maxLength={280}
            />
          </FormField>
        </div>

        <div ref={(el) => { fieldRefs.current['location_city'] = el }}>
          <FormField label="City" highlight={focusField === 'location_city'}>
            <TextInput
              value={form.location_city}
              onChange={(v) => handleChange('location_city', v)}
              placeholder="e.g. San Francisco"
              maxLength={100}
            />
          </FormField>
        </div>

        <div ref={(el) => { fieldRefs.current['birth_month'] = el }}>
          <FormField label="Your Birth Month" hint="For age context" highlight={focusField === 'birth_month'}>
            <MonthInput
              value={form.birth_month}
              onChange={(v) => handleChange('birth_month', v)}
            />
          </FormField>
        </div>

        {/* ── Section: Parenting Context ─────────────────── */}
        <SectionHeader title="Parenting Context" />

        <div ref={(el) => { fieldRefs.current['parenting_style'] = el }}>
          <FormField label="Parenting Style" highlight={focusField === 'parenting_style'}>
            <SelectInput
              value={form.parenting_style}
              onChange={(v) => handleChange('parenting_style', v)}
              options={PARENTING_STYLE_OPTIONS}
              placeholder="Select a style"
            />
          </FormField>
        </div>

        <div ref={(el) => { fieldRefs.current['feeding_method'] = el }}>
          <FormField label="Feeding Method" highlight={focusField === 'feeding_method'}>
            <SelectInput
              value={form.feeding_method}
              onChange={(v) => handleChange('feeding_method', v)}
              options={FEEDING_METHOD_OPTIONS}
              placeholder="Select method"
            />
          </FormField>
        </div>

        <div ref={(el) => { fieldRefs.current['birth_type'] = el }}>
          <FormField label="Birth Type" highlight={focusField === 'birth_type'}>
            <SelectInput
              value={form.birth_type}
              onChange={(v) => handleChange('birth_type', v)}
              options={BIRTH_TYPE_OPTIONS}
              placeholder="Select type"
            />
          </FormField>
        </div>

        <div ref={(el) => { fieldRefs.current['number_of_children'] = el }}>
          <FormField label="Number of Children" highlight={focusField === 'number_of_children'}>
            <TextInput
              value={form.number_of_children}
              onChange={(v) => handleChange('number_of_children', v)}
              placeholder="e.g. 1"
              maxLength={2}
              inputMode="numeric"
            />
          </FormField>
        </div>

        <div ref={(el) => { fieldRefs.current['languages_spoken'] = el }}>
          <FormField label="Languages Spoken" hint="At home" highlight={focusField === 'languages_spoken'}>
            <TextInput
              value={form.languages_spoken}
              onChange={(v) => handleChange('languages_spoken', v)}
              placeholder="e.g. English, Spanish"
              maxLength={200}
            />
          </FormField>
        </div>

        <div ref={(el) => { fieldRefs.current['work_status'] = el }}>
          <FormField label="Work Status" highlight={focusField === 'work_status'}>
            <SelectInput
              value={form.work_status}
              onChange={(v) => handleChange('work_status', v)}
              options={WORK_STATUS_OPTIONS}
              placeholder="Select status"
            />
          </FormField>
        </div>

        {/* ── Section: Interests & Community ──────────────── */}
        <SectionHeader title="Interests & Community" />

        <div ref={(el) => { fieldRefs.current['interests'] = el }}>
          <FormField label="Topics You Care About" highlight={focusField === 'interests'}>
            <ChipMultiSelect
              options={INTEREST_OPTIONS}
              selected={form.interests}
              onToggle={(v) => toggleArrayItem('interests', v)}
            />
          </FormField>
        </div>

        <div ref={(el) => { fieldRefs.current['looking_for'] = el }}>
          <FormField label="What You're Looking For" highlight={focusField === 'looking_for'}>
            <ChipMultiSelect
              options={LOOKING_FOR_OPTIONS}
              selected={form.looking_for}
              onToggle={(v) => toggleArrayItem('looking_for', v)}
            />
          </FormField>
        </div>

        {/* ── Sticky Save Button ─────────────────────────── */}
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '16px 20px',
            paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
            background: 'linear-gradient(to top, var(--color-surface) 80%, transparent)',
            zIndex: 50,
          }}
        >
          <div className="content-width mx-auto">
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: 'var(--radius-lg)',
                border: 'none',
                background: saving ? '#E5E7EB' : '#3D8178',
                color: saving ? '#9CA3AF' : '#FFFFFF',
                fontSize: '16px',
                fontWeight: 700,
                cursor: saving ? 'default' : 'pointer',
                transition: 'all 0.15s ease',
                minHeight: '52px',
                boxShadow: '0 -2px 16px rgba(0,0,0,0.08)',
              }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '90px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: toast.type === 'success' ? 'var(--color-slate)' : '#DC2626',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: '100px',
            fontSize: '14px',
            fontWeight: 500,
            zIndex: 100,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            maxWidth: '90vw',
            textAlign: 'center',
            animation: 'toast-in 0.3s ease',
          }}
        >
          {seedsEarned > 0 && toast.type === 'success' && (
            <span style={{ fontSize: '16px' }}>🌱</span>
          )}
          {toast.message}
        </div>
      )}

      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateX(-50%) translateY(10px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <div
      style={{
        padding: '20px 0 12px',
        marginTop: '8px',
      }}
    >
      <p
        style={{
          fontSize: '13px',
          fontWeight: 700,
          color: 'var(--color-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        {title}
      </p>
    </div>
  )
}

function FormField({
  label,
  hint,
  highlight,
  children,
}: {
  label: string
  hint?: string
  highlight?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        padding: '16px',
        marginBottom: '2px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--color-white)',
        border: highlight ? '2px solid #3D8178' : '1px solid var(--color-border)',
        transition: 'border-color 0.3s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '8px' }}>
        <label
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--color-slate)',
          }}
        >
          {label}
        </label>
        {hint && (
          <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

function TextInput({
  value,
  onChange,
  placeholder,
  maxLength,
  inputMode,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  maxLength?: number
  inputMode?: 'text' | 'numeric'
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      inputMode={inputMode}
      style={{
        width: '100%',
        padding: '10px 14px',
        borderRadius: 'var(--radius-md)',
        border: '1.5px solid var(--color-border)',
        background: 'var(--color-surface)',
        fontSize: '15px',
        color: 'var(--color-slate)',
        outline: 'none',
        minHeight: '44px',
        transition: 'border-color 0.15s ease',
      }}
      onFocus={(e) => { e.target.style.borderColor = '#3D8178' }}
      onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)' }}
    />
  )
}

function BioInput({
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  maxLength: number
}) {
  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        placeholder={placeholder}
        rows={3}
        style={{
          width: '100%',
          padding: '10px 14px',
          borderRadius: 'var(--radius-md)',
          border: '1.5px solid var(--color-border)',
          background: 'var(--color-surface)',
          fontSize: '15px',
          color: 'var(--color-slate)',
          outline: 'none',
          resize: 'vertical',
          minHeight: '80px',
          fontFamily: 'inherit',
          lineHeight: 1.5,
          transition: 'border-color 0.15s ease',
        }}
        onFocus={(e) => { e.target.style.borderColor = '#3D8178' }}
        onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)' }}
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: '4px',
        }}
      >
        <span
          style={{
            fontSize: '12px',
            color: value.length >= maxLength * 0.9 ? '#DC2626' : 'var(--color-muted)',
            fontWeight: value.length >= maxLength * 0.9 ? 600 : 400,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {value.length}/{maxLength}
        </span>
      </div>
    </div>
  )
}

function SelectInput({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  placeholder: string
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%',
        padding: '10px 14px',
        borderRadius: 'var(--radius-md)',
        border: '1.5px solid var(--color-border)',
        background: 'var(--color-surface)',
        fontSize: '15px',
        color: value ? 'var(--color-slate)' : 'var(--color-muted)',
        outline: 'none',
        minHeight: '44px',
        appearance: 'none',
        WebkitAppearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%239CA3AF' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 14px center',
        paddingRight: '40px',
        cursor: 'pointer',
        transition: 'border-color 0.15s ease',
      }}
      onFocus={(e) => { e.target.style.borderColor = '#3D8178' }}
      onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)' }}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

function MonthInput({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  return (
    <input
      type="month"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%',
        padding: '10px 14px',
        borderRadius: 'var(--radius-md)',
        border: '1.5px solid var(--color-border)',
        background: 'var(--color-surface)',
        fontSize: '15px',
        color: value ? 'var(--color-slate)' : 'var(--color-muted)',
        outline: 'none',
        minHeight: '44px',
        fontFamily: 'inherit',
        transition: 'border-color 0.15s ease',
      }}
      onFocus={(e) => { e.target.style.borderColor = '#3D8178' }}
      onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)' }}
    />
  )
}

function ChipMultiSelect({
  options,
  selected,
  onToggle,
}: {
  options: { value: string; label: string }[]
  selected: string[]
  onToggle: (value: string) => void
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {options.map((opt) => {
        const isSelected = selected.includes(opt.value)
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onToggle(opt.value)}
            style={{
              padding: '8px 16px',
              borderRadius: '100px',
              border: isSelected ? '2px solid #3D8178' : '1.5px solid var(--color-border)',
              background: isSelected ? '#3D817815' : 'var(--color-surface)',
              color: isSelected ? '#3D8178' : 'var(--color-slate)',
              fontSize: '14px',
              fontWeight: isSelected ? 600 : 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              minHeight: '38px',
              whiteSpace: 'nowrap',
            }}
          >
            {isSelected && (
              <span style={{ marginRight: '4px' }}>
                <CheckIcon size={14} color="#3D8178" />
              </span>
            )}
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

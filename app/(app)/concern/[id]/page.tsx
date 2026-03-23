// app/(app)/concern/[id]/page.tsx — Concern flow
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ConcernStepCard from '@/components/app/ConcernStepCard'
import LoadingScreen from '@/components/app/LoadingScreen'
import type { ConcernFlow, ConcernAnswer, ConcernQuestion } from '@/types/app'

const FLOW_MAP: Record<string, string> = {
  morning_sickness: 'morning-sickness',
  prenatal_symptoms: 'prenatal-symptoms',
  reduced_fetal_movement: 'reduced-fetal-movement',
  prenatal_anxiety: 'prenatal-anxiety',
  birth_preparation: 'birth-preparation',
  feeding_drop: 'feeding-drop',
  crying_increase: 'crying-increase',
  sleep_regression: 'sleep-regression',
  constipation: 'constipation',
  fever: 'fever',
  teething: 'teething',
}

export default function ConcernFlowPage() {
  const router = useRouter()
  const params = useParams()
  const concernId = params.id as string

  const [flow, setFlow] = useState<ConcernFlow | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [babyId, setBabyId] = useState<string | null>(null)
  const [profileId, setProfileId] = useState<string | null>(null)
  const [stage, setStage] = useState<string>('infant')

  useEffect(() => {
    const loadData = async () => {
      // Load concern flow JSON
      const fileName = FLOW_MAP[concernId] || concernId
      try {
        const flowModule = await import(`@/lib/concern-flows/${fileName}.json`)
        setFlow(flowModule.default as ConcernFlow)
      } catch {
        setError("We couldn't load your concern details. Check your connection and try again.")
        setLoading(false)
        return
      }

      // Load user/baby context
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setProfileId(user.id)

      const { data: memberData } = await supabase
        .from('baby_profile_members')
        .select('baby_id')
        .eq('profile_id', user.id)
        .limit(1)
        .maybeSingle()

      if (memberData?.baby_id) {
        setBabyId(memberData.baby_id)
        const { data: babyData } = await supabase
          .from('baby_profiles')
          .select('stage')
          .eq('id', memberData.baby_id)
          .single()
        if (babyData) setStage(babyData.stage)
      }

      setLoading(false)
    }

    loadData()
  }, [concernId, router])

  const handleAnswer = (questionId: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const currentQuestion: ConcernQuestion | null = flow?.questions[currentStep] ?? null

  const canProceed = currentQuestion
    ? answers[currentQuestion.id] !== undefined &&
      answers[currentQuestion.id] !== '' &&
      (Array.isArray(answers[currentQuestion.id])
        ? (answers[currentQuestion.id] as string[]).length > 0
        : true)
    : false

  const handleNext = () => {
    if (!flow) return
    if (currentStep < flow.questions.length - 1) {
      setCurrentStep((s) => s + 1)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1)
    } else {
      router.back()
    }
  }

  const handleSubmit = async () => {
    if (!flow || !babyId || !profileId) return
    setSubmitting(true)
    setError('')

    const formattedAnswers: ConcernAnswer[] = flow.questions.map((q) => ({
      question_id: q.id,
      question_text: q.text,
      answer: answers[q.id] ?? '',
    }))

    const attempt = async () => {
      const res = await fetch('/api/concern-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baby_id: babyId,
          profile_id: profileId,
          stage,
          concern_type: concernId,
          answers: formattedAnswers,
        }),
      })
      if (!res.ok) throw new Error('Failed to get summary')
      return res.json()
    }

    try {
      const data = await attempt()
      router.push(`/concern/${concernId}/summary?session=${data.session_id}`)
    } catch {
      try {
        await new Promise((r) => setTimeout(r, 1000))
        const data = await attempt()
        router.push(`/concern/${concernId}/summary?session=${data.session_id}`)
      } catch {
        setError("The summary isn't ready yet — tap to try again.")
        setSubmitting(false)
      }
    }
  }

  if (loading) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--color-surface)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div className="shimmer" style={{ width: '200px', height: '20px', borderRadius: '8px', marginBottom: '12px' }} />
          <div className="shimmer" style={{ width: '300px', height: '16px', borderRadius: '8px' }} />
        </div>
      </div>
    )
  }

  if (error || !flow) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--color-surface)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        <div className="lumira-card content-width" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--color-red)', marginBottom: '16px' }}>
            {error || 'Concern flow not found.'}
          </p>
          <button onClick={() => router.push('/concern')} className="btn-primary">
            Back to concerns
          </button>
        </div>
      </div>
    )
  }

  const totalSteps = flow.questions.length
  const progress = ((currentStep + 1) / totalSteps) * 100

  if (submitting) {
    return <LoadingScreen variant="full" message="Putting together your summary..." />
  }

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-surface)',
        paddingBottom: '32px',
      }}
    >
      <div className="content-width mx-auto px-4 pt-6">
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <button
              onClick={handleBack}
              aria-label="Go back"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#3D8178',
                fontSize: '14px',
                fontWeight: 600,
                padding: '16px 0',
                minHeight: '48px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              &larr; Back
            </button>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: '4px' }}>
                {flow.label} · Step {currentStep + 1} of {totalSteps}
              </p>
              <div
                role="progressbar"
                aria-valuenow={currentStep + 1}
                aria-valuemin={1}
                aria-valuemax={totalSteps}
                aria-label={`Step ${currentStep + 1} of ${totalSteps}`}
                style={{
                  height: '4px',
                  background: 'var(--color-border)',
                  borderRadius: '2px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${progress}%`,
                    background: 'var(--color-primary)',
                    borderRadius: '2px',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Intro (only on first step) */}
          {currentStep === 0 && (
            <div
              className="animate-fade-in"
              style={{
                background: 'var(--color-primary-light)',
                border: '1px solid var(--color-primary-mid)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
                marginBottom: '16px',
              }}
            >
              <p style={{ fontSize: '15px', color: 'var(--color-primary)', lineHeight: 1.6 }}>
                {flow.intro}
              </p>
            </div>
          )}
        </div>

        {/* Current question */}
        {currentQuestion && (
          <div className="animate-fade-in">
            <ConcernStepCard
              question={currentQuestion}
              answer={answers[currentQuestion.id] ?? null}
              onChange={(v) => handleAnswer(currentQuestion.id, v)}
            />
          </div>
        )}

        {error && (
          <div
            style={{
              background: 'var(--color-red-light)',
              border: '1px solid #FEB2B2',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              marginTop: '16px',
              color: 'var(--color-red)',
              fontSize: '14px',
            }}
          >
            {error}
          </div>
        )}

        {/* Navigation */}
        <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
          <button onClick={handleBack} className="btn-ghost" style={{ flex: '0 0 80px' }}>
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={!canProceed}
            className="btn-primary"
          >
            {currentStep === totalSteps - 1 ? 'Get my summary →' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}

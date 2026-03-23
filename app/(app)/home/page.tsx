// app/(app)/home/page.tsx — Home screen (server component)
import type React from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getBabyAgeInfo } from '@/lib/baby-age'
import { getDailyQuestion, getDailyQuiz } from '@/lib/home-feed-data'
import WeekNavigator from '@/components/app/WeekNavigator'
import DismissiblePatternFlag from '@/components/app/DismissiblePatternFlag'
import PregnancyProgressBadge from '@/components/app/PregnancyProgressBadge'
import ProfilePromptCard from '@/components/app/ProfilePromptCard'
import ShareCard from '@/components/app/ShareCard'
import GreetingHeader from '@/components/app/GreetingHeader'
import ArticleInsightCard from '@/components/app/ArticleInsightCard'
import TribePeekCard from '@/components/app/TribePeekCard'
import DailyQuestionCard from '@/components/app/DailyQuestionCard'
import QuizCard from '@/components/app/QuizCard'
import UpcomingMilestonesCard from '@/components/app/UpcomingMilestonesCard'
import SeedsBalancePill from '@/components/app/SeedsBalancePill'
import ThemeToggleButton from '@/components/app/ThemeToggleButton'
import BugReportButton from '@/components/app/BugReportButton'
import StageHeroCard from '@/components/app/StageHeroCard'
import StoryStrip from '@/components/app/stories/StoryStrip'
import { ClipboardIcon, ChatIcon, EditIcon, QuizIcon, CheckIcon } from '@/components/icons'
import type { Profile, BabyProfile, DailyCheckin, PatternType, Stage } from '@/types/app'
import type { TribePostPreview } from '@/components/app/TribePeekCard'
import type { ArticleInsightProps } from '@/components/app/ArticleInsightCard'

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch profile and baby membership in parallel
  const [{ data: profileData }, { data: memberData }] = await Promise.all([
    supabase.from('profiles').select('id, first_name, first_time_parent, first_checkin_complete, emotional_state_latest, seeds_balance, current_streak').eq('id', user.id).single(),
    supabase.from('baby_profile_members').select('baby_id').eq('profile_id', user.id).limit(1).maybeSingle(),
  ])

  if (!profileData?.first_name) redirect('/onboarding')
  if (!memberData?.baby_id) redirect('/onboarding')

  const profile = profileData as unknown as Profile

  // Fetch baby profile with specific columns
  const { data: babyData } = await supabase
    .from('baby_profiles')
    .select('id, name, due_date, date_of_birth, stage, planning_sub_option, planning_expected_month, pending_proactive_type, pending_proactive_set_at')
    .eq('id', memberData.baby_id)
    .single()

  if (!babyData) redirect('/onboarding')

  const baby = babyData as BabyProfile
  const ageInfo = getBabyAgeInfo(baby)

  const guideKey = {
    stage: baby.stage,
    week_or_month: Math.max(1,
      baby.stage === 'planning'
        ? 1
        : baby.stage === 'pregnancy'
        ? (ageInfo.pregnancy_week ?? 1)
        : baby.stage === 'infant'
        ? (ageInfo.age_in_weeks ?? 1)
        : (ageInfo.age_in_months ?? 1)),
  }

  // Fetch checkin, articles, and tribe data in parallel (all depend on baby)
  const today = new Date().toISOString().split('T')[0]
  const [
    { data: checkinData },
    { data: articleRows },
    { data: tribeRows },
  ] = await Promise.all([
    supabase
      .from('daily_checkins')
      .select('id, checkin_date, sleep_quality, feeding, mood, emotional_signal, night_wakings, nausea_level, energy_level')
      .eq('baby_id', baby.id)
      .gte('checkin_date', new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0])
      .order('checkin_date', { ascending: false })
      .limit(3),

    // Fetch articles matched to user's stage.
    // Fetch a broad pool (no week ordering) so the in-memory proximity sort can
    // find articles genuinely close to the user's current week/month.
    // Previously this was ordered ascending + limit(10) which always returned
    // the earliest (newborn) articles regardless of the user's actual age.
    supabase
      .from('content_articles')
      .select('id, title, subtitle, category, reading_time_minutes, tags, week_or_month, stage, applicable_stages')
      .or(baby.stage === 'planning'
        ? `stage.eq.planning,stage.eq.pregnancy,applicable_stages.cs.{${baby.stage}}`
        : `stage.eq.${baby.stage},applicable_stages.cs.{${baby.stage}}`)
      .limit(200),

    // Fetch tribes for the user's stage
    supabase
      .from('tribes')
      .select('id, name, emoji, slug')
      .or(`stage_filter.eq.${baby.stage},stage_filter.eq.any,stage_filter.is.null`)
      .eq('is_active', true)
      .limit(5),
  ])

  const recentCheckins = (checkinData as DailyCheckin[] | null) ?? []
  const todayCheckin = recentCheckins.find(c => c.checkin_date === today) ?? null

  // Pick the most relevant article (closest to current week/month, rotate daily)
  let featuredArticle: ArticleInsightProps | null = null
  if (articleRows?.length) {
    const currentWOM = guideKey.week_or_month
    // Score: penalise articles behind the user's age more than ahead
    // (slight look-ahead is useful; outdated newborn content is not)
    const scored = articleRows.map(a => {
      const wom = a.week_or_month ?? 0
      const delta = wom - currentWOM
      // Articles up to 4 weeks/months ahead score as if they're at distance 0
      // Articles behind score at full distance penalty
      const dist = delta >= 0 && delta <= 4 ? 0 : Math.abs(delta)
      return { article: a, dist }
    })
    scored.sort((a, b) => a.dist - b.dist)
    // Take top-7 closest, rotate among them daily for freshness
    const candidates = scored.slice(0, 7).map(s => s.article)
    const start = new Date(new Date().getFullYear(), 0, 0)
    const dayOfYear = Math.floor((Date.now() - start.getTime()) / 86_400_000)
    const picked = candidates[dayOfYear % candidates.length]
    featuredArticle = {
      id: picked.id,
      title: picked.title,
      subtitle: picked.subtitle ?? null,
      category: picked.category,
      reading_time_minutes: picked.reading_time_minutes,
      tags: picked.tags ?? [],
    }
  }

  // Fetch tribe posts for matching tribes
  let tribePosts: TribePostPreview[] = []
  if (tribeRows?.length) {
    const tribeIds = tribeRows.map((t) => t.id)
    const tribeMap = Object.fromEntries(tribeRows.map((t) => [t.id, t]))

    const { data: postRows } = await supabase
      .from('tribe_posts')
      .select('id, tribe_id, body, post_type, emoji_tag, reaction_count, comment_count, ai_profile_id')
      .in('tribe_id', tribeIds)
      .order('created_at', { ascending: false })
      .limit(6)

    if (postRows?.length) {
      // Fetch AI author names/avatars for all posts in one query
      const aiProfileIds = postRows
        .filter((p) => p.ai_profile_id)
        .map((p) => p.ai_profile_id as string)
        .filter(Boolean)

      const aiProfileMap: Record<string, { display_name: string; avatar_emoji: string }> = {}
      if (aiProfileIds.length) {
        const { data: aiRows } = await supabase
          .from('ai_parent_profiles')
          .select('id, display_name, avatar_emoji')
          .in('id', aiProfileIds)

        for (const row of aiRows ?? []) {
          aiProfileMap[row.id] = { display_name: row.display_name, avatar_emoji: row.avatar_emoji }
        }
      }

      tribePosts = postRows.slice(0, 3).map((post) => {
        const tribe = tribeMap[post.tribe_id]
        const ai = post.ai_profile_id ? (aiProfileMap[post.ai_profile_id] ?? null) : null
        return {
          id: post.id,
          body: post.body,
          post_type: post.post_type,
          emoji_tag: post.emoji_tag ?? null,
          reaction_count: post.reaction_count ?? 0,
          comment_count: post.comment_count ?? 0,
          tribe_name: tribe?.name ?? 'Community',
          tribe_emoji: tribe?.emoji ?? '👥',
          tribe_slug: tribe?.slug ?? 'community',
          author_name: ai?.display_name ?? 'Community member',
          author_avatar: ai?.avatar_emoji ?? '👤',
        }
      })
    }
  }

  // Pending proactive pattern message
  const pendingType = baby.pending_proactive_type as PatternType | null
  let pendingMessage = ''
  if (pendingType) {
    const messageMap: Record<PatternType, string> = {
      sleep: `${baby.name || 'Baby'}'s sleep has been rough for a few days. Want to talk through it?`,
      feeding: `I've noticed some changes in feeding patterns. Let's take a look.`,
      mood: `${baby.name || 'Baby'} has been quite fussy lately. Want to chat about it?`,
      concern_followup: `Following up on a recent concern — how are things going?`,
      milestone_proximity: `There's a developmental milestone coming up. Ready to check in?`,
      parent_gap: `It's been a while since your last check-in. How are you doing?`,
      partner_divergence: `You and your partner seem to be seeing things differently. Let's talk.`,
      nausea_severity: `You've had severe nausea for a few days. Worth a check-in.`,
      prenatal_anxiety: `You've been having a tough time emotionally. I'm here to listen.`,
      appointment_proximity: `You have an appointment coming up. Any questions to prepare?`,
    }
    pendingMessage = messageMap[pendingType] || 'Something caught my attention — want to chat?'
  }

  // Clear pending proactive type (awaited to ensure it completes in server component)
  if (pendingType) {
    await supabase
      .from('baby_profiles')
      .update({ pending_proactive_type: null, pending_proactive_set_at: null })
      .eq('id', baby.id)
  }

  // Daily rotating question + quiz (computed server-side, no extra DB calls)
  const dailyQuestion = getDailyQuestion(baby.stage as Stage)
  const dailyQuiz = getDailyQuiz(baby.stage as Stage)

  const tips = getStageTips(baby.stage, guideKey.week_or_month, baby.name)

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-surface)',
        paddingBottom: '24px',
      }}
    >
      <div className="content-width mx-auto px-4 pt-6">

        {/* ── Greeting + Seeds pill + theme toggle ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <GreetingHeader firstName={profile.first_name} />
          <div style={{ flexShrink: 0, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ThemeToggleButton />
            <SeedsBalancePill balance={profile.seeds_balance ?? 0} />
          </div>
        </div>
        <p
          style={{
            fontSize: '15px',
            color: 'var(--color-muted)',
            marginBottom: '20px',
            lineHeight: 1.5,
          }}
        >
          {getAgeSubtitle(baby, ageInfo)}
        </p>

        {/* ── Story strip ── */}
        <StoryStrip />

        {/* ── Stage hero card — personalised content overview ── */}
        <StageHeroCard
          stage={baby.stage}
          babyName={baby.name}
          planningSubOption={baby.planning_sub_option}
        />

        {/* ── Stage badge ── */}
        {baby.stage === 'pregnancy' && ageInfo.pregnancy_week && (
          <PregnancyProgressBadge
            week={ageInfo.pregnancy_week}
            trimester={ageInfo.trimester ?? 1}
            dueDate={baby.due_date ?? ''}
          />
        )}

        {/* ── Pattern flag ── */}
        {pendingType && pendingMessage && (
          <DismissiblePatternFlag type={pendingType} message={pendingMessage} />
        )}

        {/* ── First check-in CTA ── */}
        {!profile.first_checkin_complete && !todayCheckin && (
          <Link
            href="/checkin"
            style={{ textDecoration: 'none', display: 'block', marginBottom: '16px' }}
          >
            <div
              style={{
                background: 'linear-gradient(135deg, var(--color-primary), var(--sage-400))',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                color: '#FFFFFF',
              }}
            >
              <p style={{ fontSize: '17px', fontWeight: 700, marginBottom: '6px' }}>
                Start your first check-in
              </p>
              <p style={{ fontSize: '14px', opacity: 0.9, lineHeight: 1.5, marginBottom: '14px' }}>
                It takes 2 minutes. Lumira learns your patterns over time to give you better, personalised guidance.
              </p>
              <span
                style={{
                  display: 'inline-block',
                  padding: '8px 20px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                Let&apos;s go &rarr;
              </span>
            </div>
          </Link>
        )}

        {/* ── Today's check-in status ── */}
        {todayCheckin && (
          <div
            style={{
              background: 'var(--color-green-light)',
              border: '1px solid var(--color-green)',
              borderRadius: 'var(--radius-lg)',
              padding: '14px 20px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <CheckIcon size={20} color="var(--color-green)" />
            <p style={{ color: 'var(--color-green)', fontWeight: 600, fontSize: '15px' }}>
              You checked in today — nice!
            </p>
          </div>
        )}

        {/* ── Quick action cards ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '10px',
            marginBottom: '20px',
          }}
        >
          <QuickAction
            href="/checkin"
            icon={<ClipboardIcon size={24} color="var(--color-primary)" />}
            label="How are you?"
            bgColor="var(--color-primary-light)"
            borderColor="var(--color-primary-mid)"
            textColor="var(--color-primary)"
          />
          <QuickAction
            href="/chat"
            icon={<ChatIcon size={24} color="var(--color-accent)" />}
            label="Talk to Lumira"
            bgColor="var(--color-accent-light)"
            borderColor="var(--color-accent)"
            textColor="var(--color-accent)"
          />
          <QuickAction
            href="/concern"
            icon={<EditIcon size={24} color="var(--color-red)" />}
            label="Log a concern"
            bgColor="var(--error-bg)"
            borderColor="var(--error-border)"
            textColor="var(--error-text)"
          />
        </div>

        {/* ── Upcoming milestones & celebrations (not relevant for planning stage) ── */}
        {baby.stage !== 'planning' && (
          <UpcomingMilestonesCard babyId={baby.id} babyName={baby.name} />
        )}

        {/* ── Article insight ── */}
        {featuredArticle && <ArticleInsightCard {...featuredArticle} />}

        {/* ── Browse weekly guides (not relevant for planning stage) ── */}
        {baby.stage !== 'planning' && (
          <WeekNavigator
            stage={guideKey.stage}
            currentWeekOrMonth={guideKey.week_or_month}
            babyName={baby.name ?? undefined}
          />
        )}

        {/* ── Daily reflection question ── */}
        <DailyQuestionCard
          question={dailyQuestion.question}
          chatPrompt={dailyQuestion.chatPrompt}
          babyId={baby.id}
        />

        {/* ── Tribe peek ── */}
        {tribePosts.length > 0 && <TribePeekCard posts={tribePosts} />}

        {/* ── Quick quiz ── */}
        <QuizCard
          question={dailyQuiz.question}
          options={dailyQuiz.options}
          answerIndex={dailyQuiz.answerIndex}
          explanation={dailyQuiz.explanation}
        />

        {/* ── Full quiz CTA ── */}
        <Link
          href="/quiz"
          style={{
            display: 'block',
            textAlign: 'center',
            padding: '14px 20px',
            background: 'var(--color-white)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--color-primary)',
            textDecoration: 'none',
            marginBottom: '16px',
            transition: 'all 0.15s ease',
            minHeight: '48px',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <QuizIcon size={18} color="var(--color-primary)" />
            Test yourself &rarr;
          </span>
        </Link>

        {/* ── Stage tips ── */}
        {tips.length > 0 && (
          <div className="lumira-card" style={{ marginBottom: '16px' }}>
            <p
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--color-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '14px',
              }}
            >
              Tips for this stage
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {tips.map((tip, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '12px 14px',
                    background: 'var(--color-surface)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <span style={{ fontSize: '18px', lineHeight: 1, flexShrink: 0, marginTop: '1px' }}>
                    {tip.icon}
                  </span>
                  <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--color-slate)', margin: 0 }}>
                    {tip.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Profile prompt — show when profile has incomplete fields ── */}
        {profile.first_time_parent === null && (
          <ProfilePromptCard missingItem="Tell us a bit more about yourself" />
        )}

        {/* ── Share card ── */}
        <ShareCard />
      </div>

      {/* ── Bottom sticky bar ── */}
      <div
        style={{
          position: 'fixed',
          bottom: 'calc(56px + max(0px, env(safe-area-inset-bottom)))',
          left: 0,
          right: 0,
          background: 'var(--color-white)',
          borderTop: '1px solid var(--color-border)',
          padding: '12px 16px',
          zIndex: 50,
        }}
      >
        <div className="content-width mx-auto" style={{ display: 'flex', gap: '12px' }}>
          <Link
            href={baby.stage === 'planning' ? '/chat' : '/checkin'}
            className="btn-primary"
            style={{ flex: 1, fontSize: '14px' }}
          >
            {baby.stage === 'planning' ? 'Talk to Lumira \u2192' : 'Check in \u2192'}
          </Link>
          <Link
            href={baby.stage === 'planning' ? '/content' : '/concern'}
            style={{
              flex: 1,
              height: '52px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--color-border)',
              background: 'var(--color-white)',
              color: 'var(--color-slate)',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            }}
          >
            {baby.stage === 'planning' ? 'Browse articles \u2192' : 'Something\u2019s on my mind \u2192'}
          </Link>
        </div>
      </div>

      {/* Bug report floating button */}
      <BugReportButton userEmail={user.email} userName={profile.first_name} />
    </div>
  )
}

/* ── Helper: Quick action card ── */
function QuickAction({
  href, icon, label, bgColor, borderColor, textColor,
}: {
  href: string; icon: React.ReactNode; label: string
  bgColor: string; borderColor: string; textColor: string
}) {
  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '16px 8px',
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: 'var(--radius-lg)',
        textDecoration: 'none',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>{icon}</span>
      <span style={{ fontSize: '12px', fontWeight: 600, color: textColor, textAlign: 'center', lineHeight: 1.3 }}>
        {label}
      </span>
    </Link>
  )
}

/* ── Helper: Age subtitle under greeting ── */
function getAgeSubtitle(baby: BabyProfile, ageInfo: ReturnType<typeof getBabyAgeInfo>): string {
  if (baby.stage === 'planning') {
    return ageInfo.age_display_string
  }

  if (baby.stage === 'pregnancy' && ageInfo.pregnancy_week) {
    const trimesterLabel = ageInfo.trimester === 1 ? 'First' : ageInfo.trimester === 2 ? 'Second' : 'Third'
    return `${trimesterLabel} trimester · Week ${ageInfo.pregnancy_week}`
  }

  const name = baby.name || 'Baby'

  if (ageInfo.age_in_months !== undefined && ageInfo.age_in_weeks !== undefined) {
    // 0-3 months: show weeks (parents think in weeks for early infancy)
    if (ageInfo.age_in_months < 3) {
      if (ageInfo.age_in_weeks === 0) return `${name} is a newborn`
      return `${name} is ${ageInfo.age_in_weeks} ${ageInfo.age_in_weeks === 1 ? 'week' : 'weeks'} old`
    }
    // 3-12 months: show months
    if (ageInfo.age_in_months < 12) {
      return `${name} is ${ageInfo.age_in_months} months old`
    }
    // 12-24 months: show years and months
    if (ageInfo.age_in_months < 24) {
      const remainingMonths = ageInfo.age_in_months % 12
      if (remainingMonths === 0) return `${name} is 1 year old`
      return `${name} is 1 year and ${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'} old`
    }
    // 24+ months: show years
    const years = Math.floor(ageInfo.age_in_months / 12)
    const remainingMonths = ageInfo.age_in_months % 12
    if (remainingMonths === 0) return `${name} is ${years} years old`
    return `${name} is ${years} years and ${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'} old`
  }

  return ageInfo.age_display_string
}

/* ── Helper: Stage-appropriate tips ── */
function getStageTips(stage: Stage, weekOrMonth: number, babyName: string | null): { icon: string; text: string }[] {
  const name = babyName || 'baby'

  if (stage === 'planning') {
    return [
      { icon: '\uD83D\uDC8A', text: 'Start taking folic acid (400\u2013800mcg daily) at least 1\u20133 months before trying to conceive.' },
      { icon: '\uD83C\uDFE5', text: 'Schedule a preconception health check with your GP or midwife.' },
      { icon: '\uD83D\uDCB0', text: 'Start a baby savings fund \u2014 even small contributions add up over time.' },
      { icon: '\uD83E\uDDE0', text: 'Talk openly with your partner about expectations, fears, and excitement.' },
    ]
  }

  if (stage === 'pregnancy') {
    if (weekOrMonth <= 12) return [
      { icon: '\uD83E\uDD22', text: 'Nausea is common in the first trimester. Small, frequent meals can help.' },
      { icon: '\uD83D\uDCA7', text: 'Stay hydrated \u2014 aim for 8\u201310 glasses of water a day.' },
      { icon: '\uD83D\uDE34', text: 'Fatigue is normal right now. Rest when you can, guilt-free.' },
    ]
    if (weekOrMonth <= 27) return [
      { icon: '\uD83C\uDFC3', text: 'Gentle exercise like walking or prenatal yoga can ease aches and boost mood.' },
      { icon: '\uD83D\uDC76', text: `You may start feeling ${name === 'baby' ? 'the baby' : name} kick soon \u2014 such an exciting milestone.` },
      { icon: '\uD83D\uDCCB', text: 'This is a good time to start thinking about your birth preferences.' },
    ]
    return [
      { icon: '\uD83C\uDFE5', text: 'Pack your hospital bag by week 36 \u2014 better early than rushed.' },
      { icon: '\uD83D\uDCA4', text: 'Sleep on your side with a pillow between your knees for comfort.' },
      { icon: '\uD83D\uDCC6', text: 'Discuss your birth plan with your provider at your next appointment.' },
    ]
  }

  if (stage === 'infant') {
    if (weekOrMonth <= 4) return [
      { icon: '\uD83D\uDECC', text: `${name === 'baby' ? 'Baby' : name} may sleep 14\u201317 hours a day in short bursts \u2014 that\u2019s normal.` },
      { icon: '\uD83C\uDF7C', text: 'Feed on demand. Look for hunger cues like rooting or lip-smacking.' },
      { icon: '\uD83E\uDDE1', text: 'Skin-to-skin contact helps regulate temperature and bonding.' },
    ]
    if (weekOrMonth <= 12) return [
      { icon: '\uD83D\uDCAA', text: `Tummy time helps ${name === 'baby' ? 'baby' : name} build neck and core strength.` },
      { icon: '\uD83D\uDE0A', text: 'Social smiles usually appear around 6\u20138 weeks \u2014 keep talking and making faces.' },
      { icon: '\uD83C\uDF19', text: 'Longer sleep stretches may start soon. A bedtime routine helps.' },
    ]
    return [
      { icon: '\uD83E\uDD61', text: 'Around 6 months, you can start introducing solid foods alongside milk.' },
      { icon: '\uD83E\uDDD1', text: `${name === 'baby' ? 'Baby' : name} is becoming more curious \u2014 baby-proof any accessible areas.` },
      { icon: '\uD83D\uDDE3\uFE0F', text: 'Babbling is early language. Respond to it like a conversation.' },
    ]
  }

  // Toddler
  return [
    { icon: '\uD83D\uDEB6', text: `${name === 'baby' ? 'Your toddler' : name} is on the move! Safe exploration builds confidence.` },
    { icon: '\uD83C\uDF4E', text: 'Offer a variety of foods. It can take 10+ tries before they accept something new.' },
    { icon: '\uD83D\uDCD6', text: 'Reading together, even briefly, has a big impact on language development.' },
  ]
}

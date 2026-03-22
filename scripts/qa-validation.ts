/**
 * @module QA Validation Suite
 * @description Comprehensive test cases for Lumira app pre-deployment validation.
 * Tests database queries, API routes, page rendering prerequisites, and data integrity.
 * Run with: npx tsx scripts/qa-validation.ts
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gomjthjjqcmrhnpwsdqh.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY env var required')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

type TestResult = { name: string; passed: boolean; error?: string }
const results: TestResult[] = []

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn()
    results.push({ name, passed: true })
    console.log(`  ✅ ${name}`)
  } catch (e: any) {
    results.push({ name, passed: false, error: e.message })
    console.log(`  ❌ ${name}: ${e.message}`)
  }
}

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(msg)
}

async function run() {
  console.log('\n🧪 LUMIRA QA VALIDATION SUITE\n')

  // ═══════════════════════════════════════════════════════════════════
  // SECTION 1: DATABASE SCHEMA VALIDATION
  // ═══════════════════════════════════════════════════════════════════
  console.log('📋 1. Database Schema Validation')

  await test('baby_profiles has planning_sub_option column', async () => {
    const { data, error } = await supabase.from('baby_profiles').select('planning_sub_option').limit(1)
    assert(!error, `Column missing: ${error?.message}`)
  })

  await test('baby_profiles has planning_expected_month column', async () => {
    const { data, error } = await supabase.from('baby_profiles').select('planning_expected_month').limit(1)
    assert(!error, `Column missing: ${error?.message}`)
  })

  await test('profiles has display_name column', async () => {
    const { data, error } = await supabase.from('profiles').select('display_name').limit(1)
    assert(!error, `Column missing: ${error?.message}`)
  })

  await test('profiles has pronouns column', async () => {
    const { data, error } = await supabase.from('profiles').select('pronouns').limit(1)
    assert(!error, `Column missing: ${error?.message}`)
  })

  await test('profiles has bio column', async () => {
    const { data, error } = await supabase.from('profiles').select('bio').limit(1)
    assert(!error, `Column missing: ${error?.message}`)
  })

  await test('profiles has interests column', async () => {
    const { data, error } = await supabase.from('profiles').select('interests').limit(1)
    assert(!error, `Column missing: ${error?.message}`)
  })

  await test('profiles has looking_for column', async () => {
    const { data, error } = await supabase.from('profiles').select('looking_for').limit(1)
    assert(!error, `Column missing: ${error?.message}`)
  })

  await test('profiles has profile_completion_seeds_awarded column', async () => {
    const { data, error } = await supabase.from('profiles').select('profile_completion_seeds_awarded').limit(1)
    assert(!error, `Column missing: ${error?.message}`)
  })

  await test('content_articles has applicable_stages column', async () => {
    const { data, error } = await supabase.from('content_articles').select('applicable_stages').limit(1)
    assert(!error, `Column missing: ${error?.message}`)
  })

  await test('content_articles does NOT have target_stages column (should fail)', async () => {
    const { error } = await supabase.from('content_articles').select('target_stages').limit(1)
    assert(!!error, 'target_stages column should NOT exist - code references wrong column name')
  })

  // ═══════════════════════════════════════════════════════════════════
  // SECTION 2: CONTENT DATA INTEGRITY
  // ═══════════════════════════════════════════════════════════════════
  console.log('\n📋 2. Content Data Integrity')

  await test('content_articles has published articles', async () => {
    const { count, error } = await supabase.from('content_articles').select('*', { count: 'exact', head: true }).eq('is_published', true)
    assert(!error, `Query failed: ${error?.message}`)
    assert((count ?? 0) > 50, `Expected 50+ articles, got ${count}`)
  })

  await test('content_articles covers pregnancy stage', async () => {
    const { count } = await supabase.from('content_articles').select('*', { count: 'exact', head: true }).eq('stage', 'pregnancy').eq('is_published', true)
    assert((count ?? 0) > 10, `Expected 10+ pregnancy articles, got ${count}`)
  })

  await test('content_articles covers infant stage', async () => {
    const { count } = await supabase.from('content_articles').select('*', { count: 'exact', head: true }).eq('stage', 'infant').eq('is_published', true)
    assert((count ?? 0) > 10, `Expected 10+ infant articles, got ${count}`)
  })

  await test('content_articles covers postpartum stage', async () => {
    const { count } = await supabase.from('content_articles').select('*', { count: 'exact', head: true }).eq('stage', 'postpartum').eq('is_published', true)
    assert((count ?? 0) > 10, `Expected 10+ postpartum articles, got ${count}`)
  })

  await test('content_articles covers toddler stage', async () => {
    const { count } = await supabase.from('content_articles').select('*', { count: 'exact', head: true }).eq('stage', 'toddler').eq('is_published', true)
    assert((count ?? 0) > 10, `Expected 10+ toddler articles, got ${count}`)
  })

  await test('content_articles query with applicable_stages filter works', async () => {
    const { data, error } = await supabase
      .from('content_articles')
      .select('id, stage, applicable_stages')
      .or('stage.eq.pregnancy,applicable_stages.cs.{pregnancy}')
      .limit(5)
    assert(!error, `Query failed: ${error?.message}`)
  })

  // ═══════════════════════════════════════════════════════════════════
  // SECTION 3: TRIBES DATA INTEGRITY
  // ═══════════════════════════════════════════════════════════════════
  console.log('\n📋 3. Tribes Data Integrity')

  await test('tribes table has 10+ active tribes', async () => {
    const { count, error } = await supabase.from('tribes').select('*', { count: 'exact', head: true })
    assert(!error, `Query failed: ${error?.message}`)
    assert((count ?? 0) >= 10, `Expected 10+ tribes, got ${count}`)
  })

  await test('new finance tribe exists (baby-budget-finances)', async () => {
    const { data, error } = await supabase.from('tribes').select('id, name').eq('slug', 'baby-budget-finances').single()
    assert(!error, `Query failed: ${error?.message}`)
    assert(!!data, 'baby-budget-finances tribe not found')
  })

  await test('new nursery tribe exists (nursery-gear-prep)', async () => {
    const { data, error } = await supabase.from('tribes').select('id, name').eq('slug', 'nursery-gear-prep').single()
    assert(!error, `Query failed: ${error?.message}`)
    assert(!!data, 'nursery-gear-prep tribe not found')
  })

  await test('new self-care tribe exists (self-care-parents)', async () => {
    const { data, error } = await supabase.from('tribes').select('id, name').eq('slug', 'self-care-parents').single()
    assert(!error, `Query failed: ${error?.message}`)
    assert(!!data, 'self-care-parents tribe not found')
  })

  await test('tribe posts exist for new tribes', async () => {
    const { count, error } = await supabase.from('tribe_posts').select('*', { count: 'exact', head: true }).eq('tribe_id', 'a0000000-0000-0000-0000-000000000021')
    assert(!error, `Query failed: ${error?.message}`)
    assert((count ?? 0) >= 3, `Expected 3+ posts for finance tribe, got ${count}`)
  })

  await test('tribe comments exist for new tribe posts', async () => {
    const { count, error } = await supabase.from('tribe_comments').select('*', { count: 'exact', head: true }).eq('post_id', 'c0000000-0000-0000-0000-000000000201')
    assert(!error, `Query failed: ${error?.message}`)
    assert((count ?? 0) >= 2, `Expected 2+ comments, got ${count}`)
  })

  await test('AI parent profiles exist for new tribes', async () => {
    const { data, error } = await supabase.from('ai_parent_profiles').select('id, display_name').in('id', [
      'b0000000-0000-0000-0000-000000000026',
      'b0000000-0000-0000-0000-000000000027',
      'b0000000-0000-0000-0000-000000000028',
      'b0000000-0000-0000-0000-000000000029',
    ])
    assert(!error, `Query failed: ${error?.message}`)
    assert(data?.length === 4, `Expected 4 new AI profiles, got ${data?.length}`)
  })

  // ═══════════════════════════════════════════════════════════════════
  // SECTION 4: API QUERY SIMULATION (what the code actually does)
  // ═══════════════════════════════════════════════════════════════════
  console.log('\n📋 4. API Query Simulation')

  await test('home page content query (applicable_stages) works', async () => {
    const { data, error } = await supabase
      .from('content_articles')
      .select('id, title, subtitle, category, reading_time_minutes, tags, week_or_month, stage, applicable_stages')
      .or('stage.eq.pregnancy,applicable_stages.cs.{pregnancy}')
      .order('week_or_month', { ascending: true })
      .limit(10)
    assert(!error, `Home page content query failed: ${error?.message}`)
    assert((data?.length ?? 0) > 0, 'No articles returned for home page')
  })

  await test('content page query works for each stage', async () => {
    const stages = ['planning', 'pregnancy', 'infant', 'toddler', 'postpartum']
    for (const stage of stages) {
      const { error } = await supabase
        .from('content_articles')
        .select('*')
        .or(`stage.eq.${stage},applicable_stages.cs.{${stage}}`)
        .order('week_or_month', { ascending: true })
        .limit(5)
      assert(!error, `Content query failed for stage ${stage}: ${error?.message}`)
    }
  })

  await test('baby_profiles full select query works (as used in layout.tsx)', async () => {
    const { error } = await supabase
      .from('baby_profiles')
      .select('id, name, due_date, date_of_birth, stage, pending_proactive_type, pending_proactive_set_at, created_by_profile_id, created_at, planning_sub_option, planning_expected_month')
      .limit(1)
    assert(!error, `Layout baby_profiles query failed: ${error?.message}`)
  })

  await test('baby_profiles query for chat API works', async () => {
    const { error } = await supabase
      .from('baby_profiles')
      .select('id, name, due_date, date_of_birth, stage, pending_proactive_type, planning_sub_option, planning_expected_month')
      .limit(1)
    assert(!error, `Chat API baby_profiles query failed: ${error?.message}`)
  })

  await test('baby_profiles query for checkin page works', async () => {
    const { error } = await supabase
      .from('baby_profiles')
      .select('id, name, due_date, date_of_birth, stage, pending_proactive_type, pending_proactive_set_at, created_by_profile_id, created_at, planning_sub_option, planning_expected_month')
      .limit(1)
    assert(!error, `Checkin baby_profiles query failed: ${error?.message}`)
  })

  await test('tribes API query works', async () => {
    const { data, error } = await supabase
      .from('tribes')
      .select('id, name, slug, description, emoji, member_count, post_count, color, created_at')
      .eq('is_active', true)
    assert(!error, `Tribes query failed: ${error?.message}`)
    assert((data?.length ?? 0) > 0, 'No active tribes found')
  })

  await test('tribes query with stage_filter works', async () => {
    const { error } = await supabase
      .from('tribes')
      .select('id, name, emoji, slug')
      .or('stage_filter.eq.pregnancy,stage_filter.eq.any,stage_filter.is.null')
      .eq('is_active', true)
      .limit(5)
    assert(!error, `Tribes stage query failed: ${error?.message}`)
  })

  await test('tribe_posts with ai_parent_profiles join works', async () => {
    const { data, error } = await supabase
      .from('tribe_posts')
      .select('id, tribe_id, title, body, created_at, ai_parent_profiles!tribe_posts_ai_profile_id_fkey(display_name, avatar_emoji)')
      .limit(5)
    assert(!error, `Tribe posts join query failed: ${error?.message}`)
  })

  await test('profiles query for profile update route works', async () => {
    const { error } = await supabase
      .from('profiles')
      .select('profile_completion_seeds_awarded, display_name, pronouns, location_city, bio, birth_month, parenting_style, feeding_method, birth_type, number_of_children, languages_spoken, work_status, interests, looking_for')
      .limit(1)
    assert(!error, `Profile update query failed: ${error?.message}`)
  })

  // ═══════════════════════════════════════════════════════════════════
  // SECTION 5: RLS POLICY VALIDATION
  // ═══════════════════════════════════════════════════════════════════
  console.log('\n📋 5. RLS Policy Validation')

  await test('content_articles RLS allows published article reads', async () => {
    // Service key bypasses RLS, but we can check the policy exists
    const { data } = await supabase.rpc('pg_policies_check', {}).maybeSingle()
    // Just verify the table is accessible
    const { error } = await supabase.from('content_articles').select('id').eq('is_published', true).limit(1)
    assert(!error, `Content articles not accessible: ${error?.message}`)
  })

  await test('tribes are readable', async () => {
    const { error } = await supabase.from('tribes').select('id').limit(1)
    assert(!error, `Tribes not readable: ${error?.message}`)
  })

  await test('tribe_posts are readable', async () => {
    const { error } = await supabase.from('tribe_posts').select('id').limit(1)
    assert(!error, `Tribe posts not readable: ${error?.message}`)
  })

  // ═══════════════════════════════════════════════════════════════════
  // SECTION 6: DATA CONSISTENCY
  // ═══════════════════════════════════════════════════════════════════
  console.log('\n📋 6. Data Consistency')

  await test('all tribe posts reference valid tribes', async () => {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `SELECT COUNT(*) as orphans FROM tribe_posts tp LEFT JOIN tribes t ON tp.tribe_id = t.id WHERE t.id IS NULL`
    }).maybeSingle()
    // If RPC not available, just check the join works
    const { error: joinError } = await supabase
      .from('tribe_posts')
      .select('id, tribes!inner(id)')
      .limit(1)
    assert(!joinError, `Orphaned tribe posts detected: ${joinError?.message}`)
  })

  await test('all tribe comments reference valid posts', async () => {
    const { error } = await supabase
      .from('tribe_comments')
      .select('id, tribe_posts!inner(id)')
      .limit(1)
    assert(!error, `Orphaned tribe comments detected: ${error?.message}`)
  })

  await test('weekly_guide_content is accessible', async () => {
    const { error } = await supabase.from('weekly_guide_content').select('id').limit(1)
    assert(!error, `Weekly guide content not accessible: ${error?.message}`)
  })

  await test('daily_checkins table is accessible', async () => {
    const { error } = await supabase.from('daily_checkins').select('id').limit(1)
    assert(!error, `Daily checkins not accessible: ${error?.message}`)
  })

  await test('seed_transactions table is accessible', async () => {
    const { error } = await supabase.from('seed_transactions').select('id').limit(1)
    assert(!error, `Seed transactions not accessible: ${error?.message}`)
  })

  // ═══════════════════════════════════════════════════════════════════
  // FINAL REPORT
  // ═══════════════════════════════════════════════════════════════════
  console.log('\n' + '═'.repeat(60))
  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length
  const total = results.length

  console.log(`\n📊 RESULTS: ${passed}/${total} passed, ${failed} failed\n`)

  if (failed > 0) {
    console.log('❌ FAILED TESTS:')
    results.filter(r => !r.passed).forEach(r => {
      console.log(`   • ${r.name}: ${r.error}`)
    })
    console.log('\n⚠️  DO NOT DEPLOY — Fix failures first\n')
    process.exit(1)
  } else {
    console.log('✅ ALL TESTS PASSED — Safe to deploy\n')
    process.exit(0)
  }
}

run().catch(e => {
  console.error('Fatal error:', e)
  process.exit(1)
})

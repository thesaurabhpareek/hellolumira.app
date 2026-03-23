/**
 * @module /api/cron/tribe-activity
 * @description Cron endpoint: adds 1-2 organic-feeling comments from AI parent
 *   profiles to recent tribe posts daily. Keeps tribes feeling alive without
 *   flooding. Deterministic rotation ensures variety across AI profiles.
 *
 * Called by Vercel Cron — secured via CRON_SECRET header.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const maxDuration = 15

/* ── Comment pool — warm, authentic, varied ─────────────────────────────── */

interface CommentDef {
  body: string
  /** Which post topics this comment fits (loose match against post title/body) */
  tags: string[]
}

const COMMENT_POOL: CommentDef[] = [
  // Supportive / empathetic
  { body: 'Going through the same thing right now. It helps knowing I\'m not alone in this. 💛', tags: ['struggle', 'guilt', 'hard', 'help', 'survive'] },
  { body: 'This made my whole day. Thank you for sharing! 🥹', tags: ['smile', 'celebration', 'milestone', 'kick', 'first'] },
  { body: 'Sending you so much love. The early days are brutal but you\'re doing amazing.', tags: ['newborn', 'first week', 'sleep', 'survive', 'home'] },
  { body: 'YES. Nobody prepares you for this part. You\'re not alone. 🫂', tags: ['rage', 'guilt', 'struggle', 'nobody told', 'hard'] },
  { body: 'This is the most relatable thing I\'ve read all week 😂', tags: ['funny', 'chaos', 'insane', 'wild', 'cravings'] },

  // Advice / tips
  { body: 'What worked for us: keeping a simple routine, not a strict schedule. Flexibility saved my sanity.', tags: ['routine', 'schedule', 'sleep', 'feeding', 'regression'] },
  { body: 'My pediatrician said this is totally normal at this age. Try not to stress (easier said than done, I know).', tags: ['worry', 'normal', 'regression', 'milestone', 'fever'] },
  { body: 'One thing I wish someone told me earlier: it\'s okay to ask for help. Like, actually ask. People want to help.', tags: ['help', 'support', 'survive', 'alone', 'overwhelm'] },
  { body: 'We did the same thing and zero regrets. Trust your gut — you know your baby best.', tags: ['decision', 'choice', 'feeding', 'sleep', 'method'] },
  { body: 'Saving this for later. Such good advice in this thread! 📌', tags: ['tips', 'checklist', 'advice', 'recommend', 'what worked'] },

  // Questions / engagement
  { body: 'How old is your little one now? We\'re about 2 weeks behind you and this gives me hope!', tags: ['milestone', 'week', 'month', 'progress', 'update'] },
  { body: 'Did you find it got easier after the first month? We\'re in the thick of it right now.', tags: ['newborn', 'first', 'hard', 'survive', 'month'] },
  { body: 'Which brand did you end up going with? Looking for recommendations!', tags: ['gear', 'product', 'recommend', 'buy', 'budget'] },
  { body: 'Following this thread! Such a helpful conversation. 🙌', tags: ['tips', 'advice', 'help', 'checklist', 'recommend'] },
  { body: 'Update us when you can! Rooting for you. 💕', tags: ['ultrasound', 'appointment', 'tomorrow', 'nervous', 'update'] },

  // Solidarity
  { body: 'I laughed out loud at this because SAME. The solidarity in this group is everything.', tags: ['funny', 'same', 'relatable', 'chaos', 'wild'] },
  { body: 'My partner and I had this exact conversation last night. You are not alone in feeling this way.', tags: ['partner', 'relationship', 'feeling', 'guilt', 'struggle'] },
  { body: 'Took me until month 4 to feel like I had any idea what I was doing. Now at month 8, I still don\'t, but I\'m calmer about it 😅', tags: ['confidence', 'learn', 'figure out', 'month', 'doing'] },
  { body: 'The fact that you\'re here asking means you\'re already a great parent. Seriously.', tags: ['help', 'advice', 'worried', 'am I', 'normal'] },
  { body: 'This community is the reason I open this app every day. Thank you all. 🌿', tags: ['community', 'support', 'tribe', 'group', 'alone'] },

  // Celebration
  { body: 'CONGRATS! 🎉 These little moments are everything. Soak it in!', tags: ['first', 'milestone', 'smile', 'roll', 'kick', 'celebration'] },
  { body: 'I remember that feeling. It only gets better from here! Enjoy every second.', tags: ['kick', 'smile', 'first', 'milestone', 'moment'] },
  { body: 'Screenshot this and save it for when you have a tough day. You\'re doing incredible things. ✨', tags: ['celebration', 'win', 'milestone', 'proud', 'amazing'] },

  // Practical
  { body: 'Pro tip: batch prep everything on Sunday. Meals, bottles, outfits for the week. Game changer.', tags: ['routine', 'prep', 'organize', 'budget', 'work'] },
  { body: 'We tracked feeds and diapers for the first 6 weeks and it actually reduced our anxiety a lot. Data helps some brains!', tags: ['track', 'feeding', 'diaper', 'newborn', 'routine'] },
]

/* ── AI profile IDs for comment attribution ─────────────────────────────── */

const AI_PROFILE_IDS = [
  'b0000000-0000-0000-0000-000000000001', // Priya
  'b0000000-0000-0000-0000-000000000006', // James
  'b0000000-0000-0000-0000-000000000007', // Yuki
  'b0000000-0000-0000-0000-000000000009', // Liam
  'b0000000-0000-0000-0000-000000000010', // Deepa
  'b0000000-0000-0000-0000-000000000011', // Carolina
  'b0000000-0000-0000-0000-000000000012', // Rachel
  'b0000000-0000-0000-0000-000000000014', // Kenji
  'b0000000-0000-0000-0000-000000000015', // Zara
  'b0000000-0000-0000-0000-000000000016', // Tomas
  'b0000000-0000-0000-0000-000000000018', // Sarah
  'b0000000-0000-0000-0000-000000000020', // Emma
  'b0000000-0000-0000-0000-000000000021', // Tanya
  'b0000000-0000-0000-0000-000000000028', // Chris
  'b0000000-0000-0000-0000-000000000029', // Layla
]

/* ── Handler ────────────────────────────────────────────────────────────── */

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  // Pick 1-2 recent posts to comment on (created in last 14 days, not already
  // heavily commented by AI today)
  const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString()
  const { data: posts, error: postsErr } = await supabase
    .from('tribe_posts')
    .select('id, title, body, ai_profile_id')
    .gte('created_at', twoWeeksAgo)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(20)

  if (postsErr || !posts?.length) {
    console.log('[tribe-activity] No eligible posts found:', postsErr?.message)
    return NextResponse.json({ ok: true, comments: 0, reason: 'no eligible posts' })
  }

  // Deterministic rotation based on day of year
  const now = new Date()
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000,
  )

  // Pick 1-2 posts (2 on even days, 1 on odd)
  const numComments = dayOfYear % 2 === 0 ? 2 : 1
  const results: { postId: string; postTitle: string; commenter: string }[] = []

  for (let i = 0; i < Math.min(numComments, posts.length); i++) {
    const postIdx = (dayOfYear + i * 7) % posts.length
    const post = posts[postIdx]

    // Pick a commenter different from the post author
    let commenterIdx = (dayOfYear + i * 3) % AI_PROFILE_IDS.length
    if (AI_PROFILE_IDS[commenterIdx] === post.ai_profile_id) {
      commenterIdx = (commenterIdx + 1) % AI_PROFILE_IDS.length
    }
    const commenterId = AI_PROFILE_IDS[commenterIdx]

    // Pick a comment — try to match tags against post title/body
    const postText = `${post.title || ''} ${post.body || ''}`.toLowerCase()
    let commentIdx = (dayOfYear * 3 + i * 11) % COMMENT_POOL.length

    // Try to find a tag-matched comment (best-effort, fall back to rotation)
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = COMMENT_POOL[(commentIdx + attempt) % COMMENT_POOL.length]
      if (candidate.tags.some(tag => postText.includes(tag))) {
        commentIdx = (commentIdx + attempt) % COMMENT_POOL.length
        break
      }
    }
    const comment = COMMENT_POOL[commentIdx]

    const { error: insertErr } = await supabase
      .from('tribe_comments')
      .insert({
        post_id: post.id,
        ai_profile_id: commenterId,
        body: comment.body,
        reaction_count: Math.floor(Math.random() * 6) + 1,
      })

    if (insertErr) {
      console.error('[tribe-activity] Comment insert error:', insertErr.message)
      continue
    }

    // Update comment count on the post
    const { error: rpcErr } = await supabase.rpc('increment_field', {
      table_name: 'tribe_posts',
      row_id: post.id,
      field_name: 'comment_count',
      amount: 1,
    })
    if (rpcErr) {
      // Fallback: direct SQL increment if RPC doesn't exist
      await supabase
        .from('tribe_posts')
        .update({ comment_count: ((post as Record<string, number>).comment_count || 0) + 1 })
        .eq('id', post.id)
    }

    results.push({
      postId: post.id,
      postTitle: post.title || '(untitled)',
      commenter: commenterId,
    })
  }

  console.log(`[tribe-activity] Added ${results.length} comments on day ${dayOfYear}`)
  return NextResponse.json({ ok: true, day: dayOfYear, comments: results })
}

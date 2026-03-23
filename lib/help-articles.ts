export interface HelpArticle {
  id: string
  title: string
  icon: string
  category: 'getting-started' | 'features' | 'privacy' | 'wellbeing'
  body: string // markdown-like plain text with \n\n for paragraphs and ## for headings
}

export const HELP_ARTICLES: HelpArticle[] = [
  {
    id: 'how-lumira-works',
    title: 'How does Lumira work?',
    icon: '✨',
    category: 'getting-started',
    body: `## What is Lumira?\n\nLumira is your AI parenting companion — a private space to check in daily, ask questions, track milestones, and get personalised guidance through pregnancy and early parenthood.\n\nUnlike generic search results or overwhelmed family group chats, Lumira knows your specific situation: your stage, your baby's age, your recent check-ins, and what's been on your mind.\n\n## How does the daily check-in work?\n\nEach day, Lumira opens a short conversation — usually 3-5 exchanges. It asks how you're doing, listens, and logs the important bits (sleep, feeding, mood) automatically. You don't fill in forms; you just talk.\n\n## What is Lumira not?\n\nLumira is not a substitute for medical advice. It won't diagnose conditions or replace your midwife, GP, or health visitor. When something genuinely concerns you, it will always point you toward the right professional.\n\n## How does Lumira learn about me?\n\nEverything you share in check-ins and conversations builds up a picture over time. Lumira uses this context to give more relevant, personalised responses — and to notice patterns (like recurring sleep disruptions) that you might miss day-to-day.`,
  },
  {
    id: 'data-safety',
    title: 'Is my data safe?',
    icon: '🔒',
    category: 'privacy',
    body: `## Your privacy is foundational\n\nLumira is designed to be a private space — not an ad platform, not a data broker. Here's how we handle your data:\n\n## What we store\n\nYour profile and baby information, daily check-ins and conversations, journal entries and milestones, concern sessions and follow-ups.\n\n## What we never do\n\nWe never sell your data. We never use your conversations to train AI models. We never share your information with third parties for marketing purposes.\n\n## Who can see my conversations?\n\nOnly you (and your partner, if you've invited one). Lumira's support team may access aggregated, anonymised patterns to improve the product — but never your individual conversations.\n\n## Data security\n\nAll data is encrypted in transit and at rest. We use Supabase (built on PostgreSQL) with row-level security, meaning your data is isolated from other users at the database level.\n\n## Your rights\n\nYou can download all your data (GDPR Article 20) or delete your account entirely (GDPR Article 17) from Settings → Privacy at any time.`,
  },
  {
    id: 'daily-checkins',
    title: 'How to use daily check-ins',
    icon: '✅',
    category: 'features',
    body: `## What are daily check-ins?\n\nThe daily check-in is Lumira's core feature — a short, conversational check-in that takes 2-3 minutes and replaces a full tracking log.\n\n## How to start a check-in\n\nTap the check-in card on the home screen. Lumira will open with a context-aware question based on your stage and time of day. Just respond naturally.\n\n## What gets logged?\n\nLumira automatically extracts structured data from your conversation: sleep quality, feeding patterns, mood signals, and baby's state. You don't need to fill in fields — just talk.\n\n## Can I do more than one check-in per day?\n\nYes. The check-in continues throughout the day — each message adds to today's record. You can come back multiple times.\n\n## What if I miss a day?\n\nThat's completely fine. Lumira doesn't penalise missed days. Streaks are tracked (and you earn seeds for them), but they reset without judgement.\n\n## Structured fields\n\nSometimes after a few exchanges, Lumira will suggest quick-tap options to log specific things (like sleep quality or feeding count). These are optional — you can ignore them and keep talking.`,
  },
  {
    id: 'concern-flows',
    title: 'Understanding concern conversations',
    icon: '💬',
    category: 'features',
    body: `## What is a concern conversation?\n\nWhen you raise something that's worrying you — a rash, an unusual cry, feeding difficulties — Lumira switches into a more focused mode called a concern conversation.\n\n## How it works\n\nLumira will ask clarifying questions to understand the situation fully, then provide a structured response: what it might mean, what to watch for, when to seek medical help, and when to follow up.\n\n## Red flag detection\n\nLumira automatically scans your messages for urgent signs — high fever, breathing difficulties, or other serious symptoms. If it detects something that needs immediate attention, it will tell you clearly and directly.\n\n## Follow-ups\n\nFor non-urgent concerns, Lumira sets a follow-up reminder (usually 24-48 hours). You'll see a reminder card on your home screen when the follow-up is due.\n\n## Important\n\nConcern conversations are not medical consultations. Lumira can help you understand a situation and decide whether to seek care — but it cannot diagnose or treat. When in doubt, always contact your healthcare provider.`,
  },
  {
    id: 'milestones',
    title: 'Tracking milestones',
    icon: '🎉',
    category: 'features',
    body: `## What are milestones?\n\nMilestones are significant developmental moments you want to remember — first smile, first word, first steps. Lumira helps you log and celebrate these.\n\n## How to log a milestone\n\nGo to the Milestones tab (via the Me tab or directly). Tap "Log a milestone", choose the type, and add any notes or a date.\n\n## Age-based suggestions\n\nLumira shows upcoming milestones relevant to your baby's current age — so you know what to look out for. Suggested milestones are based on typical developmental windows (which vary widely between babies).\n\n## Milestone suggestions are not medical targets\n\nEvery baby develops at their own pace. Milestone suggestions are ranges, not deadlines. If you have concerns about your baby's development, speak with your health visitor or GP.\n\n## Pregnancy milestones\n\nFor expecting parents, Lumira tracks pregnancy milestones too — first scan, anatomy scan, first kick, and more.`,
  },
  {
    id: 'tribes',
    title: 'What are Tribes?',
    icon: '🤝',
    category: 'features',
    body: `## What are Tribes?\n\nTribes are community spaces where AI parent personas share experiences, ask questions, and discuss topics relevant to your stage. They're a safe place to feel less alone — populated by relatable AI voices covering real parenting experiences.\n\n## How to join a Tribe\n\nBrowse Tribes from the bottom navigation. Find one relevant to you (Newborn, Pregnancy, Sleep, etc.) and tap Join. You can join as many as you like.\n\n## Posting in Tribes\n\nYou can post questions, share experiences, and respond to others. Posts are public within the Tribe.\n\n## Reporting a post\n\nIf you see something inappropriate, tap the ⋯ menu on a post and select "Report". Our team reviews flagged content.\n\n## Real people vs AI personas\n\nTribes are currently populated primarily by AI parent personas that reflect real parenting experiences. As the community grows, real users will increasingly participate.`,
  },
  {
    id: 'notifications',
    title: 'Managing notifications',
    icon: '🔔',
    category: 'features',
    body: `## What notifications does Lumira send?\n\nLumira sends gentle reminders for daily check-ins, follow-up reminders for concerns, and weekly summaries of your baby's progress.\n\n## How to manage notifications\n\nGo to Settings → Notifications to control which emails you receive.\n\n## Email notifications\n\nLumira sends emails for: check-in reminders, concern follow-ups, weekly guides, and important account notices. You can turn each off independently.\n\n## Unsubscribing\n\nEvery email from Lumira contains an unsubscribe link. You can also manage all preferences from Settings → Notifications.\n\n## Push notifications\n\nWeb push notifications are coming soon. For now, email is the primary notification channel.`,
  },
  {
    id: 'partner-access',
    title: 'Inviting your partner',
    icon: '💑',
    category: 'features',
    body: `## Shared access\n\nLumira supports co-parenting — you can invite your partner to access the same baby profile and see each other's check-ins.\n\n## How to invite a partner\n\nGo to Settings → Family. Enter your partner's email and send the invite. They'll receive an email to join Lumira and connect to your baby profile.\n\n## What your partner can see\n\nOnce connected, your partner can see check-ins, milestones, and the baby profile. Concern conversations remain private by default.\n\n## Different accounts, same baby\n\nBoth partners have separate accounts but share one baby profile. Each can do their own check-ins — Lumira will track both perspectives.\n\n## Removing a partner\n\nYou can remove a partner's access from Settings → Family at any time.`,
  },
  {
    id: 'seeds-rewards',
    title: 'Seeds & rewards',
    icon: '🌱',
    category: 'getting-started',
    body: `## What are Seeds?\n\nSeeds are Lumira's engagement reward — small tokens you earn for showing up consistently. They reflect the care you put into tracking your parenting journey.\n\n## How to earn Seeds\n\nComplete a daily check-in: +10 seeds. Complete a streak bonus: +5 extra seeds. Log a milestone: +5 seeds. Complete your profile: +20 seeds.\n\n## What are Seeds for?\n\nCurrently, Seeds are a progress tracker. In the future, they'll unlock premium features and content.\n\n## Streaks\n\nIf you check in on consecutive days, you build a streak. Streaks earn bonus seeds. Missing a day resets the streak (but your Seeds total stays).\n\n## Badges\n\nAs you hit milestones in your Lumira journey (first week streak, first concern resolved), you earn badges shown on your profile.`,
  },
  {
    id: 'account-settings',
    title: 'Account & privacy settings',
    icon: '⚙️',
    category: 'privacy',
    body: `## Where are settings?\n\nTap the Me tab (bottom navigation), then tap the settings icon or go to Profile → Settings.\n\n## Changing your profile\n\nEdit your name, bio, location, pronouns, and parenting style from Profile → Edit Profile.\n\n## Privacy settings\n\nSettings → Privacy lets you control:\n- Data retention period (how long we keep your data)\n- Communication preferences\n- Download your data\n- Delete your account\n\n## Deleting your account\n\nAccount deletion is permanent and irreversible. It removes all your data including check-ins, conversations, milestones, and profile. You'll receive a confirmation email. The deletion is processed within 24 hours.\n\n## Downloading your data\n\nYou can download a complete copy of all data Lumira holds about you in JSON format from Settings → Privacy → Download my data.`,
  },
]

/**
 * @module Claude
 * @description Anthropic Claude API client wrapper. Provides the master system
 *   prompt that defines Lumira's character, stage-specific tone modifiers, and
 *   hard rules. Exports helper functions for plain-text and JSON-parsed Claude calls.
 * @version 1.0.0
 * @since March 2026
 */

import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export const MASTER_SYSTEM_PROMPT = (params: {
  parent_first_name: string
  stage: string
  baby_name?: string
  pregnancy_week?: number
  due_date?: string
  age_in_weeks?: number
  age_display_string?: string
}) => `You are Lumira, an AI parenting companion at hellolumira.app.
Your name is Lumira. You speak in first person as Lumira.
You are talking to ${params.parent_first_name}.

Current stage: ${params.stage}

${params.stage === 'pregnancy' ? `Baby name: ${params.baby_name || 'your baby'}
Pregnancy week: ${params.pregnancy_week} (due: ${params.due_date})` : ''}

${params.stage !== 'pregnancy' ? `Baby name: ${params.baby_name}
Age: ${params.age_in_weeks} weeks (${params.age_display_string})` : ''}

YOUR CHARACTER (constant across all stages):
  - Warm and nurturing: lead with care before information
  - Gently curious: one question at a time, listen before advising
  - Knowledgeable but never preachy: share only what's relevant now
  - Occasionally witty: dry warmth, never at the parent's expense
  - Calm and grounding: no alarm language, no panic
  - Direct before deferring: real view first, escalate only when warranted

STAGE TONE MODIFIERS:
  - Pregnancy: more anticipatory, emotionally attuned, acknowledge the bigness
  - Infant: practical, pattern-aware, grounding at 2am
  - Toddler: behavioural, developmental context, normalise the hard moments

HARD RULES — NEVER BREAK:
  - Never say 'your baby' if you have a name
  - Never say 'you should' — use 'you might try' or 'it's worth considering'
  - Never lead with a disclaimer — earn trust first, note limits at the end
  - Never write more than 3 short paragraphs in one message
  - Never diagnose — interpret and guide only
  - Never say 'I'm just an AI' as a lead — only briefly at the end if needed
  - If parent seems distressed, acknowledge their state before any content
  - Escalation must be calm and specific — name the exact symptom or threshold`

/**
 * Sends a single-turn message to Claude and returns the text response.
 *
 * @param systemPrompt - The full system prompt (master + context + addon).
 * @param userMessage  - The user's message content.
 * @param maxTokens    - Maximum response tokens (default 800).
 * @returns The assistant's text response.
 * @throws If the response content type is not text.
 */
export async function callClaude(
  systemPrompt: string,
  userMessage: string,
  maxTokens = 800
): Promise<string> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000) // 30s timeout
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }, { signal: controller.signal })

    if (!response.content || response.content.length === 0) {
      throw new Error('Empty response from Claude API — no content blocks returned')
    }
    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error(`Unexpected response block type from Claude API: ${content.type}`)
    }
    return content.text
  } finally {
    clearTimeout(timeout)
  }
}

/**
 * Calls Claude and parses the response as JSON of type T.
 * Automatically strips markdown code fences (```json ... ```) if present.
 *
 * @param systemPrompt - The full system prompt.
 * @param userMessage  - The user's message content.
 * @param maxTokens    - Maximum response tokens (default 1000).
 * @returns The parsed JSON response.
 * @throws If JSON parsing fails after fence stripping.
 */
export async function callClaudeJSON<T>(
  systemPrompt: string,
  userMessage: string,
  maxTokens = 1000
): Promise<T> {
  const text = await callClaude(systemPrompt, userMessage, maxTokens)
  // Strip markdown code fences if present — handle leading/trailing whitespace,
  // varied fence styles (```json, ``` json, ```JSON, etc.)
  const cleaned = text
    .trim()
    .replace(/^```\s*(?:json|JSON)?\s*\n?/, '')
    .replace(/\n?\s*```\s*$/, '')
    .trim()

  try {
    return JSON.parse(cleaned) as T
  } catch (parseError) {
    // Last resort: try to extract the first JSON object from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as T
    }
    throw new Error(
      `Failed to parse Claude JSON response: ${(parseError as Error).message}. Raw text: ${text.substring(0, 200)}`
    )
  }
}

export default anthropic

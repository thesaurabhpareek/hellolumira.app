import { describe, it, expect, vi, beforeEach } from 'vitest'

// Must use vi.hoisted so the mock variable is available during vi.mock factory
const { mockCreate } = vi.hoisted(() => {
  return { mockCreate: vi.fn() }
})

vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: class MockAnthropic {
      messages = { create: mockCreate }
    },
  }
})

import { callClaude, callClaudeJSON, MASTER_SYSTEM_PROMPT } from '@/lib/claude'

beforeEach(() => {
  vi.clearAllMocks()
})

// ── MASTER_SYSTEM_PROMPT ───────────────────────────────────────────────

describe('MASTER_SYSTEM_PROMPT', () => {
  it('returns a string containing the parent name', () => {
    const prompt = MASTER_SYSTEM_PROMPT({
      parent_first_name: 'Sarah',
      stage: 'infant',
      baby_name: 'Meera',
      age_in_weeks: 12,
      age_display_string: '12 weeks',
    })
    expect(prompt).toContain('Sarah')
  })

  it('includes the stage', () => {
    const prompt = MASTER_SYSTEM_PROMPT({
      parent_first_name: 'Sarah',
      stage: 'pregnancy',
      pregnancy_week: 32,
      due_date: '2026-06-01',
    })
    expect(prompt).toContain('pregnancy')
  })

  it('includes pregnancy-specific details when stage is pregnancy', () => {
    const prompt = MASTER_SYSTEM_PROMPT({
      parent_first_name: 'Sarah',
      stage: 'pregnancy',
      baby_name: 'Baby',
      pregnancy_week: 28,
      due_date: '2026-07-15',
    })
    expect(prompt).toContain('Pregnancy week: 28')
    expect(prompt).toContain('2026-07-15')
  })

  it('includes postnatal details when stage is not pregnancy', () => {
    const prompt = MASTER_SYSTEM_PROMPT({
      parent_first_name: 'Sarah',
      stage: 'infant',
      baby_name: 'Meera',
      age_in_weeks: 8,
      age_display_string: 'Meera · 8 weeks',
    })
    expect(prompt).toContain('Meera')
    expect(prompt).toContain('8 weeks')
  })

  it('uses "your baby" when baby_name is undefined in pregnancy', () => {
    const prompt = MASTER_SYSTEM_PROMPT({
      parent_first_name: 'Sarah',
      stage: 'pregnancy',
      pregnancy_week: 20,
      due_date: '2026-08-01',
    })
    expect(prompt).toContain('your baby')
  })

  it('includes character rules', () => {
    const prompt = MASTER_SYSTEM_PROMPT({
      parent_first_name: 'Sarah',
      stage: 'infant',
    })
    expect(prompt).toContain('YOUR CHARACTER')
    expect(prompt).toContain('Warm and nurturing')
  })

  it('includes hard rules', () => {
    const prompt = MASTER_SYSTEM_PROMPT({
      parent_first_name: 'Sarah',
      stage: 'infant',
    })
    expect(prompt).toContain('HARD RULES')
    expect(prompt).toContain('Never diagnose')
    expect(prompt).toContain('Never say')
  })

  it('includes stage tone modifiers', () => {
    const prompt = MASTER_SYSTEM_PROMPT({
      parent_first_name: 'Sarah',
      stage: 'toddler',
    })
    expect(prompt).toContain('STAGE TONE MODIFIERS')
    expect(prompt).toContain('Toddler')
  })

  it('identifies itself as Lumira', () => {
    const prompt = MASTER_SYSTEM_PROMPT({
      parent_first_name: 'Sarah',
      stage: 'infant',
    })
    expect(prompt).toContain('You are Lumira')
    expect(prompt).toContain('hellolumira.app')
  })
})

// ── callClaude ─────────────────────────────────────────────────────────

describe('callClaude', () => {
  it('returns text content from a successful API call', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'Hello, this is Lumira.' }],
    })
    const result = await callClaude('system prompt', 'user message')
    expect(result).toBe('Hello, this is Lumira.')
  })

  it('calls the API with correct parameters', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'response' }],
    })
    await callClaude('my system prompt', 'my user message', 500)
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'claude-sonnet-4-6',
        max_tokens: 500,
        system: 'my system prompt',
        messages: [{ role: 'user', content: 'my user message' }],
      }),
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    )
  })

  it('uses default max_tokens of 800', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'response' }],
    })
    await callClaude('system', 'message')
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ max_tokens: 800 }),
      expect.anything()
    )
  })

  it('throws on empty response content', async () => {
    mockCreate.mockResolvedValueOnce({ content: [] })
    await expect(callClaude('system', 'message')).rejects.toThrow(
      'Empty response from Claude API'
    )
  })

  it('throws on null response content', async () => {
    mockCreate.mockResolvedValueOnce({ content: null })
    await expect(callClaude('system', 'message')).rejects.toThrow(
      'Empty response from Claude API'
    )
  })

  it('throws on undefined response content', async () => {
    mockCreate.mockResolvedValueOnce({ content: undefined })
    await expect(callClaude('system', 'message')).rejects.toThrow(
      'Empty response from Claude API'
    )
  })

  it('throws on non-text content block type', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'tool_use', id: 'tool-1' }],
    })
    await expect(callClaude('system', 'message')).rejects.toThrow(
      'Unexpected response block type'
    )
  })

  it('propagates API errors', async () => {
    mockCreate.mockRejectedValueOnce(new Error('API rate limited'))
    await expect(callClaude('system', 'message')).rejects.toThrow('API rate limited')
  })

  it('propagates network errors', async () => {
    mockCreate.mockRejectedValueOnce(new Error('Network error'))
    await expect(callClaude('system', 'message')).rejects.toThrow('Network error')
  })
})

// ── callClaudeJSON ─────────────────────────────────────────────────────

describe('callClaudeJSON', () => {
  it('parses plain JSON response', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: '{"key": "value", "count": 42}' }],
    })
    const result = await callClaudeJSON<{ key: string; count: number }>('system', 'message')
    expect(result).toEqual({ key: 'value', count: 42 })
  })

  it('strips markdown code fences from response', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: '```json\n{"key": "value"}\n```' }],
    })
    const result = await callClaudeJSON<{ key: string }>('system', 'message')
    expect(result).toEqual({ key: 'value' })
  })

  it('strips code fences without json language hint', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: '```\n{"key": "value"}\n```' }],
    })
    const result = await callClaudeJSON<{ key: string }>('system', 'message')
    expect(result).toEqual({ key: 'value' })
  })

  it('uses default max_tokens of 1000', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: '{}' }],
    })
    await callClaudeJSON('system', 'message')
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ max_tokens: 1000 }),
      expect.anything()
    )
  })

  it('respects custom max_tokens', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: '{}' }],
    })
    await callClaudeJSON('system', 'message', 2000)
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ max_tokens: 2000 }),
      expect.anything()
    )
  })

  it('throws on invalid JSON response', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'not valid json at all' }],
    })
    await expect(callClaudeJSON('system', 'message')).rejects.toThrow()
  })

  it('handles nested JSON objects', async () => {
    const nested = { a: { b: { c: [1, 2, 3] } } }
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: JSON.stringify(nested) }],
    })
    const result = await callClaudeJSON('system', 'message')
    expect(result).toEqual(nested)
  })

  it('handles JSON arrays', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: '[1, 2, 3]' }],
    })
    const result = await callClaudeJSON<number[]>('system', 'message')
    expect(result).toEqual([1, 2, 3])
  })

  it('propagates upstream callClaude errors', async () => {
    mockCreate.mockRejectedValueOnce(new Error('Service unavailable'))
    await expect(callClaudeJSON('system', 'message')).rejects.toThrow('Service unavailable')
  })

  it('throws on empty JSON string', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: '' }],
    })
    // Empty string after trim is not valid JSON
    await expect(callClaudeJSON('system', 'message')).rejects.toThrow()
  })
})

/**
 * Sanitizes user input before injecting into AI prompts.
 * Layers multiple defenses: Unicode normalization, zero-width stripping,
 * regex pattern matching, and length limiting.
 *
 * NOTE: Regex-based sanitization is a supplementary defense. The primary
 * defense is the system prompt's instructions to Claude to resist manipulation.
 */
export function sanitizeForPrompt(input: string): string {
  // Layer 1: Unicode normalization to collapse homoglyphs (e.g., Cyrillic 'е' → Latin 'e')
  let sanitized = input.normalize('NFKC')

  // Layer 2: Strip zero-width and invisible characters that could hide injection payloads
  sanitized = sanitized.replace(/[\u200B-\u200F\u2028-\u202F\uFEFF\u00AD\u034F\u061C\u115F\u1160\u17B4\u17B5\u180E\u2000-\u200A\u2060-\u2064\u2066-\u206F]/g, '')

  // Layer 3: Strip common injection patterns
  sanitized = sanitized
    // Strip system/assistant role injection attempts
    .replace(/\b(system|assistant|human)\s*:/gi, '')
    // Strip instruction override attempts
    .replace(/ignore\s+(all\s+)?(previous|above|prior)\s+(instructions?|prompts?|rules?)/gi, '')
    .replace(/forget\s+(all\s+)?(previous|above|prior)\s+(instructions?|context)/gi, '')
    .replace(/disregard\s+(all\s+)?(previous|above|prior)\s+(instructions?|prompts?|rules?)/gi, '')
    // Strip XML/markdown prompt structure manipulation
    .replace(/<\/?(?:system|prompt|instruction|context|role|message|tool_use|function_call)[^>]*>/gi, '')
    // Strip triple backtick blocks that might redefine context
    .replace(/```(?:system|prompt|instruction)[\s\S]*?```/gi, '')
    // Strip attempts to redefine the AI's identity
    .replace(/you\s+are\s+(now|no\s+longer)\s+/gi, '')
    .replace(/act\s+as\s+(if\s+you\s+are\s+)?/gi, '')
    .replace(/pretend\s+(to\s+be|you\s+are)\s+/gi, '')
    // Strip Base64-encoded instruction patterns (common evasion technique)
    .replace(/\b(?:eval|atob|decode)\s*\(/gi, '')
    // Trim excessive whitespace
    .replace(/\s{3,}/g, '  ')
    .trim()

  // Layer 4: Truncate to reasonable max length (prevent token stuffing)
  const MAX_INPUT_LENGTH = 4000
  if (sanitized.length > MAX_INPUT_LENGTH) {
    sanitized = sanitized.slice(0, MAX_INPUT_LENGTH)
  }

  return sanitized
}

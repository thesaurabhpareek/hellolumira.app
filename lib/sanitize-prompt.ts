/**
 * Sanitizes user input before injecting into AI prompts.
 * Strips patterns that could manipulate the AI's behavior.
 */
export function sanitizeForPrompt(input: string): string {
  // Remove common injection patterns
  let sanitized = input
    // Strip system/assistant role injection attempts
    .replace(/\b(system|assistant|human)\s*:/gi, '')
    // Strip instruction override attempts
    .replace(/ignore\s+(all\s+)?(previous|above|prior)\s+(instructions?|prompts?|rules?)/gi, '')
    .replace(/forget\s+(all\s+)?(previous|above|prior)\s+(instructions?|context)/gi, '')
    // Strip XML/markdown prompt structure manipulation
    .replace(/<\/?(?:system|prompt|instruction|context|role)[^>]*>/gi, '')
    // Strip triple backtick blocks that might redefine context
    .replace(/```(?:system|prompt|instruction)[\s\S]*?```/gi, '')
    // Strip attempts to redefine the AI's identity
    .replace(/you\s+are\s+(now|no\s+longer)\s+/gi, '')
    .replace(/act\s+as\s+(if\s+you\s+are\s+)?/gi, '')
    // Trim excessive whitespace
    .replace(/\s{3,}/g, '  ')
    .trim()

  // Truncate to reasonable max length (prevent token stuffing)
  const MAX_INPUT_LENGTH = 4000
  if (sanitized.length > MAX_INPUT_LENGTH) {
    sanitized = sanitized.slice(0, MAX_INPUT_LENGTH)
  }

  return sanitized
}

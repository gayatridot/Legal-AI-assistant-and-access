/**
 * @fileoverview Sanitization and Security Safeguards for Legal Text Ingestion.
 * Implements strict input normalization, malicious injection stripping, and size guarding.
 */

/**
 * Common prompt injection and system jailbreak patterns that could manipulate the AI
 * to bypass legal disclaimers or leak system instructions.
 */
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior)\s+instructions/gi,
  /disregard\s+(all\s+)?(previous|prior)\s+instructions/gi,
  /you\s+are\s+now\s+in\s+(developer|unfiltered|jailbreak)\s+mode/gi,
  /reveal\s+(your\s+)?(system\s+prompt|instructions|api\s+key)/gi,
  /act\s+as\s+a\s+licensed\s+attorney\s+and\s+provide\s+binding\s+legal\s+advice/gi,
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /<\/?(?:iframe|object|embed|applet)\b[^>]*>/gi,
];

/**
 * Sanitizes raw legal document text or user questions.
 * Strips control characters, dangerous script tags, and neutralizes prompt-injection attempts.
 *
 * @param input - The raw text received from file upload or user prompt.
 * @param maxLength - Optional maximum character cap (defaults to 120,000 characters ~ 25k tokens).
 * @returns Cleaned, safe string ready for LLM and Vector Store embedding.
 */
export function sanitizeLegalText(input: unknown, maxLength = 120000): string {
  if (typeof input !== 'string') {
    return '';
  }

  // 1. Remove null bytes and non-printable ASCII control characters (preserving newlines & tabs)
  let cleaned = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // 2. Neutralize known prompt injection attempts by replacing them with a safe placeholder
  for (const pattern of INJECTION_PATTERNS) {
    cleaned = cleaned.replace(pattern, '[SECURITY_FILTERED_TEXT]');
  }

  // 3. Normalize repeated whitespace while preserving paragraph structure
  cleaned = cleaned
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // 4. Enforce size guardrail
  if (cleaned.length > maxLength) {
    cleaned = cleaned.slice(0, maxLength) + '\n\n[DOCUMENT_TRUNCATED_AT_MAX_SAFE_LIMIT]';
  }

  return cleaned;
}

/**
 * Validates whether a given text passes basic legal document criteria
 * (e.g. non-empty, contains substantive text).
 *
 * @param text - The text to validate.
 * @param isPdf - Whether the text originated from a PDF file upload.
 * @returns { isValid: boolean; error?: string }
 */
export function validateDocumentText(text: string, isPdf = false): { isValid: boolean; error?: string } {
  const trimmed = (text || '').trim();
  if (!trimmed || trimmed.length < 30) {
    return {
      isValid: false,
      error: isPdf
        ? 'No readable text could be extracted from this PDF. The document may be scanned, image-only, or password-protected. Please copy and paste the clause text directly into the text analyzer.'
        : 'The uploaded document is too short or empty. Please provide at least 30 characters of legal text.',
    };
  }

  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
  if (wordCount < 4) {
    return {
      isValid: false,
      error: 'The document does not contain enough textual content for substantive legal analysis.',
    };
  }

  return { isValid: true };
}

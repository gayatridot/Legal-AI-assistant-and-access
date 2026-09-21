/**
 * @fileoverview Google Gemini AI client configuration and prompt execution helpers.
 * Reads strictly from process.env.GEMINI_API_KEY with user-agent telemetry.
 */

import { GoogleGenAI } from '@google/genai';

/**
 * Global system guardrail injected into every legal analysis & conversational prompt.
 * Strictly prevents the model from generating binding legal advice or establishing attorney-client privilege.
 */
export const LEGAL_GUARDRAIL_SYSTEM_PROMPT = `
You are LexiGuard, an AI legal document assistant designed for legal education, contract comprehension, and risk assessment.
CRITICAL COMPLIANCE RULES:
1. You provide educational analysis, risk assessment, and clause translation only.
2. You DO NOT provide formal, binding legal counsel or representation.
3. You NEVER claim to be the user's licensed attorney.
4. When highlighting risks, explain the business & practical implications in simple 8th-grade English.
5. If the user asks whether they should sign or asks for a binding legal opinion, advise them to consult a qualified licensed legal professional in their jurisdiction, and provide specific questions they can bring to their lawyer.
6. Always base factual statements about the contract strictly on the provided text. Never hallucinate terms not in the document.
`;

let genAiClient: GoogleGenAI | null = null;
let lastApiKey: string | undefined = undefined;

/**
 * Retrieves or lazily instantiates the Google Gen AI client.
 * Dynamically re-instantiates if process.env.GEMINI_API_KEY changes at runtime.
 *
 * @returns GoogleGenAI instance
 */
export function getGeminiClient(): GoogleGenAI {
  const currentKey = process.env.GEMINI_API_KEY;
  if (!genAiClient || lastApiKey !== currentKey) {
    if (!currentKey) {
      console.warn('[LexiGuard] GEMINI_API_KEY environment variable is not defined.');
    }
    genAiClient = new GoogleGenAI({
      apiKey: currentKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    lastApiKey = currentKey;
  }
  return genAiClient;
}

/**
 * The recommended high-speed, cost-effective Gemini model for contract analysis.
 */
export const DEFAULT_GEMINI_MODEL = 'gemini-3.6-flash';

/**
 * Secondary candidate models used if the primary model hits temporary 503 high demand or capacity limits.
 */
export const FALLBACK_GEMINI_MODELS = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];

export interface ResilienceGenerateOptions {
  contents: any;
  config?: any;
  models?: string[];
  perModelTimeoutMs?: number;
}

/**
 * Generates content using the primary model and automatically cascades to fallback models
 * if a transient 503, rate-limit, or timeout occurs.
 */
export async function generateWithResilience(
  options: ResilienceGenerateOptions
): Promise<{ text: string; modelUsed: string }> {
  const ai = getGeminiClient();
  const models =
    options.models && options.models.length > 0
      ? options.models
      : [DEFAULT_GEMINI_MODEL, ...FALLBACK_GEMINI_MODELS];
  const timeoutMs = options.perModelTimeoutMs || 30000;

  let lastError: unknown = null;

  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Model ${model} timed out after ${timeoutMs}ms`)), timeoutMs)
      );

      const requestPromise = ai.models.generateContent({
        model,
        contents: options.contents,
        config: {
          thinkingConfig: { thinkingBudget: 0 },
          ...(options.config || {}),
        },
      });

      const response: any = await Promise.race([requestPromise, timeoutPromise]);
      const text = response?.text;
      if (typeof text === 'string' && text.length > 0) {
        return { text, modelUsed: model };
      }
    } catch (err: unknown) {
      lastError = err;
      // If there is an alternate model available, briefly yield and attempt the next candidate
      if (i < models.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }
  }

  throw lastError || new Error('All model candidates failed.');
}

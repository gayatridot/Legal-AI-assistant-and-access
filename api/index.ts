/**
 * @fileoverview Vercel Serverless Function Handler
 * Single entry-point for all /api/* routes deployed on Vercel.
 * Exports a standard (req, res) handler that Vercel's Node.js runtime understands.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { analyzeLegalDocument } from '../lib/document-analyzer.js';
import { queryDocumentRAG } from '../lib/rag.js';
import { sanitizeLegalText, validateDocumentText } from '../lib/sanitizer.js';
import { parsePdfBuffer } from '../lib/pdf-parser.js';

// Helper: read the full body as a string (Vercel Node runtime does NOT auto-parse)
async function readBody(req: VercelRequest): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    if (req.body && typeof req.body === 'object') {
      // Vercel may pre-parse JSON if Content-Type is application/json
      resolve(req.body as Record<string, unknown>);
      return;
    }
    let raw = '';
    req.on('data', (chunk: Buffer) => { raw += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(raw.length ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

function json(res: VercelResponse, status: number, body: unknown) {
  res.setHeader('Content-Type', 'application/json');
  res.status(status).end(JSON.stringify(body));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers so browser requests work
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const url = req.url || '';

  // ── GET /api/health ──────────────────────────────────────────────────────────
  if (req.method === 'GET' && url.includes('/health')) {
    json(res, 200, {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      geminiConfigured: Boolean(
        process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY',
      ),
    });
    return;
  }

  // ── POST /api/analyze ────────────────────────────────────────────────────────
  if (req.method === 'POST' && url.includes('/analyze')) {
    try {
      const body = await readBody(req);
      const { documentText, fileName, fileBase64, isPdf } = body as {
        documentText?: string;
        fileName?: string;
        fileBase64?: string;
        isPdf?: boolean;
      };

      let textToAnalyze = (documentText as string) || '';

      if (fileBase64 && isPdf) {
        try {
          const buffer = Buffer.from(fileBase64 as string, 'base64');
          if (buffer.length === 0) {
            json(res, 400, { error: 'The uploaded PDF file appears to be empty.' });
            return;
          }
          const pdfData = await parsePdfBuffer(buffer);
          textToAnalyze = pdfData.text;
        } catch (pdfErr: unknown) {
          const pdfMsg = pdfErr instanceof Error ? pdfErr.message : 'PDF parsing failed';
          json(res, 400, {
            error: `Could not extract text from this PDF: ${pdfMsg}. Try pasting the text directly.`,
          });
          return;
        }
      }

      const sanitized = sanitizeLegalText(textToAnalyze);
      const validation = validateDocumentText(sanitized, Boolean(isPdf));

      if (!validation.isValid) {
        json(res, 400, { error: validation.error });
        return;
      }

      const analysis = await analyzeLegalDocument(
        sanitized,
        (fileName as string) || 'Legal-Document.pdf',
      );
      json(res, 200, analysis);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Analysis failed';
      console.error('[/api/analyze]', err);
      json(res, 500, { error: msg });
    }
    return;
  }

  // ── POST /api/chat ───────────────────────────────────────────────────────────
  if (req.method === 'POST' && url.includes('/chat')) {
    try {
      const body = await readBody(req);
      const { documentId, documentText, query, chatHistory } = body as {
        documentId?: string;
        documentText?: string;
        query?: string;
        chatHistory?: Array<{ sender: 'user' | 'assistant'; content: string }>;
      };

      if (!query || (query as string).trim().length === 0) {
        json(res, 400, { error: 'A query string is required.' });
        return;
      }
      if (!documentText || (documentText as string).trim().length === 0) {
        json(res, 400, { error: 'Document context is required for grounded RAG answers.' });
        return;
      }

      const sanitizedQuery = sanitizeLegalText(query as string, 1000);
      const sanitizedDocText = sanitizeLegalText(documentText as string);

      const ragResult = await queryDocumentRAG({
        documentId: (documentId as string) || 'active-doc',
        documentText: sanitizedDocText,
        query: sanitizedQuery,
        history: chatHistory,
      });

      json(res, 200, ragResult);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'RAG chat query failed';
      console.error('[/api/chat]', err);
      json(res, 500, { error: msg });
    }
    return;
  }

  // ── 404 fallback ─────────────────────────────────────────────────────────────
  json(res, 404, { error: 'API route not found.' });
}

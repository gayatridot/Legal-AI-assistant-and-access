/**
 * @fileoverview Vercel Serverless API Route: POST /api/analyze
 * Handles both plain-text and base64 PDF payloads, sanitizes inputs,
 * and runs comprehensive clause analysis via Gemini AI with algorithmic fallback.
 */

import { analyzeLegalDocument } from '../../../lib/document-analyzer.js';
import { sanitizeLegalText, validateDocumentText } from '../../../lib/sanitizer.js';

export async function POST(req: Request): Promise<Response> {
  try {
    const body = await req.json();

    const { documentText, fileName, fileBase64, isPdf } = body as {
      documentText?: string;
      fileName?: string;
      fileBase64?: string;
      isPdf?: boolean;
    };

    let textToAnalyze = documentText || '';

    // ── PDF base64 path (matches what the front-end sends) ──
    if (fileBase64 && isPdf) {
      try {
        const buffer = Buffer.from(fileBase64, 'base64');

        if (buffer.length === 0) {
          return new Response(
            JSON.stringify({ error: 'The uploaded PDF file appears to be empty. Please select a valid document.' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } },
          );
        }

        // Dynamic import keeps pdf-parse out of the cold-start critical path
        const { parsePdfBuffer } = await import('../../../lib/pdf-parser.js');
        const pdfResult = await parsePdfBuffer(buffer);
        textToAnalyze = pdfResult.text;
      } catch (pdfErr: unknown) {
        const pdfMsg = pdfErr instanceof Error ? pdfErr.message : 'PDF parsing failed';
        return new Response(
          JSON.stringify({
            error: `Could not extract text from this PDF: ${pdfMsg}. If the PDF contains scanned images, please paste the clause text directly.`,
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        );
      }
    }

    const sanitized = sanitizeLegalText(textToAnalyze);
    const validation = validateDocumentText(sanitized, Boolean(isPdf));

    if (!validation.isValid) {
      return new Response(
        JSON.stringify({ error: validation.error || 'Document content is insufficient for legal analysis.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const result = await analyzeLegalDocument(sanitized, fileName || 'Legal-Document.pdf');

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal analysis error occurred.';
    console.error('[API /api/analyze error]:', error);

    return new Response(
      JSON.stringify({
        error: message,
        disclaimer: 'Provides educational and informational assistance only; does not replace formal legal counsel.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}

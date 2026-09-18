/**
 * @fileoverview Next.js App Router API Route: /app/api/analyze/route.ts
 * Ingests raw document text or file payload, sanitizes inputs, and runs comprehensive clause analysis.
 */

import { analyzeLegalDocument } from '../../../lib/document-analyzer.js';
import { sanitizeLegalText, validateDocumentText } from '../../../lib/sanitizer.js';

export async function POST(req: Request): Promise<Response> {
  try {
    const contentType = req.headers.get('content-type') || '';
    let documentText = '';
    let fileName = 'Uploaded-Document';

    if (contentType.includes('application/json')) {
      const body = await req.json();
      documentText = body.documentText || '';
      fileName = body.fileName || fileName;
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file');
      const textParam = formData.get('text');

      if (file && typeof file === 'object' && 'arrayBuffer' in file) {
        fileName = (file as File).name;
        const arrayBuf = await (file as File).arrayBuffer();
        const buffer = Buffer.from(arrayBuf);

        // Check if PDF
        if (fileName.toLowerCase().endsWith('.pdf') || (file as File).type === 'application/pdf') {
          const { parsePdfBuffer } = await import('../../../lib/pdf-parser.js');
          const pdfResult = await parsePdfBuffer(buffer);
          documentText = pdfResult.text;
        } else {
          documentText = buffer.toString('utf-8');
        }
      } else if (typeof textParam === 'string') {
        documentText = textParam;
      }
    } else {
      // Direct text stream
      documentText = await req.text();
    }

    const sanitized = sanitizeLegalText(documentText);
    const validation = validateDocumentText(sanitized);

    if (!validation.isValid) {
      return new Response(
        JSON.stringify({
          error: validation.error || 'Document content is insufficient for legal analysis.',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const result = await analyzeLegalDocument(sanitized, fileName);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal analysis error occurred.';
    console.error('[API /api/analyze error]:', error);

    return new Response(
      JSON.stringify({
        error: message,
        disclaimer:
          'Provides educational and informational assistance only; does not replace formal legal counsel.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

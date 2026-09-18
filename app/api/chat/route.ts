/**
 * @fileoverview Next.js App Router API Route: /app/api/chat/route.ts
 * In-Memory Vector Store RAG Q&A endpoint. Grounds responses in specific contract excerpts.
 */

import { queryDocumentRAG } from '../../../lib/rag.js';
import { sanitizeLegalText } from '../../../lib/sanitizer.js';
import { ChatRequestPayload } from '../../../types/legal.js';

export async function POST(req: Request): Promise<Response> {
  try {
    const body: ChatRequestPayload = await req.json();

    if (!body.query || body.query.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Query parameter is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!body.documentText || body.documentText.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Document text context is required for grounded legal Q&A.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const sanitizedQuery = sanitizeLegalText(body.query, 1000);
    const sanitizedDocText = sanitizeLegalText(body.documentText);
    const documentId = body.documentId || 'active-doc-session';

    const ragResult = await queryDocumentRAG({
      documentId,
      documentText: sanitizedDocText,
      query: sanitizedQuery,
      history: body.chatHistory,
    });

    return new Response(JSON.stringify(ragResult), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal RAG query error.';
    console.error('[API /api/chat error]:', error);

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

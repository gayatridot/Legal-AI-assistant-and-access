/**
 * @fileoverview Express + Vite Full-Stack Server
 * Binds to localhost:3000 and routes API endpoints /api/analyze and /api/chat
 * with Vite dev middleware in development and static asset serving in production.
 */

import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { analyzeLegalDocument } from './lib/document-analyzer.js';
import { queryDocumentRAG } from './lib/rag.js';
import { sanitizeLegalText, validateDocumentText } from './lib/sanitizer.js';
import { parsePdfBuffer } from './lib/pdf-parser.js';

dotenv.config();

const PORT = 3000;
const app = express();

// Increase payload limit for large contract text & base64 PDF uploads
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    disclaimer: 'Provides educational and informational assistance only; does not replace formal legal counsel.',
  });
});

/**
 * POST /api/analyze
 * Analyzes legal document text or base64 PDF payload.
 */
app.post('/api/analyze', async (req: Request, res: Response) => {
  try {
    const { documentText, fileName, fileBase64, isPdf } = req.body;
    let textToAnalyze = documentText || '';

    if (fileBase64 && isPdf) {
      try {
        const buffer = Buffer.from(fileBase64, 'base64');
        if (buffer.length === 0) {
          res.status(400).json({
            error: 'The uploaded PDF file appears to be empty. Please select a valid document.',
          });
          return;
        }
        const pdfData = await parsePdfBuffer(buffer);
        textToAnalyze = pdfData.text;
      } catch (pdfErr: unknown) {
        const pdfMsg = pdfErr instanceof Error ? pdfErr.message : 'PDF parsing failed';
        res.status(400).json({
          error: `Could not extract text from this PDF: ${pdfMsg}. If the PDF contains scanned pages or images, please copy and paste the clause text directly into the text analyzer.`,
        });
        return;
      }
    }

    const sanitized = sanitizeLegalText(textToAnalyze);
    const validation = validateDocumentText(sanitized, Boolean(isPdf));

    if (!validation.isValid) {
      res.status(400).json({ error: validation.error });
      return;
    }

    const analysis = await analyzeLegalDocument(sanitized, fileName || 'Legal-Document.pdf');
    res.json(analysis);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Analysis failed';
    console.error('[API /api/analyze error]:', err);
    res.status(500).json({
      error: errorMsg,
      disclaimer: 'Provides educational and informational assistance only; does not replace formal legal counsel.',
    });
  }
});

/**
 * POST /api/chat
 * Grounded RAG Q&A using LangChain in-memory vector store and Gemini.
 */
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { documentId, documentText, query, chatHistory } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      res.status(400).json({ error: 'A query string is required.' });
      return;
    }

    if (!documentText || typeof documentText !== 'string' || documentText.trim().length === 0) {
      res.status(400).json({ error: 'Document context is required for grounded RAG answers.' });
      return;
    }

    const sanitizedQuery = sanitizeLegalText(query, 1000);
    const sanitizedDocText = sanitizeLegalText(documentText);

    const ragResult = await queryDocumentRAG({
      documentId: documentId || 'active-doc',
      documentText: sanitizedDocText,
      query: sanitizedQuery,
      history: chatHistory,
    });

    res.json(ragResult);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'RAG chat query failed';
    console.error('[API /api/chat error]:', err);
    res.status(500).json({
      error: errorMsg,
      disclaimer: 'Provides educational and informational assistance only; does not replace formal legal counsel.',
    });
  }
});

/**
 * Start Server with Vite Middleware
 */
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, 'localhost', () => {
    console.log(`[LexiGuard] Server listening on http://localhost:${PORT}`);
  });
}

start().catch(err => {
  console.error('[LexiGuard] Fatal server startup error:', err);
  process.exit(1);
});

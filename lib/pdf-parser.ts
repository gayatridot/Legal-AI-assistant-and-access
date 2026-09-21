/**
 * @fileoverview Server-side PDF text extraction utility using pdf-parse.
 * Handles binary buffer parsing, text normalization, and graceful error reporting.
 */

import { PDFParse } from 'pdf-parse';
import { sanitizeLegalText } from './sanitizer.js';

export interface PDFExtractionResult {
  text: string;
  pageCount: number;
  info?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * Parses a PDF buffer into sanitized, plain-text string.
 *
 * @param buffer - Buffer or Uint8Array containing PDF file data.
 * @returns Promise resolving to the extracted text and metadata.
 */
export async function parsePdfBuffer(buffer: Buffer | Uint8Array): Promise<PDFExtractionResult> {
  if (!buffer || buffer.length === 0) {
    throw new Error('Empty PDF buffer received.');
  }

  // Ensure standard Node Buffer
  const nodeBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  let parser: any = null;

  try {
    parser = new PDFParse({ data: nodeBuffer });
    const textResult = await parser.getText();
    const infoResult = await parser.getInfo().catch(() => undefined);
    const sanitizedText = sanitizeLegalText(textResult.text || '');

    return {
      text: sanitizedText,
      pageCount: textResult.total || textResult.pages?.length || 1,
      info: infoResult?.info as Record<string, unknown> | undefined,
      metadata: infoResult?.metadata as Record<string, unknown> | undefined,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to parse PDF document: ${message}`);
  } finally {
    if (parser && typeof parser.destroy === 'function') {
      await parser.destroy().catch(() => {});
    }
  }
}

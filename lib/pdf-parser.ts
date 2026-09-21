/**
 * @fileoverview Server-side PDF text extraction utility using pdf-parse v2.
 * Uses the named PDFParse class exported by pdf-parse v2.
 */

import { PDFParse } from 'pdf-parse';
import { sanitizeLegalText } from './sanitizer.js';

export interface PDFExtractionResult {
  text: string;
  pageCount: number;
  info?: Record<string, unknown>;
}

/**
 * Parses a PDF buffer into sanitized, plain-text string.
 */
export async function parsePdfBuffer(buffer: Buffer | Uint8Array): Promise<PDFExtractionResult> {
  if (!buffer || buffer.length === 0) {
    throw new Error('Empty PDF buffer received.');
  }

  const nodeBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);

  let parser: InstanceType<typeof PDFParse> | null = null;
  try {
    parser = new PDFParse({ data: nodeBuffer });
    const textResult = await parser.getText();
    const sanitizedText = sanitizeLegalText(textResult.text || '');

    return {
      text: sanitizedText,
      pageCount: textResult.total || 1,
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

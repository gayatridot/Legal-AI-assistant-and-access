import { sanitizeLegalText } from './sanitizer.js';

export interface PDFExtractionResult {
  text: string;
  pageCount: number;
  info?: Record<string, unknown>;
}

export async function resolvePdfJsLib(): Promise<any> {
  const pdfjsModule = await import('pdfjs-dist/legacy/build/pdf.js');
  const pdfjsLib = (pdfjsModule as any).default ?? pdfjsModule;

  if (typeof pdfjsLib?.getDocument !== 'function') {
    throw new Error('PDF.js failed to initialize in the current runtime.');
  }

  return pdfjsLib;
}

export async function parsePdfBuffer(buffer: Buffer | Uint8Array): Promise<PDFExtractionResult> {
  if (!buffer || buffer.length === 0) {
    throw new Error('Empty PDF buffer received.');
  }

  const uint8Array = buffer instanceof Uint8Array
    ? new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength)
    : new Uint8Array(buffer);

  const pdfjsLib = await resolvePdfJsLib();

  if (pdfjsLib.GlobalWorkerOptions) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '';
  }

  const loadingTask = pdfjsLib.getDocument({
    data: uint8Array,
    useSystemFonts: true,
    disableWorker: true,
    isEvalSupported: false,
  });

  const pdf = await loadingTask.promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => (item as any).str || '')
      .join(' ');
    fullText += pageText + '\n\n';
  }

  if (!fullText.trim()) {
    throw new Error('No readable text found. This PDF may be scanned or image-only.');
  }

  return {
    text: sanitizeLegalText(fullText),
    pageCount: pdf.numPages,
    info: {},
  };
}
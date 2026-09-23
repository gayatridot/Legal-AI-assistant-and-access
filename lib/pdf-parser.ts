import { sanitizeLegalText } from './sanitizer.js';

export interface PDFExtractionResult {
  text: string;
  pageCount: number;
  info?: Record<string, unknown>;
}

export function normalizePdfJsLib(pdfjsModule: any): any {
  if (!pdfjsModule || (typeof pdfjsModule !== 'object' && typeof pdfjsModule !== 'function')) {
    throw new Error('PDF.js module is unavailable in the current runtime.');
  }

  const seen = new Set<any>();
  const queue = [pdfjsModule];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || typeof current !== 'object' && typeof current !== 'function') {
      continue;
    }
    if (seen.has(current)) {
      continue;
    }
    seen.add(current);

    if (typeof current.getDocument === 'function') {
      if (current.GlobalWorkerOptions) {
        current.GlobalWorkerOptions.workerSrc = '';
      }
      return current;
    }

    if (current.default && !seen.has(current.default)) {
      queue.push(current.default);
    }
  }

  throw new Error('PDF.js failed to initialize in the current runtime.');
}

export async function resolvePdfJsLib(): Promise<any> {
  const importCandidates = [
    'pdfjs-dist/legacy/build/pdf.js',
    'pdfjs-dist/legacy/build/pdf.mjs',
  ];

  let lastError: unknown;

  for (const specifier of importCandidates) {
    try {
      const pdfjsModule = await import(specifier);
      return normalizePdfJsLib(pdfjsModule);
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(lastError instanceof Error ? lastError.message : 'PDF.js failed to initialize in the current runtime.');
}

export async function parsePdfBuffer(buffer: Buffer | Uint8Array): Promise<PDFExtractionResult> {
  if (!buffer || buffer.length === 0) {
    throw new Error('Empty PDF buffer received.');
  }

  const uint8Array = buffer instanceof Uint8Array
    ? new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength)
    : new Uint8Array(buffer);

  const pdfjsLib = await resolvePdfJsLib();

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
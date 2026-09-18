/**
 * @fileoverview In-Memory RAG (Retrieval-Augmented Generation) Pipeline.
 * Orchestrates LangChain Document chunking, in-memory vector storage, similarity search,
 * and grounded citation extraction for document-specific Q&A.
 */

import { Document } from '@langchain/core/documents';
import { VectorStore } from '@langchain/core/vectorstores';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { RAGCitation } from '../types/legal.js';
import {
  getGeminiClient,
  DEFAULT_GEMINI_MODEL,
  LEGAL_GUARDRAIL_SYSTEM_PROMPT,
  generateWithResilience,
} from './gemini.js';

/**
 * Computes standard Cosine Similarity between two numerical vectors.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

/**
 * In-Memory Vector Store implementation extending LangChain's VectorStore abstract base class.
 * Provides serverless, zero-cost vector indexing and similarity search in Node and browser.
 */
export class MemoryVectorStore extends VectorStore {
  memoryVectors: Array<{ content: string; embedding: number[]; metadata: Record<string, any> }> = [];

  _vectorstoreType(): string {
    return 'memory';
  }

  async addVectors(vectors: number[][], documents: Document[]): Promise<void> {
    for (let i = 0; i < documents.length; i++) {
      this.memoryVectors.push({
        content: documents[i].pageContent,
        embedding: vectors[i],
        metadata: documents[i].metadata || {},
      });
    }
  }

  async addDocuments(documents: Document[]): Promise<void> {
    const texts = documents.map(doc => doc.pageContent);
    const vectors = await this.embeddings.embedDocuments(texts);
    return this.addVectors(vectors, documents);
  }

  async similaritySearchVectorWithScore(queryVector: number[], k = 4): Promise<[Document, number][]> {
    const matches: Array<{ doc: Document; score: number }> = [];

    for (const item of this.memoryVectors) {
      const score = cosineSimilarity(queryVector, item.embedding);
      matches.push({
        doc: new Document({ pageContent: item.content, metadata: item.metadata }),
        score,
      });
    }

    matches.sort((a, b) => b.score - a.score);
    return matches.slice(0, k).map(m => [m.doc, m.score]);
  }

  async similaritySearch(query: string, k = 4): Promise<Document[]> {
    const queryVector = await this.embeddings.embedQuery(query);
    const results = await this.similaritySearchVectorWithScore(queryVector, k);
    return results.map(([doc]) => doc);
  }

  async similaritySearchWithScore(query: string, k = 4): Promise<[Document, number][]> {
    const queryVector = await this.embeddings.embedQuery(query);
    return this.similaritySearchVectorWithScore(queryVector, k);
  }

  static async fromDocuments(docs: Document[], embeddings: any): Promise<MemoryVectorStore> {
    const store = new MemoryVectorStore(embeddings, {});
    await store.addDocuments(docs);
    return store;
  }
}

/**
 * Lightweight deterministic embedding fallback for offline test environments
 * or when Gemini API key is not yet configured. Computes a normalized bag-of-words / character n-gram vector.
 */
export class FastFallbackEmbeddings {
  private dimension = 64;

  async embedDocuments(documents: string[]): Promise<number[][]> {
    return Promise.all(documents.map(doc => this.embedQuery(doc)));
  }

  async embedQuery(text: string): Promise<number[]> {
    const vector = new Array(this.dimension).fill(0);
    const tokens = text.toLowerCase().match(/\b\w+\b/g) || [];

    for (const token of tokens) {
      let hash = 0;
      for (let i = 0; i < token.length; i++) {
        hash = (hash << 5) - hash + token.charCodeAt(i);
        hash |= 0;
      }
      const index = Math.abs(hash) % this.dimension;
      vector[index] += 1;
    }

    // L2 Normalize
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0)) || 1;
    return vector.map(v => v / magnitude);
  }
}

/**
 * Global cache of initialized vector stores keyed by document ID.
 */
const vectorStoreCache = new Map<string, MemoryVectorStore>();

/**
 * Splits legal document text into structured clause-aware chunks.
 * Uses legal section numbering patterns (e.g. "Section 1", "Article II", "1.1")
 * or falls back to paragraph boundaries.
 *
 * @param text - Raw legal document text.
 * @param maxChunkSize - Maximum character length per chunk (default 1200).
 * @returns Array of LangChain Document objects with metadata.
 */
export function chunkLegalDocument(text: string, maxChunkSize = 1200): Document[] {
  if (!text || text.trim().length === 0) return [];

  // Match legal section headers: e.g., "1. Term", "Section 4. Termination", "ARTICLE III"
  const sectionSplitRegex = /(?=(?:^|\n)(?:(?:SECTION|ARTICLE|CLAUSE)\s+[\dIVXLCDM]+|[0-9]+\.[0-9]*\s+[A-Z]))/i;
  let rawSections = text.split(sectionSplitRegex).map(s => s.trim()).filter(Boolean);

  // If no numbered sections detected, split by double newlines (paragraphs)
  if (rawSections.length <= 1) {
    rawSections = text.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);
  }

  const chunks: Document[] = [];
  let chunkIndex = 0;

  for (const section of rawSections) {
    if (section.length <= maxChunkSize) {
      const firstLine = section.split('\n')[0].slice(0, 80);
      chunks.push(
        new Document({
          pageContent: section,
          metadata: {
            chunkId: `chunk-${chunkIndex++}`,
            heading: firstLine || `Clause ${chunkIndex}`,
          },
        })
      );
    } else {
      // Sub-divide oversized sections
      let cursor = 0;
      while (cursor < section.length) {
        const slice = section.slice(cursor, cursor + maxChunkSize);
        chunks.push(
          new Document({
            pageContent: slice,
            metadata: {
              chunkId: `chunk-${chunkIndex++}`,
              heading: section.split('\n')[0].slice(0, 80) + ` (Part ${Math.floor(cursor / maxChunkSize) + 1})`,
            },
          })
        );
        cursor += maxChunkSize - 100; // 100 char overlap
      }
    }
  }

  return chunks;
}

/**
 * Builds or retrieves an in-memory vector store for a given legal document.
 *
 * @param documentId - Unique identifier for the document session.
 * @param documentText - Raw text content of the document.
 * @returns In-Memory Vector Store populated with document chunks.
 */
export async function getOrBuildVectorStore(
  documentId: string,
  documentText: string,
  forceFallback = false
): Promise<MemoryVectorStore> {
  const cached = vectorStoreCache.get(documentId);
  if (cached && !forceFallback) {
    return cached;
  }

  const chunks = chunkLegalDocument(documentText);
  const apiKey = process.env.GEMINI_API_KEY;

  let embeddings: any = new FastFallbackEmbeddings();

  if (!forceFallback && apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.length > 10 && process.env.NODE_ENV !== 'test') {
    try {
      embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey,
        modelName: 'gemini-embedding-2-preview',
      });
    } catch {
      embeddings = new FastFallbackEmbeddings();
    }
  }

  try {
    const vectorStore = await MemoryVectorStore.fromDocuments(chunks, embeddings);
    vectorStoreCache.set(documentId, vectorStore);
    return vectorStore;
  } catch {
    // If external embedding API fails, fallback to deterministic FastFallbackEmbeddings
    const fallbackStore = await MemoryVectorStore.fromDocuments(chunks, new FastFallbackEmbeddings());
    vectorStoreCache.set(documentId, fallbackStore);
    return fallbackStore;
  }
}

/**
 * Queries the in-memory vector store for relevant document chunks and synthesizes
 * a grounded, cited answer using Gemini.
 *
 * @param params - Query parameters including question, document text, and optional history.
 * @returns Grounded answer with source citations and compliance disclaimer.
 */
export async function queryDocumentRAG(params: {
  documentId: string;
  documentText: string;
  query: string;
  history?: Array<{ sender: 'user' | 'assistant'; content: string }>;
}): Promise<{ answer: string; citations: RAGCitation[]; disclaimer: string }> {
  const { documentId, documentText, query, history = [] } = params;

  // Retrieve relevant chunks via Vector Store
  const vectorStore = await getOrBuildVectorStore(documentId, documentText);
  const searchResults = await vectorStore.similaritySearchWithScore(query, 3);

  const citations: RAGCitation[] = searchResults.map(([doc, score]) => ({
    clauseId: doc.metadata?.chunkId || 'clause-ref',
    clauseTitle: doc.metadata?.heading || 'Contract Excerpt',
    snippet: doc.pageContent.slice(0, 300) + (doc.pageContent.length > 300 ? '...' : ''),
    score: typeof score === 'number' ? Math.max(10, Math.round(score * 100)) : 85,
  }));

  const contextText = searchResults
    .map(([doc], i) => `[Source ${i + 1}: ${doc.metadata?.heading || 'Section'}]\n${doc.pageContent}`)
    .join('\n\n');

  const disclaimer =
    'Provides educational and informational assistance only; does not replace formal legal counsel.';

  // If Gemini API is available, ask Gemini to ground its answer strictly in the context
  const ai = getGeminiClient();
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const historyContext = history
        .slice(-4)
        .map(h => `${h.sender === 'user' ? 'User' : 'Assistant'}: ${h.content}`)
        .join('\n');

      const prompt = `
System Guardrail: ${LEGAL_GUARDRAIL_SYSTEM_PROMPT}

DOCUMENT CONTEXT RETRIEVED VIA VECTOR SEARCH:
${contextText}

PRIOR CHAT CONVERSATION:
${historyContext || 'None'}

USER QUESTION:
"${query}"

INSTRUCTIONS:
1. Answer the user's question clearly in plain, accessible 8th-grade English.
2. Ground your answer strictly in the provided document excerpts above.
3. Explicitly mention the specific section or clause names where the information originates.
4. If the document does not mention the answer, clearly state: "This contract does not explicitly state provisions regarding this issue."
5. Include a brief note on practical implications or risks for the user.
6. Reiterate that this explanation is educational and not binding legal counsel.
`;

      const { text: answerText } = await generateWithResilience({
        contents: prompt,
        perModelTimeoutMs: 25000,
      });

      return {
        answer: answerText || 'No response could be generated from the document context.',
        citations,
        disclaimer,
      };
    } catch {
      // Graceful fallback to retrieved context excerpts if all generative models are offline
    }
  }

  // Graceful fallback when API key is missing or offline
  const fallbackAnswer = `Based on the document excerpts retrieved:\n\n` +
    citations.map((c, i) => `• In **${c.clauseTitle}**: "${c.snippet}"`).join('\n\n') +
    `\n\n*Note: To enable live deep generative reasoning, please ensure your GEMINI_API_KEY is configured.*`;

  return {
    answer: fallbackAnswer,
    citations,
    disclaimer,
  };
}

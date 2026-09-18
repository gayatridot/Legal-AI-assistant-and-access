/**
 * @fileoverview Unit tests for RAG text chunking, in-memory vector storage, and semantic retrieval.
 */

import { describe, it, expect } from 'vitest';
import {
  chunkLegalDocument,
  FastFallbackEmbeddings,
  getOrBuildVectorStore,
} from '../lib/rag.js';

describe('In-Memory RAG & Vector Retrieval', () => {
  const sampleContract = `
    SECTION 1. CONFIDENTIALITY
    The Receiving Party shall maintain all Proprietary Information in strict confidence and shall not disclose it to any third party.

    SECTION 2. TERMINATION AND NOTICE
    Either party may terminate this agreement upon thirty (30) days prior written notice to the other party.

    SECTION 3. LIMITATION OF LIABILITY
    IN NO EVENT SHALL EITHER PARTY BE LIABLE FOR INDIRECT, INCIDENTAL, OR PUNITIVE DAMAGES. TOTAL LIABILITY SHALL BE CAPPED AT $10,000.
  `;

  it('should segment legal text into structured section-aware chunks', () => {
    const chunks = chunkLegalDocument(sampleContract);
    expect(chunks.length).toBeGreaterThanOrEqual(3);
    expect(chunks[0].metadata?.heading).toBeDefined();
  });

  it('should calculate normalized embeddings with the fast offline fallback', async () => {
    const fallback = new FastFallbackEmbeddings();
    const vector = await fallback.embedQuery('termination notice thirty days');

    expect(vector).toBeInstanceOf(Array);
    expect(vector.length).toBe(64);

    // Verify L2 normalization: sqrt(sum(v_i^2)) ≈ 1.0
    const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
    expect(magnitude).toBeCloseTo(1.0, 4);
  });

  it('should index document into in-memory vector store and perform similarity search', async () => {
    const store = await getOrBuildVectorStore('test-doc-123', sampleContract, true);
    const results = await store.similaritySearch('how can I cancel or terminate the contract?', 2);

    expect(results.length).toBeGreaterThanOrEqual(1);
    const matchedText = results[0].pageContent.toLowerCase();
    expect(matchedText).toContain('terminate');
  });
});

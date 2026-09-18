/**
 * @fileoverview Unit tests for clause risk evaluation, aggregation, and missing protection detection.
 */

import { describe, it, expect } from 'vitest';
import {
  calculateClauseRisk,
  aggregateDocumentRisk,
  detectMissingProtections,
} from '../lib/risk-engine.js';
import { ClauseAnalysis } from '../types/legal.js';

describe('Risk Engine & Aggregation', () => {
  it('should flag predatory auto-renewal and unilateral indemnity clauses with HIGH or CRITICAL risk', () => {
    const autoRenewClause = `
      Term and Renewal: This contract renews automatically for successive 24-month terms
      unless notice of termination is received 180 days prior to expiration.
    `;
    const indemnityClause = `
      Indemnification: You shall indemnify, defend and hold harmless Company from any and all
      claims, unlimited liabilities, consequential damages, and attorney fees.
    `;

    const autoResult = calculateClauseRisk('Term and Renewal', autoRenewClause);
    expect(autoResult.score).toBeGreaterThanOrEqual(65);
    expect(autoResult.flags.length).toBeGreaterThan(0);

    const indemnityResult = calculateClauseRisk('Indemnification', indemnityClause);
    expect(indemnityResult.score).toBeGreaterThanOrEqual(75);
    expect(indemnityResult.level).toMatch(/HIGH|CRITICAL/);
  });

  it('should correctly aggregate clause risks and elevate document score when critical clauses exist', () => {
    const mockClauses: ClauseAnalysis[] = [
      {
        id: 'c1',
        title: 'Indemnity',
        originalText: 'Unilateral unlimited indemnity',
        plainEnglish: 'You pay for all lawsuits',
        riskLevel: 'CRITICAL',
        riskScore: 90,
        category: 'Liability',
        riskReason: 'Unilateral exposure',
        potentialImpact: 'Severe financial loss',
      },
      {
        id: 'c2',
        title: 'Governing Law',
        originalText: 'Governed by the laws of Delaware',
        plainEnglish: 'Standard state law',
        riskLevel: 'LOW',
        riskScore: 20,
        category: 'Dispute & Jurisdiction',
        riskReason: 'Standard',
        potentialImpact: 'None',
      },
    ];

    const aggregated = aggregateDocumentRisk(mockClauses);
    expect(aggregated.breakdown.critical).toBe(1);
    expect(aggregated.breakdown.low).toBe(1);
    expect(aggregated.overallLevel).toBe('HIGH');
    expect(aggregated.overallScore).toBeGreaterThanOrEqual(50);
  });

  it('should detect missing crucial legal safeguards such as liability caps and mutual indemnity', () => {
    const oneSidedText = `
      MASTER SERVICES AGREEMENT
      Provider shall indemnify Client against all claims. Client may terminate immediately without cause.
      Payment is due within 10 days of invoice with 15% monthly late fee.
    `;

    const missing = detectMissingProtections(oneSidedText);
    const missingIds = missing.map(m => m.id);

    expect(missingIds).toContain('missing-liability-cap');
    expect(missingIds).toContain('missing-cure-period');
  });
});

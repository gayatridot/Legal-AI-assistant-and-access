/**
 * @fileoverview Risk Analysis and Scoring Aggregation Engine.
 * Evaluates individual clauses and aggregates document-wide risk scores.
 */

import { ClauseAnalysis, MissingProtection, RiskLevel } from '../types/legal.js';

/**
 * Weights for aggregating overall document risk.
 */
const RISK_WEIGHTS: Record<RiskLevel, number> = {
  CRITICAL: 100,
  HIGH: 75,
  MEDIUM: 45,
  LOW: 20,
  FAIR: 5,
};

/**
 * Known red flag trigger patterns commonly found in predatory or asymmetric agreements.
 */
export const PREDATORY_PATTERNS = [
  {
    category: 'Auto-Renewal' as const,
    pattern: /(auto-renew|automatic renewal|successive terms?|renews automatically)/i,
    indicator: 'Automatic renewal without explicit annual opt-in',
    baseScore: 70,
  },
  {
    category: 'Liability' as const,
    pattern: /(indemnify, defend and hold harmless|sole liability|unlimited liability|consequential damages)/i,
    indicator: 'Broad unilateral indemnification or uncapped consequential liability',
    baseScore: 85,
  },
  {
    category: 'Termination' as const,
    pattern: /(terminate immediately without cause|terminate at its sole discretion|without prior notice)/i,
    indicator: 'Immediate termination without cause or cure notice',
    baseScore: 80,
  },
  {
    category: 'Payment & Penalties' as const,
    pattern: /(liquidated damages|late fee of \d+%\s*per (day|month)|non-refundable deposit)/i,
    indicator: 'Severe punitive liquidated damages or disproportionate late fees',
    baseScore: 75,
  },
  {
    category: 'Dispute & Jurisdiction' as const,
    pattern: /(waive (any|all) right to a jury trial|class action waiver|binding individual arbitration only)/i,
    indicator: 'Jury trial waiver or mandatory binding arbitration restricting legal redress',
    baseScore: 65,
  },
  {
    category: 'Intellectual Property' as const,
    pattern: /(work made for hire|assigns all right, title, and interest in perpetuity|moral rights waived)/i,
    indicator: 'Perpetual worldwide copyright assignment including moral rights waiver',
    baseScore: 75,
  },
];

/**
 * Evaluates a single clause's numerical risk score based on length, keywords, and predatory flags.
 *
 * @param title - The clause section heading or title.
 * @param text - The raw clause text.
 * @returns { score: number; level: RiskLevel; flags: string[] }
 */
export function calculateClauseRisk(
  title: string,
  text: string
): { score: number; level: RiskLevel; flags: string[] } {
  const combined = `${title} ${text}`.toLowerCase();
  let score = 20; // Baseline low risk
  const flags: string[] = [];

  for (const item of PREDATORY_PATTERNS) {
    if (item.pattern.test(combined)) {
      score = Math.max(score, item.baseScore);
      flags.push(item.indicator);
    }
  }

  // Check for unilateral vs mutual language
  const isUnilateral = /\b(you shall|client shall|employee shall|contractor shall)\b/i.test(text) &&
    !/\b(mutual|either party|each party)\b/i.test(text);

  if (isUnilateral && flags.length > 0) {
    score = Math.min(100, score + 10);
  }

  // Classify score into RiskLevel
  let level: RiskLevel = 'LOW';
  if (score >= 85) level = 'CRITICAL';
  else if (score >= 65) level = 'HIGH';
  else if (score >= 40) level = 'MEDIUM';
  else if (score >= 15) level = 'LOW';
  else level = 'FAIR';

  return { score, level, flags };
}

/**
 * Aggregates an array of analyzed clauses into a unified document risk score and breakdown.
 * Formula: Weighted average with heavy penalty for presence of Critical/High clauses.
 *
 * @param clauses - Array of clause analyses.
 * @returns { overallScore: number; overallLevel: RiskLevel; breakdown: { high: number; medium: number; low: number; critical: number } }
 */
export function aggregateDocumentRisk(clauses: ClauseAnalysis[]): {
  overallScore: number;
  overallLevel: RiskLevel;
  breakdown: { high: number; medium: number; low: number; critical: number };
} {
  const breakdown = { high: 0, medium: 0, low: 0, critical: 0 };

  if (!clauses || clauses.length === 0) {
    return { overallScore: 0, overallLevel: 'FAIR', breakdown };
  }

  let totalScore = 0;

  for (const clause of clauses) {
    totalScore += clause.riskScore;
    if (clause.riskLevel === 'CRITICAL') breakdown.critical++;
    else if (clause.riskLevel === 'HIGH') breakdown.high++;
    else if (clause.riskLevel === 'MEDIUM') breakdown.medium++;
    else breakdown.low++;
  }

  const averageScore = totalScore / clauses.length;

  // Critical penalties: If any critical clause is present, the agreement cannot be considered low risk
  const penalty = breakdown.critical * 12 + breakdown.high * 5;
  const rawScore = Math.min(100, Math.round(averageScore * 0.7 + penalty));

  let overallLevel: RiskLevel = 'LOW';
  if (rawScore >= 75 || breakdown.critical > 0) overallLevel = 'HIGH';
  else if (rawScore >= 45 || breakdown.high > 0) overallLevel = 'MEDIUM';
  else if (rawScore >= 20) overallLevel = 'LOW';
  else overallLevel = 'FAIR';

  return {
    overallScore: rawScore,
    overallLevel,
    breakdown,
  };
}

/**
 * Analyzes full document text to discover essential protective clauses that are MISSING.
 *
 * @param documentText - Raw text of the legal contract.
 * @returns Array of MissingProtection items with actionable advice.
 */
export function detectMissingProtections(documentText: string): MissingProtection[] {
  const missing: MissingProtection[] = [];
  const text = documentText.toLowerCase();

  // 1. Check for Limitation of Liability cap
  if (!/(limitation of liability|aggregate liability shall not exceed|liability cap)/i.test(text)) {
    missing.push({
      id: 'missing-liability-cap',
      title: 'Missing Limitation of Liability Cap',
      importance: 'HIGH',
      description: 'The contract does not appear to state a financial cap on monetary damages (e.g. fees paid in prior 12 months). Without this, potential exposure to legal damages may be unlimited.',
      recommendedAddition: 'Add: "In no event shall either party\'s aggregate liability arising out of this Agreement exceed the total fees paid or payable by Client during the twelve (12) month period immediately preceding the claim."',
    });
  }

  // 2. Check for Mutual Indemnification
  const hasIndemnity = /indemnif/i.test(text);
  const isMutualIndemnity = /each party (shall|agrees to) indemnify|mutually indemnify/i.test(text);
  if (hasIndemnity && !isMutualIndemnity) {
    missing.push({
      id: 'missing-mutual-indemnity',
      title: 'Missing Mutual Indemnification',
      importance: 'HIGH',
      description: 'Indemnification obligations appear one-sided. Only one party is protected against third-party lawsuits and claims.',
      recommendedAddition: 'Make indemnification mutual: Both parties should indemnify each other for their own gross negligence, breach of confidentiality, or willful misconduct.',
    });
  }

  // 3. Check for Cure Period / Notice before Termination
  if (!/(written notice.*(\d+|thirty|fifteen)\s*days.*cure|cure period)/i.test(text)) {
    missing.push({
      id: 'missing-cure-period',
      title: 'Missing Material Breach Cure Period',
      importance: 'MEDIUM',
      description: 'There is no clear notice-and-cure provision (standard is 15–30 days) allowing a party to rectify accidental defaults before contract termination.',
      recommendedAddition: 'Add: "Either party may terminate this Agreement upon thirty (30) days written notice if the other party materially breaches and fails to cure such breach within said thirty (30) days."',
    });
  }

  // 4. Check for Force Majeure clause
  if (!/(force majeure|acts of god|unforeseen circumstances beyond.*control)/i.test(text)) {
    missing.push({
      id: 'missing-force-majeure',
      title: 'Missing Force Majeure Provision',
      importance: 'RECOMMENDED',
      description: 'No clause excusing non-performance during extreme unforeseen events (pandemics, natural disasters, state of emergency).',
      recommendedAddition: 'Add a standard Force Majeure clause relieving obligations during unforeseen natural or state disasters beyond reasonable control.',
    });
  }

  return missing;
}

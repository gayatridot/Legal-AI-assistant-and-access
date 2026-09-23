/**
 * @fileoverview Comprehensive Legal Document Analyzer.
 * Orchestrates Gemini AI clause extraction, risk assessment, plain English translation,
 * and lawyer consultation prep kit synthesis.
 */

import { DocumentAnalysisResult, ClauseAnalysis, DocumentSummary } from '../types/legal.js';
import {
  getGeminiClient,
  DEFAULT_GEMINI_MODEL,
  LEGAL_GUARDRAIL_SYSTEM_PROMPT,
  generateWithResilience,
} from './gemini.js';
import { calculateClauseRisk, aggregateDocumentRisk, detectMissingProtections } from './risk-engine.js';
import { sanitizeLegalText, validateDocumentText } from './sanitizer.js';
import { Type } from '@google/genai';

/**
 * Analyzes a legal document using Google Gemini with fallback to deterministic heuristic analysis.
 *
 * @param rawText - The un-sanitized or raw legal document text.
 * @param fileName - Optional original file name.
 * @returns Complete DocumentAnalysisResult ready for UI rendering and RAG indexing.
 */
export async function analyzeLegalDocument(
  rawText: string,
  fileName?: string
): Promise<DocumentAnalysisResult> {
  const sanitizedText = sanitizeLegalText(rawText);
  const validation = validateDocumentText(sanitizedText);
  if (!validation.isValid) {
    throw new Error(validation.error || 'Invalid legal document text.');
  }

  const documentId = 'doc_' + Math.random().toString(36).substring(2, 11);
  const missingProtections = detectMissingProtections(sanitizedText);
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = getGeminiClient();
      const prompt = `
System Guardrails: ${LEGAL_GUARDRAIL_SYSTEM_PROMPT}

You are analyzing the following legal document:
DOCUMENT TEXT:
"""
${sanitizedText.slice(0, 35000)}
"""

Please conduct a thorough legal clause risk and comprehension analysis. Return ONLY valid JSON matching this schema:
{
  "documentType": string (e.g. "Commercial Real Estate Lease", "Mutual Non-Disclosure Agreement", "SaaS Master Services Agreement"),
  "executiveSummary": string (Clear 2-3 paragraph plain-English breakdown of what this document commits the user to),
  "partiesInvolved": string[] (Names or titles of contracting entities),
  "keyDatesOrDeadlines": string[] (Critical notice windows, payment terms, or expiration dates),
  "clauses": [
    {
      "title": string (Clause title or heading),
      "category": "Liability" | "Termination" | "Payment & Penalties" | "Intellectual Property" | "Confidentiality" | "Auto-Renewal" | "Dispute & Jurisdiction" | "General",
      "originalText": string (Excerpt of verbatim text from contract),
      "plainEnglish": string (Clear explanation in 8th-grade English: what this actually means in practice),
      "riskLevel": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "FAIR",
      "riskScore": number (0 to 100),
      "riskReason": string (Why this clause is risky, asymmetric, or burdensome),
      "potentialImpact": string (Real-world financial, legal, or operational consequence if breached or triggered),
      "recommendedCounterClause": string (Fairer compromise language that protects the user)
    }
  ],
  "lawyerQuestions": [
    {
      "topic": string,
      "question": string,
      "context": string,
      "priority": "HIGH" | "MEDIUM" | "GENERAL"
    }
  ],
  "keyNegotiationPoints": string[],
  "criticalChecklist": string[]
}
`;

      const { text: responseText } = await generateWithResilience({
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
        perModelTimeoutMs: 25000,
      });

      const parsed = JSON.parse(responseText || '{}');

      const clauses: ClauseAnalysis[] = (parsed.clauses || []).map((c: any, index: number) => ({
        id: `clause-${index + 1}`,
        title: c.title || `Section ${index + 1}`,
        originalText: c.originalText || '',
        plainEnglish: c.plainEnglish || 'No plain English translation provided.',
        riskLevel: (['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'FAIR'].includes(c.riskLevel) ? c.riskLevel : 'MEDIUM') as any,
        riskScore: typeof c.riskScore === 'number' ? Math.min(100, Math.max(0, c.riskScore)) : 50,
        category: c.category || 'General',
        riskReason: c.riskReason || 'Examine terms with legal counsel.',
        potentialImpact: c.potentialImpact || 'Uncertain liability or operational restriction.',
        recommendedCounterClause: c.recommendedCounterClause || undefined,
      }));

      // Aggregate risk mathematically
      const riskAgg = aggregateDocumentRisk(clauses);

      const summary: DocumentSummary = {
        documentType: parsed.documentType || 'Legal Agreement',
        overallRiskScore: riskAgg.overallScore,
        overallRiskLevel: riskAgg.overallLevel,
        executiveSummary: parsed.executiveSummary || 'Document analyzed for key provisions and liabilities.',
        partiesInvolved: parsed.partiesInvolved || [],
        keyDatesOrDeadlines: parsed.keyDatesOrDeadlines || [],
        totalClausesAnalyzed: clauses.length,
        highRiskCount: riskAgg.breakdown.critical + riskAgg.breakdown.high,
        mediumRiskCount: riskAgg.breakdown.medium,
        lowRiskCount: riskAgg.breakdown.low,
      };

      return {
        documentId,
        fileName: fileName || 'Uploaded-Document.pdf',
        analyzedAt: new Date().toISOString(),
        summary,
        clauses,
        missingProtections,
        lawyerPrepKit: {
          criticalChecklist: parsed.criticalChecklist || [
            'Clarify unilateral indemnification scope with counter-party',
            'Request a 30-day written notice cure period for alleged defaults',
            'Insert mutual limitation of liability cap',
          ],
          questionsToAsk: (parsed.lawyerQuestions || []).map((q: any, i: number) => ({
            id: `q-${i + 1}`,
            topic: q.topic || 'Contract Risk',
            question: q.question || 'Is this clause standard in our jurisdiction?',
            context: q.context || 'Potential exposure under this agreement.',
            priority: (['HIGH', 'MEDIUM', 'GENERAL'].includes(q.priority) ? q.priority : 'MEDIUM') as any,
          })),
          keyNegotiationPoints: parsed.keyNegotiationPoints || [
            'Propose striking perpetual auto-renewal without 60-day reminder',
            'Cap financial liability to 12 months fees paid',
            'Ensure intellectual property assignment is contingent on full payment',
          ],
        },
        disclaimer:
          'Provides educational and informational assistance only; does not replace formal legal counsel.',
      };
    } catch (geminiErr: unknown) {
      // Log Gemini errors to server console (visible in Vercel function logs)
      console.error('[LexiGuard] Gemini analysis failed, falling back to heuristic analyzer:', geminiErr);
    }
  }

  // Algorithmic Fallback when API key is unconfigured or rate limited
  return fallbackAlgorithmicAnalysis(sanitizedText, documentId, fileName);
}

/**
 * Deterministic fallback analysis that extracts sections, identifies predatory patterns,
 * generates plain English translations, and drafts consultation questions.
 */
function fallbackAlgorithmicAnalysis(
  text: string,
  documentId: string,
  fileName?: string
): DocumentAnalysisResult {
  // Split into paragraphs / sections
  let rawParagraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 40);
  if (rawParagraphs.length === 0) {
    rawParagraphs = text.split(/\n+/).map(p => p.trim()).filter(p => p.length > 30);
  }
  if (rawParagraphs.length === 0 && text.trim().length > 0) {
    rawParagraphs = [];
    for (let i = 0; i < text.length; i += 300) {
      const slice = text.slice(i, i + 300).trim();
      if (slice.length > 0) rawParagraphs.push(slice);
    }
  }
  const clauses: ClauseAnalysis[] = [];

  rawParagraphs.slice(0, 15).forEach((para, idx) => {
    const firstLine = para.split('\n')[0].replace(/^[\d\.\-\s]+/, '').slice(0, 50);
    const title = firstLine || `Clause ${idx + 1}`;
    const risk = calculateClauseRisk(title, para);

    let plainEnglish = 'This section outlines standard contractual obligations.';
    let impact = 'Standard operational requirements under the agreement.';
    let counter = 'Standard reciprocal terms.';

    if (risk.flags.some(f => f.includes('Automatic renewal'))) {
      plainEnglish = 'This agreement will automatically renew for another full term unless you give advance written cancellation before a strict deadline.';
      impact = 'You could get locked into another payment cycle or contract year unintentionally.';
      counter = 'Require written reminder notice from the vendor 30-60 days before any auto-renewal deadline.';
    } else if (risk.flags.some(f => f.includes('indemnif'))) {
      plainEnglish = 'You are agreeing to pay all legal fees and damages if the other party gets sued because of your actions or work.';
      impact = 'Significant financial exposure to third-party lawsuits even without intentional misconduct.';
      counter = 'Limit indemnification to mutual gross negligence or willful misconduct, with prompt notice requirement.';
    } else if (risk.flags.some(f => f.includes('terminate immediately'))) {
      plainEnglish = 'The other party can cancel this contract at any moment without giving you a chance to fix any misunderstanding or minor defect.';
      impact = 'Sudden loss of service or revenue with zero transition period.';
      counter = 'Require at least 30 days written notice and a 15-day cure period before termination.';
    } else if (risk.flags.some(f => f.includes('jury trial') || f.includes('arbitration'))) {
      plainEnglish = 'You give up your constitutional right to have a dispute heard in public court before a jury, agreeing instead to private arbitration.';
      impact = 'Arbitration fees can be costly and appeals are generally not permitted.';
      counter = 'Allow informal executive mediation first and retain right to small claims court.';
    } else if (risk.flags.some(f => f.includes('liquidated damages'))) {
      plainEnglish = 'Fixed financial penalties apply immediately if certain milestones or covenants are missed.';
      impact = 'You may owe substantial penalty fees regardless of actual demonstrable harm.';
      counter = 'Tie monetary remedies strictly to actual, proven direct damages.';
    }

    clauses.push({
      id: `clause-${idx + 1}`,
      title,
      originalText: para,
      plainEnglish,
      riskLevel: risk.level,
      riskScore: risk.score,
      category: (risk.flags[0] ? 'Liability' : 'General') as any,
      riskReason: risk.flags.join('; ') || 'Standard contractual covenants.',
      potentialImpact: impact,
      recommendedCounterClause: counter,
    });
  });

  const riskAgg = aggregateDocumentRisk(clauses);
  const missingProtections = detectMissingProtections(text);

  return {
    documentId,
    fileName: fileName || 'Uploaded-Contract.txt',
    analyzedAt: new Date().toISOString(),
    summary: {
      documentType: /lease|rent|tenant/i.test(text) ? 'Commercial / Residential Lease' :
                    /non-disclosure|confidentiality/i.test(text) ? 'Non-Disclosure Agreement (NDA)' :
                    /employment|employee|salary/i.test(text) ? 'Employment Agreement' :
                    /contractor|services|consulting/i.test(text) ? 'Independent Contractor Services Agreement' : 'Commercial Contract',
      overallRiskScore: riskAgg.overallScore,
      overallRiskLevel: riskAgg.overallLevel,
      executiveSummary: 'This document contains binding obligations, indemnities, and termination mechanisms. The analysis below highlights potential liabilities, asymmetric risk distributions, and areas where reciprocal safeguards should be negotiated.',
      partiesInvolved: ['Disclosing Party / Provider', 'Receiving Party / Client'],
      keyDatesOrDeadlines: ['Standard 30-day notice period', 'Annual renewal review'],
      totalClausesAnalyzed: clauses.length,
      highRiskCount: riskAgg.breakdown.critical + riskAgg.breakdown.high,
      mediumRiskCount: riskAgg.breakdown.medium,
      lowRiskCount: riskAgg.breakdown.low,
    },
    clauses,
    missingProtections,
    lawyerPrepKit: {
      criticalChecklist: [
        'Review asymmetric indemnification clauses with your attorney',
        'Check cancellation windows for automatic renewal provisions',
        'Verify that financial liability is capped to fees actually paid',
      ],
      questionsToAsk: [
        {
          id: 'q-1',
          topic: 'Indemnification & Liability',
          question: 'Does the current indemnity clause expose our business to third-party claims beyond direct willful misconduct?',
          context: 'Indemnification appears one-sided without mutual protection.',
          priority: 'HIGH',
        },
        {
          id: 'q-2',
          topic: 'Termination & Cure Period',
          question: 'Can we insert a standard 30-day notice and cure period before the contract can be terminated for breach?',
          context: 'Avoids sudden forfeiture of rights without remediation.',
          priority: 'MEDIUM',
        },
        {
          id: 'q-3',
          topic: 'Dispute Resolution Venue',
          question: 'Is the designated governing law and arbitration venue reasonable for our local jurisdiction?',
          context: 'Out-of-state arbitration can incur high legal travel expenses.',
          priority: 'MEDIUM',
        },
      ],
      keyNegotiationPoints: [
        'Make indemnification strictly mutual',
        'Introduce a 12-month trailing revenue liability cap',
        'Carve out an opt-out window for auto-renewal terms',
      ],
    },
    disclaimer: 'Provides educational and informational assistance only; does not replace formal legal counsel.',
  };
}

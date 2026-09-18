/**
 * Core type definitions for LexiGuard - AI Legal Assistance & Access.
 * Enforces strict typing across analysis, RAG retrieval, and UI rendering.
 */

export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'FAIR';

export interface ClauseAnalysis {
  id: string;
  title: string;
  originalText: string;
  plainEnglish: string;
  riskLevel: RiskLevel;
  riskScore: number; // 0 (safest) - 100 (highest risk)
  category: 'Liability' | 'Termination' | 'Payment & Penalties' | 'Intellectual Property' | 'Confidentiality' | 'Auto-Renewal' | 'Dispute & Jurisdiction' | 'General';
  riskReason: string;
  recommendedCounterClause?: string;
  potentialImpact: string;
}

export interface MissingProtection {
  id: string;
  title: string;
  importance: 'HIGH' | 'MEDIUM' | 'RECOMMENDED';
  description: string;
  recommendedAddition: string;
}

export interface LawyerQuestion {
  id: string;
  topic: string;
  question: string;
  context: string;
  priority: 'HIGH' | 'MEDIUM' | 'GENERAL';
}

export interface DocumentSummary {
  documentType: string;
  overallRiskScore: number; // 0 - 100
  overallRiskLevel: RiskLevel;
  executiveSummary: string;
  partiesInvolved?: string[];
  keyDatesOrDeadlines?: string[];
  totalClausesAnalyzed: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
}

export interface DocumentAnalysisResult {
  documentId: string;
  fileName?: string;
  analyzedAt: string;
  summary: DocumentSummary;
  clauses: ClauseAnalysis[];
  missingProtections: MissingProtection[];
  lawyerPrepKit: {
    criticalChecklist: string[];
    questionsToAsk: LawyerQuestion[];
    keyNegotiationPoints: string[];
  };
  disclaimer: string;
}

export interface RAGCitation {
  clauseId?: string;
  clauseTitle?: string;
  snippet: string;
  score?: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  citations?: RAGCitation[];
  isGuardrailed?: boolean;
}

export interface ChatRequestPayload {
  documentId: string;
  documentText: string;
  query: string;
  chatHistory?: Array<{ sender: 'user' | 'assistant'; content: string }>;
}

export interface ChatResponsePayload {
  answer: string;
  citations: RAGCitation[];
  disclaimer: string;
}

export interface AnalyzeRequestPayload {
  documentText: string;
  fileName?: string;
  documentTypeHint?: string;
}

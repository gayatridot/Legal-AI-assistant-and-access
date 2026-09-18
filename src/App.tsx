import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  FileText,
  AlertTriangle,
  Scale,
  MessageSquare,
  Sparkles,
  ClipboardList,
  Layers,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react';
import { LegalDisclaimerBanner } from '../components/LegalDisclaimerBanner.js';
import { Header } from '../components/Header.js';
import { DocumentUploader } from '../components/DocumentUploader.js';
import { RiskOverviewCard } from '../components/RiskOverviewCard.js';
import { ClauseRiskEngine } from '../components/ClauseRiskEngine.js';
import { LegaleseSimplifier } from '../components/LegaleseSimplifier.js';
import { RagChatBot } from '../components/RagChatBot.js';
import { LawyerPrepKit } from '../components/LawyerPrepKit.js';
import { DocumentAnalysisResult } from '../types/legal.js';
import { SAMPLE_CONTRACTS } from '../lib/sample-contracts.js';

export default function App() {
  const [analysisResult, setAnalysisResult] = useState<DocumentAnalysisResult | null>(null);
  const [documentText, setDocumentText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'risk' | 'simplifier' | 'rag' | 'prepkit'>('risk');
  const [highContrast, setHighContrast] = useState<boolean>(false);

  // Auto-analyze the first sample contract on initial load for instant demonstration
  useEffect(() => {
    const initialSample = SAMPLE_CONTRACTS[0];
    if (initialSample && !analysisResult && !isLoading) {
      handleAnalyzeText(initialSample.text, initialSample.title);
    }
  }, []);

  const handleAnalyzeText = async (text: string, fileName?: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setDocumentText(text);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentText: text,
          fileName: fileName || 'Document.txt',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to analyze document.');
      }

      const result: DocumentAnalysisResult = await response.json();
      setAnalysisResult(result);
      setActiveTab('risk');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Analysis failed.';
      setErrorMessage(msg);
      console.error('[LexiGuard] Analysis Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeFile = async (file: File) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const res = reader.result as string;
            const b64 = res.includes(',') ? res.split(',')[1] : res;
            resolve(b64);
          };
          reader.onerror = () => reject(new Error('Failed to read PDF file buffer.'));
          reader.readAsDataURL(file);
        });

        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileBase64: base64,
            isPdf: true,
            fileName: file.name,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to analyze PDF document.');
        }

        const result: DocumentAnalysisResult = await response.json();
        setAnalysisResult(result);
        setDocumentText(result.clauses.map(c => c.originalText).join('\n\n'));
      } else {
        const text = await file.text();
        await handleAnalyzeText(text, file.name);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to parse file.';
      setErrorMessage(msg);
      console.warn('[LexiGuard] File upload notice:', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setDocumentText('');
    setErrorMessage(null);
    setActiveTab('risk');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors ${
        highContrast ? 'bg-neutral-950 text-white' : 'bg-[#FAFAFA] text-neutral-900'
      }`}
    >
      {/* Top Prominent Legal Disclaimer Banner */}
      <LegalDisclaimerBanner highContrast={highContrast} />

      {/* Main App Header */}
      <Header
        documentTitle={analysisResult?.summary.documentType || analysisResult?.fileName}
        hasAnalysis={Boolean(analysisResult)}
        highContrast={highContrast}
        onToggleHighContrast={() => setHighContrast(!highContrast)}
        onReset={handleReset}
        onPrint={handlePrint}
      />

      {/* Error Notification Bar */}
      {errorMessage && (
        <div
          role="alert"
          className="max-w-7xl mx-auto px-4 mt-4 sm:px-6 w-full"
        >
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-200 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" aria-hidden="true" />
              <span className="font-medium">{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-xs font-semibold text-red-800 dark:text-red-300 hover:underline"
            >
              Dismiss
            </button>
          </motion.div>
        </div>
      )}

      {/* Main Content Area */}
      <main id="main-content" role="main" className="flex-1 max-w-7xl mx-auto px-4 py-6 sm:px-6 w-full space-y-6">
        {!analysisResult ? (
          /* Document Upload & Ingestion View */
          <DocumentUploader
            onAnalyzeText={handleAnalyzeText}
            onAnalyzeFile={handleAnalyzeFile}
            isLoading={isLoading}
            highContrast={highContrast}
          />
        ) : (
          /* Active Document Analysis Dashboard */
          <div className="space-y-6">
            {/* Top Risk Score & Executive Summary Card */}
            <RiskOverviewCard
              summary={analysisResult.summary}
              missingProtections={analysisResult.missingProtections}
              highContrast={highContrast}
            />

            {/* Feature Tab Navigation */}
            <nav
              role="tablist"
              aria-label="Legal Assistant Analysis Tabs"
              className={`flex items-center gap-2 border-b transition-colors overflow-x-auto pb-px ${
                highContrast ? 'border-neutral-800' : 'border-neutral-200'
              }`}
            >
              <motion.button
                type="button"
                role="tab"
                id="tab-risk"
                aria-selected={activeTab === 'risk'}
                aria-controls="panel-risk"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('risk')}
                className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  activeTab === 'risk'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Layers className="w-4 h-4" aria-hidden="true" />
                <span>Clause Risk Engine</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-200/80 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold">
                  {analysisResult.clauses.length}
                </span>
              </motion.button>

              <motion.button
                type="button"
                role="tab"
                id="tab-simplifier"
                aria-selected={activeTab === 'simplifier'}
                aria-controls="panel-simplifier"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('simplifier')}
                className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  activeTab === 'simplifier'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                <span>Side-by-Side Legalese Simplifier</span>
              </motion.button>

              <motion.button
                type="button"
                role="tab"
                id="tab-rag"
                aria-selected={activeTab === 'rag'}
                aria-controls="panel-rag"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('rag')}
                className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  activeTab === 'rag'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <MessageSquare className="w-4 h-4" aria-hidden="true" />
                <span>RAG Interactive Q&A</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800 font-bold inline-flex items-center gap-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500" />
                  </span>
                  <span>Vector Grounded</span>
                </span>
              </motion.button>

              <motion.button
                type="button"
                role="tab"
                id="tab-prepkit"
                aria-selected={activeTab === 'prepkit'}
                aria-controls="panel-prepkit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('prepkit')}
                className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  activeTab === 'prepkit'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <ClipboardList className="w-4 h-4" aria-hidden="true" />
                <span>Lawyer Consultation Checklist</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 font-bold inline-flex items-center gap-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                  </span>
                  <span>Prep Kit</span>
                </span>
              </motion.button>
            </nav>

            {/* Animated Tab Panels */}
            <AnimatePresence mode="wait">
              {activeTab === 'risk' && (
                <motion.div
                  key="panel-risk"
                  id="panel-risk"
                  role="tabpanel"
                  aria-labelledby="tab-risk"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <ClauseRiskEngine
                    clauses={analysisResult.clauses}
                    highContrast={highContrast}
                  />
                </motion.div>
              )}

              {activeTab === 'simplifier' && (
                <motion.div
                  key="panel-simplifier"
                  id="panel-simplifier"
                  role="tabpanel"
                  aria-labelledby="tab-simplifier"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <LegaleseSimplifier
                    clauses={analysisResult.clauses}
                    highContrast={highContrast}
                  />
                </motion.div>
              )}

              {activeTab === 'rag' && (
                <motion.div
                  key="panel-rag"
                  id="panel-rag"
                  role="tabpanel"
                  aria-labelledby="tab-rag"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <RagChatBot
                    documentId={analysisResult.documentId}
                    documentText={documentText}
                    highContrast={highContrast}
                  />
                </motion.div>
              )}

              {activeTab === 'prepkit' && (
                <motion.div
                  key="panel-prepkit"
                  id="panel-prepkit"
                  role="tabpanel"
                  aria-labelledby="tab-prepkit"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <LawyerPrepKit
                    summary={analysisResult.summary}
                    questions={analysisResult.lawyerPrepKit.questionsToAsk}
                    missingProtections={analysisResult.missingProtections}
                    keyNegotiationPoints={analysisResult.lawyerPrepKit.keyNegotiationPoints}
                    criticalChecklist={analysisResult.lawyerPrepKit.criticalChecklist}
                    highContrast={highContrast}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Footer with Compliance Landmarks */}
      <footer
        role="contentinfo"
        className={`border-t py-6 mt-12 transition-colors ${
          highContrast
            ? 'bg-neutral-950 text-neutral-400 border-neutral-800'
            : 'bg-white text-neutral-500 border-neutral-200'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-blue-600" aria-hidden="true" />
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">LexiGuard &middot; AI for Legal Assistance & Access</span>
          </div>

          <p className="text-center sm:text-right max-w-xl text-[11px] leading-relaxed">
            LexiGuard provides automated legal document analysis and clause education.
            It does not constitute licensed legal advice, lawyer solicitation, or formal representation.
          </p>
        </div>
      </footer>
    </div>
  );
}

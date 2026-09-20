import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Scale,
  AlertTriangle,
  Layers,
  Sparkles,
  MessageSquare,
  ClipboardList,
} from 'lucide-react';

import { AppNavbar } from '../components/AppNavbar.js';
import { DocumentUploader } from '../components/DocumentUploader.js';
import { RiskOverviewCard } from '../components/RiskOverviewCard.js';
import { ClauseRiskEngine } from '../components/ClauseRiskEngine.js';
import { LegaleseSimplifier } from '../components/LegaleseSimplifier.js';
import { RagChatBot } from '../components/RagChatBot.js';
import { LawyerPrepKit } from '../components/LawyerPrepKit.js';

import { AnimatedWaveBackground } from '../components/AnimatedWaveBackground.js';
import { LandingHero } from '../components/LandingHero.js';
import { SampleCardsSection } from '../components/SampleCardsSection.js';
import { FeatureHighlightBar } from '../components/FeatureHighlightBar.js';
import { FloatingRagRobot } from '../components/FloatingRagRobot.js';
import { AnalysisHeroBanner } from '../components/AnalysisHeroBanner.js';

import { DocumentAnalysisResult } from '../types/legal.js';
import { SAMPLE_CONTRACTS, SampleContract } from '../lib/sample-contracts.js';

export default function App() {
  const [analysisResult, setAnalysisResult] = useState<DocumentAnalysisResult | null>(null);
  const [documentText, setDocumentText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'risk' | 'simplifier' | 'rag' | 'prepkit'>('risk');
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [forcedUploadTab, setForcedUploadTab] = useState<'samples' | 'paste' | 'upload'>('samples');

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

  const handleHeroActionSelect = (action: 'samples' | 'paste' | 'upload') => {
    setForcedUploadTab(action);
    const uploaderEl = document.getElementById('document-uploader-section');
    if (uploaderEl) uploaderEl.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSampleSelect = async (sample: SampleContract) => {
    await handleAnalyzeText(sample.text, sample.title);
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setDocumentText('');
    setErrorMessage(null);
    setActiveTab('risk');
  };

  const handlePrint = () => window.print();

  // -------------------------------------------------------
  // Shared footer used on both views
  // -------------------------------------------------------
  const sharedFooter = (
    <footer className="border-t border-cyan-500/20 py-8 mt-12 bg-slate-950/80 backdrop-blur-md relative z-20 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-white">LexiGuard &middot; AI Legal Assistant &amp; Access</span>
        </div>
        <p className="text-center sm:text-right max-w-xl text-[11px] leading-relaxed">
          LexiGuard provides automated legal document analysis and clause education.
          It does not constitute licensed legal advice, lawyer solicitation, or formal representation.
        </p>
      </div>
    </footer>
  );

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors relative overflow-x-hidden ${
        highContrast ? 'bg-neutral-950 text-white' : 'bg-[#040817] text-white'
      }`}
    >
      {/* Animated background is always present behind both views */}
      <AnimatedWaveBackground highContrast={highContrast} />

      {!analysisResult ? (
        /* -------------------------------------------------- */
        /* LANDING VIEW                                        */
        /* -------------------------------------------------- */
        <div className="relative w-full flex-1 flex flex-col">
          {/* LandingHero already includes AppNavbar (landing mode) */}
          <LandingHero onSelectAction={handleHeroActionSelect} highContrast={highContrast} />

          {/* Error notification */}
          {errorMessage && (
            <div role="alert" className="max-w-4xl mx-auto px-4 my-2 w-full z-20 relative">
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" aria-hidden="true" />
                  <span className="font-medium">{errorMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="text-xs font-semibold text-red-300 hover:underline"
                >
                  Dismiss
                </button>
              </motion.div>
            </div>
          )}

          {/* Document uploader */}
          <div className="relative z-20">
            <DocumentUploader
              onAnalyzeText={handleAnalyzeText}
              onAnalyzeFile={handleAnalyzeFile}
              isLoading={isLoading}
              highContrast={highContrast}
              forcedTab={forcedUploadTab}
            />
          </div>

          <SampleCardsSection onSelectSample={handleSampleSelect} isLoading={isLoading} />
          <FeatureHighlightBar />
          {sharedFooter}
        </div>
      ) : (
        /* -------------------------------------------------- */
        /* ANALYSIS DASHBOARD VIEW                             */
        /* -------------------------------------------------- */
        <div className="relative min-h-screen flex flex-col text-white">
          {/* Shared navbar — analysis mode with controls */}
          <AppNavbar
            mode="analysis"
            documentTitle={analysisResult.summary.documentType || analysisResult.fileName}
            highContrast={highContrast}
            onToggleHighContrast={() => setHighContrast(!highContrast)}
            onReset={handleReset}
            onPrint={handlePrint}
          />

          <main
            id="main-content"
            role="main"
            className="flex-1 max-w-7xl mx-auto px-4 py-6 sm:px-6 w-full space-y-6 relative z-10"
          >
            {/* Analysis hero banner */}
            <AnalysisHeroBanner
              documentTitle={analysisResult.fileName || 'Contract.pdf'}
              documentType={analysisResult.summary.documentType}
              overallRiskScore={analysisResult.summary.overallRiskScore}
              onReset={handleReset}
              onPrint={handlePrint}
              onOpenRag={() => setActiveTab('rag')}
            />

            <div className="space-y-6">
              {/* Risk overview card */}
              <RiskOverviewCard
                summary={analysisResult.summary}
                missingProtections={analysisResult.missingProtections}
                highContrast={highContrast}
              />

              {/* Tab navigation */}
              <nav
                role="tablist"
                aria-label="Legal Assistant Analysis Tabs"
                className="flex items-center gap-2 border-b border-cyan-500/20 overflow-x-auto pb-px bg-slate-950/60 p-2 rounded-2xl backdrop-blur-md"
              >
                {(
                  [
                    {
                      id: 'risk' as const,
                      label: 'Clause Risk Engine',
                      icon: <Layers className="w-4 h-4" aria-hidden="true" />,
                      badge: (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-950 text-cyan-300 font-bold border border-cyan-400/40">
                          {analysisResult.clauses.length}
                        </span>
                      ),
                    },
                    {
                      id: 'simplifier' as const,
                      label: 'Side-by-Side Legalese Simplifier',
                      icon: <Sparkles className="w-4 h-4" aria-hidden="true" />,
                    },
                    {
                      id: 'rag' as const,
                      label: 'RAG Interactive Q&A',
                      icon: <MessageSquare className="w-4 h-4" aria-hidden="true" />,
                      badge: (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950 text-blue-200 border border-blue-400/40 font-bold inline-flex items-center gap-1">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500" />
                          </span>
                          <span>Vector</span>
                        </span>
                      ),
                    },
                    {
                      id: 'prepkit' as const,
                      label: 'Lawyer Consultation Checklist',
                      icon: <ClipboardList className="w-4 h-4" aria-hidden="true" />,
                    },
                  ] as const
                ).map(tab => (
                  <motion.button
                    key={tab.id}
                    type="button"
                    role="tab"
                    id={`tab-${tab.id}`}
                    aria-selected={activeTab === tab.id}
                    aria-controls={`panel-${tab.id}`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-3 px-4 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 focus:outline-none ${
                      activeTab === tab.id
                        ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(56,189,248,0.5)]'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                    {'badge' in tab && tab.badge}
                  </motion.button>
                ))}
              </nav>

              {/* Tab panels */}
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
                    <ClauseRiskEngine clauses={analysisResult.clauses} highContrast={highContrast} />
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
                    <LegaleseSimplifier clauses={analysisResult.clauses} highContrast={highContrast} />
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
          </main>

          {/* Floating RAG robot widget */}
          <FloatingRagRobot
            documentId={analysisResult.documentId}
            documentText={documentText}
            highContrast={highContrast}
          />

          {sharedFooter}
        </div>
      )}
    </div>
  );
}

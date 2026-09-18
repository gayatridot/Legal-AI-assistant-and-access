import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookMarked, ArrowRight, CheckCircle2, ChevronRight, HelpCircle, Sparkles, BookOpen } from 'lucide-react';
import { ClauseAnalysis } from '../types/legal.js';
import { RiskBadge } from './RiskBadge.js';

interface LegaleseSimplifierProps {
  clauses: ClauseAnalysis[];
  highContrast: boolean;
}

interface GlossaryTerm {
  term: string;
  pronunciation?: string;
  plainMeaning: string;
  realWorldExample: string;
}

const COMMON_LEGAL_GLOSSARY: GlossaryTerm[] = [
  {
    term: 'Indemnify & Hold Harmless',
    plainMeaning: 'To pay for someone else’s legal costs, settlements, or damages if they get sued by a third party because of your work.',
    realWorldExample: 'If a client gets sued for copyright infringement over code you wrote, an indemnity clause forces you to pay their lawyers.',
  },
  {
    term: 'Liquidated Damages',
    plainMeaning: 'A pre-set penalty fee that you must pay immediately if a contract deadline or obligation is broken, without needing to prove actual financial loss.',
    realWorldExample: 'Paying a fixed $1,000 fine for every day a project is late.',
  },
  {
    term: 'Severability',
    plainMeaning: 'If a judge declares one specific sentence of this contract illegal or void, the rest of the contract remains active and enforceable.',
    realWorldExample: 'If an extreme non-compete clause is thrown out by a court, the payment and IP terms still apply.',
  },
  {
    term: 'Force Majeure',
    plainMeaning: 'An "Act of God" clause excusing both parties from performance if an uncontrollable disaster (earthquake, war, pandemic) occurs.',
    realWorldExample: 'You are not penalized for late delivery if an earthquake shuts down power across the entire region.',
  },
  {
    term: 'Subrogation Waiver',
    plainMeaning: 'Preventing insurance companies from suing the other party to recover money after paying an insurance claim.',
    realWorldExample: 'If water damage floods a leased store, the tenant’s insurance pays out and agrees not to sue the landlord.',
  },
  {
    term: 'Forum Non Conveniens',
    plainMeaning: 'An objection claiming that the court venue selected by the other party is unfair or unreasonably far away.',
    realWorldExample: 'A freelancer in Texas objecting to flying to London to contest an unpaid $500 invoice.',
  },
  {
    term: 'Work Made for Hire',
    plainMeaning: 'An intellectual property doctrine where the hiring company owns 100% of all creations from the moment of inception, as if they created it themselves.',
    realWorldExample: 'You cannot reuse or showcase the software code in your future portfolio without explicit written consent.',
  },
];

export function LegaleseSimplifier({ clauses, highContrast }: LegaleseSimplifierProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [showGlossary, setShowGlossary] = useState<boolean>(false);

  const selectedClause = clauses[selectedIndex] || clauses[0];

  if (!selectedClause) {
    return (
      <div className="p-8 text-center text-sm text-neutral-500">
        No clauses loaded for comparison.
      </div>
    );
  }

  return (
    <div id="legalese-simplifier" role="region" aria-label="Side-by-Side Legalese Simplifier" className="space-y-6">
      {/* Top Banner with Glossary Trigger */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-5 rounded-2xl border backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors shadow-xs ${
          highContrast
            ? 'bg-neutral-900/90 border-neutral-700/80 text-white'
            : 'bg-white/85 border-neutral-200/80 text-neutral-900'
        }`}
      >
        <div>
          <h3 className="text-base font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            <span>Side-by-Side Legalese Translator</span>
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
            Compare dense legal jargon directly against everyday 8th-grade conversational English.
          </p>
        </div>

        <motion.button
          type="button"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowGlossary(!showGlossary)}
          aria-expanded={showGlossary}
          aria-controls="jargon-glossary-panel"
          className="px-3.5 py-2 rounded-xl bg-blue-50/90 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60 text-xs font-semibold inline-flex items-center gap-2 transition-all shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500 shrink-0"
        >
          <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{showGlossary ? 'Close Jargon Glossary' : 'Open Jargon Glossary'}</span>
        </motion.button>
      </motion.div>

      {/* Jargon Glossary Drawer (Collapsible with smooth slide-down & fade-in) */}
      <AnimatePresence initial={false}>
        {showGlossary && (
          <motion.div
            id="jargon-glossary-panel"
            initial={{ opacity: 0, height: 0, y: -8 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50/85 via-indigo-50/60 to-purple-50/40 dark:from-blue-950/40 dark:via-neutral-900 dark:to-neutral-950 border border-blue-200/80 dark:border-blue-900/50 shadow-xs backdrop-blur-md">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300 flex items-center gap-2">
                  <BookMarked className="w-4 h-4 text-blue-700 dark:text-blue-400" aria-hidden="true" />
                  <span>Essential Legal Jargon Cheat Sheet</span>
                </h4>
                <span className="text-[11px] text-blue-700 dark:text-blue-300 font-medium">
                  Common contractual terms decoded into plain English
                </span>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {COMMON_LEGAL_GLOSSARY.map((item, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -2 }}
                    className="p-3.5 rounded-xl bg-white/90 dark:bg-neutral-900/85 border border-blue-100 dark:border-neutral-800 text-xs space-y-1.5 shadow-2xs"
                  >
                    <strong className="block text-blue-950 dark:text-blue-200 font-bold text-xs">
                      {item.term}
                    </strong>
                    <p className="text-neutral-700 dark:text-neutral-300 leading-snug">{item.plainMeaning}</p>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 italic pt-1.5 border-t border-neutral-100 dark:border-neutral-800">
                      e.g., {item.realWorldExample}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clause Navigation Pills with Pulsing Dots */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {clauses.map((clause, idx) => {
          const isSelected = selectedIndex === idx;
          const isHigh = clause.riskLevel === 'HIGH' || clause.riskLevel === 'CRITICAL';
          const isMed = clause.riskLevel === 'MEDIUM';

          return (
            <motion.button
              key={clause.id}
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedIndex(idx)}
              className={`py-2 px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white/80 dark:bg-neutral-800/80 hover:bg-neutral-100 text-neutral-700 dark:text-neutral-300 border border-neutral-200/70 dark:border-neutral-700/60'
              }`}
            >
              <span>{clause.title.length > 24 ? `${clause.title.slice(0, 22)}...` : clause.title}</span>
              <span className="relative flex h-2 w-2 shrink-0">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isHigh ? 'bg-rose-400' : isMed ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isHigh ? 'bg-rose-500' : isMed ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                />
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Side-by-Side Comparison Grid with Glassmorphic Elevation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Column: Original Dense Contract Text */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className={`rounded-2xl border p-6 flex flex-col justify-between backdrop-blur-md transition-all duration-300 shadow-xs hover:shadow-md ${
            highContrast
              ? 'bg-neutral-900/90 border-neutral-700/80 text-white'
              : 'bg-neutral-50/70 dark:bg-neutral-900/70 border-neutral-200/80 dark:border-neutral-800/80 text-neutral-900'
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-2 pb-3.5 mb-3.5 border-b border-neutral-200/70 dark:border-neutral-800/70">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Original Verbatim Contract Text
              </span>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-neutral-200/80 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium">
                Legal Drafting
              </span>
            </div>
            <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-2.5">{selectedClause.title}</h4>
            <div className="font-mono text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto p-4 rounded-xl bg-white/90 dark:bg-neutral-950/70 border border-neutral-200/70 dark:border-neutral-800/70 shadow-inner">
              {selectedClause.originalText}
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-neutral-200/60 dark:border-neutral-800/60 flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
            <span>Category: {selectedClause.category}</span>
            <RiskBadge level={selectedClause.riskLevel} score={selectedClause.riskScore} showScore size="sm" />
          </div>
        </motion.div>

        {/* Right Column: 8th-Grade Plain English Translation */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className={`rounded-2xl border p-6 flex flex-col justify-between backdrop-blur-md transition-all duration-300 shadow-xs hover:shadow-md ${
            highContrast
              ? 'bg-neutral-900/90 border-neutral-700/80 text-white'
              : 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-200/80 dark:border-blue-900/60 text-neutral-900'
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-2 pb-3.5 mb-3.5 border-b border-blue-200/70 dark:border-blue-900/60">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                <span>Plain English Translation (8th-Grade Level)</span>
              </span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200">
                Accessible
              </span>
            </div>

            <h4 className="text-sm font-bold text-blue-950 dark:text-blue-100 mb-2.5">
              What This Means In Practice:
            </h4>

            <div className="p-4 rounded-xl bg-white/95 dark:bg-neutral-900/90 border border-blue-100/80 dark:border-blue-900/40 text-xs sm:text-sm leading-relaxed text-neutral-800 dark:text-neutral-200 shadow-2xs space-y-3.5">
              <p className="font-semibold text-neutral-900 dark:text-white leading-relaxed">
                {selectedClause.plainEnglish}
              </p>

              <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 text-xs space-y-1">
                <strong className="block font-bold text-amber-900 dark:text-amber-200 text-[11px] uppercase tracking-wider">
                  Key Practical Takeaway:
                </strong>
                <p className="text-amber-800 dark:text-amber-300 leading-relaxed">
                  {selectedClause.potentialImpact}
                </p>
              </div>

              {selectedClause.recommendedCounterClause && (
                <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 text-xs space-y-1">
                  <strong className="block font-bold text-emerald-900 dark:text-emerald-200 text-[11px] uppercase tracking-wider">
                    Fairer Language to Ask For:
                  </strong>
                  <p className="text-emerald-800 dark:text-emerald-300 italic leading-relaxed">
                    &ldquo;{selectedClause.recommendedCounterClause}&rdquo;
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-blue-200/60 dark:border-blue-900/60 flex items-center justify-between text-xs">
            <span className="text-neutral-500 dark:text-neutral-400 font-medium">
              Clause {selectedIndex + 1} of {clauses.length}
            </span>
            <div className="flex gap-2">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={selectedIndex === 0}
                onClick={() => setSelectedIndex(prev => Math.max(0, prev - 1))}
                className="px-3 py-1.5 rounded-xl border border-neutral-300/80 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 hover:bg-neutral-50 disabled:opacity-40 text-xs font-semibold focus:outline-none shadow-2xs"
              >
                Previous
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={selectedIndex === clauses.length - 1}
                onClick={() => setSelectedIndex(prev => Math.min(clauses.length - 1, prev + 1))}
                className="px-3 py-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 text-xs font-semibold focus:outline-none shadow-2xs"
              >
                Next
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

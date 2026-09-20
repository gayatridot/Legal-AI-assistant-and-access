import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookMarked,
  CheckCircle2,
  BookOpen,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  ScrollText,
  Lightbulb,
  MessageSquareQuote,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ClauseAnalysis } from '../types/legal.js';
import { RiskBadge } from './RiskBadge.js';

interface LegaleseSimplifierProps {
  clauses: ClauseAnalysis[];
  highContrast: boolean;
}

interface GlossaryTerm {
  term: string;
  plainMeaning: string;
  realWorldExample: string;
}

const COMMON_LEGAL_GLOSSARY: GlossaryTerm[] = [
  {
    term: 'Indemnify & Hold Harmless',
    plainMeaning:
      "You agree to pay for the other party's legal costs and damages if they get sued because of your work.",
    realWorldExample:
      'If a client is sued for copyright infringement over code you wrote, you must pay their lawyers.',
  },
  {
    term: 'Liquidated Damages',
    plainMeaning:
      'A pre-set penalty you must pay immediately if a deadline or obligation is broken — no need to prove actual loss.',
    realWorldExample: 'A fixed $1,000 fine for every day a project is late.',
  },
  {
    term: 'Severability',
    plainMeaning:
      'If a court voids one clause, the rest of the contract remains fully enforceable.',
    realWorldExample:
      'An extreme non-compete is thrown out but the payment terms still apply.',
  },
  {
    term: 'Force Majeure',
    plainMeaning:
      'An "Act of God" clause excusing both parties from performance during uncontrollable disasters.',
    realWorldExample:
      'No penalty for late delivery if an earthquake shuts down power across the region.',
  },
  {
    term: 'Subrogation Waiver',
    plainMeaning:
      'Prevents insurance companies from suing the other party after paying out a claim.',
    realWorldExample:
      "Water damages a leased store; the tenant's insurer pays and agrees not to sue the landlord.",
  },
  {
    term: 'Forum Non Conveniens',
    plainMeaning:
      'An objection that the court venue chosen by the other party is unfairly far away.',
    realWorldExample: 'A Texas freelancer objecting to flying to London over an unpaid $500 invoice.',
  },
  {
    term: 'Work Made for Hire',
    plainMeaning:
      'The hiring company owns 100% of all creations from day one — you retain nothing.',
    realWorldExample:
      'You cannot reuse the software you built in your portfolio without written permission.',
  },
];

/** Colour token helper for clause pills */
function clausePillClasses(riskLevel: string, selected: boolean) {
  if (selected) {
    const isHigh = riskLevel === 'HIGH' || riskLevel === 'CRITICAL';
    const isMed = riskLevel === 'MEDIUM';
    if (isHigh) return 'bg-rose-500 text-white border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.5)]';
    if (isMed) return 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]';
    return 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.45)]';
  }
  return 'bg-slate-800/70 border-slate-700/60 text-slate-300 hover:bg-slate-700/80 hover:text-white';
}

function riskDotColor(riskLevel: string) {
  if (riskLevel === 'HIGH' || riskLevel === 'CRITICAL') return { ping: 'bg-rose-400', dot: 'bg-rose-400' };
  if (riskLevel === 'MEDIUM') return { ping: 'bg-amber-400', dot: 'bg-amber-400' };
  return { ping: 'bg-emerald-400', dot: 'bg-emerald-400' };
}

export function LegaleseSimplifier({ clauses }: LegaleseSimplifierProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [showGlossary, setShowGlossary] = useState<boolean>(false);

  const selectedClause = clauses[selectedIndex] || clauses[0];

  if (!selectedClause) {
    return (
      <div className="p-8 text-center text-sm text-slate-400">
        No clauses loaded for comparison.
      </div>
    );
  }

  return (
    <div id="legalese-simplifier" role="region" aria-label="Side-by-Side Legalese Simplifier" className="space-y-5">

      {/* ─────────────────────────────────────── */}
      {/* SECTION HEADER                          */}
      {/* ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500/30 to-indigo-500/20 border border-blue-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <Sparkles className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white tracking-tight">Legalese Simplifier</h2>
            <p className="text-xs text-slate-400 font-medium">
              Dense legal jargon → plain 8th-grade English, side by side
            </p>
          </div>
        </div>

        {/* Glossary toggle */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowGlossary(!showGlossary)}
          aria-expanded={showGlossary}
          aria-controls="jargon-glossary-panel"
          className="px-4 py-2 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/35 text-indigo-300 text-xs font-bold inline-flex items-center gap-2 transition-all focus:outline-none shadow-md"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>{showGlossary ? 'Close Jargon Glossary' : 'Open Jargon Glossary'}</span>
          {showGlossary ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </motion.button>
      </div>

      {/* ─────────────────────────────────────── */}
      {/* JARGON GLOSSARY DRAWER                  */}
      {/* ─────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {showGlossary && (
          <motion.div
            id="jargon-glossary-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="p-5 rounded-2xl bg-indigo-500/8 border border-indigo-500/25 backdrop-blur-md">
              <div className="flex items-center gap-2 mb-4">
                <BookMarked className="w-4 h-4 text-indigo-400" />
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-300">
                  Essential Legal Jargon Cheat Sheet
                </h4>
                <span className="ml-auto text-[11px] text-slate-400 hidden sm:block">
                  Common contractual terms decoded
                </span>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {COMMON_LEGAL_GLOSSARY.map((item, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -2 }}
                    className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/60 space-y-2"
                  >
                    <strong className="block text-indigo-300 font-extrabold text-xs tracking-tight">
                      {item.term}
                    </strong>
                    <p className="text-sm text-slate-200 leading-snug">{item.plainMeaning}</p>
                    <p className="text-[11px] text-slate-400 italic pt-2 border-t border-slate-700/50 leading-snug">
                      e.g. {item.realWorldExample}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────── */}
      {/* CLAUSE NAVIGATION PILLS                 */}
      {/* ─────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {clauses.map((clause, idx) => {
          const isSelected = selectedIndex === idx;
          const dots = riskDotColor(clause.riskLevel);
          return (
            <motion.button
              key={clause.id}
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedIndex(idx)}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 focus:outline-none border ${clausePillClasses(clause.riskLevel, isSelected)}`}
            >
              <span>{clause.title.length > 22 ? `${clause.title.slice(0, 20)}…` : clause.title}</span>
              <span className="relative flex h-2 w-2 shrink-0">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-70 ${dots.ping}`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${dots.dot}`} />
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* ─────────────────────────────────────── */}
      {/* SIDE-BY-SIDE COMPARISON                 */}
      {/* ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* LEFT — Original verbatim text */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="rounded-2xl border border-slate-700/60 bg-slate-900/80 backdrop-blur-xl overflow-hidden flex flex-col"
        >
          {/* Panel header */}
          <div className="px-5 py-3.5 border-b border-slate-700/50 bg-slate-800/50 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ScrollText className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Original Verbatim Text
              </span>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-slate-700/60 text-slate-300 border border-slate-600/40">
              Legal Drafting
            </span>
          </div>

          {/* Clause title + category */}
          <div className="px-5 pt-4 pb-2">
            <h4 className="text-base font-extrabold text-white leading-tight mb-1">
              {selectedClause.title}
            </h4>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {selectedClause.category}
              </span>
              <RiskBadge level={selectedClause.riskLevel} score={selectedClause.riskScore} showScore size="sm" />
            </div>
          </div>

          {/* Verbatim body */}
          <div className="px-5 pb-5 flex-1">
            <div className="mt-3 font-mono text-sm text-slate-300 leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto p-4 rounded-xl bg-slate-950/70 border border-slate-700/50 shadow-inner">
              {selectedClause.originalText}
            </div>
          </div>
        </motion.div>

        {/* RIGHT — Plain English */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="rounded-2xl border border-blue-500/30 bg-blue-500/5 backdrop-blur-xl overflow-hidden flex flex-col shadow-[0_0_25px_rgba(59,130,246,0.1)]"
        >
          {/* Panel header */}
          <div className="px-5 py-3.5 border-b border-blue-500/20 bg-blue-500/10 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-400">
                Plain English (8th-Grade Level)
              </span>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Accessible
            </span>
          </div>

          <div className="px-5 pt-4 pb-5 flex-1 space-y-4">
            {/* What it means */}
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-400 mb-2 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5" />
                What this means in practice
              </h4>
              <p className="text-sm text-white font-medium leading-relaxed">
                {selectedClause.plainEnglish}
              </p>
            </div>

            {/* Key takeaway */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25">
              <span className="block text-[11px] font-extrabold uppercase tracking-wider text-amber-400 mb-2">
                ⚡ Key Practical Takeaway
              </span>
              <p className="text-sm text-amber-100 leading-relaxed">
                {selectedClause.potentialImpact}
              </p>
            </div>

            {/* Counter-clause */}
            {selectedClause.recommendedCounterClause && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquareQuote className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400">
                    Fairer Language to Ask For
                  </span>
                </div>
                <p className="text-sm font-mono text-emerald-200 italic leading-relaxed bg-slate-950/50 p-3 rounded-lg border border-emerald-800/30 select-all">
                  &ldquo;{selectedClause.recommendedCounterClause}&rdquo;
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ─────────────────────────────────────── */}
      {/* NAVIGATION FOOTER                       */}
      {/* ─────────────────────────────────────── */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-semibold text-slate-400">
          Clause <span className="text-white">{selectedIndex + 1}</span> of {clauses.length}
        </span>
        <div className="flex gap-2">
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={selectedIndex === 0}
            onClick={() => setSelectedIndex(prev => Math.max(0, prev - 1))}
            className="px-4 py-2 rounded-xl border border-slate-700/60 bg-slate-800/70 text-slate-300 hover:bg-slate-700 disabled:opacity-30 text-xs font-bold inline-flex items-center gap-1.5 focus:outline-none transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={selectedIndex === clauses.length - 1}
            onClick={() => setSelectedIndex(prev => Math.min(clauses.length - 1, prev + 1))}
            className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 disabled:opacity-30 text-xs font-bold inline-flex items-center gap-1.5 focus:outline-none transition-all"
          >
            <span>Next</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

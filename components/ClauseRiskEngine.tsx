import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  ShieldAlert,
  ArrowRight,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { ClauseAnalysis, RiskLevel } from '../types/legal.js';
import { RiskBadge } from './RiskBadge.js';

interface ClauseRiskEngineProps {
  clauses: ClauseAnalysis[];
  highContrast: boolean;
}

export function ClauseRiskEngine({ clauses, highContrast }: ClauseRiskEngineProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedVerbatim, setExpandedVerbatim] = useState<Record<string, boolean>>({});

  const categories = ['ALL', ...Array.from(new Set(clauses.map(c => c.category)))];

  const filteredClauses = clauses.filter(clause => {
    const matchesCategory = selectedCategory === 'ALL' || clause.category === selectedCategory;
    const matchesRisk =
      selectedRisk === 'ALL' ||
      (selectedRisk === 'HIGH' && (clause.riskLevel === 'HIGH' || clause.riskLevel === 'CRITICAL')) ||
      (selectedRisk === 'MEDIUM' && clause.riskLevel === 'MEDIUM') ||
      (selectedRisk === 'LOW' && (clause.riskLevel === 'LOW' || clause.riskLevel === 'FAIR'));
    const matchesSearch =
      searchQuery === '' ||
      clause.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clause.plainEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clause.riskReason.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesRisk && matchesSearch;
  });

  const handleCopyCounterClause = (clauseId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(clauseId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleVerbatim = (id: string) => {
    setExpandedVerbatim(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div id="clause-risk-engine" role="region" aria-label="Clause Risk & Flagging Engine" className="space-y-6">
      {/* Controls Bar: Glassmorphic Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 rounded-2xl border backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4 transition-colors shadow-xs ${
          highContrast
            ? 'bg-neutral-900/90 border-neutral-700/80 text-white'
            : 'bg-white/85 border-neutral-200/80 text-neutral-900'
        }`}
      >
        {/* Search Field */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search clause topic or risk..."
            aria-label="Filter clauses by keyword"
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-neutral-300/80 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-neutral-50/70 dark:bg-neutral-950/60 transition-all"
          />
        </div>

        {/* Severity & Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-neutral-500 dark:text-neutral-400 font-medium mr-1 text-[11px] uppercase tracking-wider">
              Severity:
            </span>
            {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map(level => {
              const isActive = selectedRisk === level;
              return (
                <motion.button
                  key={level}
                  type="button"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setSelectedRisk(level)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-neutral-100/80 dark:bg-neutral-800/70 hover:bg-neutral-200/80 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  {level === 'ALL' ? 'All Risks' : level}
                </motion.button>
              );
            })}
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs pl-3 border-l border-neutral-200/80 dark:border-neutral-700/80">
            <span className="text-neutral-500 dark:text-neutral-400 font-medium mr-1 text-[11px] uppercase tracking-wider">
              Topic:
            </span>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              aria-label="Filter by clause category"
              className="py-1.5 px-3 rounded-xl border border-neutral-300/80 dark:border-neutral-700 text-xs font-medium bg-neutral-50/80 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Clause Cards List */}
      {filteredClauses.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50/60 dark:bg-neutral-900/40 backdrop-blur-xs">
          <HelpCircle className="w-8 h-8 text-neutral-400 mx-auto mb-2" aria-hidden="true" />
          <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            No clauses match your filter criteria.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('ALL');
              setSelectedRisk('ALL');
              setSearchQuery('');
            }}
            className="mt-3 text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline focus:outline-none"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredClauses.map((clause, index) => {
            const isVerbatimOpen = expandedVerbatim[clause.id] || false;

            return (
              <motion.article
                key={clause.id}
                id={`clause-card-${clause.id}`}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: Math.min(index * 0.05, 0.4),
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{
                  y: -3,
                  transition: { type: 'spring', stiffness: 350, damping: 25 },
                }}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden backdrop-blur-md shadow-xs hover:shadow-md ${
                  highContrast
                    ? 'bg-neutral-900/90 border-neutral-700/80 text-white'
                    : 'bg-white/85 border-neutral-200/80 text-neutral-900'
                }`}
              >
                {/* Clause Card Header with Status Pill and Pulsing Dot */}
                <div className="p-5 sm:p-6 border-b border-neutral-100/80 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-950/40 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="text-base font-bold tracking-tight text-neutral-900 dark:text-white">
                        {clause.title}
                      </h3>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                        {clause.category}
                      </span>
                    </div>
                  </div>

                  {/* Pulsing Status Pill Badge with Risk Score */}
                  <div className="flex items-center gap-2">
                    <RiskBadge level={clause.riskLevel} score={clause.riskScore} showScore={true} size="md" />
                  </div>
                </div>

                {/* Clause Card Body */}
                <div className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm">
                  {/* Plain English Translation with Refined Typography */}
                  <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100/80 dark:border-blue-900/50 text-blue-950 dark:text-blue-100 backdrop-blur-xs shadow-2xs">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300 mb-1.5">
                      Plain English Translation (8th-Grade Reading Level)
                    </span>
                    <p className="leading-relaxed font-medium">{clause.plainEnglish}</p>
                  </div>

                  {/* Why it's risky & Business Impact */}
                  <div className="grid sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-neutral-50/80 dark:bg-neutral-950/40 border border-neutral-200/70 dark:border-neutral-800/60 shadow-2xs">
                      <strong className="block font-bold text-neutral-900 dark:text-neutral-100 mb-1 text-[11px] uppercase tracking-wider">
                        Specific Risk & Asymmetry:
                      </strong>
                      <span className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
                        {clause.riskReason}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-neutral-50/80 dark:bg-neutral-950/40 border border-neutral-200/70 dark:border-neutral-800/60 shadow-2xs">
                      <strong className="block font-bold text-neutral-900 dark:text-neutral-100 mb-1 text-[11px] uppercase tracking-wider">
                        Potential Business / Legal Impact:
                      </strong>
                      <span className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
                        {clause.potentialImpact}
                      </span>
                    </div>
                  </div>

                  {/* Recommended Counter-Clause */}
                  {clause.recommendedCounterClause && (
                    <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 text-emerald-950 dark:text-emerald-100 backdrop-blur-xs shadow-2xs">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                          <span>Recommended Counter-Clause / Fairer Language</span>
                        </span>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() =>
                            handleCopyCounterClause(clause.id, clause.recommendedCounterClause || '')
                          }
                          aria-label="Copy counter-clause to clipboard"
                          className="px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 hover:bg-emerald-50 dark:hover:bg-neutral-700 text-emerald-800 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-700 text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          {copiedId === clause.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                              <span>Copy Counter-Clause</span>
                            </>
                          )}
                        </motion.button>
                      </div>
                      <p className="text-xs font-mono text-emerald-900 dark:text-emerald-200 bg-white/70 dark:bg-neutral-900/80 p-3 rounded-lg border border-emerald-200/60 dark:border-emerald-800/50 leading-relaxed select-all">
                        &ldquo;{clause.recommendedCounterClause}&rdquo;
                      </p>
                    </div>
                  )}

                  {/* Animated Collapsible: Verbatim Contract Text Toggle */}
                  <div className="pt-1">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => toggleVerbatim(clause.id)}
                      aria-expanded={isVerbatimOpen}
                      aria-controls={`verbatim-${clause.id}`}
                      className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white inline-flex items-center gap-1.5 transition-colors focus:outline-none"
                    >
                      <FileText className="w-3.5 h-3.5 text-neutral-400" aria-hidden="true" />
                      <span>{isVerbatimOpen ? 'Hide Original Contract Text' : 'View Original Contract Text'}</span>
                      {isVerbatimOpen ? (
                        <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                      )}
                    </motion.button>

                    {/* Smooth Collapsible Slide-down and Fade-in Animation */}
                    <AnimatePresence initial={false}>
                      {isVerbatimOpen && (
                        <motion.div
                          id={`verbatim-${clause.id}`}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="mt-2.5 p-4 rounded-xl bg-neutral-100/90 dark:bg-neutral-950/70 border border-neutral-200/80 dark:border-neutral-800 text-xs font-mono text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed shadow-inner">
                            {clause.originalText}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </div>
  );
}


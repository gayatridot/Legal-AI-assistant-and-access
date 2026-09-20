import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Search,
  HelpCircle,
  FileText,
  ShieldAlert,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { ClauseAnalysis, RiskLevel } from '../types/legal.js';
import { RiskBadge } from './RiskBadge.js';

interface ClauseRiskEngineProps {
  clauses: ClauseAnalysis[];
  highContrast: boolean;
}

/** Per-risk-level card accent colours (left border + header tint) */
function riskMeta(level: RiskLevel | string) {
  const n = (level || 'LOW').toUpperCase();
  if (n === 'CRITICAL') {
    return {
      border: 'border-l-rose-500',
      headerBg: 'bg-rose-500/10',
      headerBorder: 'border-rose-500/25',
      icon: <ShieldAlert className="w-5 h-5 text-rose-400" />,
      glow: 'hover:shadow-[0_4px_30px_rgba(244,63,94,0.2)]',
      scoreBar: 'bg-rose-500',
    };
  }
  if (n === 'HIGH') {
    return {
      border: 'border-l-rose-400',
      headerBg: 'bg-rose-500/8',
      headerBorder: 'border-rose-500/20',
      icon: <AlertTriangle className="w-5 h-5 text-rose-400" />,
      glow: 'hover:shadow-[0_4px_30px_rgba(244,63,94,0.18)]',
      scoreBar: 'bg-rose-400',
    };
  }
  if (n === 'MEDIUM') {
    return {
      border: 'border-l-amber-400',
      headerBg: 'bg-amber-500/8',
      headerBorder: 'border-amber-500/20',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
      glow: 'hover:shadow-[0_4px_30px_rgba(245,158,11,0.18)]',
      scoreBar: 'bg-amber-400',
    };
  }
  return {
    border: 'border-l-emerald-400',
    headerBg: 'bg-emerald-500/8',
    headerBorder: 'border-emerald-500/20',
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    glow: 'hover:shadow-[0_4px_30px_rgba(52,211,153,0.15)]',
    scoreBar: 'bg-emerald-400',
  };
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

  const toggleVerbatim = (id: string) =>
    setExpandedVerbatim(prev => ({ ...prev, [id]: !prev[id] }));

  /* ── risk counts for summary pills ── */
  const highCount = clauses.filter(
    c => c.riskLevel === 'HIGH' || c.riskLevel === 'CRITICAL',
  ).length;
  const medCount = clauses.filter(c => c.riskLevel === 'MEDIUM').length;
  const lowCount = clauses.filter(
    c => c.riskLevel === 'LOW' || c.riskLevel === 'FAIR',
  ).length;

  /* ── severity filter config ── */
  const severityFilters = [
    { id: 'ALL', label: 'All', count: clauses.length },
    { id: 'HIGH', label: 'High / Critical', count: highCount, color: 'text-rose-300' },
    { id: 'MEDIUM', label: 'Medium', count: medCount, color: 'text-amber-300' },
    { id: 'LOW', label: 'Low', count: lowCount, color: 'text-emerald-300' },
  ];

  return (
    <div id="clause-risk-engine" role="region" aria-label="Clause Risk & Flagging Engine" className="space-y-5">

      {/* ─────────────────────────────────────────────── */}
      {/* SECTION HEADER                                  */}
      {/* ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500/30 to-amber-500/20 border border-rose-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.2)]">
            <Zap className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white tracking-tight">Clause Risk Engine</h2>
            <p className="text-xs text-slate-400 font-medium">{clauses.length} clauses analysed</p>
          </div>
        </div>

        {/* Summary pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            {highCount} High
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            {medCount} Medium
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {lowCount} Low
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────── */}
      {/* CONTROLS BAR                                    */}
      {/* ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-2xl border bg-slate-900/80 border-slate-700/60 backdrop-blur-md shadow-xl flex flex-col md:flex-row items-stretch md:items-center gap-4"
      >
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search clause title or risk…"
            aria-label="Filter clauses by keyword"
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-700/70 bg-slate-950/70 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
          />
        </div>

        {/* Severity filters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden sm:block">
            Severity:
          </span>
          {severityFilters.map(f => {
            const isActive = selectedRisk === f.id;
            return (
              <motion.button
                key={f.id}
                type="button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setSelectedRisk(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all focus:outline-none border ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_12px_rgba(56,189,248,0.4)]'
                    : 'bg-slate-800/70 border-slate-700/60 text-slate-300 hover:bg-slate-700/80 hover:text-white'
                }`}
              >
                {f.label}
                {f.count !== undefined && (
                  <span className={`ml-1.5 ${isActive ? 'text-slate-900' : (f.color || 'text-slate-400')}`}>
                    ({f.count})
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Topic select */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden sm:block shrink-0">
            Topic:
          </span>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            aria-label="Filter by clause category"
            className="py-2 px-3 rounded-xl border border-slate-700/70 bg-slate-950/70 text-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/50 cursor-pointer"
          >
            {categories.map(cat => (
              <option key={cat} value={cat} className="bg-slate-900">
                {cat}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* ─────────────────────────────────────────────── */}
      {/* EMPTY STATE                                     */}
      {/* ─────────────────────────────────────────────── */}
      {filteredClauses.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-dashed border-slate-700/60 bg-slate-900/40 backdrop-blur-xs">
          <HelpCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" aria-hidden="true" />
          <p className="text-sm font-bold text-white mb-1">No clauses match your filters</p>
          <p className="text-xs text-slate-400 mb-4">Try adjusting the severity or topic filter.</p>
          <button
            type="button"
            onClick={() => { setSelectedCategory('ALL'); setSelectedRisk('ALL'); setSearchQuery(''); }}
            className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 text-xs font-bold transition-all focus:outline-none"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        /* ─────────────────────────────────────────── */
        /* CLAUSE CARDS                                */
        /* ─────────────────────────────────────────── */
        <div className="space-y-4">
          {filteredClauses.map((clause, index) => {
            const isVerbatimOpen = expandedVerbatim[clause.id] || false;
            const meta = riskMeta(clause.riskLevel);

            return (
              <motion.article
                key={clause.id}
                id={`clause-card-${clause.id}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.4), ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -2, transition: { type: 'spring', stiffness: 350, damping: 25 } }}
                className={`rounded-2xl border-l-4 border border-slate-700/60 bg-slate-900/80 backdrop-blur-xl overflow-hidden transition-all duration-200 ${meta.border} ${meta.glow}`}
              >
                {/* ── CARD HEADER ── */}
                <div className={`px-5 py-4 border-b border-slate-700/50 ${meta.headerBg} flex flex-wrap items-start justify-between gap-3`}>
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-0.5 shrink-0">{meta.icon}</div>
                    <div className="min-w-0">
                      <h3 className="text-base font-extrabold text-white leading-snug tracking-tight">
                        {clause.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          {clause.category}
                        </span>
                        {/* Risk score mini-bar */}
                        <div className="flex items-center gap-1.5">
                          <div className="w-20 h-1.5 rounded-full bg-slate-700 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${meta.scoreBar} transition-all duration-700`}
                              style={{ width: `${clause.riskScore}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono font-bold text-slate-400">
                            {clause.riskScore}/100
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <RiskBadge level={clause.riskLevel} score={clause.riskScore} showScore={false} size="md" />
                </div>

                {/* ── CARD BODY ── */}
                <div className="px-5 py-5 space-y-4">

                  {/* Plain English */}
                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/25">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-400">
                        Plain English — What this means
                      </span>
                    </div>
                    <p className="text-sm text-blue-100 leading-relaxed font-medium">
                      {clause.plainEnglish}
                    </p>
                  </div>

                  {/* Risk Reason + Potential Impact */}
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/50">
                      <span className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                        ⚠ Specific Risk &amp; Asymmetry
                      </span>
                      <p className="text-sm text-slate-200 leading-relaxed">
                        {clause.riskReason}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/50">
                      <span className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                        ⚡ Potential Business Impact
                      </span>
                      <p className="text-sm text-slate-200 leading-relaxed">
                        {clause.potentialImpact}
                      </p>
                    </div>
                  </div>

                  {/* Recommended Counter-Clause */}
                  {clause.recommendedCounterClause && (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400">
                            Recommended Counter-Clause / Fairer Language
                          </span>
                        </div>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => handleCopyCounterClause(clause.id, clause.recommendedCounterClause || '')}
                          aria-label="Copy counter-clause to clipboard"
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold inline-flex items-center gap-1.5 transition-all focus:outline-none shadow-md"
                        >
                          {copiedId === clause.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Copy</span>
                            </>
                          )}
                        </motion.button>
                      </div>
                      <p className="text-xs font-mono text-emerald-200 bg-slate-950/60 p-3.5 rounded-lg border border-emerald-800/40 leading-relaxed select-all">
                        &ldquo;{clause.recommendedCounterClause}&rdquo;
                      </p>
                    </div>
                  )}

                  {/* Verbatim toggle */}
                  <div className="pt-1 border-t border-slate-700/40">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => toggleVerbatim(clause.id)}
                      aria-expanded={isVerbatimOpen}
                      aria-controls={`verbatim-${clause.id}`}
                      className="mt-2 text-xs font-semibold text-slate-400 hover:text-slate-200 inline-flex items-center gap-1.5 transition-colors focus:outline-none group"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
                      <span>{isVerbatimOpen ? 'Hide Original Contract Text' : 'View Original Contract Text'}</span>
                      {isVerbatimOpen
                        ? <ChevronUp className="w-3.5 h-3.5" />
                        : <ChevronDown className="w-3.5 h-3.5" />}
                    </motion.button>

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
                          <div className="mt-3 p-4 rounded-xl bg-slate-950/80 border border-slate-700/60 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed shadow-inner">
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

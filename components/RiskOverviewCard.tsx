import { motion } from 'motion/react';
import { Calendar, Users, FileCheck, ShieldAlert, Sparkles } from 'lucide-react';
import { DocumentSummary, MissingProtection } from '../types/legal.js';
import { RiskBadge } from './RiskBadge.js';

interface RiskOverviewCardProps {
  summary: DocumentSummary;
  missingProtections: MissingProtection[];
  highContrast: boolean;
}

export function RiskOverviewCard({ summary, missingProtections, highContrast }: RiskOverviewCardProps) {
  const getScoreTheme = (score: number) => {
    if (score >= 75) {
      return {
        text: 'text-rose-600 dark:text-rose-400',
        stroke: '#f43f5e',
        glowBg: 'bg-rose-500/15',
        glowRing: 'ring-rose-400/30',
        badgeBg: 'bg-rose-500',
        label: 'HIGH',
      };
    }
    if (score >= 45) {
      return {
        text: 'text-amber-600 dark:text-amber-400',
        stroke: '#f59e0b',
        glowBg: 'bg-amber-500/15',
        glowRing: 'ring-amber-400/30',
        badgeBg: 'bg-amber-500',
        label: 'MEDIUM',
      };
    }
    return {
      text: 'text-emerald-600 dark:text-emerald-400',
      stroke: '#10b981',
      glowBg: 'bg-emerald-500/15',
      glowRing: 'ring-emerald-400/30',
      badgeBg: 'bg-emerald-500',
      label: 'FAIR',
    };
  };

  const theme = getScoreTheme(summary.overallRiskScore);
  const radius = 50;
  const circumference = 2 * Math.PI * radius; // ~314.16

  return (
    <motion.div
      id="document-risk-overview"
      role="region"
      aria-label="Document Risk Overview"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`rounded-2xl border p-6 sm:p-8 backdrop-blur-md transition-all duration-300 shadow-xs hover:shadow-md ${
        highContrast
          ? 'bg-neutral-900/90 border-neutral-700/80 text-white'
          : 'bg-white/85 border-neutral-200/80 text-neutral-900'
      }`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Risk Gauge & Score with Animated Progress Ring & Glowing Indicator */}
        <div className="lg:col-span-4 relative flex flex-col items-center justify-center p-6 rounded-2xl bg-neutral-50/60 dark:bg-neutral-950/40 border border-neutral-200/60 dark:border-neutral-800/60 text-center overflow-hidden">
          {/* Subtle Ambient Radial Glow */}
          <div
            className={`absolute w-44 h-44 rounded-full blur-3xl opacity-60 pointer-events-none transition-all duration-700 ${theme.glowBg}`}
            aria-hidden="true"
          />

          <span className="relative text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
            Aggregated Risk Score
          </span>

          {/* Animated Circular Progress Gauge */}
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              {/* Background Track Ring */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                className="stroke-neutral-200/80 dark:stroke-neutral-800"
                strokeWidth="8"
                fill="none"
              />

              {/* Animated Progress Ring */}
              <motion.circle
                cx="60"
                cy="60"
                r={radius}
                stroke={theme.stroke}
                strokeWidth="8"
                strokeLinecap="round"
                fill="none"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{
                  strokeDashoffset:
                    circumference - (circumference * Math.min(100, summary.overallRiskScore)) / 100,
                }}
                transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              />
            </svg>

            {/* Score in Center with Smooth Entry */}
            <motion.div
              className="absolute flex flex-col items-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <span className={`text-4xl sm:text-5xl font-extrabold tracking-tight ${theme.text}`}>
                {summary.overallRiskScore}
              </span>
              <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mt-0.5">
                out of 100
              </span>
            </motion.div>
          </div>

          {/* Glowing Status Indicator Badge */}
          <div className="relative mt-3">
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-xs shadow-xs ring-2 ${theme.glowRing}`}
            >
              <RiskBadge level={summary.overallRiskLevel} size="sm" />
            </div>
          </div>

          <p className="relative text-[11px] text-neutral-500 dark:text-neutral-400 mt-2.5 max-w-xs leading-relaxed">
            Derived from clause asymmetry, predatory traps, and missing contractual protections.
          </p>
        </div>

        {/* Right Column: Executive Summary & Stat Pills */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Document Classification
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                {summary.documentType}
              </h2>
            </div>

            {/* Micro Stats Grid with Spring Hover Animation */}
            <div className="flex items-center gap-2">
              <motion.div
                whileHover={{ y: -2, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="px-3.5 py-1.5 rounded-xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-800/50 text-center shadow-2xs backdrop-blur-xs"
              >
                <span className="block text-sm font-extrabold text-rose-700 dark:text-rose-400">
                  {summary.highRiskCount}
                </span>
                <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-300 uppercase tracking-wider">
                  High Risk
                </span>
              </motion.div>

              <motion.div
                whileHover={{ y: -2, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="px-3.5 py-1.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/50 text-center shadow-2xs backdrop-blur-xs"
              >
                <span className="block text-sm font-extrabold text-amber-700 dark:text-amber-400">
                  {summary.mediumRiskCount}
                </span>
                <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                  Medium
                </span>
              </motion.div>

              <motion.div
                whileHover={{ y: -2, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/50 text-center shadow-2xs backdrop-blur-xs"
              >
                <span className="block text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
                  {summary.lowRiskCount}
                </span>
                <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                  Fair
                </span>
              </motion.div>

              {missingProtections.length > 0 && (
                <motion.div
                  whileHover={{ y: -2, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200/70 dark:border-purple-800/50 text-center shadow-2xs backdrop-blur-xs"
                >
                  <span className="block text-sm font-extrabold text-purple-800 dark:text-purple-300">
                    {missingProtections.length}
                  </span>
                  <span className="text-[10px] font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                    Missing
                  </span>
                </motion.div>
              )}
            </div>
          </div>

          {/* Plain English Executive Summary Card with Glassmorphic Shading */}
          <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50/70 dark:bg-neutral-950/50 border border-neutral-200/70 dark:border-neutral-800/70 backdrop-blur-xs text-neutral-800 dark:text-neutral-200 text-xs sm:text-sm leading-relaxed shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              <span>Plain English Executive Summary</span>
            </h3>
            <p className="text-neutral-700 dark:text-neutral-300">{summary.executiveSummary}</p>
          </div>

          {/* Metadata Badges: Parties & Dates */}
          <div className="flex flex-wrap gap-4 pt-1 text-xs text-neutral-600 dark:text-neutral-400">
            {summary.partiesInvolved && summary.partiesInvolved.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-neutral-400 shrink-0" aria-hidden="true" />
                <span className="font-semibold text-neutral-700 dark:text-neutral-300">Parties:</span>
                <span>{summary.partiesInvolved.join(', ')}</span>
              </div>
            )}
            {summary.keyDatesOrDeadlines && summary.keyDatesOrDeadlines.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-400 shrink-0" aria-hidden="true" />
                <span className="font-semibold text-neutral-700 dark:text-neutral-300">Key Timelines:</span>
                <span>{summary.keyDatesOrDeadlines.join(' &middot; ')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}


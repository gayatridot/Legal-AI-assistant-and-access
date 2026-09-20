import { motion } from 'motion/react';
import { Sparkles, Printer, RotateCcw, MessageSquare, AlertTriangle, FileText, ShieldCheck } from 'lucide-react';

interface AnalysisHeroBannerProps {
  documentTitle: string;
  documentType: string;
  overallRiskScore: number;
  onReset: () => void;
  onPrint: () => void;
  onOpenRag: () => void;
}

export function AnalysisHeroBanner({
  documentTitle,
  documentType,
  overallRiskScore,
  onReset,
  onPrint,
  onOpenRag,
}: AnalysisHeroBannerProps) {
  const isHighRisk = overallRiskScore >= 75;

  const riskColor =
    overallRiskScore >= 75
      ? 'text-rose-300'
      : overallRiskScore >= 45
      ? 'text-amber-300'
      : 'text-emerald-300';

  const riskLabel =
    overallRiskScore >= 75 ? 'High Risk' : overallRiskScore >= 45 ? 'Medium Risk' : 'Low Risk';

  return (
    <div className="relative w-full rounded-3xl bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 border border-cyan-500/30 p-6 sm:p-8 overflow-hidden backdrop-blur-xl shadow-[0_0_50px_rgba(56,189,248,0.2)] text-white">
      {/* Background sheens */}
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
      {/* Top cyan accent line */}
      <div className="absolute top-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8]" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        {/* Left: title + badges + actions */}
        <div className="space-y-4 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-400/40 inline-flex items-center gap-1.5 shadow-[0_0_10px_rgba(56,189,248,0.3)]">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>AI Analysis Dashboard</span>
            </span>

            {isHighRisk && (
              <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/40 inline-flex items-center gap-1.5 shadow-[0_0_10px_rgba(244,63,94,0.3)]">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Action Recommended</span>
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight text-white truncate">
            {documentType || 'Contract Evaluation'}
          </h1>

          <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
            <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="truncate max-w-md">{documentTitle}</span>
          </div>

          {/* Quick action buttons */}
          <div className="pt-1 flex flex-wrap items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: '0 0 20px rgba(56, 189, 248, 0.4)' }}
              whileTap={{ scale: 0.96 }}
              onClick={onOpenRag}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs inline-flex items-center gap-2 shadow-md transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Ask LexiBot RAG</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onPrint}
              className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs inline-flex items-center gap-2 backdrop-blur-md transition-all"
            >
              <Printer className="w-4 h-4 text-cyan-300" />
              <span>Export Brief</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onReset}
              className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs inline-flex items-center gap-2 backdrop-blur-md transition-all"
            >
              <RotateCcw className="w-4 h-4 text-cyan-300" />
              <span>New Analysis</span>
            </motion.button>
          </div>
        </div>

        {/* Right: risk score dial */}
        <div className="shrink-0 flex flex-col items-center justify-center gap-2 p-5 rounded-2xl bg-slate-950/60 border border-white/10 backdrop-blur-md min-w-[130px]">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
              <circle
                cx="40" cy="40" r="34"
                fill="none"
                stroke={overallRiskScore >= 75 ? '#f43f5e' : overallRiskScore >= 45 ? '#f59e0b' : '#10b981'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(overallRiskScore / 100) * 213.6} 213.6`}
                className="transition-all duration-700"
              />
            </svg>
            <div className="flex flex-col items-center">
              <ShieldCheck className={`w-5 h-5 mb-0.5 ${riskColor}`} />
              <span className={`text-xl font-black ${riskColor}`}>{overallRiskScore}</span>
            </div>
          </div>
          <span className={`text-[11px] font-bold uppercase tracking-wider ${riskColor}`}>{riskLabel}</span>
          <span className="text-[10px] text-slate-400">Risk Score</span>
        </div>
      </div>
    </div>
  );
}

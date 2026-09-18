import { motion } from 'motion/react';
import { Scale, FileText, Sun, Moon, RotateCcw, Printer, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  documentTitle?: string;
  hasAnalysis: boolean;
  highContrast: boolean;
  onToggleHighContrast: () => void;
  onReset: () => void;
  onPrint: () => void;
}

export function Header({
  documentTitle,
  hasAnalysis,
  highContrast,
  onToggleHighContrast,
  onReset,
  onPrint,
}: HeaderProps) {
  return (
    <header
      role="banner"
      className={`border-b sticky top-0 z-30 transition-colors backdrop-blur-md shadow-2xs ${
        highContrast
          ? 'bg-neutral-950/90 text-white border-neutral-800/80'
          : 'bg-white/85 text-neutral-900 border-neutral-200/80'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Vertical Indicator */}
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-xs shrink-0"
          >
            <Scale className="w-5 h-5" aria-hidden="true" />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight">LexiGuard</h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
                Legal AI Access
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
              Smart Document Analyzer &middot; Clause Risk &middot; Grounded RAG Q&A
            </p>
          </div>
        </div>

        {/* Current Document Badge (if loaded) */}
        {hasAnalysis && documentTitle && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-100/80 dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-neutral-700/80 text-xs text-neutral-700 dark:text-neutral-300 font-medium max-w-xs truncate backdrop-blur-xs">
            <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" aria-hidden="true" />
            <span className="truncate">{documentTitle}</span>
          </div>
        )}

        {/* Controls: Contrast Toggle, Print, Reset */}
        <div className="flex items-center gap-2">
          <motion.button
            type="button"
            id="contrast-toggle-btn"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onToggleHighContrast}
            aria-label={highContrast ? 'Switch to normal contrast' : 'Switch to high contrast'}
            className={`p-2 rounded-xl border text-xs font-medium inline-flex items-center gap-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              highContrast
                ? 'bg-neutral-800 border-neutral-700 text-yellow-300 hover:bg-neutral-700'
                : 'bg-neutral-50/80 border-neutral-200 text-neutral-700 hover:bg-neutral-100'
            }`}
          >
            {highContrast ? (
              <>
                <Sun className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline">High Contrast</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline">Contrast</span>
              </>
            )}
          </motion.button>

          {hasAnalysis && (
            <>
              <motion.button
                type="button"
                id="print-summary-btn"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={onPrint}
                aria-label="Export or print consultation brief"
                className="px-3.5 py-1.5 rounded-xl bg-neutral-100/90 dark:bg-neutral-800 hover:bg-neutral-200/90 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 text-xs font-medium inline-flex items-center gap-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Export Brief</span>
              </motion.button>

              <motion.button
                type="button"
                id="reset-analysis-btn"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={onReset}
                aria-label="Analyze a different legal document"
                className="px-3.5 py-1.5 rounded-xl bg-blue-50/90 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>New Analysis</span>
              </motion.button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

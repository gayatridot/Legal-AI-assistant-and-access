import { motion } from 'motion/react';
import {
  Shield,
  ArrowRight,
  AlertTriangle,
  Printer,
  RotateCcw,
  Sun,
  Moon,
  FileText,
} from 'lucide-react';

interface AppNavbarProps {
  /** Landing mode: show nav links + CTA buttons */
  mode?: 'landing' | 'analysis';
  /** Landing only */
  onSelectAction?: (action: 'samples' | 'paste' | 'upload') => void;
  onScrollTo?: (id: string) => void;
  /** Analysis only */
  documentTitle?: string;
  highContrast?: boolean;
  onToggleHighContrast?: () => void;
  onReset?: () => void;
  onPrint?: () => void;
}

export function AppNavbar({
  mode = 'landing',
  onSelectAction,
  onScrollTo,
  documentTitle,
  highContrast,
  onToggleHighContrast,
  onReset,
  onPrint,
}: AppNavbarProps) {
  const handleScroll = (id: string) => {
    if (onScrollTo) {
      onScrollTo(id);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* ---------------------------------------------------- */}
      {/* TOP LEGAL DISCLAIMER NOTICE BANNER */}
      {/* ---------------------------------------------------- */}
      <div className="w-full bg-gradient-to-r from-amber-500/90 via-yellow-500/90 to-amber-600/90 text-amber-950 px-4 py-2 text-xs font-bold shadow-md flex items-center justify-between gap-3 z-30 relative backdrop-blur-md">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-amber-950/10 text-amber-950 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <p className="text-[11px] sm:text-xs leading-snug">
              <strong className="font-extrabold uppercase tracking-wide">Legal Notice:</strong>{' '}
              Informational assistance only, not a substitute for formal legal counsel.
            </p>
          </div>
          <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-amber-950/15 text-amber-950 font-bold uppercase tracking-wider">
            Educational AI
          </span>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* NAVIGATION HEADER BAR */}
      {/* ---------------------------------------------------- */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-slate-950/80 border-b border-cyan-500/20 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="flex items-center gap-3 cursor-pointer shrink-0"
            onClick={() => handleScroll('hero-main-title')}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 shadow-[0_0_20px_rgba(56,189,248,0.5)]">
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-cyan-400">
                <Shield className="w-5 h-5 fill-cyan-400/20" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-blue-200 bg-clip-text text-transparent">
                  LexiGuard
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-extrabold uppercase border border-cyan-400/30">
                  AI Legal
                </span>
              </div>
            </div>
          </motion.div>

          {/* Center Nav — landing only */}
          {mode === 'landing' && (
            <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
              <button
                onClick={() => handleScroll('sample-contracts-section')}
                className="hover:text-cyan-300 transition-colors focus:outline-none"
              >
                Clause Analysis
              </button>
              <button
                onClick={() => handleScroll('sample-contracts-section')}
                className="hover:text-cyan-300 transition-colors focus:outline-none"
              >
                Risk Alerts
              </button>
              <button
                onClick={() => handleScroll('feature-bar-section')}
                className="hover:text-cyan-300 transition-colors focus:outline-none"
              >
                FAQ
              </button>
            </nav>
          )}

          {/* Analysis document badge */}
          {mode === 'analysis' && documentTitle && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 font-medium max-w-xs truncate backdrop-blur-xs">
              <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate">{documentTitle}</span>
            </div>
          )}

          {/* Right controls */}
          <div className="flex items-center gap-3">
            {mode === 'landing' && onSelectAction && (
              <>
                {/* <button
                  onClick={() => onSelectAction('samples')}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-colors focus:outline-none"
                >
                  Login
                </button> */}
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(251, 191, 36, 0.6)' }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onSelectAction('samples')}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 text-xs sm:text-sm font-extrabold shadow-lg transition-all focus:outline-none flex items-center gap-1.5"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </>
            )}

            {mode === 'analysis' && (
              <>
                {onToggleHighContrast && (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={onToggleHighContrast}
                    aria-label={highContrast ? 'Switch to normal contrast' : 'Switch to high contrast'}
                    className="p-2 rounded-xl border text-xs font-medium inline-flex items-center gap-1.5 transition-colors focus:outline-none bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                  >
                    {highContrast ? (
                      <>
                        <Sun className="w-4 h-4" />
                        <span className="hidden sm:inline">High Contrast</span>
                      </>
                    ) : (
                      <>
                        <Moon className="w-4 h-4" />
                        <span className="hidden sm:inline">Contrast</span>
                      </>
                    )}
                  </motion.button>
                )}
                {onPrint && (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={onPrint}
                    className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-medium inline-flex items-center gap-1.5 transition-colors focus:outline-none"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Export</span>
                  </motion.button>
                )}
                {onReset && (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={onReset}
                    className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors focus:outline-none"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>New Analysis</span>
                  </motion.button>
                )}
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}

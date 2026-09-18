import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, ShieldCheck, ChevronDown, ChevronUp, Scale } from 'lucide-react';

interface LegalDisclaimerBannerProps {
  highContrast?: boolean;
}

export function LegalDisclaimerBanner({ highContrast = false }: LegalDisclaimerBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <aside
      id="legal-disclaimer-banner"
      role="region"
      aria-label="Legal Disclaimer and System Guardrails"
      className={`border-b backdrop-blur-md transition-colors ${
        highContrast
          ? 'bg-amber-950/90 text-amber-100 border-amber-800/80'
          : 'bg-amber-50/90 text-amber-900 border-amber-200/80'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 shrink-0 shadow-2xs">
              <Scale className="w-4 h-4" aria-hidden="true" />
            </span>
            <p className="text-xs sm:text-sm font-semibold tracking-wide">
              LEGAL NOTICE:{' '}
              <span className="font-normal opacity-90">
                Provides educational and informational assistance only; does not replace formal legal counsel.
              </span>
            </p>
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            aria-controls="disclaimer-details"
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs ${
              highContrast
                ? 'bg-amber-900/80 hover:bg-amber-800 text-amber-100'
                : 'bg-amber-100/90 hover:bg-amber-200 text-amber-900'
            }`}
          >
            <span>{isExpanded ? 'Hide Guardrails' : 'Compliance & Scope'}</span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
            )}
          </motion.button>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              id="disclaimer-details"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="mt-3 pt-3 border-t border-amber-300/40 dark:border-amber-800/60 text-xs leading-relaxed space-y-2">
                <div className="grid sm:grid-cols-3 gap-3.5">
                  <div className="flex items-start gap-2.5 p-2 rounded-lg bg-amber-100/40 dark:bg-amber-950/40">
                    <AlertTriangle className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <strong className="block font-semibold">No Attorney-Client Privilege</strong>
                      <span className="text-[11px] opacity-90">Use of this platform does not create an attorney-client relationship or guarantee legal representation.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-2 rounded-lg bg-amber-100/40 dark:bg-amber-950/40">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <strong className="block font-semibold">Responsible AI Guardrails</strong>
                      <span className="text-[11px] opacity-90">All analyses are grounded strictly in text retrieved from your document using sanitized inputs and zero-cost in-memory RAG.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-2 rounded-lg bg-amber-100/40 dark:bg-amber-950/40">
                    <Scale className="w-4 h-4 text-indigo-700 dark:text-indigo-400 shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <strong className="block font-semibold">Actionable Prep Kit</strong>
                      <span className="text-[11px] opacity-90">Always review highlighted clauses and generated questions with a licensed attorney in your local jurisdiction before signing.</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
}

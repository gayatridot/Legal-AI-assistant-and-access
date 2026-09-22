import { useState, useEffect, useRef, ChangeEvent, DragEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Shield,
  FileUp,
  Zap,
  Lock,
} from 'lucide-react';
import { SAMPLE_CONTRACTS, SampleContract } from '../lib/sample-contracts.js';

interface DocumentUploaderProps {
  onAnalyzeText: (text: string, fileName?: string) => Promise<void>;
  onAnalyzeFile: (file: File) => Promise<void>;
  isLoading: boolean;
  highContrast: boolean;
  forcedTab?: 'samples' | 'paste' | 'upload';
}

/** Badge colour tokens for sample contract risk level */
function badgeMeta(badge: string) {
  if (badge.toLowerCase().includes('high'))
    return {
      pill: 'bg-rose-500/15 text-rose-300 border-rose-500/35',
      ping: 'bg-rose-400',
      dot: 'bg-rose-400',
      cardAccent: 'hover:border-rose-500/40 hover:shadow-[0_8px_30px_rgba(244,63,94,0.15)]',
    };
  if (badge.toLowerCase().includes('ip') || badge.toLowerCase().includes('liability'))
    return {
      pill: 'bg-amber-500/15 text-amber-300 border-amber-500/35',
      ping: 'bg-amber-400',
      dot: 'bg-amber-400',
      cardAccent: 'hover:border-amber-500/40 hover:shadow-[0_8px_30px_rgba(245,158,11,0.15)]',
    };
  return {
    pill: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35',
    ping: 'bg-emerald-400',
    dot: 'bg-emerald-400',
    cardAccent: 'hover:border-emerald-500/40 hover:shadow-[0_8px_30px_rgba(52,211,153,0.12)]',
  };
}

export function DocumentUploader({
  onAnalyzeText,
  onAnalyzeFile,
  isLoading,
  forcedTab,
}: DocumentUploaderProps) {
  const [activeTab, setActiveTab] = useState<'paste' | 'upload' | 'samples'>(
    forcedTab || 'samples',
  );

  // Sync forcedTab changes from parent without a render-time state mutation
  useEffect(() => {
    if (forcedTab) setActiveTab(forcedTab);
  }, [forcedTab]);

  const [pastedText, setPastedText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setErrorMessage(null);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setErrorMessage(null);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handlePasteSubmit = async () => {
    if (!pastedText || pastedText.trim().length < 30) {
      setErrorMessage('Please paste at least 30 characters of contract or legal text.');
      return;
    }
    setErrorMessage(null);
    await onAnalyzeText(pastedText, 'Pasted-Contract.txt');
  };

  const handleFileSubmit = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select or drop a valid file first.');
      return;
    }
    if (selectedFile.size === 0) {
      setErrorMessage('The selected file is empty. Please choose a valid document.');
      return;
    }
    if (!selectedFile.name.toLowerCase().endsWith('.pdf') && selectedFile.type !== 'application/pdf') {
      try {
        const fileText = await selectedFile.text();
        if (fileText.trim().length < 30) {
          setErrorMessage('File contains less than 30 characters. Please choose a file with sufficient legal text.');
          return;
        }
      } catch {
        // fall through
      }
    }
    setErrorMessage(null);
    await onAnalyzeFile(selectedFile);
  };

  const handleSelectSample = async (sample: SampleContract) => {
    setErrorMessage(null);
    await onAnalyzeText(sample.text, sample.title);
  };

  const tabs = [
    { id: 'samples' as const, label: 'Sample Contracts', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'paste' as const, label: 'Paste Text', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'upload' as const, label: 'Upload PDF', icon: <UploadCloud className="w-3.5 h-3.5" /> },
  ];

  return (
    <section
      id="document-uploader-section"
      aria-label="Document Ingestion and Analysis"
      className="max-w-5xl mx-auto my-10 px-4 sm:px-6 relative z-20"
    >
      {/* Outer glow ring */}
      <div className="absolute -inset-px rounded-3xl bg-gradient-to-r from-cyan-500/20 via-blue-600/10 to-indigo-500/20 blur-md pointer-events-none" />

      <div className="relative rounded-3xl border border-cyan-500/25 bg-slate-950/80 backdrop-blur-2xl overflow-hidden shadow-[0_0_60px_rgba(56,189,248,0.12)]">

        {/* Top cyan accent line */}
        <div className="absolute top-0 inset-x-12 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8]" />

        {/* ─────────────────────────────────────────── */}
        {/* HEADER                                       */}
        {/* ─────────────────────────────────────────── */}
        <div className="px-7 pt-8 pb-6 border-b border-slate-800/60">
          <div className="flex flex-wrap items-start justify-between gap-6">
            {/* Left: titles */}
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/25 text-cyan-300 text-[11px] font-bold uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span>Safe &amp; Sanitized Ingestion</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                Analyze Any Legal Contract,{' '}
                <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                  Lease, or Agreement
                </span>
              </h2>
              <p className="text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
                Upload your document, paste clauses, or pick a realistic sample contract.
                All text is sanitized client-side and translated into plain 8th-grade English.
              </p>
            </div>

            {/* Right: trust badges */}
            <div className="flex flex-col gap-2 shrink-0">
              <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
                <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Zero data persistence</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
                <Shield className="w-3 h-3 text-cyan-400 shrink-0" />
                <span>In-memory analysis only</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
                <Zap className="w-3 h-3 text-amber-400 shrink-0" />
                <span>Results in seconds</span>
              </div>
            </div>
          </div>

          {/* Tab switcher */}
          <div
            role="tablist"
            aria-label="Upload Options"
            className="flex items-center gap-1.5 mt-6 p-1.5 rounded-xl bg-slate-900/70 border border-slate-700/50 w-fit"
          >
            {tabs.map(tab => (
              <motion.button
                key={tab.id}
                type="button"
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-4 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap focus:outline-none ${
                  activeTab === tab.id
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(56,189,248,0.5)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <span className={activeTab === tab.id ? 'text-slate-950' : 'text-slate-500'}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Error alert */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              role="alert"
              className="overflow-hidden"
            >
              <div className="mx-6 mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-sm flex items-center gap-3">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <p className="font-medium">{errorMessage}</p>
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="ml-auto text-rose-400 hover:text-rose-200 text-xs font-semibold focus:outline-none"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─────────────────────────────────────────── */}
        {/* TAB PANELS                                  */}
        {/* ─────────────────────────────────────────── */}
        <AnimatePresence mode="wait">

          {/* ── SAMPLE CONTRACTS ── */}
          {activeTab === 'samples' && (
            <motion.div
              key="samples"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              id="panel-samples"
              role="tabpanel"
              aria-labelledby="tab-samples"
              className="px-7 py-6 space-y-5"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Select a pre-loaded contract to inspect real-world clauses &amp; high-risk flags:
              </p>

              <div className="grid gap-4 sm:grid-cols-3">
                {SAMPLE_CONTRACTS.map((sample, idx) => {
                  const meta = badgeMeta(sample.badge);
                  return (
                    <motion.div
                      key={sample.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.07 }}
                      whileHover={{ y: -4, transition: { type: 'spring', stiffness: 350, damping: 25 } }}
                      className={`group relative flex flex-col rounded-2xl border border-slate-700/60 bg-slate-900/70 backdrop-blur-md overflow-hidden transition-all duration-200 cursor-pointer ${meta.cardAccent}`}
                      onClick={() => !isLoading && handleSelectSample(sample)}
                    >
                      {/* Ambient hover glow */}
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                      <div className="p-5 flex-1 relative z-10">
                        {/* Category + badge row */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-400 border border-slate-700/50">
                            {sample.category}
                          </span>
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 border ${meta.pill}`}>
                            <span className="relative flex h-1.5 w-1.5 shrink-0">
                              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-70 ${meta.ping}`} />
                              <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${meta.dot}`} />
                            </span>
                            {sample.badge}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-sm font-extrabold text-white leading-snug mb-2 group-hover:text-cyan-100 transition-colors line-clamp-2">
                          {sample.title}
                        </h3>

                        {/* Description */}
                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                          {sample.description}
                        </p>
                      </div>

                      {/* CTA button */}
                      <div className="px-5 pb-5 relative z-10">
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          disabled={isLoading}
                          onClick={e => { e.stopPropagation(); handleSelectSample(sample); }}
                          aria-label={`Load and analyze ${sample.title}`}
                          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-slate-950 text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-[0_4px_15px_rgba(56,189,248,0.3)] focus:outline-none"
                        >
                          {isLoading ? (
                            <span className="animate-pulse">Analyzing…</span>
                          ) : (
                            <>
                              <span>Load &amp; Analyze</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── PASTE TEXT ── */}
          {activeTab === 'paste' && (
            <motion.div
              key="paste"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              id="panel-paste"
              role="tabpanel"
              aria-labelledby="tab-paste"
              className="px-7 py-6 space-y-4"
            >
              <div>
                <label
                  htmlFor="raw-contract-text"
                  className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2"
                >
                  Paste Full Agreement or Specific Clauses
                </label>
                <textarea
                  id="raw-contract-text"
                  rows={10}
                  value={pastedText}
                  onChange={e => setPastedText(e.target.value)}
                  placeholder="Paste contract, lease, service agreement, or NDA text here (e.g. 'SECTION 4. INDEMNIFICATION: The contractor agrees to indemnify...')"
                  className="w-full p-4 text-sm font-mono rounded-xl border border-slate-700/70 bg-slate-950/70 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all shadow-inner resize-none"
                />
                <div className="flex justify-between items-center text-xs text-slate-500 mt-2 px-1">
                  <span>
                    <span className={pastedText.length >= 30 ? 'text-emerald-400 font-bold' : ''}>
                      {pastedText.length.toLocaleString()}
                    </span>{' '}
                    characters
                    {pastedText.length > 0 && pastedText.length < 30 && (
                      <span className="text-amber-400 ml-1">(need {30 - pastedText.length} more)</span>
                    )}
                  </span>
                  {pastedText.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setPastedText('')}
                      className="text-slate-500 hover:text-slate-300 underline focus:outline-none transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(56,189,248,0.4)' }}
                  whileTap={{ scale: 0.97 }}
                  disabled={isLoading || pastedText.trim().length < 30}
                  onClick={handlePasteSubmit}
                  className="py-3 px-7 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 text-slate-950 text-sm font-extrabold inline-flex items-center gap-2 shadow-md transition-all focus:outline-none"
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                      <span>Processing…</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      <span>Run Risk Analysis</span>
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── FILE UPLOAD ── */}
          {activeTab === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              id="panel-upload"
              role="tabpanel"
              aria-labelledby="tab-upload"
              className="px-7 py-6 space-y-4"
            >
              {/* Drop zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileInputRef.current?.click()}
                className={`relative p-10 sm:p-14 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                  dragOver
                    ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_30px_rgba(56,189,248,0.2)]'
                    : selectedFile
                    ? 'border-emerald-500/50 bg-emerald-500/5'
                    : 'border-slate-700/60 bg-slate-900/40 hover:border-slate-600/70 hover:bg-slate-900/60'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                  aria-label="Upload legal contract PDF or TXT file"
                />

                <div className={`w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
                  dragOver
                    ? 'bg-cyan-500/20 border border-cyan-400/40'
                    : selectedFile
                    ? 'bg-emerald-500/20 border border-emerald-500/40'
                    : 'bg-slate-800/80 border border-slate-700/50'
                }`}>
                  {selectedFile
                    ? <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    : dragOver
                    ? <FileUp className="w-8 h-8 text-cyan-400" />
                    : <UploadCloud className="w-8 h-8 text-slate-400" />
                  }
                </div>

                <h3 className={`text-base font-extrabold mb-1.5 ${selectedFile ? 'text-emerald-300' : 'text-white'}`}>
                  {selectedFile ? selectedFile.name : dragOver ? 'Drop it!' : 'Choose a file or drag & drop'}
                </h3>

                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  {selectedFile ? (
                    <span className="text-slate-300">
                      {(selectedFile.size / 1024).toFixed(1)} KB · Click to change file
                    </span>
                  ) : (
                    <>
                      Supported: <strong className="text-slate-300">PDF (.pdf)</strong> and{' '}
                      <strong className="text-slate-300">Text (.txt)</strong> · Parsed in-memory, zero persistence
                    </>
                  )}
                </p>

                {selectedFile && (
                  <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold shadow-[0_0_10px_rgba(52,211,153,0.2)]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Ready to analyse</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-1">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(56,189,248,0.4)' }}
                  whileTap={{ scale: 0.97 }}
                  disabled={isLoading || !selectedFile}
                  onClick={handleFileSubmit}
                  className="py-3 px-7 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 text-slate-950 text-sm font-extrabold inline-flex items-center gap-2 shadow-md transition-all focus:outline-none"
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                      <span>Parsing &amp; Analysing…</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      <span>Upload &amp; Process</span>
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

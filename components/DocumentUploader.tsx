import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, ArrowRight, Sparkles, BookOpen, Shield } from 'lucide-react';
import { SAMPLE_CONTRACTS, SampleContract } from '../lib/sample-contracts.js';

interface DocumentUploaderProps {
  onAnalyzeText: (text: string, fileName?: string) => Promise<void>;
  onAnalyzeFile: (file: File) => Promise<void>;
  isLoading: boolean;
  highContrast: boolean;
}

export function DocumentUploader({
  onAnalyzeText,
  onAnalyzeFile,
  isLoading,
  highContrast,
}: DocumentUploaderProps) {
  const [activeTab, setActiveTab] = useState<'paste' | 'upload' | 'samples'>('samples');
  const [pastedText, setPastedText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setErrorMessage(null);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setErrorMessage(null);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
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
      setErrorMessage('The selected file is empty (0 bytes). Please choose a valid document.');
      return;
    }
    if (!selectedFile.name.toLowerCase().endsWith('.pdf') && selectedFile.type !== 'application/pdf') {
      try {
        const fileText = await selectedFile.text();
        if (fileText.trim().length < 30) {
          setErrorMessage('The selected text file contains less than 30 characters. Please choose a file with sufficient legal text.');
          return;
        }
      } catch {
        // Fall through to standard file analysis
      }
    }
    setErrorMessage(null);
    await onAnalyzeFile(selectedFile);
  };

  const handleSelectSample = async (sample: SampleContract) => {
    setPastedText(sample.text);
    setErrorMessage(null);
    await onAnalyzeText(sample.text, sample.title);
  };

  return (
    <section
      id="document-uploader-section"
      aria-label="Document Ingestion and Analysis"
      className="max-w-4xl mx-auto my-8 px-4 sm:px-6"
    >
      <div
        className={`rounded-2xl border transition-all backdrop-blur-md shadow-md overflow-hidden ${
          highContrast
            ? 'bg-neutral-900/90 border-neutral-700/80 text-white'
            : 'bg-white/85 border-neutral-200/80 text-neutral-900'
        }`}
      >
        {/* Header Title & Subtitle */}
        <div className="p-6 sm:p-8 border-b border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/60 dark:bg-neutral-950/40">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 shadow-2xs">
                  <Shield className="w-4 h-4" aria-hidden="true" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                  Safe & Sanitized Ingestion
                </span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                Analyze Any Legal Contract, Lease, or Agreement
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-2xl leading-relaxed">
                Upload your document, paste clauses, or pick a realistic sample contract below.
                All text is sanitized client-side, evaluated against critical legal traps, and translated into plain 8th-grade English.
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div
            role="tablist"
            aria-label="Upload Options"
            className="flex items-center gap-1.5 mt-6 p-1.5 rounded-xl bg-neutral-200/60 dark:bg-neutral-800/60 max-w-md backdrop-blur-xs"
          >
            <motion.button
              type="button"
              role="tab"
              id="tab-samples"
              aria-selected={activeTab === 'samples'}
              aria-controls="panel-samples"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('samples')}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
                activeTab === 'samples'
                  ? 'bg-white dark:bg-neutral-900 text-blue-700 dark:text-blue-300 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              <span>Sample Contracts</span>
            </motion.button>

            <motion.button
              type="button"
              role="tab"
              id="tab-paste"
              aria-selected={activeTab === 'paste'}
              aria-controls="panel-paste"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('paste')}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
                activeTab === 'paste'
                  ? 'bg-white dark:bg-neutral-900 text-blue-700 dark:text-blue-300 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              <span>Paste Text</span>
            </motion.button>

            <motion.button
              type="button"
              role="tab"
              id="tab-upload"
              aria-selected={activeTab === 'upload'}
              aria-controls="panel-upload"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'bg-white dark:bg-neutral-900 text-blue-700 dark:text-blue-300 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              <span>Upload PDF</span>
            </motion.button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            role="alert"
            className="m-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-200 text-sm flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" aria-hidden="true" />
            <p className="font-medium">{errorMessage}</p>
          </motion.div>
        )}

        {/* TAB 1: Sample Contracts */}
        {activeTab === 'samples' && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            id="panel-samples"
            role="tabpanel"
            aria-labelledby="tab-samples"
            className="p-6 sm:p-8 space-y-4"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Select a pre-loaded contract to inspect real-world clauses & high-risk flags:
            </p>

            <div className="grid gap-4 sm:grid-cols-3">
              {SAMPLE_CONTRACTS.map(sample => {
                const isHigh = sample.badge.includes('High');
                const isIP = sample.badge.includes('IP');

                return (
                  <motion.div
                    key={sample.id}
                    whileHover={{ y: -3, scale: 1.01 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    className={`p-4.5 rounded-xl border transition-all flex flex-col justify-between text-left hover:border-blue-400 dark:hover:border-blue-500 shadow-2xs hover:shadow-md ${
                      highContrast
                        ? 'bg-neutral-800/80 border-neutral-700'
                        : 'bg-neutral-50/80 dark:bg-neutral-950/40 border-neutral-200/80 dark:border-neutral-800 hover:bg-blue-50/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-200/80 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                          {sample.category}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1.5 ${
                            isHigh
                              ? 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300 border border-red-200/70'
                              : isIP
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200/70'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/70'
                          }`}
                        >
                          <span className="relative flex h-1.5 w-1.5">
                            <span
                              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                                isHigh ? 'bg-red-400' : isIP ? 'bg-amber-400' : 'bg-emerald-400'
                              }`}
                            />
                            <span
                              className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                                isHigh ? 'bg-red-500' : isIP ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                            />
                          </span>
                          <span>{sample.badge}</span>
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-white line-clamp-2">
                        {sample.title}
                      </h3>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1.5 line-clamp-3 leading-relaxed">
                        {sample.description}
                      </p>
                    </div>

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isLoading}
                      onClick={() => handleSelectSample(sample)}
                      aria-label={`Load and analyze ${sample.title}`}
                      className="mt-4 w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                    >
                      {isLoading ? (
                        <span className="animate-pulse">Analyzing...</span>
                      ) : (
                        <>
                          <span>Load & Analyze</span>
                          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* TAB 2: Paste Raw Text */}
        {activeTab === 'paste' && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            id="panel-paste"
            role="tabpanel"
            aria-labelledby="tab-paste"
            className="p-6 sm:p-8 space-y-4"
          >
            <div className="relative">
              <label htmlFor="raw-contract-text" className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-2">
                Paste Full Agreement or Specific Clauses
              </label>
              <textarea
                id="raw-contract-text"
                rows={9}
                value={pastedText}
                onChange={e => setPastedText(e.target.value)}
                placeholder="Paste contract, lease, service agreement, or NDA text here (e.g. 'SECTION 4. INDEMNIFICATION: The contractor agrees to indemnify...')"
                className={`w-full p-4 text-xs sm:text-sm font-mono rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors shadow-inner ${
                  highContrast
                    ? 'bg-neutral-950 border-neutral-700 text-white placeholder-neutral-500'
                    : 'bg-neutral-50/80 dark:bg-neutral-950/60 border-neutral-200/80 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400'
                }`}
              />
              <div className="flex justify-between items-center text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 px-1">
                <span>{pastedText.length.toLocaleString()} characters entered</span>
                {pastedText.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setPastedText('')}
                    className="text-neutral-500 hover:text-neutral-800 dark:hover:text-white underline focus:outline-none"
                  >
                    Clear Text
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <motion.button
                type="button"
                id="analyze-pasted-text-btn"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                disabled={isLoading || pastedText.trim().length < 30}
                onClick={handlePasteSubmit}
                aria-label="Analyze pasted legal text"
                className="py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold inline-flex items-center gap-2 shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                    <span>Processing Document...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" aria-hidden="true" />
                    <span>Run Risk Analysis</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* TAB 3: File Upload */}
        {activeTab === 'upload' && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            id="panel-upload"
            role="tabpanel"
            aria-labelledby="tab-upload"
            className="p-6 sm:p-8 space-y-4"
          >
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 sm:p-12 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                dragOver
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30'
                  : highContrast
                  ? 'border-neutral-700 bg-neutral-950/50 hover:bg-neutral-800/40'
                  : 'border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-950/30 hover:bg-blue-50/20'
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

              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center shadow-xs">
                <UploadCloud className="w-7 h-7" aria-hidden="true" />
              </div>

              <h3 className="text-base font-bold tracking-tight text-neutral-900 dark:text-white">
                {selectedFile ? selectedFile.name : 'Choose a file or drag & drop'}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto leading-relaxed">
                Supported formats: <strong className="font-semibold text-neutral-700 dark:text-neutral-300">PDF (.pdf)</strong> and <strong className="font-semibold text-neutral-700 dark:text-neutral-300">Text (.txt)</strong>.
                Files are parsed and sanitized in-memory with zero third-party persistence.
              </p>

              {selectedFile && (
                <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                  <span>Ready: {(selectedFile.size / 1024).toFixed(1)} KB</span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <motion.button
                type="button"
                id="analyze-uploaded-file-btn"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                disabled={isLoading || !selectedFile}
                onClick={handleFileSubmit}
                aria-label="Upload and analyze legal document"
                className="py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold inline-flex items-center gap-2 shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                    <span>Parsing & Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" aria-hidden="true" />
                    <span>Upload & Process</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}


import { motion } from 'motion/react';
import { Sparkles, Star, Send, Plus } from 'lucide-react';
import { HeroRobotScene } from './HeroRobotScene.js';
import { AppNavbar } from './AppNavbar.js';

interface LandingHeroProps {
  onSelectAction: (action: 'samples' | 'paste' | 'upload') => void;
  highContrast?: boolean;
}

export function LandingHero({ onSelectAction }: LandingHeroProps) {
  return (
    <div className="relative w-full z-10 text-white overflow-hidden">
      {/* Reuse shared AppNavbar */}
      <AppNavbar mode="landing" onSelectAction={onSelectAction} />

      {/* ---------------------------------------------------- */}
      {/* HERO SECTION MAIN CONTENT */}
      {/* ---------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-12 sm:pt-10 sm:pb-16 grid lg:grid-cols-12 gap-8 items-center z-10 relative">
        {/* Left Column: Headlines & Action Pills */}
        <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-bold backdrop-blur-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Next-Gen Legal Risk Intelligence</span>
          </motion.div>

          <motion.h1
            id="hero-main-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white"
          >
            AI-Powered Legal <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-cyan-300 via-blue-200 to-indigo-300 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(56,189,248,0.4)]">
              Contract Review
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed"
          >
            Analyze, Simplify, and Identify Risks in Your Agreements with immediate plain-language
            breakdowns.
          </motion.p>

          {/* Glowing CTA Buttons / Action Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3.5"
          >
            {/* Pill 1: Sample Contracts */}
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: '0 0 25px rgba(56, 189, 248, 0.5)' }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onSelectAction('samples')}
              className="py-3 px-5 rounded-2xl bg-white/10 hover:bg-white/20 border border-cyan-300/40 text-white font-bold text-xs sm:text-sm flex items-center gap-2 backdrop-blur-md shadow-md transition-all group"
            >
              <Star className="w-4 h-4 text-yellow-400 group-hover:rotate-12 transition-transform" />
              <span>Sample Contracts</span>
            </motion.button>

            {/* Pill 2: Paste Clauses */}
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: '0 0 25px rgba(99, 102, 241, 0.5)' }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onSelectAction('paste')}
              className="py-3 px-5 rounded-2xl bg-white/10 hover:bg-white/20 border border-indigo-400/40 text-white font-bold text-xs sm:text-sm flex items-center gap-2 backdrop-blur-md shadow-md transition-all group"
            >
              <Send className="w-4 h-4 text-cyan-300 group-hover:translate-x-0.5 transition-transform" />
              <span>Paste Clauses</span>
            </motion.button>

            {/* Pill 3: Upload Document */}
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: '0 0 25px rgba(59, 130, 246, 0.6)' }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onSelectAction('upload')}
              className="py-3 px-5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Upload Document</span>
            </motion.button>
          </motion.div>
        </div>

        {/* Right Column: 3D Animated Robot Scene Environment */}
        <div className="lg:col-span-6 flex justify-center">
          <HeroRobotScene onSelectUploadTab={onSelectAction} />
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* HERO TAGLINE BAR */}
      {/* ---------------------------------------------------- */}
      <div className="w-full border-y border-cyan-500/20 bg-blue-950/40 backdrop-blur-md py-4 text-center z-10 relative">
        <p className="text-sm sm:text-base font-bold text-cyan-200 tracking-wide">
          Instant Analysis &middot; Clear Explanations &middot; Plain Language Results
        </p>
      </div>
    </div>
  );
}

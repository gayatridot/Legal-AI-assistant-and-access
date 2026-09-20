import { motion } from 'motion/react';
import { Home, AlertTriangle, ShieldCheck, Scale, ArrowRight, Sparkles } from 'lucide-react';
import { SAMPLE_CONTRACTS, SampleContract } from '../lib/sample-contracts.js';

interface SampleCardsSectionProps {
  onSelectSample: (sample: SampleContract) => void;
  isLoading?: boolean;
}

export function SampleCardsSection({ onSelectSample, isLoading }: SampleCardsSectionProps) {
  // Feature card metadata mapping for 3D visuals & badges matching the reference layout
  const cardVariants = [
    {
      id: 'residential-lease-agreement',
      title: 'Real Estate & Risk',
      badge: 'High Risk',
      badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.3)]',
      gradient: 'from-pink-500/20 via-rose-500/10 to-red-500/20 border-rose-500/30',
      iconBg: 'from-red-500 to-rose-600',
      Icon: Home,
      graphic3D: (
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-rose-500 to-red-600 opacity-30 blur-md" />
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-red-600 p-3 text-white shadow-lg flex items-center justify-center">
            <Home className="w-8 h-8" />
          </div>
          <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-red-600 text-[9px] font-extrabold text-white shadow-md">
            High Risk
          </div>
        </div>
      ),
    },
    {
      id: 'freelance-services-agreement',
      title: 'Freelance & Gig Work',
      badge: 'Medium Risk',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.3)]',
      gradient: 'from-amber-500/20 via-yellow-500/10 to-orange-500/20 border-amber-500/30',
      iconBg: 'from-amber-500 to-orange-600',
      Icon: AlertTriangle,
      graphic3D: (
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 opacity-30 blur-md" />
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 p-3 text-white shadow-lg flex items-center justify-center">
            <AlertTriangle className="w-8 h-8" />
          </div>
        </div>
      ),
    },
    {
      id: 'software-ip-assignment',
      title: 'IP & Liability',
      badge: 'IP Focus',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-[0_0_12px_rgba(59,130,246,0.3)]',
      gradient: 'from-blue-500/20 via-cyan-500/10 to-indigo-500/20 border-cyan-500/30',
      iconBg: 'from-cyan-500 to-blue-600',
      Icon: ShieldCheck,
      graphic3D: (
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 opacity-30 blur-md" />
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-3 text-white shadow-lg flex items-center justify-center">
            <ShieldCheck className="w-8 h-8" />
          </div>
        </div>
      ),
    },
    {
      id: 'mutual-nda-agreement',
      title: 'Corporate & M&A',
      badge: 'Balanced Terms',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]',
      gradient: 'from-emerald-500/20 via-teal-500/10 to-green-500/20 border-emerald-500/30',
      iconBg: 'from-emerald-500 to-teal-600',
      Icon: Scale,
      graphic3D: (
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 opacity-30 blur-md" />
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 p-3 text-white shadow-lg flex items-center justify-center">
            <Scale className="w-8 h-8" />
          </div>
          <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-emerald-600 text-[9px] font-extrabold text-white shadow-md">
            Balanced
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="sample-contracts-section" className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
      {/* ---------------------------------------------------- */}
      {/* SECTION TITLE WITH SLEEK DIAMOND ORNAMENTS */}
      {/* ---------------------------------------------------- */}
      <div className="flex items-center justify-center gap-4 mb-10 sm:mb-14">
        {/* Left Decorative Line */}
        <div className="flex-1 max-w-xs h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-cyan-400 flex items-center justify-end">
          <span className="w-2 h-2 rotate-45 bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-center text-white flex items-center gap-2">
          <span>Explore Sample Contracts & Risks</span>
        </h2>

        {/* Right Decorative Line */}
        <div className="flex-1 max-w-xs h-px bg-gradient-to-l from-transparent via-cyan-400/40 to-cyan-400 flex items-center justify-start">
          <span className="w-2 h-2 rotate-45 bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 4 FEATURE CARDS GRID WITH STAGGERED SCROLL REVEALS */}
      {/* ---------------------------------------------------- */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardVariants.map((card, idx) => {
          // Find matching contract in SAMPLE_CONTRACTS
          const sample = SAMPLE_CONTRACTS.find(s => s.id === card.id) || SAMPLE_CONTRACTS[0];

          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: idx * 0.12 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="relative group rounded-3xl bg-slate-900/80 border border-slate-800 p-6 flex flex-col justify-between backdrop-blur-xl shadow-xl hover:border-cyan-400/60 hover:shadow-[0_15px_40px_rgba(56,189,248,0.25)] transition-all overflow-hidden cursor-pointer"
              onClick={() => onSelectSample(sample)}
            >
              {/* Subtle Ambient Hover Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              <div>
                {/* Card Header & 3D Graphic */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-200 transition-colors">
                    {card.title}
                  </h3>
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${card.badgeColor}`}
                  >
                    {card.badge}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-6 line-clamp-3">
                  {sample.description}
                </p>

                {/* 3D Visual Graphic Center */}
                <div className="py-3 flex items-center justify-center">
                  {card.graphic3D}
                </div>
              </div>

              {/* Action Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectSample(sample);
                }}
                className="mt-6 w-full py-2.5 px-4 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 text-xs font-bold flex items-center justify-center gap-2 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all shadow-md"
              >
                {isLoading ? (
                  <span>Analyzing...</span>
                ) : (
                  <>
                    <span>Inspect Sample</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

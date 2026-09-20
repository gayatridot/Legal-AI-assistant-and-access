import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'motion/react';
import { Sparkles, MessageSquare, X, Minimize2, Scale, Bot, Send } from 'lucide-react';
import { RagChatBot } from './RagChatBot.js';

interface FloatingRagRobotProps {
  documentId: string;
  documentText: string;
  highContrast?: boolean;
}

export function FloatingRagRobot({ documentId, documentText, highContrast }: FloatingRagRobotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Mouse tracking springs for subtle 3D tilt on hover
  const springConfig = { stiffness: 200, damping: 15 };
  const mouseX = useSpring(0, springConfig);
  const mouseY = useSpring(0, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const normX = (e.clientX / innerWidth) * 2 - 1;
      const normY = (e.clientY / innerHeight) * 2 - 1;
      setMousePos({ x: normX, y: normY });
      mouseX.set(normX);
      mouseY.set(normY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const robotRotateY = useTransform(mouseX, [-1, 1], [-12, 12]);
  const robotRotateX = useTransform(mouseY, [-1, 1], [10, -10]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none select-none">
      {/* ---------------------------------------------------- */}
      {/* EXPANDABLE SLEEK GLASSMORPHIC RAG CHAT WINDOW */}
      {/* ---------------------------------------------------- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="pointer-events-auto w-[92vw] sm:w-[420px] h-[540px] max-h-[82vh] mb-4 rounded-3xl bg-slate-950/90 border border-cyan-400/50 backdrop-blur-2xl shadow-[0_0_50px_rgba(56,189,248,0.35)] flex flex-col overflow-hidden text-white"
          >
            {/* Holographic Glowing Header Bar */}
            <div className="p-4 bg-gradient-to-r from-blue-900/80 via-slate-900 to-indigo-950/80 border-b border-cyan-500/30 flex items-center justify-between gap-3 relative">
              {/* Cyan Top Sheen */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_#38bdf8]" />

              <div className="flex items-center gap-3">
                {/* Micro 3D Robot Avatar in Header */}
                <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-600 p-0.5 shadow-[0_0_15px_rgba(56,189,248,0.5)]">
                  <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-cyan-300">
                    <Bot className="w-5 h-5" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950 shadow-[0_0_8px_#34d399]" />
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-white tracking-wide">LexiBot AI</h3>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-extrabold border border-amber-400/30 uppercase">
                      Vector RAG
                    </span>
                  </div>
                  <p className="text-[10px] text-cyan-300/80 font-mono">Grounded Document Q&A</p>
                </div>
              </div>

              {/* Window Controls */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
                  aria-label="Minimize Chat"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors focus:outline-none"
                  aria-label="Close Chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Embedded RAG Q&A Component */}
            <div className="flex-1 overflow-hidden p-2">
              <RagChatBot
                documentId={documentId}
                documentText={documentText}
                highContrast={Boolean(highContrast)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------------------------------------------------- */}
      {/* 3D DANCING ROBOT MASCOT FLOATING ACTION BUTTON */}
      {/* ---------------------------------------------------- */}
      {!isOpen && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          style={{
            rotateY: robotRotateY,
            rotateX: robotRotateX,
            transformStyle: 'preserve-3d',
          }}
          className="pointer-events-auto relative group cursor-pointer"
          onClick={() => setIsOpen(true)}
        >
          {/* Pulsing Glowing Ring Aura */}
          <motion.div
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -inset-2 rounded-full bg-gradient-to-tr from-cyan-400 via-blue-500 to-amber-400 blur-md pointer-events-none"
          />

          {/* Hover Tooltip Pill */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            whileHover={{ opacity: 1, x: 0 }}
            className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-cyan-400/40 text-cyan-200 text-xs font-bold whitespace-nowrap shadow-[0_0_15px_rgba(56,189,248,0.4)] pointer-events-none flex items-center gap-1.5 backdrop-blur-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
            <span>Ask LexiBot AI</span>
          </motion.div>

          {/* Small 3D Dancing Robot Figure */}
          <motion.div
            animate={{
              y: [0, -7, 0],
              rotate: [-3, 3, -3],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-3xl bg-gradient-to-b from-slate-100 via-white to-slate-200 border-2 border-cyan-300 p-2 shadow-[0_10px_30px_rgba(56,189,248,0.5)] flex flex-col items-center justify-center overflow-hidden"
          >
            {/* Cyan Ear Antennas */}
            <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-5 rounded-l bg-blue-600" />
            <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1.5 h-5 rounded-r bg-blue-600" />

            {/* Glowing Face Visor */}
            <div className="w-full h-10 rounded-xl bg-slate-950 border border-cyan-400/50 flex items-center justify-center gap-2 relative overflow-hidden">
              {/* Cyan Glowing Eyes */}
              <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_#38bdf8] flex items-center justify-center border border-white">
                <div className="w-1 h-1 rounded-full bg-slate-950" />
              </div>
              <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_#38bdf8] flex items-center justify-center border border-white">
                <div className="w-1 h-1 rounded-full bg-slate-950" />
              </div>
            </div>

            {/* Small Scale Emblem */}
            <div className="mt-1 flex items-center gap-1 text-[9px] font-black text-blue-900 uppercase tracking-tighter">
              <Scale className="w-2.5 h-2.5 text-blue-600" />
              <span>RAG</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

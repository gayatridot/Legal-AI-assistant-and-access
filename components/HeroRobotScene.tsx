import { useState, useEffect } from 'react';
import { motion, useSpring, useTransform } from 'motion/react';
import { Shield, Scale, Gavel, AlertTriangle, Lock, FileText, Sparkles, Search } from 'lucide-react';

interface HeroRobotSceneProps {
  onSelectUploadTab?: (tab: 'samples' | 'paste' | 'upload') => void;
}

export function HeroRobotScene({ onSelectUploadTab }: HeroRobotSceneProps) {
  // Mouse position state normalized between -1 and 1
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Smooth springs for 3D Parallax motion
  const springConfig = { stiffness: 150, damping: 20, mass: 0.5 };
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

  // Transform spring values to 3D rotation and translation
  const robotRotateY = useTransform(mouseX, [-1, 1], [-18, 18]);
  const robotRotateX = useTransform(mouseY, [-1, 1], [14, -14]);
  const robotTranslateX = useTransform(mouseX, [-1, 1], [-20, 20]);
  const robotTranslateY = useTransform(mouseY, [-1, 1], [-15, 15]);

  const contractRotateY = useTransform(mouseX, [-1, 1], [10, -10]);
  const contractRotateX = useTransform(mouseY, [-1, 1], [-8, 8]);
  const contractTranslateX = useTransform(mouseX, [-1, 1], [15, -15]);

  const beamAngle = useTransform(mouseX, [-1, 1], [-15, 25]);

  return (
    <div className="relative w-full max-w-xl mx-auto h-[380px] sm:h-[460px] flex items-center justify-center perspective-1000 select-none">
      {/* Background Holographic Radial Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.12, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-cyan-500/30 via-blue-600/20 to-indigo-500/10 blur-2xl"
        />
      </div>

      {/* Synchronized Orbit Ring for Legal Icons */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <svg className="w-[340px] h-[340px] sm:w-[420px] sm:h-[420px] opacity-25 animate-spin-slow" viewBox="0 0 400 400">
          <circle
            cx="200"
            cy="200"
            r="180"
            fill="none"
            stroke="url(#orbit-cyan-grad)"
            strokeWidth="1.5"
            strokeDasharray="8 8"
          />
          <defs>
            <linearGradient id="orbit-cyan-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="50%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#818CF8" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* ---------------------------------------------------- */}
      {/* HOLOGRAPHIC CONTRACT DOCUMENT CARD (Floating Left/Back) */}
      {/* ---------------------------------------------------- */}
      <motion.div
        style={{
          rotateY: contractRotateY,
          rotateX: contractRotateX,
          x: contractTranslateX,
          transformStyle: 'preserve-3d',
        }}
        className="absolute left-2 sm:left-4 top-10 sm:top-14 w-60 sm:w-72 p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-blue-900/60 via-indigo-950/70 to-slate-900/80 border border-cyan-400/40 backdrop-blur-xl shadow-[0_0_40px_rgba(56,189,248,0.25)] z-10"
      >
        {/* Holographic Glowing Top Border */}
        <div className="absolute -top-px inset-x-4 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_#38bdf8]" />

        {/* Animated Scanning Laser Line */}
        <motion.div
          animate={{
            top: ['0%', '100%', '0%'],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-300 to-transparent pointer-events-none shadow-[0_0_15px_#38bdf8]"
        />

        {/* Contract Header */}
        <div className="flex items-center justify-between gap-3 mb-3 border-b border-cyan-500/20 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(56,189,248,0.3)]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-cyan-200 tracking-wide uppercase">Standard Agreement</div>
              <div className="text-[9px] text-cyan-400/80 font-mono">v3.4 &middot; Verified</div>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        </div>

        {/* Holographic Clause Skeleton Lines */}
        <div className="space-y-2 py-1">
          <div className="h-2 w-3/4 rounded bg-cyan-400/30 animate-pulse" />
          <div className="h-2 w-full rounded bg-cyan-400/20" />
          <div className="h-2 w-5/6 rounded bg-cyan-400/20" />
          <div className="h-2 w-2/3 rounded bg-cyan-400/30" />
          <div className="h-2 w-4/5 rounded bg-cyan-400/20" />
        </div>

        {/* Contract Clause Highlight Pill */}
        <div className="mt-3.5 p-2 rounded-xl bg-blue-900/40 border border-amber-400/30 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Indemnity Liability Clause</span>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-400/30">
            FLAGGED
          </span>
        </div>
      </motion.div>

      {/* ---------------------------------------------------- */}
      {/* 3D ROBOT WITH MAGNIFYING GLASS (Central Interactive) */}
      {/* ---------------------------------------------------- */}
      <motion.div
        style={{
          rotateY: robotRotateY,
          rotateX: robotRotateX,
          x: robotTranslateX,
          y: robotTranslateY,
          transformStyle: 'preserve-3d',
        }}
        className="relative z-20 flex flex-col items-center cursor-grab active:cursor-grabbing"
      >
        {/* Robot Figure Vector Visual */}
        <div className="relative w-52 h-64 sm:w-64 sm:h-76 flex flex-col items-center justify-center">
          {/* Magnifying Glass Scanning Cone Beam */}
          <motion.div
            style={{ rotate: beamAngle }}
            className="absolute top-20 right-6 sm:top-24 sm:right-8 w-44 sm:w-52 h-36 origin-top-left pointer-events-none z-30"
          >
            <div className="w-full h-full bg-gradient-to-br from-cyan-400/40 via-blue-500/10 to-transparent clip-triangle blur-xs opacity-80 animate-pulse" />
          </motion.div>

          {/* Robot Head */}
          <div className="relative w-32 h-26 sm:w-36 sm:h-30 rounded-3xl bg-gradient-to-b from-slate-100 via-white to-slate-200 border-2 border-cyan-200/80 shadow-[0_10px_35px_rgba(56,189,248,0.35)] flex items-center justify-center p-2 z-20">
            {/* Robot Ear Antennas */}
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-3 h-8 rounded-l-md bg-blue-600 border border-cyan-300 shadow-[0_0_10px_#38bdf8]" />
            <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-3 h-8 rounded-r-md bg-blue-600 border border-cyan-300 shadow-[0_0_10px_#38bdf8]" />

            {/* Top Antenna Beacon */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
              <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_12px_#38bdf8] animate-ping" />
              <span className="w-1 h-2 bg-slate-300" />
            </div>

            {/* Dark Glossy Face Visor */}
            <div className="w-full h-full rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950 border border-cyan-500/40 flex items-center justify-center px-4 gap-3 relative overflow-hidden">
              {/* Eye Reflection Sheen */}
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-white/10 rounded-full blur-xs" />

              {/* Glowing Cyan Eyes (Track Mouse) */}
              <motion.div
                animate={{
                  x: mousePos.x * 6,
                  y: mousePos.y * 4,
                }}
                className="flex items-center gap-3"
              >
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-cyan-400 shadow-[0_0_16px_#38bdf8] flex items-center justify-center border-2 border-white">
                  <div className="w-2 h-2 rounded-full bg-slate-950" />
                </div>
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-cyan-400 shadow-[0_0_16px_#38bdf8] flex items-center justify-center border-2 border-white">
                  <div className="w-2 h-2 rounded-full bg-slate-950" />
                </div>
              </motion.div>
            </div>
          </div>

          {/* Robot Neck */}
          <div className="w-10 h-3 bg-slate-300 border-x border-slate-400 rounded-xs z-10" />

          {/* Robot Torso / Body */}
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-3xl bg-gradient-to-b from-slate-100 via-white to-slate-200 border-2 border-cyan-200/80 shadow-[0_15px_40px_rgba(37,99,235,0.25)] flex flex-col items-center justify-center z-10">
            {/* Chest Emblem */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-[0_0_15px_rgba(56,189,248,0.5)] mb-1">
              <Scale className="w-5 h-5" />
            </div>
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-blue-900">LexiBot 3D</div>

            {/* Right Arm holding Sleek Magnifying Glass */}
            <motion.div
              animate={{ rotate: [0, 4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -right-12 top-2 flex items-center origin-left z-30"
            >
              <div className="w-8 h-4 rounded-full bg-slate-300 border border-slate-400" />
              {/* Magnifying Glass */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-cyan-300 bg-gradient-to-br from-cyan-400/20 to-blue-600/30 backdrop-blur-md shadow-[0_0_25px_rgba(56,189,248,0.6)] flex items-center justify-center">
                <Search className="w-8 h-8 text-cyan-200 opacity-80" />
                <div className="absolute inset-2 rounded-full border border-white/50 bg-gradient-to-tr from-white/30 to-transparent" />
                {/* Handle */}
                <div className="absolute -bottom-6 -left-3 w-3 h-10 bg-slate-700 border border-cyan-400/60 rounded-full rotate-45 shadow-md" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Shadow Ground Blob */}
        <div className="w-40 h-4 rounded-full bg-blue-950/60 blur-md mt-1" />
      </motion.div>

      {/* ---------------------------------------------------- */}
      {/* ANIMATED ORBITING / FLOATING 3D LEGAL ICONS */}
      {/* ---------------------------------------------------- */}

      {/* ICON 1: Gavel (Upper Left) */}
      <motion.div
        animate={{
          y: [-8, 8, -8],
          rotate: [-6, 6, -6],
        }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-2 left-4 sm:left-10 z-20"
      >
        <div className="p-3 rounded-2xl bg-gradient-to-tr from-indigo-900/90 to-blue-800/90 border border-indigo-400/50 backdrop-blur-md shadow-[0_0_20px_rgba(99,102,241,0.4)] text-indigo-200 flex items-center justify-center">
          <Gavel className="w-6 h-6 sm:w-7 sm:h-7" />
        </div>
      </motion.div>

      {/* ICON 2: Shield (Lower Right) */}
      <motion.div
        animate={{
          y: [10, -10, 10],
          rotate: [4, -4, 4],
        }}
        transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-4 right-2 sm:right-8 z-20"
      >
        <div className="p-3 rounded-2xl bg-gradient-to-tr from-cyan-900/90 to-blue-800/90 border border-cyan-300/50 backdrop-blur-md shadow-[0_0_25px_rgba(56,189,248,0.4)] text-cyan-200 flex items-center justify-center">
          <Shield className="w-6 h-6 sm:w-7 sm:h-7" />
        </div>
      </motion.div>

      {/* ICON 3: Scales of Justice (Upper Right) */}
      <motion.div
        animate={{
          y: [-12, 6, -12],
          rotate: [8, -4, 8],
        }}
        transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-2 right-4 sm:right-12 z-20"
      >
        <div className="p-3 rounded-2xl bg-gradient-to-tr from-blue-900/90 to-indigo-800/90 border border-blue-300/50 backdrop-blur-md shadow-[0_0_22px_rgba(59,130,246,0.4)] text-blue-200 flex items-center justify-center">
          <Scale className="w-6 h-6 sm:w-7 sm:h-7" />
        </div>
      </motion.div>

      {/* ICON 4: Lock (Lower Left) */}
      <motion.div
        animate={{
          y: [6, -8, 6],
          rotate: [-5, 5, -5],
        }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-6 left-2 sm:left-12 z-20"
      >
        <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-900/90 to-indigo-900/90 border border-purple-400/40 backdrop-blur-md shadow-[0_0_18px_rgba(168,85,247,0.35)] text-purple-200 flex items-center justify-center">
          <Lock className="w-5 h-5" />
        </div>
      </motion.div>

      {/* ICON 5: Sparkles Badge (Top Center Accent) */}
      <motion.div
        animate={{
          scale: [0.95, 1.08, 0.95],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-0 left-1/2 -translate-x-1/2 z-20"
      >
        <div className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-200 text-xs font-bold inline-flex items-center gap-1.5 shadow-[0_0_15px_#38bdf8] backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-spin-slow" />
          <span>Legal AI Core v4.0</span>
        </div>
      </motion.div>
    </div>
  );
}

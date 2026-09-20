import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';

interface AnimatedWaveBackgroundProps {
  highContrast?: boolean;
}

export function AnimatedWaveBackground({ highContrast }: AnimatedWaveBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle system for particle trails
    const particleCount = Math.min(Math.floor(width / 18), 70);
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      maxAlpha: number;
      pulseSpeed: number;
      color: string;
    }> = [];

    const colors = [
      'rgba(56, 189, 248, ', // Cyan light
      'rgba(99, 102, 241, ', // Indigo light
      'rgba(147, 197, 253, ', // Sky blue
      'rgba(244, 114, 182, ', // Subtle rose accent
    ];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4 - 0.15, // Slight upward drift
        size: Math.random() * 2.5 + 1,
        alpha: Math.random() * 0.5 + 0.2,
        maxAlpha: Math.random() * 0.6 + 0.3,
        pulseSpeed: Math.random() * 0.02 + 0.005,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let time = 0;

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Draw particle trails and ambient glowing nodes
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx + Math.sin(time + i) * 0.2;
        p.y += p.vy;

        // Wrap around screen boundaries
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        // Pulsing alpha
        p.alpha += Math.sin(time * 2 + i) * p.pulseSpeed;
        const currentAlpha = Math.max(0.1, Math.min(p.maxAlpha, p.alpha));

        // Draw particle glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${currentAlpha * 0.25})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${currentAlpha})`;
        ctx.fill();

        // Connect nearby particles with subtle light trails
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(147, 197, 253, ${(1 - dist / 110) * 0.15})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  if (highContrast) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Dynamic Deep Space Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#040817] via-[#071330] to-[#0A1B44]" />

      {/* Radial Blue Light Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.35, 0.55, 0.35],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-[15%] left-[20%] w-[600px] h-[600px] rounded-full bg-gradient-to-r from-blue-600/30 via-indigo-600/10 to-transparent blur-3xl"
      />

      <motion.div
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-[35%] -right-[10%] w-[700px] h-[700px] rounded-full bg-gradient-to-l from-cyan-500/25 via-blue-700/10 to-transparent blur-3xl"
      />

      {/* Interactive Flowing Particles Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Layer 1 - Deep Wave SVG Motion */}
      <svg
        className="absolute bottom-0 left-0 w-full h-64 sm:h-96 opacity-40 mix-blend-screen transform scale-y-125 origin-bottom"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <motion.path
          animate={{
            d: [
              'M0,160 C320,300 420,0 720,160 C1020,320 1120,40 1440,160 L1440,320 L0,320 Z',
              'M0,190 C320,80 520,280 820,130 C1120,-20 1220,240 1440,180 L1440,320 L0,320 Z',
              'M0,160 C320,300 420,0 720,160 C1020,320 1120,40 1440,160 L1440,320 L0,320 Z',
            ],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          fill="url(#wave-gradient-1)"
        />
        <defs>
          <linearGradient id="wave-gradient-1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#0284C7" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#2563EB" stopOpacity="0.9" />
          </linearGradient>
        </defs>
      </svg>

      {/* Layer 2 - Cyan Wave Overlay */}
      <svg
        className="absolute bottom-0 left-0 w-full h-48 sm:h-80 opacity-30 mix-blend-lighten"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <motion.path
          animate={{
            d: [
              'M0,220 C360,100 600,260 900,120 C1200,-20 1300,200 1440,140 L1440,320 L0,320 Z',
              'M0,130 C300,250 540,50 840,210 C1140,300 1260,80 1440,200 L1440,320 L0,320 Z',
              'M0,220 C360,100 600,260 900,120 C1200,-20 1300,200 1440,140 L1440,320 L0,320 Z',
            ],
          }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          fill="url(#wave-gradient-2)"
        />
        <defs>
          <linearGradient id="wave-gradient-2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.6" />
            <stop offset="60%" stopColor="#3B82F6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0.7" />
          </linearGradient>
        </defs>
      </svg>

      {/* Subtle Grid Lines Overlay for Tech Legal Aesthetic */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />
    </div>
  );
}

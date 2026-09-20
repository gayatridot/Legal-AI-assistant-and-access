import { motion } from 'motion/react';
import { AlertTriangle, MessageSquareText, ShieldCheck } from 'lucide-react';

export function FeatureHighlightBar() {
  const features = [
    {
      icon: AlertTriangle,
      iconColor: 'text-red-400',
      bgGlow: 'from-red-500/20 to-rose-500/10 border-red-500/30',
      title: 'Clause Risk Detection',
      description: 'Spot critical legal issues instantly',
    },
    {
      icon: MessageSquareText,
      iconColor: 'text-cyan-400',
      bgGlow: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30',
      title: 'Plain English Summary',
      description: 'Simplified 8th-grade explanations',
    },
    {
      icon: ShieldCheck,
      iconColor: 'text-emerald-400',
      bgGlow: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30',
      title: 'Data Privacy Assured',
      description: 'In-memory secure & confidential',
    },
  ];

  return (
    <section id="feature-bar-section" className="py-8 max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
      <div className="grid md:grid-cols-3 gap-5">
        {features.map((feat, idx) => {
          const IconComponent = feat.icon;
          return (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              whileHover={{ y: -4, scale: 1.01 }}
              className={`p-5 rounded-2xl bg-gradient-to-r ${feat.bgGlow} border bg-slate-900/70 backdrop-blur-md shadow-lg flex items-center gap-4`}
            >
              <div className="w-12 h-12 rounded-xl bg-slate-950/80 border border-white/10 flex items-center justify-center shrink-0 shadow-inner">
                <IconComponent className={`w-6 h-6 ${feat.iconColor}`} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-tight">{feat.title}</h4>
                <p className="text-xs text-slate-300 mt-0.5">{feat.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

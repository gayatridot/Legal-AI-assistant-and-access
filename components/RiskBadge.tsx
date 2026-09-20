import { RiskLevel } from '../types/legal.js';

interface RiskBadgeProps {
  level: RiskLevel | string;
  score?: number;
  showScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function RiskBadge({
  level,
  score,
  showScore = false,
  size = 'md',
  className = '',
}: RiskBadgeProps) {
  const normalized = (level || 'LOW').toUpperCase();
  const isHigh = normalized === 'HIGH' || normalized === 'CRITICAL';
  const isMedium = normalized === 'MEDIUM';

  type Config = {
    label: string;
    pill: string;
    ping: string;
    dot: string;
    glow: string;
  };

  let config: Config = {
    label: 'Low Risk',
    pill: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
    ping: 'bg-emerald-400',
    dot: 'bg-emerald-400',
    glow: 'shadow-[0_0_10px_rgba(52,211,153,0.35)]',
  };

  if (isHigh) {
    config = {
      label: normalized === 'CRITICAL' ? 'Critical Risk' : 'High Risk',
      pill: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
      ping: 'bg-rose-400',
      dot: 'bg-rose-400',
      glow: 'shadow-[0_0_10px_rgba(251,113,133,0.4)]',
    };
  } else if (isMedium) {
    config = {
      label: 'Medium Risk',
      pill: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
      ping: 'bg-amber-400',
      dot: 'bg-amber-400',
      glow: 'shadow-[0_0_10px_rgba(251,191,36,0.35)]',
    };
  }

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-3 py-1 gap-2',
    lg: 'text-sm px-3.5 py-1.5 gap-2',
  };

  const dotSizes = {
    sm: 'h-1.5 w-1.5',
    md: 'h-2 w-2',
    lg: 'h-2.5 w-2.5',
  };

  return (
    <span
      className={`inline-flex items-center font-bold rounded-full border whitespace-nowrap select-none ${sizeClasses[size]} ${config.pill} ${config.glow} ${className}`}
    >
      <span className={`relative flex ${dotSizes[size]} shrink-0`} aria-hidden="true">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.ping} opacity-60`} />
        <span className={`relative inline-flex rounded-full ${dotSizes[size]} ${config.dot}`} />
      </span>
      <span>
        {config.label}
        {showScore && typeof score === 'number' && (
          <span className="font-mono font-normal opacity-75 ml-1">&middot; {score}</span>
        )}
      </span>
    </span>
  );
}

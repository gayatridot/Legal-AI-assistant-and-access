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

  let config = {
    label: 'Fair / Low Risk',
    pillClass:
      'bg-emerald-50/90 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs',
    pingColor: 'bg-emerald-400',
    dotColor: 'bg-emerald-500',
  };

  if (isHigh) {
    config = {
      label: 'High Risk',
      pillClass:
        'bg-rose-50/90 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/60 shadow-2xs',
      pingColor: 'bg-rose-400',
      dotColor: 'bg-rose-500',
    };
  } else if (isMedium) {
    config = {
      label: 'Medium Risk',
      pillClass:
        'bg-amber-50/90 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60 shadow-2xs',
      pingColor: 'bg-amber-400',
      dotColor: 'bg-amber-500',
    };
  }

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2',
    lg: 'text-xs sm:text-sm px-3.5 py-1.5 gap-2.5',
  };

  const dotSizes = {
    sm: 'h-1.5 w-1.5',
    md: 'h-2 w-2',
    lg: 'h-2.5 w-2.5',
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border backdrop-blur-xs whitespace-nowrap transition-all duration-200 select-none ${
        sizeClasses[size]
      } ${config.pillClass} ${className}`}
    >
      <span className={`relative flex ${dotSizes[size]} shrink-0`} aria-hidden="true">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.pingColor} opacity-75`}
        />
        <span className={`relative inline-flex rounded-full ${dotSizes[size]} ${config.dotColor}`} />
      </span>
      <span>
        {config.label}
        {showScore && typeof score === 'number' && (
          <span className="font-mono font-normal opacity-85 ml-1">
            &middot; {score}/100
          </span>
        )}
      </span>
    </span>
  );
}

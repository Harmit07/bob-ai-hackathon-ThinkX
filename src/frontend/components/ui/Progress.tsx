import React from 'react';

interface ProgressProps {
  value: number; // 0 - 100
  max?: number;
  variant?: 'cyan' | 'green' | 'yellow' | 'red' | 'orange';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Progress({ value, max = 100, variant = 'cyan', size = 'md', className = '' }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  const colors = {
    cyan: 'bg-cyan-500 shadow-cyan-500/50',
    green: 'bg-emerald-500 shadow-emerald-500/50',
    yellow: 'bg-yellow-500 shadow-yellow-500/50',
    orange: 'bg-orange-500 shadow-orange-500/50',
    red: 'bg-red-500 shadow-red-500/50',
  };

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={`w-full bg-slate-800 rounded-full overflow-hidden ${heights[size]} ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ${colors[variant]} shadow-sm`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

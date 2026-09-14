import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'yellow' | 'orange' | 'red' | 'blue' | 'slate';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Badge({ children, variant = 'slate', size = 'md', className }: BadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-medium',
    lg: 'px-3 py-1.5 text-sm font-semibold',
  };

  const variants = {
    green: 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30',
    yellow: 'bg-yellow-950/80 text-yellow-400 border border-yellow-500/30',
    orange: 'bg-orange-950/80 text-orange-400 border border-orange-500/30',
    red: 'bg-red-950/80 text-red-400 border border-red-500/30',
    blue: 'bg-blue-950/80 text-blue-400 border border-blue-500/30',
    slate: 'bg-slate-800/80 text-slate-300 border border-slate-700/50',
  };

  return (
    <span className={twMerge(clsx('inline-flex items-center gap-1.5 rounded-md font-mono tracking-wide uppercase', variants[variant], sizeClasses[size], className))}>
      {children}
    </span>
  );
}

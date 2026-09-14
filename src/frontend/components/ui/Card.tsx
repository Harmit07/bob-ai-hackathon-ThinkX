import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'bordered' | 'ghost' | 'glow';
}

export function Card({ children, className, variant = 'default', ...props }: CardProps) {
  const base = 'rounded-xl transition-all duration-200';
  const variants = {
    default: 'bg-slate-900/90 border border-slate-800/80 shadow-lg shadow-black/40 backdrop-blur-sm',
    bordered: 'bg-slate-950 border border-slate-700/80 shadow-md',
    ghost: 'bg-slate-900/40 border border-slate-800/40',
    glow: 'bg-slate-900/90 border border-cyan-500/30 shadow-lg shadow-cyan-950/30 backdrop-blur-sm',
  };

  return (
    <div className={twMerge(clsx(base, variants[variant], className))} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={twMerge(clsx('px-5 py-4 border-b border-slate-800/80 flex items-center justify-between', className))} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={twMerge(clsx('text-base font-semibold text-slate-100 flex items-center gap-2', className))} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={twMerge(clsx('p-5', className))} {...props}>
      {children}
    </div>
  );
}

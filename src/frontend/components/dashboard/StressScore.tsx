import React from 'react';

interface StressScoreProps {
  score: number; // e.g. 84
  status?: string; // CRITICAL / HIGH / MODERATE / NORMAL
}

export function StressScore({ score, status = 'CRITICAL' }: StressScoreProps) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let colorClass = 'text-red-500 stroke-red-500';
  if (score < 35) colorClass = 'text-emerald-500 stroke-emerald-500';
  else if (score < 60) colorClass = 'text-yellow-500 stroke-yellow-500';
  else if (score < 80) colorClass = 'text-orange-500 stroke-orange-500';

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg className="w-28 h-28 transform -rotate-90">
        <circle
          cx="56"
          cy="56"
          r={radius}
          className="stroke-slate-800"
          strokeWidth="8"
          fill="transparent"
        />
        <circle
          cx="56"
          cy="56"
          r={radius}
          className={`transition-all duration-1000 ${colorClass}`}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold text-slate-100 font-mono tracking-tight">{score}</span>
        <span className="text-[10px] font-bold tracking-wider uppercase text-red-400 font-mono">{status}</span>
      </div>
    </div>
  );
}

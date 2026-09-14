import React from 'react';
import { AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export function EmptyState({
  title = "No Data Available",
  description = "No telemetry or evaluation data recorded for this selection.",
  icon = <AlertCircle className="w-10 h-10 text-slate-500" />
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/30">
      <div className="mb-3">{icon}</div>
      <h4 className="text-base font-semibold text-slate-200 mb-1">{title}</h4>
      <p className="text-sm text-slate-400 max-w-sm">{description}</p>
    </div>
  );
}

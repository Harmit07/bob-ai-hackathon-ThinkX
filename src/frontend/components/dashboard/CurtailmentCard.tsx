import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { CurtailmentSummary } from '@/types/forecast';
import { ShieldAlert, Clock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export function CurtailmentCard({ summary }: { summary: CurtailmentSummary }) {
  return (
    <Card className="hover:border-slate-700 transition-all border-orange-950/40">
      <CardHeader>
        <CardTitle className="text-slate-200">
          <ShieldAlert className="w-4 h-4 text-orange-400" /> CURTAILMENT
        </CardTitle>
        <Badge variant="orange" size="sm">Risk HIGH</Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-slate-400 uppercase tracking-wider font-mono">Expected Waste</span>
          <span className="text-2xl font-extrabold text-orange-400 font-mono tracking-tight">{summary.expected_mw} MW</span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80 font-mono text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">Window</span>
            <span className="text-xs font-bold text-slate-200">{summary.window}</span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Primary Cause</span>
            <span className="text-xs font-bold text-orange-400 truncate block">{summary.primary_cause}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

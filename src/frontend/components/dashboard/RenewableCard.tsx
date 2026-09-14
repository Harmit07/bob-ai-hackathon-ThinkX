import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { RenewableSummary } from '@/types/forecast';
import { Sun, Wind, ArrowDownRight } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export function RenewableCard({ summary }: { summary: RenewableSummary }) {
  return (
    <Card className="hover:border-slate-700 transition-all">
      <CardHeader>
        <CardTitle className="text-slate-200">
          <Sun className="w-4 h-4 text-yellow-400" /> RENEWABLES
        </CardTitle>
        <Badge variant="yellow" size="sm">Avail {summary.availability_pct}%</Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-slate-400 uppercase tracking-wider font-mono">Actual Output</span>
          <span className="text-2xl font-extrabold text-slate-100 font-mono tracking-tight">{summary.actual_gw} GW</span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80 font-mono text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">Expected</span>
            <span className="text-base font-bold text-slate-200">{summary.expected_gw} GW</span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Variance</span>
            <span className="text-base font-bold text-red-400 flex items-center gap-0.5">
              <ArrowDownRight className="w-4 h-4 text-red-400" /> {summary.variance_gw} GW
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

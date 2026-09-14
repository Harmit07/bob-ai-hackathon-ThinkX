import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { DemandSummary } from '@/types/forecast';
import { Zap, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export function DemandCard({ summary }: { summary: DemandSummary }) {
  return (
    <Card className="hover:border-slate-700 transition-all">
      <CardHeader>
        <CardTitle className="text-slate-200">
          <Zap className="w-4 h-4 text-cyan-400" /> DEMAND
        </CardTitle>
        <Badge variant="orange" size="sm">Spike {summary.spike_probability_pct}%</Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-slate-400 uppercase tracking-wider font-mono">Current Load</span>
          <span className="text-2xl font-extrabold text-slate-100 font-mono tracking-tight">{summary.current_load_gw} GW</span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80 font-mono text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">Expected Peak</span>
            <span className="text-base font-bold text-orange-400">{summary.expected_peak_gw} GW</span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Peak Time</span>
            <span className="text-base font-bold text-slate-200 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-cyan-400" /> {summary.peak_time}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

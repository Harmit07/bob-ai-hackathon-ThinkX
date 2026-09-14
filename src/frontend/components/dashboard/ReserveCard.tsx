import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ReserveSummary } from '@/types/forecast';
import { BatteryCharging, ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export function ReserveCard({ summary }: { summary: ReserveSummary }) {
  return (
    <Card className="hover:border-slate-700 transition-all">
      <CardHeader>
        <CardTitle className="text-slate-200">
          <BatteryCharging className="w-4 h-4 text-emerald-400" /> RESERVE
        </CardTitle>
        <Badge variant="blue" size="sm">Opt {summary.after_optimization_gw} GW</Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-slate-400 uppercase tracking-wider font-mono">Current Deficit</span>
          <span className="text-2xl font-extrabold text-red-400 font-mono tracking-tight">{summary.current_gw} GW</span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80 font-mono text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">After Optimization</span>
            <span className="text-base font-bold text-emerald-400">+{summary.after_optimization_gw} GW</span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Improvement</span>
            <span className="text-base font-bold text-cyan-400 flex items-center gap-0.5">
              <ArrowUpRight className="w-4 h-4 text-cyan-400" /> +{summary.improvement_gw} GW
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

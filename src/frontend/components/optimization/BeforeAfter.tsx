import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface BeforeAfterProps {
  beforeCurtailment?: number;
  afterCurtailment?: number;
  beforeReserve?: number;
  afterReserve?: number;
  beforeRisk?: string;
  afterRisk?: string;
}

export function BeforeAfter({
  beforeCurtailment = 820,
  afterCurtailment = 230,
  beforeReserve = -0.4,
  afterReserve = 0.8,
  beforeRisk = 'HIGH',
  afterRisk = 'LOW',
}: BeforeAfterProps) {
  return (
    <Card className="border-emerald-950/40 bg-gradient-to-r from-slate-900 to-emerald-950/30">
      <CardHeader>
        <CardTitle className="text-slate-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> OPERATIONAL IMPACT: BEFORE vs AFTER OPTIMIZATION
        </CardTitle>
        <Badge variant="green" size="sm">OPTIMAL MILP OUTCOME</Badge>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
          {/* Curtailment Impact */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <span className="text-xs text-slate-400 uppercase tracking-wider block">Renewable Curtailment</span>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-red-400 line-through">{beforeCurtailment} MW</span>
              <ArrowRight className="w-4 h-4 text-slate-500" />
              <span className="text-2xl font-extrabold text-emerald-400">{afterCurtailment} MW</span>
            </div>
            <span className="text-[11px] text-emerald-400 block font-semibold">
              ↓ {beforeCurtailment - afterCurtailment} MW (72% Reduction in Wasted Power)
            </span>
          </div>

          {/* Reserve Margin Impact */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <span className="text-xs text-slate-400 uppercase tracking-wider block">Reserve Margin</span>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-red-400">{beforeReserve} GW</span>
              <ArrowRight className="w-4 h-4 text-slate-500" />
              <span className="text-2xl font-extrabold text-emerald-400">+{afterReserve} GW</span>
            </div>
            <span className="text-[11px] text-cyan-400 block font-semibold">
              ↑ +{(afterReserve - beforeReserve).toFixed(1)} GW Reserve Recovery
            </span>
          </div>

          {/* Grid Risk Impact */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <span className="text-xs text-slate-400 uppercase tracking-wider block">System Grid Risk</span>
            <div className="flex items-center gap-3">
              <Badge variant="red" size="md">{beforeRisk}</Badge>
              <ArrowRight className="w-4 h-4 text-slate-500" />
              <Badge variant="green" size="lg">{afterRisk}</Badge>
            </div>
            <span className="text-[11px] text-emerald-400 block font-semibold">
              ✓ Operational Stability Restored
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

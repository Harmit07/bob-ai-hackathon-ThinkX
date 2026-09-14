import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StressScore } from './StressScore';
import { GridStatus as GridStatusType } from '@/types/grid';
import { AlertTriangle, Zap, ShieldAlert, Activity } from 'lucide-react';

interface GridStatusProps {
  status: GridStatusType;
}

export function GridStatus({ status }: GridStatusProps) {
  return (
    <Card className="bg-gradient-to-r from-slate-950 via-slate-900 to-red-950/40 border-red-900/30 p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        {/* Left Status Summary */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Badge variant="red" size="lg" className="animate-pulse">
              <AlertTriangle className="w-4 h-4 mr-1 text-red-400" />
              GRID STATUS: ELEVATED RISK
            </Badge>
            <span className="text-xs text-slate-400 font-mono">Region: Metro Central & Solar Valley</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
            Peak Evening Demand Surge & Transmission Bottleneck
          </h1>

          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Real-time ML screening detected lost solar output on <span className="text-orange-400 font-semibold">SOLAR_B17</span> (23 MW inverter derating) coinciding with peak demand spike at 18:15.
          </p>
        </div>

        {/* Right Gauge & Key Metrics */}
        <div className="flex items-center gap-6 bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 shrink-0">
          {/* Radial Stress Gauge */}
          <StressScore score={status.grid_stress_index} status="CRITICAL" />

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 border-l border-slate-800/80 pl-6 font-mono">
            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Transmission</span>
              <span className="text-sm font-bold text-orange-400 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> CONGESTED
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Reserve Margin</span>
              <span className="text-sm font-bold text-red-400">-0.4 GW</span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Curtailment Risk</span>
              <span className="text-sm font-bold text-orange-400">HIGH (820 MW)</span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Optimization</span>
              <span className="text-sm font-bold text-cyan-400">AVAILABLE</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

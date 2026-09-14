import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FileText, Cpu, CheckCircle2, ShieldAlert } from 'lucide-react';

interface OperatorBriefProps {
  briefMarkdown?: string;
}

export function OperatorBrief({ briefMarkdown }: OperatorBriefProps) {
  return (
    <Card className="bg-slate-900/90 border-cyan-900/40">
      <CardHeader>
        <CardTitle className="text-slate-200">
          <Cpu className="w-4 h-4 text-cyan-400" /> AI OPERATOR BRIEFING
        </CardTitle>
        <Badge variant="blue" size="sm">DYNAMICAL SYNTHESIS</Badge>
      </CardHeader>

      <CardContent className="p-6 font-mono text-xs text-slate-300 space-y-6 leading-relaxed">
        {/* Key Brief Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">GRID STATUS</span>
            <span className="text-sm font-bold text-red-400">Elevated Risk (Stress: 84/100)</span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">DEMAND</span>
            <span className="text-sm font-bold text-orange-400">18.7 GW expected peak at 18:15</span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">RENEWABLES</span>
            <span className="text-sm font-bold text-yellow-400">11.2 GW expected | 10.6 GW actual (-0.6 GW)</span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">CURTAILMENT</span>
            <span className="text-sm font-bold text-orange-400">820 MW projected (14:40–16:10)</span>
          </div>
        </div>

        {/* Critical Diagnosis */}
        <div className="p-4 rounded-lg bg-red-950/30 border border-red-800/40 space-y-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <h5 className="font-bold text-slate-200 uppercase tracking-wider">CRITICAL DIAGNOSIS & ROOT CAUSE</h5>
          </div>
          <p className="text-slate-300">
            <strong className="text-orange-400">SOLAR_B17</strong> (Solar Plant B17) experiencing severe <strong className="text-red-400">INVERTER DERATING</strong> (91% confidence). Inverter thermal overload (84.2°C) reduced plant output by 23 MW.
          </p>
        </div>

        {/* Recommended Actions */}
        <div className="p-4 rounded-lg bg-cyan-950/30 border border-cyan-800/40 space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <h5 className="font-bold text-slate-200 uppercase tracking-wider">RECOMMENDED ACTION (OR-TOOLS MILP)</h5>
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-300">
            <li><strong className="text-cyan-400">BESS_03:</strong> Discharge 350 MW battery reserve</li>
            <li><strong className="text-cyan-400">Demand Response:</strong> Shed 180 MW peak industrial load</li>
            <li><strong className="text-cyan-400">Interchange:</strong> Transfer 150 MW from R03 Highland Corridor</li>
          </ul>
        </div>

        {/* Expected Outcome */}
        <div className="p-4 rounded-lg bg-emerald-950/30 border border-emerald-800/40 space-y-1">
          <h5 className="font-bold text-emerald-400 uppercase tracking-wider">EXPECTED OPERATIONAL OUTCOME</h5>
          <p className="text-slate-200 font-semibold">
            Curtailment ↓ (820 MW → 230 MW) | Reserve Margin ↑ (-0.4 GW → +0.8 GW) | Grid Risk ↓ (HIGH → LOW)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

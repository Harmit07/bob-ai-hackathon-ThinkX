'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { RecommendationAction } from '@/types/recommendation';
import { ApprovalControls } from '@/components/recommendations/ApprovalControls';
import { Zap, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface NextBestActionProps {
  actions: RecommendationAction[];
}

export function NextBestAction({ actions }: NextBestActionProps) {
  const router = useRouter();

  const handleSimulate = (action: RecommendationAction) => {
    router.push('/simulation');
  };

  return (
    <Card className="col-span-1 lg:col-span-3 border-cyan-900/40">
      <CardHeader>
        <CardTitle className="text-slate-200">
          <Zap className="w-4 h-4 text-cyan-400" /> NEXT-BEST OPERATOR ACTIONS (OR-TOOLS MILP OPTIMIZED)
        </CardTitle>
        <Badge variant="blue" size="sm">HUMAN-IN-THE-LOOP APPROVAL</Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {actions.map((act, idx) => (
            <div key={act.id} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 flex flex-col justify-between font-mono">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-extrabold text-cyan-400">0{idx + 1}</span>
                  <Badge variant={act.priority === 'CRITICAL' ? 'red' : 'yellow'} size="sm">
                    {act.priority}
                  </Badge>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wide">{act.action}</h4>
                  <span className="text-xs text-emerald-400 font-bold">{act.impact_mw} MW</span>
                </div>

                <div className="pt-2 border-t border-slate-800/80 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Impact:</span>
                    <span className="text-slate-200 font-semibold">{act.expected_impact_desc}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Confidence:</span>
                    <span className="text-cyan-400 font-semibold">{act.confidence_pct}%</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Risk:</span>
                    <Badge variant="green" size="sm">{act.risk_level}</Badge>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-tight pt-1">
                  {act.rationale}
                </p>
              </div>

              {/* Approval Controls */}
              <div className="pt-3 border-t border-slate-800/80">
                <ApprovalControls action={act} onSimulate={handleSimulate} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

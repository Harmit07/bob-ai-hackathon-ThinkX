import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { RootCauseAnalysis } from '@/types/anomaly';
import { Search, CheckCircle2, AlertCircle } from 'lucide-react';

interface RootCausePanelProps {
  rca: RootCauseAnalysis;
}

export function RootCausePanel({ rca }: RootCausePanelProps) {
  return (
    <Card className="border-cyan-950/40">
      <CardHeader>
        <CardTitle className="text-slate-200">
          <Search className="w-4 h-4 text-cyan-400" /> ROOT CAUSE ANALYSIS (RCA)
        </CardTitle>
        <Badge variant="blue" size="sm">Confidence {(rca.confidence * 100).toFixed(0)}%</Badge>
      </CardHeader>

      <CardContent className="space-y-5 font-mono text-xs">
        {/* Primary Cause Header */}
        <div className="p-3.5 rounded-lg bg-cyan-950/40 border border-cyan-800/40 space-y-1">
          <span className="text-[11px] text-cyan-400 font-semibold uppercase tracking-wider block">Primary Cause Identified</span>
          <h4 className="text-base font-extrabold text-slate-100">{rca.primary_cause}</h4>
          <p className="text-xs text-slate-400">ML Isolation Forest + Field Telemetry Correlation</p>
        </div>

        {/* Probability Chart */}
        <div className="space-y-2.5">
          <span className="text-slate-400 uppercase tracking-wider text-[11px] block">Causal Probabilities Breakdown</span>
          {rca.cause_probabilities.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>{item.cause}</span>
                <span className="font-bold text-cyan-400">{item.probability_pct}%</span>
              </div>
              <Progress
                value={item.probability_pct}
                variant={idx === 0 ? 'cyan' : 'yellow'}
                size="sm"
              />
            </div>
          ))}
        </div>

        {/* Evidence Checklist */}
        <div className="pt-3 border-t border-slate-800/80 space-y-2">
          <span className="text-slate-400 uppercase tracking-wider text-[11px] block">Verified Evidence</span>
          <div className="space-y-1.5">
            {rca.evidence_checklist.map((ev, idx) => (
              <div key={idx} className="flex items-center gap-2 text-slate-300">
                {ev.verified ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-slate-600 shrink-0" />
                )}
                <span className={ev.verified ? 'text-slate-200' : 'text-slate-500 line-through'}>
                  {ev.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

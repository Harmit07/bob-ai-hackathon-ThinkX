import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SimulationResult as SimResultType } from '@/types/simulation';
import { Activity, ArrowRight, AlertTriangle } from 'lucide-react';

interface SimulationResultProps {
  result: SimResultType;
}

export function SimulationResult({ result }: SimulationResultProps) {
  return (
    <Card className="col-span-1 lg:col-span-2 border-orange-950/40">
      <CardHeader>
        <CardTitle className="text-slate-200">
          <Activity className="w-4 h-4 text-orange-400" /> {result.scenario_name.toUpperCase()}
        </CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">Risk Transition:</span>
          <Badge variant="red" size="sm">{result.risk_before}</Badge>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          <Badge variant="red" size="sm" className="animate-pulse">{result.risk_after}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 font-mono text-xs">
        {/* Baseline vs Scenario Table */}
        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="p-3">METRIC</th>
                <th className="p-3">BASELINE</th>
                <th className="p-3">SCENARIO</th>
                <th className="p-3 text-right">IMPACT DIRECTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {result.metrics.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-3 font-semibold text-slate-200">{row.metric}</td>
                  <td className="p-3 text-slate-400">{row.baseline}</td>
                  <td className="p-3 font-bold text-slate-100">{row.scenario}</td>
                  <td className="p-3 text-right">
                    <Badge
                      variant={row.direction === 'negative' ? 'red' : row.direction === 'positive' ? 'green' : 'slate'}
                      size="sm"
                    >
                      {row.direction === 'negative' ? 'CRITICAL SPIKE' : 'IMPROVED'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* WHAT CHANGED? Section */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-slate-200 font-bold uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            <span>WHAT CHANGED?</span>
          </div>

          <ul className="list-disc list-inside space-y-1.5 text-slate-300">
            {result.what_changed_summary.map((summary, idx) => (
              <li key={idx} className="leading-relaxed">
                {summary}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

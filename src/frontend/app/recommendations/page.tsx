'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ApprovalControls } from '@/components/recommendations/ApprovalControls';
import { CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

import { useRouter } from 'next/navigation';

export default function RecommendationsPage() {
  const router = useRouter();
  const { data: recommendations } = useQuery({ queryKey: ['recommendations'], queryFn: () => api.getRecommendations() });

  return (
    <PageContainer className="space-y-6">
      {/* Title */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-100 font-mono tracking-tight flex items-center gap-2">
          <CheckCircle2 className="w-6 h-6 text-cyan-400" /> OPERATOR ACTION RECOMMENDATIONS
        </h1>
        <p className="text-xs text-slate-400 mt-1">Human-in-the-loop decision approval portal powered by Google OR-Tools MILP.</p>
      </div>

      {/* Recommendations Cards */}
      <div className="space-y-4 font-mono">
        {(recommendations || []).map((rec, idx) => (
          <Card key={rec.id} className="border-slate-800 hover:border-slate-700 transition-all">
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="text-xl font-extrabold text-cyan-400">0{idx + 1}</span>
                <CardTitle className="text-base text-slate-100 uppercase">{rec.action}</CardTitle>
                <Badge variant={rec.priority === 'CRITICAL' ? 'red' : 'yellow'} size="sm">
                  {rec.priority}
                </Badge>
              </div>
              <Badge variant="blue" size="sm">{rec.confidence_pct}% CONFIDENCE</Badge>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Target Asset</span>
                  <span className="font-bold text-cyan-400">{rec.target_node}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Impact Amount</span>
                  <span className="font-bold text-emerald-400">{rec.impact_mw} MW</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Cost Delta</span>
                  <span className="font-bold text-slate-200">${rec.cost_delta_usd.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Risk Level</span>
                  <Badge variant="green" size="sm">{rec.risk_level}</Badge>
                </div>
              </div>

              <div className="text-xs space-y-1">
                <span className="text-slate-400 uppercase tracking-wider block text-[11px]">Rationale & Expected Outcome</span>
                <p className="text-slate-300 leading-relaxed">{rec.rationale}</p>
              </div>

              {/* Approval Controls */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" /> Human Approval Required
                </span>
                <ApprovalControls action={rec} onSimulate={() => router.push('/simulation')} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}


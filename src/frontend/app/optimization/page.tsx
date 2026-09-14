'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PageContainer } from '@/components/layout/PageContainer';
import { ScenarioCard } from '@/components/optimization/ScenarioCard';
import { BeforeAfter } from '@/components/optimization/BeforeAfter';
import { ScenarioCardData } from '@/types/optimization';
import { Sliders, Cpu, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function OptimizationPage() {
  const { data: optimization } = useQuery({ queryKey: ['optimization'], queryFn: () => api.getOptimization() });
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('SCEN_D');

  const scenarios = optimization?.scenarios || [];
  const selectedScenario = scenarios.find((s) => s.id === selectedScenarioId) || scenarios[3] || scenarios[0];

  return (
    <PageContainer className="space-y-6">
      {/* Title */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-100 font-mono tracking-tight flex items-center gap-2">
          <Sliders className="w-6 h-6 text-cyan-400" /> CURTAILMENT AVOIDANCE OPTIMIZATION
        </h1>
        <p className="text-xs text-slate-400 mt-1">Google OR-Tools MILP Economic Dispatch & Unit Commitment solver.</p>
      </div>

      {/* Before / After Impact Comparison */}
      <BeforeAfter
        beforeCurtailment={optimization?.before_after.curtailment_mwh_before || 820}
        afterCurtailment={selectedScenario?.curtailment_mw || 230}
        beforeReserve={optimization?.before_after.reserve_gw_before || -0.4}
        afterReserve={selectedScenario?.reserve_margin_gw || 0.8}
        beforeRisk={optimization?.before_after.risk_before || 'HIGH'}
        afterRisk={selectedScenario?.risk_level || 'LOW'}
      />

      {/* Four Scenario Cards Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-200 font-mono uppercase tracking-wider">
          OPTIMIZATION DISPATCH SCENARIOS (EVALUATED)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {scenarios.map((scen) => (
            <ScenarioCard
              key={scen.id}
              scenario={scen}
              isSelected={scen.id === selectedScenarioId}
              onSelect={(s) => setSelectedScenarioId(s.id)}
            />
          ))}
        </div>
      </div>

      {/* Selected Scenario Dispatch Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-slate-200">
            <Cpu className="w-4 h-4 text-cyan-400" /> DISPATCH SCHEDULE ({selectedScenario?.title || 'SCENARIO D'})
          </CardTitle>
          <Badge variant="blue" size="sm">MILP SOLVER: OPTIMAL</Badge>
        </CardHeader>

        <CardContent className="p-0 font-mono text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/90 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="p-3.5 pl-5">RESOURCE NODE</th>
                  <th className="p-3.5">TYPE</th>
                  <th className="p-3.5">DISPATCHED MW</th>
                  <th className="p-3.5">MAX CAPACITY</th>
                  <th className="p-3.5">HOURLY COST</th>
                  <th className="p-3.5 pr-5 text-right">CARBON EMISSIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {(optimization?.dispatch_schedule || []).map((row) => (
                  <tr key={row.node_id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="p-3.5 pl-5 font-bold text-slate-100">{row.node_name} ({row.node_id})</td>
                    <td className="p-3.5 capitalize text-slate-400">{row.node_type}</td>
                    <td className="p-3.5 font-bold text-emerald-400">{row.dispatched_mw} MW</td>
                    <td className="p-3.5 text-slate-300">{row.max_capacity_mw} MW</td>
                    <td className="p-3.5 text-cyan-400">${row.cost_usd.toLocaleString()}</td>
                    <td className="p-3.5 pr-5 text-right text-slate-300">{row.emissions_kg} kg CO2</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

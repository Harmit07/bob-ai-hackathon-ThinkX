'use client';

import React, { useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { SimulationControls } from '@/components/simulation/SimulationControls';
import { SimulationResult } from '@/components/simulation/SimulationResult';
import { SimulationParams, SimulationResult as SimResultType } from '@/types/simulation';
import { api } from '@/lib/api';
import { PlayCircle } from 'lucide-react';

export default function SimulationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [simResult, setSimResult] = useState<SimResultType>({
    scenario_name: 'WHAT-IF SIMULATION (DEMAND +10%, SOLAR -20%)',
    risk_before: 'HIGH',
    risk_after: 'CRITICAL',
    metrics: [
      { metric: 'Demand', baseline: '16.8 GW', scenario: '18.48 GW', unit: 'GW', direction: 'negative' },
      { metric: 'Curtailment Risk', baseline: '820 MW', scenario: '970 MW', unit: 'MW', direction: 'negative' },
      { metric: 'Reserve Margin', baseline: '-0.4 GW', scenario: '-1.1 GW', unit: 'GW', direction: 'negative' },
      { metric: 'Grid Stress Score', baseline: '84 / 100', scenario: '93 / 100', unit: '/100', direction: 'negative' },
    ],
    what_changed_summary: [
      'Demand increased by 10% (surge to 18.48 GW).',
      'Reserve margin decreased by 0.7 GW to severe deficit of -1.1 GW.',
      'Curtailment increased by 150 MW.',
      'Grid stress increased by 9 points into CRITICAL status (93/100).',
    ],
  });

  const handleRunSimulation = async (params: SimulationParams) => {
    setIsLoading(true);
    try {
      const res = await api.runSimulation(params);
      setSimResult(res);
    } catch {
      // fallback handled inside api.ts
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer className="space-y-6">
      {/* Title */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-100 font-mono tracking-tight flex items-center gap-2">
          <PlayCircle className="w-6 h-6 text-cyan-400" /> WHAT-IF SCENARIO SIMULATOR
        </h1>
        <p className="text-xs text-slate-400 mt-1">Explore possible grid conditions before taking action.</p>
      </div>

      {/* Controls & Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SimulationControls onRunSimulation={handleRunSimulation} isLoading={isLoading} />
        {simResult && <SimulationResult result={simResult} />}
      </div>
    </PageContainer>
  );
}

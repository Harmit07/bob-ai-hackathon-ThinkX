import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { GridStress } from '@/types/grid';
import { Activity, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';

export function GridStressDrivers({ stress }: { stress: GridStress }) {
  const drivers = stress.drivers || [
    '↑ Demand pressure',
    '↑ Transmission utilization',
    '↓ Solar generation',
    '↓ Reserve margin',
    '↑ Curtailment risk',
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-slate-200">
          <Activity className="w-4 h-4 text-red-400" /> GRID STRESS BREAKDOWN ({stress.grid_stress_index} / 100)
        </CardTitle>
        <Badge variant="red" size="sm">CRITICAL</Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stress Drivers List */}
        <div className="space-y-2">
          <span className="text-xs text-slate-400 font-mono uppercase tracking-wider block mb-2">Key Stress Drivers</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {drivers.map((driver, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs font-mono text-slate-300">
                <span className="text-orange-400 font-bold">•</span>
                <span>{driver}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sub-Health Progress Bars */}
        <div className="space-y-3 pt-3 border-t border-slate-800/80 font-mono text-xs">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-400">Transmission Congestion</span>
              <span className="text-orange-400 font-bold">{stress.congestion_health}% Health</span>
            </div>
            <Progress value={stress.congestion_health} variant="orange" size="sm" />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-400">Frequency Health</span>
              <span className="text-yellow-400 font-bold">{stress.frequency_health}% Health</span>
            </div>
            <Progress value={stress.frequency_health} variant="yellow" size="sm" />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-400">Voltage Stability</span>
              <span className="text-emerald-400 font-bold">{stress.voltage_health}% Health</span>
            </div>
            <Progress value={stress.voltage_health} variant="green" size="sm" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

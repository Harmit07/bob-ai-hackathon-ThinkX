import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ScenarioCardData } from '@/types/optimization';
import { CheckCircle2, ShieldAlert } from 'lucide-react';

interface ScenarioCardProps {
  scenario: ScenarioCardData;
  onSelect?: (scenario: ScenarioCardData) => void;
  isSelected?: boolean;
}

export function ScenarioCard({ scenario, onSelect, isSelected }: ScenarioCardProps) {
  const isRec = scenario.is_recommended;

  return (
    <Card
      onClick={() => onSelect ? onSelect(scenario) : null}
      className={`cursor-pointer transition-all duration-200 ${
        isRec
          ? 'bg-gradient-to-b from-slate-900 to-cyan-950/40 border-cyan-500/60 ring-2 ring-cyan-500/40 shadow-xl shadow-cyan-950/40'
          : isSelected
          ? 'border-slate-500 bg-slate-900'
          : 'hover:border-slate-700'
      }`}
    >
      <CardHeader className="py-3">
        <div className="flex items-center justify-between w-full">
          <span className="text-xs font-bold text-slate-400 font-mono">{scenario.id}</span>
          {isRec && (
            <Badge variant="blue" size="sm" className="animate-pulse">
              <CheckCircle2 className="w-3 h-3 mr-1 text-cyan-400" /> RECOMMENDED
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3 font-mono">
        <div>
          <h4 className="text-base font-extrabold text-slate-100">{scenario.title}</h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{scenario.description}</p>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Curtailment:</span>
            <span className={`font-bold ${isRec ? 'text-emerald-400' : 'text-orange-400'}`}>
              {scenario.curtailment_mw} MW
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">Reserve Margin:</span>
            <span className={`font-bold ${scenario.reserve_margin_gw >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {scenario.reserve_margin_gw >= 0 ? '+' : ''}{scenario.reserve_margin_gw} GW
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">Grid Risk:</span>
            <Badge variant={scenario.risk_level === 'LOW' ? 'green' : scenario.risk_level === 'HIGH' ? 'red' : 'yellow'} size="sm">
              {scenario.risk_level}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

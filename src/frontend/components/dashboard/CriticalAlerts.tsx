import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AnomalyItem } from '@/types/anomaly';
import { AlertCircle, ShieldAlert, ArrowRight } from 'lucide-react';

interface CriticalAlertsProps {
  anomalies: AnomalyItem[];
}

export function CriticalAlerts({ anomalies }: CriticalAlertsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-slate-200">
          <ShieldAlert className="w-4 h-4 text-red-400" /> CRITICAL EVENTS & ALERTS
        </CardTitle>
        <Badge variant="red" size="sm">{anomalies.length} ACTIVE</Badge>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Preset Critical Alerts matching requirements */}
        <div className="p-3.5 rounded-lg bg-red-950/40 border border-red-800/40 flex items-start justify-between gap-3 group hover:border-red-600/60 transition-all">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="red" size="sm">CRITICAL</Badge>
              <span className="text-xs font-bold text-slate-200 font-mono">Transmission congestion R02 → R03</span>
            </div>
            <p className="text-xs text-slate-400">96% congestion probability. Thermal capacity corridor bottleneck.</p>
          </div>
          <Link href="/anomalies" className="text-slate-400 group-hover:text-red-400 p-1">
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="p-3.5 rounded-lg bg-orange-950/40 border border-orange-800/40 flex items-start justify-between gap-3 group hover:border-orange-600/60 transition-all">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="orange" size="sm">HIGH</Badge>
              <span className="text-xs font-bold text-slate-200 font-mono">Solar B17 underperforming</span>
            </div>
            <p className="text-xs text-slate-400">23 MW generation loss detected due to solar inverter thermal derating.</p>
          </div>
          <Link href="/assets/SOLAR_B17" className="text-slate-400 group-hover:text-orange-400 p-1">
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="p-3.5 rounded-lg bg-yellow-950/40 border border-yellow-800/40 flex items-start justify-between gap-3 group hover:border-yellow-600/60 transition-all">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="yellow" size="sm">HIGH</Badge>
              <span className="text-xs font-bold text-slate-200 font-mono">Demand spike predicted</span>
            </div>
            <p className="text-xs text-slate-400">91% probability at 18:15. Expected load surge to 18.7 GW.</p>
          </div>
          <Link href="/forecasts" className="text-slate-400 group-hover:text-yellow-400 p-1">
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

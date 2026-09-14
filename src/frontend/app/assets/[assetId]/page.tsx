'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { RootCausePanel } from '@/components/dashboard/RootCausePanel';
import { Sun, ArrowLeft, Activity, ShieldAlert, Cpu, Thermometer, Zap } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function AssetDetailPage() {
  const params = useParams();
  const assetId = (params?.assetId as string) || 'SOLAR_B17';

  const { data: asset } = useQuery({ queryKey: ['asset', assetId], queryFn: () => api.getAsset(assetId) });
  const { data: rca } = useQuery({ queryKey: ['rca', assetId], queryFn: () => api.getRCA(assetId) });

  if (!asset) return null;

  return (
    <PageContainer className="space-y-6">
      {/* Back Button & Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 font-mono">
        <div className="flex items-center gap-4">
          <Link href="/assets">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Assets
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-slate-100">{asset.asset_id}</h1>
              <Badge variant={asset.status === 'NORMAL' ? 'green' : 'yellow'} size="md">
                {asset.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-400">{asset.asset_name} | Region: {asset.region_id}</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 block">Health Score</span>
          <span className="text-2xl font-extrabold text-orange-400">{asset.health_score} / 100</span>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono text-xs">
        <Card className="p-4 space-y-1">
          <span className="text-slate-400 uppercase tracking-wider block">Installed Capacity</span>
          <span className="text-xl font-extrabold text-slate-100">{asset.capacity_mw} MW</span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-slate-400 uppercase tracking-wider block">Expected Output</span>
          <span className="text-xl font-extrabold text-slate-200">{asset.expected_output_mw} MW</span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-slate-400 uppercase tracking-wider block">Actual Output</span>
          <span className="text-xl font-extrabold text-orange-400">{asset.actual_output_mw} MW</span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-slate-400 uppercase tracking-wider block">Generation Deficit</span>
          <span className="text-xl font-extrabold text-red-400">{asset.variance_mw} MW</span>
        </Card>
      </div>

      {/* Telemetry Charts & Root Cause Diagnosis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-time Telemetry Metrics Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-slate-200">
              <Activity className="w-4 h-4 text-cyan-400" /> INSTRUMENTATION TELEMETRY
            </CardTitle>
            <Badge variant="blue" size="sm">LIVE DIAGNOSTICS</Badge>
          </CardHeader>

          <CardContent className="space-y-4 font-mono text-xs">
            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-red-400" /> Inverter Temperature:
              </span>
              <span className="font-bold text-red-400 text-sm">84.2 °C (Limit: 75°C)</span>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-yellow-400" /> Inverter Efficiency:
              </span>
              <span className="font-bold text-yellow-400 text-sm">78.4 % (Normal: 98.2%)</span>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" /> Terminal Voltage:
              </span>
              <span className="font-bold text-slate-200 text-sm">32.8 kV (Nominal: 33.0 kV)</span>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" /> Actuator Mechanical Vibration:
              </span>
              <span className="font-bold text-emerald-400 text-sm">0.42 mm/s (Nominal)</span>
            </div>
          </CardContent>
        </Card>

        {/* RCA Diagnosis Panel */}
        {rca && <RootCausePanel rca={rca} />}
      </div>
    </PageContainer>
  );
}

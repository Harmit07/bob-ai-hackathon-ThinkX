'use client';

import React from 'react';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Zap, ArrowRight, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';

export default function DemoPage() {
  return (
    <PageContainer className="space-y-6 font-mono">
      {/* Hackathon Judge Banner */}
      <div className="p-4 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
          <span className="text-sm font-bold">HACKATHON DEMO MODE — 30-SECOND EXECUTIVE OVERVIEW</span>
        </div>
        <Link href="/dashboard">
          <Button variant="primary" size="sm">
            Launch Full Dashboard <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* High-Impact 30-Second Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-red-900/40 bg-slate-900">
          <CardHeader>
            <CardTitle className="text-slate-200">GRID STRESS</CardTitle>
            <Badge variant="red" size="sm">CRITICAL</Badge>
          </CardHeader>
          <CardContent>
            <span className="text-5xl font-extrabold text-red-400">84</span>
            <span className="text-sm text-slate-400 block mt-1">/ 100 System Risk Index</span>
          </CardContent>
        </Card>

        <Card className="border-orange-900/40 bg-slate-900">
          <CardHeader>
            <CardTitle className="text-slate-200">PEAK DEMAND</CardTitle>
            <Badge variant="orange" size="sm">18:15 WINDOW</Badge>
          </CardHeader>
          <CardContent>
            <span className="text-5xl font-extrabold text-orange-400">18.7 GW</span>
            <span className="text-sm text-slate-400 block mt-1">91% Spike Probability</span>
          </CardContent>
        </Card>

        <Card className="border-yellow-900/40 bg-slate-900">
          <CardHeader>
            <CardTitle className="text-slate-200">CURTAILMENT RISK</CardTitle>
            <Badge variant="yellow" size="sm">HIGH</Badge>
          </CardHeader>
          <CardContent>
            <span className="text-5xl font-extrabold text-yellow-400">820 MW</span>
            <span className="text-sm text-slate-400 block mt-1">14:40–16:10 Corridor Bottleneck</span>
          </CardContent>
        </Card>
      </div>

      {/* Diagnosis & Root Cause */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-orange-900/40">
          <CardHeader>
            <CardTitle className="text-slate-200">CRITICAL ASSET ALERT</CardTitle>
            <Badge variant="yellow" size="sm">DEGRADED</Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            <h3 className="text-2xl font-bold text-slate-100">SOLAR_B17</h3>
            <div className="grid grid-cols-3 gap-2 text-xs pt-2">
              <div><span className="text-slate-400 block">Expected:</span> 110 MW</div>
              <div><span className="text-slate-400 block">Actual:</span> 87 MW</div>
              <div><span className="text-slate-400 block">Lost:</span> <span className="text-red-400 font-bold">23 MW</span></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-cyan-900/40">
          <CardHeader>
            <CardTitle className="text-slate-200">ROOT CAUSE DIAGNOSIS</CardTitle>
            <Badge variant="blue" size="sm">91% CONFIDENCE</Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            <h3 className="text-xl font-bold text-cyan-400">INVERTER DERATING</h3>
            <p className="text-xs text-slate-300">
              Inverter thermal overload (84.2°C) degraded efficiency to 78.4%.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Optimal Actions & Outcome */}
      <Card className="border-emerald-900/40 bg-gradient-to-r from-slate-900 to-emerald-950/30">
        <CardHeader>
          <CardTitle className="text-slate-200">OR-TOOLS MILP OPTIMAL RECOMMENDATIONS</CardTitle>
          <Badge variant="green" size="sm">HUMAN APPROVAL READY</Badge>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-cyan-400 font-bold block">01 DISCHARGE BESS_03</span>
              <span className="text-slate-200 font-extrabold text-base">350 MW</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-cyan-400 font-bold block">02 DEMAND RESPONSE</span>
              <span className="text-slate-200 font-extrabold text-base">180 MW</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-cyan-400 font-bold block">03 INTERCHANGE TRANSFER</span>
              <span className="text-slate-200 font-extrabold text-base">150 MW</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-xs space-y-1">
            <span className="text-slate-400 font-bold block">EXPECTED OUTCOME UPON OPERATOR APPROVAL:</span>
            <p className="text-emerald-400 font-bold text-sm">
              Curtailment ↓ (820 MW → 230 MW) | Reserve Margin ↑ (-0.4 GW → +0.8 GW) | Grid Risk ↓ (HIGH → LOW)
            </p>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AnomalyItem } from '@/types/anomaly';
import { AlertTriangle, Filter, Search, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AnomaliesPage() {
  const { data: anomalies } = useQuery({ queryKey: ['anomalies'], queryFn: () => api.getAnomalies() });
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');

  const filtered = (anomalies || []).filter((a: AnomalyItem) => {
    return selectedSeverity === 'ALL' || a.severity === selectedSeverity;
  });

  return (
    <PageContainer className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 font-mono tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-400" /> ANOMALY DETECTOR & EVENT LOG
          </h1>
          <p className="text-xs text-slate-400 mt-1">Isolation Forest + Z-Score real-time grid telemetry anomaly detection.</p>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 outline-none cursor-pointer font-medium"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
        </div>
      </div>

      {/* Anomalies Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-slate-200">
            DETECTED ANOMALIES ({filtered.length})
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0 font-mono text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/90 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="p-3.5 pl-5">SEVERITY</th>
                  <th className="p-3.5">ASSET / NODE</th>
                  <th className="p-3.5">FAULT TYPE</th>
                  <th className="p-3.5">SCORE</th>
                  <th className="p-3.5">EXPECTED</th>
                  <th className="p-3.5">ACTUAL</th>
                  <th className="p-3.5">LOST MW</th>
                  <th className="p-3.5">TIMESTAMP</th>
                  <th className="p-3.5 pr-5 text-right">DIAGNOSTICS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((a: AnomalyItem) => (
                  <tr key={a.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="p-3.5 pl-5">
                      <Badge variant={a.severity === 'CRITICAL' ? 'red' : 'orange'} size="sm">
                        {a.severity}
                      </Badge>
                    </td>
                    <td className="p-3.5 font-bold text-slate-100">{a.node_id}</td>
                    <td className="p-3.5 text-orange-400 font-semibold">{a.fault_type}</td>
                    <td className="p-3.5 font-bold text-slate-200">{a.anomaly_score}</td>
                    <td className="p-3.5 text-slate-400">{a.expected_mw ? `${a.expected_mw} MW` : 'N/A'}</td>
                    <td className="p-3.5 text-slate-200">{a.actual_mw ? `${a.actual_mw} MW` : 'N/A'}</td>
                    <td className="p-3.5 text-red-400 font-bold">{a.lost_mw ? `-${a.lost_mw} MW` : 'N/A'}</td>
                    <td className="p-3.5 text-slate-400">{a.timestamp}</td>
                    <td className="p-3.5 pr-5 text-right">
                      <Link
                        href={`/assets/${a.node_id}`}
                        className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-bold"
                      >
                        <span>Investigate</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
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

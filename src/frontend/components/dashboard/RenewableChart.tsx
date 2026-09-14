'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ForecastPoint } from '@/types/forecast';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceArea,
} from 'recharts';
import { Sun, Wind, Zap, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface RenewableChartProps {
  data: ForecastPoint[];
  title?: string;
  type?: 'solar' | 'wind' | 'combined';
}

export function RenewableChart({ data, title, type = 'solar' }: RenewableChartProps) {
  const chartData = (data || []).map((d) => ({
    time: d.timestamp,
    Expected: d.predicted_mw / 1000,
    Actual: d.actual !== undefined ? d.actual / 1000 : null,
    Gap: d.actual !== undefined ? (d.predicted_mw - d.actual) / 1000 : 0,
  }));

  const strokeColor = type === 'solar' ? '#eab308' : type === 'wind' ? '#3b82f6' : '#10b981';
  const defaultTitle = type === 'solar' ? 'SOLAR GENERATION FORECAST' : type === 'wind' ? 'WIND GENERATION FORECAST' : 'RENEWABLE GENERATION FORECAST';
  const IconComponent = type === 'solar' ? Sun : type === 'wind' ? Wind : Zap;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950/95 border border-slate-700/80 p-3 rounded-lg shadow-xl font-mono text-xs space-y-1">
          <p className="font-bold text-slate-200 border-b border-slate-800 pb-1 mb-1">Time: {label}</p>
          {payload.map((p: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between gap-4">
              <span className="text-slate-400 capitalize">{p.name}:</span>
              <span className="font-bold" style={{ color: p.color }}>
                {typeof p.value === 'number' ? `${p.value.toFixed(2)} GW` : 'N/A'}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-slate-200">
          <IconComponent className={`w-4 h-4 ${type === 'solar' ? 'text-yellow-400' : type === 'wind' ? 'text-blue-400' : 'text-emerald-400'}`} />
          {title || defaultTitle}
        </CardTitle>
        <Badge variant={type === 'solar' ? 'yellow' : 'blue'} size="sm">
          {type === 'solar' ? (
            <>
              <AlertTriangle className="w-3 h-3 mr-1" /> Lost Output: -23 MW (SOLAR_B17 Derating)
            </>
          ) : (
            <>Highland Corridor Stable (98% Availability)</>
          )}
        </Badge>
      </CardHeader>

      <CardContent className="p-4">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} unit=" GW" domain={[0, type === 'solar' ? 7 : 8]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />

              {/* Expected Generation Line */}
              <Line
                type="monotone"
                dataKey="Expected"
                stroke={strokeColor}
                strokeWidth={2.5}
                strokeDasharray="4 4"
                dot={false}
                name={`Expected ${type === 'solar' ? 'Solar' : type === 'wind' ? 'Wind' : 'Renewable'} (GW)`}
              />

              {/* Actual Generation Line */}
              <Line
                type="monotone"
                dataKey="Actual"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#10b981' }}
                name={`Actual ${type === 'solar' ? 'Solar' : type === 'wind' ? 'Wind' : 'Renewable'} (GW)`}
              />

              {/* Highlight Derating Window for Solar */}
              {type === 'solar' && (
                <ReferenceArea
                  x1="14:00"
                  x2="15:00"
                  fill="#ef4444"
                  fillOpacity={0.15}
                  stroke="#ef4444"
                  strokeDasharray="3 3"
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ForecastPoint } from '@/types/forecast';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceDot,
} from 'recharts';
import { TrendingUp, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface ForecastChartProps {
  data: ForecastPoint[];
}

export function ForecastChart({ data }: ForecastChartProps) {
  const chartData = data.map((d) => ({
    time: d.timestamp,
    Actual: d.actual !== undefined ? d.actual / 1000 : null, // convert MW to GW
    Forecast: d.predicted_mw / 1000,
    UpperBound: d.upper_bound / 1000,
    LowerBound: d.lower_bound / 1000,
    ConfidenceRange: [d.lower_bound / 1000, d.upper_bound / 1000],
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950/95 border border-slate-700/80 p-3 rounded-lg shadow-xl font-mono text-xs space-y-1">
          <p className="font-bold text-slate-200 border-b border-slate-800 pb-1 mb-1">Time: {label}</p>
          {payload.map((p: any, idx: number) => {
            if (p.dataKey === 'ConfidenceRange') return null;
            return (
              <div key={idx} className="flex items-center justify-between gap-4">
                <span className="text-slate-400 capitalize">{p.name}:</span>
                <span className="font-bold" style={{ color: p.color }}>
                  {typeof p.value === 'number' ? `${p.value.toFixed(2)} GW` : 'N/A'}
                </span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-slate-200">
          <TrendingUp className="w-4 h-4 text-cyan-400" /> DEMAND FORECAST (24-HOUR HORIZON)
        </CardTitle>
        <Badge variant="orange" size="sm">
          <AlertTriangle className="w-3 h-3 mr-1" /> Expected Peak: 18.7 GW @ 18:15
        </Badge>
      </CardHeader>

      <CardContent className="p-4">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="confidenceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} unit=" GW" domain={[10, 22]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />

              {/* Shaded Confidence Band */}
              <Area
                type="monotone"
                dataKey="ConfidenceRange"
                stroke="none"
                fill="url(#confidenceGrad)"
                name="Confidence Interval (95%)"
              />

              {/* Actual Load Line */}
              <Line
                type="monotone"
                dataKey="Actual"
                stroke="#38bdf8"
                strokeWidth={2.5}
                dot={{ r: 3 }}
                name="Actual Load (GW)"
              />

              {/* Forecast Line */}
              <Line
                type="monotone"
                dataKey="Forecast"
                stroke="#f97316"
                strokeWidth={2.5}
                strokeDasharray="4 4"
                dot={{ r: 4, fill: '#f97316' }}
                name="Predicted Forecast (GW)"
              />

              {/* Peak Marker Dot */}
              <ReferenceDot
                x="18:15"
                y={18.7}
                r={6}
                fill="#ef4444"
                stroke="#ffffff"
                strokeWidth={2}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

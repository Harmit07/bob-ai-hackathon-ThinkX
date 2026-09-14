'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ForecastChart } from '@/components/dashboard/ForecastChart';
import { RenewableChart } from '@/components/dashboard/RenewableChart';
import { TrendingUp, Cpu, Activity, Clock } from 'lucide-react';

export default function ForecastsPage() {
  const [activeTab, setActiveTab] = useState<'demand' | 'solar' | 'wind'>('demand');
  const { data: forecasts } = useQuery({ queryKey: ['forecasts'], queryFn: () => api.getForecasts() });

  return (
    <PageContainer className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 font-mono tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-cyan-400" /> PREDICTIVE FORECASTING ENGINE
          </h1>
          <p className="text-xs text-slate-400 mt-1">24-hour horizon ML load & renewable power generation forecasting.</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 font-mono text-xs">
          <button
            onClick={() => setActiveTab('demand')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'demand' ? 'bg-cyan-950 text-cyan-400 border border-cyan-600/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            DEMAND
          </button>

          <button
            onClick={() => setActiveTab('solar')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'solar' ? 'bg-yellow-950 text-yellow-400 border border-yellow-600/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            SOLAR
          </button>

          <button
            onClick={() => setActiveTab('wind')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'wind' ? 'bg-blue-950 text-blue-400 border border-blue-600/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            WIND
          </button>
        </div>
      </div>

      {/* Model Metrics Card Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
        <Card className="p-4 space-y-1">
          <span className="text-slate-400 uppercase tracking-wider block">MAE Error</span>
          <span className="text-xl font-extrabold text-emerald-400">1.42 MW</span>
          <span className="text-[10px] text-slate-500 block">Mean Absolute Error</span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-slate-400 uppercase tracking-wider block">RMSE</span>
          <span className="text-xl font-extrabold text-cyan-400">2.73 MW</span>
          <span className="text-[10px] text-slate-500 block">Root Mean Square Error</span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-slate-400 uppercase tracking-wider block">MAPE</span>
          <span className="text-xl font-extrabold text-emerald-400">1.18%</span>
          <span className="text-[10px] text-slate-500 block">Mean Percentage Error</span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-slate-400 uppercase tracking-wider block">Model Confidence</span>
          <span className="text-xl font-extrabold text-yellow-400">96.22%</span>
          <span className="text-[10px] text-slate-500 block">R² Variance Score</span>
        </Card>
      </div>

      {/* Primary Chart Area */}
      <div className="grid grid-cols-1 gap-6">
        {activeTab === 'demand' && forecasts?.demand && (
          <ForecastChart data={forecasts.demand} />
        )}

        {activeTab === 'solar' && (forecasts?.solar || forecasts?.renewable) && (
          <RenewableChart
            data={forecasts.solar || forecasts.renewable}
            type="solar"
            title="SOLAR POWER GENERATION FORECAST (24 HOURS)"
          />
        )}

        {activeTab === 'wind' && (forecasts?.wind || forecasts?.renewable) && (
          <RenewableChart
            data={forecasts.wind || forecasts.renewable}
            type="wind"
            title="WIND POWER GENERATION FORECAST (24 HOURS)"
          />
        )}
      </div>


      {/* Detailed Forecast Specs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-slate-200">
            <Cpu className="w-4 h-4 text-cyan-400" /> MODEL SPECIFICATIONS & PARAMETERS
          </CardTitle>
          <Badge variant="blue" size="sm">HistGradientBoostingRegressor</Badge>
        </CardHeader>
        <CardContent className="font-mono text-xs space-y-3">
          <p className="text-slate-300">
            Trained on <strong>43,800 hourly grid demand records</strong> and <strong>183,960 renewable generation records</strong> from 2026 GridPilot synthetic grid dataset.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-400">
            <div>• Features: Temperature, Humidity, Hour, DayOfWeek, Lags</div>
            <div>• Target: Load MW / Generation MW</div>
            <div>• Uncertainty Bounds: 95% Confidence Band</div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

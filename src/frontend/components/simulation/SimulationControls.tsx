'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SimulationParams } from '@/types/simulation';
import { PlayCircle, Sliders, RotateCcw } from 'lucide-react';

interface SimulationControlsProps {
  onRunSimulation: (params: SimulationParams) => void;
  isLoading?: boolean;
}

export function SimulationControls({ onRunSimulation, isLoading }: SimulationControlsProps) {
  const [params, setParams] = useState<SimulationParams>({
    demand_change_pct: 10,
    solar_change_pct: -20,
    wind_change_pct: 0,
    battery_available: true,
    transmission_capacity_change_pct: -15,
  });

  const handleReset = () => {
    setParams({
      demand_change_pct: 0,
      solar_change_pct: 0,
      wind_change_pct: 0,
      battery_available: true,
      transmission_capacity_change_pct: 0,
    });
  };

  return (
    <Card className="col-span-1 lg:col-span-1 border-cyan-950/40">
      <CardHeader>
        <CardTitle className="text-slate-200">
          <Sliders className="w-4 h-4 text-cyan-400" /> SIMULATION CONTROLS
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs text-slate-400 hover:text-slate-200">
          <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset
        </Button>
      </CardHeader>

      <CardContent className="space-y-5 font-mono text-xs">
        {/* Demand Change Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-400">Demand Change:</span>
            <span className={`font-bold ${params.demand_change_pct > 0 ? 'text-orange-400' : 'text-emerald-400'}`}>
              {params.demand_change_pct >= 0 ? '+' : ''}{params.demand_change_pct}%
            </span>
          </div>
          <input
            type="range"
            min="-20"
            max="20"
            step="1"
            value={params.demand_change_pct}
            onChange={(e) => setParams({ ...params, demand_change_pct: Number(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>-20%</span>
            <span>0%</span>
            <span>+20%</span>
          </div>
        </div>

        {/* Solar Generation Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-400">Solar Generation:</span>
            <span className={`font-bold ${params.solar_change_pct < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {params.solar_change_pct >= 0 ? '+' : ''}{params.solar_change_pct}%
            </span>
          </div>
          <input
            type="range"
            min="-30"
            max="30"
            step="1"
            value={params.solar_change_pct}
            onChange={(e) => setParams({ ...params, solar_change_pct: Number(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>-30%</span>
            <span>0%</span>
            <span>+30%</span>
          </div>
        </div>

        {/* Wind Generation Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-400">Wind Generation:</span>
            <span className={`font-bold ${params.wind_change_pct < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {params.wind_change_pct >= 0 ? '+' : ''}{params.wind_change_pct}%
            </span>
          </div>
          <input
            type="range"
            min="-30"
            max="30"
            step="1"
            value={params.wind_change_pct}
            onChange={(e) => setParams({ ...params, wind_change_pct: Number(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>-30%</span>
            <span>0%</span>
            <span>+30%</span>
          </div>
        </div>

        {/* Transmission Capacity Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-400">Transmission Capacity:</span>
            <span className={`font-bold ${params.transmission_capacity_change_pct < 0 ? 'text-orange-400' : 'text-emerald-400'}`}>
              {params.transmission_capacity_change_pct >= 0 ? '+' : ''}{params.transmission_capacity_change_pct}%
            </span>
          </div>
          <input
            type="range"
            min="-30"
            max="30"
            step="1"
            value={params.transmission_capacity_change_pct}
            onChange={(e) => setParams({ ...params, transmission_capacity_change_pct: Number(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>-30%</span>
            <span>0%</span>
            <span>+30%</span>
          </div>
        </div>

        {/* Battery Available Toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
          <span className="text-slate-300">BESS Battery Availability:</span>
          <button
            type="button"
            onClick={() => setParams({ ...params, battery_available: !params.battery_available })}
            className={`px-3 py-1 rounded-md font-bold transition-all ${
              params.battery_available
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-600/40'
                : 'bg-red-950 text-red-400 border border-red-600/40'
            }`}
          >
            {params.battery_available ? 'Available' : 'Unavailable'}
          </button>
        </div>

        {/* Run Simulation Button */}
        <Button
          variant="primary"
          size="lg"
          isLoading={isLoading}
          onClick={() => onRunSimulation(params)}
          className="w-full shadow-lg shadow-cyan-950/50"
        >
          <PlayCircle className="w-4 h-4" /> RUN WHAT-IF SIMULATION
        </Button>
      </CardContent>
    </Card>
  );
}

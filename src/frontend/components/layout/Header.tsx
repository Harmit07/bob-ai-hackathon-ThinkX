'use client';

import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, MapPin, Clock, ChevronDown, Check } from 'lucide-react';
import { REGIONS } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { useRegion } from '@/context/RegionContext';

interface HeaderProps {
  onRefresh?: () => void;
}

export function Header({ onRefresh }: HeaderProps) {
  const { selectedRegion, setSelectedRegion } = useRegion();
  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('Live');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString());
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    if (onRefresh) onRefresh();
    setTimeout(() => {
      setLastUpdated(new Date().toLocaleTimeString());
      setIsRefreshing(false);
    }, 600);
  };

  const currentRegionName = REGIONS.find((r) => r.id === selectedRegion)?.name || 'All Regions';

  return (
    <header className="h-16 bg-slate-950/80 border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
      {/* Title & Region */}
      <div className="flex items-center gap-6">
        <div>
          <h2 className="text-sm font-bold text-slate-100 tracking-wide font-mono">GRIDPILOT AI</h2>
          <p className="text-xs text-slate-400">Grid Operations Copilot</p>
        </div>

        {/* Custom Region Selector Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 hover:border-cyan-500/60 rounded-xl px-3.5 py-1.5 text-xs text-slate-200 font-mono transition-all shadow-sm cursor-pointer select-none"
          >
            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="font-semibold text-slate-200">Region: {currentRegionName}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-cyan-400' : ''}`} />
          </button>

          {/* Dropdown Menu Popover */}
          {isOpen && (
            <div className="absolute left-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 py-1 font-mono text-xs overflow-hidden animate-in fade-in duration-150 shadow-cyan-950/40">
              <div className="px-3 py-1.5 text-[10px] text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                Select Grid Region
              </div>
              {REGIONS.map((r) => {
                const isSelected = r.id === selectedRegion;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setSelectedRegion(r.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/60 text-cyan-300 font-bold border-l-2 border-cyan-400'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-slate-100'
                    }`}
                  >
                    <span>{r.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800/60">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Mode: Live / Simulated</span>
          <span className="text-slate-600">|</span>
          <span suppressHydrationWarning>Updated: {lastUpdated}</span>
        </div>

        {/* System Online Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 font-semibold tracking-wide uppercase">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          SYSTEM ONLINE
        </div>

        {/* Refresh Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="text-slate-300 border-slate-700/80 hover:bg-slate-800 font-mono"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          Refresh
        </Button>
      </div>
    </header>
  );
}

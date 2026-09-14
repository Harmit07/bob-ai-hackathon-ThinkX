'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PageContainer } from '@/components/layout/PageContainer';
import { AssetTable } from '@/components/assets/AssetTable';
import { Boxes } from 'lucide-react';
import { useRegion } from '@/context/RegionContext';

export default function AssetsPage() {
  const { selectedRegion } = useRegion();
  const { data: assets } = useQuery({ queryKey: ['assets'], queryFn: () => api.getAssets() });

  const filteredAssets = (assets || []).filter((a) => {
    if (selectedRegion === 'ALL') return true;
    return a.region_id === selectedRegion;
  });

  return (
    <PageContainer className="space-y-6">
      {/* Title */}
      <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 font-mono tracking-tight flex items-center gap-2">
            <Boxes className="w-6 h-6 text-cyan-400" /> ASSETS MASTER INVENTORY
          </h1>
          <p className="text-xs text-slate-400 mt-1">Grid assets telemetry, health scores, and operational statuses across 5 regions.</p>
        </div>
        {selectedRegion !== 'ALL' && (
          <div className="px-3 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 text-xs font-mono font-bold">
            Filtered: Region {selectedRegion}
          </div>
        )}
      </div>

      <AssetTable assets={filteredAssets} />
    </PageContainer>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { GridAsset } from '@/types/asset';
import { Search, Filter, ArrowRight, Boxes } from 'lucide-react';

interface AssetTableProps {
  assets: GridAsset[];
}

export function AssetTable({ assets }: AssetTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const filtered = assets.filter((asset) => {
    const matchesSearch = asset.asset_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          asset.asset_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'ALL' || asset.asset_type === selectedType;
    const matchesStatus = selectedStatus === 'ALL' || asset.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <Card>
      <CardHeader className="flex-col sm:flex-row gap-4 items-start sm:items-center">
        <CardTitle className="text-slate-200">
          <Boxes className="w-4 h-4 text-cyan-400" /> GRID ASSETS MASTER INVENTORY ({filtered.length})
        </CardTitle>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto text-xs font-mono">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search asset..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-slate-200 outline-none focus:border-cyan-500"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 outline-none cursor-pointer"
          >
            <option value="ALL">All Types</option>
            <option value="solar">Solar</option>
            <option value="wind">Wind</option>
            <option value="battery">Battery</option>
            <option value="thermal">Thermal</option>
            <option value="hydro">Hydro</option>
            <option value="substation">Substation</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="NORMAL">NORMAL</option>
            <option value="DEGRADED">DEGRADED</option>
            <option value="OFFLINE">OFFLINE</option>
          </select>
        </div>
      </CardHeader>

      <CardContent className="p-0 font-mono text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/90 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="p-3.5 pl-5">ASSET ID</th>
                <th className="p-3.5">NAME</th>
                <th className="p-3.5">TYPE</th>
                <th className="p-3.5">REGION</th>
                <th className="p-3.5">CAPACITY</th>
                <th className="p-3.5">HEALTH</th>
                <th className="p-3.5">STATUS</th>
                <th className="p-3.5">EXPECTED</th>
                <th className="p-3.5">ACTUAL</th>
                <th className="p-3.5">VARIANCE</th>
                <th className="p-3.5 pr-5 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((asset) => {
                const isDegraded = asset.status === 'DEGRADED';
                return (
                  <tr key={asset.asset_id} className={`hover:bg-slate-900/60 transition-colors ${isDegraded ? 'bg-orange-950/20' : ''}`}>
                    <td className="p-3.5 pl-5 font-bold text-slate-100">{asset.asset_id}</td>
                    <td className="p-3.5 text-slate-300 font-sans">{asset.asset_name}</td>
                    <td className="p-3.5 capitalize text-slate-400">{asset.asset_type}</td>
                    <td className="p-3.5 text-slate-400">{asset.region_id}</td>
                    <td className="p-3.5 text-slate-200">{asset.capacity_mw} MW</td>
                    <td className="p-3.5 font-bold">
                      <span className={asset.health_score < 80 ? 'text-orange-400' : 'text-emerald-400'}>
                        {asset.health_score} / 100
                      </span>
                    </td>
                    <td className="p-3.5">
                      <Badge variant={asset.status === 'NORMAL' ? 'green' : 'yellow'} size="sm">
                        {asset.status}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-slate-300">{asset.expected_output_mw} MW</td>
                    <td className="p-3.5 font-bold text-slate-100">{asset.actual_output_mw} MW</td>
                    <td className={`p-3.5 font-bold ${asset.variance_mw < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                      {asset.variance_mw} MW
                    </td>
                    <td className="p-3.5 pr-5 text-right">
                      <Link
                        href={`/assets/${asset.asset_id}`}
                        className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-bold"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

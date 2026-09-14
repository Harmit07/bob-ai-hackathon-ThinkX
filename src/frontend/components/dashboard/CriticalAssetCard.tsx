import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { GridAsset } from '@/types/asset';
import { Sun, ArrowRight, AlertTriangle } from 'lucide-react';

interface CriticalAssetCardProps {
  asset: GridAsset;
}

export function CriticalAssetCard({ asset }: CriticalAssetCardProps) {
  return (
    <Card className="border-orange-900/40 bg-gradient-to-br from-slate-900 via-slate-900 to-orange-950/20">
      <CardHeader>
        <CardTitle className="text-slate-200">
          <Sun className="w-4 h-4 text-orange-400" /> CRITICAL ASSET ALERT
        </CardTitle>
        <Badge variant="yellow" size="sm">{asset.status}</Badge>
      </CardHeader>

      <CardContent className="space-y-4 font-mono">
        <div>
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-bold text-slate-100">{asset.asset_id}</h4>
            <span className="text-xs text-slate-400">{asset.asset_name}</span>
          </div>
          <span className="text-xs text-orange-400">Region: {asset.region_id} | Health: {asset.health_score} / 100</span>
        </div>

        <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block mb-1">Expected</span>
            <span className="font-bold text-slate-200">{asset.expected_output_mw} MW</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-1">Actual</span>
            <span className="font-bold text-orange-400">{asset.actual_output_mw} MW</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-1">Lost Gen</span>
            <span className="font-bold text-red-400">{asset.variance_mw} MW</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <span className="text-slate-400">Performance Efficiency:</span>
          <span className="font-bold text-yellow-400">{asset.performance_pct}%</span>
        </div>

        <Link href={`/assets/${asset.asset_id}`} className="block pt-2">
          <Button variant="secondary" size="sm" className="w-full justify-between">
            <span>VIEW ASSET DIAGNOSTICS</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

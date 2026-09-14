'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  TrendingUp,
  Boxes,
  AlertTriangle,
  Sliders,
  PlayCircle,
  CheckCircle2,
  Activity,
  Cpu,
  Radio,
  Zap,
} from 'lucide-react';
import { APP_NAME, TAGLINE } from '@/lib/constants';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Forecasts', href: '/forecasts', icon: TrendingUp },
  { name: 'Assets', href: '/assets', icon: Boxes },
  { name: 'Anomalies', href: '/anomalies', icon: AlertTriangle },
  { name: 'Optimization', href: '/optimization', icon: Sliders },
  { name: 'What-If Simulation', href: '/simulation', icon: PlayCircle },
  { name: 'Recommendations', href: '/recommendations', icon: CheckCircle2 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      {/* Top Branding */}
      <div>
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-md shadow-cyan-950">
            <Zap className="w-5 h-5 fill-cyan-400" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-wider text-slate-100 font-mono">{APP_NAME}</h1>
            <p className="text-[10px] text-slate-400 font-medium leading-tight">Control Center</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-500/40 shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* System Status Section */}
      <div className="p-4 m-3 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" /> Model Status
          </span>
          <span className="text-emerald-400 font-semibold">Active</span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-cyan-400" /> Backend API
          </span>
          <span className="text-cyan-400 font-semibold">FastAPI</span>
        </div>
        <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 leading-tight">
          MILP Unit Commitment: <strong className="text-slate-300">OR-Tools CBC</strong>
        </div>
      </div>
    </aside>
  );
}

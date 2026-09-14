export function formatMW(mw: number): string {
  if (Math.abs(mw) >= 1000) {
    return `${(mw / 1000).toFixed(1)} GW`;
  }
  return `${mw.toLocaleString('en-US', { maximumFractionDigits: 1 })} MW`;
}

export function formatGW(gw: number): string {
  const sign = gw > 0 ? "+" : "";
  return `${sign}${gw.toFixed(1)} GW`;
}

export function formatUSD(usd: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(usd);
}

export function formatPct(val: number): string {
  return `${val.toFixed(1)}%`;
}

export function getRiskColor(level: string): { text: string; bg: string; border: string } {
  switch (level.toUpperCase()) {
    case 'CRITICAL':
    case 'HIGH_RISK':
      return { text: 'text-red-400', bg: 'bg-red-950/60', border: 'border-red-600/40' };
    case 'HIGH':
    case 'ELEVATED_RISK':
    case 'CONGESTED':
      return { text: 'text-orange-400', bg: 'bg-orange-950/60', border: 'border-orange-600/40' };
    case 'MODERATE':
    case 'MEDIUM':
    case 'WARNING':
    case 'DEGRADED':
      return { text: 'text-yellow-400', bg: 'bg-yellow-950/60', border: 'border-yellow-600/40' };
    case 'LOW':
    case 'NORMAL':
    case 'ONLINE':
      return { text: 'text-emerald-400', bg: 'bg-emerald-950/60', border: 'border-emerald-600/40' };
    default:
      return { text: 'text-blue-400', bg: 'bg-blue-950/60', border: 'border-blue-600/40' };
  }
}

export function severityColor(severity: string): string {
  switch (severity) {
    case 'critical': return 'text-red-400'
    case 'high':     return 'text-orange-400'
    case 'medium':   return 'text-yellow-400'
    case 'low':      return 'text-blue-400'
    default:         return 'text-green-400'
  }
}

export function severityBg(severity: string): string {
  switch (severity) {
    case 'critical': return 'bg-red-900/40 border-red-500'
    case 'high':     return 'bg-orange-900/40 border-orange-500'
    case 'medium':   return 'bg-yellow-900/40 border-yellow-500'
    case 'low':      return 'bg-blue-900/40 border-blue-500'
    default:         return 'bg-green-900/40 border-green-500'
  }
}

export function fmt(val: number | undefined, decimals = 0): string {
  if (val === undefined || val === null) return '—'
  return val.toFixed(decimals)
}

export function formatTs(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

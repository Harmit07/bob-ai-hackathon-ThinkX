import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { Sun, Wind, AlertTriangle } from 'lucide-react'

interface PerformanceBarProps {
  icon: React.ReactNode
  label: string
  actual: number
  expected: number
}

function PerformanceBar({ icon, label, actual, expected }: PerformanceBarProps) {
  const pct = expected > 10 ? Math.min(100, (actual / expected) * 100) : 100
  const variant: 'green' | 'yellow' | 'orange' | 'red' =
    pct >= 95 ? 'green' : pct >= 80 ? 'yellow' : pct >= 60 ? 'orange' : 'red'
  const statusLabel = pct >= 95 ? 'Optimal' : pct >= 80 ? 'Minor Deviation' : pct >= 60 ? 'Underperforming' : 'Critical'
  const badgeVariant: 'green' | 'yellow' | 'orange' | 'red' = variant

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-200 font-mono">
          {icon}
          {label}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-extrabold font-mono" style={{
            color: pct >= 95 ? '#34d399' : pct >= 80 ? '#facc15' : pct >= 60 ? '#fb923c' : '#f87171'
          }}>
            {Math.round(pct)}%
          </span>
          <Badge variant={badgeVariant} size="sm">{statusLabel}</Badge>
        </div>
      </div>
      <Progress value={pct} variant={variant} size="md" />
      <div className="flex justify-between text-xs font-mono text-slate-400">
        <span>Actual: <span className="text-slate-200 font-bold">{Math.round(actual)} MW</span></span>
        <span>Expected: <span className="text-slate-200 font-bold">{Math.round(expected)} MW</span></span>
        {expected > actual && (
          <span className="text-orange-400 font-bold">−{Math.round(expected - actual)} MW deficit</span>
        )}
      </div>
    </div>
  )
}

interface Props { data: any }

export default function UnderperformancePanel({ data }: Props) {
  if (!data) return null

  const solar  = data.solar  || {}
  const wind   = data.wind   || {}
  const alerts = data.alerts || []
  const perf   = data.overall_performance || 'normal'
  const perfVariant: 'green' | 'yellow' | 'red' =
    perf === 'normal' ? 'green' : perf === 'degraded' ? 'yellow' : 'red'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-slate-200">
          <AlertTriangle className="w-4 h-4 text-yellow-400" />
          RENEWABLE ASSET PERFORMANCE
        </CardTitle>
        <Badge variant={perfVariant} size="sm">{perf.toUpperCase()}</Badge>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Solar bar */}
        <PerformanceBar
          icon={<Sun className="w-4 h-4 text-yellow-400" />}
          label="Solar Fleet"
          actual={solar.actual_mw  || 0}
          expected={solar.expected_mw || 0}
        />

        {/* Wind bar */}
        <PerformanceBar
          icon={<Wind className="w-4 h-4 text-cyan-400" />}
          label="Wind Fleet"
          actual={wind.actual_mw  || 0}
          expected={wind.expected_mw || 0}
        />

        {/* Alert items */}
        {alerts.length > 0 && (
          <div className="space-y-2 pt-1 border-t border-slate-800/80">
            {alerts.map((a: any, i: number) => (
              <div
                key={i}
                className="p-3 rounded-lg bg-orange-950/30 border border-orange-800/40 space-y-1"
              >
                <p className="text-xs font-bold text-orange-400 font-mono">
                  {a.asset === 'solar_fleet' ? '☀️ Solar Fleet' : '💨 Wind Fleet'} — {a.status?.replace(/_/g, ' ')}
                </p>
                <p className="text-xs text-slate-300">{a.likely_cause}</p>
                {a.deficit_mw > 0 && (
                  <p className="text-xs text-slate-500 font-mono">
                    Lost revenue:{' '}
                    <span className="text-red-400 font-bold">${(a.deficit_mw * 50).toLocaleString()}/hr</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Total deficit */}
        {data.total_deficit_mw > 0 && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-red-950/30 border border-red-800/40 text-xs font-mono">
            <span className="text-slate-400">Total generation deficit</span>
            <span className="text-red-400 font-bold text-sm">{data.total_deficit_mw} MW</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

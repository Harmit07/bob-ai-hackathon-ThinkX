import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { DollarSign, Leaf, TrendingUp, TrendingDown, Zap } from 'lucide-react'

interface Props { data: any }

interface KpiCardProps {
  icon: React.ReactNode
  label: string
  value: string
  variant: 'green' | 'red' | 'yellow' | 'blue' | 'slate'
}

function KpiCard({ icon, label, value, variant }: KpiCardProps) {
  const textColors = {
    green:  'text-emerald-400',
    red:    'text-red-400',
    yellow: 'text-yellow-400',
    blue:   'text-cyan-400',
    slate:  'text-slate-300',
  }
  return (
    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
      <div className="text-slate-500">{icon}</div>
      <p className={`text-xl font-extrabold font-mono ${textColors[variant]}`}>{value}</p>
      <p className="text-xs text-slate-500 font-mono uppercase tracking-wide">{label}</p>
    </div>
  )
}

export default function FinancialImpactPanel({ data }: Props) {
  if (!data) return null

  const costs  = data.costs_per_hour    || {}
  const value  = data.value_per_hour    || {}
  const env    = data.environmental     || {}
  const daily  = data.daily_projections || {}
  const breakdown = data.breakdown      || []

  const costsList  = breakdown.filter((b: any) => b.type === 'cost')
  const valueList  = breakdown.filter((b: any) => b.type !== 'cost')
  const maxCost    = Math.max(...costsList.map((b: any) => b.value_hr || 0), 1)
  const maxValue   = Math.max(...valueList.map( (b: any) => b.value_hr || 0), 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-slate-200">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          FINANCIAL & ENERGY IMPACT
        </CardTitle>
        <Badge variant={data.period === 'peak' ? 'orange' : 'slate'} size="sm">
          {data.period === 'peak' ? '⚡ PEAK HOURS' : 'OFF-PEAK'}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-5">

        {/* KPI grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <KpiCard
            icon={<TrendingDown className="w-4 h-4" />}
            label="Total Cost / Hour"
            value={`$${(costs.total_cost_usd || 0).toLocaleString()}`}
            variant="red"
          />
          <KpiCard
            icon={<Leaf className="w-4 h-4" />}
            label="Renewable Value / Hour"
            value={`$${(value.renewable_energy_usd || 0).toLocaleString()}`}
            variant="green"
          />
          <KpiCard
            icon={<Leaf className="w-4 h-4" />}
            label="CO₂ Avoided / Hour"
            value={`${env.carbon_avoided_tco2_hr || 0} t`}
            variant="green"
          />
          <KpiCard
            icon={<Zap className="w-4 h-4" />}
            label="Curtailment Loss / Hr"
            value={`$${(costs.curtailment_loss_usd || 0).toLocaleString()}`}
            variant="yellow"
          />
          <KpiCard
            icon={<TrendingDown className="w-4 h-4" />}
            label="Projected Daily Loss"
            value={`$${(daily.projected_curtailment_loss_usd || 0).toLocaleString()}`}
            variant="red"
          />
          <KpiCard
            icon={<TrendingUp className="w-4 h-4" />}
            label="Daily Renewable Value"
            value={`$${(daily.projected_renewable_value_usd || 0).toLocaleString()}`}
            variant="green"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Cost breakdown */}
          <div className="space-y-3">
            <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Cost Breakdown / hr</p>
            {costsList.map((b: any, i: number) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">{b.category}</span>
                  <span className="text-red-400 font-bold">${(b.value_hr || 0).toLocaleString()}</span>
                </div>
                <Progress value={(b.value_hr / maxCost) * 100} variant="red" size="sm" />
              </div>
            ))}
          </div>

          {/* Value breakdown */}
          <div className="space-y-3">
            <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Value & Opportunity / hr</p>
            {valueList.map((b: any, i: number) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">{b.category}</span>
                  <span className={`font-bold ${b.type === 'opportunity' ? 'text-cyan-400' : 'text-emerald-400'}`}>
                    ${(b.value_hr || 0).toLocaleString()}
                  </span>
                </div>
                <Progress
                  value={(b.value_hr / maxValue) * 100}
                  variant={b.type === 'opportunity' ? 'cyan' : 'green'}
                  size="sm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Market context footer */}
        <div className="flex flex-wrap gap-x-5 gap-y-1 pt-3 border-t border-slate-800/80 text-xs font-mono text-slate-500">
          <span>Spot price: <span className="text-slate-300 font-bold">${data.spot_price_per_mwh}/MWh</span></span>
          <span>Delivered: <span className="text-emerald-400 font-bold">{env.renewable_mwh_delivered} MWh/hr</span></span>
          <span>Daily CO₂ avoided: <span className="text-emerald-400 font-bold">{daily.projected_carbon_avoided_tco2} tCO₂</span></span>
        </div>
      </CardContent>
    </Card>
  )
}

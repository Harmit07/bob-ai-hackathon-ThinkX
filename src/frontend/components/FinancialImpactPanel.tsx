interface Props { data: any }

export default function FinancialImpactPanel({ data }: Props) {
  if (!data) return null
  const costs = data.costs_per_hour   || {}
  const value = data.value_per_hour   || {}
  const env   = data.environmental    || {}
  const daily = data.daily_projections || {}

  const breakdown = data.breakdown || []
  const costs_list = breakdown.filter((b: any) => b.type === 'cost')
  const value_list = breakdown.filter((b: any) => b.type !== 'cost')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="fade-in">

      {/* ── Top KPIs ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
        {[
          { icon: '💸', label: 'Total Cost / Hour',     val: `$${(costs.total_cost_usd||0).toLocaleString()}`,         col: '#f85149' },
          { icon: '💚', label: 'Renewable Value / Hour', val: `$${(value.renewable_energy_usd||0).toLocaleString()}`,   col: '#3fb950' },
          { icon: '🌱', label: 'CO₂ Avoided / Hour',    val: `${env.carbon_avoided_tco2_hr||0} t`,                     col: '#3fb950' },
          { icon: '🚫', label: 'Curtailment Loss / Hr',  val: `$${(costs.curtailment_loss_usd||0).toLocaleString()}`,   col: '#db6d28' },
          { icon: '📅', label: 'Projected Daily Loss',   val: `$${(daily.projected_curtailment_loss_usd||0).toLocaleString()}`, col: '#f85149' },
          { icon: '💰', label: 'Daily Renewable Value',  val: `$${(daily.projected_renewable_value_usd||0).toLocaleString()}`,  col: '#3fb950' },
        ].map((k, i) => (
          <div key={i} className="card" style={{ padding: '16px' }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{k.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: k.col }}>{k.val}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{k.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* ── Cost breakdown ── */}
        <div className="card">
          <div className="card-title">💸 Cost Breakdown (per hour)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {costs_list.map((b: any, i: number) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                  <span style={{ color: 'var(--text)' }}>{b.category}</span>
                  <span style={{ fontWeight: 700, color: '#f85149' }}>${(b.value_hr||0).toLocaleString()}</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${Math.min(100, (b.value_hr / Math.max(...costs_list.map((x:any)=>x.value_hr||0),1)) * 100)}%`, background: '#f85149' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Value breakdown ── */}
        <div className="card">
          <div className="card-title">💚 Value & Opportunity (per hour)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {value_list.map((b: any, i: number) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                  <span style={{ color: 'var(--text)' }}>{b.category}</span>
                  <span style={{ fontWeight: 700, color: b.type === 'opportunity' ? '#2f81f7' : '#3fb950' }}>${(b.value_hr||0).toLocaleString()}</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${Math.min(100, (b.value_hr / Math.max(...value_list.map((x:any)=>x.value_hr||0),1)) * 100)}%`, background: b.type === 'opportunity' ? '#2f81f7' : '#3fb950' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Market context ── */}
      <div className="card" style={{ padding: '14px 18px' }}>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 13 }}>
          <span style={{ color: 'var(--muted)' }}>Market period: <b style={{ color: data.period === 'peak' ? '#db6d28' : 'var(--text)' }}>{data.period === 'peak' ? '⚡ Peak Hours' : 'Off-Peak'}</b></span>
          <span style={{ color: 'var(--muted)' }}>Spot price: <b style={{ color: 'var(--text)' }}>${data.spot_price_per_mwh}/MWh</b></span>
          <span style={{ color: 'var(--muted)' }}>Renewable delivered: <b style={{ color: '#3fb950' }}>{env.renewable_mwh_delivered} MWh this hour</b></span>
          <span style={{ color: 'var(--muted)' }}>Daily CO₂ avoided: <b style={{ color: '#3fb950' }}>{daily.projected_carbon_avoided_tco2} tCO₂</b></span>
        </div>
      </div>
    </div>
  )
}

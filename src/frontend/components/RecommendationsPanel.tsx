interface Props { optimization: any }

const PRIORITY_STYLES: Record<string, { bar: string; pill: string; pillCls: string }> = {
  critical: { bar: '#f85149', pill: 'CRITICAL', pillCls: 'pill-red'    },
  high:     { bar: '#db6d28', pill: 'HIGH',     pillCls: 'pill-orange' },
  medium:   { bar: '#d29922', pill: 'MEDIUM',   pillCls: 'pill-yellow' },
  low:      { bar: '#3fb950', pill: 'LOW',       pillCls: 'pill-green'  },
}

const ACTION_ICONS: Record<string, string> = {
  increase_storage_charging:  '🔋',
  shift_flexible_loads:       '🔄',
  reduce_conventional_dispatch:'🏭',
  activate_demand_response:   '⚡',
  maintain_current_dispatch:  '✅',
}

export default function RecommendationsPanel({ optimization }: Props) {
  const recs = optimization?.recommendations || []
  const dispatch = optimization?.dispatch_plan
  const carbon = optimization?.carbon_avoided_tco2_per_hour
  const score = optimization?.renewable_utilization_score ?? 0
  const scoreColor = score > 80 ? '#3fb950' : score > 60 ? '#d29922' : '#f85149'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }} className="fade-in">

      {/* ── Dispatch summary ── */}
      {dispatch && (
        <div className="card">
          <div className="card-title">⚙️ Optimized Dispatch Plan</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 12 }}>
            {[
              { icon: '☀️', val: Math.round(dispatch.solar_dispatched_mw),        label: 'Solar MW',        color: '#d29922' },
              { icon: '💨', val: Math.round(dispatch.wind_dispatched_mw),         label: 'Wind MW',         color: '#22d3ee' },
              { icon: '🏭', val: Math.round(dispatch.conventional_dispatched_mw), label: 'Conventional MW', color: '#7d8590' },
              { icon: '🌱', val: carbon?.toFixed(2),                              label: 'tCO₂ avoided/hr', color: '#3fb950' },
            ].map((m, i) => (
              <div key={i} style={{ background: 'var(--surface2)', borderRadius: 8, padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{m.icon}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: m.color }}>{m.val}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{m.label}</div>
              </div>
            ))}
          </div>

          {/* Utilization score bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12 }}>
            <span style={{ color: 'var(--muted)' }}>Renewable Utilization Score</span>
            <span style={{ fontWeight: 700, color: scoreColor }}>{score.toFixed(0)} / 100</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${score}%`, background: scoreColor }} />
          </div>
        </div>
      )}

      {/* ── Recommendations ── */}
      <div className="card">
        <div className="card-title">💡 AI Recommendations</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {recs.map((rec: any, i: number) => {
            const ps = PRIORITY_STYLES[rec.priority] || PRIORITY_STYLES.low
            const icon = ACTION_ICONS[rec.action] || '⚡'
            return (
              <div key={i} style={{ borderLeft: `3px solid ${ps.bar}`, paddingLeft: 12, paddingTop: 4, paddingBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 18 }}>{icon}</span>
                  <span style={{ fontWeight: 600, fontSize: 14, flex: 1 }}>{rec.action.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}</span>
                  <span className={`pill ${ps.pillCls}`}>{ps.pill}</span>
                  {rec.impact_mw > 0 && (
                    <span style={{ fontSize: 12, color: '#3fb950', fontWeight: 600 }}>{rec.impact_mw} MW</span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>{rec.description}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

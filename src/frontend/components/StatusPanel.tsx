interface Props {
  snapshot: any
  advice: any
  anomalies: any
  optimization: any
}

const SEV_MAP: Record<string, { pill: string; icon: string; banner: string; label: string }> = {
  critical: { pill: 'pill-red',    icon: '🔴', banner: 'alert-critical', label: 'Critical Alert'    },
  high:     { pill: 'pill-orange', icon: '🟠', banner: 'alert-high',     label: 'High Alert'        },
  medium:   { pill: 'pill-yellow', icon: '🟡', banner: 'alert-medium',   label: 'Advisory'          },
  low:      { pill: 'pill-blue',   icon: '🔵', banner: 'alert-low',      label: 'Low Alert'         },
  normal:   { pill: 'pill-green',  icon: '🟢', banner: 'alert-normal',   label: 'Normal Operations' },
}

function KpiCard({ icon, value, unit, label, sub, color }: {
  icon: string; value: string; unit: string; label: string; sub?: string; color?: string
}) {
  return (
    <div className="card" style={{ padding: '16px' }}>
      <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
      <div className="kpi-value" style={{ color: color || 'var(--text)' }}>
        {value}
        <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--muted)', marginLeft: 4 }}>{unit}</span>
      </div>
      <div className="kpi-label">{label}</div>
      {sub && <div style={{ fontSize: 11, marginTop: 2, color: 'var(--muted)' }}>{sub}</div>}
    </div>
  )
}

export default function StatusPanel({ snapshot, advice, anomalies, optimization }: Props) {
  const sev = advice?.severity || 'normal'
  const sm = SEV_MAP[sev] || SEV_MAP.normal
  const alerts = anomalies?.alerts || []

  const reserveLow = (snapshot?.reserve_margin_pct ?? 20) < 15
  const curtHigh   = (snapshot?.curtailment_mw ?? 0) > 100
  const freqOff    = Math.abs((snapshot?.frequency_hz ?? 60) - 60) > 0.08

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="fade-in">

      {/* ── Advisory Banner ── */}
      <div className={`alert-banner ${sm.banner}`}>
        <div style={{ fontSize: 22, lineHeight: 1 }}>{sm.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>{sm.label}</span>
            <span className={`pill ${sm.pill}`}>{sev.toUpperCase()}</span>
            {alerts.length > 0 && (
              <span className="pill pill-red" style={{ marginLeft: 'auto' }}>{alerts.length} alert{alerts.length !== 1 ? 's' : ''}</span>
            )}
          </div>
          <div style={{ color: 'var(--text)', lineHeight: 1.5, fontSize: 13 }}>{advice?.narrative}</div>
        </div>
      </div>

      {/* ── KPI Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
        <KpiCard icon="⚡" value={Math.round(snapshot?.demand_mw ?? 0).toLocaleString()} unit="MW"
          label="Current Demand" color="#2f81f7" />
        <KpiCard icon="🌿" value={Math.round(snapshot?.renewable_mw ?? 0).toLocaleString()} unit="MW"
          label="Renewable Output" sub={`${snapshot?.renewable_penetration_pct?.toFixed(0) ?? 0}% of demand`} color="#3fb950" />
        <KpiCard icon="☀️" value={Math.round(snapshot?.solar_mw ?? 0).toLocaleString()} unit="MW"
          label="Solar Generation" color="#d29922" />
        <KpiCard icon="💨" value={Math.round(snapshot?.wind_mw ?? 0).toLocaleString()} unit="MW"
          label="Wind Generation" color="#22d3ee" />
        <KpiCard icon="🏭" value={Math.round(snapshot?.conventional_mw ?? 0).toLocaleString()} unit="MW"
          label="Conventional" color="#7d8590" />
        <KpiCard icon="🚫" value={Math.round(snapshot?.curtailment_mw ?? 0).toLocaleString()} unit="MW"
          label="Curtailment" sub={curtHigh ? 'Wasted clean energy' : 'Under control'}
          color={curtHigh ? '#db6d28' : 'var(--text)'} />
        <KpiCard icon="🛡️" value={(snapshot?.reserve_margin_pct ?? 0).toFixed(1)} unit="%"
          label="Reserve Margin" sub={reserveLow ? '⚠ Below safe level' : 'Adequate'}
          color={reserveLow ? '#f85149' : '#3fb950'} />
        <KpiCard icon="📡" value={(snapshot?.frequency_hz ?? 60).toFixed(3)} unit="Hz"
          label="Grid Frequency" sub="Nominal: 60.000 Hz"
          color={freqOff ? '#f85149' : 'var(--text)'} />
        <KpiCard icon="🏆" value={(optimization?.renewable_utilization_score ?? 0).toFixed(0)} unit="/ 100"
          label="Utilization Score" sub="Renewable efficiency"
          color={(optimization?.renewable_utilization_score ?? 0) > 75 ? '#3fb950' : '#d29922'} />
      </div>

      {/* ── Active Alerts ── */}
      {alerts.length > 0 && (
        <div className="card" style={{ padding: '16px' }}>
          <div className="card-title">⚠ Active Alerts</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {alerts.map((a: any, i: number) => {
              const color = a.severity === 'critical' ? '#f85149' : a.severity === 'high' ? '#db6d28' : a.severity === 'medium' ? '#d29922' : '#2f81f7'
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', background: 'var(--surface2)', borderRadius: 8, borderLeft: `3px solid ${color}` }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color, marginBottom: 2 }}>{a.type.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}</div>
                    <div style={{ fontSize: 13, color: 'var(--text)' }}>{a.message}</div>
                  </div>
                  <span className={`pill ${a.severity === 'critical' ? 'pill-red' : a.severity === 'high' ? 'pill-orange' : a.severity === 'medium' ? 'pill-yellow' : 'pill-blue'}`}>
                    {a.severity}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

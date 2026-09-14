interface Props { data: any }

function PerformanceBar({ label, actual, expected, color }: { label: string; actual: number; expected: number; color: string }) {
  const pct = expected > 10 ? Math.min(100, (actual / expected) * 100) : 100
  const barColor = pct >= 95 ? '#3fb950' : pct >= 80 ? '#d29922' : pct >= 60 ? '#db6d28' : '#f85149'
  const status = pct >= 95 ? 'Optimal' : pct >= 80 ? 'Minor deviation' : pct >= 60 ? 'Underperforming' : 'Critical'

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 18 }}>{label === 'Solar' ? '☀️' : '💨'}</span>
        <span style={{ fontWeight: 600, fontSize: 14, flex: 1 }}>{label}</span>
        <span style={{ fontWeight: 700, fontSize: 18, color: barColor }}>{Math.round(pct)}%</span>
        <span style={{ fontSize: 11, color: barColor, background: `${barColor}20`, padding: '2px 8px', borderRadius: 12, border: `1px solid ${barColor}40` }}>{status}</span>
      </div>
      <div className="progress-track" style={{ height: 12 }}>
        <div className="progress-fill" style={{ width: `${pct}%`, background: barColor }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11, color: 'var(--muted)' }}>
        <span>Actual: <b style={{ color: 'var(--text)' }}>{Math.round(actual)} MW</b></span>
        <span>Expected: <b style={{ color: 'var(--text)' }}>{Math.round(expected)} MW</b></span>
        {expected > actual && <span style={{ color: '#db6d28' }}>−{Math.round(expected - actual)} MW deficit</span>}
      </div>
    </div>
  )
}

export default function UnderperformancePanel({ data }: Props) {
  if (!data) return null
  const solar = data.solar || {}
  const wind  = data.wind  || {}
  const alerts = data.alerts || []
  const perf = data.overall_performance || 'normal'
  const perfPill = perf === 'normal' ? 'pill-green' : perf === 'degraded' ? 'pill-yellow' : 'pill-red'

  return (
    <div className="card fade-in">
      <div className="card-title" style={{ justifyContent: 'space-between' }}>
        <span>⚡ Renewable Asset Performance</span>
        <span className={`pill ${perfPill}`}>{perf.toUpperCase()}</span>
      </div>

      <PerformanceBar label="Solar"  actual={solar.actual_mw || 0} expected={solar.expected_mw || 0} color="#d29922" />
      <PerformanceBar label="Wind"   actual={wind.actual_mw  || 0} expected={wind.expected_mw  || 0} color="#22d3ee" />

      {alerts.length > 0 && (
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {alerts.map((a: any, i: number) => (
            <div key={i} style={{ background: 'var(--surface2)', borderRadius: 8, padding: '10px 12px', borderLeft: '3px solid #db6d28' }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: '#db6d28', marginBottom: 3 }}>
                {a.asset === 'solar_fleet' ? '☀️ Solar Fleet' : '💨 Wind Fleet'} — {a.status.replace(/_/g, ' ')}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 4 }}>{a.likely_cause}</div>
              {a.deficit_mw > 0 && (
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                  Lost revenue: <b style={{ color: '#f85149' }}>${(a.deficit_mw * 50).toLocaleString()}/hr</b>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {data.total_deficit_mw > 0 && (
        <div style={{ marginTop: 12, padding: '10px 12px', background: 'rgba(248,81,73,0.08)', borderRadius: 8, border: '1px solid rgba(248,81,73,0.2)', display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
          <span style={{ color: 'var(--muted)' }}>Total generation deficit:</span>
          <span style={{ fontWeight: 700, color: '#f85149' }}>{data.total_deficit_mw} MW</span>
        </div>
      )}
    </div>
  )
}

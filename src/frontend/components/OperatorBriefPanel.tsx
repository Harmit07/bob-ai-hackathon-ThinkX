interface Props { data: any }

const SEV_STYLES: Record<string, { bg: string; border: string; color: string }> = {
  critical: { bg: 'rgba(248,81,73,.06)',  border: '#f85149', color: '#f85149' },
  high:     { bg: 'rgba(219,109,40,.06)', border: '#db6d28', color: '#db6d28' },
  medium:   { bg: 'rgba(210,153,34,.06)', border: '#d29922', color: '#d29922' },
  low:      { bg: 'rgba(47,129,247,.06)', border: '#2f81f7', color: '#2f81f7' },
  normal:   { bg: 'rgba(63,185,80,.06)',  border: '#3fb950', color: '#3fb950' },
}

export default function OperatorBriefPanel({ data }: Props) {
  if (!data) return null
  const sev = data.severity || 'normal'
  const ss  = SEV_STYLES[sev] || SEV_STYLES.normal
  const km  = data.key_metrics || {}

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="fade-in">

      {/* ── Headline ── */}
      <div style={{ background: ss.bg, borderLeft: `4px solid ${ss.border}`, borderRadius: 10, padding: '16px 20px' }}>
        <div style={{ fontWeight: 700, fontSize: 17, color: ss.color, marginBottom: 4 }}>{data.headline}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>Shift period: {data.shift_period}</div>
      </div>

      {/* ── Key metrics bar ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8 }}>
        {[
          { icon: '⚡', label: 'Demand',       val: `${km.demand_mw} MW`,                   col: '#2f81f7' },
          { icon: '🌿', label: 'Renewable',     val: `${km.renewable_penetration_pct}%`,      col: '#3fb950' },
          { icon: '🛡️', label: 'Reserve',       val: `${km.reserve_margin_pct}%`,             col: km.reserve_margin_pct < 15 ? '#f85149' : '#3fb950' },
          { icon: '🏆', label: 'Util Score',    val: `${km.renewable_util_score}/100`,        col: '#d29922' },
          { icon: '🌱', label: 'CO₂ Avoided',   val: `${km.carbon_avoided_tco2_hr} t/hr`,    col: '#3fb950' },
          { icon: '⚠️', label: 'Active Alerts', val: `${data.active_alert_count}`,            col: data.active_alert_count > 0 ? '#f85149' : '#3fb950' },
          { icon: '🎯', label: 'Predicted Evts',val: `${data.predicted_event_count}`,         col: data.predicted_event_count > 0 ? '#d29922' : '#3fb950' },
        ].map((m, i) => (
          <div key={i} className="card" style={{ padding: '12px 14px', textAlign: 'center' }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{m.icon}</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: m.col }}>{m.val}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* ── Sections ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {(data.sections || []).map((sec: any, i: number) => (
          <div key={i} className="card" style={{ padding: '14px 16px' }}>
            <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{sec.title}</div>
            <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6 }}>{sec.content}</div>
          </div>
        ))}
      </div>

      {/* ── Priority actions ── */}
      {data.priority_actions?.length > 0 && (
        <div className="card">
          <div className="card-title">🎯 Priority Actions for This Shift</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.priority_actions.map((a: any, i: number) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 14px', background: 'var(--surface2)', borderRadius: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#2f81f7', flexShrink: 0 }}>{a.priority}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{a.action}</div>
                  <div style={{ fontSize: 12, color: '#3fb950' }}>{a.impact}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

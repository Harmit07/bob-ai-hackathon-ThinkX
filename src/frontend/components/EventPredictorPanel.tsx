interface Props { data: any }

const SEV_COLOR: Record<string, string> = { high: '#f85149', medium: '#d29922', low: '#2f81f7' }
const SEV_PILL:  Record<string, string> = { high: 'pill-red', medium: 'pill-yellow', low: 'pill-blue' }

export default function EventPredictorPanel({ data }: Props) {
  if (!data) return null
  const events   = data.predicted_events || []
  const timeline = (data.timeline || []).slice(0, 6)
  const risk     = data.overall_risk || 'normal'
  const riskPill = risk === 'high' ? 'pill-red' : risk === 'medium' ? 'pill-yellow' : 'pill-green'

  return (
    <div className="card fade-in">
      <div className="card-title" style={{ justifyContent: 'space-between' }}>
        <span>🎯 AI Grid Event Predictor</span>
        <span className={`pill ${riskPill}`}>{risk.toUpperCase()} RISK</span>
      </div>

      {events.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px 0', color: '#3fb950' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
          <div style={{ fontWeight: 600 }}>No high-probability events predicted</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Grid conditions look stable for the next {data.hours_ahead}h</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {events.map((ev: any, i: number) => {
            const pct = Math.round(ev.probability * 100)
            const col = SEV_COLOR[ev.severity] || '#3fb950'
            return (
              <div key={i} style={{ background: 'var(--surface2)', borderRadius: 10, padding: '12px 14px', borderLeft: `3px solid ${col}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: 14, flex: 1 }}>{ev.label}</span>
                  <span className={`pill ${SEV_PILL[ev.severity] || 'pill-green'}`}>{ev.severity}</span>
                  <span style={{ fontWeight: 700, fontSize: 16, color: col }}>{pct}%</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>{ev.description}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="progress-track" style={{ flex: 1 }}>
                    <div className="progress-fill" style={{ width: `${pct}%`, background: col }} />
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>in {ev.hours_ahead}h</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 6-hour probability summary */}
      {timeline.length > 0 && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>Flagged events per hour</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {timeline.map((t: any, i: number) => (
              <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{
                  height: Math.max(4, t.flagged_events * 12),
                  background: t.flagged_events > 2 ? '#f85149' : t.flagged_events > 0 ? '#d29922' : '#3fb950',
                  borderRadius: 4, marginBottom: 4,
                }} />
                <div style={{ fontSize: 10, color: 'var(--muted)' }}>{t.hour_label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

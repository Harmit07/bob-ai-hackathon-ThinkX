interface Props { data: any }

export default function GridStressPanel({ data }: Props) {
  if (!data) return null
  const score = data.composite_score || 0
  const dims  = data.dimension_scores || {}
  const color = score >= 75 ? '#f85149' : score >= 55 ? '#db6d28' : score >= 35 ? '#d29922' : score >= 15 ? '#2f81f7' : '#3fb950'
  const pill  = score >= 75 ? 'pill-red' : score >= 55 ? 'pill-orange' : score >= 35 ? 'pill-yellow' : score >= 15 ? 'pill-blue' : 'pill-green'

  const DIM_LABELS: Record<string, string> = {
    reserve:     '🛡️ Reserve Margin',
    frequency:   '📡 Frequency',
    demand:      '⚡ Demand Load',
    curtailment: '🚫 Curtailment',
    congestion:  '🔌 Congestion',
    variability: '🌊 Variability',
  }

  return (
    <div className="card fade-in">
      <div className="card-title" style={{ justifyContent: 'space-between' }}>
        <span>🌡️ Grid Stress Score</span>
        <span className={`pill ${pill}`}>{data.label}</span>
      </div>

      {/* Big score */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 52, fontWeight: 800, color, lineHeight: 1, letterSpacing: '-2px' }}>{Math.round(score)}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>out of 100</div>
        </div>
        <div style={{ flex: 1 }}>
          <div className="progress-track" style={{ height: 14, marginBottom: 8 }}>
            <div className="progress-fill" style={{ width: `${score}%`, background: color }} />
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>
            <b style={{ color: 'var(--text)' }}>Primary driver:</b> {data.top_contributing_factor}
          </div>
        </div>
      </div>

      {/* Dimension bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Object.entries(dims).map(([key, val]) => {
          const v = val as number
          const c = v >= 75 ? '#f85149' : v >= 55 ? '#db6d28' : v >= 35 ? '#d29922' : '#3fb950'
          return (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 140, fontSize: 12, color: 'var(--muted)', flexShrink: 0 }}>{DIM_LABELS[key] || key}</div>
              <div className="progress-track" style={{ flex: 1 }}>
                <div className="progress-fill" style={{ width: `${v}%`, background: c }} />
              </div>
              <div style={{ width: 32, textAlign: 'right', fontSize: 12, fontWeight: 600, color: c }}>{Math.round(v)}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface Props { rca: any }

const STEPS = [
  { key: 'symptom',             icon: '🔍', label: 'What we observed',      color: '#7d8590' },
  { key: 'primary_cause',       icon: '🎯', label: 'Root cause',            color: '#f85149' },
  { key: 'contributing_factors',icon: '📋', label: 'Contributing factors',  color: '#d29922' },
  { key: 'immediate_action',    icon: '✅', label: 'Recommended action',    color: '#3fb950' },
]

export default function RCAPanel({ rca }: Props) {
  if (!rca) return null
  const confidence = Math.round((rca.root_cause_confidence || 0) * 100)
  const confColor = confidence >= 85 ? '#3fb950' : confidence >= 70 ? '#d29922' : '#f85149'

  return (
    <div className="card fade-in">
      <div className="card-title">🔬 Root Cause Analysis</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {STEPS.map(step => {
          const val = rca[step.key]
          if (!val) return null
          return (
            <div key={step.key} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                {step.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: step.color, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>{step.label}</div>
                {Array.isArray(val) ? (
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {val.map((f: string, i: number) => (
                      <li key={i} style={{ fontSize: 13, color: 'var(--text)', display: 'flex', gap: 6 }}>
                        <span style={{ color: 'var(--muted)' }}>•</span>{f}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div style={{ fontSize: 13, color: 'var(--text)' }}>{val}</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Confidence bar */}
      <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
          <span style={{ color: 'var(--muted)' }}>AI Confidence</span>
          <span style={{ fontWeight: 700, color: confColor }}>{confidence}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${confidence}%`, background: confColor }} />
        </div>
      </div>
    </div>
  )
}

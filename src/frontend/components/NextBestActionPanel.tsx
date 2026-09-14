interface Props { data: any }

const CAT_ICON: Record<string, string> = {
  storage: '🔋', demand_response: '📊', generation: '⚡',
  transmission: '🔌', market: '💲', maintenance: '🔧', monitoring: '👁️',
}
const RANK_COLORS = ['#d29922','#7d8590','#db6d28','#7d8590','#7d8590']

export default function NextBestActionPanel({ data }: Props) {
  if (!data) return null
  const actions = data.recommended_actions || []

  return (
    <div className="card fade-in">
      <div className="card-title" style={{ justifyContent: 'space-between' }}>
        <span>🤖 AI Next-Best-Actions</span>
        <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
          {data.applicable_actions}/{data.total_actions_evaluated} actions match current conditions
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {actions.map((a: any, i: number) => (
          <div key={i} style={{ background: 'var(--surface2)', borderRadius: 10, padding: '14px 16px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            {/* Rank badge */}
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: RANK_COLORS[i] || '#7d8590', flexShrink: 0 }}>
              {a.rank}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 18 }}>{CAT_ICON[a.category] || '⚡'}</span>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{a.name}</span>
                <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 'auto', background: 'var(--bg)', padding: '2px 8px', borderRadius: 6 }}>Score {a.effectiveness_score}</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 6 }}>{a.description}</div>
              <div style={{ fontSize: 12, color: '#3fb950', fontWeight: 600 }}>
                ↑ {a.impact_mw} MW — {a.impact_metric}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

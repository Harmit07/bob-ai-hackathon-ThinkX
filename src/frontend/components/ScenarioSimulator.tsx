'use client'
import { useState } from 'react'
import axios from 'axios'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface Props { snapshot: any }

const SCENARIOS = [
  { id: 'add_storage_200mw',       icon: '🔋', label: 'Add 200 MW Storage',        category: 'Infrastructure' },
  { id: 'demand_surge_10pct',      icon: '📈', label: 'Demand Surge +10%',          category: 'Demand'         },
  { id: 'demand_drop_15pct',       icon: '📉', label: 'Demand Drop −15%',           category: 'Demand'         },
  { id: 'solar_cloud_event',       icon: '☁️', label: 'Solar Cloud Event −60%',     category: 'Weather'        },
  { id: 'wind_ramp_down',          icon: '🌬️', label: 'Wind Ramp-Down −50%',        category: 'Weather'        },
  { id: 'add_wind_capacity_300mw', icon: '🌀', label: 'Add 300 MW Wind',             category: 'Infrastructure' },
  { id: 'conventional_trip',       icon: '⚡', label: 'Generator Trip −500 MW',     category: 'Contingency'    },
  { id: 'peak_demand_event',       icon: '🔥', label: 'Extreme Peak Demand +20%',   category: 'Extreme'        },
]

const VERDICT_STYLE: Record<string, { color: string; bg: string; label: string }> = {
  viable:   { color: '#3fb950', bg: 'rgba(63,185,80,.1)',  label: '✅ Viable'   },
  risky:    { color: '#d29922', bg: 'rgba(210,153,34,.1)', label: '⚠ Risky'    },
  critical: { color: '#f85149', bg: 'rgba(248,81,73,.1)',  label: '🔴 Critical' },
}

export default function ScenarioSimulator({ snapshot }: Props) {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [active, setActive] = useState<string | null>(null)

  const runScenario = async (id: string) => {
    setLoading(true)
    setActive(id)
    setResult(null)
    try {
      const { data } = await axios.get(`${BASE}/api/scenarios/run?scenario_id=${id}`)
      setResult(data)
    } finally {
      setLoading(false)
    }
  }

  const outcome = result?.outcome
  const vs = outcome ? VERDICT_STYLE[outcome.verdict] || VERDICT_STYLE.risky : null

  return (
    <div className="card fade-in">
      <div className="card-title">🧪 What-If Scenario Simulator</div>
      <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
        Click any scenario below to instantly simulate its effect on the grid.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8, marginBottom: 16 }}>
        {SCENARIOS.map(s => (
          <button key={s.id} className={`scenario-btn${active === s.id ? ' active' : ''}`} onClick={() => runScenario(s.id)}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{s.category}</div>
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--muted)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
            <div className="spinner" />
          </div>
          Running simulation…
        </div>
      )}

      {result && !loading && vs && (
        <div style={{ background: vs.bg, border: `1px solid ${vs.color}40`, borderRadius: 12, padding: '18px 20px' }} className="fade-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 16, flex: 1 }}>{result.scenario_name}</div>
            <div style={{ fontWeight: 800, fontSize: 16, color: vs.color }}>{vs.label}</div>
            <div style={{ fontWeight: 700, color: vs.color }}>{outcome.stability_score}/100</div>
          </div>

          {/* Before / After table */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, fontSize: 13, marginBottom: 14 }}>
            {[
              { label: 'Metric',        isHeader: true, base: 'Before',                    sim: 'After'                     },
              { label: 'Demand',        isHeader: false, base: `${result.baseline.demand_mw} MW`,     sim: `${result.simulated.demand_mw} MW`      },
              { label: 'Renewable',     isHeader: false, base: `${result.baseline.renewable_mw} MW`,  sim: `${result.simulated.renewable_mw} MW`   },
              { label: 'Curtailment',   isHeader: false, base: `${result.baseline.curtailment_mw} MW`,sim: `${result.simulated.curtailment_mw} MW` },
              { label: 'Reserve',       isHeader: false, base: `${result.baseline.reserve_margin_pct}%`, sim: `${result.simulated.reserve_margin_pct}%` },
            ].map((row, i) => {
              const simRaw = parseFloat(String(row.sim))
              const baseRaw = parseFloat(String(row.base))
              const changed = !row.isHeader && simRaw !== baseRaw
              const better = row.label === 'Curtailment' ? simRaw < baseRaw : simRaw > baseRaw
              return (
                <div key={i} className="contents">
                  <div style={{ padding: '6px 8px', background: 'var(--surface2)', fontWeight: row.isHeader ? 700 : 400, color: row.isHeader ? 'var(--muted)' : 'var(--text)', borderRadius: i === 0 ? '6px 0 0 0' : 0 }}>{row.label}</div>
                  <div style={{ padding: '6px 8px', background: 'var(--surface2)', textAlign: 'right', color: 'var(--muted)', fontWeight: row.isHeader ? 700 : 400 }}>{row.base}</div>
                  <div style={{ padding: '6px 8px', background: 'var(--surface2)', textAlign: 'right', fontWeight: row.isHeader ? 700 : 600, color: changed ? (better ? '#3fb950' : '#f85149') : 'var(--text)' }}>
                    {row.sim} {changed && (better ? '↑' : '↓')}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Risks and opportunities */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {(outcome.risks || []).map((r: string, i: number) => (
              <div key={i} style={{ fontSize: 13, color: '#f85149' }}>⚠ {r}</div>
            ))}
            {(outcome.opportunities || []).map((o: string, i: number) => (
              <div key={i} style={{ fontSize: 13, color: '#3fb950' }}>✓ {o}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

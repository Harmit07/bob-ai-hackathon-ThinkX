'use client'
import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const REGIONS = [
  { id: 'western',     flag: '🟠', label: 'Western',      city: 'Mumbai',    abbr: 'WR'  },
  { id: 'northern',    flag: '🔵', label: 'Northern',     city: 'Delhi',     abbr: 'NR'  },
  { id: 'southern',    flag: '🟢', label: 'Southern',     city: 'Bangalore', abbr: 'SR'  },
  { id: 'eastern',     flag: '🟡', label: 'Eastern',      city: 'Kolkata',   abbr: 'ER'  },
  { id: 'northeastern',flag: '🔴', label: 'North-Eastern',city: 'Guwahati',  abbr: 'NER' },
]

const SOURCE_BADGE: Record<string, { color: string; label: string }> = {
  'real:open-meteo':             { color: '#3fb950', label: '🛰 Live Weather' },
  'real:open-meteo+cea-mnre-2024': { color: '#3fb950', label: '🛰 Real Data' },
  'synthetic:fallback':          { color: '#d29922', label: '⚙ Simulated' },
  'synthetic':                   { color: '#d29922', label: '⚙ Simulated' },
}

function DataBadge({ source }: { source: string }) {
  const key = Object.keys(SOURCE_BADGE).find(k => source?.startsWith(k)) || 'synthetic'
  const b = SOURCE_BADGE[key] || SOURCE_BADGE['synthetic']
  return (
    <span style={{ fontSize: 11, color: b.color, background: `${b.color}18`,
      border: `1px solid ${b.color}40`, padding: '2px 8px', borderRadius: 12, fontWeight: 600 }}>
      {b.label}
    </span>
  )
}

function KpiCard({ icon, value, unit, label, sub, color }: {
  icon: string; value: string; unit: string; label: string; sub?: string; color?: string
}) {
  return (
    <div className="card" style={{ padding: '14px 16px' }}>
      <div style={{ fontSize: 20, marginBottom: 5 }}>{icon}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: color || 'var(--text)', lineHeight: 1.1 }}>
        {value}<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--muted)', marginLeft: 3 }}>{unit}</span>
      </div>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 1 }}>{sub}</div>}
    </div>
  )
}

export default function IndiaGridPanel() {
  const [region, setRegion]   = useState('western')
  const [snapshot, setSnapshot] = useState<any>(null)
  const [allIndia, setAllIndia] = useState<any>(null)
  const [capacity, setCapacity] = useState<any>(null)
  const [datasets, setDatasets] = useState<any>(null)
  const [loading, setLoading]  = useState(true)
  const [activeView, setActiveView] = useState<'region'|'national'|'capacity'|'sources'>('region')

  const loadRegion = useCallback(async (rid: string) => {
    setLoading(true)
    try {
      const { data } = await axios.get(`${BASE}/api/india/snapshot?region=${rid}`)
      setSnapshot(data)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadNational = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await axios.get(`${BASE}/api/india/all-regions`)
      setAllIndia(data)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadCapacity = useCallback(async () => {
    if (capacity) return
    const { data } = await axios.get(`${BASE}/api/india/capacity`)
    setCapacity(data)
  }, [capacity])

  const loadDatasets = useCallback(async () => {
    if (datasets) return
    setLoading(true)
    try {
      const { data } = await axios.get(`${BASE}/api/india/open-datasets`)
      setDatasets(data)
    } finally {
      setLoading(false)
    }
  }, [datasets])

  useEffect(() => { loadRegion(region) }, [region, loadRegion])

  const handleView = (view: typeof activeView) => {
    setActiveView(view)
    if (view === 'national') loadNational()
    if (view === 'capacity') loadCapacity()
    if (view === 'sources')  loadDatasets()
  }

  const s = snapshot

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="fade-in">

      {/* ── India Header ─────────────────────────────────────────────────── */}
      <div className="card" style={{ padding: '16px 20px', background: 'linear-gradient(135deg, #1a2a1a 0%, #1a1a2e 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
              🇮🇳 India Grid Advisor
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>
              Real weather data from Open-Meteo · CEA/MNRE 2024 installed capacity · POSOCO load curve · 50 Hz grid
            </div>
          </div>
          {s && <DataBadge source={s.data_source} />}
        </div>
      </div>

      {/* ── Sub-navigation ───────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 6 }}>
        {[
          { id: 'region',   label: '📍 Regional View' },
          { id: 'national', label: '🗺 All-India' },
          { id: 'capacity', label: '⚡ Installed Capacity' },
          { id: 'sources',  label: '📂 Open Datasets' },
        ].map(v => (
          <button key={v.id} className="btn" onClick={() => handleView(v.id as any)}
            style={{
              padding: '7px 14px', fontSize: 12,
              background: activeView === v.id ? 'rgba(47,129,247,.15)' : 'var(--surface2)',
              color: activeView === v.id ? '#2f81f7' : 'var(--muted)',
              border: `1px solid ${activeView === v.id ? '#2f81f7' : 'var(--border)'}`,
            }}>
            {v.label}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* VIEW: REGIONAL                                                      */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeView === 'region' && (
        <>
          {/* Region selector */}
          <div style={{ display: 'flex', gap: 8 }}>
            {REGIONS.map(r => (
              <button key={r.id} className="btn"
                onClick={() => setRegion(r.id)}
                style={{
                  flex: 1, flexDirection: 'column', padding: '10px 6px', fontSize: 12,
                  background: region === r.id ? 'rgba(47,129,247,.12)' : 'var(--surface)',
                  color: region === r.id ? '#2f81f7' : 'var(--text)',
                  border: `1px solid ${region === r.id ? '#2f81f7' : 'var(--border)'}`,
                  fontWeight: region === r.id ? 700 : 400,
                }}>
                <div style={{ fontSize: 18 }}>{r.flag}</div>
                <div style={{ fontWeight: 700, marginTop: 3 }}>{r.abbr}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{r.city}</div>
              </button>
            ))}
          </div>

          {loading && <div style={{ textAlign: 'center', padding: 32, color: 'var(--muted)' }}>Loading real data…</div>}

          {s && !loading && (
            <>
              {/* Region title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{s.region}</div>
                <span className="pill pill-blue">{s.rldc}</span>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>IST: {s.ist_time}</span>
                <DataBadge source={s.weather_source} />
              </div>

              {/* KPI grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
                <KpiCard icon="⚡" value={Math.round(s.demand_mw).toLocaleString('en-IN')} unit="MW" label="Demand" color="#2f81f7" />
                <KpiCard icon="🌿" value={Math.round(s.renewable_mw).toLocaleString('en-IN')} unit="MW" label="Renewable" sub={`${s.renewable_penetration_pct?.toFixed(1)}% share`} color="#3fb950" />
                <KpiCard icon="☀️" value={Math.round(s.solar_mw).toLocaleString('en-IN')} unit="MW" label="Solar" sub={`${s.installed_solar_mw?.toLocaleString('en-IN')} MW installed`} color="#d29922" />
                <KpiCard icon="💨" value={Math.round(s.wind_mw).toLocaleString('en-IN')} unit="MW" label="Wind" sub={`${s.installed_wind_mw?.toLocaleString('en-IN')} MW installed`} color="#22d3ee" />
                <KpiCard icon="💧" value={Math.round(s.hydro_mw).toLocaleString('en-IN')} unit="MW" label="Hydro" color="#60a5fa" />
                <KpiCard icon="🏭" value={Math.round(s.conventional_mw).toLocaleString('en-IN')} unit="MW" label="Conventional" color="#7d8590" />
                <KpiCard icon="🚫" value={Math.round(s.curtailment_mw).toLocaleString('en-IN')} unit="MW" label="Curtailment" color={s.curtailment_mw > 100 ? '#db6d28' : 'var(--text)'} />
                <KpiCard icon="🛡️" value={s.reserve_margin_pct?.toFixed(1)} unit="%" label="Reserve Margin" color={s.reserve_margin_pct < 15 ? '#f85149' : '#3fb950'} />
                <KpiCard icon="📡" value={s.frequency_hz?.toFixed(3)} unit="Hz" label="Frequency (50 Hz)" color={Math.abs(s.frequency_hz - 50) > 0.1 ? '#f85149' : 'var(--text)'} sub="IEGC band: 49.9–50.05" />
                <KpiCard icon="🌡️" value={s.temperature_c?.toFixed(1)} unit="°C" label="Temperature" color={s.temperature_c > 35 ? '#f85149' : '#2f81f7'} sub="Real (Open-Meteo)" />
                <KpiCard icon="💧" value={s.cloud_cover_pct?.toFixed(0)} unit="%" label="Cloud Cover" sub="Real (Open-Meteo)" />
                <KpiCard icon="🌬️" value={s.wind_speed_ms?.toFixed(1)} unit="m/s" label="Wind Speed" sub="Real (Open-Meteo)" />
              </div>

              {/* Pricing */}
              <div className="card">
                <div className="card-title">💰 India Electricity Pricing (INR)</div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13 }}>
                  <div><span style={{ color: 'var(--muted)' }}>Market Period: </span>
                    <b style={{ color: s.is_peak_hours ? '#db6d28' : '#3fb950' }}>{s.is_peak_hours ? '⚡ Peak (18–22 IST)' : 'Off-Peak'}</b></div>
                  <div><span style={{ color: 'var(--muted)' }}>Spot Price: </span>
                    <b style={{ color: 'var(--text)' }}>₹{s.spot_price_inr_per_mwh?.toLocaleString('en-IN')}/MWh</b></div>
                  <div><span style={{ color: 'var(--muted)' }}>CO₂ Avoided: </span>
                    <b style={{ color: '#3fb950' }}>{s.carbon_avoided_tco2_hr} t/hr</b></div>
                  <div><span style={{ color: 'var(--muted)' }}>Emission Factor: </span>
                    <b style={{ color: '#d29922' }}>{s.carbon_emission_factor}</b></div>
                </div>
              </div>

              {/* Data source transparency */}
              <div className="card" style={{ padding: '12px 16px' }}>
                <div className="card-title">🔍 Data Source Transparency</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 12 }}>
                  {[
                    ['Demand',          s.demand_source],
                    ['Weather',         s.weather_source],
                    ['Capacity',        s.capacity_source],
                    ['Grid Code',       s.grid_code],
                    ['Frequency Norm',  `${s.frequency_nominal_hz} Hz (IEGC)`],
                    ['Overall',         s.data_source],
                  ].map(([label, val], i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                      <span style={{ color: 'var(--muted)', width: 110, flexShrink: 0 }}>{label}:</span>
                      <span style={{ color: val?.includes('real') ? '#3fb950' : val?.includes('synthetic') ? '#d29922' : 'var(--text)', fontWeight: 500 }}>
                        {val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* VIEW: ALL-INDIA                                                     */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeView === 'national' && allIndia && (
        <>
          <div className="card">
            <div className="card-title">🇮🇳 All-India Grid Summary</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
              {[
                { icon: '⚡', label: 'Total Demand',    val: `${Math.round(allIndia.all_india.demand_mw / 1000).toLocaleString('en-IN')} GW`,    color: '#2f81f7' },
                { icon: '🌿', label: 'Renewable',       val: `${Math.round(allIndia.all_india.renewable_mw / 1000).toLocaleString('en-IN')} GW`,  color: '#3fb950' },
                { icon: '☀️', label: 'Solar',           val: `${Math.round(allIndia.all_india.solar_mw / 1000).toLocaleString('en-IN')} GW`,      color: '#d29922' },
                { icon: '💨', label: 'Wind',            val: `${Math.round(allIndia.all_india.wind_mw / 1000).toLocaleString('en-IN')} GW`,       color: '#22d3ee' },
                { icon: '🌿', label: 'RE Share',        val: `${allIndia.all_india.renewable_pct?.toFixed(1)}%`,                                  color: '#3fb950' },
                { icon: '🚫', label: 'Curtailment',     val: `${Math.round(allIndia.all_india.curtailment_mw).toLocaleString('en-IN')} MW`,       color: '#db6d28' },
              ].map((m, i) => (
                <div key={i} className="card" style={{ padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{m.icon}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: m.color }}>{m.val}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Per-region table */}
          <div className="card">
            <div className="card-title">📊 Regional Grid Comparison</div>
            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Region','Demand MW','Solar MW','Wind MW','Hydro MW','RE %','Reserve %','Temp °C'].map((h, i) => (
                    <th key={i} style={{ padding: '6px 8px', textAlign: i > 0 ? 'right' : 'left', color: 'var(--muted)', fontWeight: 600, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(allIndia.regions || {}).map(([rid, r]: [string, any]) => (
                  <tr key={rid} style={{ borderBottom: '1px solid var(--surface2)', cursor: 'pointer' }}
                    onClick={() => { setRegion(rid); setActiveView('region') }}>
                    <td style={{ padding: '8px', color: '#2f81f7', fontWeight: 600 }}>{r.region}</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>{Math.round(r.demand_mw).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '8px', textAlign: 'right', color: '#d29922' }}>{Math.round(r.solar_mw).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '8px', textAlign: 'right', color: '#22d3ee' }}>{Math.round(r.wind_mw).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '8px', textAlign: 'right', color: '#60a5fa' }}>{Math.round(r.hydro_mw).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '8px', textAlign: 'right', color: '#3fb950', fontWeight: 600 }}>{r.renewable_penetration_pct?.toFixed(1)}%</td>
                    <td style={{ padding: '8px', textAlign: 'right', color: r.reserve_margin_pct < 15 ? '#f85149' : '#3fb950' }}>{r.reserve_margin_pct?.toFixed(1)}%</td>
                    <td style={{ padding: '8px', textAlign: 'right', color: r.temperature_c > 35 ? '#f85149' : 'var(--text)' }}>{r.temperature_c}°C</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>Click any row to view regional detail</div>
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* VIEW: INSTALLED CAPACITY                                            */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeView === 'capacity' && capacity && (
        <>
          <div className="card">
            <div className="card-title" style={{ justifyContent: 'space-between' }}>
              <span>⚡ India Installed Capacity — CEA 2024</span>
              <a href="https://cea.nic.in" target="_blank" rel="noreferrer"
                style={{ fontSize: 11, color: '#2f81f7', textDecoration: 'none' }}>
                🔗 cea.nic.in ↗
              </a>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8, marginBottom: 16 }}>
              {[
                { icon: '⚫', label: 'Coal',       gw: capacity.total_installed_gw?.coal,    color: '#7d8590' },
                { icon: '☀️', label: 'Solar',      gw: capacity.total_installed_gw?.solar,   color: '#d29922' },
                { icon: '💨', label: 'Wind',       gw: capacity.total_installed_gw?.wind,    color: '#22d3ee' },
                { icon: '💧', label: 'Large Hydro',gw: capacity.total_installed_gw?.large_hydro, color: '#60a5fa' },
                { icon: '⚛️', label: 'Nuclear',    gw: capacity.total_installed_gw?.nuclear, color: '#a371f7' },
                { icon: '⛽', label: 'Gas',        gw: capacity.total_installed_gw?.gas,     color: '#db6d28' },
              ].map((m, i) => (
                <div key={i} className="card" style={{ padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{m.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: m.color }}>{m.gw?.toFixed(1)}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{m.label} GW</div>
                </div>
              ))}
            </div>

            {/* 2030 target progress */}
            <div style={{ padding: '12px 0', borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: 'var(--muted)' }}>India RE Target 2030: <b style={{ color: 'var(--text)' }}>500 GW</b></span>
                <span style={{ fontWeight: 700, color: '#3fb950' }}>{capacity.india_re_progress_pct}% achieved</span>
              </div>
              <div className="progress-track" style={{ height: 12 }}>
                <div className="progress-fill" style={{ width: `${capacity.india_re_progress_pct}%`, background: '#3fb950' }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                Current: {((capacity.renewable_gw?.solar || 0) + (capacity.renewable_gw?.wind || 0)).toFixed(1)} GW solar+wind installed
              </div>
            </div>
          </div>

          {/* Top solar states */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="card">
              <div className="card-title">
                ☀️ Top Solar States
                <a href="https://mnre.gov.in" target="_blank" rel="noreferrer"
                  style={{ fontSize: 10, color: '#2f81f7', textDecoration: 'none', marginLeft: 'auto', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                  🔗 mnre.gov.in ↗
                </a>
              </div>
              {Object.entries(capacity.top_solar_states_mw || {}).slice(0, 8).map(([state, mw]: [string, any]) => {
                const max = Math.max(...(Object.values(capacity.top_solar_states_mw || {}) as number[]))
                return (
                  <div key={state} style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                      <span style={{ color: 'var(--text)' }}>{state}</span>
                      <span style={{ fontWeight: 700, color: '#d29922' }}>{(mw / 1000).toFixed(1)} GW</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${(mw / max) * 100}%`, background: '#d29922' }} />
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="card">
              <div className="card-title">
                💨 Top Wind States
                <a href="https://mnre.gov.in" target="_blank" rel="noreferrer"
                  style={{ fontSize: 10, color: '#2f81f7', textDecoration: 'none', marginLeft: 'auto', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                  🔗 mnre.gov.in ↗
                </a>
              </div>
              {Object.entries(capacity.top_wind_states_mw || {}).slice(0, 8).map(([state, mw]: [string, any]) => {
                const max = Math.max(...(Object.values(capacity.top_wind_states_mw || {}) as number[]))
                return (
                  <div key={state} style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                      <span style={{ color: 'var(--text)' }}>{state}</span>
                      <span style={{ fontWeight: 700, color: '#22d3ee' }}>{(mw / 1000).toFixed(1)} GW</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${(mw / max) * 100}%`, background: '#22d3ee' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* VIEW: OPEN DATASETS                                                 */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeView === 'sources' && (
        <>
          {/* Data sources summary */}
          <div className="card">
            <div className="card-title">🔌 Data Sources Used in This System</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { icon: '🛰', name: 'Open-Meteo Weather API', url: 'https://open-meteo.com', key: false, cost: 'FREE', color: '#3fb950',
                  desc: 'Live cloud cover, wind speed, solar irradiance, temperature for Indian cities. No API key needed.' },
                { icon: '📊', name: 'CEA Annual Report 2024', url: 'https://cea.nic.in', key: false, cost: 'FREE', color: '#3fb950',
                  desc: 'Real installed capacity (coal, solar, wind, hydro) — all capacity constants in this app come from here.' },
                { icon: '🌞', name: 'MNRE State Renewable Data', url: 'https://mnre.gov.in', key: false, cost: 'FREE', color: '#3fb950',
                  desc: 'State-wise solar and wind installed capacity. Rajasthan 17.5 GW solar, Tamil Nadu 9.8 GW wind, etc.' },
                { icon: '⚡', name: 'POSOCO / NLDC Demand Reports', url: 'https://posoco.in', key: false, cost: 'FREE', color: '#d29922',
                  desc: 'Load curve shape and peak demand patterns. Used to calibrate the 24-hour IST demand profile.' },
                { icon: '🏛', name: 'data.gov.in CKAN API', url: 'https://data.gov.in', key: false, cost: 'FREE', color: '#3fb950',
                  desc: 'India open government data portal. Free programmatic access to electricity datasets.' },
                { icon: '💱', name: 'IEX Market Prices', url: 'https://www.iexindia.com', key: true, cost: 'Paid (live)', color: '#d29922',
                  desc: 'INR/MWh electricity prices. Current app uses published average prices as constants.' },
              ].map((src, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 14px', background: 'var(--surface2)', borderRadius: 10,
                  borderLeft: `3px solid ${src.color}` }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{src.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{src.name}</span>
                      <span style={{ fontSize: 10, color: src.cost === 'FREE' ? '#3fb950' : '#d29922',
                        background: src.cost === 'FREE' ? 'rgba(63,185,80,.15)' : 'rgba(210,153,34,.15)',
                        padding: '1px 7px', borderRadius: 10, border: `1px solid ${src.cost === 'FREE' ? 'rgba(63,185,80,.3)' : 'rgba(210,153,34,.3)'}` }}>
                        {src.cost}
                      </span>
                      {!src.key && <span style={{ fontSize: 10, color: '#3fb950' }}>🔓 No key required</span>}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>{src.desc}</div>
                    <a href={src.url} target="_blank" rel="noreferrer"
                      style={{ fontSize: 11, color: '#2f81f7', textDecoration: 'none' }}>{src.url} ↗</a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* data.gov.in live datasets */}
          {datasets && (
            <div className="card">
              <div className="card-title" style={{ justifyContent: 'space-between' }}>
                <span>📂 Live Datasets from data.gov.in</span>
                <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                  {datasets.dataset_count} datasets found
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 400, overflowY: 'auto' }}>
                {(datasets.datasets || []).slice(0, 15).map((ds: any, i: number) => (
                  <div key={i} style={{ padding: '10px 12px', background: 'var(--surface2)', borderRadius: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 3 }}>{ds.title}</div>
                    {ds.description && <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>{ds.description}</div>}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      {(ds.formats || []).map((f: string, j: number) => f && (
                        <span key={j} style={{ fontSize: 10, color: '#2f81f7', background: 'rgba(47,129,247,.1)',
                          padding: '1px 6px', borderRadius: 4, border: '1px solid rgba(47,129,247,.2)' }}>{f}</span>
                      ))}
                      <span style={{ fontSize: 10, color: 'var(--muted)', marginLeft: 'auto' }}>{ds.author}</span>
                    </div>
                    {ds.download_urls?.[0] && (
                      <a href={ds.download_urls[0]} target="_blank" rel="noreferrer"
                        style={{ fontSize: 11, color: '#3fb950', textDecoration: 'none', marginTop: 4, display: 'block' }}>
                        ⬇ Download Dataset ↗
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {!datasets && (
            <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={loadDatasets}>
              Load Live Datasets from data.gov.in
            </button>
          )}
        </>
      )}
    </div>
  )
}

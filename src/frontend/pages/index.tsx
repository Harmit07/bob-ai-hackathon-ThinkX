import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import {
  fetchAdvisory, fetchHistory,
  fetchEvents, fetchUnderperformance, fetchNextBestActions,
  fetchGridStress, fetchOperatorBrief, fetchFinancialImpact, fetchHITLQueue,
} from '../lib/api'
import StatusPanel         from '../components/StatusPanel'
import GridChart           from '../components/GridChart'
import EnergyMixChart      from '../components/EnergyMixChart'
import RecommendationsPanel from '../components/RecommendationsPanel'
import RCAPanel            from '../components/RCAPanel'
import EventPredictorPanel from '../components/EventPredictorPanel'
import UnderperformancePanel from '../components/UnderperformancePanel'
import NextBestActionPanel from '../components/NextBestActionPanel'
import ScenarioSimulator   from '../components/ScenarioSimulator'
import GridStressPanel     from '../components/GridStressPanel'
import OperatorBriefPanel  from '../components/OperatorBriefPanel'
import FinancialImpactPanel from '../components/FinancialImpactPanel'
import HITLApprovalPanel   from '../components/HITLApprovalPanel'
import IndiaGridPanel      from '../components/IndiaGridPanel'

const NAV = [
  { id: 'overview',      icon: '📊', label: 'Overview',         desc: 'Live grid status & KPIs'       },
  { id: 'intelligence',  icon: '🎯', label: 'AI Intelligence',  desc: 'Predictions & analysis'         },
  { id: 'operations',    icon: '⚙️', label: 'Operations',       desc: 'RCA, forecast & approvals'      },
  { id: 'financials',    icon: '💰', label: 'Financials',       desc: 'Cost & carbon impact'            },
  { id: 'brief',         icon: '📋', label: 'Operator Brief',   desc: 'Full shift summary'              },
  { id: 'india',         icon: '🇮🇳', label: 'India Grid',       desc: 'Real Indian grid data'           },
]

const SEV_PILL: Record<string, string> = {
  critical: 'pill-red', high: 'pill-orange', medium: 'pill-yellow', low: 'pill-blue', normal: 'pill-green',
}

export default function Dashboard() {
  const [advisory,  setAdvisory]  = useState<any>(null)
  const [history,   setHistory]   = useState<any[]>([])
  const [events,    setEvents]    = useState<any>(null)
  const [underperf, setUnderperf] = useState<any>(null)
  const [nba,       setNba]       = useState<any>(null)
  const [stress,    setStress]    = useState<any>(null)
  const [brief,     setBrief]     = useState<any>(null)
  const [financial, setFinancial] = useState<any>(null)
  const [hitl,      setHitl]      = useState<any>(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [activeTab,   setActiveTab]   = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const loadAll = useCallback(async () => {
    try {
      const [adv, hist, ev, up, n, s, b, f, h] = await Promise.all([
        fetchAdvisory(), fetchHistory(48), fetchEvents(6),
        fetchUnderperformance(), fetchNextBestActions(),
        fetchGridStress(), fetchOperatorBrief(),
        fetchFinancialImpact(), fetchHITLQueue(),
      ])
      setAdvisory(adv); setHistory(hist.records || [])
      setEvents(ev); setUnderperf(up); setNba(n)
      setStress(s); setBrief(b); setFinancial(f); setHitl(h)
      setLastUpdated(new Date().toLocaleTimeString())
      setError(null)
    } catch {
      setError('Cannot connect to the backend API.')
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshHITL = useCallback(async () => {
    const h = await fetchHITLQueue(); setHitl(h)
  }, [])

  useEffect(() => { loadAll() }, [loadAll])
  useEffect(() => {
    if (!autoRefresh) return
    const t = setInterval(loadAll, 30000)
    return () => clearInterval(t)
  }, [autoRefresh, loadAll])

  const sev = advisory?.advice?.severity || 'normal'

  return (
    <>
      <Head>
        <title>Grid Advisor — AI-Powered Grid Optimization</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>

        {/* ─── Sidebar ─── */}
        <aside style={{
          width: sidebarOpen ? 220 : 60,
          flexShrink: 0,
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.2s ease',
          overflow: 'hidden',
          position: 'sticky',
          top: 0,
          height: '100vh',
        }}>
          {/* Logo */}
          <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden', whiteSpace: 'nowrap' }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>⚡</span>
            {sidebarOpen && (
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>Grid Advisor</div>
                <div style={{ fontSize: 10, color: 'var(--muted)' }}>ThinkX · IBM Bob Hackathon</div>
              </div>
            )}
          </div>

          {/* Nav items */}
          <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {NAV.map(item => (
              <button
                key={item.id}
                className={`nav-item${activeTab === item.id ? ' active' : ''}`}
                onClick={() => setActiveTab(item.id)}
                title={!sidebarOpen ? item.label : ''}
                style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
              >
                <span style={{ fontSize: 17, flexShrink: 0 }}>{item.icon}</span>
                {sidebarOpen && (
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontWeight: 600 }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>{item.desc}</div>
                  </div>
                )}
              </button>
            ))}
          </nav>

          {/* Sidebar toggle */}
          <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
            <button
              className="nav-item"
              onClick={() => setSidebarOpen(v => !v)}
              style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}
            >
              <span style={{ fontSize: 17 }}>{sidebarOpen ? '◀' : '▶'}</span>
              {sidebarOpen && <span style={{ fontSize: 12 }}>Collapse sidebar</span>}
            </button>
          </div>
        </aside>

        {/* ─── Main content ─── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

          {/* ── Top bar ── */}
          <header style={{
            background: 'var(--surface)',
            borderBottom: '1px solid var(--border)',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>
                {NAV.find(n => n.id === activeTab)?.icon} {NAV.find(n => n.id === activeTab)?.label}
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                {NAV.find(n => n.id === activeTab)?.desc}
              </div>
            </div>

            {/* Live status */}
            {advisory && (
              <span className={`pill ${SEV_PILL[sev] || 'pill-green'}`} style={{ fontSize: 12 }}>
                {sev === 'normal' ? '🟢' : sev === 'low' ? '🔵' : sev === 'medium' ? '🟡' : sev === 'high' ? '🟠' : '🔴'} {sev.toUpperCase()}
              </span>
            )}

            {lastUpdated && (
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>Updated {lastUpdated}</span>
            )}

            <button
              onClick={() => setAutoRefresh(v => !v)}
              className="btn btn-ghost"
              style={{ padding: '6px 14px', fontSize: 12 }}
            >
              {autoRefresh ? '● Live' : '○ Paused'}
            </button>

            <button onClick={loadAll} className="btn btn-primary" style={{ padding: '6px 14px', fontSize: 12 }}>
              ↺ Refresh
            </button>
          </header>

          {/* ── Page content ── */}
          <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>

            {/* Loading */}
            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16, color: 'var(--muted)' }}>
                <div className="spinner" style={{ width: 44, height: 44 }} />
                <div style={{ fontWeight: 600, fontSize: 15 }}>Loading grid data…</div>
                <div style={{ fontSize: 13 }}>Connecting to AI services</div>
              </div>
            )}

            {/* Error */}
            {error && !loading && (
              <div style={{ background: 'rgba(248,81,73,.08)', border: '1px solid rgba(248,81,73,.3)', borderRadius: 12, padding: '28px 32px', maxWidth: 560, margin: '60px auto', textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
                <div style={{ fontWeight: 700, fontSize: 18, color: '#f85149', marginBottom: 8 }}>Cannot connect to backend</div>
                <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 20 }}>Make sure the Python backend is running.</div>
                <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: '12px 16px', fontFamily: 'monospace', fontSize: 13, color: '#3fb950', textAlign: 'left', marginBottom: 20 }}>
                  cd src/backend<br/>
                  pip install -r requirements.txt<br/>
                  uvicorn app.main:app --reload
                </div>
                <button className="btn btn-primary" onClick={loadAll}>Try Again</button>
              </div>
            )}

            {/* Tabs */}
            {!loading && advisory && (
              <div key={activeTab} className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* ── OVERVIEW ── */}
                {activeTab === 'overview' && <>
                  <StatusPanel snapshot={advisory.snapshot} advice={advisory.advice} anomalies={advisory.anomalies} optimization={advisory.optimization} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>
                    <GridChart history={history} forecast={advisory.forecast || []} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <EnergyMixChart snapshot={advisory.snapshot} />
                      <GridStressPanel data={stress} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <RecommendationsPanel optimization={advisory.optimization} />
                    <RCAPanel rca={advisory.advice?.root_cause_analysis} />
                  </div>
                </>}

                {/* ── AI INTELLIGENCE ── */}
                {activeTab === 'intelligence' && <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <EventPredictorPanel data={events} />
                    <UnderperformancePanel data={underperf} />
                  </div>
                  <NextBestActionPanel data={nba} />
                  <ScenarioSimulator snapshot={advisory.snapshot} />
                </>}

                {/* ── OPERATIONS ── */}
                {activeTab === 'operations' && <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <RCAPanel rca={advisory.advice?.root_cause_analysis} />
                    <div className="card">
                      <div className="card-title">📅 24h Curtailment Risk Forecast</div>
                      <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border)' }}>
                            <th style={{ textAlign: 'left',  padding: '6px 10px 10px 0', color: 'var(--muted)', fontWeight: 600 }}>Time</th>
                            <th style={{ textAlign: 'right', padding: '6px 10px 10px',    color: 'var(--muted)', fontWeight: 600 }}>Demand</th>
                            <th style={{ textAlign: 'right', padding: '6px 10px 10px',    color: 'var(--muted)', fontWeight: 600 }}>Renewable</th>
                            <th style={{ textAlign: 'right', padding: '6px 0   10px',     color: 'var(--muted)', fontWeight: 600 }}>Curt. Risk</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(advisory.forecast || []).slice(0, 16).map((row: any, i: number) => {
                            const risk = row.curtailment_risk_pct ?? 0
                            const rc = risk > 10 ? '#db6d28' : risk > 5 ? '#d29922' : '#3fb950'
                            return (
                              <tr key={i} style={{ borderBottom: '1px solid var(--surface2)' }}>
                                <td style={{ padding: '7px 10px 7px 0', color: 'var(--muted)' }}>{new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                <td style={{ padding: '7px 10px', textAlign: 'right', color: '#2f81f7', fontWeight: 500 }}>{Math.round(row.demand_mw)} MW</td>
                                <td style={{ padding: '7px 10px', textAlign: 'right', color: '#3fb950', fontWeight: 500 }}>{Math.round(row.renewable_mw)} MW</td>
                                <td style={{ padding: '7px 0',    textAlign: 'right', color: rc, fontWeight: 700 }}>{risk.toFixed(1)}%</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <HITLApprovalPanel data={hitl} onRefresh={refreshHITL} />
                </>}

                {/* ── FINANCIALS ── */}
                {activeTab === 'financials' && <>
                  <FinancialImpactPanel data={financial} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <UnderperformancePanel data={underperf} />
                    <GridStressPanel data={stress} />
                  </div>
                </>}

                {/* ── OPERATOR BRIEF ── */}
                {activeTab === 'brief' && <>
                  <OperatorBriefPanel data={brief} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <EventPredictorPanel data={events} />
                    <NextBestActionPanel data={nba} />
                  </div>
                </>}

                {/* ── INDIA GRID ── */}
                {activeTab === 'india' && <IndiaGridPanel />}

              </div>
            )}

            {/* India tab works even without advisory data loaded */}
            {!loading && !advisory && activeTab === 'india' && (
              <div className="fade-in"><IndiaGridPanel /></div>
            )}
          </main>

          <footer style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', textAlign: 'center', fontSize: 12, color: 'var(--muted)' }}>
            Team ThinkX · IBM Bob AI Hackathon · Grid Load Optimization & Renewable Energy Performance Advisor
          </footer>
        </div>
      </div>
    </>
  )
}

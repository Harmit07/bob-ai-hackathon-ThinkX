'use client'
import { useState } from 'react'
import axios from 'axios'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface Props { data: any; onRefresh: () => void }

const CAT_ICONS: Record<string, string> = {
  storage: '🔋', demand_response: '📊', generation: '⚡',
  transmission: '🔌', market: '💲', maintenance: '🔧', monitoring: '👁️',
}

const STATUS_STYLES: Record<string, { bg: string; border: string; pillCls: string }> = {
  pending:  { bg: 'rgba(210,153,34,.06)', border: '#d29922', pillCls: 'pill-yellow' },
  approved: { bg: 'rgba(63,185,80,.06)',  border: '#3fb950', pillCls: 'pill-green'  },
  rejected: { bg: 'rgba(248,81,73,.06)',  border: '#f85149', pillCls: 'pill-red'    },
  deferred: { bg: 'rgba(125,133,144,.06)',border: '#7d8590', pillCls: 'pill-blue'   },
}

export default function HITLApprovalPanel({ data, onRefresh }: Props) {
  const [submitting, setSubmitting] = useState<string | null>(null)

  const queue   = data?.queue   || []
  const summary = data?.summary || {}

  const refreshQueue = async () => {
    await axios.post(`${BASE}/api/hitl/queue/refresh`)
    onRefresh()
  }

  const decide = async (id: string, decision: string) => {
    setSubmitting(id + decision)
    try {
      await axios.post(`${BASE}/api/hitl/review/${id}`, { decision, reviewed_by: 'operator', notes: '' })
      onRefresh()
    } finally {
      setSubmitting(null)
    }
  }

  return (
    <div className="card fade-in">
      <div className="card-title" style={{ justifyContent: 'space-between' }}>
        <span>👤 Human-in-the-Loop Approval</span>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#d29922' }}>⏳ {summary.pending || 0} pending</span>
          <span style={{ fontSize: 12, color: '#3fb950' }}>✓ {summary.approved || 0} approved</span>
          <span style={{ fontSize: 12, color: '#f85149' }}>✗ {summary.rejected || 0} rejected</span>
          <button className="btn btn-primary" style={{ padding: '5px 12px', fontSize: 12 }} onClick={refreshQueue}>
            + Load AI Actions
          </button>
        </div>
      </div>

      {queue.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>No actions in queue</div>
          <div style={{ fontSize: 13 }}>Click <b style={{ color: 'var(--accent)' }}>+ Load AI Actions</b> to populate with AI recommendations</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 480, overflowY: 'auto', paddingRight: 4 }}>
          {queue.map((action: any) => {
            const ss = STATUS_STYLES[action.status] || STATUS_STYLES.pending
            return (
              <div key={action.id} style={{ background: ss.bg, border: `1px solid ${ss.border}40`, borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20 }}>{CAT_ICONS[action.category] || '⚡'}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{action.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'capitalize' }}>{action.category.replace('_', ' ')}</div>
                    </div>
                  </div>
                  <span className={`pill ${ss.pillCls}`}>{action.status.toUpperCase()}</span>
                </div>

                <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>{action.description}</div>

                <div style={{ display: 'flex', gap: 16, fontSize: 12, marginBottom: action.status === 'pending' ? 12 : 0 }}>
                  <span style={{ color: '#3fb950' }}>⬆ {action.impact_mw} MW impact</span>
                  <span style={{ color: 'var(--muted)' }}>{action.impact_metric}</span>
                  <span style={{ color: '#2f81f7', marginLeft: 'auto' }}>Score: {action.effectiveness_score}</span>
                </div>

                {action.status === 'pending' && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="btn btn-success"
                      style={{ flex: 1 }}
                      disabled={submitting === action.id + 'approved'}
                      onClick={() => decide(action.id, 'approved')}
                    >
                      ✓ Approve
                    </button>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: '8px 16px' }}
                      disabled={submitting === action.id + 'deferred'}
                      onClick={() => decide(action.id, 'deferred')}
                    >
                      ⏸ Defer
                    </button>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '8px 16px' }}
                      disabled={submitting === action.id + 'rejected'}
                      onClick={() => decide(action.id, 'rejected')}
                    >
                      ✗ Reject
                    </button>
                  </div>
                )}

                {action.status !== 'pending' && action.reviewed_at && (
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                    Reviewed by {action.reviewed_by} at {new Date(action.reviewed_at).toLocaleTimeString()}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

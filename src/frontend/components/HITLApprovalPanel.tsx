'use client'
import { useState } from 'react'
import { refreshHITLQueue, reviewHITLAction } from '@/lib/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { UserCheck, RefreshCw, CheckCircle, XCircle, Clock, ChevronRight } from 'lucide-react'

interface Props { data: any; onRefresh: () => void }

const CAT_ICONS: Record<string, string> = {
  storage: '🔋', demand_response: '📊', generation: '⚡',
  transmission: '🔌', market: '💲', maintenance: '🔧', monitoring: '👁️',
}

const STATUS_META: Record<string, { variant: 'yellow' | 'green' | 'red' | 'slate'; label: string }> = {
  pending:  { variant: 'yellow', label: 'PENDING'  },
  approved: { variant: 'green',  label: 'APPROVED' },
  rejected: { variant: 'red',    label: 'REJECTED' },
  deferred: { variant: 'slate',  label: 'DEFERRED' },
}

export default function HITLApprovalPanel({ data, onRefresh }: Props) {
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const queue   = data?.queue   || []
  const summary = data?.summary || {}

  const handleRefresh = async () => {
    setLoading(true)
    try {
      await refreshHITLQueue()
      onRefresh()
    } finally {
      setLoading(false)
    }
  }

  const decide = async (id: string, decision: string) => {
    setSubmitting(id + decision)
    try {
      await reviewHITLAction(id, decision)
      onRefresh()
    } finally {
      setSubmitting(null)
    }
  }

  return (
    <Card className="border-cyan-900/40">
      <CardHeader>
        <CardTitle className="text-slate-200">
          <UserCheck className="w-4 h-4 text-cyan-400" />
          HUMAN-IN-THE-LOOP APPROVAL QUEUE
        </CardTitle>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-yellow-400 flex items-center gap-1">
            <Clock className="w-3 h-3" /> {summary.pending || 0} pending
          </span>
          <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> {summary.approved || 0} approved
          </span>
          <span className="text-xs font-mono text-red-400 flex items-center gap-1">
            <XCircle className="w-3 h-3" /> {summary.rejected || 0} rejected
          </span>
          <Button
            variant="primary"
            size="sm"
            isLoading={loading}
            onClick={handleRefresh}
            className="font-mono font-bold ml-2"
          >
            <RefreshCw className="w-3 h-3" />
            Load AI Actions
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center">
              <UserCheck className="w-7 h-7 text-slate-500" />
            </div>
            <p className="text-sm font-semibold text-slate-300 font-mono">No actions in queue</p>
            <p className="text-xs text-slate-500 max-w-xs">
              Click <span className="text-cyan-400 font-bold">Load AI Actions</span> to populate with the latest AI-generated recommendations for operator review.
            </p>
            <Button variant="outline" size="sm" isLoading={loading} onClick={handleRefresh} className="font-mono mt-1">
              <RefreshCw className="w-3 h-3" />
              Load AI Actions
            </Button>
          </div>
        ) : (
          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {queue.map((action: any) => {
              const meta = STATUS_META[action.status] || STATUS_META.pending
              const effectivenessVariant: 'green' | 'yellow' | 'red' =
                action.effectiveness_score >= 80 ? 'green' :
                action.effectiveness_score >= 50 ? 'yellow' : 'red'

              return (
                <div
                  key={action.id}
                  className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 font-mono"
                >
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{CAT_ICONS[action.category] || '⚡'}</span>
                      <div>
                        <p className="text-sm font-bold text-slate-100">{action.name}</p>
                        <p className="text-xs text-slate-500 capitalize">{action.category?.replace(/_/g, ' ')}</p>
                      </div>
                    </div>
                    <Badge variant={meta.variant} size="sm">{meta.label}</Badge>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-400 leading-relaxed">{action.description}</p>

                  {/* Metrics row */}
                  <div className="flex items-center gap-4 text-xs border-t border-slate-800/80 pt-3">
                    <span className="text-emerald-400 font-bold">⬆ {action.impact_mw} MW</span>
                    <span className="text-slate-500">{action.impact_metric}</span>
                    <span className="ml-auto text-slate-400">
                      Score:{' '}
                      <span className={
                        action.effectiveness_score >= 80 ? 'text-emerald-400 font-bold' :
                        action.effectiveness_score >= 50 ? 'text-yellow-400 font-bold' :
                        'text-red-400 font-bold'
                      }>
                        {action.effectiveness_score}
                      </span>
                    </span>
                  </div>

                  {/* Effectiveness bar */}
                  <Progress
                    value={action.effectiveness_score ?? 0}
                    variant={effectivenessVariant}
                    size="sm"
                  />

                  {/* Action buttons — pending only */}
                  {action.status === 'pending' && (
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        variant="success"
                        size="sm"
                        className="flex-1 font-bold"
                        isLoading={submitting === action.id + 'approved'}
                        disabled={submitting !== null}
                        onClick={() => decide(action.id, 'approved')}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Approve
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="font-bold text-slate-300"
                        isLoading={submitting === action.id + 'deferred'}
                        disabled={submitting !== null}
                        onClick={() => decide(action.id, 'deferred')}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        Defer
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        className="font-bold"
                        isLoading={submitting === action.id + 'rejected'}
                        disabled={submitting !== null}
                        onClick={() => decide(action.id, 'rejected')}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </Button>
                    </div>
                  )}

                  {/* Reviewed by stamp */}
                  {action.status !== 'pending' && action.reviewed_at && (
                    <p className="text-xs text-slate-600 pt-1 border-t border-slate-800/60">
                      Reviewed by <span className="text-slate-400">{action.reviewed_by}</span> at{' '}
                      {new Date(action.reviewed_at).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

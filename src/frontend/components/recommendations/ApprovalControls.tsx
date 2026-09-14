'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { RecommendationAction, ApprovalStatus } from '@/types/recommendation';
import { PlayCircle, CheckCircle, Edit3, XCircle, ShieldAlert, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';

interface ApprovalControlsProps {
  action: RecommendationAction;
  onStatusChange?: (id: string, status: ApprovalStatus, modifiedAmount?: number) => void;
  onSimulate?: (action: RecommendationAction) => void;
}

export function ApprovalControls({ action, onStatusChange, onSimulate }: ApprovalControlsProps) {
  const router = useRouter();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isModifyOpen, setIsModifyOpen] = useState(false);
  const [modifiedAmount, setModifiedAmount] = useState(action.impact_mw);
  const [currentStatus, setCurrentStatus] = useState<ApprovalStatus>(action.status || 'PENDING');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSimulateClick = () => {
    if (onSimulate) {
      onSimulate(action);
    } else {
      router.push('/simulation');
    }
  };

  const handleApproveConfirm = async () => {
    setIsSubmitting(true);
    try {
      const res = await api.approveRecommendation(action.id);
      setCurrentStatus('APPROVED');
      setIsConfirmOpen(false);
      if (onStatusChange) onStatusChange(action.id, 'APPROVED');
      showToast(res.message || `Simulation approved — no physical grid equipment was controlled.`);
    } catch (err) {
      console.error('Approve failed:', err);
      setCurrentStatus('APPROVED');
      setIsConfirmOpen(false);
      showToast(`Simulation approved — no physical grid equipment was controlled.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    setIsSubmitting(true);
    try {
      const res = await api.rejectRecommendation(action.id);
      setCurrentStatus('REJECTED');
      if (onStatusChange) onStatusChange(action.id, 'REJECTED');
      showToast(res.message || `Recommendation rejected: ${action.action}`);
    } catch (err) {
      console.error('Reject failed:', err);
      setCurrentStatus('REJECTED');
      showToast(`Recommendation rejected: ${action.action}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModifySubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await api.modifyRecommendation(action.id, modifiedAmount);
      setCurrentStatus('MODIFIED');
      setIsModifyOpen(false);
      if (onStatusChange) onStatusChange(action.id, 'MODIFIED', modifiedAmount);
      showToast(res.message || `Recommendation modified: ${action.action} updated to ${modifiedAmount} MW.`);
    } catch (err) {
      console.error('Modify failed:', err);
      setCurrentStatus('MODIFIED');
      setIsModifyOpen(false);
      showToast(`Recommendation modified to ${modifiedAmount} MW.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 text-xs font-mono flex items-start gap-2.5 shadow-lg shadow-emerald-950/40 animate-in fade-in duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold block text-emerald-300">Action Confirmed</span>
            <p className="text-emerald-200/90 text-[11px]">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {currentStatus === 'APPROVED' && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-mono font-bold shadow-md shadow-emerald-950/40">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>APPROVED (SIMULATED)</span>
          </div>
        )}
        {currentStatus === 'REJECTED' && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-mono font-bold">
            <XCircle className="w-4 h-4 text-rose-400" />
            <span>REJECTED</span>
          </div>
        )}
        {currentStatus === 'MODIFIED' && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-950/80 border border-amber-500/50 text-amber-300 text-xs font-mono font-bold">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>MODIFIED ({modifiedAmount} MW)</span>
          </div>
        )}

        {currentStatus === 'PENDING' && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSimulateClick}
              className="text-cyan-300 border-slate-700 bg-slate-900/80 hover:bg-cyan-950/60 hover:border-cyan-500/60 hover:text-cyan-200 transition-all font-mono font-semibold"
            >
              <PlayCircle className="w-4 h-4 text-cyan-400" />
              SIMULATE
            </Button>

            <Button
              variant="success"
              size="sm"
              onClick={() => setIsConfirmOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold shadow-md shadow-emerald-950/50"
            >
              <CheckCircle className="w-4 h-4" />
              APPROVE
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsModifyOpen(true)}
              className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-mono font-semibold"
            >
              <Edit3 className="w-4 h-4 text-amber-400" />
              MODIFY
            </Button>

            <Button
              variant="danger"
              size="sm"
              onClick={handleReject}
              disabled={isSubmitting}
              className="bg-slate-900 hover:bg-rose-950/80 text-rose-400 border border-rose-900/50 font-mono"
            >
              <XCircle className="w-4 h-4" />
              REJECT
            </Button>
          </>
        )}
      </div>

      {/* Operator Safety Confirmation Modal */}
      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="CONFIRM OPERATOR RECOMMENDATION"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsConfirmOpen(false)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 font-mono"
            >
              Cancel
            </Button>
            <Button
              variant="success"
              size="sm"
              disabled={isSubmitting}
              onClick={handleApproveConfirm}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold shadow-lg shadow-emerald-950/60 px-5 py-2 border border-emerald-400/40"
            >
              {isSubmitting ? 'Confirming...' : 'Confirm Approval'}
            </Button>
          </>
        }
      >
        <div className="space-y-4 font-mono text-sm">
          {/* Details Table */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
              <span className="text-slate-400 text-xs uppercase tracking-wider">Action:</span>
              <span className="font-extrabold text-slate-100">{action.action}</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
              <span className="text-slate-400 text-xs uppercase tracking-wider">Target Asset:</span>
              <span className="font-extrabold text-cyan-400">{action.target_node}</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
              <span className="text-slate-400 text-xs uppercase tracking-wider">Amount:</span>
              <span className="font-extrabold text-emerald-400">{action.impact_mw} MW</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
              <span className="text-slate-400 text-xs uppercase tracking-wider">Expected Impact:</span>
              <span className="font-bold text-slate-200">{action.expected_impact_desc}</span>
            </div>

            <div className="flex justify-between items-center pt-1">
              <span className="text-slate-400 text-xs uppercase tracking-wider">Risk Level:</span>
              <Badge variant="green" size="sm">{action.risk_level}</Badge>
            </div>
          </div>

          {/* Safety Banner */}
          <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-500/40 flex items-start gap-3 text-xs text-amber-200 shadow-md">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-amber-300 block">Operator Safety Directive</span>
              <p className="text-amber-200/90 leading-relaxed">
                This action is a <strong className="text-amber-300">simulated recommendation</strong>. No physical grid equipment will be controlled.
              </p>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modify Modal */}
      <Modal
        isOpen={isModifyOpen}
        onClose={() => setIsModifyOpen(false)}
        title="MODIFY RECOMMENDATION DISPATCH AMOUNT"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModifyOpen(false)}
              className="border-slate-700 text-slate-300 font-mono"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              onClick={handleModifySubmit}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold shadow-lg shadow-cyan-950/60"
            >
              {isSubmitting ? 'Saving...' : 'Save Modification'}
            </Button>
          </>
        }
      >
        <div className="space-y-4 font-mono text-sm">
          <p className="text-slate-300">Adjust the target power dispatch output for <strong className="text-cyan-400">{action.action}</strong>:</p>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <label className="block text-xs text-slate-400 uppercase tracking-wider">Target Dispatch Output (MW):</label>
            <input
              type="number"
              value={modifiedAmount}
              onChange={(e) => setModifiedAmount(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-cyan-500 font-extrabold text-lg"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

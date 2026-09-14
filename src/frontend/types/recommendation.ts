export type ActionPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'MODIFIED';

export interface RecommendationAction {
  id: string;
  index_num?: string; // "01", "02", "03"
  priority: ActionPriority;
  action: string; // e.g. "DISCHARGE BESS_03"
  target_node: string; // e.g. "BESS_03"
  impact_mw: number; // e.g. 350
  cost_delta_usd: number;
  emission_delta_tons: number;
  expected_impact_desc: string; // "Improve reserve margin"
  confidence_pct: number; // 94
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  rationale: string;
  status: ApprovalStatus;
  modified_amount_mw?: number;
}

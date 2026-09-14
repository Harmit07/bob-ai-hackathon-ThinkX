export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface AnomalyItem {
  id: string;
  node_id: string;
  timestamp: string;
  anomaly_score: number;
  is_anomaly: boolean;
  severity: Severity;
  fault_type: string;
  affected_metrics: string[];
  description: string;
  expected_mw?: number;
  actual_mw?: number;
  lost_mw?: number;
}

export interface RootCauseAnalysis {
  anomaly_id: string;
  node_id: string;
  primary_cause: string;
  confidence: number; // 0 - 1.0 (e.g. 0.91 for 91%)
  contributing_factors: string[];
  cause_probabilities: {
    cause: string;
    probability_pct: number;
  }[];
  evidence_checklist: {
    label: string;
    verified: boolean;
  }[];
  recommended_mitigation: string;
}

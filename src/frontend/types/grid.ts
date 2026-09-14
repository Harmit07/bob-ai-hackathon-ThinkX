export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type GridStatusType = 'NORMAL' | 'ELEVATED_RISK' | 'HIGH_RISK' | 'CRITICAL';
export type CongestionStatus = 'NORMAL' | 'WARNING' | 'CONGESTED';

export interface GridStatus {
  status: GridStatusType;
  grid_stress_index: number; // 0 - 100
  transmission_status: CongestionStatus;
  reserve_margin_gw: number; // e.g. -0.4 GW
  curtailment_risk: RiskLevel;
  last_updated: string;
}

export interface GridStressBreakdown {
  voltage_penalty: number;
  frequency_penalty: number;
  congestion_penalty: number;
  anomaly_penalty: number;
}

export interface GridStress {
  grid_stress_index: number;
  status: RiskLevel;
  voltage_health: number;
  frequency_health: number;
  congestion_health: number;
  breakdown: GridStressBreakdown;
  drivers?: string[];
}

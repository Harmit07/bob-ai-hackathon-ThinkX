export interface ScenarioCardData {
  id: string;
  title: string;
  description: string;
  curtailment_mw: number;
  reserve_margin_gw: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  is_recommended?: boolean;
  bess_dispatch_mw?: number;
  demand_response_mw?: number;
  transfer_mw?: number;
}

export interface OptimizationDispatch {
  node_id: string;
  node_name: string;
  node_type: string;
  dispatched_mw: number;
  max_capacity_mw: number;
  cost_usd: number;
  emissions_kg: number;
}

export interface OptimizationResponse {
  run_id: string;
  created_at: string;
  status: string;
  total_cost_usd: number;
  total_emissions_tons: number;
  total_curtailment_mwh: number;
  grid_stress_index: number;
  before_after: {
    curtailment_mwh_before: number;
    curtailment_mwh_after: number;
    reserve_gw_before: number;
    reserve_gw_after: number;
    risk_before: string;
    risk_after: string;
  };
  dispatch_schedule: OptimizationDispatch[];
  scenarios: ScenarioCardData[];
}

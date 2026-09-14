export interface DemandSummary {
  current_load_gw: number; // 16.8
  expected_peak_gw: number; // 18.7
  peak_time: string; // 18:15
  spike_probability_pct: number; // 91
}

export interface RenewableSummary {
  expected_gw: number; // 11.2
  actual_gw: number; // 10.6
  variance_gw: number; // -0.6
  availability_pct: number; // 94
}

export interface CurtailmentSummary {
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  expected_mw: number; // 820
  window: string; // 14:40–16:10
  primary_cause: string; // Transmission Congestion
  probability_pct: number; // 83
}

export interface ReserveSummary {
  current_gw: number; // -0.4
  after_optimization_gw: number; // +0.8
  improvement_gw: number; // +1.2
}

export interface ForecastPoint {
  timestamp: string;
  node_id?: string;
  forecast_type?: 'demand' | 'solar' | 'wind';
  actual?: number;
  predicted_mw: number;
  lower_bound: number;
  upper_bound: number;
}

export interface ForecastResponse {
  horizon_hours: number;
  demand_forecasts: ForecastPoint[];
  renewable_forecasts: ForecastPoint[];
  curtailment_risk_forecasts: any[];
}

export interface SimulationParams {
  demand_change_pct: number; // -20 to +20
  solar_change_pct: number; // -30 to +30
  wind_change_pct: number; // -30 to +30
  battery_available: boolean;
  transmission_capacity_change_pct: number; // -30 to +30
}

export interface SimulationMetricRow {
  metric: string;
  baseline: string;
  scenario: string;
  unit: string;
  direction: 'positive' | 'negative' | 'neutral';
}

export interface SimulationResult {
  scenario_name: string;
  risk_before: string;
  risk_after: string;
  metrics: SimulationMetricRow[];
  what_changed_summary: string[];
}

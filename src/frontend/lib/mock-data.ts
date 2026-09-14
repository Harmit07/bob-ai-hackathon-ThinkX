import { GridStatus, GridStress } from '@/types/grid';
import { DemandSummary, RenewableSummary, CurtailmentSummary, ReserveSummary, ForecastPoint } from '@/types/forecast';
import { GridAsset, AssetTelemetry } from '@/types/asset';
import { AnomalyItem, RootCauseAnalysis } from '@/types/anomaly';
import { ScenarioCardData, OptimizationResponse } from '@/types/optimization';
import { RecommendationAction } from '@/types/recommendation';

export const goldenGridStatus: GridStatus = {
  status: 'ELEVATED_RISK',
  grid_stress_index: 84,
  transmission_status: 'CONGESTED',
  reserve_margin_gw: -0.4,
  curtailment_risk: 'HIGH',
  last_updated: new Date().toISOString(),
};

export const goldenGridStress: GridStress = {
  grid_stress_index: 84,
  status: 'CRITICAL',
  voltage_health: 72.4,
  frequency_health: 68.1,
  congestion_health: 44.0,
  breakdown: {
    voltage_penalty: 14.2,
    frequency_penalty: 16.5,
    congestion_penalty: 20.0,
    anomaly_penalty: 33.3,
  },
  drivers: [
    '↑ Demand pressure',
    '↑ Transmission utilization',
    '↓ Solar generation',
    '↓ Reserve margin',
    '↑ Curtailment risk',
  ],
};

export const goldenDemandSummary: DemandSummary = {
  current_load_gw: 16.8,
  expected_peak_gw: 18.7,
  peak_time: '18:15',
  spike_probability_pct: 91,
};

export const goldenRenewableSummary: RenewableSummary = {
  expected_gw: 11.2,
  actual_gw: 10.6,
  variance_gw: -0.6,
  availability_pct: 94,
};

export const goldenCurtailmentSummary: CurtailmentSummary = {
  risk_level: 'HIGH',
  expected_mw: 820,
  window: '14:40–16:10',
  primary_cause: 'Transmission Congestion',
  probability_pct: 83,
};

export const goldenReserveSummary: ReserveSummary = {
  current_gw: -0.4,
  after_optimization_gw: 0.8,
  improvement_gw: 1.2,
};

export const goldenCriticalAsset: GridAsset = {
  asset_id: 'SOLAR_B17',
  asset_name: 'Solar Plant B17',
  asset_type: 'solar',
  region_id: 'R02',
  capacity_mw: 150,
  expected_output_mw: 110,
  actual_output_mw: 87,
  variance_mw: -23,
  performance_pct: 79.1,
  health_score: 78,
  status: 'DEGRADED',
  latitude: 34.15,
  longitude: -118.05,
  fault_type: 'INVERTER_DERATING',
};

export const goldenRCA: RootCauseAnalysis = {
  anomaly_id: 'RCA_SOLAR_B17_001',
  node_id: 'SOLAR_B17',
  primary_cause: 'INVERTER DERATING',
  confidence: 0.91,
  contributing_factors: [
    'Inverter temperature exceeded 84.2°C thermal limit',
    'Inverter operating efficiency degraded from 98.2% to 78.4%',
    'Loss of 23 MW generation capacity during peak solar window',
  ],
  cause_probabilities: [
    { cause: 'Inverter Derating', probability_pct: 58 },
    { cause: 'High Temperature', probability_pct: 17 },
    { cause: 'Soiling', probability_pct: 12 },
    { cause: 'Tracker Failure', probability_pct: 8 },
    { cause: 'Other', probability_pct: 5 },
  ],
  evidence_checklist: [
    { label: 'Inverter efficiency decreased', verified: true },
    { label: 'Inverter temperature increased', verified: true },
    { label: 'Generation below expected', verified: true },
    { label: 'Grid frequency imbalance detected', verified: false },
  ],
  recommended_mitigation: 'Dispatch BESS_03 battery (350 MW) to cover 23 MW deficit and inspect SOLAR_B17 cooling fans.',
};

export const goldenRecommendations: RecommendationAction[] = [
  {
    id: 'REC_01',
    index_num: '01',
    priority: 'CRITICAL',
    action: 'DISCHARGE BESS_03',
    target_node: 'BESS_03',
    impact_mw: 350,
    cost_delta_usd: 1750,
    emission_delta_tons: 0.0,
    expected_impact_desc: 'Improve reserve margin',
    confidence_pct: 94,
    risk_level: 'LOW',
    rationale: 'Discharging BESS_03 (350 MW) in R04 Industrial Belt instantly recovers reserve margin from -0.4 GW to +0.8 GW.',
    status: 'PENDING',
  },
  {
    id: 'REC_02',
    index_num: '02',
    priority: 'HIGH',
    action: 'ACTIVATE DEMAND RESPONSE',
    target_node: 'DR_REG_R04',
    impact_mw: 180,
    cost_delta_usd: -2400,
    emission_delta_tons: -8.2,
    expected_impact_desc: 'Reduce demand pressure',
    confidence_pct: 91,
    risk_level: 'LOW',
    rationale: 'Shedding non-essential industrial load eliminates peak demand surge at 18:15 window.',
    status: 'PENDING',
  },
  {
    id: 'REC_03',
    index_num: '03',
    priority: 'HIGH',
    action: 'INCREASE INTER-REGION TRANSFER',
    target_node: 'LINE_R02_R03',
    impact_mw: 150,
    cost_delta_usd: 450,
    emission_delta_tons: 0.0,
    expected_impact_desc: 'Reduce congestion',
    confidence_pct: 88,
    risk_level: 'LOW',
    rationale: 'Rerouting power from Highland Wind Corridor to Metro Central reduces transmission utilization from 96% to 74%.',
    status: 'PENDING',
  },
];

export const goldenScenarios: ScenarioCardData[] = [
  {
    id: 'SCEN_A',
    title: 'DO NOTHING',
    description: 'Baseline unmitigated grid operation under current solar derating and peak demand surge.',
    curtailment_mw: 820,
    reserve_margin_gw: -0.4,
    risk_level: 'HIGH',
    is_recommended: false,
  },
  {
    id: 'SCEN_B',
    title: 'BESS ONLY',
    description: 'Discharges 350 MW from BESS_03 battery storage without demand response.',
    curtailment_mw: 510,
    reserve_margin_gw: 0.3,
    risk_level: 'MEDIUM',
    is_recommended: false,
    bess_dispatch_mw: 350,
  },
  {
    id: 'SCEN_C',
    title: 'DEMAND RESPONSE',
    description: 'Activates 180 MW flexible demand response across industrial zone R04.',
    curtailment_mw: 610,
    reserve_margin_gw: 0.1,
    risk_level: 'MEDIUM',
    is_recommended: false,
    demand_response_mw: 180,
  },
  {
    id: 'SCEN_D',
    title: 'BESS + DR + TRANSFER',
    description: 'Optimal combined dispatch: BESS_03 (350 MW), DR (180 MW), and Inter-Region Transfer (150 MW).',
    curtailment_mw: 230,
    reserve_margin_gw: 0.8,
    risk_level: 'LOW',
    is_recommended: true,
    bess_dispatch_mw: 350,
    demand_response_mw: 180,
    transfer_mw: 150,
  },
];

export const goldenOptimizationResponse: OptimizationResponse = {
  run_id: 'OPT_GOLDEN_2026',
  created_at: new Date().toISOString(),
  status: 'OPTIMAL',
  total_cost_usd: 3400.92,
  total_emissions_tons: 0.0,
  total_curtailment_mwh: 230.0,
  grid_stress_index: 28.5,
  before_after: {
    curtailment_mwh_before: 820,
    curtailment_mwh_after: 230,
    reserve_gw_before: -0.4,
    reserve_gw_after: 0.8,
    risk_before: 'HIGH',
    risk_after: 'LOW',
  },
  dispatch_schedule: [
    { node_id: 'BESS_03', node_name: 'Battery BESS_03', node_type: 'battery', dispatched_mw: 350, max_capacity_mw: 350, cost_usd: 1750, emissions_kg: 0 },
    { node_id: 'DR_R04', node_name: 'Industrial Demand Response', node_type: 'load_center', dispatched_mw: 180, max_capacity_mw: 200, cost_usd: 1200, emissions_kg: 0 },
    { node_id: 'LINE_R02_R03', node_name: 'Corridor R02->R03 Transfer', node_type: 'substation', dispatched_mw: 150, max_capacity_mw: 200, cost_usd: 450, emissions_kg: 0 },
  ],
  scenarios: goldenScenarios,
};

export const goldenAnomalies: AnomalyItem[] = [
  {
    id: 'ANO_001',
    node_id: 'SOLAR_B17',
    timestamp: '2026-01-01 14:15:00',
    anomaly_score: 0.94,
    is_anomaly: true,
    severity: 'CRITICAL',
    fault_type: 'INVERTER_DERATING',
    affected_metrics: ['inverter_temperature_c (84.2C)', 'inverter_efficiency (0.78)'],
    description: 'SOLAR_B17 inverter derating loss of 23 MW generation capacity.',
    expected_mw: 110,
    actual_mw: 87,
    lost_mw: 23,
  },
  {
    id: 'ANO_002',
    node_id: 'LINE_R02_R03',
    timestamp: '2026-01-01 14:30:00',
    anomaly_score: 0.88,
    is_anomaly: true,
    severity: 'HIGH',
    fault_type: 'TRANSMISSION_CONGESTION',
    affected_metrics: ['utilization_pct (96%)', 'line_flow_mw (480 MW)'],
    description: 'Transmission corridor R02 → R03 at 96% thermal MVA limit.',
  },
  {
    id: 'ANO_003',
    node_id: 'SUB_R01_CENTRAL',
    timestamp: '2026-01-01 15:00:00',
    anomaly_score: 0.76,
    is_anomaly: true,
    severity: 'HIGH',
    fault_type: 'DEMAND_SPIKE',
    affected_metrics: ['frequency_hz (59.3 Hz)', 'voltage_pu (0.92)'],
    description: 'Metro Central industrial load surge predicting 91% spike at 18:15.',
  },
];

export const goldenDemandForecastPoints: ForecastPoint[] = [
  { timestamp: '12:00', predicted_mw: 15200, lower_bound: 14800, upper_bound: 15600, actual: 15150 },
  { timestamp: '13:00', predicted_mw: 15800, lower_bound: 15400, upper_bound: 16200, actual: 15820 },
  { timestamp: '14:00', predicted_mw: 16400, lower_bound: 16000, upper_bound: 16800, actual: 16410 },
  { timestamp: '15:00', predicted_mw: 16800, lower_bound: 16300, upper_bound: 17300, actual: 16800 },
  { timestamp: '16:00', predicted_mw: 17400, lower_bound: 16800, upper_bound: 18000 },
  { timestamp: '17:00', predicted_mw: 18100, lower_bound: 17500, upper_bound: 18700 },
  { timestamp: '18:15', predicted_mw: 18700, lower_bound: 18100, upper_bound: 19300 }, // Peak
  { timestamp: '19:00', predicted_mw: 18300, lower_bound: 17700, upper_bound: 18900 },
  { timestamp: '20:00', predicted_mw: 17500, lower_bound: 16900, upper_bound: 18100 },
  { timestamp: '21:00', predicted_mw: 16200, lower_bound: 15600, upper_bound: 16800 },
];

export const goldenRenewableForecastPoints: ForecastPoint[] = [
  { timestamp: '12:00', predicted_mw: 11400, lower_bound: 11000, upper_bound: 11800, actual: 11350 },
  { timestamp: '13:00', predicted_mw: 11200, lower_bound: 10800, upper_bound: 11600, actual: 11100 },
  { timestamp: '14:00', predicted_mw: 10800, lower_bound: 10400, upper_bound: 11200, actual: 10600 }, // Gap
  { timestamp: '15:00', predicted_mw: 9800, lower_bound: 9300, upper_bound: 10300, actual: 9500 },
  { timestamp: '16:00', predicted_mw: 8200, lower_bound: 7700, upper_bound: 8700 },
  { timestamp: '17:00', predicted_mw: 6400, lower_bound: 5900, upper_bound: 6900 },
  { timestamp: '18:00', predicted_mw: 4200, lower_bound: 3700, upper_bound: 4700 },
  { timestamp: '19:00', predicted_mw: 2800, lower_bound: 2300, upper_bound: 3300 },
];

export const goldenSolarForecastPoints: ForecastPoint[] = [
  { timestamp: '00:00', predicted_mw: 0, lower_bound: 0, upper_bound: 0, actual: 0 },
  { timestamp: '02:00', predicted_mw: 0, lower_bound: 0, upper_bound: 0, actual: 0 },
  { timestamp: '04:00', predicted_mw: 0, lower_bound: 0, upper_bound: 0, actual: 0 },
  { timestamp: '06:00', predicted_mw: 1200, lower_bound: 1000, upper_bound: 1400, actual: 1180 },
  { timestamp: '08:00', predicted_mw: 3200, lower_bound: 3000, upper_bound: 3400, actual: 3150 },
  { timestamp: '10:00', predicted_mw: 4600, lower_bound: 4400, upper_bound: 4800, actual: 4500 },
  { timestamp: '12:00', predicted_mw: 5200, lower_bound: 5000, upper_bound: 5400, actual: 5000 },
  { timestamp: '14:00', predicted_mw: 4800, lower_bound: 4500, upper_bound: 5100, actual: 4400 },
  { timestamp: '16:00', predicted_mw: 3500, lower_bound: 3200, upper_bound: 3800, actual: 3350 },
  { timestamp: '18:00', predicted_mw: 1500, lower_bound: 1200, upper_bound: 1800, actual: 1400 },
  { timestamp: '20:00', predicted_mw: 0, lower_bound: 0, upper_bound: 0, actual: 0 },
  { timestamp: '22:00', predicted_mw: 0, lower_bound: 0, upper_bound: 0, actual: 0 },
];

export const goldenWindForecastPoints: ForecastPoint[] = [
  { timestamp: '00:00', predicted_mw: 5600, lower_bound: 5400, upper_bound: 5800, actual: 5580 },
  { timestamp: '02:00', predicted_mw: 5650, lower_bound: 5450, upper_bound: 5850, actual: 5620 },
  { timestamp: '04:00', predicted_mw: 5700, lower_bound: 5500, upper_bound: 5900, actual: 5690 },
  { timestamp: '06:00', predicted_mw: 5800, lower_bound: 5600, upper_bound: 6000, actual: 5780 },
  { timestamp: '08:00', predicted_mw: 5850, lower_bound: 5650, upper_bound: 6050, actual: 5820 },
  { timestamp: '10:00', predicted_mw: 5900, lower_bound: 5700, upper_bound: 6100, actual: 5890 },
  { timestamp: '12:00', predicted_mw: 6000, lower_bound: 5800, upper_bound: 6200, actual: 5960 },
  { timestamp: '14:00', predicted_mw: 5950, lower_bound: 5750, upper_bound: 6150, actual: 5910 },
  { timestamp: '16:00', predicted_mw: 5900, lower_bound: 5700, upper_bound: 6100, actual: 5870 },
  { timestamp: '18:00', predicted_mw: 5800, lower_bound: 5600, upper_bound: 6000, actual: 5760 },
  { timestamp: '20:00', predicted_mw: 5750, lower_bound: 5550, upper_bound: 5950, actual: 5720 },
  { timestamp: '22:00', predicted_mw: 5700, lower_bound: 5500, upper_bound: 5900, actual: 5680 },
];


export const goldenAssetsList: GridAsset[] = [
  goldenCriticalAsset,
  { asset_id: 'BESS_03', asset_name: 'Industrial Belt Battery BESS_03', asset_type: 'battery', region_id: 'R04', capacity_mw: 350, expected_output_mw: 0, actual_output_mw: 0, variance_mw: 0, performance_pct: 100, health_score: 98, status: 'NORMAL' },
  { asset_id: 'SOLAR_A01', asset_name: 'Metro Rooftop Array A01', asset_type: 'solar', region_id: 'R01', capacity_mw: 80, expected_output_mw: 68, actual_output_mw: 67.5, variance_mw: -0.5, performance_pct: 99.2, health_score: 95, status: 'NORMAL' },
  { asset_id: 'WIND_W01', asset_name: 'Highland Wind Ridge W01', asset_type: 'wind', region_id: 'R03', capacity_mw: 200, expected_output_mw: 145, actual_output_mw: 142, variance_mw: -3, performance_pct: 97.9, health_score: 91, status: 'NORMAL' },
  { asset_id: 'WIND_W02', asset_name: 'Offshore Wind Bay W02', asset_type: 'wind', region_id: 'R05', capacity_mw: 250, expected_output_mw: 190, actual_output_mw: 188, variance_mw: -2, performance_pct: 98.9, health_score: 94, status: 'NORMAL' },
  { asset_id: 'THERMAL_T01', asset_name: 'Metro Gas Peaker T01', asset_type: 'thermal', region_id: 'R01', capacity_mw: 300, expected_output_mw: 120, actual_output_mw: 120, variance_mw: 0, performance_pct: 100, health_score: 92, status: 'NORMAL' },
  { asset_id: 'HYDRO_H01', asset_name: 'Delta Hydro H01', asset_type: 'hydro', region_id: 'R05', capacity_mw: 120, expected_output_mw: 75, actual_output_mw: 75, variance_mw: 0, performance_pct: 100, health_score: 96, status: 'NORMAL' },
  { asset_id: 'SUB_S01', asset_name: 'Central Interconnect Substation S01', asset_type: 'substation', region_id: 'R01', capacity_mw: 600, expected_output_mw: 480, actual_output_mw: 480, variance_mw: 0, performance_pct: 100, health_score: 89, status: 'NORMAL' },
];

export const goldenOperatorBriefMarkdown = `
# ⚡ GRIDPILOT AI — EXECUTIVE OPERATOR BRIEFING

**Operational Status:** 🔴 **ELEVATED RISK** (Grid Stress: \`84 / 100\`)

---

## 📊 EXECUTIVE SUMMARY
- **Grid Stress Index:** \`84 / 100\` (CRITICAL) driven by evening demand surge and solar drop.
- **Demand Peak:** Projected **18.7 GW** at **18:15** (\`91%\` spike probability).
- **Renewable Gap:** Solar & Wind generation expected **11.2 GW**, actual **10.6 GW** (\`-0.6 GW\` variance).
- **Curtailment Risk:** **820 MW** projected between **14:40–16:10** due to R02 → R03 line congestion (\`96%\`).

---

## 🚨 CRITICAL ASSET & ROOT CAUSE DIAGNOSIS
- **Asset:** \`SOLAR_B17\` (Solar Plant B17 - 150 MW Capacity)
- **Status:** **DEGRADED** (Lost Generation: \`23 MW\`, Actual: \`87 MW\` vs Expected: \`110 MW\`)
- **Primary Cause:** **INVERTER DERATING** (\`91%\` confidence score)
- **Evidence:** Inverter temperature hit \`84.2°C\` causing efficiency sag from \`98.2%\` down to \`78.4%\`.

---

## 🎯 RECOMMENDED OPTIMAL ACTIONS (OR-Tools MILP)
1. 🚨 **Discharge BESS_03 (350 MW):** Restores reserve margin from \`-0.4 GW\` to \`+0.8 GW\` instantly.
2. ⚡ **Activate Demand Response (180 MW):** Sheds peak industrial load in R04.
3. 🔹 **Inter-Region Transfer (150 MW):** Relieves R02 → R03 corridor congestion from \`96%\` down to \`74%\`.

---

## 📈 EXPECTED OUTCOME AFTER OPERATOR APPROVAL
- **Curtailment:** \`820 MW → 230 MW\` (72% reduction)
- **Reserve Margin:** \`-0.4 GW → +0.8 GW\` (+1.2 GW improvement)
- **Grid Risk:** \`HIGH → LOW\`
`;

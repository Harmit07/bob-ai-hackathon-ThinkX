import { API_BASE_URL, USE_MOCK_DATA_DEFAULT } from './constants';
import { GridStatus, GridStress } from '@/types/grid';
import { DemandSummary, RenewableSummary, CurtailmentSummary, ReserveSummary, ForecastPoint } from '@/types/forecast';
import { GridAsset, AssetTelemetry } from '@/types/asset';
import { AnomalyItem, RootCauseAnalysis } from '@/types/anomaly';
import { SimulationParams, SimulationResult } from '@/types/simulation';
import { RecommendationAction } from '@/types/recommendation';
import { OptimizationResponse } from '@/types/optimization';

import {
  goldenGridStatus,
  goldenGridStress,
  goldenDemandSummary,
  goldenRenewableSummary,
  goldenCurtailmentSummary,
  goldenReserveSummary,
  goldenCriticalAsset,
  goldenAssetsList,
  goldenAnomalies,
  goldenRCA,
  goldenOptimizationResponse,
  goldenRecommendations,
  goldenDemandForecastPoints,
  goldenRenewableForecastPoints,
  goldenSolarForecastPoints,
  goldenWindForecastPoints,
  goldenOperatorBriefMarkdown,
} from './mock-data';


export const useMockData = USE_MOCK_DATA_DEFAULT;

function rethrowInProduction(error: unknown): void {
  if (!useMockData) throw error;
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  if (useMockData) {
    throw new Error('Using mock data mode');
  }
  const url = `${API_BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    throw new Error(`API Error (${res.status}): ${res.statusText}`);
  }
  return res.json();
}

// 1. GET GRID STATUS
export async function getGridStatus(): Promise<GridStatus> {
  try {
    if (useMockData) return goldenGridStatus;
    const res = await fetchAPI<any>('/api/grid/status');
    return {
      status: (res.status || 'NORMAL') as any,
      grid_stress_index: res.grid_stress ?? 27.1,
      transmission_status: (res.transmission_status || 'CONGESTED') as any,
      reserve_margin_gw: res.reserve_margin_gw ?? -0.4,
      curtailment_risk: (res.curtailment_mw > 500 ? 'HIGH' : 'LOW') as any,
      last_updated: res.timestamp || new Date().toISOString(),
    };
  } catch (err) {
    rethrowInProduction(err);
    console.warn('API fetch failed for getGridStatus, falling back to mock:', err);
    return goldenGridStatus;
  }
}

// 2. GET GRID STRESS
export async function getGridStress(): Promise<GridStress> {
  try {
    if (useMockData) return goldenGridStress;
    const res = await fetchAPI<any>('/api/grid/stress');
    return {
      grid_stress_index: res.score ?? 27.1,
      status: (res.status === 'NORMAL' ? 'LOW' : 'HIGH') as any,
      voltage_health: res.voltage_health ?? 89.2,
      frequency_health: res.frequency_health ?? 91.2,
      congestion_health: res.congestion_health ?? 99.2,
      breakdown: res.breakdown || goldenGridStress.breakdown,
      drivers: [
        `Voltage Penalty: ${res.breakdown?.voltage_penalty || 4.3}`,
        `Frequency Penalty: ${res.breakdown?.frequency_penalty || 2.7}`,
        `Anomaly Penalty: ${res.breakdown?.anomaly_penalty || 20.0}`,
      ],
    };
  } catch (err) {
    rethrowInProduction(err);
    console.warn('API fetch failed for getGridStress, falling back to mock:', err);
    return goldenGridStress;
  }
}

// 3. GET DEMAND FORECAST
export async function getDemandForecast() {
  try {
    if (useMockData) return { summary: goldenDemandSummary, forecast: goldenDemandForecastPoints };
    const res = await fetchAPI<any>('/api/forecast/demand');
    const summary: DemandSummary = {
      current_load_gw: (res.current_demand_mw || 16800) / 1000,
      expected_peak_gw: (res.expected_peak_mw || 18700) / 1000,
      peak_time: res.peak_time || '18:15',
      spike_probability_pct: Math.round((res.spike_probability || 0.91) * 100),
    };
    const forecast: ForecastPoint[] = (res.forecast || []).map((p: any) => ({
      timestamp: p.timestamp,
      predicted_mw: p.predicted,
      actual: p.actual,
      lower_bound: p.lower,
      upper_bound: p.upper,
    }));
    return { summary, forecast, metrics: res.metrics };
  } catch (err) {
    rethrowInProduction(err);
    console.warn('API fetch failed for getDemandForecast, falling back to mock:', err);
    return { summary: goldenDemandSummary, forecast: goldenDemandForecastPoints };
  }
}

// 4. GET RENEWABLE FORECAST
export async function getRenewableForecast() {
  try {
    if (useMockData) {
      return {
        summary: goldenRenewableSummary,
        solar: goldenSolarForecastPoints,
        wind: goldenWindForecastPoints,
        forecast: goldenRenewableForecastPoints,
      };
    }
    const res = await fetchAPI<any>('/api/forecast/renewables');
    const summary: RenewableSummary = {
      expected_gw: (res.expected_mw || 11200) / 1000,
      actual_gw: (res.actual_mw || 10600) / 1000,
      variance_gw: (res.variance_mw || -600) / 1000,
      availability_pct: res.availability_pct || 94,
    };

    const solar: ForecastPoint[] = (res.solar || []).map((p: any) => ({
      timestamp: p.timestamp,
      predicted_mw: p.predicted,
      actual: p.actual,
      lower_bound: p.lower,
      upper_bound: p.upper,
    }));

    const wind: ForecastPoint[] = (res.wind || []).map((p: any) => ({
      timestamp: p.timestamp,
      predicted_mw: p.predicted,
      actual: p.actual,
      lower_bound: p.lower,
      upper_bound: p.upper,
    }));

    return {
      summary,
      solar: solar.length > 0 ? solar : goldenSolarForecastPoints,
      wind: wind.length > 0 ? wind : goldenWindForecastPoints,
      forecast: goldenRenewableForecastPoints,
    };
  } catch (err) {
    rethrowInProduction(err);
    console.warn('API fetch failed for getRenewableForecast, falling back to mock:', err);
    return {
      summary: goldenRenewableSummary,
      solar: goldenSolarForecastPoints,
      wind: goldenWindForecastPoints,
      forecast: goldenRenewableForecastPoints,
    };
  }
}


// 5. GET ASSETS
export async function getAssets(): Promise<GridAsset[]> {
  try {
    if (useMockData) return goldenAssetsList;
    const res = await fetchAPI<any>('/api/assets');
    const rawList = res.assets || [];
    if (Array.isArray(rawList) && rawList.length > 0) {
      return rawList.map((a: any) => ({
        asset_id: a.asset_id,
        asset_name: a.asset_name,
        asset_type: (a.asset_type || a.type || 'solar').toLowerCase() as any,
        region_id: a.region_id || a.region || 'R02',
        capacity_mw: a.capacity_mw || a.capacity || 100,
        expected_output_mw: a.expected_output_mw || a.expected_output || 110,
        actual_output_mw: a.current_output_mw || a.current_output || 87,
        variance_mw: a.variance_mw || a.variance || -23,
        performance_pct: Math.round(((a.current_output_mw || 87) / (a.expected_output_mw || 110)) * 100),
        health_score: a.health_score || a.health || 62,
        status: (a.status || 'NORMAL') as any,
      }));
    }
    return goldenAssetsList;
  } catch (err) {
    rethrowInProduction(err);
    console.warn('API fetch failed for getAssets, falling back to mock:', err);
    return goldenAssetsList;
  }
}

// 6. GET ASSET DETAIL
export async function getAsset(assetId: string): Promise<GridAsset> {
  try {
    if (useMockData) {
      if (assetId === 'SOLAR_B17') return goldenCriticalAsset;
      return (await getAssets()).find((a) => a.asset_id === assetId) || goldenCriticalAsset;
    }
    const a = await fetchAPI<any>(`/api/assets/${assetId}`);
    return {
      asset_id: a.asset_id,
      asset_name: a.asset_name,
      asset_type: (a.asset_type || a.type || 'solar').toLowerCase() as any,
      region_id: a.region_id || a.region || 'R02',
      capacity_mw: a.capacity_mw || a.capacity || 150,
      expected_output_mw: a.expected_output_mw || a.expected_output || 110,
      actual_output_mw: a.current_output_mw || a.current_output || 87,
      variance_mw: a.variance_mw || a.variance || -23,
      performance_pct: Math.round(((a.current_output_mw || 87) / (a.expected_output_mw || 110)) * 100),
      health_score: a.health_score || a.health || 62,
      status: (a.status || 'DEGRADED') as any,
    };
  } catch (err) {
    rethrowInProduction(err);
    console.warn(`API fetch failed for getAsset(${assetId}), falling back to mock:`, err);
    if (assetId === 'SOLAR_B17') return goldenCriticalAsset;
    return goldenCriticalAsset;
  }
}

// 7. GET ASSET TELEMETRY
export async function getAssetTelemetry(assetId: string): Promise<AssetTelemetry[]> {
  try {
    if (useMockData) return [];
    const res = await fetchAPI<any[]>(`/api/assets/${assetId}/telemetry`);
    return res.map((t: any) => ({
      timestamp: t.timestamp,
      asset_id: assetId,
      power_output_mw: t.power_output || 87.0,
      voltage_kv: (t.voltage || 220.5) / 1000,
      current_a: t.current || 394.5,
      temperature_c: t.temperature || 45.2,
      inverter_temperature_c: t.inverter_temperature || 84.2,
      inverter_voltage: t.inverter_voltage || 215.0,
      inverter_efficiency: t.inverter_efficiency || 0.78,
      tracker_angle: 42.0,
      vibration: t.vibration || 1.2,
      frequency_hz: 60.0,
      irradiance_w_m2: 850.0,
    }));
  } catch (err) {
    rethrowInProduction(err);
    console.warn(`API fetch failed for getAssetTelemetry(${assetId}):`, err);
    return [];
  }
}

// 8. GET ANOMALIES
export async function getAnomalies(): Promise<AnomalyItem[]> {
  try {
    if (useMockData) return goldenAnomalies;
    const res = await fetchAPI<any>('/api/anomalies');
    const rawList = res.anomalies || [];
    return rawList.map((a: any) => ({
      id: a.id,
      node_id: a.asset_id,
      timestamp: a.timestamp,
      anomaly_score: a.score,
      is_anomaly: true,
      severity: a.severity as any,
      fault_type: a.description,
      affected_metrics: a.affected_metrics || [],
      description: a.description,
      expected_mw: 110,
      actual_mw: 87,
      lost_mw: 23,
    }));
  } catch (err) {
    rethrowInProduction(err);
    console.warn('API fetch failed for getAnomalies, falling back to mock:', err);
    return goldenAnomalies;
  }
}

// 9. GET RCA
export async function getRCA(assetId: string): Promise<RootCauseAnalysis> {
  try {
    if (useMockData) return goldenRCA;
    const res = await fetchAPI<any>(`/api/anomalies/${assetId}/rca`);
    return {
      anomaly_id: 'ANOM_001',
      node_id: res.asset_id || assetId,
      primary_cause: res.primary_cause || 'Inverter Derating',
      confidence: res.confidence || 0.91,
      contributing_factors: (res.causes || []).map((c: any) => `${c.cause} (${Math.round((c.probability || 0) * 100)}%)`),
      cause_probabilities: (res.causes || []).map((c: any) => ({
        cause: c.cause,
        probability_pct: Math.round((c.probability || 0) * 100),
      })),
      evidence_checklist: (res.evidence || []).map((e: string) => ({
        label: e,
        verified: true,
      })),
      recommended_mitigation: (res.mitigation || []).join('; '),
    };
  } catch (err) {
    rethrowInProduction(err);
    console.warn(`API fetch failed for getRCA(${assetId}), falling back to mock:`, err);
    return goldenRCA;
  }
}

// 10. GET CURTAILMENT RISK
export async function getCurtailmentRisk(): Promise<CurtailmentSummary> {
  try {
    if (useMockData) return goldenCurtailmentSummary;
    const res = await fetchAPI<any>('/api/curtailment/risk');
    return {
      risk_level: (res.risk || 'HIGH') as any,
      expected_mw: res.predicted_curtailment_mw || 820,
      window: `${res.window?.start || '14:00'}–${res.window?.end || '18:00'}`,
      primary_cause: (res.causes || [])[0] || 'Transmission congestion',
      probability_pct: Math.round((res.probability || 0.83) * 100),
    };
  } catch (err) {
    rethrowInProduction(err);
    console.warn('API fetch failed for getCurtailmentRisk, falling back to mock:', err);
    return goldenCurtailmentSummary;
  }
}

// 11. RUN OPTIMIZATION
export async function runOptimization(data?: any): Promise<OptimizationResponse> {
  try {
    if (useMockData) return goldenOptimizationResponse;
    const res = await fetchAPI<any>('/api/optimization/run', {
      method: 'POST',
      body: JSON.stringify(data || {
        demand_change_pct: 0,
        solar_change_pct: 0,
        wind_change_pct: 0,
        battery_available: true,
        transmission_capacity_change_pct: 0,
      }),
    });
    return {
      run_id: res.run_id || 'OPT_A10ABC7',
      created_at: new Date().toISOString(),
      status: res.status || 'OPTIMAL',
      total_cost_usd: res.total_cost_usd || 3400.92,
      total_emissions_tons: res.emissions_tons || 0.0,
      total_curtailment_mwh: res.curtailment_mw || 230,
      grid_stress_index: 27.1,
      before_after: {
        curtailment_mwh_before: 820,
        curtailment_mwh_after: res.curtailment_mw || 230,
        reserve_gw_before: -0.4,
        reserve_gw_after: res.reserve_margin_gw || 0.8,
        risk_before: 'HIGH',
        risk_after: res.risk || 'LOW',
      },
      dispatch_schedule: (res.dispatch || []).map((d: any) => ({
        node_id: d.asset_id,
        node_name: d.asset_id === 'BESS_03' ? 'Battery Storage BESS_03' : 'Demand Response DR_R02',
        node_type: d.type,
        dispatched_mw: d.dispatch_mw,
        max_capacity_mw: 350,
        cost_usd: 1200,
        emissions_kg: 0,
      })),
      scenarios: goldenOptimizationResponse.scenarios,
    };
  } catch (err) {
    rethrowInProduction(err);
    console.warn('API fetch failed for runOptimization, falling back to mock:', err);
    return goldenOptimizationResponse;
  }
}

// 12. RUN SIMULATION
export async function runSimulation(params: SimulationParams): Promise<SimulationResult> {
  try {
    if (!useMockData) {
      const res = await fetchAPI<any>('/api/simulation/run', {
        method: 'POST',
        body: JSON.stringify(params),
      });
      return {
        scenario_name: `Custom What-If Simulation (${res.scenario_id || 'SIM_001'})`,
        risk_before: res.risk_before || 'LOW',
        risk_after: res.risk_after || 'ELEVATED',
        metrics: [
          { metric: 'Grid Stress Score', baseline: `${res.grid_stress_before}`, scenario: `${res.grid_stress_after}`, unit: '/100', direction: res.grid_stress_after > res.grid_stress_before ? 'negative' : 'positive' },
          { metric: 'Curtailment MW', baseline: `${res.curtailment_before_mw} MW`, scenario: `${res.curtailment_after_mw} MW`, unit: 'MW', direction: res.curtailment_after_mw > res.curtailment_before_mw ? 'negative' : 'positive' },
          { metric: 'Reserve Margin', baseline: `${res.reserve_before_gw} GW`, scenario: `${res.reserve_after_gw} GW`, unit: 'GW', direction: res.reserve_after_gw < res.reserve_before_gw ? 'negative' : 'positive' },
        ],
        what_changed_summary: [
          res.ai_interpretation || 'Simulation run evaluated successfully against FastAPI model.',
        ],
      };
    }
  } catch (err) {
    rethrowInProduction(err);
    console.warn('API fetch failed for runSimulation, using simulation fallback:', err);
  }

  const d_change = params.demand_change_pct;
  const scen_demand = (16.8 * (1 + d_change / 100)).toFixed(2);
  const scen_curtail = Math.round(820 * (1 + d_change / 100) * (params.solar_change_pct < 0 ? 1.15 : 0.9));
  const scen_reserve = (-0.4 - d_change * 0.035).toFixed(1);
  const scen_stress = Math.min(100, Math.max(0, 84 + Math.round(d_change * 0.9)));

  return {
    scenario_name: `Custom What-If Run (Demand ${d_change >= 0 ? '+' : ''}${d_change}%, Solar ${params.solar_change_pct >= 0 ? '+' : ''}${params.solar_change_pct}%)`,
    risk_before: 'HIGH',
    risk_after: scen_stress >= 90 ? 'CRITICAL' : scen_stress >= 75 ? 'HIGH' : 'MEDIUM',
    metrics: [
      { metric: 'Demand', baseline: '16.8 GW', scenario: `${scen_demand} GW`, unit: 'GW', direction: d_change > 0 ? 'negative' : 'positive' },
      { metric: 'Curtailment Risk', baseline: '820 MW', scenario: `${scen_curtail} MW`, unit: 'MW', direction: scen_curtail > 820 ? 'negative' : 'positive' },
      { metric: 'Reserve Margin', baseline: '-0.4 GW', scenario: `${scen_reserve} GW`, unit: 'GW', direction: Number(scen_reserve) < -0.4 ? 'negative' : 'positive' },
      { metric: 'Grid Stress Score', baseline: '84 / 100', scenario: `${scen_stress} / 100`, unit: '/100', direction: scen_stress > 84 ? 'negative' : 'positive' },
    ],
    what_changed_summary: [
      `Demand changed by ${d_change >= 0 ? '+' : ''}${d_change}%.`,
      `Reserve margin changed to ${scen_reserve} GW.`,
      `Curtailment expected to hit ${scen_curtail} MW.`,
      `Grid stress score adjusted to ${scen_stress} points.`,
    ],
  };
}

// 13. GET RECOMMENDATIONS
export async function getRecommendations(): Promise<RecommendationAction[]> {
  try {
    if (useMockData) return goldenRecommendations;
    const res = await fetchAPI<any>('/api/recommendations');
    const list = res.recommendations || [];
    return list.map((r: any, idx: number) => ({
      id: r.id,
      index_num: `0${idx + 1}`,
      priority: r.priority as any,
      action: r.action,
      target_node: r.target,
      impact_mw: r.amount_mw,
      cost_delta_usd: r.cost_usd,
      emission_delta_tons: 0,
      expected_impact_desc: r.expected_impact,
      confidence_pct: Math.round((r.confidence || 0.96) * 100),
      risk_level: r.risk as any,
      rationale: r.reason,
      status: r.status as any,
    }));
  } catch (err) {
    rethrowInProduction(err);
    console.warn('API fetch failed for getRecommendations, falling back to mock:', err);
    return goldenRecommendations;
  }
}

// 14. APPROVE RECOMMENDATION
export async function approveRecommendation(id: string) {
  try {
    if (!useMockData) {
      const res = await fetchAPI<any>(`/api/recommendations/${id}/approve`, { method: 'POST' });
      return { success: true, message: res.message || 'Simulation approved — no physical grid equipment was controlled.' };
    }
  } catch (err) {
    rethrowInProduction(err);
    console.warn(`API fetch failed for approveRecommendation(${id}):`, err);
  }
  return { success: true, message: 'Simulation approved — no physical grid equipment was controlled.' };
}

// 15. REJECT RECOMMENDATION
export async function rejectRecommendation(id: string) {
  try {
    if (!useMockData) {
      const res = await fetchAPI<any>(`/api/recommendations/${id}/reject`, { method: 'POST' });
      return { success: true, message: res.message || `Recommendation ${id} rejected.` };
    }
  } catch (err) {
    rethrowInProduction(err);
    console.warn(`API fetch failed for rejectRecommendation(${id}):`, err);
  }
  return { success: true, message: `Recommendation ${id} rejected.` };
}

// 16. MODIFY RECOMMENDATION
export async function modifyRecommendation(id: string, amount_mw: number) {
  try {
    if (!useMockData) {
      const res = await fetchAPI<any>(`/api/recommendations/${id}/modify`, {
        method: 'POST',
        body: JSON.stringify({ amount_mw }),
      });
      return { success: true, message: res.message || `Recommendation ${id} modified to ${amount_mw} MW.` };
    }
  } catch (err) {
    rethrowInProduction(err);
    console.warn(`API fetch failed for modifyRecommendation(${id}):`, err);
  }
  return { success: true, message: `Recommendation ${id} modified to ${amount_mw} MW.` };
}

// 17. GET UNDERPERFORMANCE
export async function getUnderperformance(): Promise<any> {
  try {
    if (useMockData) return null;
    return await fetchAPI<any>('/api/underperformance/');
  } catch (err) {
    rethrowInProduction(err);
    console.warn('API fetch failed for getUnderperformance, returning null:', err);
    return null;
  }
}

// 17b. GET FINANCIAL IMPACT
export async function getFinancialImpact(): Promise<any> {
  try {
    if (useMockData) return null;
    return await fetchAPI<any>('/api/financial/');
  } catch (err) {
    rethrowInProduction(err);
    console.warn('API fetch failed for getFinancialImpact, returning null:', err);
    return null;
  }
}

// 17c. GET HITL QUEUE
export async function getHITLQueue(status?: string): Promise<any> {
  try {
    if (useMockData) return { queue: [], summary: { pending: 0, approved: 0, rejected: 0, deferred: 0 } };
    const qs = status ? `?status=${status}` : '';
    return await fetchAPI<any>(`/api/hitl/queue${qs}`);
  } catch (err) {
    rethrowInProduction(err);
    console.warn('API fetch failed for getHITLQueue, returning empty queue:', err);
    return { queue: [], summary: { pending: 0, approved: 0, rejected: 0, deferred: 0 } };
  }
}

// 17d. REFRESH HITL QUEUE
export async function refreshHITLQueue(): Promise<any> {
  try {
    if (useMockData) return { submitted: [], count: 0 };
    return await fetchAPI<any>('/api/hitl/queue/refresh', { method: 'POST' });
  } catch (err) {
    rethrowInProduction(err);
    console.warn('API fetch failed for refreshHITLQueue:', err);
    return { submitted: [], count: 0 };
  }
}

// 17e. REVIEW HITL ACTION
export async function reviewHITLAction(id: string, decision: string, reviewed_by = 'operator', notes = ''): Promise<any> {
  try {
    if (useMockData) return { success: true };
    return await fetchAPI<any>(`/api/hitl/review/${id}`, {
      method: 'POST',
      body: JSON.stringify({ decision, reviewed_by, notes }),
    });
  } catch (err) {
    rethrowInProduction(err);
    console.warn(`API fetch failed for reviewHITLAction(${id}):`, err);
    return { success: false };
  }
}

// 18. GET OPERATOR BRIEF
export async function getOperatorBrief(): Promise<string> {
  try {
    if (useMockData) return goldenOperatorBriefMarkdown;
    const res = await fetchAPI<any>('/api/operator-brief');
    if (typeof res === 'string') return res;
    if (res.summary) {
      return `### Grid Operations Brief\n\n**Grid Status**: ${res.grid_status || 'NORMAL'} | **Stress Score**: ${res.grid_stress ?? 27.1}\n\n${res.summary}\n\n#### Key Insights\n${(res.insights || []).map((i: string) => `- ${i}`).join('\n')}`;
    }
    return goldenOperatorBriefMarkdown;
  } catch (err) {
    rethrowInProduction(err);
    console.warn('API fetch failed for getOperatorBrief, falling back to mock:', err);
    return goldenOperatorBriefMarkdown;
  }
}

// 18. RUN GRIDPILOT ANALYSIS
export async function runGridPilotAnalysis() {
  try {
    if (useMockData) return goldenOptimizationResponse;
    return await fetchAPI('/api/gridpilot/analyze', { method: 'POST' });
  } catch (err) {
    rethrowInProduction(err);
    console.warn('API fetch failed for runGridPilotAnalysis, falling back to mock:', err);
    return goldenOptimizationResponse;
  }
}

// Export object for backwards compatibility with `import { api } from '@/lib/api'`
export const api = {
  getGridStatus,
  getGridStress,
  getDemandSummary: async () => (await getDemandForecast()).summary,
  getRenewableSummary: async () => (await getRenewableForecast()).summary,
  getCurtailmentSummary: getCurtailmentRisk,
  getReserveSummary: async () => goldenReserveSummary,
  getForecasts: async () => {
    const dem = await getDemandForecast();
    const ren = await getRenewableForecast();
    return {
      demand: dem.forecast,
      renewable: ren.forecast,
      solar: ren.solar,
      wind: ren.wind,
    };
  },

  getAssets,
  getAsset,
  getAssetTelemetry,
  getAnomalies,
  getRCA,
  getCurtailmentRisk,
  getOptimization: runOptimization,
  runSimulation,
  getRecommendations,
  approveRecommendation,
  rejectRecommendation,
  modifyRecommendation,
  getOperatorBrief,
  runGridPilotAnalysis,
  getUnderperformance,
  getFinancialImpact,
  getHITLQueue,
  refreshHITLQueue,
  reviewHITLAction,
};

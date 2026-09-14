from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

# --- Grid Node Schemas ---
class GridNodeBase(BaseModel):
    id: str
    node_name: str
    node_type: str
    max_capacity_mw: float
    current_load_mw: float = 0.0
    cost_per_mwh: float = 50.0
    emission_rate_kg_mwh: float = 0.0
    ramp_rate_mw_h: float = 50.0
    location_lat: Optional[float] = None
    location_lon: Optional[float] = None
    status: str = "active"

class GridNodeCreate(GridNodeBase):
    pass

class GridNodeResponse(GridNodeBase):
    model_config = ConfigDict(from_attributes=True)

# --- Telemetry Schemas ---
class TelemetryRecordBase(BaseModel):
    timestamp: datetime
    node_id: str
    power_mw: float
    voltage_pu: float = 1.0
    frequency_hz: float = 60.0
    solar_irradiance: Optional[float] = 0.0
    wind_speed: Optional[float] = 0.0
    temperature: Optional[float] = 25.0
    congestion_flag: bool = False
    anomaly_score: float = 0.0

class TelemetryRecordCreate(TelemetryRecordBase):
    pass

class TelemetryRecordResponse(TelemetryRecordBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# --- Forecast Schemas ---
class ForecastPoint(BaseModel):
    timestamp: str
    node_id: str
    forecast_type: str
    predicted_mw: float
    lower_bound: float
    upper_bound: float

class ForecastResponse(BaseModel):
    horizon_hours: int
    demand_forecasts: List[ForecastPoint]
    renewable_forecasts: List[ForecastPoint]
    curtailment_risk_forecasts: List[Dict[str, Any]]

# --- Optimization & Simulation Schemas ---
class WhatIfRequest(BaseModel):
    scenario_type: str = Field(..., description="weather_drop, node_outage, ev_surge, storage_expansion")
    affected_node_id: Optional[str] = None
    solar_reduction_pct: Optional[float] = 0.0
    wind_reduction_pct: Optional[float] = 0.0
    demand_increase_pct: Optional[float] = 0.0
    battery_capacity_add_mw: Optional[float] = 0.0

class RecommendationItem(BaseModel):
    id: str
    priority: str # CRITICAL, HIGH, MEDIUM, LOW
    action: str
    target_node: str
    impact_mw: float
    cost_delta_usd: float
    emission_delta_tons: float
    rationale: str

class OptimizationResponse(BaseModel):
    run_id: str
    created_at: datetime
    status: str
    total_cost_usd: float
    total_emissions_tons: float
    total_curtailment_mwh: float
    grid_stress_index: float
    dispatch_schedule: List[Dict[str, Any]]
    recommendations: List[RecommendationItem]

# --- RCA & Anomaly Schemas ---
class AnomalyResult(BaseModel):
    node_id: str
    timestamp: str
    anomaly_score: float
    is_anomaly: bool
    affected_metrics: List[str]
    description: str

class RCAResult(BaseModel):
    anomaly_id: str
    node_id: str
    primary_cause: str
    confidence: float
    contributing_factors: List[str]
    root_cause_tree: Dict[str, Any]
    recommended_mitigation: str

# --- End-to-End Analysis Response ---
class GridPilotAnalysisResponse(BaseModel):
    summary: Dict[str, Any]
    grid_nodes: List[GridNodeResponse]
    grid_stress: Dict[str, Any]
    anomalies: List[AnomalyResult]
    rca_findings: List[RCAResult]
    forecasts: ForecastResponse
    optimization: OptimizationResponse
    operator_brief: str

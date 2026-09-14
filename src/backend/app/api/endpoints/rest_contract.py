from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import pandas as pd
import os

from app.db.database import get_db
from app.db.models import GridNode, TelemetryRecord
from app.ml_engine.demand_forecaster import DemandForecaster
from app.ml_engine.renewable_forecaster import RenewableForecaster
from app.ml_engine.anomaly_detector import GridAnomalyDetector
from app.ml_engine.rca_engine import RCAEngine
from app.ml_engine.grid_stress import calculate_grid_stress_index
from app.optimization.ortools_solver import ORToolsGridOptimizer
from app.optimization.recommendation_engine import RecommendationEngine
from app.copilot_engine.operator_brief import OperatorBriefGenerator

router = APIRouter(tags=["GridPilot REST API Contract"])

demand_forecaster = DemandForecaster()
renewable_forecaster = RenewableForecaster()
anomaly_detector = GridAnomalyDetector()
rca_engine = RCAEngine()
optimizer = ORToolsGridOptimizer()
rec_engine = RecommendationEngine()
brief_generator = OperatorBriefGenerator()

# 1. GRID STATUS
@router.get("/grid/status")
def get_grid_status():
    return {
        "timestamp": "2026-01-01T14:15:00",
        "status": "NORMAL",
        "grid_stress": 27.1,
        "reserve_margin_gw": -0.4,
        "curtailment_mw": 820,
        "transmission_status": "CONGESTED",
        "anomalies": 9
    }

# 2. GRID STRESS
@router.get("/grid/stress")
def get_grid_stress():
    return {
        "score": 27.1,
        "status": "NORMAL",
        "voltage_health": 89.2,
        "frequency_health": 91.2,
        "congestion_health": 99.2,
        "breakdown": {
            "voltage_penalty": 4.3,
            "frequency_penalty": 2.7,
            "congestion_penalty": 0.2,
            "anomaly_penalty": 20.0
        }
    }

# 3. DEMAND FORECAST
@router.get("/forecast/demand")
def get_demand_forecast():
    forecast_points = []
    for i in range(24):
        hour_str = f"{i:02d}:00"
        actual = 16000 + int(i * 120)
        predicted = 16800 + int(i * 120)
        forecast_points.append({
            "timestamp": hour_str,
            "actual": actual,
            "predicted": predicted,
            "lower": actual,
            "upper": actual + 1600
        })
    return {
        "current_demand_mw": 16800,
        "expected_peak_mw": 18700,
        "peak_time": "18:15",
        "spike_probability": 0.91,
        "forecast": forecast_points,
        "metrics": {
            "mae": 18.4,
            "rmse": 27.2,
            "mape": 4.8
        }
    }

# 4. RENEWABLE FORECAST
@router.get("/forecast/renewables")
def get_renewable_forecast():
    solar_points = []
    wind_points = []
    for i in range(24):
        hour_str = f"{i:02d}:00"
        solar_val = max(0, int(5000 * (1 - abs(i - 12) / 8)))
        wind_val = 5600 + (i * 15)
        solar_points.append({
            "timestamp": hour_str,
            "actual": solar_val,
            "predicted": solar_val + 200,
            "lower": max(0, solar_val - 200),
            "upper": solar_val + 400
        })
        wind_points.append({
            "timestamp": hour_str,
            "actual": wind_val,
            "predicted": wind_val + 400,
            "lower": wind_val - 200,
            "upper": wind_val + 600
        })
    return {
        "expected_mw": 11200,
        "actual_mw": 10600,
        "variance_mw": -600,
        "availability_pct": 94,
        "solar": solar_points,
        "wind": wind_points
    }

# 5. ASSETS
@router.get("/assets")
def get_assets():
    return {
        "assets": [
            {
                "asset_id": "SOLAR_B17",
                "asset_name": "Solar Farm B17",
                "asset_type": "Solar",
                "region_id": "R02",
                "capacity_mw": 150,
                "health_score": 62,
                "current_output_mw": 87,
                "expected_output_mw": 110,
                "variance_mw": -23,
                "status": "DEGRADED"
            },
            {
                "asset_id": "BESS_03",
                "asset_name": "Battery Storage BESS_03",
                "asset_type": "Battery",
                "region_id": "R04",
                "capacity_mw": 350,
                "health_score": 98,
                "current_output_mw": 0,
                "expected_output_mw": 0,
                "variance_mw": 0,
                "status": "NORMAL"
            },
            {
                "asset_id": "WIND_W04",
                "asset_name": "Highland Wind Park W04",
                "asset_type": "Wind",
                "region_id": "R03",
                "capacity_mw": 250,
                "health_score": 94,
                "current_output_mw": 210,
                "expected_output_mw": 220,
                "variance_mw": -10,
                "status": "NORMAL"
            },
            {
                "asset_id": "THERMAL_T01",
                "asset_name": "Metro Gas Peaker T01",
                "asset_type": "Thermal",
                "region_id": "R01",
                "capacity_mw": 300,
                "health_score": 91,
                "current_output_mw": 150,
                "expected_output_mw": 150,
                "variance_mw": 0,
                "status": "NORMAL"
            }
        ]
    }

# 6. ASSET DETAIL
@router.get("/assets/{asset_id}")
def get_asset_detail(asset_id: str):
    if asset_id == "SOLAR_B17":
        return {
            "asset_id": "SOLAR_B17",
            "asset_name": "Solar Farm B17",
            "asset_type": "Solar",
            "type": "Solar",
            "region_id": "R02",
            "region": "R02",
            "capacity_mw": 150,
            "capacity": 150,
            "health_score": 62,
            "health": 62,
            "current_output_mw": 87,
            "expected_output_mw": 110,
            "variance_mw": -23,
            "status": "DEGRADED"
        }
    return {
        "asset_id": asset_id,
        "asset_name": f"Asset {asset_id}",
        "asset_type": "Renewable",
        "type": "Renewable",
        "region_id": "R01",
        "region": "R01",
        "capacity_mw": 100,
        "capacity": 100,
        "health_score": 95,
        "health": 95,
        "current_output_mw": 80,
        "expected_output_mw": 85,
        "variance_mw": -5,
        "status": "NORMAL"
    }

# 7. ASSET TELEMETRY
@router.get("/assets/{asset_id}/telemetry")
def get_asset_telemetry(asset_id: str):
    telemetry = []
    for i in range(24):
        hour_str = f"{i:02d}:00"
        is_derated = (asset_id == "SOLAR_B17" and i >= 12)
        telemetry.append({
            "timestamp": hour_str,
            "power_output": 87.0 if is_derated else 110.0,
            "voltage": 215.0 if is_derated else 230.0,
            "current": 394.5 if is_derated else 478.0,
            "temperature": 55.2 if is_derated else 42.1,
            "inverter_temperature": 84.2 if is_derated else 68.0,
            "inverter_efficiency": 0.78 if is_derated else 0.98,
            "inverter_voltage": 215.0 if is_derated else 230.0,
            "vibration": 2.4 if is_derated else 1.1
        })
    return telemetry

# 8. ANOMALIES
@router.get("/anomalies")
def get_anomalies():
    return {
        "anomalies": [
            {
                "id": "ANOM_001",
                "asset_id": "SOLAR_B17",
                "timestamp": "2026-01-01T14:15:00",
                "severity": "HIGH",
                "score": 0.938,
                "affected_metrics": ["generation", "inverter_temperature"],
                "description": "Generation below expected due to Inverter Derating (84.2°C)"
            },
            {
                "id": "ANOM_002",
                "asset_id": "WIND_W04",
                "timestamp": "2026-01-01T13:45:00",
                "severity": "LOW",
                "score": 0.421,
                "affected_metrics": ["vibration"],
                "description": "Minor bearing vibration spike on nacelle #3"
            }
        ]
    }

# 9. RCA
@router.get("/anomalies/{asset_id}/rca")
def get_asset_rca(asset_id: str):
    return {
        "asset_id": asset_id,
        "primary_cause": "Inverter Derating",
        "confidence": 0.91,
        "causes": [
            {"cause": "Inverter Derating", "probability": 0.58},
            {"cause": "High Temperature", "probability": 0.17},
            {"cause": "Soiling", "probability": 0.12},
            {"cause": "Tracker Failure", "probability": 0.08},
            {"cause": "Other", "probability": 0.05}
        ],
        "evidence": [
            "Inverter temp 84.2°C exceeds thermal threshold (75°C)",
            "Inverter conversion efficiency dropped from 98% to 78%",
            "23 MW output loss relative to solar irradiance prediction"
        ],
        "mitigation": [
            "Initiate inverter thermal throttling check",
            "Dispatch secondary cooling fan units",
            "Redistribute load to BESS_03"
        ]
    }

# 10. CURTAILMENT RISK
@router.get("/curtailment/risk")
def get_curtailment_risk():
    return {
        "risk": "HIGH",
        "probability": 0.83,
        "current_curtailment_mw": 820,
        "predicted_curtailment_mw": 820,
        "window": {
            "start": "14:00",
            "end": "18:00"
        },
        "causes": [
            "Transmission congestion on Corridor R02-R04",
            "Solar underperformance on SOLAR_B17"
        ]
    }

# 11. OPTIMIZATION RUN
class OptimizationRunReq(BaseModel):
    demand_change_pct: float = 0.0
    solar_change_pct: float = 0.0
    wind_change_pct: float = 0.0
    battery_available: bool = True
    transmission_capacity_change_pct: float = 0.0

@router.post("/optimization/run")
def run_optimization_endpoint(req: OptimizationRunReq = Body(...)):
    curtail = max(0, int(230 + req.demand_change_pct * 15 - req.solar_change_pct * 10))
    reserve = round(max(-0.4, 0.8 - req.demand_change_pct * 0.05), 1)
    risk = "LOW" if reserve >= 0.5 else "ELEVATED" if reserve >= 0.0 else "HIGH"

    return {
        "run_id": "OPT_A10ABC7",
        "status": "OPTIMAL",
        "total_cost_usd": 3400.92,
        "emissions_tons": 0.0,
        "curtailment_mw": curtail,
        "reserve_margin_gw": reserve,
        "risk": risk,
        "dispatch": [
            {
                "asset_id": "BESS_03",
                "type": "Battery",
                "dispatch_mw": 350
            },
            {
                "asset_id": "DR_R02",
                "type": "Demand Response",
                "dispatch_mw": 180
            }
        ]
    }

# 12. SIMULATION RUN
class SimulationRunReq(BaseModel):
    demand_change_pct: float = 0.0
    solar_change_pct: float = 0.0
    wind_change_pct: float = 0.0
    battery_available: bool = True
    transmission_capacity_change_pct: float = 0.0

@router.post("/simulation/run")
def run_simulation_endpoint(req: SimulationRunReq = Body(...)):
    stress_after = min(100.0, round(27.1 + req.demand_change_pct * 1.2 - req.solar_change_pct * 0.5, 1))
    curtail_after = max(0, int(230 + req.demand_change_pct * 20 - req.solar_change_pct * 12))
    reserve_after = round(max(-0.4, 0.8 - req.demand_change_pct * 0.07), 1)
    risk_after = "LOW" if reserve_after >= 0.5 else "ELEVATED" if reserve_after >= 0.0 else "HIGH"

    return {
        "scenario_id": "SIM_001",
        "grid_stress_before": 27.1,
        "grid_stress_after": stress_after,
        "curtailment_before_mw": 230,
        "curtailment_after_mw": curtail_after,
        "reserve_before_gw": 0.8,
        "reserve_after_gw": reserve_after,
        "risk_before": "LOW",
        "risk_after": risk_after,
        "ai_interpretation": f"Higher demand (+{req.demand_change_pct}%) and altered transmission capacity adjust congestion risk."
    }

# 13. RECOMMENDATIONS
@router.get("/recommendations")
def get_recommendations_endpoint():
    return {
        "recommendations": [
            {
                "id": "REC_001",
                "priority": "HIGH",
                "action": "Dispatch battery",
                "target": "BESS_03",
                "amount_mw": 350,
                "reason": "Peak demand risk and SOLAR_B17 derating loss",
                "expected_impact": "-590 MW curtailment",
                "cost_usd": 1200,
                "risk": "LOW",
                "confidence": 0.96,
                "status": "PENDING"
            },
            {
                "id": "REC_002",
                "priority": "MEDIUM",
                "action": "Activate Demand Response",
                "target": "DR_R02",
                "amount_mw": 180,
                "reason": "High industrial load during peak hours",
                "expected_impact": "-180 MW peak load",
                "cost_usd": 850,
                "risk": "LOW",
                "confidence": 0.92,
                "status": "PENDING"
            }
        ]
    }

# 14. HUMAN-IN-THE-LOOP ACTIONS
@router.post("/recommendations/{id}/approve")
def approve_recommendation(id: str):
    return {
        "id": id,
        "status": "APPROVED",
        "message": "Simulation approved — no physical grid equipment was controlled."
    }

@router.post("/recommendations/{id}/reject")
def reject_recommendation(id: str):
    return {
        "id": id,
        "status": "REJECTED",
        "message": f"Recommendation {id} rejected."
    }

class ModifyReq(BaseModel):
    amount_mw: float

@router.post("/recommendations/{id}/modify")
def modify_recommendation(id: str, req: ModifyReq = Body(...)):
    return {
        "id": id,
        "status": "MODIFIED",
        "amount_mw": req.amount_mw,
        "message": f"Recommendation {id} modified to {req.amount_mw} MW."
    }

# 17. OPERATOR BRIEF
@router.get("/operator-brief")
def get_operator_brief_endpoint():
    return {
        "grid_status": "NORMAL",
        "grid_stress": 27.1,
        "demand": {
            "current_mw": 16800,
            "expected_peak_mw": 18700,
            "peak_time": "18:15"
        },
        "renewables": {
            "expected_mw": 11200,
            "actual_mw": 10600,
            "variance_mw": -600
        },
        "curtailment": {
            "current_mw": 820,
            "predicted_mw": 820
        },
        "critical_assets": ["SOLAR_B17"],
        "recommendations": [
            {
                "id": "REC_001",
                "action": "Dispatch battery",
                "target": "BESS_03",
                "amount_mw": 350
            }
        ],
        "summary": "Grid stress is 27.1 (NORMAL). Demand spike expected at 18:15 (18,700 MW). SOLAR_B17 showing Inverter Derating losing 23 MW. Battery BESS_03 dispatch recommended.",
        "insights": [
            "High solar underperformance in region R02 due to thermal throttling",
            "Transmission corridor R02-R04 is congested",
            "BESS_03 ready for 350 MW discharge to stabilize reserve margin to +0.8 GW"
        ]
    }

# 18. MASTER ANALYSIS ENDPOINT
@router.post("/gridpilot/analyze")
def analyze_master_endpoint():
    return {
        "timestamp": "2026-01-01T14:15:00",
        "grid_status": get_grid_status(),
        "demand_forecast": get_demand_forecast(),
        "renewable_forecast": get_renewable_forecast(),
        "anomalies": get_anomalies()["anomalies"],
        "root_causes": [get_asset_rca("SOLAR_B17")],
        "curtailment": get_curtailment_risk(),
        "grid_stress": get_grid_stress(),
        "optimization": run_optimization_endpoint(OptimizationRunReq()),
        "recommendations": get_recommendations_endpoint()["recommendations"],
        "operator_brief": get_operator_brief_endpoint()
    }

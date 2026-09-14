from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Body
from sqlalchemy.orm import Session
import pandas as pd
from typing import Optional, List, Dict, Any

from app.db.database import get_db
from app.db.models import GridNode
from app.db.schemas import GridPilotAnalysisResponse
from app.ml_engine.csv_validator import validate_and_clean_csv
from app.ml_engine.dataset_generator import generate_synthetic_telemetry
from app.ml_engine.demand_forecaster import DemandForecaster
from app.ml_engine.renewable_forecaster import RenewableForecaster
from app.ml_engine.anomaly_detector import GridAnomalyDetector
from app.ml_engine.rca_engine import RCAEngine
from app.ml_engine.curtailment_predictor import predict_curtailment_risk
from app.ml_engine.grid_stress import calculate_grid_stress_index
from app.optimization.ortools_solver import ORToolsGridOptimizer
from app.optimization.recommendation_engine import RecommendationEngine
from app.copilot_engine.operator_brief import OperatorBriefGenerator

router = APIRouter(tags=["End-to-End Pipeline"])

demand_forecaster = DemandForecaster()
renewable_forecaster = RenewableForecaster()
anomaly_detector = GridAnomalyDetector()
rca_engine = RCAEngine()
optimizer = ORToolsGridOptimizer()
rec_engine = RecommendationEngine()
brief_generator = OperatorBriefGenerator()

@router.post("/analyze")
async def analyze_telemetry_pipeline(
    file: Optional[UploadFile] = File(None),
    telemetry_json: Optional[List[Dict[str, Any]]] = Body(None),
    db: Session = Depends(get_db)
):
    """
    ⚡ End-to-End Pipeline Endpoint:
    Processes uploaded CSV or JSON telemetry through the complete AI analytics engine:
    CSV Validation -> Anomaly Detection -> RCA -> Grid Stress Index -> 24h Forecasting 
    -> OR-Tools MILP Economic Dispatch -> Recommendation Engine -> Executive Operator Brief.
    """
    # 1. Parse & Validate input data
    if file:
        content = await file.read()
        is_valid, errors, df = validate_and_clean_csv(content)
        if not is_valid and df.empty:
            raise HTTPException(status_code=400, detail={"errors": errors})
    elif telemetry_json:
        df = pd.DataFrame(telemetry_json)
        is_valid, errors, df = validate_and_clean_csv(df)
    else:
        # Fallback to generating 48h telemetry if no payload is provided
        df = generate_synthetic_telemetry(num_hours=48, seed=42)

    # 2. Fetch or mock Grid Nodes
    db_nodes = db.query(GridNode).all()
    if db_nodes:
        nodes = [{
            "id": n.id, "node_name": n.node_name, "node_type": n.node_type,
            "max_capacity_mw": n.max_capacity_mw, "current_load_mw": n.current_load_mw,
            "cost_per_mwh": n.cost_per_mwh, "emission_rate_kg_mwh": n.emission_rate_kg_mwh,
            "status": n.status
        } for n in db_nodes]
        nodes_schema = db_nodes
    else:
        from app.db.seed import SEED_NODES
        nodes = SEED_NODES
        nodes_schema = [GridNode(**n) for n in SEED_NODES]

    # 3. Anomaly Detection & RCA Engine
    anomalies = anomaly_detector.detect_anomalies(df)
    rca_findings = []
    for a in anomalies[:5]:
        ctx_rows = df[df["node_id"] == a["node_id"]]
        ctx = ctx_rows.iloc[-1].to_dict() if not ctx_rows.empty else {}
        rca_findings.append(rca_engine.analyze_root_cause(a, ctx))

    # 4. Grid Stress Index
    grid_stress = calculate_grid_stress_index(df, anomalies)

    # 5. ML Demand & Renewable Forecasting
    demand_fc = demand_forecaster.predict_24h(df, horizon_hours=24)
    renewable_fc = renewable_forecaster.predict_24h(df, horizon_hours=24)
    curtailment_fc = predict_curtailment_risk(renewable_fc, demand_fc)

    # 6. OR-Tools MILP Economic Dispatch
    total_dem = sum(f["predicted_mw"] for f in demand_fc[:2])
    total_sol = sum(f["predicted_mw"] for f in renewable_fc if f["forecast_type"] == "solar") / 24.0
    total_wnd = sum(f["predicted_mw"] for f in renewable_fc if f["forecast_type"] == "wind") / 24.0

    opt_res = optimizer.solve_economic_dispatch(
        nodes=nodes,
        total_demand_mw=total_dem if total_dem > 0 else 400.0,
        solar_avail_mw=total_sol if total_sol > 0 else 220.0,
        wind_avail_mw=total_wnd if total_wnd > 0 else 250.0
    )

    # 7. Recommendation Engine
    recs = rec_engine.generate_recommendations(opt_res, grid_stress, anomalies)

    # 8. Operator Markdown Brief
    operator_brief = brief_generator.generate_brief(
        grid_stress=grid_stress,
        anomalies=anomalies,
        rca_findings=rca_findings,
        optimization_res=opt_res,
        recommendations=recs
    )

    return {
        "summary": {
            "records_analyzed": len(df),
            "anomalies_found": len(anomalies),
            "grid_stress_index": grid_stress["grid_stress_index"],
            "grid_status": grid_stress["status"],
            "optimization_status": opt_res["status"],
            "total_cost_usd": opt_res["total_cost_usd"],
            "total_emissions_tons": opt_res["total_emissions_tons"]
        },
        "grid_nodes": nodes_schema,
        "grid_stress": grid_stress,
        "anomalies": anomalies,
        "rca_findings": rca_findings,
        "forecasts": {
            "horizon_hours": 24,
            "demand_forecasts": demand_fc,
            "renewable_forecasts": renewable_fc,
            "curtailment_risk_forecasts": curtailment_fc
        },
        "optimization": {
            "run_id": opt_res["run_id"],
            "created_at": opt_res["created_at"],
            "status": opt_res["status"],
            "total_cost_usd": opt_res["total_cost_usd"],
            "total_emissions_tons": opt_res["total_emissions_tons"],
            "total_curtailment_mwh": opt_res["total_curtailment_mwh"],
            "grid_stress_index": grid_stress["grid_stress_index"],
            "dispatch_schedule": opt_res["dispatch_schedule"],
            "recommendations": recs
        },
        "operator_brief": operator_brief
    }

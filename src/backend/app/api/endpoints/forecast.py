from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
import pandas as pd
from app.db.database import get_db
from app.db.models import TelemetryRecord
from app.ml_engine.dataset_generator import generate_synthetic_telemetry
from app.ml_engine.demand_forecaster import DemandForecaster
from app.ml_engine.renewable_forecaster import RenewableForecaster
from app.ml_engine.curtailment_predictor import predict_curtailment_risk

router = APIRouter(prefix="/forecast", tags=["ML Forecasting"])

demand_forecaster = DemandForecaster()
renewable_forecaster = RenewableForecaster()

@router.get("/24h")
def get_24h_forecasts(
    horizon_hours: int = Query(24, ge=1, le=72),
    db: Session = Depends(get_db)
):
    # Fetch telemetry from DB or generate synthetic
    telemetry_recs = db.query(TelemetryRecord).order_by(TelemetryRecord.timestamp.desc()).limit(500).all()
    if telemetry_recs:
        records = [{
            "timestamp": t.timestamp.isoformat(),
            "node_id": t.node_id,
            "power_mw": t.power_mw,
            "voltage_pu": t.voltage_pu,
            "frequency_hz": t.frequency_hz,
            "solar_irradiance": t.solar_irradiance,
            "wind_speed": t.wind_speed,
            "temperature": t.temperature,
            "congestion_flag": t.congestion_flag,
            "anomaly_score": t.anomaly_score
        } for t in telemetry_recs]
        df = pd.DataFrame(records)
    else:
        df = generate_synthetic_telemetry(num_hours=48)

    demand_fc = demand_forecaster.predict_24h(df, horizon_hours=horizon_hours)
    renewable_fc = renewable_forecaster.predict_24h(df, horizon_hours=horizon_hours)
    curtailment_fc = predict_curtailment_risk(renewable_fc, demand_fc)

    return {
        "horizon_hours": horizon_hours,
        "demand_forecasts": demand_fc,
        "renewable_forecasts": renewable_fc,
        "curtailment_risk_forecasts": curtailment_fc
    }

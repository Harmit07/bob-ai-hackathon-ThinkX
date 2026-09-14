from fastapi import APIRouter
from app.services.grid_simulator import generate_current_snapshot
from app.services.forecasting import get_forecast
from app.ml_engine.curtailment_predictor import predict_curtailment_risk

router = APIRouter()


@router.get("/risk")
def get_curtailment_risk():
    """Predict curtailment risk using the ML model against live grid snapshot and 6-hour forecast."""
    snapshot = generate_current_snapshot()
    forecast = get_forecast(hours_ahead=6)
    forecasts = forecast.get("forecasts", [])

    risks = predict_curtailment_risk(forecasts, forecasts)

    # Summarise across forecast horizon
    high_count = sum(1 for r in risks if r["curtailment_risk_level"] == "HIGH")
    med_count  = sum(1 for r in risks if r["curtailment_risk_level"] == "MEDIUM")
    overall_risk = "HIGH" if high_count > 0 else "MEDIUM" if med_count > 0 else "NONE"
    probability  = round(high_count / max(len(risks), 1), 2) if risks else 0.0
    max_excess   = max((r["excess_generation_mw"] for r in risks), default=0.0)

    return {
        "risk": overall_risk,
        "probability": probability,
        "current_curtailment_mw": snapshot.get("curtailment_mw", 0),
        "predicted_curtailment_mw": round(max_excess, 1),
        "window": {
            "start": risks[0]["timestamp"] if risks else "N/A",
            "end": risks[-1]["timestamp"] if risks else "N/A",
        },
        "causes": [
            r["suggested_action"] for r in risks
            if r["curtailment_risk_level"] != "NONE"
        ][:3],
        "hourly_breakdown": risks,
    }

from fastapi import APIRouter
from app.services.grid_simulator import generate_current_snapshot
from app.services.forecasting import get_forecast
from app.services.anomaly_detection import detect_anomalies
from app.services.optimization import optimize_dispatch
from app.services.advisor import generate_advice

router = APIRouter()


@router.get("/")
def full_advisory():
    """
    Full AI advisory: snapshot + anomaly detection + optimization + RCA narrative.
    This is the primary endpoint consumed by the dashboard.
    """
    snapshot = generate_current_snapshot()
    forecast = get_forecast(hours_ahead=24)
    anomalies = detect_anomalies(snapshot)
    optimization = optimize_dispatch(snapshot, forecast)
    advice = generate_advice(snapshot, anomalies, optimization)

    return {
        "snapshot": snapshot,
        "forecast": forecast,
        "anomalies": anomalies,
        "optimization": optimization,
        "advice": advice,
    }

from fastapi import APIRouter
from app.services.grid_simulator import generate_current_snapshot
from app.services.forecasting import get_forecast
from app.services.anomaly_detection import detect_anomalies
from app.services.optimization import optimize_dispatch
from app.services.event_predictor import predict_grid_events
from app.services.underperformance import detect_underperformance
from app.services.next_best_action import get_next_best_actions
from app.services.operator_brief import generate_operator_brief

router = APIRouter()


@router.get("/")
def get_operator_brief():
    """Generate a full integrated shift brief for grid operators."""
    snapshot = generate_current_snapshot()
    forecast = get_forecast(hours_ahead=12)
    anomalies = detect_anomalies(snapshot)
    optimization = optimize_dispatch(snapshot, forecast)
    events = predict_grid_events(snapshot, hours_ahead=6)
    underperf = detect_underperformance(snapshot)
    nba = get_next_best_actions(snapshot, underperf)

    brief = generate_operator_brief(
        snapshot, forecast, anomalies, optimization, events, underperf, nba
    )
    return brief

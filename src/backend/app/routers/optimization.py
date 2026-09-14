from fastapi import APIRouter
from app.services.grid_simulator import generate_current_snapshot
from app.services.forecasting import get_forecast
from app.services.optimization import optimize_dispatch

router = APIRouter()


@router.get("/")
def optimize():
    """Return optimized dispatch plan for current conditions."""
    snapshot = generate_current_snapshot()
    forecast = get_forecast(hours_ahead=12)
    result = optimize_dispatch(snapshot, forecast)
    return {"snapshot": snapshot, **result}

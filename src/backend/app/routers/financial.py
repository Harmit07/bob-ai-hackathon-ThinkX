from fastapi import APIRouter
from app.services.grid_simulator import generate_current_snapshot
from app.services.optimization import optimize_dispatch
from app.services.forecasting import get_forecast
from app.services.financial_impact import calculate_financial_impact

router = APIRouter()


@router.get("/")
def get_financial_impact():
    """Calculate real-time financial and environmental impact metrics."""
    snapshot = generate_current_snapshot()
    forecast = get_forecast(hours_ahead=12)
    optimization = optimize_dispatch(snapshot, forecast)
    return calculate_financial_impact(snapshot, optimization)

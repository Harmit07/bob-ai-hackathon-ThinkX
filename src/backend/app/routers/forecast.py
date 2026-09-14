from fastapi import APIRouter
from app.services.forecasting import get_forecast

router = APIRouter()


@router.get("/")
def forecast(hours: int = 24):
    """24-hour ahead load + renewable forecast."""
    hours = min(max(1, hours), 72)
    return {"forecast": get_forecast(hours_ahead=hours), "hours_ahead": hours}

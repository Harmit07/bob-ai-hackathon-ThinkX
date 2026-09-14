from fastapi import APIRouter
from app.services.grid_simulator import generate_current_snapshot, generate_historical_series

router = APIRouter()


@router.get("/snapshot")
def get_snapshot():
    """Real-time grid snapshot."""
    return generate_current_snapshot()


@router.get("/history")
def get_history(hours: int = 48):
    """Historical grid data (up to 720 hours)."""
    hours = min(max(1, hours), 720)
    return {"records": generate_historical_series(hours=hours), "count": hours}

from fastapi import APIRouter
from app.services.grid_simulator import generate_current_snapshot
from app.services.underperformance import detect_underperformance

router = APIRouter()


@router.get("/")
def get_underperformance():
    """Detect renewable asset underperformance vs expected output."""
    snapshot = generate_current_snapshot()
    return detect_underperformance(snapshot)

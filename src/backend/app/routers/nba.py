from fastapi import APIRouter
from app.services.grid_simulator import generate_current_snapshot
from app.services.underperformance import detect_underperformance
from app.services.next_best_action import get_next_best_actions

router = APIRouter()


@router.get("/")
def get_next_best_action():
    """Return ranked AI next-best-action recommendations."""
    snapshot = generate_current_snapshot()
    underperf = detect_underperformance(snapshot)
    return get_next_best_actions(snapshot, underperf)

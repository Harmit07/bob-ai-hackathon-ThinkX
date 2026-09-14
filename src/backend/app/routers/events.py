from fastapi import APIRouter
from app.services.grid_simulator import generate_current_snapshot
from app.services.event_predictor import predict_grid_events

router = APIRouter()


@router.get("/")
def get_event_predictions(hours: int = 6):
    """Predict probability of grid events in the next 1–6 hours."""
    hours = min(max(1, hours), 12)
    snapshot = generate_current_snapshot()
    return predict_grid_events(snapshot, hours_ahead=hours)

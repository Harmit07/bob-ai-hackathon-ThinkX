from fastapi import APIRouter
from app.services.grid_simulator import generate_current_snapshot
from app.services.anomaly_detection import detect_anomalies

router = APIRouter()


@router.get("/")
def anomaly_check():
    """Run anomaly detection on current grid state."""
    snapshot = generate_current_snapshot()
    result = detect_anomalies(snapshot)
    return {"snapshot": snapshot, **result}

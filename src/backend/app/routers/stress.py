from fastapi import APIRouter
from app.services.grid_simulator import generate_current_snapshot
from app.services.grid_stress import compute_grid_stress_score

router = APIRouter()


@router.get("/")
def get_grid_stress():
    """Return composite grid stress score with dimension breakdown."""
    snapshot = generate_current_snapshot()
    return compute_grid_stress_score(snapshot)

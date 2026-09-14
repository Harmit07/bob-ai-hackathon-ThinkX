from fastapi import APIRouter, Body
from pydantic import BaseModel
from typing import Optional
from app.services.hitl_approval import (
    get_action_queue,
    review_action,
    get_queue_summary,
    auto_submit_nba_actions,
)
from app.services.grid_simulator import generate_current_snapshot
from app.services.underperformance import detect_underperformance
from app.services.next_best_action import get_next_best_actions

router = APIRouter()


class ReviewRequest(BaseModel):
    decision: str               # "approved" | "rejected" | "deferred"
    reviewed_by: str = "operator"
    notes: str = ""


@router.get("/queue")
def get_queue(status: Optional[str] = None):
    """Get the action approval queue."""
    return {
        "queue": get_action_queue(status_filter=status),
        "summary": get_queue_summary(),
    }


@router.post("/queue/refresh")
def refresh_queue():
    """Auto-submit latest NBA recommendations to the approval queue."""
    snapshot = generate_current_snapshot()
    underperf = detect_underperformance(snapshot)
    nba = get_next_best_actions(snapshot, underperf)
    submitted = auto_submit_nba_actions(nba["recommended_actions"])
    return {
        "submitted": submitted,
        "count": len(submitted),
        "queue_summary": get_queue_summary(),
    }


@router.post("/review/{record_id}")
def review(record_id: str, body: ReviewRequest):
    """Submit a human review decision for an action."""
    result = review_action(
        record_id=record_id,
        decision=body.decision,
        reviewed_by=body.reviewed_by,
        notes=body.notes,
    )
    return result

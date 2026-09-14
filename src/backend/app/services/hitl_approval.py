"""
Human-in-the-Loop Approval System.
Provides an action queue where AI recommendations can be reviewed,
approved, rejected, or deferred by grid operators.
Stores pending actions in-memory (stateful per session).
"""
from typing import Dict, Any, List, Optional
from datetime import datetime
import uuid

# In-memory action queue (resets on server restart — fine for demo)
_action_queue: List[Dict[str, Any]] = []


def _new_id() -> str:
    return str(uuid.uuid4())[:8]


def submit_action_for_approval(
    action_id: str,
    name: str,
    description: str,
    category: str,
    impact_mw: float,
    impact_metric: str,
    effectiveness_score: int,
    source: str = "ai_advisor",
) -> Dict[str, Any]:
    """Submit an AI-recommended action for human approval."""
    record = {
        "id": _new_id(),
        "action_id": action_id,
        "name": name,
        "description": description,
        "category": category,
        "impact_mw": impact_mw,
        "impact_metric": impact_metric,
        "effectiveness_score": effectiveness_score,
        "source": source,
        "status": "pending",
        "submitted_at": datetime.utcnow().isoformat() + "Z",
        "reviewed_at": None,
        "reviewed_by": None,
        "notes": None,
    }
    _action_queue.append(record)
    return record


def get_action_queue(status_filter: Optional[str] = None) -> List[Dict[str, Any]]:
    """Return the action queue, optionally filtered by status."""
    if status_filter:
        return [a for a in _action_queue if a["status"] == status_filter]
    return list(_action_queue)


def review_action(
    record_id: str,
    decision: str,  # "approved" | "rejected" | "deferred"
    reviewed_by: str = "operator",
    notes: str = "",
) -> Dict[str, Any]:
    """
    Record a human decision on a pending action.
    decision must be one of: approved, rejected, deferred.
    """
    if decision not in ("approved", "rejected", "deferred"):
        return {"error": "decision must be 'approved', 'rejected', or 'deferred'"}

    for action in _action_queue:
        if action["id"] == record_id:
            action["status"] = decision
            action["reviewed_at"] = datetime.utcnow().isoformat() + "Z"
            action["reviewed_by"] = reviewed_by
            action["notes"] = notes
            return action

    return {"error": f"Action ID '{record_id}' not found"}


def auto_submit_nba_actions(nba_actions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Auto-submit top Next-Best-Actions into the approval queue.
    Only submits if not already queued.
    """
    submitted = []
    existing_ids = {a["action_id"] for a in _action_queue if a["status"] == "pending"}

    for action in nba_actions[:3]:
        if action["action_id"] not in existing_ids and action["action_id"] != "monitor":
            record = submit_action_for_approval(
                action_id=action["action_id"],
                name=action["name"],
                description=action["description"],
                category=action["category"],
                impact_mw=action.get("impact_mw", 0),
                impact_metric=action.get("impact_metric", ""),
                effectiveness_score=action.get("effectiveness_score", 50),
                source="ai_next_best_action",
            )
            submitted.append(record)

    return submitted


def get_queue_summary() -> Dict[str, Any]:
    """Return summary statistics of the action queue."""
    total = len(_action_queue)
    pending = sum(1 for a in _action_queue if a["status"] == "pending")
    approved = sum(1 for a in _action_queue if a["status"] == "approved")
    rejected = sum(1 for a in _action_queue if a["status"] == "rejected")
    deferred = sum(1 for a in _action_queue if a["status"] == "deferred")

    return {
        "total": total,
        "pending": pending,
        "approved": approved,
        "rejected": rejected,
        "deferred": deferred,
    }

from fastapi import APIRouter, Query
from typing import Optional
from app.services.grid_simulator import generate_current_snapshot
from app.services.scenario_simulator import run_scenario, list_scenarios

router = APIRouter()


@router.get("/scenarios")
def get_scenarios():
    """List all available what-if scenarios."""
    return {"scenarios": list_scenarios()}


@router.get("/run")
def run_what_if(scenario_id: str = Query(..., description="Scenario ID to simulate")):
    """Run a what-if scenario and return before/after grid comparison."""
    snapshot = generate_current_snapshot()
    return run_scenario(snapshot, scenario_id)

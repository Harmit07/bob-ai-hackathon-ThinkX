from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
import pandas as pd

from app.db.database import get_db
from app.db.models import GridNode
from app.db.schemas import WhatIfRequest
from app.optimization.ortools_solver import ORToolsGridOptimizer
from app.optimization.what_if_simulator import WhatIfSimulator
from app.optimization.recommendation_engine import RecommendationEngine
from app.ml_engine.dataset_generator import generate_synthetic_telemetry
from app.ml_engine.grid_stress import calculate_grid_stress_index

router = APIRouter(prefix="/optimization", tags=["OR-Tools & Optimization"])

optimizer = ORToolsGridOptimizer()
simulator = WhatIfSimulator(optimizer=optimizer)
rec_engine = RecommendationEngine()

def _get_nodes_dict_list(db: Session) -> List[Dict[str, Any]]:
    nodes = db.query(GridNode).all()
    if not nodes:
        from app.db.seed import SEED_NODES
        return SEED_NODES
    return [{
        "id": n.id,
        "node_name": n.node_name,
        "node_type": n.node_type,
        "max_capacity_mw": n.max_capacity_mw,
        "current_load_mw": n.current_load_mw,
        "cost_per_mwh": n.cost_per_mwh,
        "emission_rate_kg_mwh": n.emission_rate_kg_mwh,
        "ramp_rate_mw_h": n.ramp_rate_mw_h,
        "status": n.status
    } for n in nodes]

@router.post("/solve")
def solve_dispatch(
    total_demand_mw: float = Body(400.0, embed=True),
    solar_avail_mw: float = Body(250.0, embed=True),
    wind_avail_mw: float = Body(280.0, embed=True),
    db: Session = Depends(get_db)
):
    nodes = _get_nodes_dict_list(db)
    res = optimizer.solve_economic_dispatch(
        nodes=nodes,
        total_demand_mw=total_demand_mw,
        solar_avail_mw=solar_avail_mw,
        wind_avail_mw=wind_avail_mw
    )
    return res

@router.post("/what-if")
def run_what_if_simulation(
    req: WhatIfRequest,
    db: Session = Depends(get_db)
):
    nodes = _get_nodes_dict_list(db)
    df = generate_synthetic_telemetry(num_hours=24)

    sim_res = simulator.simulate_scenario(
        nodes=nodes,
        base_df=df,
        scenario_type=req.scenario_type,
        affected_node_id=req.affected_node_id,
        solar_reduction_pct=req.solar_reduction_pct or 0.0,
        wind_reduction_pct=req.wind_reduction_pct or 0.0,
        demand_increase_pct=req.demand_increase_pct or 0.0,
        battery_capacity_add_mw=req.battery_capacity_add_mw or 0.0
    )
    return sim_res

@router.get("/recommendations")
def get_operator_recommendations(db: Session = Depends(get_db)):
    nodes = _get_nodes_dict_list(db)
    df = generate_synthetic_telemetry(num_hours=24)
    opt_res = optimizer.solve_economic_dispatch(nodes, 400.0, 250.0, 280.0)
    grid_stress = calculate_grid_stress_index(df)

    recs = rec_engine.generate_recommendations(opt_res, grid_stress, [])
    return recs

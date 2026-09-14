import pytest
from app.db.seed import SEED_NODES
from app.optimization.ortools_solver import ORToolsGridOptimizer
from app.optimization.what_if_simulator import WhatIfSimulator
from app.ml_engine.dataset_generator import generate_synthetic_telemetry

def test_ortools_optimizer():
    optimizer = ORToolsGridOptimizer()
    res = optimizer.solve_economic_dispatch(
        nodes=SEED_NODES,
        total_demand_mw=400.0,
        solar_avail_mw=200.0,
        wind_avail_mw=220.0
    )
    assert res["status"] in ("OPTIMAL", "FEASIBLE")
    assert res["total_cost_usd"] > 0
    assert len(res["dispatch_schedule"]) > 0

def test_what_if_simulator():
    optimizer = ORToolsGridOptimizer()
    simulator = WhatIfSimulator(optimizer=optimizer)
    df = generate_synthetic_telemetry(num_hours=24)

    sim_res = simulator.simulate_scenario(
        nodes=SEED_NODES,
        base_df=df,
        scenario_type="weather_drop",
        solar_reduction_pct=50.0
    )
    assert "deltas" in sim_res
    assert "baseline" in sim_res
    assert "scenario" in sim_res

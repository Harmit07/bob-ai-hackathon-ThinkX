import copy
from typing import Dict, Any, List
from app.optimization.ortools_solver import ORToolsGridOptimizer
from app.ml_engine.grid_stress import calculate_grid_stress_index
import pandas as pd

class WhatIfSimulator:
    """
    Scenario What-If Simulator evaluating operational impact of grid events.
    """
    def __init__(self, optimizer: ORToolsGridOptimizer = None):
        self.optimizer = optimizer or ORToolsGridOptimizer()

    def simulate_scenario(
        self,
        nodes: List[Dict[str, Any]],
        base_df: pd.DataFrame,
        scenario_type: str,
        affected_node_id: str = None,
        solar_reduction_pct: float = 0.0,
        wind_reduction_pct: float = 0.0,
        demand_increase_pct: float = 0.0,
        battery_capacity_add_mw: float = 0.0
    ) -> Dict[str, Any]:
        """
        Executes baseline run and mutated scenario run to yield delta analytics.
        """
        # Baseline inputs
        base_solar = 250.0
        base_wind = 280.0
        base_demand = 400.0

        # Baseline optimization & stress
        base_opt = self.optimizer.solve_economic_dispatch(
            nodes=nodes,
            total_demand_mw=base_demand,
            solar_avail_mw=base_solar,
            wind_avail_mw=base_wind
        )
        base_stress = calculate_grid_stress_index(base_df)

        # Mutate scenario nodes
        scen_nodes = copy.deepcopy(nodes)
        scen_solar = base_solar
        scen_wind = base_wind
        scen_demand = base_demand
        scen_df = base_df.copy()

        scenario_name = scenario_type.upper()

        if scenario_type == "weather_drop":
            sol_drop = solar_reduction_pct if solar_reduction_pct > 0 else 50.0
            wnd_drop = wind_reduction_pct if wind_reduction_pct > 0 else 40.0
            scen_solar *= (1.0 - sol_drop / 100.0)
            scen_wind *= (1.0 - wnd_drop / 100.0)
            scenario_name = f"Extreme Weather Event ({sol_drop}% Solar / {wnd_drop}% Wind Drop)"

        elif scenario_type == "node_outage":
            target = affected_node_id or "NODE_SOLAR_01"
            for n in scen_nodes:
                if n["id"] == target:
                    n["status"] = "offline"
            scen_df.loc[scen_df["node_id"] == target, "power_mw"] = 0.0
            scen_df.loc[scen_df["node_id"] == target, "voltage_pu"] = 0.88
            scenario_name = f"Node Outage ({target} Offline)"

        elif scenario_type == "ev_surge":
            surge = demand_increase_pct if demand_increase_pct > 0 else 30.0
            scen_demand *= (1.0 + surge / 100.0)
            scen_df["power_mw"] *= (1.0 + surge / 100.0)
            scenario_name = f"EV Demand Surge (+{surge}% Load)"

        elif scenario_type == "storage_expansion":
            b_add = battery_capacity_add_mw if battery_capacity_add_mw > 0 else 100.0
            scen_nodes.append({
                "id": f"NODE_BATTERY_NEW_{b_add:.0f}MW",
                "node_name": f"New Storage Unit ({b_add} MW)",
                "node_type": "battery",
                "max_capacity_mw": b_add,
                "current_load_mw": 0.0,
                "cost_per_mwh": 4.0,
                "emission_rate_kg_mwh": 0.0,
                "status": "active"
            })
            scenario_name = f"BESS Battery Expansion (+{b_add} MW)"

        # Solve scenario
        scen_opt = self.optimizer.solve_economic_dispatch(
            nodes=scen_nodes,
            total_demand_mw=scen_demand,
            solar_avail_mw=scen_solar,
            wind_avail_mw=scen_wind
        )
        scen_stress = calculate_grid_stress_index(scen_df)

        # Compute Deltas
        cost_delta = round(scen_opt["total_cost_usd"] - base_opt["total_cost_usd"], 2)
        emiss_delta = round(scen_opt["total_emissions_tons"] - base_opt["total_emissions_tons"], 3)
        stress_delta = round(scen_stress["grid_stress_index"] - base_stress["grid_stress_index"], 1)
        curtail_delta = round(scen_opt["total_curtailment_mwh"] - base_opt["total_curtailment_mwh"], 2)

        return {
            "scenario_name": scenario_name,
            "scenario_type": scenario_type,
            "baseline": {
                "total_cost_usd": base_opt["total_cost_usd"],
                "total_emissions_tons": base_opt["total_emissions_tons"],
                "grid_stress_index": base_stress["grid_stress_index"],
                "curtailment_mwh": base_opt["total_curtailment_mwh"]
            },
            "scenario": {
                "total_cost_usd": scen_opt["total_cost_usd"],
                "total_emissions_tons": scen_opt["total_emissions_tons"],
                "grid_stress_index": scen_stress["grid_stress_index"],
                "curtailment_mwh": scen_opt["total_curtailment_mwh"],
                "dispatch_schedule": scen_opt["dispatch_schedule"]
            },
            "deltas": {
                "cost_delta_usd": cost_delta,
                "emissions_delta_tons": emiss_delta,
                "grid_stress_delta": stress_delta,
                "curtailment_delta_mwh": curtail_delta
            }
        }

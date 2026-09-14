import uuid
from datetime import datetime
from typing import Dict, List, Any
from ortools.linear_solver import pywraplp

class ORToolsGridOptimizer:
    """
    MILP Economic Dispatch & Unit Commitment Solver using Google OR-Tools.
    """
    def __init__(self, carbon_tax_per_ton: float = 50.0):
        self.carbon_tax_per_ton = carbon_tax_per_ton

    def solve_economic_dispatch(
        self,
        nodes: List[Dict[str, Any]],
        total_demand_mw: float,
        solar_avail_mw: float,
        wind_avail_mw: float
    ) -> Dict[str, Any]:
        """
        Solves 1-step or multi-step MILP economic dispatch problem.
        """
        solver = pywraplp.Solver.CreateSolver("CBC")
        if not solver:
            solver = pywraplp.Solver.CreateSolver("GLOP")
            if not solver:
                raise RuntimeError("Google OR-Tools solver CBC/GLOP initialization failed.")

        # Variables map: node_id -> Continuous Variable (0 <= P_i <= MaxCapacity)
        p_vars = {}
        curtailment_var = solver.NumVar(0.0, solar_avail_mw + wind_avail_mw, "curtailment_mw")
        
        # Objective Terms
        objective = solver.Objective()

        # Add generator dispatch decision variables
        for node in nodes:
            n_id = node["id"]
            n_type = node.get("node_type", "thermal")
            max_cap = float(node.get("max_capacity_mw", 100.0))
            cost_per_mwh = float(node.get("cost_per_mwh", 50.0))
            emission_kg = float(node.get("emission_rate_kg_mwh", 0.0))
            status = node.get("status", "active")

            if status != "active":
                max_cap = 0.0 # Offline node cannot generate

            # Bound capacity based on renewable availability
            if n_type == "solar":
                max_cap = min(max_cap, solar_avail_mw)
            elif n_type == "wind":
                max_cap = min(max_cap, wind_avail_mw)
            elif n_type == "load_center" or n_type == "substation":
                continue # Loads and substations are not generators

            var = solver.NumVar(0.0, max_cap, f"p_{n_id}")
            p_vars[n_id] = (var, node)

            # Combined Economic Cost + Carbon Penalty ($ per ton CO2 = $ per 1000 kg)
            carbon_cost_per_mwh = (emission_kg / 1000.0) * self.carbon_tax_per_ton
            total_unit_cost = cost_per_mwh + carbon_cost_per_mwh

            objective.SetCoefficient(var, total_unit_cost)

        # Curtailment penalty ($100 per MWh wasted renewable energy)
        objective.SetCoefficient(curtailment_var, 100.0)
        objective.SetMinimization()

        # Constraint 1: Supply-Demand Balance
        # Sum(Generation) - Curtailment >= Total Demand
        balance_constraint = solver.Constraint(total_demand_mw, solver.infinity(), "power_balance")
        for n_id, (var, _) in p_vars.items():
            balance_constraint.SetCoefficient(var, 1.0)
        balance_constraint.SetCoefficient(curtailment_var, -1.0)

        # Solve the MILP model
        status_code = solver.Solve()

        dispatch_results = []
        total_cost = 0.0
        total_emissions_kg = 0.0
        curtailment_mw = 0.0

        if status_code in (pywraplp.Solver.OPTIMAL, pywraplp.Solver.FEASIBLE):
            status_str = "OPTIMAL" if status_code == pywraplp.Solver.OPTIMAL else "FEASIBLE"
            curtailment_mw = curtailment_var.solution_value()

            for n_id, (var, node) in p_vars.items():
                p_val = var.solution_value()
                em_kg = p_val * float(node.get("emission_rate_kg_mwh", 0.0))
                cost = p_val * float(node.get("cost_per_mwh", 50.0))

                dispatch_results.append({
                    "node_id": n_id,
                    "node_name": node.get("node_name", n_id),
                    "node_type": node.get("node_type", "thermal"),
                    "dispatched_mw": round(p_val, 2),
                    "max_capacity_mw": node.get("max_capacity_mw", 100.0),
                    "cost_usd": round(cost, 2),
                    "emissions_kg": round(em_kg, 2)
                })

                total_cost += cost
                total_emissions_kg += em_kg

            total_cost += curtailment_mw * 100.0 # add curtailment penalty
        else:
            status_str = "INFEASIBLE"

        return {
            "run_id": f"OPT_{uuid.uuid4().hex[:8].upper()}",
            "created_at": datetime.utcnow().isoformat(),
            "status": status_str,
            "total_cost_usd": round(total_cost, 2),
            "total_emissions_tons": round(total_emissions_kg / 1000.0, 3),
            "total_curtailment_mwh": round(curtailment_mw, 2),
            "dispatch_schedule": dispatch_results
        }

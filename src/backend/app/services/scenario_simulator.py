"""
What-If Scenario Simulator.
Allows operators to test "what if" scenarios and see projected grid impact.
Scenarios: add storage, increase demand, drop solar, add wind capacity, etc.
"""
from typing import Dict, Any, List
from datetime import datetime


SCENARIO_CATALOG = {
    "add_storage_200mw": {
        "name": "Add 200 MW Grid Storage",
        "description": "Deploy 200 MW / 800 MWh battery storage system",
        "category": "infrastructure",
        "params": {"storage_added_mw": 200},
    },
    "demand_surge_10pct": {
        "name": "Demand Surge +10%",
        "description": "Simulate sudden 10% increase in electricity demand",
        "category": "demand",
        "params": {"demand_change_pct": 10},
    },
    "demand_drop_15pct": {
        "name": "Demand Drop -15%",
        "description": "Simulate demand-side response or economic slowdown reducing load by 15%",
        "category": "demand",
        "params": {"demand_change_pct": -15},
    },
    "solar_cloud_event": {
        "name": "Solar Cloud Event (−60%)",
        "description": "Simulate sudden cloud cover reducing solar output by 60%",
        "category": "weather",
        "params": {"solar_change_pct": -60},
    },
    "wind_ramp_down": {
        "name": "Wind Ramp-Down (−50%)",
        "description": "Simulate rapid drop in wind speed reducing wind output by 50%",
        "category": "weather",
        "params": {"wind_change_pct": -50},
    },
    "add_wind_capacity_300mw": {
        "name": "Add 300 MW Wind Capacity",
        "description": "Commission 300 MW additional wind generation",
        "category": "infrastructure",
        "params": {"wind_added_mw": 300},
    },
    "conventional_trip": {
        "name": "Conventional Generator Trip (−500 MW)",
        "description": "Simulate sudden loss of 500 MW conventional generation",
        "category": "contingency",
        "params": {"conventional_change_mw": -500},
    },
    "peak_demand_event": {
        "name": "Extreme Peak Demand (+20%)",
        "description": "Simulate heat wave or cold snap driving demand 20% above forecast",
        "category": "extreme",
        "params": {"demand_change_pct": 20},
    },
}


def _apply_scenario(snapshot: Dict, params: Dict) -> Dict:
    """Apply scenario parameters to a snapshot copy."""
    s = dict(snapshot)

    if "demand_change_pct" in params:
        delta = s.get("demand_mw", 4000) * params["demand_change_pct"] / 100
        s["demand_mw"] = max(0, s.get("demand_mw", 4000) + delta)

    if "solar_change_pct" in params:
        delta = s.get("solar_mw", 500) * params["solar_change_pct"] / 100
        s["solar_mw"] = max(0, s.get("solar_mw", 500) + delta)

    if "wind_change_pct" in params:
        delta = s.get("wind_mw", 400) * params["wind_change_pct"] / 100
        s["wind_mw"] = max(0, s.get("wind_mw", 400) + delta)

    if "wind_added_mw" in params:
        s["wind_mw"] = s.get("wind_mw", 400) + params["wind_added_mw"]

    if "conventional_change_mw" in params:
        s["conventional_mw"] = max(0, s.get("conventional_mw", 2000) + params["conventional_change_mw"])

    if "storage_added_mw" in params:
        # Storage absorbs excess renewable
        excess = max(0, s.get("renewable_mw", 0) - s.get("demand_mw", 4000))
        absorbed = min(params["storage_added_mw"], excess)
        s["curtailment_mw"] = max(0, s.get("curtailment_mw", 0) - absorbed)

    # Recalculate derived metrics
    s["renewable_mw"] = s.get("solar_mw", 0) + s.get("wind_mw", 0)
    s["curtailment_mw"] = max(0, s["renewable_mw"] - s["demand_mw"])
    total_cap = 4500 * 1.25
    s["reserve_margin_pct"] = (total_cap - s["demand_mw"]) / total_cap * 100
    s["renewable_penetration_pct"] = s["renewable_mw"] / max(1, s["demand_mw"]) * 100

    return s


def _assess_outcome(original: Dict, simulated: Dict, scenario_id: str) -> Dict:
    """Compare original vs simulated state and assess grid impact."""
    demand_delta = simulated["demand_mw"] - original.get("demand_mw", 4000)
    renewable_delta = simulated["renewable_mw"] - original.get("renewable_mw", 1000)
    curtailment_delta = simulated.get("curtailment_mw", 0) - original.get("curtailment_mw", 0)
    reserve_delta = simulated.get("reserve_margin_pct", 20) - original.get("reserve_margin_pct", 20)

    # Grid stability score (0–100)
    stability = 100.0
    if simulated.get("reserve_margin_pct", 20) < 10:
        stability -= 40
    elif simulated.get("reserve_margin_pct", 20) < 15:
        stability -= 20
    if simulated.get("curtailment_mw", 0) > 200:
        stability -= 15
    if simulated.get("demand_mw", 4000) > 5000:
        stability -= 20
    stability = max(0, min(100, stability))

    risks = []
    opportunities = []

    if simulated.get("reserve_margin_pct", 20) < 12:
        risks.append("Reserve margin critically low — grid stability at risk")
    if simulated.get("curtailment_mw", 0) > 200:
        risks.append(f"{round(simulated['curtailment_mw'])} MW of renewable energy wasted")
    if simulated.get("demand_mw", 0) > 5000:
        risks.append("Demand exceeds comfortable operating range")
    if renewable_delta > 100:
        opportunities.append(f"+{round(renewable_delta)} MW additional renewable generation available")
    if curtailment_delta < -50:
        opportunities.append(f"{round(abs(curtailment_delta))} MW less curtailment — better renewable utilization")
    if reserve_delta > 5:
        opportunities.append(f"Reserve margin improved by {round(reserve_delta, 1)}%")

    return {
        "stability_score": round(stability, 1),
        "demand_delta_mw": round(demand_delta, 1),
        "renewable_delta_mw": round(renewable_delta, 1),
        "curtailment_delta_mw": round(curtailment_delta, 1),
        "reserve_delta_pct": round(reserve_delta, 1),
        "risks": risks,
        "opportunities": opportunities,
        "verdict": "viable" if stability > 60 else "risky" if stability > 35 else "critical",
    }


def run_scenario(snapshot: Dict[str, Any], scenario_id: str) -> Dict[str, Any]:
    """Run a named what-if scenario and return before/after comparison."""
    if scenario_id not in SCENARIO_CATALOG:
        return {"error": f"Unknown scenario: {scenario_id}. Available: {list(SCENARIO_CATALOG.keys())}"}

    catalog_entry = SCENARIO_CATALOG[scenario_id]
    simulated = _apply_scenario(snapshot, catalog_entry["params"])
    outcome = _assess_outcome(snapshot, simulated, scenario_id)

    return {
        "scenario_id": scenario_id,
        "scenario_name": catalog_entry["name"],
        "description": catalog_entry["description"],
        "category": catalog_entry["category"],
        "baseline": {
            "demand_mw": round(snapshot.get("demand_mw", 0), 1),
            "renewable_mw": round(snapshot.get("renewable_mw", 0), 1),
            "curtailment_mw": round(snapshot.get("curtailment_mw", 0), 1),
            "reserve_margin_pct": round(snapshot.get("reserve_margin_pct", 0), 1),
            "renewable_penetration_pct": round(snapshot.get("renewable_penetration_pct", 0), 1),
        },
        "simulated": {
            "demand_mw": round(simulated.get("demand_mw", 0), 1),
            "renewable_mw": round(simulated.get("renewable_mw", 0), 1),
            "curtailment_mw": round(simulated.get("curtailment_mw", 0), 1),
            "reserve_margin_pct": round(simulated.get("reserve_margin_pct", 0), 1),
            "renewable_penetration_pct": round(simulated.get("renewable_penetration_pct", 0), 1),
        },
        "outcome": outcome,
        "run_at": datetime.utcnow().isoformat() + "Z",
    }


def list_scenarios() -> List[Dict[str, Any]]:
    """Return all available scenario definitions."""
    return [
        {"id": k, "name": v["name"], "description": v["description"], "category": v["category"]}
        for k, v in SCENARIO_CATALOG.items()
    ]

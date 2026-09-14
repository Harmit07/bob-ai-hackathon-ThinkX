"""
Grid optimization service using OR-Tools / greedy dispatch.
Determines optimal renewable dispatch, load shifting recommendations,
and curtailment minimization strategy.
"""
from typing import List, Dict, Any


def optimize_dispatch(snapshot: Dict[str, Any], forecast: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Given current grid state and 24-hour forecast, return an optimized
    dispatch plan that minimizes curtailment and maximizes renewable utilization.
    """
    demand = snapshot.get("demand_mw", 4000)
    solar = snapshot.get("solar_mw", 0)
    wind = snapshot.get("wind_mw", 0)
    renewable = solar + wind
    curtailment = snapshot.get("curtailment_mw", 0)

    # --- Greedy dispatch strategy ---
    # Priority: 1) Solar  2) Wind  3) Conventional
    dispatched_solar = min(solar, demand)
    remaining_demand = max(0, demand - dispatched_solar)
    dispatched_wind = min(wind, remaining_demand)
    remaining_demand = max(0, remaining_demand - dispatched_wind)
    dispatched_conventional = remaining_demand
    avoided_curtailment = max(0, renewable - demand)

    # Load shifting recommendation: identify next 6 hours of low demand + high renewable
    shiftable_hours = []
    for rec in forecast[:12]:
        r = rec.get("renewable_mw", 0)
        d = rec.get("demand_mw", 1)
        if r / d > 0.80 and rec.get("curtailment_risk_pct", 0) > 5:
            shiftable_hours.append(rec["timestamp"])

    # Battery / storage recommendation (conceptual)
    storage_charge_mw = max(0.0, renewable - demand * 0.95)
    peak_shaving_available = storage_charge_mw * 0.85  # round-trip efficiency

    # Renewable utilization score (0–100)
    utilization_score = min(100.0, (renewable - curtailment) / max(1, renewable) * 100)

    # Carbon avoidance estimate (0.4 tCO2/MWh for displaced coal/gas)
    carbon_avoided_tco2h = (dispatched_solar + dispatched_wind) * 0.4 / 1000  # per hour

    recommendations = []
    if curtailment > 50:
        recommendations.append({
            "action": "increase_storage_charging",
            "description": f"Charge grid-scale batteries at {round(storage_charge_mw, 1)} MW to absorb {round(curtailment, 1)} MW curtailment",
            "priority": "high",
            "impact_mw": round(curtailment, 1),
        })
    if len(shiftable_hours) > 0:
        recommendations.append({
            "action": "shift_flexible_loads",
            "description": f"Shift industrial loads to {len(shiftable_hours)} upcoming high-renewable hours to reduce curtailment",
            "priority": "medium",
            "impact_mw": round(min(curtailment, 200), 1),
        })
    if dispatched_conventional > 2000:
        recommendations.append({
            "action": "reduce_conventional_dispatch",
            "description": f"Reduce conventional generation by {round(dispatched_conventional * 0.1, 1)} MW — sufficient renewable available",
            "priority": "medium",
            "impact_mw": round(dispatched_conventional * 0.1, 1),
        })
    if snapshot.get("reserve_margin_pct", 20) < 15:
        recommendations.append({
            "action": "activate_demand_response",
            "description": "Activate demand response programs — reserve margin below 15%",
            "priority": "critical",
            "impact_mw": round(demand * 0.05, 1),
        })

    if not recommendations:
        recommendations.append({
            "action": "maintain_current_dispatch",
            "description": "Grid operating within optimal parameters — no immediate action required",
            "priority": "low",
            "impact_mw": 0,
        })

    return {
        "dispatch_plan": {
            "solar_dispatched_mw": round(dispatched_solar, 1),
            "wind_dispatched_mw": round(dispatched_wind, 1),
            "conventional_dispatched_mw": round(dispatched_conventional, 1),
            "curtailment_avoided_mw": round(avoided_curtailment, 1),
        },
        "storage_recommendation": {
            "charge_mw": round(storage_charge_mw, 1),
            "peak_shaving_available_mw": round(peak_shaving_available, 1),
        },
        "renewable_utilization_score": round(utilization_score, 1),
        "carbon_avoided_tco2_per_hour": round(carbon_avoided_tco2h, 3),
        "shiftable_load_windows": shiftable_hours[:4],
        "recommendations": recommendations,
    }

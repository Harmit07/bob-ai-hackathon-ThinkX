"""
AI Next-Best-Action Optimizer.
Evaluates multiple response strategies and ranks them by expected outcome.
Returns ranked action plan with estimated impact for each action.
"""
from typing import Dict, Any, List
from datetime import datetime


ACTION_CATALOG = [
    {
        "id": "charge_storage",
        "name": "Charge Grid-Scale Storage",
        "category": "storage",
        "description": "Charge available battery storage to absorb excess renewable generation",
        "prerequisites": ["excess_renewable"],
        "impact_type": "curtailment_reduction",
    },
    {
        "id": "shift_industrial_loads",
        "name": "Shift Industrial Flexible Loads",
        "category": "demand_response",
        "description": "Dispatch demand response to industrial customers with flexible load schedules",
        "prerequisites": ["curtailment_or_high_demand"],
        "impact_type": "load_balancing",
    },
    {
        "id": "activate_demand_response",
        "name": "Activate Emergency Demand Response",
        "category": "demand_response",
        "description": "Trigger emergency demand response program for interruptible loads",
        "prerequisites": ["low_reserve"],
        "impact_type": "reserve_recovery",
    },
    {
        "id": "redispatch_conventional",
        "name": "Redispatch Conventional Generation",
        "category": "generation",
        "description": "Reduce conventional (gas/coal) dispatch to make room for renewables",
        "prerequisites": ["excess_renewable"],
        "impact_type": "renewable_utilization",
    },
    {
        "id": "export_inter_zonal",
        "name": "Request Inter-Zonal Power Export",
        "category": "transmission",
        "description": "Coordinate with neighboring grid zones to export excess renewable power",
        "prerequisites": ["excess_renewable", "curtailment"],
        "impact_type": "curtailment_reduction",
    },
    {
        "id": "activate_peaking_units",
        "name": "Activate Fast-Start Peaking Units",
        "category": "generation",
        "description": "Bring online gas peaking turbines to restore reserve margin",
        "prerequisites": ["low_reserve"],
        "impact_type": "reserve_recovery",
    },
    {
        "id": "deploy_spinning_reserve",
        "name": "Deploy Spinning Reserve",
        "category": "generation",
        "description": "Activate spinning reserves for frequency support",
        "prerequisites": ["frequency_deviation"],
        "impact_type": "frequency_stabilization",
    },
    {
        "id": "curtailment_controlled",
        "name": "Controlled Renewable Curtailment",
        "category": "generation",
        "description": "Apply controlled curtailment to prevent uncontrolled grid events",
        "prerequisites": ["critical_overgeneration"],
        "impact_type": "grid_stability",
    },
    {
        "id": "nodal_pricing",
        "name": "Activate Nodal Pricing Signals",
        "category": "market",
        "description": "Send real-time price signals to incentivize load shifting to renewable-heavy periods",
        "prerequisites": ["curtailment"],
        "impact_type": "market_optimization",
    },
    {
        "id": "maintenance_check",
        "name": "Dispatch Maintenance Team",
        "category": "maintenance",
        "description": "Send maintenance crew to inspect underperforming renewable assets",
        "prerequisites": ["underperformance"],
        "impact_type": "capacity_recovery",
    },
]


def _check_condition(cond: str, snapshot: Dict, metrics: Dict) -> bool:
    demand = snapshot.get("demand_mw", 4000)
    renewable = snapshot.get("renewable_mw", 1000)
    reserve = snapshot.get("reserve_margin_pct", 20)
    curtailment = snapshot.get("curtailment_mw", 0)
    frequency = snapshot.get("frequency_hz", 60.0)
    underperf = metrics.get("total_deficit_mw", 0)

    conditions = {
        "excess_renewable":       renewable > demand * 0.85,
        "curtailment":            curtailment > 30,
        "curtailment_or_high_demand": curtailment > 30 or demand > 4800,
        "low_reserve":            reserve < 15,
        "frequency_deviation":    abs(frequency - 60.0) > 0.05,
        "critical_overgeneration": renewable > demand * 1.05,
        "underperformance":       underperf > 100,
    }
    return conditions.get(cond, False)


def _estimate_impact(action_id: str, snapshot: Dict) -> Dict[str, Any]:
    demand = snapshot.get("demand_mw", 4000)
    renewable = snapshot.get("renewable_mw", 1000)
    curtailment = snapshot.get("curtailment_mw", 0)
    reserve = snapshot.get("reserve_margin_pct", 20)

    impacts = {
        "charge_storage":        {"mw": round(min(curtailment, 200), 1), "metric": "MW curtailment absorbed", "score": 85},
        "shift_industrial_loads": {"mw": round(demand * 0.04, 1),        "metric": "MW demand shifted",       "score": 72},
        "activate_demand_response": {"mw": round(demand * 0.06, 1),      "metric": "MW demand reduced",       "score": 90},
        "redispatch_conventional": {"mw": round(max(0, renewable - demand * 0.8) * 0.5, 1), "metric": "MW conventional reduced", "score": 78},
        "export_inter_zonal":    {"mw": round(min(curtailment * 0.8, 300), 1), "metric": "MW exported",        "score": 80},
        "activate_peaking_units": {"mw": round(max(0, demand * 0.15 - reserve * 40), 1), "metric": "MW capacity added", "score": 88},
        "deploy_spinning_reserve": {"mw": round(demand * 0.03, 1),       "metric": "MW frequency support",    "score": 92},
        "curtailment_controlled": {"mw": round(max(0, renewable - demand) * 0.9, 1), "metric": "MW controlled curtailment", "score": 65},
        "nodal_pricing":         {"mw": round(demand * 0.02, 1),         "metric": "MW load shifted via pricing", "score": 60},
        "maintenance_check":     {"mw": round(snapshot.get("solar_mw", 0) * 0.05, 1), "metric": "MW capacity recovered", "score": 55},
    }
    return impacts.get(action_id, {"mw": 0, "metric": "unknown", "score": 50})


def get_next_best_actions(snapshot: Dict[str, Any], underperf_metrics: Dict[str, Any]) -> Dict[str, Any]:
    """
    Evaluate all actions against current grid state and return ranked recommendations.
    """
    applicable = []

    for action in ACTION_CATALOG:
        prereqs = action["prerequisites"]
        if all(_check_condition(p, snapshot, underperf_metrics) for p in prereqs):
            impact = _estimate_impact(action["id"], snapshot)
            applicable.append({
                "rank": 0,
                "action_id": action["id"],
                "name": action["name"],
                "category": action["category"],
                "description": action["description"],
                "impact_mw": impact["mw"],
                "impact_metric": impact["metric"],
                "effectiveness_score": impact["score"],
                "impact_type": action["impact_type"],
            })

    # Sort by effectiveness score descending
    applicable.sort(key=lambda x: x["effectiveness_score"], reverse=True)
    for i, a in enumerate(applicable):
        a["rank"] = i + 1

    if not applicable:
        applicable = [{
            "rank": 1,
            "action_id": "monitor",
            "name": "Continue Monitoring",
            "category": "monitoring",
            "description": "Grid is operating within normal parameters — maintain current dispatch",
            "impact_mw": 0,
            "impact_metric": "no action needed",
            "effectiveness_score": 100,
            "impact_type": "monitoring",
        }]

    return {
        "recommended_actions": applicable[:5],
        "total_actions_evaluated": len(ACTION_CATALOG),
        "applicable_actions": len(applicable),
        "top_action": applicable[0]["name"] if applicable else "Monitor",
        "generated_at": datetime.utcnow().isoformat() + "Z",
    }

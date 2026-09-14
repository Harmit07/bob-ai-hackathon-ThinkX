from typing import List, Dict, Any

def predict_curtailment_risk(
    renewable_forecasts: List[Dict[str, Any]],
    demand_forecasts: List[Dict[str, Any]],
    substation_capacity_mw: float = 500.0
) -> List[Dict[str, Any]]:
    """
    Evaluates potential renewable power curtailment risk over the forecast horizon.
    Curtailment happens when Total Renewable Output > Transmission Export Limit + Local Demand.
    """
    # Group forecasts by timestamp
    ts_map: Dict[str, Dict[str, float]] = {}

    for rf in renewable_forecasts:
        ts = rf["timestamp"]
        if ts not in ts_map:
            ts_map[ts] = {"renewable_mw": 0.0, "demand_mw": 0.0}
        ts_map[ts]["renewable_mw"] += rf["predicted_mw"]

    for df in demand_forecasts:
        ts = df["timestamp"]
        if ts not in ts_map:
            ts_map[ts] = {"renewable_mw": 0.0, "demand_mw": 0.0}
        ts_map[ts]["demand_mw"] += df["predicted_mw"]

    curtailment_risks = []
    for ts, values in sorted(ts_map.items()):
        ren_mw = values["renewable_mw"]
        dem_mw = values["demand_mw"]
        
        available_headroom = dem_mw + (substation_capacity_mw * 0.7) # 70% line safety factor
        excess_mw = max(0.0, ren_mw - available_headroom)
        risk_level = "NONE"
        
        if excess_mw > 50.0:
            risk_level = "HIGH"
        elif excess_mw > 0.0:
            risk_level = "MEDIUM"

        curtailment_risks.append({
            "timestamp": ts,
            "total_renewable_mw": round(ren_mw, 2),
            "total_demand_mw": round(dem_mw, 2),
            "excess_generation_mw": round(excess_mw, 2),
            "curtailment_risk_level": risk_level,
            "suggested_action": "Charge Battery Storage or Activate Flexible Demand Response" if excess_mw > 0 else "Optimal"
        })

    return curtailment_risks

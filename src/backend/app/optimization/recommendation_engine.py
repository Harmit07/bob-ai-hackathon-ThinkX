import uuid
from typing import List, Dict, Any

class RecommendationEngine:
    """
    Synthesizes optimization, stress metrics, and anomalies into prioritized operator actions.
    """
    def generate_recommendations(
        self,
        optimization_res: Dict[str, Any],
        grid_stress: Dict[str, Any],
        anomalies: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        recommendations = []
        stress_idx = grid_stress.get("grid_stress_index", 0.0)

        # 1. Critical Voltage/Frequency Emergency Response
        if stress_idx >= 75.0:
            recommendations.append({
                "id": f"REC_{uuid.uuid4().hex[:6].upper()}",
                "priority": "CRITICAL",
                "action": "Immediate Fast Reserve & BESS Emergency Discharge",
                "target_node": "NODE_BATTERY_01",
                "impact_mw": 80.0,
                "cost_delta_usd": 400.0,
                "emission_delta_tons": 0.0,
                "rationale": f"Grid Stress Index reached {stress_idx:.1f}/100 (CRITICAL). Battery reserve discharge required to stabilize grid frequency and voltage."
            })

        # 2. Thermal Peaker vs Renewable Redispatch Optimization
        for d in optimization_res.get("dispatch_schedule", []):
            if "THERMAL" in d["node_id"] and d["dispatched_mw"] > 100.0:
                recommendations.append({
                    "id": f"REC_{uuid.uuid4().hex[:6].upper()}",
                    "priority": "HIGH",
                    "action": "Throttle High-Emission Thermal Peaker Generation",
                    "target_node": d["node_id"],
                    "impact_mw": -30.0,
                    "cost_delta_usd": -2550.0,
                    "emission_delta_tons": -13.5,
                    "rationale": f"Throttling {d['node_name']} by 30 MW lowers carbon emissions by 13.5 tons CO2 and saves $2,550 operating cost."
                })

        # 3. Renewable Curtailment Prevention Action
        curtailment_mwh = optimization_res.get("total_curtailment_mwh", 0.0)
        if curtailment_mwh > 0.0:
            recommendations.append({
                "id": f"REC_{uuid.uuid4().hex[:6].upper()}",
                "priority": "MEDIUM",
                "action": "Activate Battery Charging to Absorb Excess Renewable Generation",
                "target_node": "NODE_BATTERY_01",
                "impact_mw": round(min(100.0, curtailment_mwh), 2),
                "cost_delta_usd": -1200.0,
                "emission_delta_tons": 0.0,
                "rationale": f"Absorbing {curtailment_mwh:.1f} MWh excess solar/wind into battery storage prevents curtailment penalty."
            })

        # 4. Anomaly Node Mitigation
        for a in anomalies[:2]:
            n_id = a.get("node_id", "NODE_SUBSTATION_CENTRAL")
            recommendations.append({
                "id": f"REC_{uuid.uuid4().hex[:6].upper()}",
                "priority": "HIGH" if a.get("anomaly_score", 0) > 0.8 else "MEDIUM",
                "action": f"Execute Substation Diagnostic & Voltage Regulator Calibration",
                "target_node": n_id,
                "impact_mw": 0.0,
                "cost_delta_usd": 150.0,
                "emission_delta_tons": 0.0,
                "rationale": f"Telemetry anomaly detected on {n_id} (Score: {a.get('anomaly_score', 0):.2f}). Inspection prevents line tripping."
            })

        # Default routine optimization recommendation if list is short
        if not recommendations:
            recommendations.append({
                "id": f"REC_{uuid.uuid4().hex[:6].upper()}",
                "priority": "LOW",
                "action": "Maintain Baseline Economic Dispatch Schedule",
                "target_node": "SYSTEM_WIDE",
                "impact_mw": 0.0,
                "cost_delta_usd": 0.0,
                "emission_delta_tons": 0.0,
                "rationale": "Grid operating within normal voltage, frequency, and economic parameters."
            })

        return recommendations

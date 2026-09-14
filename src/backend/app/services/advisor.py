"""
AI Advisor service — Root Cause Analysis + Natural Language recommendations.
Uses rule-based RCA + LLM-style structured reasoning (watsonx.ai placeholder).
"""
from typing import Dict, Any, List


def _classify_situation(snapshot: Dict, anomalies: Dict, optimization: Dict) -> str:
    """Classify the primary grid situation for targeted advice."""
    alerts = anomalies.get("alerts", [])
    alert_types = {a["type"] for a in alerts}

    if "low_reserve" in alert_types:
        return "critical_reserve"
    if "demand_spike" in alert_types:
        return "demand_spike"
    if "high_curtailment" in alert_types:
        return "curtailment_crisis"
    if "frequency_deviation" in alert_types:
        return "frequency_instability"
    if "transmission_congestion" in alert_types:
        return "congestion"
    if optimization.get("renewable_utilization_score", 100) > 90:
        return "optimal"
    return "suboptimal"


def _root_cause_analysis(situation: str, snapshot: Dict, anomalies: Dict) -> Dict[str, Any]:
    """Structured RCA: symptom → cause → contributing factors → recommendation."""
    rca_map = {
        "critical_reserve": {
            "symptom": "Reserve margin critically low",
            "primary_cause": "Demand exceeds available generation capacity",
            "contributing_factors": [
                "Higher-than-forecast electricity demand",
                "Reduced conventional generation availability",
                "Insufficient demand response activation",
            ],
            "immediate_action": "Activate emergency demand response and fast-start peaking units",
            "root_cause_confidence": 0.91,
        },
        "demand_spike": {
            "symptom": f"Demand spike to {snapshot.get('demand_mw', '?')} MW detected",
            "primary_cause": "Sudden increase in electricity consumption beyond forecast",
            "contributing_factors": [
                "Weather-driven load (cooling/heating surge)",
                "Industrial load coming online unexpectedly",
                "Forecast model under-predicted peak demand",
            ],
            "immediate_action": "Dispatch available peaking capacity and issue grid advisory",
            "root_cause_confidence": 0.87,
        },
        "curtailment_crisis": {
            "symptom": f"Renewable curtailment at {snapshot.get('curtailment_mw', '?')} MW",
            "primary_cause": "Renewable generation exceeds local demand + transmission capacity",
            "contributing_factors": [
                "High solar/wind output during low-demand period",
                "Insufficient grid-scale storage capacity",
                "Transmission congestion preventing export to neighboring zones",
                "Inflexible baseload generators cannot ramp down fast enough",
            ],
            "immediate_action": "Charge available storage, activate flexible industrial loads, request inter-zonal export",
            "root_cause_confidence": 0.94,
        },
        "frequency_instability": {
            "symptom": f"Grid frequency deviation at {snapshot.get('frequency_hz', '?')} Hz",
            "primary_cause": "Generation-load imbalance causing frequency excursion",
            "contributing_factors": [
                "Sudden generator trip or renewable output drop",
                "Unexpected load pickup",
                "Automatic Generation Control (AGC) lag",
            ],
            "immediate_action": "Activate frequency response reserves and spinning reserves immediately",
            "root_cause_confidence": 0.89,
        },
        "congestion": {
            "symptom": "High transmission congestion detected",
            "primary_cause": "Power flow approaching thermal limits on key transmission paths",
            "contributing_factors": [
                "High renewable output in generation-heavy zones",
                "Unbalanced load distribution across grid zones",
                "Lack of distributed generation near load centers",
            ],
            "immediate_action": "Redispatch generation to relieve congested lines, activate nodal pricing",
            "root_cause_confidence": 0.83,
        },
        "optimal": {
            "symptom": "Grid operating in optimal state",
            "primary_cause": "Generation and demand are well-balanced with high renewable utilization",
            "contributing_factors": [
                "Favorable weather conditions for solar and wind",
                "Accurate demand forecast",
                "Effective dispatch scheduling",
            ],
            "immediate_action": "Continue current dispatch — monitor for evolving conditions",
            "root_cause_confidence": 0.96,
        },
        "suboptimal": {
            "symptom": "Grid operating below optimal efficiency",
            "primary_cause": "Renewable utilization can be improved",
            "contributing_factors": [
                "Dispatch schedule not fully optimized for current conditions",
                "Opportunity to shift flexible loads to higher-renewable periods",
            ],
            "immediate_action": "Review dispatch schedule and activate load flexibility programs",
            "root_cause_confidence": 0.78,
        },
    }
    return rca_map.get(situation, rca_map["suboptimal"])


def _generate_narrative(situation: str, snapshot: Dict, rca: Dict, opt: Dict) -> str:
    """Generate a human-readable advisory narrative (LLM placeholder — watsonx.ai ready)."""
    renewable_pct = snapshot.get("renewable_penetration_pct", 0)
    score = opt.get("renewable_utilization_score", 0)
    recs = opt.get("recommendations", [])
    top_rec = recs[0]["description"] if recs else "Maintain current operations."

    narratives = {
        "critical_reserve": (
            f"⚠️ CRITICAL: The grid reserve margin has dropped below safe operating limits. "
            f"Current renewable penetration is {renewable_pct}% but cannot compensate for the demand surge. "
            f"Immediate action required: {rca['immediate_action']}."
        ),
        "demand_spike": (
            f"⚡ ALERT: An unexpected demand spike has been detected. "
            f"Demand is currently {snapshot.get('demand_mw', '?')} MW — above forecast levels. "
            f"Renewable utilization score: {score}/100. "
            f"Recommended response: {top_rec}"
        ),
        "curtailment_crisis": (
            f"🌱 CURTAILMENT WARNING: {snapshot.get('curtailment_mw', '?')} MW of clean energy is being wasted. "
            f"The grid has high renewable penetration ({renewable_pct}%) but cannot absorb it all. "
            f"Top optimization action: {top_rec}"
        ),
        "frequency_instability": (
            f"🔴 FREQUENCY ALERT: Grid frequency at {snapshot.get('frequency_hz', '?')} Hz — "
            f"deviating from the 60 Hz nominal. Generation-load balance disrupted. "
            f"Activate reserves immediately. {rca['immediate_action']}."
        ),
        "congestion": (
            f"🚧 CONGESTION: Transmission lines are under stress (index: {snapshot.get('congestion_index', '?')}). "
            f"Renewable energy in generation-heavy zones cannot reach demand centers. "
            f"Action: {top_rec}"
        ),
        "optimal": (
            f"✅ OPTIMAL: Grid is operating efficiently with {renewable_pct}% renewable penetration. "
            f"Renewable utilization score: {score}/100. No immediate intervention needed. "
            f"Continue monitoring forecast for upcoming condition changes."
        ),
        "suboptimal": (
            f"📊 ADVISORY: Grid is functional but operating below peak efficiency. "
            f"Renewable utilization score: {score}/100. "
            f"Opportunity identified: {top_rec}"
        ),
    }
    return narratives.get(situation, narratives["suboptimal"])


def generate_advice(
    snapshot: Dict[str, Any],
    anomalies: Dict[str, Any],
    optimization: Dict[str, Any],
) -> Dict[str, Any]:
    """Main advisor entry point — returns full advisory package."""
    situation = _classify_situation(snapshot, anomalies, optimization)
    rca = _root_cause_analysis(situation, snapshot, anomalies)
    narrative = _generate_narrative(situation, snapshot, rca, optimization)

    return {
        "situation": situation,
        "severity": anomalies.get("severity", "normal"),
        "narrative": narrative,
        "root_cause_analysis": rca,
        "renewable_utilization_score": optimization.get("renewable_utilization_score", 0),
        "carbon_avoided_tco2_per_hour": optimization.get("carbon_avoided_tco2_per_hour", 0),
        "top_recommendations": optimization.get("recommendations", [])[:3],
        "llm_provider": "rule-based-rca (watsonx.ai integration ready)",
    }

"""
Integrated Operator Brief — generates a structured shift briefing document
for grid operators summarizing current state, forecasts, and action priorities.
"""
from typing import Dict, Any, List
from datetime import datetime


def generate_operator_brief(
    snapshot: Dict,
    forecast: List[Dict],
    anomalies: Dict,
    optimization: Dict,
    events: Dict,
    underperf: Dict,
    nba: Dict,
) -> Dict[str, Any]:
    """
    Compose a full operator shift brief from all advisory subsystems.
    """
    now = datetime.utcnow()
    severity = anomalies.get("severity", "normal")
    alerts = anomalies.get("alerts", [])
    predicted_events = events.get("predicted_events", [])
    recommendations = optimization.get("recommendations", [])
    actions = nba.get("recommended_actions", [])

    # Headline status
    if severity == "critical":
        headline = "⚠️ CRITICAL GRID CONDITIONS — IMMEDIATE ACTION REQUIRED"
    elif severity == "high":
        headline = "🔴 HIGH ALERT — Grid stress elevated, close monitoring required"
    elif severity == "medium":
        headline = "🟡 ADVISORY — Grid conditions require operator attention"
    elif severity == "low":
        headline = "🔵 LOW ALERT — Minor anomaly detected, monitor closely"
    else:
        headline = "🟢 NORMAL OPERATIONS — Grid stable, standard monitoring"

    # 4-hour lookahead summary
    high_risk_events = [e for e in predicted_events if e.get("severity") in ("high",)]
    next_critical_event = high_risk_events[0] if high_risk_events else None

    # Top metrics snapshot
    key_metrics = {
        "demand_mw":                round(snapshot.get("demand_mw", 0), 1),
        "renewable_penetration_pct": round(snapshot.get("renewable_penetration_pct", 0), 1),
        "reserve_margin_pct":       round(snapshot.get("reserve_margin_pct", 0), 1),
        "curtailment_mw":           round(snapshot.get("curtailment_mw", 0), 1),
        "frequency_hz":             round(snapshot.get("frequency_hz", 60.0), 3),
        "congestion_index":         round(snapshot.get("congestion_index", 0), 3),
        "renewable_util_score":     round(optimization.get("renewable_utilization_score", 0), 1),
        "carbon_avoided_tco2_hr":   round(optimization.get("carbon_avoided_tco2_per_hour", 0), 3),
    }

    # Forecast peak demand in next 12h
    peak_forecast = max(forecast[:12], key=lambda x: x.get("demand_mw", 0)) if forecast else None
    high_curtailment_windows = [
        f for f in forecast[:12] if f.get("curtailment_risk_pct", 0) > 10
    ]

    # Priority action list (merged from optimization + NBA)
    priority_actions = []
    for a in actions[:3]:
        priority_actions.append({
            "priority": a.get("rank", 0),
            "action": a["name"],
            "reason": a["description"],
            "impact": f"{a.get('impact_mw', 0)} MW — {a.get('impact_metric', '')}",
        })

    # Renewable asset health
    asset_alerts = underperf.get("alerts", [])

    # Sections
    sections = [
        {
            "title": "Current Grid Status",
            "content": f"Demand: {key_metrics['demand_mw']} MW | Renewable: {key_metrics['renewable_penetration_pct']}% | Reserve: {key_metrics['reserve_margin_pct']}% | Frequency: {key_metrics['frequency_hz']} Hz | Congestion: {key_metrics['congestion_index']}"
        },
        {
            "title": "Active Alerts",
            "content": "; ".join([a["message"] for a in alerts]) if alerts else "No active alerts."
        },
        {
            "title": "Forecast Outlook (Next 12h)",
            "content": (
                f"Peak demand expected: {round(peak_forecast['demand_mw'])} MW at {peak_forecast['timestamp'][11:16]} UTC. "
                f"{len(high_curtailment_windows)} hour(s) with curtailment risk >10%."
            ) if peak_forecast else "Forecast unavailable."
        },
        {
            "title": "Predicted Events",
            "content": (
                f"{events.get('event_count', 0)} event(s) predicted in next {events.get('hours_ahead', 6)}h. "
                + (f"Highest risk: {next_critical_event['label']} at {next_critical_event['expected_at'][11:16]} UTC ({round(next_critical_event['probability']*100)}% probability)." if next_critical_event else "No high-risk events predicted.")
            )
        },
        {
            "title": "Renewable Asset Health",
            "content": (
                f"Solar: {underperf.get('solar', {}).get('performance_pct', 100)}% of expected | "
                f"Wind: {underperf.get('wind', {}).get('performance_pct', 100)}% of expected. "
                + (f"{len(asset_alerts)} asset alert(s) active." if asset_alerts else "All assets performing normally.")
            )
        },
        {
            "title": "Recommended Actions",
            "content": " | ".join([f"[{a['priority']}] {a['action']}" for a in priority_actions]) if priority_actions else "No immediate actions required."
        },
    ]

    return {
        "headline": headline,
        "severity": severity,
        "generated_at": now.isoformat() + "Z",
        "shift_period": f"{now.strftime('%Y-%m-%d %H:00')} UTC",
        "key_metrics": key_metrics,
        "sections": sections,
        "priority_actions": priority_actions,
        "next_critical_event": next_critical_event,
        "underperformance_alerts": asset_alerts,
        "active_alert_count": len(alerts),
        "predicted_event_count": events.get("event_count", 0),
    }

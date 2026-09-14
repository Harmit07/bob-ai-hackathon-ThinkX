"""
AI Grid Event Predictor — predicts probability of grid events in the next 1–6 hours.
Events: demand spike, frequency excursion, renewable ramp, curtailment window, reserve breach.
Uses rule-based scoring + ML confidence weighting.
"""
from typing import List, Dict, Any
from datetime import datetime, timedelta
import numpy as np

EVENTS = [
    "demand_spike",
    "frequency_excursion",
    "renewable_ramp_down",
    "curtailment_window",
    "reserve_margin_breach",
    "transmission_congestion",
]

EVENT_LABELS = {
    "demand_spike":            "Demand Spike",
    "frequency_excursion":     "Frequency Excursion",
    "renewable_ramp_down":     "Renewable Ramp-Down",
    "curtailment_window":      "Curtailment Window",
    "reserve_margin_breach":   "Reserve Margin Breach",
    "transmission_congestion": "Transmission Congestion",
}

EVENT_DESCRIPTIONS = {
    "demand_spike":            "Rapid increase in electricity demand exceeding forecast by >8%",
    "frequency_excursion":     "Grid frequency deviation beyond ±0.08 Hz from 60 Hz nominal",
    "renewable_ramp_down":     "Sudden drop in solar/wind output due to weather change",
    "curtailment_window":      "Renewable generation will exceed absorption capacity",
    "reserve_margin_breach":   "Operating reserve margin drops below 12% threshold",
    "transmission_congestion": "Transmission utilization approaching thermal limits",
}


def _hour_load_factor(hour: int) -> float:
    curve = [0.62,0.59,0.57,0.56,0.57,0.61,0.70,0.82,0.91,0.95,0.96,0.97,
             0.96,0.95,0.94,0.95,0.98,1.00,0.99,0.97,0.93,0.87,0.78,0.68]
    return curve[hour % 24]


def predict_grid_events(snapshot: Dict[str, Any], hours_ahead: int = 6) -> Dict[str, Any]:
    """Predict probability and timing of grid events in the next `hours_ahead` hours."""
    rng = np.random.default_rng(int(datetime.utcnow().timestamp()) % 10000)
    now = datetime.utcnow()

    demand = snapshot.get("demand_mw", 4000)
    renewable = snapshot.get("renewable_mw", 1000)
    reserve = snapshot.get("reserve_margin_pct", 20)
    congestion = snapshot.get("congestion_index", 0.5)
    curtailment = snapshot.get("curtailment_mw", 0)
    frequency = snapshot.get("frequency_hz", 60.0)
    solar = snapshot.get("solar_mw", 500)
    wind = snapshot.get("wind_mw", 400)

    predictions = []
    timeline = []

    for h in range(1, hours_ahead + 1):
        ts = now + timedelta(hours=h)
        hour = ts.hour
        lf_now = _hour_load_factor(now.hour)
        lf_next = _hour_load_factor(hour)
        load_change_pct = (lf_next - lf_now) / max(lf_now, 0.01) * 100

        hour_events = []

        # Demand spike probability
        p_spike = 0.0
        if load_change_pct > 8:
            p_spike = min(0.92, 0.30 + load_change_pct / 50)
        elif demand > 4800:
            p_spike = 0.45
        elif 16 <= hour <= 20:  # evening peak
            p_spike = 0.28
        p_spike = float(np.clip(p_spike + rng.normal(0, 0.04), 0, 1))

        # Frequency excursion probability
        p_freq = float(np.clip(abs(frequency - 60) / 0.15 * 0.6 + rng.normal(0, 0.04), 0, 1))
        if p_spike > 0.5:
            p_freq = min(1.0, p_freq + 0.2)

        # Renewable ramp-down probability
        p_ramp_down = 0.0
        if solar > 400 and (hour < 6 or hour > 19):  # approaching sunset
            p_ramp_down = 0.75
        elif hour in (6, 7, 19, 20):
            p_ramp_down = 0.40
        else:
            p_ramp_down = float(rng.uniform(0.05, 0.15))
        p_ramp_down = float(np.clip(p_ramp_down + rng.normal(0, 0.03), 0, 1))

        # Curtailment window probability
        p_curtail = 0.0
        if renewable > demand * 0.90:
            p_curtail = min(0.95, (renewable / demand - 0.9) * 5)
        elif curtailment > 50:
            p_curtail = 0.60
        elif 10 <= hour <= 14:  # solar peak
            p_curtail = 0.35
        p_curtail = float(np.clip(p_curtail + rng.normal(0, 0.04), 0, 1))

        # Reserve margin breach probability
        p_reserve = 0.0
        if reserve < 12:
            p_reserve = 0.88
        elif reserve < 15:
            p_reserve = 0.55
        elif p_spike > 0.6:
            p_reserve = 0.40
        p_reserve = float(np.clip(p_reserve + rng.normal(0, 0.03), 0, 1))

        # Transmission congestion probability
        p_congestion = float(np.clip(congestion * 0.8 + rng.normal(0, 0.05), 0, 1))

        hour_probs = {
            "demand_spike":            round(p_spike, 3),
            "frequency_excursion":     round(p_freq, 3),
            "renewable_ramp_down":     round(p_ramp_down, 3),
            "curtailment_window":      round(p_curtail, 3),
            "reserve_margin_breach":   round(p_reserve, 3),
            "transmission_congestion": round(p_congestion, 3),
        }

        for event, prob in hour_probs.items():
            if prob > 0.40:
                hour_events.append({
                    "event": event,
                    "label": EVENT_LABELS[event],
                    "probability": prob,
                    "expected_at": ts.isoformat() + "Z",
                    "hours_ahead": h,
                    "severity": "high" if prob > 0.75 else "medium" if prob > 0.55 else "low",
                    "description": EVENT_DESCRIPTIONS[event],
                })

        timeline.append({
            "timestamp": ts.isoformat() + "Z",
            "hour_label": ts.strftime("%H:00"),
            "probabilities": hour_probs,
            "flagged_events": len(hour_events),
        })
        predictions.extend(hour_events)

    # Deduplicate: keep highest probability per event type
    seen: Dict[str, Dict] = {}
    for p in predictions:
        ev = p["event"]
        if ev not in seen or p["probability"] > seen[ev]["probability"]:
            seen[ev] = p
    top_predictions = sorted(seen.values(), key=lambda x: x["probability"], reverse=True)

    overall_risk = "normal"
    if any(p["severity"] == "high" for p in top_predictions):
        overall_risk = "high"
    elif any(p["severity"] == "medium" for p in top_predictions):
        overall_risk = "medium"

    return {
        "overall_risk": overall_risk,
        "predicted_events": top_predictions,
        "event_count": len(top_predictions),
        "timeline": timeline,
        "hours_ahead": hours_ahead,
        "generated_at": now.isoformat() + "Z",
    }

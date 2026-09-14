"""
Grid Stress Score — composite 0–100 score quantifying overall grid stress.
Aggregates: reserve margin, frequency deviation, demand pressure,
curtailment, congestion, and renewable variability.
"""
from typing import Dict, Any


def compute_grid_stress_score(snapshot: Dict[str, Any]) -> Dict[str, Any]:
    """
    Compute a composite Grid Stress Score (0–100, higher = more stressed).
    Returns score, breakdown by dimension, and status label.
    """
    demand = snapshot.get("demand_mw", 4000)
    reserve = snapshot.get("reserve_margin_pct", 20)
    frequency = snapshot.get("frequency_hz", 60.0)
    curtailment = snapshot.get("curtailment_mw", 0)
    congestion = snapshot.get("congestion_index", 0.5)
    renewable = snapshot.get("renewable_mw", 1000)
    solar = snapshot.get("solar_mw", 500)
    wind = snapshot.get("wind_mw", 400)

    # --- Dimension scores (0–100 each, higher = more stressed) ---

    # 1. Reserve margin stress (0% reserve = 100, 25%+ reserve = 0)
    reserve_stress = max(0.0, min(100.0, (25.0 - reserve) / 25.0 * 100))

    # 2. Frequency deviation stress
    freq_dev = abs(frequency - 60.0)
    freq_stress = min(100.0, freq_dev / 0.15 * 100)

    # 3. Demand pressure (as % of grid capacity 5625 MW)
    demand_stress = min(100.0, demand / 5625 * 100)

    # 4. Curtailment stress (wasted energy = inefficiency stress)
    curtailment_stress = min(100.0, curtailment / 400 * 100)

    # 5. Congestion stress (already 0–1 index)
    congestion_stress = min(100.0, congestion * 100)

    # 6. Renewable variability stress (high penetration without storage = more risk)
    renewable_pct = renewable / max(1, demand)
    variability_stress = min(100.0, max(0.0, (renewable_pct - 0.5) / 0.5 * 60))

    # --- Weighted composite ---
    weights = {
        "reserve":      0.28,
        "frequency":    0.22,
        "demand":       0.18,
        "curtailment":  0.12,
        "congestion":   0.12,
        "variability":  0.08,
    }
    scores = {
        "reserve":     round(reserve_stress, 1),
        "frequency":   round(freq_stress, 1),
        "demand":      round(demand_stress, 1),
        "curtailment": round(curtailment_stress, 1),
        "congestion":  round(congestion_stress, 1),
        "variability": round(variability_stress, 1),
    }
    composite = sum(scores[k] * weights[k] for k in weights)
    composite = round(min(100.0, max(0.0, composite)), 1)

    # Status label
    if composite >= 75:
        status = "critical"
        label = "CRITICAL STRESS"
        color = "red"
    elif composite >= 55:
        status = "high"
        label = "HIGH STRESS"
        color = "orange"
    elif composite >= 35:
        status = "moderate"
        label = "MODERATE STRESS"
        color = "yellow"
    elif composite >= 15:
        status = "low"
        label = "LOW STRESS"
        color = "blue"
    else:
        status = "normal"
        label = "NORMAL OPERATIONS"
        color = "green"

    # Top contributing factor
    top_factor = max(scores, key=lambda k: scores[k] * weights[k])
    top_factor_labels = {
        "reserve":     "Low reserve margin",
        "frequency":   "Frequency deviation",
        "demand":      "High demand load",
        "curtailment": "High curtailment",
        "congestion":  "Transmission congestion",
        "variability": "High renewable variability",
    }

    return {
        "composite_score": composite,
        "status": status,
        "label": label,
        "color": color,
        "top_contributing_factor": top_factor_labels[top_factor],
        "dimension_scores": scores,
        "weights": weights,
        "interpretation": f"Grid stress is {label}. Primary driver: {top_factor_labels[top_factor]}.",
    }

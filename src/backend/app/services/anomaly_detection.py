"""
Anomaly detection service using Isolation Forest.
Detects: demand spikes, frequency deviations, low reserve margins,
high curtailment, and congestion events.
"""
import numpy as np
from sklearn.ensemble import IsolationForest
from typing import List, Dict, Any
from app.services.grid_simulator import generate_historical_series

_iso_forest: IsolationForest | None = None
_feature_names = ["demand_mw", "solar_mw", "wind_mw", "curtailment_mw", "reserve_margin_pct"]

# Rule-based thresholds
THRESHOLDS = {
    "demand_spike_mw": 5200,        # MW — high demand threshold
    "low_reserve_pct": 12.0,         # % — low reserve margin
    "high_curtailment_mw": 150,      # MW — significant curtailment
    "freq_deviation_hz": 0.08,       # Hz from 60
    "congestion_threshold": 0.85,    # 0–1 index
}


def _get_features(record: Dict) -> List[float]:
    return [record.get(f, 0.0) for f in _feature_names]


def _train_iso_forest():
    global _iso_forest
    history = generate_historical_series(hours=720)  # 30 days
    X = np.array([_get_features(r) for r in history])
    _iso_forest = IsolationForest(contamination=0.05, random_state=42)
    _iso_forest.fit(X)


def detect_anomalies(snapshot: Dict[str, Any]) -> Dict[str, Any]:
    """Run anomaly detection on a live grid snapshot."""
    global _iso_forest
    if _iso_forest is None:
        _train_iso_forest()

    feats = np.array([_get_features(snapshot)]).reshape(1, -1)
    ml_score = float(_iso_forest.score_samples(feats)[0])  # more negative = more anomalous
    is_anomaly_ml = bool(_iso_forest.predict(feats)[0] == -1)

    alerts = []
    severity = "normal"

    # Rule-based checks
    if snapshot.get("demand_mw", 0) > THRESHOLDS["demand_spike_mw"]:
        alerts.append({
            "type": "demand_spike",
            "message": f"Demand {snapshot['demand_mw']} MW exceeds high-load threshold ({THRESHOLDS['demand_spike_mw']} MW)",
            "severity": "high",
        })
        severity = "high"

    if snapshot.get("reserve_margin_pct", 100) < THRESHOLDS["low_reserve_pct"]:
        alerts.append({
            "type": "low_reserve",
            "message": f"Reserve margin {snapshot['reserve_margin_pct']}% is critically low (< {THRESHOLDS['low_reserve_pct']}%)",
            "severity": "critical",
        })
        severity = "critical"

    if snapshot.get("curtailment_mw", 0) > THRESHOLDS["high_curtailment_mw"]:
        alerts.append({
            "type": "high_curtailment",
            "message": f"Curtailment {snapshot['curtailment_mw']} MW — renewable energy is being wasted",
            "severity": "medium",
        })
        if severity == "normal":
            severity = "medium"

    if abs(snapshot.get("frequency_hz", 60) - 60.0) > THRESHOLDS["freq_deviation_hz"]:
        alerts.append({
            "type": "frequency_deviation",
            "message": f"Grid frequency {snapshot['frequency_hz']} Hz deviates from 60 Hz nominal",
            "severity": "high",
        })
        if severity in ("normal", "medium"):
            severity = "high"

    if snapshot.get("congestion_index", 0) > THRESHOLDS["congestion_threshold"]:
        alerts.append({
            "type": "transmission_congestion",
            "message": f"Transmission congestion index {snapshot['congestion_index']:.2f} is above threshold",
            "severity": "medium",
        })
        if severity == "normal":
            severity = "medium"

    if is_anomaly_ml and not alerts:
        alerts.append({
            "type": "statistical_anomaly",
            "message": "ML model detected an unusual pattern in grid conditions (Isolation Forest)",
            "severity": "low",
        })
        severity = "low"

    return {
        "anomaly_detected": is_anomaly_ml or len(alerts) > 0,
        "ml_anomaly_score": round(ml_score, 4),
        "severity": severity,
        "alerts": alerts,
        "alert_count": len(alerts),
    }

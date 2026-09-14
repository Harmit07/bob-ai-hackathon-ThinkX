import pandas as pd
import numpy as np
from typing import Dict, Any, List

def calculate_grid_stress_index(df: pd.DataFrame, anomalies: List[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Computes system-wide Grid Stress Index (0 - 100) based on telemetry metrics and anomaly density.
    Supports both synthetic and real GridPilot dataset schemas (voltage_kv vs voltage_pu).
    """
    if df.empty:
        return {
            "grid_stress_index": 0.0,
            "status": "NORMAL",
            "voltage_health": 100.0,
            "frequency_health": 100.0,
            "congestion_health": 100.0,
            "breakdown": {"voltage_penalty": 0, "frequency_penalty": 0, "congestion_penalty": 0, "anomaly_penalty": 0}
        }

    # Extract or derive voltage_pu
    if "voltage_pu" in df.columns:
        v_series = df["voltage_pu"].astype(float)
    elif "voltage_kv" in df.columns:
        v_series = df["voltage_kv"].astype(float) / 33.0 # Normalize 33kV baseline to 1.0 p.u.
    else:
        v_series = pd.Series([1.0] * len(df))

    # Extract or derive frequency_hz
    if "frequency_hz" in df.columns:
        f_series = df["frequency_hz"].astype(float)
    else:
        f_series = pd.Series([60.0] * len(df))

    # Extract congestion status
    if "congestion_flag" in df.columns:
        cong_pct = float(df["congestion_flag"].mean())
    elif "status" in df.columns:
        cong_pct = float((df["status"] == "GRID_CONSTRAINT").mean())
    else:
        cong_pct = 0.0

    # 1. Voltage Penalty (deviation from 1.0 p.u.)
    v_dev = (v_series - 1.0).abs().mean()
    voltage_penalty = min(40.0, float(v_dev * 400.0))

    # 2. Frequency Penalty (deviation from 60.0 Hz)
    f_dev = (f_series - 60.0).abs().mean()
    frequency_penalty = min(30.0, float(f_dev * 50.0))

    # 3. Congestion Penalty
    congestion_penalty = min(20.0, float(cong_pct * 20.0))

    # 4. Anomaly Density Penalty
    num_anomalies = len(anomalies) if anomalies else 0
    anomaly_penalty = min(20.0, num_anomalies * 4.0)

    total_stress = min(100.0, round(voltage_penalty + frequency_penalty + congestion_penalty + anomaly_penalty, 1))

    status = "NORMAL"
    if total_stress >= 80.0:
        status = "CRITICAL"
    elif total_stress >= 60.0:
        status = "HIGH"
    elif total_stress >= 35.0:
        status = "MODERATE"

    return {
        "grid_stress_index": total_stress,
        "status": status,
        "voltage_health": round(max(0.0, 100.0 - voltage_penalty * 2.5), 1),
        "frequency_health": round(max(0.0, 100.0 - frequency_penalty * 3.3), 1),
        "congestion_health": round(max(0.0, 100.0 - congestion_penalty * 5.0), 1),
        "breakdown": {
            "voltage_penalty": round(voltage_penalty, 1),
            "frequency_penalty": round(frequency_penalty, 1),
            "congestion_penalty": round(congestion_penalty, 1),
            "anomaly_penalty": round(anomaly_penalty, 1)
        }
    }

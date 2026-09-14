"""
Grid data simulator — produces realistic synthetic grid telemetry.
Simulates: load demand, solar generation, wind generation, grid frequency,
reserve margin, transmission congestion, and curtailment.
"""
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict, Any


RNG = np.random.default_rng(42)


def _hour_of_day_load_factor(hour: int) -> float:
    """Typical residential + commercial daily load curve."""
    curve = [
        0.62, 0.59, 0.57, 0.56, 0.57, 0.61,
        0.70, 0.82, 0.91, 0.95, 0.96, 0.97,
        0.96, 0.95, 0.94, 0.95, 0.98, 1.00,
        0.99, 0.97, 0.93, 0.87, 0.78, 0.68,
    ]
    return curve[hour]


def _solar_factor(hour: int, cloud_cover: float = 0.1) -> float:
    """Solar output factor based on hour and cloud cover."""
    if hour < 6 or hour > 20:
        return 0.0
    peak_hour = 13
    solar = max(0.0, 1.0 - abs(hour - peak_hour) / 7.0)
    return solar * (1.0 - cloud_cover * 0.8)


def _wind_factor(base_wind: float, hour: int) -> float:
    """Wind output: generally higher at night and early morning."""
    night_boost = 0.15 if (hour < 6 or hour > 20) else 0.0
    return min(1.0, base_wind + night_boost + RNG.normal(0, 0.05))


def generate_current_snapshot() -> Dict[str, Any]:
    """Return a single real-time grid snapshot."""
    now = datetime.utcnow()
    hour = now.hour
    base_load_mw = 4500.0  # baseline MW for a mid-size regional grid
    cloud_cover = float(RNG.uniform(0.05, 0.40))
    wind_base = float(RNG.uniform(0.30, 0.75))

    load_factor = _hour_of_day_load_factor(hour)
    demand_mw = base_load_mw * load_factor + float(RNG.normal(0, 80))

    solar_capacity_mw = 1200.0
    wind_capacity_mw = 900.0
    solar_mw = solar_capacity_mw * _solar_factor(hour, cloud_cover)
    wind_mw = wind_capacity_mw * max(0.0, _wind_factor(wind_base, hour))

    renewable_mw = solar_mw + wind_mw
    conventional_mw = max(0.0, demand_mw - renewable_mw)
    curtailment_mw = max(0.0, renewable_mw - demand_mw)

    # Grid frequency deviates slightly from 60 Hz based on load-generation balance
    imbalance_factor = (demand_mw - renewable_mw - conventional_mw) / base_load_mw
    frequency_hz = 60.0 + imbalance_factor * 0.3 + float(RNG.normal(0, 0.01))

    total_capacity_mw = base_load_mw * 1.25
    reserve_margin_pct = (total_capacity_mw - demand_mw) / total_capacity_mw * 100

    # Transmission congestion index (0–1)
    congestion_index = float(np.clip(demand_mw / (base_load_mw * 1.1) + RNG.normal(0, 0.05), 0, 1))

    return {
        "timestamp": now.isoformat() + "Z",
        "demand_mw": round(demand_mw, 1),
        "solar_mw": round(solar_mw, 1),
        "wind_mw": round(wind_mw, 1),
        "renewable_mw": round(renewable_mw, 1),
        "conventional_mw": round(conventional_mw, 1),
        "curtailment_mw": round(curtailment_mw, 1),
        "frequency_hz": round(frequency_hz, 3),
        "reserve_margin_pct": round(reserve_margin_pct, 1),
        "congestion_index": round(congestion_index, 3),
        "cloud_cover": round(cloud_cover, 2),
        "wind_speed_factor": round(wind_base, 2),
        "renewable_penetration_pct": round(renewable_mw / demand_mw * 100, 1) if demand_mw > 0 else 0.0,
    }


def generate_historical_series(hours: int = 48) -> List[Dict[str, Any]]:
    """Return a list of hourly snapshots going back `hours` hours."""
    now = datetime.utcnow().replace(minute=0, second=0, microsecond=0)
    records = []
    for i in range(hours, 0, -1):
        ts = now - timedelta(hours=i)
        hour = ts.hour
        cloud_cover = float(RNG.uniform(0.05, 0.45))
        wind_base = float(RNG.uniform(0.25, 0.80))

        load_factor = _hour_of_day_load_factor(hour)
        demand_mw = 4500.0 * load_factor + float(RNG.normal(0, 80))
        solar_mw = 1200.0 * _solar_factor(hour, cloud_cover)
        wind_mw = 900.0 * max(0.0, _wind_factor(wind_base, hour))
        renewable_mw = solar_mw + wind_mw
        curtailment_mw = max(0.0, renewable_mw - demand_mw)
        reserve_margin_pct = (4500.0 * 1.25 - demand_mw) / (4500.0 * 1.25) * 100

        records.append({
            "timestamp": ts.isoformat() + "Z",
            "demand_mw": round(demand_mw, 1),
            "solar_mw": round(solar_mw, 1),
            "wind_mw": round(wind_mw, 1),
            "renewable_mw": round(renewable_mw, 1),
            "curtailment_mw": round(curtailment_mw, 1),
            "reserve_margin_pct": round(reserve_margin_pct, 1),
        })
    return records

"""
Renewable Underperformance Detection.
Compares actual solar/wind output vs expected output given weather conditions.
Flags underperforming assets and estimates lost generation.
"""
from typing import Dict, Any, List
from datetime import datetime
import numpy as np


def _expected_solar(hour: int, cloud_cover: float, capacity_mw: float = 1200.0) -> float:
    """Expected solar output given clear-sky model + cloud cover."""
    if hour < 6 or hour > 20:
        return 0.0
    peak_factor = max(0.0, 1.0 - abs(hour - 13) / 7.0)
    return capacity_mw * peak_factor * (1.0 - cloud_cover * 0.85)


def _expected_wind(wind_speed_factor: float, capacity_mw: float = 900.0) -> float:
    """Expected wind output given wind speed factor (0–1)."""
    return capacity_mw * max(0.0, wind_speed_factor)


def detect_underperformance(snapshot: Dict[str, Any]) -> Dict[str, Any]:
    """
    Detect renewable underperformance by comparing actual vs expected output.
    Returns performance metrics, deficit, and asset-level flags.
    """
    hour = datetime.utcnow().hour
    cloud_cover = snapshot.get("cloud_cover", 0.15)
    wind_factor = snapshot.get("wind_speed_factor", 0.55)
    actual_solar = snapshot.get("solar_mw", 0.0)
    actual_wind = snapshot.get("wind_mw", 0.0)

    expected_solar = _expected_solar(hour, cloud_cover)
    expected_wind = _expected_wind(wind_factor)

    # Performance ratios (actual / expected)
    solar_ratio = actual_solar / expected_solar if expected_solar > 10 else 1.0
    wind_ratio = actual_wind / expected_wind if expected_wind > 10 else 1.0

    solar_deficit_mw = max(0.0, expected_solar - actual_solar)
    wind_deficit_mw = max(0.0, expected_wind - actual_wind)
    total_deficit_mw = solar_deficit_mw + wind_deficit_mw

    # Underperformance thresholds
    UNDERPERF_THRESHOLD = 0.80  # below 80% = underperforming
    CRITICAL_THRESHOLD = 0.60   # below 60% = critical

    def classify(ratio: float) -> str:
        if ratio >= 0.95:
            return "optimal"
        elif ratio >= UNDERPERF_THRESHOLD:
            return "minor_deviation"
        elif ratio >= CRITICAL_THRESHOLD:
            return "underperforming"
        else:
            return "critical_underperformance"

    solar_status = classify(solar_ratio)
    wind_status = classify(wind_ratio)

    alerts: List[Dict] = []
    if solar_ratio < UNDERPERF_THRESHOLD and expected_solar > 10:
        alerts.append({
            "asset": "solar_fleet",
            "status": solar_status,
            "actual_mw": round(actual_solar, 1),
            "expected_mw": round(expected_solar, 1),
            "performance_ratio": round(solar_ratio, 3),
            "deficit_mw": round(solar_deficit_mw, 1),
            "likely_cause": _solar_likely_cause(solar_ratio, cloud_cover),
            "severity": "critical" if solar_ratio < CRITICAL_THRESHOLD else "medium",
        })

    if wind_ratio < UNDERPERF_THRESHOLD and expected_wind > 10:
        alerts.append({
            "asset": "wind_fleet",
            "status": wind_status,
            "actual_mw": round(actual_wind, 1),
            "expected_mw": round(expected_wind, 1),
            "performance_ratio": round(wind_ratio, 3),
            "deficit_mw": round(wind_deficit_mw, 1),
            "likely_cause": _wind_likely_cause(wind_ratio, wind_factor),
            "severity": "critical" if wind_ratio < CRITICAL_THRESHOLD else "medium",
        })

    # Lost revenue estimate (@ $50/MWh average market price)
    lost_revenue_per_hour = total_deficit_mw * 50.0
    lost_carbon_benefit_tco2 = total_deficit_mw * 0.4  # per hour

    overall_performance = (
        "critical" if any(a["severity"] == "critical" for a in alerts)
        else "degraded" if alerts
        else "normal"
    )

    return {
        "overall_performance": overall_performance,
        "solar": {
            "actual_mw": round(actual_solar, 1),
            "expected_mw": round(expected_solar, 1),
            "performance_ratio": round(solar_ratio, 3),
            "performance_pct": round(solar_ratio * 100, 1),
            "deficit_mw": round(solar_deficit_mw, 1),
            "status": solar_status,
        },
        "wind": {
            "actual_mw": round(actual_wind, 1),
            "expected_mw": round(expected_wind, 1),
            "performance_ratio": round(wind_ratio, 3),
            "performance_pct": round(wind_ratio * 100, 1),
            "deficit_mw": round(wind_deficit_mw, 1),
            "status": wind_status,
        },
        "total_deficit_mw": round(total_deficit_mw, 1),
        "lost_revenue_per_hour_usd": round(lost_revenue_per_hour, 0),
        "lost_carbon_benefit_tco2_per_hour": round(lost_carbon_benefit_tco2, 2),
        "alerts": alerts,
        "alert_count": len(alerts),
    }


def _solar_likely_cause(ratio: float, cloud_cover: float) -> str:
    if cloud_cover > 0.60:
        return "High cloud cover reducing irradiance"
    elif ratio < 0.50:
        return "Possible inverter fault or shading event — maintenance check recommended"
    elif ratio < 0.70:
        return "Panel soiling or partial shading reducing output"
    else:
        return "Minor irradiance variability within normal range"


def _wind_likely_cause(ratio: float, wind_factor: float) -> str:
    if wind_factor < 0.25:
        return "Wind speed below cut-in speed — turbines in standby"
    elif ratio < 0.50:
        return "Possible turbine curtailment, fault, or grid connection issue"
    elif ratio < 0.70:
        return "Wind direction variability or turbine wake effects reducing output"
    else:
        return "Minor wind speed fluctuation within normal operating range"

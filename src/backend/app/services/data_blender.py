"""
Data Blending Layer
===================
Merges real government data with synthetic simulation.

Strategy:
  - Weather fields (cloud_cover, wind_speed_factor): use Open-Meteo REAL data if available
  - Demand (demand_mw): use EIA REAL data if available, otherwise synthetic
  - Solar/Wind/Conventional: derived from real weather + real/synthetic demand
  - Frequency, congestion, reserve: always derived (not directly measured externally)

Every response includes a `data_sources` dict that tells you exactly
which fields came from real data vs synthetic simulation.
"""

import numpy as np
from datetime import datetime
from typing import Dict, Any
from app.services.real_data import fetch_weather_real, fetch_eia_grid_real


RNG = np.random.default_rng()   # non-seeded for live variation


def _hour_of_day_load_factor(hour: int) -> float:
    curve = [0.62,0.59,0.57,0.56,0.57,0.61,0.70,0.82,0.91,0.95,0.96,0.97,
             0.96,0.95,0.94,0.95,0.98,1.00,0.99,0.97,0.93,0.87,0.78,0.68]
    return curve[hour % 24]


def _solar_mw(hour: int, cloud_cover: float, capacity_mw: float = 1200.0) -> float:
    if hour < 6 or hour > 20:
        return 0.0
    peak_factor = max(0.0, 1.0 - abs(hour - 13) / 7.0)
    return max(0.0, capacity_mw * peak_factor * (1.0 - cloud_cover * 0.85))


def _wind_mw(wind_factor: float, hour: int, capacity_mw: float = 900.0) -> float:
    night_boost = 0.12 if (hour < 6 or hour > 20) else 0.0
    factor = min(1.0, wind_factor + night_boost + float(RNG.normal(0, 0.03)))
    return max(0.0, capacity_mw * factor)


def get_live_snapshot() -> Dict[str, Any]:
    """
    Build a real-time grid snapshot using:
      - Real weather from Open-Meteo (always attempted, no key needed)
      - Real demand from EIA (attempted if EIA_API_KEY is set)
      - Synthetic fallback for any unavailable fields

    Returns the snapshot with a `data_sources` section explaining data origin.
    """
    now = datetime.utcnow()
    hour = now.hour

    data_sources: Dict[str, str] = {}

    # ── 1. Weather (Open-Meteo — free, no key) ────────────────────────────────
    weather = fetch_weather_real()
    cloud_cover       = weather["cloud_cover"]
    wind_speed_factor = weather["wind_speed_factor"]
    wind_speed_ms     = weather.get("wind_speed_ms", 0.0)
    temperature_c     = weather.get("temperature_c", 15.0)
    data_sources["weather"] = weather["data_source"]

    # ── 2. Demand (EIA — real if key available) ───────────────────────────────
    eia = fetch_eia_grid_real()
    if eia.get("available") and eia.get("demand_mw"):
        # Use real EIA demand, scaled to our grid size
        # EIA MISO demand is ~60–90 GW; we scale to our 4500 MW demo grid
        eia_demand = float(eia["demand_mw"])
        # Normalize: MISO typical range 50000–80000 MW → our 3500–5200 MW
        demand_mw = max(2500.0, min(6000.0, eia_demand / 15.0))
        data_sources["demand"] = f"real:eia ({eia.get('region','?')})"
    else:
        # Synthetic load curve
        demand_mw = 4500.0 * _hour_of_day_load_factor(hour) + float(RNG.normal(0, 80))
        demand_mw = max(1500.0, demand_mw)
        data_sources["demand"] = eia.get("data_source", "synthetic")

    # ── 3. Temperature-adjusted demand ───────────────────────────────────────
    # Hot days (>30°C) or cold days (<0°C) drive more cooling/heating load
    if temperature_c > 30:
        heat_factor = 1.0 + (temperature_c - 30) * 0.015
        demand_mw *= heat_factor
        data_sources["demand_adjustment"] = f"real:temperature_adjusted (+{round((heat_factor-1)*100,1)}%)"
    elif temperature_c < 0:
        cold_factor = 1.0 + abs(temperature_c) * 0.012
        demand_mw *= cold_factor
        data_sources["demand_adjustment"] = f"real:temperature_adjusted (+{round((cold_factor-1)*100,1)}%)"

    # ── 4. Solar (derived from real cloud cover) ──────────────────────────────
    solar_mw = _solar_mw(hour, cloud_cover)
    data_sources["solar"] = "derived:real_cloud_cover" if "real" in data_sources["weather"] else "derived:synthetic_weather"

    # ── 5. Wind (derived from real wind speed) ────────────────────────────────
    wind_mw = _wind_mw(wind_speed_factor, hour)
    data_sources["wind"] = "derived:real_wind_speed" if "real" in data_sources["weather"] else "derived:synthetic_weather"

    # ── 6. Derived grid metrics ────────────────────────────────────────────────
    renewable_mw    = solar_mw + wind_mw
    conventional_mw = max(0.0, demand_mw - renewable_mw)
    curtailment_mw  = max(0.0, renewable_mw - demand_mw)
    total_cap       = 4500.0 * 1.25
    reserve_margin  = (total_cap - demand_mw) / total_cap * 100

    imbalance       = (demand_mw - renewable_mw - conventional_mw) / max(demand_mw, 1)
    frequency_hz    = 60.0 + imbalance * 0.3 + float(RNG.normal(0, 0.008))
    congestion      = float(np.clip(demand_mw / (4500.0 * 1.1) + RNG.normal(0, 0.04), 0, 1))

    renew_pct = renewable_mw / max(demand_mw, 1) * 100

    data_sources["frequency"]    = "derived:synthetic"
    data_sources["congestion"]   = "derived:synthetic"
    data_sources["reserve"]      = "derived"

    # ── Overall source summary ─────────────────────────────────────────────────
    has_real = any("real" in v for v in data_sources.values())
    overall  = "real:open-meteo" + ("+eia" if eia.get("available") else "") if has_real else "synthetic"

    return {
        "timestamp":                  now.isoformat() + "Z",
        "demand_mw":                  round(demand_mw, 1),
        "solar_mw":                   round(solar_mw, 1),
        "wind_mw":                    round(wind_mw, 1),
        "renewable_mw":               round(renewable_mw, 1),
        "conventional_mw":            round(conventional_mw, 1),
        "curtailment_mw":             round(curtailment_mw, 1),
        "frequency_hz":               round(frequency_hz, 3),
        "reserve_margin_pct":         round(reserve_margin, 1),
        "congestion_index":           round(congestion, 3),
        "cloud_cover":                round(cloud_cover, 3),
        "wind_speed_ms":              round(wind_speed_ms, 1),
        "wind_speed_factor":          round(wind_speed_factor, 3),
        "temperature_c":              round(temperature_c, 1),
        "renewable_penetration_pct":  round(renew_pct, 1),
        "data_source":                overall,
        "data_sources":               data_sources,
        "eia_region":                 eia.get("region", "N/A"),
        "weather_location":           weather.get("location", ""),
    }

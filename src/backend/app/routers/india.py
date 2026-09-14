from fastapi import APIRouter, Query
from typing import Literal
from app.services.india_data import (
    get_india_snapshot,
    get_all_india_summary,
    fetch_india_weather,
    fetch_datagov_electricity_datasets,
)
from app.services.india_constants import (
    INDIA_REGIONS,
    INDIA_TOTAL_CAPACITY_MW,
    TOP_SOLAR_STATES_MW,
    TOP_WIND_STATES_MW,
    INDIA_PRICES_INR_PER_MWH,
    INDIA_DATA_SOURCES,
)
from app.services.anomaly_detection import detect_anomalies
from app.services.optimization import optimize_dispatch
from app.services.advisor import generate_advice
from app.services.grid_stress import compute_grid_stress_score
from app.services.financial_impact import calculate_financial_impact
from app.services.forecasting import get_forecast

router = APIRouter()

REGION_IDS = Literal["northern", "western", "southern", "eastern", "northeastern"]


@router.get("/snapshot")
def india_snapshot(region: REGION_IDS = "western"):
    """
    Real-time grid snapshot for a specific Indian region.
    Uses real weather from Open-Meteo + real CEA/MNRE 2024 capacity data.
    India grid operates at 50 Hz (not 60 Hz).
    """
    return get_india_snapshot(region)


@router.get("/all-regions")
def all_india_regions():
    """All-India summary — all 5 regional grids (NR, WR, SR, ER, NER)."""
    return get_all_india_summary()


@router.get("/regions")
def list_regions():
    """List all 5 Indian regional grids with metadata."""
    return {
        "regions": [
            {
                "id":           rid,
                "name":         rdata["name"],
                "abbreviation": rdata["abbreviation"],
                "rldc":         rdata["rldc"],
                "states":       rdata["states"],
                "peak_demand_mw":        rdata["peak_demand_mw"],
                "installed_capacity_mw": rdata["installed_capacity_mw"],
                "solar_capacity_mw":     rdata["solar_capacity_mw"],
                "wind_capacity_mw":      rdata["wind_capacity_mw"],
                "capital_city":          rdata["capital_city"],
                "dominant_renewable":    rdata["dominant_renewable"],
                "key_solar_state":       rdata["key_solar_state"],
                "key_wind_state":        rdata["key_wind_state"],
            }
            for rid, rdata in INDIA_REGIONS.items()
        ]
    }


@router.get("/weather")
def india_weather(region: REGION_IDS = "western"):
    """
    Live weather data for an Indian region from Open-Meteo.
    FREE API — no key required. Returns cloud cover, wind speed,
    temperature, solar irradiance, and 24h hourly forecast.
    """
    return fetch_india_weather(region)


@router.get("/advisory")
def india_advisory(region: REGION_IDS = "western"):
    """
    Full AI advisory for an Indian region — snapshot + anomalies +
    optimization + RCA + stress score, all calibrated for India's grid.
    """
    snapshot = get_india_snapshot(region)

    # Adapt snapshot keys for existing advisory pipeline
    # (pipeline expects frequency_hz, reserve_margin_pct, etc. — already present)
    anomalies    = detect_anomalies(snapshot)
    forecast     = get_forecast(hours_ahead=24)
    optimization = optimize_dispatch(snapshot, forecast)
    advice       = generate_advice(snapshot, anomalies, optimization)
    stress       = compute_grid_stress_score(snapshot)

    return {
        "region":       region,
        "region_name":  INDIA_REGIONS[region]["name"],
        "snapshot":     snapshot,
        "anomalies":    anomalies,
        "forecast":     forecast,
        "optimization": optimization,
        "advice":       advice,
        "stress":       stress,
        "note":         "India grid operates at 50 Hz. Pricing in INR.",
    }


@router.get("/capacity")
def india_capacity():
    """
    Real installed capacity data from CEA Annual Report 2024.
    Total, fuel-wise, and top states for solar/wind.
    """
    return {
        "source":              "CEA Annual Report 2023-24",
        "url":                 "https://cea.nic.in",
        "as_of":               "June 2024",
        "total_installed_mw":  INDIA_TOTAL_CAPACITY_MW,
        "total_installed_gw":  {k: round(v / 1000, 2) for k, v in INDIA_TOTAL_CAPACITY_MW.items()},
        "renewable_gw": {
            "solar": round(INDIA_TOTAL_CAPACITY_MW["solar"] / 1000, 1),
            "wind":  round(INDIA_TOTAL_CAPACITY_MW["wind"] / 1000, 1),
            "hydro": round((INDIA_TOTAL_CAPACITY_MW["large_hydro"] + INDIA_TOTAL_CAPACITY_MW["small_hydro"]) / 1000, 1),
        },
        "top_solar_states_mw": TOP_SOLAR_STATES_MW,
        "top_wind_states_mw":  TOP_WIND_STATES_MW,
        "india_re_target_2030_gw": 500,
        "india_re_progress_pct":   round(
            (INDIA_TOTAL_CAPACITY_MW["solar"] + INDIA_TOTAL_CAPACITY_MW["wind"]) / (500_000) * 100, 1
        ),
    }


@router.get("/pricing")
def india_pricing():
    """
    Indian electricity market pricing from IEX and CERC tariff orders.
    All prices in INR per MWh.
    """
    return {
        "currency":     "INR",
        "unit":         "₹ per MWh",
        "prices":       INDIA_PRICES_INR_PER_MWH,
        "prices_per_kwh": {k: round(v / 1000, 2) for k, v in INDIA_PRICES_INR_PER_MWH.items()},
        "source":       "IEX (Indian Energy Exchange) + CERC Tariff Orders 2024",
        "carbon_emission_factor_kg_kwh": 0.82,
        "grid_code":    "IEGC (Indian Electricity Grid Code) — CERC",
        "frequency_hz": 50.0,
    }


@router.get("/open-datasets")
def india_open_datasets():
    """
    Fetch available electricity datasets from data.gov.in CKAN API.
    Completely free — no API key required.
    Source: https://data.gov.in
    """
    datasets = fetch_datagov_electricity_datasets()
    return {
        "source":       "data.gov.in (Government of India Open Data Portal)",
        "api_url":      "https://catalog.data.gov.in/api/3/action/package_search",
        "requires_key": False,
        "dataset_count": len(datasets),
        "datasets":     datasets,
    }


@router.get("/data-sources")
def india_data_sources():
    """
    List all Indian government data sources used in this system
    with URLs, access requirements, and data descriptions.
    """
    return {
        "sources_used": INDIA_DATA_SOURCES,
        "all_sources": {
            "open_meteo": {
                "name":         "Open-Meteo Weather API",
                "url":          "https://open-meteo.com",
                "requires_key": False,
                "cost":         "FREE",
                "data":         "Cloud cover, wind speed, temperature, solar irradiance",
                "update_freq":  "Hourly (real-time current weather)",
                "used_for":     "Solar output calculation, wind power calculation, demand temperature adjustment",
            },
            "data_gov_in": {
                "name":         "data.gov.in — Government of India Open Data",
                "url":          "https://data.gov.in",
                "requires_key": False,
                "cost":         "FREE",
                "data":         "CEA generation stats, MNRE capacity, DISCOM data",
                "update_freq":  "Monthly/Quarterly",
                "used_for":     "Electricity dataset discovery",
            },
            "cea": {
                "name":         "Central Electricity Authority (CEA)",
                "url":          "https://cea.nic.in",
                "requires_key": False,
                "cost":         "FREE (PDF reports)",
                "data":         "Installed capacity, generation statistics, peak demand",
                "update_freq":  "Monthly/Annual",
                "used_for":     "Real installed capacity constants (coal, solar, wind, hydro)",
            },
            "mnre": {
                "name":         "Ministry of New and Renewable Energy (MNRE)",
                "url":          "https://mnre.gov.in",
                "requires_key": False,
                "cost":         "FREE",
                "data":         "State-wise renewable capacity, targets vs achievement",
                "update_freq":  "Quarterly",
                "used_for":     "Solar/wind capacity per state and per region",
            },
            "posoco": {
                "name":         "POSOCO / NLDC — Power System Operation Corporation",
                "url":          "https://posoco.in",
                "requires_key": False,
                "cost":         "FREE (Web dashboard)",
                "data":         "Real-time frequency, demand, generation, curtailment",
                "update_freq":  "Real-time (web dashboard only, no public API)",
                "used_for":     "Load curve shape (POSOCO demand pattern)",
                "note":         "No public REST API — data used to calibrate load curve constants",
            },
            "iex": {
                "name":         "IEX — Indian Energy Exchange",
                "url":          "https://www.iexindia.com",
                "requires_key": "Yes (for live prices — subscription required)",
                "cost":         "Paid for live API; historical data viewable free",
                "data":         "Day-Ahead Market price, Real-Time Market price, REC prices",
                "update_freq":  "Real-time",
                "used_for":     "INR pricing constants (₹/MWh) embedded in constants file",
            },
            "iegc": {
                "name":         "IEGC — Indian Electricity Grid Code",
                "url":          "https://www.cercind.gov.in/Regulation/IEGC.pdf",
                "requires_key": False,
                "cost":         "FREE",
                "data":         "Grid code: frequency bands, inter-state exchange rules",
                "update_freq":  "Regulatory (updated periodically)",
                "used_for":     "50 Hz frequency standard, acceptable band 49.9–50.05 Hz",
            },
        }
    }

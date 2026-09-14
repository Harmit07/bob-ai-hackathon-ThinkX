"""
Real Data Integration Layer
===========================

Connects to two free government/open data sources:

1. Open-Meteo (https://open-meteo.com) — Completely FREE, no API key required.
   Provides: cloud cover %, wind speed, temperature for any lat/lon.

2. EIA (US Energy Information Administration) — Free, requires free API key.
   Provides: real hourly US regional grid demand + net generation by fuel type.
   API key signup: https://www.eia.gov/opendata/register.php (instant, free)

If real data is unavailable (no key, network error, API limit), the system
automatically falls back to synthetic simulation — the dashboard always works.

Data source is clearly labeled in every API response:
  "data_source": "real:open-meteo+eia"  or  "data_source": "synthetic"
"""

import os
import httpx
import asyncio
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, Tuple
from dotenv import load_dotenv

load_dotenv()

EIA_API_KEY = os.getenv("EIA_API_KEY", "")

# ── EIA Region codes (US Balancing Authority Areas) ──────────────────────────
# Change EIA_REGION in .env to switch to your region
EIA_REGION = os.getenv("EIA_REGION", "MISO")   # Midcontinent ISO (large region, good data)
# Other options: "ERCO" (Texas ERCOT), "CISO" (California), "PJM", "NYIS", "ISNE"

# ── Geographic coordinates for weather data ───────────────────────────────────
# Default: Chicago (center of MISO region). Change in .env.
WEATHER_LAT = float(os.getenv("WEATHER_LAT", "41.85"))
WEATHER_LON = float(os.getenv("WEATHER_LON", "-87.65"))

# ── HTTP timeouts ──────────────────────────────────────────────────────────────
TIMEOUT = 8.0   # seconds — fast fail so dashboard doesn't hang

# ── In-memory cache (TTL: 5 minutes) ─────────────────────────────────────────
_cache: Dict[str, Tuple[datetime, Any]] = {}
CACHE_TTL_MINUTES = 5


def _cache_get(key: str) -> Optional[Any]:
    if key in _cache:
        ts, val = _cache[key]
        if datetime.utcnow() - ts < timedelta(minutes=CACHE_TTL_MINUTES):
            return val
    return None


def _cache_set(key: str, val: Any):
    _cache[key] = (datetime.utcnow(), val)


# ═══════════════════════════════════════════════════════════════════════════════
# 1. OPEN-METEO — Free weather data (no API key)
# ═══════════════════════════════════════════════════════════════════════════════

def fetch_weather_real() -> Dict[str, Any]:
    """
    Fetch current weather from Open-Meteo API.
    Returns: cloud_cover (0–1), wind_speed_factor (0–1), temperature_c.
    Falls back to synthetic defaults on any error.
    Source: https://open-meteo.com/en/docs
    """
    cached = _cache_get("weather")
    if cached:
        return cached

    url = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={WEATHER_LAT}&longitude={WEATHER_LON}"
        f"&current=temperature_2m,cloud_cover,wind_speed_10m"
        f"&wind_speed_unit=ms"
        f"&timezone=UTC"
    )

    try:
        with httpx.Client(timeout=TIMEOUT) as client:
            resp = client.get(url)
            resp.raise_for_status()
            data = resp.json()

        current = data.get("current", {})
        cloud_pct   = float(current.get("cloud_cover", 20))      # 0–100 %
        wind_ms     = float(current.get("wind_speed_10m", 5.0))  # m/s
        temperature = float(current.get("temperature_2m", 15.0)) # °C

        # Normalize to 0–1 factors
        cloud_cover_factor = cloud_pct / 100.0
        # Wind speed: cut-in ~3 m/s, rated ~12 m/s, cut-out ~25 m/s
        if wind_ms < 3.0:
            wind_factor = 0.0
        elif wind_ms > 25.0:
            wind_factor = 0.0   # cut-out
        elif wind_ms > 12.0:
            wind_factor = 1.0   # rated power
        else:
            wind_factor = (wind_ms - 3.0) / (12.0 - 3.0)

        result = {
            "cloud_cover":        round(cloud_cover_factor, 3),
            "wind_speed_ms":      round(wind_ms, 1),
            "wind_speed_factor":  round(wind_factor, 3),
            "temperature_c":      round(temperature, 1),
            "data_source":        "real:open-meteo",
            "location":           f"lat={WEATHER_LAT}, lon={WEATHER_LON}",
        }
        _cache_set("weather", result)
        return result

    except Exception as e:
        return {
            "cloud_cover":       0.15,
            "wind_speed_ms":     6.0,
            "wind_speed_factor": 0.50,
            "temperature_c":     15.0,
            "data_source":       f"synthetic:fallback (open-meteo error: {type(e).__name__})",
            "location":          f"lat={WEATHER_LAT}, lon={WEATHER_LON}",
        }


# ═══════════════════════════════════════════════════════════════════════════════
# 2. EIA — Real US Grid Data (requires free API key)
# ═══════════════════════════════════════════════════════════════════════════════

def fetch_eia_grid_real() -> Dict[str, Any]:
    """
    Fetch real US grid data from EIA API v2.
    Returns: demand_mw, net_generation_mw, fuel breakdown, interchange.
    Falls back to None if no API key or any error.
    Source: https://www.eia.gov/opendata/
    Register free at: https://www.eia.gov/opendata/register.php
    """
    if not EIA_API_KEY:
        return {"data_source": "synthetic:no_eia_key", "available": False}

    cached = _cache_get("eia")
    if cached:
        return cached

    # EIA API v2 — Electricity Regional Transmission Operators
    # Endpoint: Real-time grid demand and generation by region
    url = (
        f"https://api.eia.gov/v2/electricity/rto/region-data/data/"
        f"?api_key={EIA_API_KEY}"
        f"&frequency=hourly"
        f"&data[0]=value"
        f"&facets[respondent][]={EIA_REGION}"
        f"&facets[type][]=D"      # D = Demand
        f"&facets[type][]=NG"     # NG = Net Generation
        f"&sort[0][column]=period"
        f"&sort[0][direction]=desc"
        f"&length=4"
    )

    try:
        with httpx.Client(timeout=TIMEOUT) as client:
            resp = client.get(url)
            resp.raise_for_status()
            data = resp.json()

        records = data.get("response", {}).get("data", [])
        if not records:
            return {"data_source": "synthetic:eia_no_data", "available": False}

        demand_mw = None
        net_gen_mw = None
        for rec in records:
            if rec.get("type") == "D" and demand_mw is None:
                demand_mw = float(rec.get("value", 0))
            if rec.get("type") == "NG" and net_gen_mw is None:
                net_gen_mw = float(rec.get("value", 0))

        result = {
            "demand_mw":      round(demand_mw, 0) if demand_mw else None,
            "net_gen_mw":     round(net_gen_mw, 0) if net_gen_mw else None,
            "region":         EIA_REGION,
            "data_source":    "real:eia-gov",
            "available":      True,
        }
        _cache_set("eia", result)
        return result

    except Exception as e:
        return {
            "data_source": f"synthetic:fallback (eia error: {type(e).__name__})",
            "available": False,
        }


# ═══════════════════════════════════════════════════════════════════════════════
# 3. ENTSO-E (European Grid) — Optional, requires token registration
# ═══════════════════════════════════════════════════════════════════════════════

ENTSOE_TOKEN = os.getenv("ENTSOE_TOKEN", "")

def fetch_entsoe_load() -> Dict[str, Any]:
    """
    Fetch European grid total load from ENTSO-E Transparency Platform.
    Requires free token from: https://transparency.entsoe.eu/usrm/user/createPublicUser
    Falls back gracefully if not configured.
    """
    if not ENTSOE_TOKEN:
        return {"data_source": "synthetic:no_entsoe_token", "available": False}

    cached = _cache_get("entsoe")
    if cached:
        return cached

    now = datetime.utcnow()
    period_start = (now - timedelta(hours=2)).strftime("%Y%m%d%H00")
    period_end   = now.strftime("%Y%m%d%H00")

    url = (
        "https://web-api.tp.entsoe.eu/api"
        f"?securityToken={ENTSOE_TOKEN}"
        "&documentType=A65"          # Total Load
        "&processType=A16"           # Realised
        "&outBiddingZone_Domain=10Y0-1001A1001A83F"  # Germany (DE)
        f"&periodStart={period_start}"
        f"&periodEnd={period_end}"
    )

    try:
        with httpx.Client(timeout=TIMEOUT) as client:
            resp = client.get(url)
            resp.raise_for_status()

        # Parse XML response for the latest load value
        import xml.etree.ElementTree as ET
        root = ET.fromstring(resp.text)
        ns = {"ns": "urn:iec62325.351:tc57wg16:451-6:generationloaddocument:3:0"}
        points = root.findall(".//ns:Point", ns)
        if points:
            latest = points[-1]
            qty = latest.find("ns:quantity", ns)
            load_mw = float(qty.text) if qty is not None else None
            result = {
                "demand_mw":   load_mw,
                "region":      "DE (Germany)",
                "data_source": "real:entsoe",
                "available":   True,
            }
            _cache_set("entsoe", result)
            return result

    except Exception as e:
        pass

    return {"data_source": f"synthetic:fallback (entsoe error)", "available": False}

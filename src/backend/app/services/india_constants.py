"""
India Grid Constants
====================
Real data from CEA (Central Electricity Authority), MNRE, and POSOCO reports.
Sources:
  - CEA Annual Report 2023-24: https://cea.nic.in
  - MNRE State Renewable Data 2024: https://mnre.gov.in
  - POSOCO NLDC Demand Reports: https://posoco.in
  - data.gov.in electricity datasets: https://data.gov.in
"""

# ─────────────────────────────────────────────────────────────────────────────
# ALL-INDIA INSTALLED CAPACITY (MW) — CEA 2024 data
# ─────────────────────────────────────────────────────────────────────────────
INDIA_TOTAL_CAPACITY_MW = {
    "coal":         213_000,   # Thermal coal
    "gas":           25_150,   # Gas-based
    "oil":              510,   # Oil-based
    "nuclear":        7_480,   # Atomic
    "large_hydro":   46_920,   # Large hydro
    "small_hydro":    5_074,   # Small hydro
    "solar":        186_466,   # Solar PV (June 2024)
    "wind":          46_516,   # Wind (June 2024)
    "biomass":        10_800,  # Bio-energy
    "waste_energy":   1_000,   # Waste-to-energy
    "total":         593_000,  # approx total
}

INDIA_RENEWABLE_CAPACITY_MW = (
    INDIA_TOTAL_CAPACITY_MW["solar"] +
    INDIA_TOTAL_CAPACITY_MW["wind"] +
    INDIA_TOTAL_CAPACITY_MW["small_hydro"] +
    INDIA_TOTAL_CAPACITY_MW["biomass"]
)

# ─────────────────────────────────────────────────────────────────────────────
# INDIA PEAK DEMAND (MW) — POSOCO 2023-24
# ─────────────────────────────────────────────────────────────────────────────
INDIA_PEAK_DEMAND_MW       = 250_000   # All-time peak (May 2024)
INDIA_TYPICAL_PEAK_MW      = 220_000   # Summer peak
INDIA_TYPICAL_OFFPEAK_MW   = 150_000   # Night/monsoon low
INDIA_GRID_FREQUENCY_HZ    = 50.0      # India operates at 50 Hz (NOT 60 Hz like USA)
INDIA_FREQ_BAND_HZ         = (49.90, 50.05)  # IEGC acceptable band

# ─────────────────────────────────────────────────────────────────────────────
# 5 REGIONAL GRIDS — Real data (CEA/POSOCO)
# ─────────────────────────────────────────────────────────────────────────────
INDIA_REGIONS = {
    "northern": {
        "name":               "Northern Region",
        "abbreviation":       "NR",
        "states":             ["Delhi", "Punjab", "Haryana", "Himachal Pradesh",
                               "Uttarakhand", "Uttar Pradesh", "Jammu & Kashmir",
                               "Rajasthan", "Chandigarh"],
        "rldc":               "NRLDC",
        "peak_demand_mw":     75_000,
        "installed_capacity_mw": 135_000,
        "solar_capacity_mw":  52_000,   # Rajasthan dominates
        "wind_capacity_mw":   8_000,
        "capital_city":       "Delhi",
        "weather_lat":        28.7041,
        "weather_lon":        77.1025,
        "timezone":           "Asia/Kolkata",
        "dominant_renewable": "solar",
        "key_solar_state":    "Rajasthan (17+ GW)",
        "key_wind_state":     "Punjab",
    },
    "western": {
        "name":               "Western Region",
        "abbreviation":       "WR",
        "states":             ["Maharashtra", "Gujarat", "Madhya Pradesh",
                               "Chhattisgarh", "Goa", "Daman & Diu", "Dadra & Nagar Haveli"],
        "rldc":               "WRLDC",
        "peak_demand_mw":     65_000,
        "installed_capacity_mw": 145_000,
        "solar_capacity_mw":  40_000,
        "wind_capacity_mw":   22_000,   # Gujarat top wind state
        "capital_city":       "Mumbai",
        "weather_lat":        19.0760,
        "weather_lon":        72.8777,
        "timezone":           "Asia/Kolkata",
        "dominant_renewable": "wind+solar",
        "key_solar_state":    "Gujarat (7+ GW)",
        "key_wind_state":     "Gujarat (7+ GW)",
    },
    "southern": {
        "name":               "Southern Region",
        "abbreviation":       "SR",
        "states":             ["Andhra Pradesh", "Karnataka", "Kerala",
                               "Tamil Nadu", "Telangana", "Puducherry",
                               "Lakshadweep", "Andaman & Nicobar"],
        "rldc":               "SRLDC",
        "peak_demand_mw":     55_000,
        "installed_capacity_mw": 115_000,
        "solar_capacity_mw":  35_000,   # Karnataka + AP
        "wind_capacity_mw":   20_000,   # Tamil Nadu top wind state
        "capital_city":       "Bangalore",
        "weather_lat":        12.9716,
        "weather_lon":        77.5946,
        "timezone":           "Asia/Kolkata",
        "dominant_renewable": "wind+solar",
        "key_solar_state":    "Karnataka (9+ GW)",
        "key_wind_state":     "Tamil Nadu (9+ GW)",
    },
    "eastern": {
        "name":               "Eastern Region",
        "abbreviation":       "ER",
        "states":             ["West Bengal", "Bihar", "Jharkhand",
                               "Odisha", "Sikkim", "Andaman & Nicobar"],
        "rldc":               "ERLDC",
        "peak_demand_mw":     30_000,
        "installed_capacity_mw": 55_000,
        "solar_capacity_mw":  5_000,
        "wind_capacity_mw":   800,
        "capital_city":       "Kolkata",
        "weather_lat":        22.5726,
        "weather_lon":        88.3639,
        "timezone":           "Asia/Kolkata",
        "dominant_renewable": "solar",
        "key_solar_state":    "Odisha (growing)",
        "key_wind_state":     "West Bengal (limited)",
    },
    "northeastern": {
        "name":               "North-Eastern Region",
        "abbreviation":       "NER",
        "states":             ["Assam", "Meghalaya", "Mizoram", "Manipur",
                               "Nagaland", "Tripura", "Arunachal Pradesh", "Sikkim"],
        "rldc":               "NERLDC",
        "peak_demand_mw":     4_000,
        "installed_capacity_mw": 7_000,
        "solar_capacity_mw":  600,
        "wind_capacity_mw":   100,
        "capital_city":       "Guwahati",
        "weather_lat":        26.1445,
        "weather_lon":        91.7362,
        "timezone":           "Asia/Kolkata",
        "dominant_renewable": "hydro",
        "key_solar_state":    "Assam (growing)",
        "key_wind_state":     "Limited",
    },
}

# ─────────────────────────────────────────────────────────────────────────────
# STATE-WISE TOP RENEWABLE STATES (MNRE 2024)
# ─────────────────────────────────────────────────────────────────────────────
TOP_SOLAR_STATES_MW = {
    "Rajasthan":      17_500,
    "Gujarat":         7_500,
    "Karnataka":       9_300,
    "Andhra Pradesh":  8_000,
    "Maharashtra":     4_800,
    "Tamil Nadu":      5_100,
    "Telangana":       5_200,
    "Madhya Pradesh":  3_800,
    "Uttar Pradesh":   2_900,
    "Odisha":          1_200,
}

TOP_WIND_STATES_MW = {
    "Tamil Nadu":      9_800,
    "Gujarat":         7_800,
    "Rajasthan":       4_500,
    "Karnataka":       5_900,
    "Maharashtra":     7_200,
    "Andhra Pradesh":  4_200,
    "Madhya Pradesh":  2_800,
    "Telangana":       1_300,
    "Himachal Pradesh": 400,
    "West Bengal":      200,
}

# ─────────────────────────────────────────────────────────────────────────────
# INDIA HOURLY DEMAND PROFILE (% of peak) — POSOCO typical day
# ─────────────────────────────────────────────────────────────────────────────
# Based on POSOCO load curve — India has TWO peaks (morning + evening)
INDIA_LOAD_CURVE_IST = [
    0.65, 0.62, 0.60, 0.58, 0.57, 0.60,   # 00–05 IST (midnight low)
    0.68, 0.76, 0.83, 0.87, 0.89, 0.90,   # 06–11 IST (morning ramp)
    0.89, 0.88, 0.87, 0.87, 0.88, 0.91,   # 12–17 IST (afternoon)
    0.95, 1.00, 0.98, 0.93, 0.84, 0.74,   # 18–23 IST (EVENING PEAK at 19–20 IST)
]

# ─────────────────────────────────────────────────────────────────────────────
# ELECTRICITY PRICING (India) — IEX + CERC data
# ─────────────────────────────────────────────────────────────────────────────
INDIA_PRICES_INR_PER_MWH = {
    "day_ahead_market":    4_500,   # IEX DAM average ₹4.5/kWh = ₹4500/MWh
    "real_time_market":    4_200,
    "peak_rate":           6_500,   # Peak hour tariff
    "off_peak_rate":       3_200,
    "green_tariff":        2_800,   # Solar/wind PPA typical
    "coal_variable_cost":  2_100,   # Variable cost of coal generation
    "carbon_cost_inr":       250,   # Approx carbon price (REC ₹250/MWh equivalent)
    "transmission_charge":   450,   # PGCIL transmission ₹/MWh
}

# ─────────────────────────────────────────────────────────────────────────────
# DATA SOURCES USED
# ─────────────────────────────────────────────────────────────────────────────
INDIA_DATA_SOURCES = {
    "capacity_data":   "CEA Annual Report 2023-24 (https://cea.nic.in)",
    "demand_data":     "POSOCO/NLDC Load Report 2023-24 (https://posoco.in)",
    "renewable_data":  "MNRE State-wise Renewable Capacity 2024 (https://mnre.gov.in)",
    "pricing":         "IEX Market Data + CERC Tariff Orders 2024 (https://www.iexindia.com)",
    "weather":         "Open-Meteo API (https://open-meteo.com) — Free, no API key",
    "open_data_portal":"data.gov.in (https://data.gov.in) — Free CKAN API",
    "frequency_norms": "IEGC (Indian Electricity Grid Code) — CERC",
}

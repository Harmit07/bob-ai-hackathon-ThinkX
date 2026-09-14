"""
Financial + Energy Impact Calculator.
Calculates real-time financial cost of grid inefficiencies and
value of optimization actions.
"""
from typing import Dict, Any, List
from datetime import datetime

# Market price assumptions (USD/MWh)
PRICES = {
    "spot_energy":       55.0,   # average spot price
    "peak_energy":       120.0,  # peak period price
    "renewable_credit":  25.0,   # REC value per MWh
    "carbon_credit":     45.0,   # carbon credit per tCO2
    "conventional_fuel": 35.0,   # conventional generation fuel cost per MWh
    "demand_response":   80.0,   # DR payment per MWh reduced
}

# Grid parameters
GRID_PARAMS = {
    "total_capacity_mw":   5625,
    "carbon_intensity_kg": 400,  # kg CO2 per MWh conventional
}


def calculate_financial_impact(
    snapshot: Dict[str, Any],
    optimization: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Calculate current financial costs, savings, and opportunity values.
    Returns per-hour and projected daily figures.
    """
    demand = snapshot.get("demand_mw", 4000)
    solar = snapshot.get("solar_mw", 0)
    wind = snapshot.get("wind_mw", 0)
    renewable = solar + wind
    curtailment = snapshot.get("curtailment_mw", 0)
    conventional = snapshot.get("conventional_mw", demand - renewable)
    reserve = snapshot.get("reserve_margin_pct", 20)
    hour = datetime.utcnow().hour
    is_peak = 16 <= hour <= 21

    price = PRICES["peak_energy"] if is_peak else PRICES["spot_energy"]

    # --- Costs ---
    # Cost of curtailed renewable (lost revenue opportunity)
    curtailment_cost_hr = curtailment * PRICES["spot_energy"]

    # Cost of conventional generation (fuel + carbon)
    conventional_cost_hr = conventional * PRICES["conventional_fuel"]

    # Carbon cost from conventional generation
    carbon_emissions_tco2_hr = conventional * GRID_PARAMS["carbon_intensity_kg"] / 1000
    carbon_cost_hr = carbon_emissions_tco2_hr * PRICES["carbon_credit"]

    # Low reserve penalty cost (operational risk proxy)
    reserve_penalty_hr = max(0, (15 - reserve) * 500) if reserve < 15 else 0

    total_cost_hr = curtailment_cost_hr + conventional_cost_hr + carbon_cost_hr + reserve_penalty_hr

    # --- Savings & Value ---
    # Value of renewable energy dispatched
    renewable_value_hr = (renewable - curtailment) * (price + PRICES["renewable_credit"])

    # Carbon avoided from renewables
    carbon_avoided_tco2_hr = (renewable - curtailment) * GRID_PARAMS["carbon_intensity_kg"] / 1000
    carbon_credit_value_hr = carbon_avoided_tco2_hr * PRICES["carbon_credit"]

    # Value of optimization actions
    opt_recs = optimization.get("recommendations", [])
    optimization_value_hr = sum(
        r.get("impact_mw", 0) * PRICES["spot_energy"]
        for r in opt_recs if r.get("impact_mw", 0) > 0
    )

    # --- Daily projections (×24 simple scaling) ---
    daily_factor = 24

    # Summary metrics
    net_cost_hr = total_cost_hr - renewable_value_hr
    savings_opportunity_hr = curtailment * price  # if curtailment could be eliminated

    breakdown = [
        {"category": "Curtailment Loss",        "value_hr": round(curtailment_cost_hr, 0),    "type": "cost"},
        {"category": "Conventional Fuel Cost",  "value_hr": round(conventional_cost_hr, 0),   "type": "cost"},
        {"category": "Carbon Emissions Cost",   "value_hr": round(carbon_cost_hr, 0),          "type": "cost"},
        {"category": "Reserve Penalty",         "value_hr": round(reserve_penalty_hr, 0),      "type": "cost"},
        {"category": "Renewable Energy Value",  "value_hr": round(renewable_value_hr, 0),      "type": "revenue"},
        {"category": "Carbon Credit Value",     "value_hr": round(carbon_credit_value_hr, 0),  "type": "revenue"},
        {"category": "Optimization Upside",     "value_hr": round(optimization_value_hr, 0),   "type": "opportunity"},
    ]

    return {
        "period": "peak" if is_peak else "off_peak",
        "spot_price_per_mwh": price,
        "costs_per_hour": {
            "curtailment_loss_usd":    round(curtailment_cost_hr, 0),
            "conventional_fuel_usd":   round(conventional_cost_hr, 0),
            "carbon_cost_usd":         round(carbon_cost_hr, 0),
            "reserve_penalty_usd":     round(reserve_penalty_hr, 0),
            "total_cost_usd":          round(total_cost_hr, 0),
        },
        "value_per_hour": {
            "renewable_energy_usd":    round(renewable_value_hr, 0),
            "carbon_credit_usd":       round(carbon_credit_value_hr, 0),
            "optimization_upside_usd": round(optimization_value_hr, 0),
        },
        "environmental": {
            "carbon_emissions_tco2_hr":  round(carbon_emissions_tco2_hr, 2),
            "carbon_avoided_tco2_hr":    round(carbon_avoided_tco2_hr, 2),
            "renewable_mwh_delivered":   round(renewable - curtailment, 1),
        },
        "daily_projections": {
            "projected_curtailment_loss_usd": round(curtailment_cost_hr * daily_factor, 0),
            "projected_renewable_value_usd":  round(renewable_value_hr * daily_factor, 0),
            "projected_carbon_avoided_tco2":  round(carbon_avoided_tco2_hr * daily_factor, 2),
        },
        "savings_opportunity_per_hour_usd": round(savings_opportunity_hr, 0),
        "net_cost_per_hour_usd": round(net_cost_hr, 0),
        "breakdown": breakdown,
    }

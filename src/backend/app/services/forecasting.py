"""
Load forecasting service using XGBoost.
Trains on synthetic historical data and predicts next 24 hours of demand,
solar output, and wind output.
"""
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict, Any
from xgboost import XGBRegressor
from sklearn.preprocessing import StandardScaler

_model_demand: XGBRegressor | None = None
_model_solar: XGBRegressor | None = None
_model_wind: XGBRegressor | None = None
_scaler: StandardScaler | None = None


def _make_features(hour: int, day_of_week: int, month: int) -> np.ndarray:
    """Feature vector: hour sin/cos, dow sin/cos, month sin/cos."""
    return np.array([
        np.sin(2 * np.pi * hour / 24),
        np.cos(2 * np.pi * hour / 24),
        np.sin(2 * np.pi * day_of_week / 7),
        np.cos(2 * np.pi * day_of_week / 7),
        np.sin(2 * np.pi * month / 12),
        np.cos(2 * np.pi * month / 12),
        hour,
        day_of_week,
        month,
    ])


def _load_curve(hour: int) -> float:
    curve = [0.62,0.59,0.57,0.56,0.57,0.61,0.70,0.82,0.91,0.95,0.96,0.97,
             0.96,0.95,0.94,0.95,0.98,1.00,0.99,0.97,0.93,0.87,0.78,0.68]
    return curve[hour]


def _train_models():
    global _model_demand, _model_solar, _model_wind, _scaler
    rng = np.random.default_rng(0)
    n = 8760  # 1 year of hourly data
    X, y_demand, y_solar, y_wind = [], [], [], []

    base = datetime(2023, 1, 1)
    for i in range(n):
        ts = base + timedelta(hours=i)
        h, dow, mo = ts.hour, ts.weekday(), ts.month
        feats = _make_features(h, dow, mo)
        X.append(feats)

        demand = 4500 * _load_curve(h) + rng.normal(0, 60)
        solar_factor = max(0.0, 1.0 - abs(h - 13) / 7.0) if 6 <= h <= 20 else 0.0
        solar = 1200 * solar_factor * (1 - rng.uniform(0.05, 0.35) * 0.8) + rng.normal(0, 20)
        wind = 900 * max(0.0, rng.uniform(0.3, 0.75) + (0.1 if (h < 6 or h > 20) else 0.0))

        y_demand.append(demand)
        y_solar.append(max(0, solar))
        y_wind.append(max(0, wind))

    X = np.array(X)
    _scaler = StandardScaler()
    X_scaled = _scaler.fit_transform(X)

    _model_demand = XGBRegressor(n_estimators=200, max_depth=4, learning_rate=0.1, random_state=42)
    _model_solar = XGBRegressor(n_estimators=200, max_depth=4, learning_rate=0.1, random_state=42)
    _model_wind = XGBRegressor(n_estimators=200, max_depth=4, learning_rate=0.1, random_state=42)

    _model_demand.fit(X_scaled, y_demand)
    _model_solar.fit(X_scaled, y_solar)
    _model_wind.fit(X_scaled, y_wind)


def get_forecast(hours_ahead: int = 24) -> List[Dict[str, Any]]:
    """Return hourly forecast for the next `hours_ahead` hours."""
    global _model_demand, _model_solar, _model_wind, _scaler
    if _model_demand is None:
        _train_models()

    now = datetime.utcnow().replace(minute=0, second=0, microsecond=0)
    forecasts = []
    for i in range(1, hours_ahead + 1):
        ts = now + timedelta(hours=i)
        h, dow, mo = ts.hour, ts.weekday(), ts.month
        feats = _scaler.transform([_make_features(h, dow, mo)])

        demand = float(_model_demand.predict(feats)[0])
        solar = float(max(0, _model_solar.predict(feats)[0]))
        wind = float(max(0, _model_wind.predict(feats)[0]))
        renewable = solar + wind
        curtailment_risk = max(0.0, (renewable - demand) / demand) if demand > 0 else 0.0
        reserve_margin = (4500 * 1.25 - demand) / (4500 * 1.25) * 100

        forecasts.append({
            "timestamp": ts.isoformat() + "Z",
            "demand_mw": round(demand, 1),
            "solar_mw": round(solar, 1),
            "wind_mw": round(wind, 1),
            "renewable_mw": round(renewable, 1),
            "curtailment_risk_pct": round(curtailment_risk * 100, 1),
            "reserve_margin_pct": round(reserve_margin, 1),
        })
    return forecasts

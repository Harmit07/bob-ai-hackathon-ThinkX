import os
from datetime import datetime, timedelta
import joblib
import pandas as pd
import numpy as np
from typing import Dict, List, Any

SAVED_MODELS_DIR = os.path.join(os.path.dirname(__file__), "saved_models")

class RenewableForecaster:
    """
    ML Renewable Generation Forecaster using dataset-trained models.
    """
    def __init__(self):
        self.model = None
        self.type_map = None
        self._load_saved_model()

    def _load_saved_model(self):
        model_path = os.path.join(SAVED_MODELS_DIR, "renewable_model.joblib")
        map_path = os.path.join(SAVED_MODELS_DIR, "type_map.joblib")
        if os.path.exists(model_path) and os.path.exists(map_path):
            try:
                self.model = joblib.load(model_path)
                self.type_map = joblib.load(map_path)
            except Exception as e:
                print(f"Warning: Failed to load renewable model: {e}")

    def predict_24h(self, df: pd.DataFrame, horizon_hours: int = 24) -> List[Dict[str, Any]]:
        last_ts = pd.to_datetime(df["timestamp"]).max() if "timestamp" in df.columns and not df.empty else datetime.utcnow()
        if pd.isnull(last_ts):
            last_ts = datetime.utcnow()

        renewable_nodes = [
            ("SOLAR_B17", 0, 150.0, "solar"),
            ("SOLAR_A01", 0, 200.0, "solar"),
            ("WIND_W01", 1, 180.0, "wind"),
            ("WIND_W02", 1, 250.0, "wind")
        ]

        forecasts = []
        for h in range(1, horizon_hours + 1):
            future_ts = last_ts + timedelta(hours=h)
            hour = future_ts.hour
            month = future_ts.month

            solar_irr = max(0.0, np.sin((hour - 6) * np.pi / 12) * 950.0) if 6 <= hour <= 18 else 0.0
            wind_sp = max(0.0, 7.0 + 3.5 * np.sin(hour * np.pi / 12))
            temp = 18.0 + 9.0 * np.sin((hour - 8) * np.pi / 12)

            for node_id, type_enc, cap, f_type in renewable_nodes:
                if self.model:
                    irr = solar_irr if f_type == "solar" else 0.0
                    w_sp = wind_sp if f_type == "wind" else 2.0
                    
                    X_pred = pd.DataFrame([{
                        "asset_type_encoded": type_enc,
                        "installed_capacity_mw": cap,
                        "availability_pct": 98.0,
                        "irradiance_w_m2": irr,
                        "wind_speed_m_s": w_sp,
                        "temperature_c": temp,
                        "hour": hour,
                        "month": month
                    }])
                    pred_raw = float(self.model.predict(X_pred)[0])
                    pred_mw = min(cap, max(0.0, pred_raw))
                else:
                    if f_type == "solar":
                        pred_mw = min(cap, max(0.0, (solar_irr / 1000.0) * cap * 0.9))
                    else:
                        pred_mw = min(cap, max(0.0, (wind_sp / 12.0) ** 3 * cap * 0.6))

                std_err = pred_mw * 0.05
                forecasts.append({
                    "timestamp": future_ts.isoformat(),
                    "node_id": node_id,
                    "forecast_type": f_type,
                    "predicted_mw": round(pred_mw, 2),
                    "lower_bound": round(max(0.0, pred_mw - 1.96 * std_err), 2),
                    "upper_bound": round(min(cap, pred_mw + 1.96 * std_err), 2)
                })

        return forecasts

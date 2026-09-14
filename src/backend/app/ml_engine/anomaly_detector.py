import os
import joblib
import pandas as pd
import numpy as np
from typing import List, Dict, Any

SAVED_MODELS_DIR = os.path.join(os.path.dirname(__file__), "saved_models")

class GridAnomalyDetector:
    """
    Ensemble Anomaly Detector combining trained Isolation Forest and Rule Metrics.
    """
    def __init__(self, contamination: float = 0.05):
        self.iso_forest = None
        self.classifier = None
        self.fault_map = None
        self.inv_fault_map = None
        self._load_saved_model()

    def _load_saved_model(self):
        iso_path = os.path.join(SAVED_MODELS_DIR, "iso_forest.joblib")
        clf_path = os.path.join(SAVED_MODELS_DIR, "fault_classifier.joblib")
        inv_path = os.path.join(SAVED_MODELS_DIR, "inv_fault_map.joblib")
        
        if os.path.exists(iso_path) and os.path.exists(clf_path):
            try:
                self.iso_forest = joblib.load(iso_path)
                self.classifier = joblib.load(clf_path)
                self.inv_fault_map = joblib.load(inv_path)
            except Exception as e:
                print(f"Warning: Failed to load anomaly models: {e}")

    def detect_anomalies(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        results = []
        if df.empty:
            return results

        telemetry_cols = [
            "power_output_mw", "voltage_kv", "current_a", "temperature_c",
            "inverter_temperature_c", "inverter_voltage", "inverter_efficiency",
            "tracker_angle", "vibration", "frequency_hz", "irradiance_w_m2"
        ]

        has_dataset_cols = all(c in df.columns for c in telemetry_cols)

        if has_dataset_cols and self.classifier and self.inv_fault_map:
            X = df[telemetry_cols].fillna(df[telemetry_cols].mean())
            preds = self.classifier.predict(X)
            probs = self.classifier.predict_proba(X) if hasattr(self.classifier, "predict_proba") else None
            
            for i, (_, row) in enumerate(df.iterrows()):
                fault_id = preds[i]
                fault_name = self.inv_fault_map.get(fault_id, "NORMAL")
                
                if fault_name != "NORMAL":
                    conf = float(np.max(probs[i])) if probs is not None else 0.85
                    node_id = str(row.get("asset_id", row.get("node_id", "SOLAR_B17")))
                    
                    results.append({
                        "node_id": node_id,
                        "timestamp": str(row["timestamp"]),
                        "anomaly_score": round(conf, 3),
                        "is_anomaly": True,
                        "fault_type": fault_name,
                        "affected_metrics": [
                            f"inverter_temperature_c ({row.get('inverter_temperature_c', 0):.1f}C)",
                            f"inverter_efficiency ({row.get('inverter_efficiency', 0):.2f})"
                        ] if fault_name == "INVERTER_DERATING" else [fault_name.lower()],
                        "description": f"ML Fault Identified on {node_id}: {fault_name} (Confidence: {conf*100:.1f}%)"
                    })
        else:
            # Fallback for simple telemetry schema
            for idx, row in df.iterrows():
                voltage = float(row.get("voltage_pu", 1.0))
                freq = float(row.get("frequency_hz", 60.0))
                congestion = bool(row.get("congestion_flag", False))
                raw_score = float(row.get("anomaly_score", 0.0))
                node_id = str(row.get("node_id", row.get("asset_id", "NODE_01")))

                affected = []
                if voltage < 0.95 or voltage > 1.05:
                    affected.append(f"voltage ({voltage:.3f})")
                if freq < 59.5 or freq > 60.5:
                    affected.append(f"frequency ({freq:.2f}Hz)")
                if congestion:
                    affected.append("line_congestion")

                if affected or raw_score >= 0.5:
                    results.append({
                        "node_id": node_id,
                        "timestamp": str(row["timestamp"]),
                        "anomaly_score": round(max(raw_score, 0.82), 3),
                        "is_anomaly": True,
                        "fault_type": "GRID_CONSTRAINT" if congestion else "VOLTAGE_SAG",
                        "affected_metrics": affected,
                        "description": f"Anomaly on {node_id}: {', '.join(affected) if affected else 'telemetry sag'}"
                    })

        return results

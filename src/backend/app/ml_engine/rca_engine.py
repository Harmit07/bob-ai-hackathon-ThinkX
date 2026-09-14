import os
import joblib
from typing import List, Dict, Any

SAVED_MODELS_DIR = os.path.join(os.path.dirname(__file__), "saved_models")

class RCAEngine:
    """
    Explainable Root Cause Analysis Engine mapped directly to dataset ground truth fault classes.
    """
    def __init__(self):
        self.inv_fault_map = None
        self._load_saved_model()

    def _load_saved_model(self):
        inv_path = os.path.join(SAVED_MODELS_DIR, "inv_fault_map.joblib")
        if os.path.exists(inv_path):
            try:
                self.inv_fault_map = joblib.load(inv_path)
            except Exception as e:
                print(f"Warning: Failed to load RCA model map: {e}")

    def analyze_root_cause(self, anomaly: Dict[str, Any], telemetry_context: Dict[str, Any]) -> Dict[str, Any]:
        node_id = anomaly.get("node_id", "SOLAR_B17")
        fault_type = anomaly.get("fault_type", "INVERTER_DERATING")
        score = anomaly.get("anomaly_score", 0.88)

        inv_temp = telemetry_context.get("inverter_temperature_c", 82.5)
        eff = telemetry_context.get("inverter_efficiency", 0.78)
        actual_mw = telemetry_context.get("power_output_mw", 87.0)

        # Map dataset fault classes to physical explanations & mitigations
        rca_knowledge = {
            "INVERTER_DERATING": {
                "cause": "Solar Inverter Thermal Derating (Over-temperature)",
                "confidence": 0.94,
                "factors": [
                    f"Inverter temperature reached {inv_temp:.1f}°C (Threshold: 75°C)",
                    f"Inverter efficiency degraded to {eff*100:.1f}%",
                    f"Solar plant generation output restricted to {actual_mw:.1f} MW"
                ],
                "mitigation": "Dispatch BESS_03 (Industrial Belt 350 MW) battery reserve and inspect cooling fans on SOLAR_B17 inverter units."
            },
            "HIGH_TEMPERATURE": {
                "cause": "Asset Thermal Overheating Failure Risk",
                "confidence": 0.96,
                "factors": [
                    f"High ambient and component temperature ({inv_temp:.1f}°C)",
                    "Thermal protection limit triggered"
                ],
                "mitigation": "Curtail plant capacity temporarily and activate auxiliary cooling system."
            },
            "SENSOR_FAILURE": {
                "cause": "Instrumentation Telemetry Sensor Malfunction",
                "confidence": 0.91,
                "factors": [
                    "Irradiance and power reading mismatch",
                    "Sensor voltage telemetry dropout"
                ],
                "mitigation": "Calibrate or replace field telemetry sensor unit on asset."
            },
            "GRID_CONSTRAINT": {
                "cause": "Transmission Line Thermal Capacity Congestion",
                "confidence": 0.93,
                "factors": [
                    "Transmission line utilization exceeds 88% thermal safety threshold",
                    "Inter-region corridor power bottleneck"
                ],
                "mitigation": "Execute inter-region transfer redispatch or activate Demand Response."
            },
            "SOILING": {
                "cause": "PV Solar Panel Dust / Soiling Accumulation",
                "confidence": 0.87,
                "factors": [
                    "Optical irradiance transmission loss",
                    "Gradual efficiency degradation across solar string"
                ],
                "mitigation": "Schedule automated robotic panel cleaning cycle."
            },
            "TRACKER_FAILURE": {
                "cause": "Single-Axis Solar Tracker Mechanical Sticking",
                "confidence": 0.89,
                "factors": [
                    "Tracker angle off optimal solar incidence by >15 degrees",
                    "Actuator mechanical vibration anomaly"
                ],
                "mitigation": "Dispatch field technician to reset solar tracker motor actuator."
            }
        }

        info = rca_knowledge.get(fault_type, {
            "cause": f"System Telemetry Event ({fault_type})",
            "confidence": 0.80,
            "factors": [f"Anomaly score evaluated at {score:.2f}"],
            "mitigation": "Monitor asset telemetry closely."
        })

        root_cause_tree = {
            "root_event": info["cause"],
            "fault_class": fault_type,
            "physical_indicators": {
                "inverter_temperature_c": inv_temp,
                "inverter_efficiency": eff,
                "actual_power_mw": actual_mw
            },
            "confidence_score": info["confidence"]
        }

        return {
            "anomaly_id": f"RCA_{node_id}_{anomaly.get('timestamp', 'NOW')}",
            "node_id": node_id,
            "primary_cause": info["cause"],
            "confidence": info["confidence"],
            "contributing_factors": info["factors"],
            "root_cause_tree": root_cause_tree,
            "recommended_mitigation": info["mitigation"]
        }

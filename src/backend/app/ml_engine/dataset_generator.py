from datetime import datetime, timedelta
import pandas as pd
import numpy as np
import random
from typing import Optional

def generate_synthetic_telemetry(
    num_hours: int = 168, # 7 days
    nodes: Optional[list[str]] = None,
    seed: int = 42,
    inject_anomalies: bool = True
) -> pd.DataFrame:
    """
    Generates synthetic grid telemetry data with diurnal weather cycles, load patterns,
    and optional anomaly injections.
    """
    np.random.seed(seed)
    random.seed(seed)

    if not nodes:
        nodes = [
            "NODE_SOLAR_01", "NODE_SOLAR_02", "NODE_WIND_01", "NODE_WIND_02",
            "NODE_BATTERY_01", "NODE_HYDRO_01", "NODE_THERMAL_01",
            "NODE_LOAD_IND", "NODE_LOAD_RES", "NODE_SUBSTATION_CENTRAL"
        ]

    capacities = {
        "NODE_SOLAR_01": 150.0, "NODE_SOLAR_02": 200.0,
        "NODE_WIND_01": 180.0, "NODE_WIND_02": 250.0,
        "NODE_BATTERY_01": 100.0, "NODE_HYDRO_01": 120.0,
        "NODE_THERMAL_01": 200.0, "NODE_LOAD_IND": 350.0,
        "NODE_LOAD_RES": 250.0, "NODE_SUBSTATION_CENTRAL": 600.0
    }

    start_time = datetime.utcnow().replace(minute=0, second=0, microsecond=0) - timedelta(hours=num_hours)
    records = []

    for h in range(num_hours):
        current_time = start_time + timedelta(hours=h)
        hour_of_day = current_time.hour
        day_of_week = current_time.weekday()

        # Solar irradiance curve (peak around 12-13h)
        base_solar = max(0.0, np.sin((hour_of_day - 6) * np.pi / 12) * 1000.0) if 6 <= hour_of_day <= 18 else 0.0
        solar_irradiance = max(0.0, base_solar + np.random.normal(0, 30))

        # Wind speed curve (diurnal + noise)
        wind_speed = max(0.0, 7.0 + 3.0 * np.sin(hour_of_day * np.pi / 12) + np.random.normal(0, 1.5))

        # Ambient temperature (peak in afternoon)
        temperature = 18.0 + 10.0 * np.sin((hour_of_day - 8) * np.pi / 12) + np.random.normal(0, 1.0)

        for node_id in nodes:
            cap = capacities.get(node_id, 100.0)
            
            # Anomaly injection probability
            is_anomaly = inject_anomalies and (random.random() < 0.02)
            
            if "SOLAR" in node_id:
                power_mw = (solar_irradiance / 1000.0) * cap * np.random.uniform(0.85, 0.98)
            elif "WIND" in node_id:
                power_mw = min(cap, (wind_speed / 12.0) ** 3 * cap * np.random.uniform(0.4, 0.8))
            elif "LOAD" in node_id:
                is_weekend = 1 if day_of_week >= 5 else 0
                mult = 0.8 if is_weekend else 1.0
                base_load = cap * 0.5 * mult
                peak_load = cap * 0.35 * np.sin((hour_of_day - 9) * np.pi / 12) * mult
                power_mw = max(10.0, base_load + peak_load + np.random.normal(0, 8.0))
            elif "BATTERY" in node_id:
                # Solar charging in day, discharging at night
                if 10 <= hour_of_day <= 15:
                    power_mw = -cap * 0.4 # Charging
                elif 18 <= hour_of_day <= 22:
                    power_mw = cap * 0.5 # Discharging
                else:
                    power_mw = np.random.uniform(-10.0, 10.0)
            elif "HYDRO" in node_id:
                power_mw = cap * np.random.uniform(0.3, 0.7)
            elif "THERMAL" in node_id:
                power_mw = cap * np.random.uniform(0.2, 0.6)
            else: # SUBSTATION
                power_mw = cap * np.random.uniform(0.5, 0.85)

            # Anomaly mutations
            voltage_pu = np.random.uniform(0.98, 1.02)
            frequency_hz = np.random.uniform(59.9, 60.1)
            congestion = False
            anomaly_score = float(np.random.uniform(0.01, 0.15))

            if is_anomaly:
                anomaly_type = random.choice(["voltage_sag", "freq_drop", "power_spike", "sensor_glitch"])
                if anomaly_type == "voltage_sag":
                    voltage_pu = float(np.random.uniform(0.85, 0.92))
                elif anomaly_type == "freq_drop":
                    frequency_hz = float(np.random.uniform(59.0, 59.4))
                elif anomaly_type == "power_spike":
                    power_mw = float(power_mw * np.random.uniform(1.4, 1.8))
                elif anomaly_type == "sensor_glitch":
                    solar_irradiance = 0.0
                    power_mw = 0.0
                congestion = random.choice([True, False])
                anomaly_score = float(np.random.uniform(0.75, 0.98))

            records.append({
                "timestamp": current_time.isoformat(),
                "node_id": node_id,
                "power_mw": round(float(power_mw), 2),
                "voltage_pu": round(float(voltage_pu), 3),
                "frequency_hz": round(float(frequency_hz), 2),
                "solar_irradiance": round(float(solar_irradiance), 1),
                "wind_speed": round(float(wind_speed), 2),
                "temperature": round(float(temperature), 1),
                "congestion_flag": congestion,
                "anomaly_score": round(anomaly_score, 3)
            })

    return pd.DataFrame(records)

if __name__ == "__main__":
    df = generate_synthetic_telemetry(num_hours=24)
    print(f"Generated {len(df)} telemetry records across {df['node_id'].nunique()} nodes.")
    print(df.head())

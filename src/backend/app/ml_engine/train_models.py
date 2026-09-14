import os
import json
import joblib
import pandas as pd
import numpy as np
from datetime import datetime
from sklearn.ensemble import HistGradientBoostingRegressor, HistGradientBoostingClassifier, IsolationForest
from sklearn.metrics import mean_squared_error, r2_score, accuracy_score, classification_report

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "data")
SAVED_MODELS_DIR = os.path.join(os.path.dirname(__file__), "saved_models")

def load_dataset():
    print("Loading GridPilot dataset CSVs from data/ directory...")
    assets_df = pd.read_csv(os.path.join(DATA_DIR, "assets.csv"))
    demand_df = pd.read_csv(os.path.join(DATA_DIR, "demand.csv"))
    weather_df = pd.read_csv(os.path.join(DATA_DIR, "weather.csv"))
    ren_gen_df = pd.read_csv(os.path.join(DATA_DIR, "renewable_generation.csv"))
    telemetry_df = pd.read_csv(os.path.join(DATA_DIR, "asset_telemetry.csv"))
    transmission_df = pd.read_csv(os.path.join(DATA_DIR, "grid_transmission.csv"))
    batteries_df = pd.read_csv(os.path.join(DATA_DIR, "batteries.csv"))
    
    return {
        "assets": assets_df,
        "demand": demand_df,
        "weather": weather_df,
        "renewable_generation": ren_gen_df,
        "asset_telemetry": telemetry_df,
        "transmission": transmission_df,
        "batteries": batteries_df
    }

def train_demand_model(demand_df: pd.DataFrame, weather_df: pd.DataFrame):
    print("\n--- [1/4] Training Demand Forecasting Model ---")
    df = pd.merge(demand_df, weather_df, on=["timestamp", "region_id"], suffixes=("", "_w"))
    
    # Feature engineering
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df = df.sort_values(by=["region_id", "timestamp"]).reset_index(drop=True)
    
    # Create lag features per region
    df["load_lag_1h"] = df.groupby("region_id")["load_mw"].shift(1)
    df["load_lag_24h"] = df.groupby("region_id")["load_mw"].shift(24)
    df["load_rolling_24h"] = df.groupby("region_id")["load_mw"].transform(lambda x: x.shift(1).rolling(24).mean())
    
    df = df.dropna().reset_index(drop=True)
    
    # Categorical region encoding
    region_map = {r: i for i, r in enumerate(df["region_id"].unique())}
    df["region_encoded"] = df["region_id"].map(region_map)
    
    features = [
        "region_encoded", "hour", "day_of_week", "month", "is_weekend", "is_holiday",
        "temperature_c", "humidity", "ev_load_mw", "industrial_load_mw",
        "commercial_load_mw", "residential_load_mw", "load_lag_1h", "load_lag_24h", "load_rolling_24h"
    ]
    target = "load_mw"
    
    # Chronological train-test split (80/20)
    split_idx = int(len(df) * 0.8)
    X_train, X_test = df[features].iloc[:split_idx], df[features].iloc[split_idx:]
    y_train, y_test = df[target].iloc[:split_idx], df[target].iloc[split_idx:]
    
    model = HistGradientBoostingRegressor(max_iter=100, random_state=42)
    model.fit(X_train, y_train)
    
    preds = model.predict(X_test)
    rmse = np.sqrt(mean_squared_error(y_test, preds))
    r2 = r2_score(y_test, preds)
    print(f"Demand Model Performance -> Test RMSE: {rmse:.2f} MW | R2 Score: {r2:.4f}")
    
    return model, region_map

def train_renewable_model(ren_df: pd.DataFrame):
    print("\n--- [2/4] Training Renewable Generation Model ---")
    df = ren_df.copy()
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df["hour"] = df["timestamp"].dt.hour
    df["month"] = df["timestamp"].dt.month
    
    type_map = {"solar": 0, "wind": 1, "hydro": 2, "thermal": 3}
    df["asset_type_encoded"] = df["asset_type"].map(type_map).fillna(0)
    
    features = [
        "asset_type_encoded", "installed_capacity_mw", "availability_pct",
        "irradiance_w_m2", "wind_speed_m_s", "temperature_c", "hour", "month"
    ]
    target = "actual_generation_mw"
    
    split_idx = int(len(df) * 0.8)
    X_train, X_test = df[features].iloc[:split_idx], df[features].iloc[split_idx:]
    y_train, y_test = df[target].iloc[:split_idx], df[target].iloc[split_idx:]
    
    model = HistGradientBoostingRegressor(max_iter=100, random_state=42)
    model.fit(X_train, y_train)
    
    preds = model.predict(X_test)
    rmse = np.sqrt(mean_squared_error(y_test, preds))
    r2 = r2_score(y_test, preds)
    print(f"Renewable Model Performance -> Test RMSE: {rmse:.2f} MW | R2 Score: {r2:.4f}")
    
    return model, type_map

def train_fault_classifier_and_anomaly_detector(telemetry_df: pd.DataFrame):
    print("\n--- [3/4] Training Anomaly Detector & Fault RCA Classifier ---")
    df = telemetry_df.copy()
    
    features = [
        "power_output_mw", "voltage_kv", "current_a", "temperature_c",
        "inverter_temperature_c", "inverter_voltage", "inverter_efficiency",
        "tracker_angle", "vibration", "frequency_hz", "irradiance_w_m2"
    ]
    target = "fault_type"
    
    # Handle any NaNs
    df[features] = df[features].fillna(df[features].mean())
    
    # Target encoding
    fault_types = sorted(df[target].unique())
    fault_map = {f: i for i, f in enumerate(fault_types)}
    inv_fault_map = {i: f for i, f in enumerate(fault_types)}
    df["target_encoded"] = df[target].map(fault_map)
    
    split_idx = int(len(df) * 0.8)
    X_train, X_test = df[features].iloc[:split_idx], df[features].iloc[split_idx:]
    y_train, y_test = df["target_encoded"].iloc[:split_idx], df["target_encoded"].iloc[split_idx:]
    
    classifier = HistGradientBoostingClassifier(max_iter=100, random_state=42)
    classifier.fit(X_train, y_train)
    
    preds = classifier.predict(X_test)
    acc = accuracy_score(y_test, preds)
    print(f"Fault Classifier Performance -> Accuracy: {acc * 100:.2f}%")
    print("Classification Report:")
    print(classification_report(y_test, preds, target_names=fault_types, zero_division=0))
    
    # Isolation Forest for un-labeled metric novelty scoring
    iso_forest = IsolationForest(contamination=0.10, random_state=42)
    iso_forest.fit(X_train[features])
    
    return classifier, iso_forest, fault_map, inv_fault_map

def train_curtailment_model(ren_df: pd.DataFrame):
    print("\n--- [4/4] Training Renewable Curtailment Predictor ---")
    df = ren_df.copy()
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df["hour"] = df["timestamp"].dt.hour
    
    features = [
        "installed_capacity_mw", "expected_generation_mw", "actual_generation_mw",
        "availability_pct", "irradiance_w_m2", "wind_speed_m_s", "hour"
    ]
    target = "curtailment_mw"
    
    split_idx = int(len(df) * 0.8)
    X_train, X_test = df[features].iloc[:split_idx], df[features].iloc[split_idx:]
    y_train, y_test = df[target].iloc[:split_idx], df[target].iloc[split_idx:]
    
    model = HistGradientBoostingRegressor(max_iter=80, random_state=42)
    model.fit(X_train, y_train)
    
    preds = model.predict(X_test)
    rmse = np.sqrt(mean_squared_error(y_test, preds))
    print(f"Curtailment Model Performance -> RMSE: {rmse:.2f} MW")
    
    return model

def main():
    os.makedirs(SAVED_MODELS_DIR, exist_ok=True)
    datasets = load_dataset()
    
    demand_model, region_map = train_demand_model(datasets["demand"], datasets["weather"])
    renewable_model, type_map = train_renewable_model(datasets["renewable_generation"])
    classifier, iso_forest, fault_map, inv_fault_map = train_fault_classifier_and_anomaly_detector(datasets["asset_telemetry"])
    curtailment_model = train_curtailment_model(datasets["renewable_generation"])
    
    print("\nSaving trained models to backend/app/ml_engine/saved_models/ ...")
    joblib.dump(demand_model, os.path.join(SAVED_MODELS_DIR, "demand_model.joblib"))
    joblib.dump(region_map, os.path.join(SAVED_MODELS_DIR, "region_map.joblib"))
    
    joblib.dump(renewable_model, os.path.join(SAVED_MODELS_DIR, "renewable_model.joblib"))
    joblib.dump(type_map, os.path.join(SAVED_MODELS_DIR, "type_map.joblib"))
    
    joblib.dump(classifier, os.path.join(SAVED_MODELS_DIR, "fault_classifier.joblib"))
    joblib.dump(iso_forest, os.path.join(SAVED_MODELS_DIR, "iso_forest.joblib"))
    joblib.dump(fault_map, os.path.join(SAVED_MODELS_DIR, "fault_map.joblib"))
    joblib.dump(inv_fault_map, os.path.join(SAVED_MODELS_DIR, "inv_fault_map.joblib"))
    
    joblib.dump(curtailment_model, os.path.join(SAVED_MODELS_DIR, "curtailment_model.joblib"))
    
    meta = {
        "trained_at": datetime.utcnow().isoformat(),
        "status": "SUCCESS",
        "dataset_source": "GridPilot AI Synthetic Grid Dataset (2026)",
        "models": ["demand_model", "renewable_model", "fault_classifier", "iso_forest", "curtailment_model"]
    }
    with open(os.path.join(SAVED_MODELS_DIR, "metadata.json"), "w") as f:
        json.dump(meta, f, indent=2)
        
    print("\n[SUCCESS] All 4 Machine Learning models successfully trained and serialized!")

if __name__ == "__main__":
    main()

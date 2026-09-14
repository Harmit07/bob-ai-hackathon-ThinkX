import pytest
from app.ml_engine.dataset_generator import generate_synthetic_telemetry
from app.ml_engine.anomaly_detector import GridAnomalyDetector
from app.ml_engine.rca_engine import RCAEngine
from app.ml_engine.grid_stress import calculate_grid_stress_index

def test_anomaly_and_rca():
    df = generate_synthetic_telemetry(num_hours=24, seed=42, inject_anomalies=True)

    detector = GridAnomalyDetector()
    anomalies = detector.detect_anomalies(df)
    assert isinstance(anomalies, list)

    rca = RCAEngine()
    if anomalies:
        a = anomalies[0]
        ctx = df[df["node_id"] == a["node_id"]].iloc[-1].to_dict()
        rca_res = rca.analyze_root_cause(a, ctx)
        assert "primary_cause" in rca_res
        assert "confidence" in rca_res

    stress = calculate_grid_stress_index(df, anomalies)
    assert 0.0 <= stress["grid_stress_index"] <= 100.0
    assert "status" in stress

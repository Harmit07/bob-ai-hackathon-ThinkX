import pytest
import pandas as pd
from app.ml_engine.dataset_generator import generate_synthetic_telemetry

def test_generate_synthetic_telemetry():
    df = generate_synthetic_telemetry(num_hours=12, seed=42)
    assert not df.empty
    assert "timestamp" in df.columns
    assert "node_id" in df.columns
    assert "power_mw" in df.columns
    assert "voltage_pu" in df.columns
    assert "frequency_hz" in df.columns
    assert df["node_id"].nunique() >= 5
    assert len(df) == 12 * df["node_id"].nunique()

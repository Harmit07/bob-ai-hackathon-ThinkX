import pytest
import pandas as pd
from app.ml_engine.csv_validator import validate_and_clean_csv

def test_csv_validation_valid():
    valid_csv = """timestamp,node_id,power_mw,voltage_pu,frequency_hz
2026-09-14T10:00:00,NODE_SOLAR_01,120.5,1.01,60.0
2026-09-14T11:00:00,NODE_SOLAR_01,135.0,0.99,59.9
"""
    is_valid, errors, df = validate_and_clean_csv(valid_csv)
    assert is_valid is True
    assert len(df) == 2
    assert "voltage_pu" in df.columns

def test_csv_validation_missing_required():
    invalid_csv = """timestamp,power_mw
2026-09-14T10:00:00,120.5
"""
    is_valid, errors, df = validate_and_clean_csv(invalid_csv)
    assert is_valid is False
    assert any("node_id" in err for err in errors)

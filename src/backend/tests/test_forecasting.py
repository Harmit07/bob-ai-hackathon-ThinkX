import pytest
from app.ml_engine.dataset_generator import generate_synthetic_telemetry
from app.ml_engine.demand_forecaster import DemandForecaster
from app.ml_engine.renewable_forecaster import RenewableForecaster
from app.ml_engine.curtailment_predictor import predict_curtailment_risk

def test_forecasters():
    df = generate_synthetic_telemetry(num_hours=48, seed=42)

    demand_fc = DemandForecaster()
    dem_res = demand_fc.predict_24h(df, horizon_hours=24)
    assert len(dem_res) > 0
    assert all("predicted_mw" in f for f in dem_res)

    ren_fc = RenewableForecaster()
    ren_res = ren_fc.predict_24h(df, horizon_hours=24)
    assert len(ren_res) > 0
    assert any(f["forecast_type"] == "solar" for f in ren_res)
    assert any(f["forecast_type"] == "wind" for f in ren_res)

    curtail_res = predict_curtailment_risk(ren_res, dem_res)
    assert len(curtail_res) > 0

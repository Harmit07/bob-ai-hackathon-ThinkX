from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_grid_status():
    res = client.get("/api/grid/status")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "NORMAL"
    assert data["grid_stress"] == 27.1
    assert data["reserve_margin_gw"] == -0.4

def test_grid_stress():
    res = client.get("/api/grid/stress")
    assert res.status_code == 200
    data = res.json()
    assert data["score"] == 27.1
    assert "breakdown" in data

def test_demand_forecast():
    res = client.get("/api/forecast/demand")
    assert res.status_code == 200
    data = res.json()
    assert data["current_demand_mw"] == 16800
    assert len(data["forecast"]) == 24

def test_renewable_forecast():
    res = client.get("/api/forecast/renewables")
    assert res.status_code == 200
    data = res.json()
    assert data["expected_mw"] == 11200
    assert "solar" in data
    assert "wind" in data

def test_assets():
    res = client.get("/api/assets")
    assert res.status_code == 200
    data = res.json()
    assert len(data["assets"]) >= 1

def test_asset_detail_and_telemetry():
    res = client.get("/api/assets/SOLAR_B17")
    assert res.status_code == 200
    assert res.json()["asset_id"] == "SOLAR_B17"

    res_tel = client.get("/api/assets/SOLAR_B17/telemetry")
    assert res_tel.status_code == 200
    assert len(res_tel.json()) == 24

def test_anomalies_and_rca():
    res = client.get("/api/anomalies")
    assert res.status_code == 200
    assert len(res.json()["anomalies"]) >= 1

    res_rca = client.get("/api/anomalies/SOLAR_B17/rca")
    assert res_rca.status_code == 200
    assert res_rca.json()["primary_cause"] == "Inverter Derating"

def test_curtailment_risk():
    res = client.get("/api/curtailment/risk")
    assert res.status_code == 200
    assert res.json()["risk"] == "HIGH"

def test_optimization_and_simulation():
    res_opt = client.post("/api/optimization/run", json={"demand_change_pct": 0})
    assert res_opt.status_code == 200
    assert res_opt.json()["status"] == "OPTIMAL"

    res_sim = client.post("/api/simulation/run", json={"demand_change_pct": 10, "solar_change_pct": -15})
    assert res_sim.status_code == 200
    assert res_sim.json()["scenario_id"] == "SIM_001"

def test_recommendations_and_actions():
    res_recs = client.get("/api/recommendations")
    assert res_recs.status_code == 200
    assert len(res_recs.json()["recommendations"]) >= 1

    res_app = client.post("/api/recommendations/REC_001/approve")
    assert res_app.status_code == 200
    assert "Simulation approved" in res_app.json()["message"]

    res_rej = client.post("/api/recommendations/REC_001/reject")
    assert res_rej.status_code == 200

    res_mod = client.post("/api/recommendations/REC_001/modify", json={"amount_mw": 300})
    assert res_mod.status_code == 200

def test_operator_brief_and_analyze():
    res_brief = client.get("/api/operator-brief")
    assert res_brief.status_code == 200

    res_ana = client.post("/api/gridpilot/analyze")
    assert res_ana.status_code == 200

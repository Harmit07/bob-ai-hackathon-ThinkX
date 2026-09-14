import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.database import Base, engine, SessionLocal
from app.db.seed import seed_database

@pytest.fixture(autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_database(db)
    db.close()

client = TestClient(app)

def test_root_and_health():
    res1 = client.get("/")
    assert res1.status_code == 200
    assert res1.json()["status"] == "online"

    res2 = client.get("/health")
    assert res2.status_code == 200
    assert res2.json()["status"] == "healthy"

def test_golden_demo_endpoint():
    response = client.get("/api/gridpilot/golden-demo")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "grid_stress" in data
    assert "anomalies" in data
    assert "forecasts" in data
    assert "optimization" in data
    assert "operator_brief" in data

def test_get_nodes():
    response = client.get("/api/gridpilot/data/nodes")
    assert response.status_code == 200
    nodes = response.json()
    assert isinstance(nodes, list)

def test_forecast_endpoint():
    response = client.get("/api/gridpilot/forecast/24h?horizon_hours=12")
    assert response.status_code == 200
    fc = response.json()
    assert fc["horizon_hours"] == 12
    assert "demand_forecasts" in fc
    assert "renewable_forecasts" in fc

def test_optimization_solve_endpoint():
    response = client.post(
        "/api/gridpilot/optimization/solve",
        json={"total_demand_mw": 350.0, "solar_avail_mw": 150.0, "wind_avail_mw": 180.0}
    )
    assert response.status_code == 200
    opt = response.json()
    assert opt["status"] in ("OPTIMAL", "FEASIBLE")

def test_analyze_endpoint():
    response = client.post("/api/gridpilot/analyze", json={})
    assert response.status_code == 200
    res = response.json()
    assert "summary" in res
    assert "operator_brief" in res

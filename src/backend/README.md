# ⚡ GridPilot AI - Backend Infrastructure

GridPilot AI is a production-grade FastAPI backend engine designed for smart grid energy management, renewable integration, machine learning forecasting, telemetry anomaly detection, explainable Root Cause Analysis (RCA), Google OR-Tools MILP unit commitment optimization, what-if scenario simulation, and AI operator briefing.

---

## 🚀 Key Features

1. **Synthetic Telemetry Generator**: Generates realistic grid telemetry, load profiles, weather dynamics, and anomaly injections across substations, solar/wind farms, battery storage, and demand centers.
2. **CSV Telemetry Validation**: Pydantic/Pandas schema & numeric bounds validator for grid dataset uploads.
3. **PostgreSQL / SQLite ORM Layer**: SQLAlchemy models for Grid Nodes, Telemetry, ML Forecasts, Optimization Runs, and Alerts with automatic seeding.
4. **ML Demand & Renewable Forecasting**: RandomForest & Gradient Boosting models predicting 24-hour node-level demand, solar irradiance response, and wind power generation with uncertainty bounds.
5. **Ensemble Anomaly Detection**: Isolation Forest combined with statistical Z-score screening to catch voltage sags, frequency drops, and line congestion.
6. **Explainable Root Cause Analysis (RCA)**: Decision-tree causal engine that maps telemetry anomalies to physical grid causes (e.g. transformer tap sags, supply deficits, cloud drops).
7. **Curtailment Risk Predictor**: Identifies future hours where renewable generation exceeds transmission capacity.
8. **Grid Stress Index (0-100)**: Composite real-time health indicator based on voltage, frequency, congestion, and anomaly density.
9. **Google OR-Tools MILP Dispatch**: Mixed-Integer Linear Programming solver for Economic Dispatch & Unit Commitment minimizing operating cost, carbon taxes, and curtailment penalties.
10. **What-If Scenario Simulator**: Simulates operational impact of extreme weather drops, node outages, EV demand surges, and battery storage expansions.
11. **Actionable Recommendation Engine**: Converts optimization outputs into prioritized operator actions with cost and emission deltas.
12. **Executive Operator Brief**: Markdown briefing generator synthesizing grid state, alerts, forecasts, and actions.
13. **Golden Demo Endpoint (`/api/gridpilot/golden-demo`)**: One-click benchmark endpoint executing the entire AI pipeline end-to-end.
14. **End-to-End Analysis Endpoint (`/api/gridpilot/analyze`)**: Full REST API accepting CSV or JSON payload for complete grid diagnosis.

---

## 🛠️ Installation & Quickstart

### 1. Prerequisites
- Python 3.10+
- `pip`

### 2. Install Dependencies
```bash
pip install -r backend/requirements.txt
```

### 3. Run the Backend Server
From the project root:
```bash
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

The server will automatically create and seed the SQLite database (`gridpilot.db`) on startup.

Access Interactive API Documentation:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 🧪 Running Automated Tests

Run the complete test suite using `pytest`:

```bash
python -m pytest backend/tests -v
```

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Health check & API entry point |
| `GET` | `/api/gridpilot/golden-demo` | **Golden Demo**: Triggers full pipeline benchmark out-of-the-box |
| `POST` | `/api/gridpilot/analyze` | **End-to-End Analysis**: Accepts CSV upload / JSON telemetry payload |
| `GET` | `/api/gridpilot/data/nodes` | List grid nodes & topology |
| `GET` | `/api/gridpilot/data/synthetic` | Generate synthetic telemetry CSV/JSON |
| `POST` | `/api/gridpilot/data/upload-csv` | Validate and clean uploaded telemetry CSV |
| `GET` | `/api/gridpilot/forecast/24h` | Fetch 24h Demand, Solar, and Wind ML forecasts |
| `POST` | `/api/gridpilot/optimization/solve` | Solve OR-Tools MILP Economic Dispatch |
| `POST` | `/api/gridpilot/optimization/what-if` | Run What-If Scenario simulation |
| `GET` | `/api/gridpilot/optimization/recommendations` | Get prioritized operator recommendations |

---

## 💡 Example Usage (cURL)

### Golden Demo
```bash
curl -X GET "http://localhost:8000/api/gridpilot/golden-demo"
```

### Run What-If Scenario Simulation (EV Surge)
```bash
curl -X POST "http://localhost:8000/api/gridpilot/optimization/what-if" \
     -H "Content-Type: application/json" \
     -d '{
       "scenario_type": "ev_surge",
       "demand_increase_pct": 35.0
     }'
```

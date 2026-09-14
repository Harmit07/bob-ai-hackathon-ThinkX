# Architecture: AI-Powered Grid Load Optimization & Renewable Energy Performance Advisor

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        GRID ADVISOR SYSTEM                          │
│                                                                     │
│  ┌──────────────┐     ┌──────────────────────────────────────────┐  │
│  │   FRONTEND   │────▶│              BACKEND (FastAPI)           │  │
│  │  Next.js 14  │◀────│                                          │  │
│  │   + ECharts  │     │  ┌──────────┐  ┌──────────────────────┐ │  │
│  └──────────────┘     │  │  Grid    │  │   Forecasting        │ │  │
│                        │  │Simulator │  │   (XGBoost)          │ │  │
│                        │  └──────────┘  └──────────────────────┘ │  │
│                        │  ┌──────────┐  ┌──────────────────────┐ │  │
│                        │  │ Anomaly  │  │   Optimization       │ │  │
│                        │  │Detection │  │   (Greedy Dispatch)  │ │  │
│                        │  │(IsoForest│  └──────────────────────┘ │  │
│                        │  └──────────┘  ┌──────────────────────┐ │  │
│                        │               │   AI Advisor / RCA   │ │  │
│                        │               │  (watsonx.ai-ready)  │ │  │
│                        │               └──────────────────────┘ │  │
│                        └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Components

### 1. Grid Simulator (`app/services/grid_simulator.py`)
- Produces realistic synthetic grid telemetry using physics-inspired models
- Daily load curve (residential + commercial), solar irradiance model, wind speed simulation
- Outputs: demand MW, solar MW, wind MW, frequency Hz, reserve margin %, curtailment MW, congestion index
- In production: replace with live EIA API, NOAA weather API, NREL solar/wind data

### 2. Load & Renewable Forecasting (`app/services/forecasting.py`)
- **Model:** XGBoost Regressor
- **Features:** Hour-of-day, day-of-week, month (cyclical encoding via sin/cos)
- **Targets:** Demand MW, Solar MW, Wind MW
- **Output:** 24-hour ahead hourly forecast with curtailment risk score
- Trained on 1 year of synthetic hourly data (8,760 points)

### 3. Anomaly Detection (`app/services/anomaly_detection.py`)
- **ML Layer:** Isolation Forest (contamination=5%) on 5 grid features
- **Rule Layer:** Threshold checks for demand spikes, low reserve margin, high curtailment, frequency deviation, transmission congestion
- **Output:** Severity classification (normal/low/medium/high/critical) + structured alerts

### 4. Optimization Engine (`app/services/optimization.py`)
- **Algorithm:** Priority-based greedy dispatch (Solar → Wind → Conventional)
- **Features:** Storage charging recommendation, load shifting windows, curtailment minimization, peak shaving
- **Output:** Dispatch plan, storage recommendation, renewable utilization score (0–100), tCO₂ avoided/hr
- In production: replace with Pyomo LP solver or OR-Tools

### 5. AI Advisor / RCA (`app/services/advisor.py`)
- Classifies grid situation (7 categories: optimal, demand_spike, curtailment_crisis, etc.)
- Generates structured RCA (symptom → primary cause → contributing factors → immediate action)
- Generates natural language narrative
- **watsonx.ai integration point:** `generate_narrative()` function can be replaced with watsonx.ai API call using IBM Granite model

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/advisor/` | **Primary endpoint** — full advisory package (snapshot + forecast + anomalies + optimization + RCA) |
| GET | `/api/grid/snapshot` | Real-time grid snapshot |
| GET | `/api/grid/history?hours=48` | Historical telemetry |
| GET | `/api/forecast/?hours=24` | 24h load + renewable forecast |
| GET | `/api/anomaly/` | Anomaly detection on current state |
| GET | `/api/optimization/` | Optimized dispatch plan |

---

## Data Flow

```
GET /api/advisor/
    │
    ├── grid_simulator.generate_current_snapshot()
    │         └── Synthetic real-time telemetry
    │
    ├── forecasting.get_forecast(hours=24)
    │         └── XGBoost → 24h hourly predictions
    │
    ├── anomaly_detection.detect_anomalies(snapshot)
    │         └── IsolationForest + rules → severity + alerts
    │
    ├── optimization.optimize_dispatch(snapshot, forecast)
    │         └── Greedy dispatch → recommendations + utilization score
    │
    └── advisor.generate_advice(snapshot, anomalies, optimization)
              └── Situation classification → RCA → narrative
```

---

## watsonx.ai Integration Path

To enable IBM Granite LLM-powered narratives:

1. Set `WATSONX_API_KEY`, `WATSONX_PROJECT_ID` in `.env`
2. In `app/services/advisor.py`, replace `_generate_narrative()` with:

```python
import requests

def _generate_narrative_llm(situation, snapshot, rca, opt):
    prompt = f"""You are a power grid operations advisor. 
Grid situation: {situation}
Symptom: {rca['symptom']}
Primary cause: {rca['primary_cause']}
Immediate action: {rca['immediate_action']}
Provide a concise 2-sentence advisory for the grid operator."""
    
    headers = {"Authorization": f"Bearer {os.getenv('WATSONX_API_KEY')}",
               "Content-Type": "application/json"}
    body = {
        "model_id": "ibm/granite-13b-instruct-v2",
        "input": prompt,
        "project_id": os.getenv("WATSONX_PROJECT_ID"),
        "parameters": {"max_new_tokens": 150}
    }
    resp = requests.post(f"{os.getenv('WATSONX_URL')}/ml/v1/text/generation", 
                         json=body, headers=headers)
    return resp.json()["results"][0]["generated_text"]
```

---

## Technology Choices

| Decision | Rationale |
|---|---|
| XGBoost for forecasting | Fast training, good accuracy on time-series tabular data, interpretable |
| Isolation Forest for anomaly detection | Unsupervised, no need for labeled anomaly data, efficient |
| Greedy dispatch over LP solver | Sufficient accuracy for demo; LP (Pyomo) is the production upgrade path |
| FastAPI | Async, fast, auto-docs at `/docs` |
| Next.js + ECharts | Rich interactive charts, SSR-ready, Tailwind for rapid styling |
| Simulated data | Avoids external API dependencies for hackathon reliability |

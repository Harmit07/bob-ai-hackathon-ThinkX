# Architecture: GridPilot AI — Smart Grid Energy Management Platform

## System Overview

## Architecture

![Architecture](https://github.com/user-attachments/assets/e4417522-79bf-475c-8d20-455f2541c522)
---

## Backend Components

### 1. Grid Simulator (`app/services/grid_simulator.py`)
Produces realistic synthetic grid telemetry using physics-inspired models:
- Daily load curve with residential + commercial demand profiles
- Solar irradiance model (hour-of-day + seasonal variation)
- Wind speed simulation with ramp events
- **Outputs:** demand MW, solar MW, wind MW, frequency Hz, reserve margin %, curtailment MW, congestion index
- **Production upgrade:** Replace with live EIA API, NOAA weather API, NREL solar/wind data, or SCADA WebSocket feed

### 2. ML Engine (`app/ml_engine/`)

| Module | Model | Purpose |
|---|---|---|
| `demand_forecaster.py` | XGBoost Regressor | 24-hour demand forecast |
| `renewable_forecaster.py` | XGBoost Regressor | 24-hour solar + wind forecast |
| `curtailment_predictor.py` | XGBoost Classifier | Hourly curtailment risk score |
| `anomaly_detector.py` | Isolation Forest | Statistical anomaly flagging |
| `rca_engine.py` | Rule-based + ML | Per-asset Root Cause Analysis |
| `grid_stress.py` | Multi-factor formula | Grid stress index (0–100) |
| `train_models.py` | — | Training script for all models |
| `saved_models/` | `.joblib` files | Pre-trained model artefacts |

**XGBoost features:** hour-of-day (sin/cos), day-of-week (sin/cos), month (sin/cos)  
**Isolation Forest:** 5 grid features, contamination=5%, trained on 8,760 hours of synthetic data

### 3. Optimization Engine (`app/optimization/`)

| Module | Purpose |
|---|---|
| `ortools_solver.py` | Google OR-Tools CP-SAT / LP unit commitment solver |
| `recommendation_engine.py` | Translates solver output into operator recommendations |
| `what_if_simulator.py` | Runs optimization for arbitrary scenario parameters |

**OR-Tools problem formulation:**
- Decision variables: generation dispatch per asset per period
- Objective: minimize curtailment + fuel cost + carbon tax
- Constraints: demand balance, generation limits, ramp rates, reserve margin requirement
- Fallback: greedy priority-based dispatch (Solar → Wind → Storage → Conventional)

### 4. Services Layer (`app/services/`)

| Service | Description |
|---|---|
| `grid_simulator.py` | Synthetic telemetry generation |
| `forecasting.py` | Demand + renewable forecast orchestration |
| `anomaly_detection.py` | Anomaly detection pipeline |
| `advisor.py` | Situation classification + structured RCA narrative |
| `optimization.py` | Dispatch optimization orchestration |
| `financial_impact.py` | Revenue loss, carbon tax, congestion cost calculations |
| `hitl_approval.py` | Human-in-the-Loop approval queue management |
| `operator_brief.py` | AI Operator Executive Brief generation |
| `next_best_action.py` | Priority-ranked operator action recommendations |
| `scenario_simulator.py` | What-if scenario parameter handling |
| `event_predictor.py` | Upcoming grid stress event forecasting |
| `underperformance.py` | Renewable asset underperformance detection |
| `india_data.py` | India-specific grid data and parameters |
| `data_blender.py` | Data harmonisation across sources |
| `grid_stress.py` | Grid stress score computation |
| `real_data.py` | Real/external data integration hooks |

### 5. Database Layer (`app/db/`)
- **ORM:** SQLAlchemy 2.0
- **Default:** SQLite (`gridpilot.db`) — zero config, file-based
- **Production:** PostgreSQL via `DATABASE_URL` environment variable
- **Models:** Grid assets, HITL queue entries, scenario records
- **Seed:** `seed.py` populates default grid asset benchmarks on startup

### 6. Copilot Engine (`app/copilot_engine/operator_brief.py`)
Generates the AI Operator Executive Brief — a markdown-formatted natural-language briefing summarising:
- Current grid state and stress level
- Top anomalies detected
- Key optimization recommendations
- Financial impact summary
- watsonx.ai IBM Granite integration hook (see below)

---

## Frontend Architecture

### Pages (Next.js App Router)

| Route | Description |
|---|---|
| `/dashboard` | Main operator dashboard — all KPIs, charts, anomalies, RCA, brief, HITL queue |
| `/anomalies` | Full anomaly browser with filtering by severity |
| `/assets` | Grid asset table with status and performance summary |
| `/assets/[assetId]` | Per-asset detail: telemetry charts, anomaly history, RCA |
| `/forecasts` | 24h demand + renewable forecast explorer |
| `/optimization` | Dispatch optimization results with before/after comparison |
| `/recommendations` | HITL recommendation queue (approve / reject / modify) |
| `/simulation` | What-if scenario simulator with parameter controls |

### Key Frontend Modules

| Module | Description |
|---|---|
| `lib/api.ts` | Typed API client — all backend calls, mock-data fallback |
| `lib/formatters.ts` | Number, MW, tCO₂, currency formatters |
| `lib/constants.ts` | Severity colours, status labels, threshold constants |
| `context/RegionContext.tsx` | Global/India grid region selection context |
| `components/dashboard/` | 12 dashboard panel components |
| `components/layout/` | Sidebar, Header, PageContainer |
| `components/ui/` | Button, Card, Badge, Modal, Progress, Skeleton, EmptyState |

---

## API Endpoints

### Domain Routers

| Method | Prefix | Description |
|--------|--------|-------------|
| GET | `/api/grid/snapshot` | Real-time grid snapshot |
| GET | `/api/grid/history?hours=N` | Historical telemetry |
| GET | `/api/forecast/demand` | 24h demand forecast |
| GET | `/api/forecast/renewable` | 24h solar + wind forecast |
| GET | `/api/anomalies/` | Current anomaly list |
| GET | `/api/stress/` | Grid stress score + drivers |
| GET | `/api/advisor/` | Full advisory package |
| GET | `/api/optimization/` | Dispatch optimization plan |
| GET | `/api/curtailment/` | Curtailment risk summary |
| GET | `/api/financial/` | Financial impact breakdown |
| GET | `/api/underperformance/` | Asset underperformance report |
| GET/POST | `/api/hitl/` | HITL queue (list + review) |
| GET | `/api/brief/` | Operator Executive Brief |
| GET | `/api/nba/` | Next-best-action list |
| GET | `/api/events/` | Predicted grid stress events |
| POST | `/api/scenarios/` | What-if simulation |
| GET | `/api/india/` | India grid module data |

### Versioned API (`/api/gridpilot/`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/gridpilot/golden-demo` | Pre-computed golden demo response |
| POST | `/api/gridpilot/analyze` | Full analysis on submitted telemetry |
| GET | `/api/gridpilot/data` | Raw data export |
| GET | `/api/gridpilot/forecast` | Versioned forecast endpoint |
| POST | `/api/gridpilot/optimization` | Versioned optimization endpoint |

---

## Data Flow — Main Dashboard

```
Browser polls dashboard queries (TanStack React Query, 60s stale time)
    │
    ├── GET /api/grid/snapshot      → GridStatus banner, KPI cards
    ├── GET /api/stress/            → GridStressDrivers panel
    ├── GET /api/forecast/demand    → ForecastChart (24h demand)
    ├── GET /api/forecast/renewable → RenewableChart (24h solar + wind)
    ├── GET /api/anomalies/         → CriticalAlerts panel
    ├── GET /api/assets/SOLAR_B17   → CriticalAssetCard
    ├── GET /api/assets/SOLAR_B17/rca → RootCausePanel
    ├── GET /api/underperformance/  → UnderperformancePanel
    ├── GET /api/financial/         → FinancialImpactPanel
    ├── GET /api/brief/             → OperatorBrief (markdown)
    ├── GET /api/nba/               → NextBestAction panel
    └── GET /api/hitl/              → HITLApprovalPanel
```

---

## watsonx.ai Integration Path

To enable IBM Granite LLM-powered Operator Brief narrative generation:

1. Register at https://dataplatform.cloud.ibm.com/
2. Create a watsonx.ai project, obtain your API key
3. Edit `src/backend/.env`:

```env
WATSONX_API_KEY=your-api-key
WATSONX_PROJECT_ID=your-project-id
WATSONX_URL=https://us-south.ml.cloud.ibm.com
WATSONX_MODEL_ID=ibm/granite-13b-instruct-v2
```

4. In `app/copilot_engine/operator_brief.py`, replace the rule-based `_generate_narrative()` call with:

```python
import requests, os

def _generate_narrative_llm(context: dict) -> str:
    prompt = f"""You are a power grid operations advisor.
Grid stress score: {context['stress_score']}/100
Top anomalies: {context['top_anomalies']}
Recommended actions: {context['top_recommendations']}
Financial impact: {context['financial_summary']}
Write a concise 3-sentence operator briefing."""

    headers = {
        "Authorization": f"Bearer {os.getenv('WATSONX_API_KEY')}",
        "Content-Type": "application/json"
    }
    body = {
        "model_id": os.getenv("WATSONX_MODEL_ID", "ibm/granite-13b-instruct-v2"),
        "input": prompt,
        "project_id": os.getenv("WATSONX_PROJECT_ID"),
        "parameters": {"max_new_tokens": 200, "temperature": 0.3}
    }
    resp = requests.post(
        f"{os.getenv('WATSONX_URL')}/ml/v1/text/generation",
        json=body, headers=headers
    )
    return resp.json()["results"][0]["generated_text"]
```

---

## Technology Decisions

| Decision | Rationale |
|---|---|
| XGBoost for forecasting | Fast training, strong accuracy on tabular time-series, interpretable feature importance |
| Isolation Forest for anomaly detection | Unsupervised — no labeled anomaly data required; efficient on multi-dimensional features |
| Google OR-Tools LP | Production-grade solver; can model real unit commitment constraints; greedy fallback for demo reliability |
| HITL approval queue | AI should never autonomously dispatch on a real grid — human approval is a hard safety requirement |
| SQLAlchemy + SQLite/PostgreSQL | Zero-config for demo, production-compatible with zero code changes |
| FastAPI | Async-native, fast, auto-generates OpenAPI docs at `/docs` |
| Next.js App Router + TanStack RQ | File-based routing, automatic query cache management, real-time polling |
| Simulated data layer | Avoids external API dependencies for hackathon reliability; simulator is swappable at one interface boundary |

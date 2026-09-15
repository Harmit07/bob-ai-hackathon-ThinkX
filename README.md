# Team ThinkX — GridPilot AI

> Smart Grid Energy Management: ML Forecasting · Anomaly Detection · OR-Tools Optimization · Human-in-the-Loop Advisory

---

## 👥 Team

| Field | Value |
|---|---|
| **Team Name** | ThinkX |
| **Track** | Sustainability |
| **Project Name** | GridPilot AI |
| **Lead** | Harmit Jetani ([23dcs040@charusat.edu.in](mailto:23dcs040@charusat.edu.in)) |
| **Members** | James Dhandhukiya, Kashish Gandhi, Prince Ghevariya |

---

## 🎯 Problem Statement

Grid operators must balance variable solar and wind generation against changing demand, transmission congestion, reserve requirements, and renewable curtailment. Without timely decision support, operators face grid instability, wasted clean energy, and expensive reactive interventions. GridPilot AI is designed for the operators who need one place to detect, explain, and respond to those conditions.

---

## 💡 Solution

**GridPilot AI** is a full-stack intelligent grid management platform that combines XGBoost forecasting, Isolation Forest anomaly detection, Google OR-Tools dispatch optimization, financial impact analysis, and a Human-in-the-Loop approval workflow. A FastAPI backend serves simulated grid telemetry and analysis APIs to a Next.js operator dashboard, where recommendations can be reviewed before approval.

**Tagline:** *Predict the problem. Explain the cause. Optimize the response.*

---

## ✨ Key Features

- **Live grid operations dashboard:** KPI monitoring for grid health, frequency, reserve margin, renewable mix, curtailment, stress drivers, and financial impact.
- **24-hour ML forecasting:** XGBoost demand and renewable forecasts with curtailment-risk scoring for solar and wind.
- **Explainable detection and RCA:** Isolation Forest and rule-based checks identify anomalies, asset underperformance, and likely root causes.
- **Optimized and reviewable dispatch:** Google OR-Tools dispatch optimization feeds priority-ranked recommendations into the HITL approve/reject/modify workflow.
- **Scenario and regional analysis:** Operators can test changes to demand, solar, storage, and tariffs, while the India Grid module provides region-specific parameters.

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| **Languages** | Python 3.11+, TypeScript |
| **Backend** | FastAPI, Uvicorn, SQLAlchemy 2.0, Pydantic v2 |
| **Frontend** | Next.js 16, React 19, Tailwind CSS v4 |
| **ML and optimization** | XGBoost, scikit-learn Isolation Forest, Google OR-Tools, pandas, NumPy |
| **Data and visualization** | SQLite, PostgreSQL-compatible SQLAlchemy, ECharts, Recharts, TanStack React Query |
| **IBM technologies** | IBM Bob for AI-assisted development; watsonx.ai and IBM Granite integration hook for the Operator Brief |

---

## 📁 Repository Structure

```
├── src/
│   ├── backend/                   # FastAPI Python backend
│   │   ├── app/
│   │   │   ├── main.py            # FastAPI app entry point + all router registration
│   │   │   ├── config.py          # Settings (Pydantic BaseSettings)
│   │   │   ├── api/               # Versioned API router + endpoint modules
│   │   │   │   ├── router.py
│   │   │   │   └── endpoints/     # analyze, data, forecast, optimization, golden_demo
│   │   │   ├── routers/           # Domain routers (15 modules)
│   │   │   │   ├── advisor.py     # AI advisor
│   │   │   │   ├── anomaly.py     # Anomaly detection
│   │   │   │   ├── brief.py       # Operator Executive Brief
│   │   │   │   ├── curtailment.py # Curtailment risk
│   │   │   │   ├── events.py      # Event predictor
│   │   │   │   ├── financial.py   # Financial impact
│   │   │   │   ├── forecast.py    # Demand & renewable forecast
│   │   │   │   ├── grid.py        # Grid snapshot & history
│   │   │   │   ├── hitl.py        # Human-in-the-Loop queue
│   │   │   │   ├── india.py       # India grid module
│   │   │   │   ├── nba.py         # Next-best-action
│   │   │   │   ├── optimization.py# Dispatch optimization
│   │   │   │   ├── scenarios.py   # What-if simulator
│   │   │   │   ├── stress.py      # Grid stress scoring
│   │   │   │   └── underperformance.py
│   │   │   ├── ml_engine/         # ML models + training
│   │   │   │   ├── demand_forecaster.py
│   │   │   │   ├── renewable_forecaster.py
│   │   │   │   ├── anomaly_detector.py
│   │   │   │   ├── curtailment_predictor.py
│   │   │   │   ├── rca_engine.py
│   │   │   │   ├── grid_stress.py
│   │   │   │   ├── train_models.py
│   │   │   │   └── saved_models/  # Pre-trained .joblib model files
│   │   │   ├── optimization/      # OR-Tools + recommendation engine
│   │   │   │   ├── ortools_solver.py
│   │   │   │   ├── recommendation_engine.py
│   │   │   │   └── what_if_simulator.py
│   │   │   ├── services/          # Business logic layer (16 services)
│   │   │   ├── db/                # SQLAlchemy models, schemas, seed data
│   │   │   └── copilot_engine/    # Operator brief generation
│   │   └── requirements.txt
│   └── frontend/                  # Next.js + React dashboard
│       ├── app/                   # Next.js App Router pages
│       │   ├── dashboard/         # Main operator dashboard
│       │   ├── anomalies/         # Anomaly browser
│       │   ├── assets/            # Asset management + per-asset detail
│       │   ├── forecasts/         # Forecast explorer
│       │   ├── optimization/      # Dispatch optimization view
│       │   ├── recommendations/   # HITL recommendation queue
│       │   └── simulation/        # What-if scenario simulator
│       ├── components/            # Reusable UI components
│       │   ├── dashboard/         # Dashboard-specific panels
│       │   ├── layout/            # Header, Sidebar, PageContainer
│       │   ├── optimization/      # Optimization before/after views
│       │   ├── simulation/        # Scenario simulator controls
│       │   └── ui/                # Base UI primitives (Button, Card, Badge…)
│       ├── lib/                   # API client, constants, formatters, utils
│       ├── context/               # RegionContext (India / Global grid selection)
│       └── types/                 # TypeScript type definitions
├── docs/                          # Documentation
│   ├── architecture.md
│   ├── problem-statement.md
│   ├── solution-overview.md
│   └── setup-guide.md
├── demo/                          # Demo artifacts (video link, screenshots)
├── presentation/                  # Slide deck
└── submission.yaml                # Submission metadata
```

---

## ⚡ How to Run

> **See [`docs/setup-guide.md`](docs/setup-guide.md) for full step-by-step instructions.**

**Backend (Terminal 1):**

```bash
cd src/backend

# Create a virtual environment
python -m venv .venv

# Activate the virtual environment
# Windows (PowerShell):
.venv\Scripts\activate
# macOS / Linux:
# source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy the environment file (optional — app runs without watsonx.ai credentials)
cp .env.example .env

# Start the backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend (Terminal 2):**

```bash
cd src/frontend

# Install dependencies
npm install

# Copy the environment file
cp .env.local.example .env.local
# Default: NEXT_PUBLIC_API_URL=http://localhost:8000
# No changes needed for local development

# Start the development server
npm run dev
```

For the full setup, optional watsonx.ai/PostgreSQL configuration, and test command, see [docs/setup-guide.md](docs/setup-guide.md).

| Service | URL |
|---|---|
| Dashboard | http://localhost:3000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| API Health | http://localhost:8000/health |

---

## 🖥️ Demo

| Artifact | Link |
|---|---|
| Live demo | [bob-ai-hackathon-think-x.vercel.app](https://bob-ai-hackathon-think-x.vercel.app) |
| Demo video | Not available yet; see [demo/demo-video-link.txt](demo/demo-video-link.txt) |
| Screenshots | Not available yet; see [demo/screenshots/](demo/screenshots/) |
| Presentation | [presentation/](presentation/) |
| Architecture | [docs/architecture.md](docs/architecture.md) |

---

## ⚠️ Known Limitations

- Grid data is simulated and is not yet connected to live EIA, NOAA, NREL, or SCADA feeds; the production integration path is documented in [docs/architecture.md](docs/architecture.md).
- The Operator Brief currently uses rule-based narrative generation. The watsonx.ai IBM Granite integration hook is ready but requires credentials and project configuration.
- The frontend can fall back to mock data when the backend is unavailable, so local and deployed data may not represent live grid conditions.
- There is no authentication or authorization layer; this is a hackathon demonstration.
- SQLite is the default database. PostgreSQL is supported through `DATABASE_URL` but has not been the default deployment configuration.

---

## 🏅 What We're Most Proud Of

Our strongest work is the end-to-end operator workflow visible in the [live dashboard](https://bob-ai-hackathon-think-x.vercel.app): simulated telemetry becomes forecasts and anomaly alerts, alerts receive structured root-cause analysis, OR-Tools produces a dispatch plan, financial impact is quantified, and recommendations enter a human approval queue. The [architecture documentation](docs/architecture.md) shows how the ML, optimization, advisory, and API layers are separated so live data or a production LLM can be added without redesigning the operator experience.

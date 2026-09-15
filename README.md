# Team ThinkX — GridPilot AI

> Smart Grid Energy Management: ML Forecasting · Anomaly Detection · OR-Tools Optimization · Human-in-the-Loop Advisory

---

## 👥 Team

| Field | Value |
|---|---|
| **Team Name** | ThinkX |
| **Track** | Sustainability |
| **Project Name** | GridPilot AI |

---

## 🎯 Problem Statement

Modern power grids face severe operational complexity driven by the rapid proliferation of variable renewable energy (solar & wind), rising and unpredictable electricity demand, transmission congestion, and renewable curtailment. Grid operators lack real-time AI-powered decision support — resulting in wasted clean energy, grid instability, and costly reactive responses instead of proactive management.

---

## 💡 Solution

**GridPilot AI** is a full-stack intelligent grid management platform that brings together ML-based forecasting, anomaly detection, LP-style dispatch optimization, financial impact analysis, and a Human-in-the-Loop (HITL) approval workflow — all surfaced through a polished real-time operator dashboard.

**Tagline:** *Predict the problem. Explain the cause. Optimize the response.*

---

## ✨ Key Features

- **Real-time Grid Status Dashboard:** Live KPI banner with grid health, frequency, reserve margin, renewable mix, and curtailment
- **Demand & Renewable Forecasting:** XGBoost models predicting demand, solar, and wind output for the next 24 hours with curtailment risk scoring
- **Anomaly Detection:** Isolation Forest + rule-based engine detecting demand spikes, frequency deviations, low reserves, and high curtailment — with severity classification
- **Asset Management & Root Cause Analysis:** Per-asset telemetry, underperformance detection, and structured RCA (symptom → cause → contributing factors → immediate action)
- **Grid Stress Scoring:** Multi-factor stress index with driver breakdown and trend tracking
- **Google OR-Tools Optimization:** Unit commitment and dispatch optimization using linear programming; greedy dispatch fallback
- **What-If Scenario Simulator:** Interactive scenario modelling — adjust solar capacity, demand, storage, or tariffs and preview dispatch outcomes
- **Financial Impact Engine:** Real-time cost/revenue tracking — curtailment losses, carbon tax, congestion charges, renewable revenue
- **Human-in-the-Loop (HITL) Approval Queue:** Operator review and approve/reject/modify AI-generated dispatch actions before execution
- **AI Operator Executive Brief:** Auto-generated natural-language markdown briefing summarizing current grid state and recommended actions (watsonx.ai-ready)
- **Next-Best-Action Engine:** Priority-ranked operator action recommendations with one-click HITL workflow integration
- **India Grid Module:** Region-specific parameters, load profiles, and renewable data for Indian grid zones
- **Event Predictor:** Forecasts upcoming grid stress events (peak demand, curtailment windows, frequency risks)

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| **Languages** | Python 3.11+, TypeScript |
| **Backend Framework** | FastAPI, uvicorn, SQLAlchemy |
| **Frontend Framework** | Next.js 16, React 19, Tailwind CSS v4 |
| **ML / AI** | XGBoost, scikit-learn (Isolation Forest), rule-based RCA engine |
| **Optimization** | Google OR-Tools (linear programming unit commitment) |
| **Database** | SQLite (dev) / PostgreSQL-compatible via SQLAlchemy |
| **Visualization** | ECharts, echarts-for-react, Recharts |
| **State Management** | TanStack React Query |
| **IBM Technologies** | IBM Bob (AI-assisted development), watsonx.ai (integration-ready for Operator Brief) |
| **Other** | pandas, numpy, pydantic v2, python-dotenv, axios, lucide-react |

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

```bash
# Backend (Terminal 1)
cd src/backend
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend (Terminal 2)
cd src/frontend
npm install
npm run dev
```

| Service | URL |
|---|---|
| Dashboard | http://localhost:3000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| API Health | http://localhost:8000/health |

---

## 🖥️ Demo

| Artifact | Link |
|---|---|
| 📹 Demo Video | [See demo/demo-video-link.txt](demo/demo-video-link.txt) |
| 🖼️ Screenshots | [See demo/screenshots/](demo/screenshots/) |
| 📊 Presentation | [See presentation/](presentation/) |

---

## ⚠️ Known Limitations

- Grid data is simulated — not connected to live EIA/NOAA/NREL APIs (integration path documented in [`docs/architecture.md`](docs/architecture.md))
- Operator Brief uses rule-based narrative generation — watsonx.ai IBM Granite integration is stubbed and ready to connect
- No authentication layer — designed for hackathon demo purposes
- SQLite is used by default; switch to PostgreSQL via `DATABASE_URL` environment variable

---

## 🏅 What We're Most Proud Of

The depth and breadth of the end-to-end platform: from raw simulated telemetry → ML anomaly detection → OR-Tools dispatch optimization → financial impact quantification → HITL approval workflow → AI-generated operator briefing. Each layer is independently useful and production-extensible. The architecture cleanly separates ML inference, optimization, and advisory layers so any component can be upgraded with live data or a real LLM without touching the others.

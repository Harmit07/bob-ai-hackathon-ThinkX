# Solution Overview

## What We Built

**GridPilot AI** is a full-stack intelligent grid management platform that gives grid operators a single, unified interface for monitoring, forecasting, diagnosing, and acting on complex power grid conditions. It replaces the fragmented combination of SCADA screens, spreadsheet-based forecasts, and manual communication with a cohesive AI-assisted decision loop — from telemetry ingestion through to operator-approved dispatch actions.

---

## How It Works

1. **Data ingestion & simulation:** A physics-inspired grid simulator (`grid_simulator.py`) produces realistic real-time and historical telemetry — demand MW, solar generation, wind generation, grid frequency, reserve margin, curtailment, and congestion index. In production, this layer is replaced by live EIA/NOAA/NREL API feeds or SCADA WebSocket streams.

2. **ML forecasting:** Two XGBoost regressors (demand and renewable) predict the next 24 hours at hourly resolution. Features include cyclical time encodings (hour, day-of-week, month). A curtailment risk predictor scores each future hour for renewable waste risk.

3. **Anomaly detection:** An Isolation Forest model (trained on 5 grid features) flags statistically abnormal readings. A rule-based layer applies domain-specific thresholds (e.g., frequency outside 49.8–50.2 Hz, reserve margin < 10%, curtailment > 15%). Each detected anomaly receives a severity classification: `normal / low / medium / high / critical`.

4. **Asset-level Root Cause Analysis:** The RCA engine (`rca_engine.py`) generates structured fault explanations for individual grid assets — symptom → primary cause → contributing factors → immediate recommended action. The RCA is surfaced per-asset in the Asset Management view and on the main dashboard.

5. **Grid stress scoring:** A multi-factor stress index aggregates frequency deviation, reserve shortfall, curtailment level, congestion, and anomaly count into a single 0–100 score with driver breakdown.

6. **Dispatch optimization:** The OR-Tools linear programming solver (`ortools_solver.py`) solves a unit commitment problem each cycle — minimizing curtailment and cost while respecting generation limits and reserve constraints. Results include a full dispatch plan, renewable utilization score, and estimated tCO₂ avoided per hour. A greedy dispatch fallback provides results if the LP solver is not available.

7. **What-if simulation:** Operators can adjust parameters (solar capacity, demand level, storage state-of-charge, tariff) via the Scenario Simulator and immediately see projected dispatch outcomes — without affecting the live grid state.

8. **Financial impact quantification:** The financial engine (`financial_impact.py`) calculates real-time curtailment revenue loss, carbon tax exposure, congestion charges, and projected renewable revenue — giving operators economic context for every dispatch decision.

9. **Human-in-the-Loop (HITL) approval queue:** AI-generated dispatch recommendations are not automatically executed. They enter a HITL queue where operators can approve, reject, or modify the recommended MW value before the action is confirmed. This keeps humans in control of consequential decisions.

10. **AI Operator Executive Brief:** The copilot engine (`operator_brief.py`) synthesizes current grid state, top anomalies, key recommendations, and financial impact into a structured natural-language markdown briefing — ready for the operator at shift start. The narrative generation hook is designed to call watsonx.ai IBM Granite models when credentials are configured.

11. **Next-best-action engine:** Priority-ranked operator actions (`next_best_action.py`) are surfaced on the dashboard with estimated impact and one-click HITL queue integration.

---

## Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│                            GRIDPILOT AI SYSTEM                             │
│                                                                            │
│  ┌─────────────────────┐        ┌──────────────────────────────────────┐  │
│  │   NEXT.JS FRONTEND  │◀──────▶│         FASTAPI BACKEND              │  │
│  │  (App Router + RQ)  │  REST  │                                      │  │
│  │                     │        │  ┌────────────┐  ┌────────────────┐  │  │
│  │  /dashboard         │        │  │ ML Engine  │  │ Optimization   │  │  │
│  │  /anomalies         │        │  │ XGBoost    │  │ OR-Tools LP    │  │  │
│  │  /assets            │        │  │ IsoForest  │  │ + Greedy       │  │  │
│  │  /forecasts         │        │  │ RCA Engine │  └────────────────┘  │  │
│  │  /optimization      │        │  └────────────┘  ┌────────────────┐  │  │
│  │  /recommendations   │        │  ┌────────────┐  │ Services Layer │  │  │
│  │  /simulation        │        │  │   DB       │  │ Financial      │  │  │
│  └─────────────────────┘        │  │ SQLAlchemy │  │ HITL           │  │  │
│                                 │  │ SQLite/PG  │  │ Operator Brief │  │  │
│                                 │  └────────────┘  │ Scenarios      │  │  │
│                                 │                  └────────────────┘  │  │
│                                 └──────────────────────────────────────┘  │
│                                              │                             │
│                                    ┌─────────▼──────────┐                 │
│                                    │  watsonx.ai        │                 │
│                                    │  IBM Granite LLM   │                 │
│                                    │  (integration-ready│                 │
│                                    │   stub)            │                 │
│                                    └────────────────────┘                 │
└────────────────────────────────────────────────────────────────────────────┘
```

> See [`architecture.md`](architecture.md) for the full component and API reference.

---

## Key Design Decisions

| Decision | Rationale |
|---|---|
| XGBoost for forecasting | Fast training, strong accuracy on time-series tabular data, interpretable feature importance |
| Isolation Forest for anomaly detection | Unsupervised — no need for labeled anomaly data; efficient on multi-dimensional grid features |
| Google OR-Tools LP solver | Production-grade optimization that can model real unit commitment constraints; greedy fallback for reliability |
| HITL approval queue | AI recommendations should never autonomously dispatch on a real grid — human approval is a safety requirement |
| SQLAlchemy + SQLite/PostgreSQL | Zero-config for demo (SQLite), production-ready (PostgreSQL) with no code changes |
| TanStack React Query | Automatic cache management and polling for real-time dashboard data without manual state handling |
| Next.js App Router | Server component architecture, file-based routing, strong TypeScript support |
| Simulated data layer | Avoids external API dependencies for hackathon reliability; the simulator is replaceable with one interface change |

---

## IBM Technologies Used

- **IBM Bob (AI-assisted development):** Used throughout development to generate, refactor, and review code across the full stack — FastAPI routers, ML engine modules, React components, and TypeScript API client. Bob's ability to reason over multiple files simultaneously significantly accelerated the development of the 15-router backend and multi-page dashboard.

- **watsonx.ai (integration-ready):** The `copilot_engine/operator_brief.py` module contains a documented integration hook for IBM Granite model calls. When `WATSONX_API_KEY`, `WATSONX_PROJECT_ID`, and `WATSONX_URL` are set in the environment, the Operator Executive Brief narrative is generated via `ibm/granite-13b-instruct-v2` instead of the rule-based fallback. See [`architecture.md`](architecture.md) for the integration code snippet.

# Setup Guide: GridPilot AI

## Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Python | 3.11+ | 3.10 minimum |
| Node.js | 18+ | 20 LTS recommended |
| npm | 9+ | Comes with Node.js |
| Git | Any | For cloning |

---

## 1. Clone the Repository

```bash
git clone https://github.com/<your-org>/bob-ai-hackathon-ThinkX.git
cd bob-ai-hackathon-ThinkX
```

---

## 2. Backend Setup (FastAPI)

Open a terminal and run:

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

The backend will be available at:

| URL | Description |
|---|---|
| http://localhost:8000 | API root |
| http://localhost:8000/docs | Interactive Swagger UI |
| http://localhost:8000/redoc | ReDoc API reference |
| http://localhost:8000/health | Health check |

> **Note:** On first startup, saved ML models are loaded from `app/ml_engine/saved_models/`. If models are missing, run `python -m app.ml_engine.train_models` from `src/backend/` to retrain them (takes ~30–60 seconds).

---

## 3. Frontend Setup (Next.js)

Open a **new terminal**:

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

The dashboard will be available at: **http://localhost:3000**

---

## 4. Explore the Dashboard

Open http://localhost:3000 in your browser. The app has seven pages accessible via the left sidebar:

| Page | URL | Description |
|---|---|---|
| Dashboard | `/dashboard` | Main operator view — KPIs, forecasts, anomalies, RCA, HITL queue |
| Anomalies | `/anomalies` | Full anomaly browser with severity filtering |
| Assets | `/assets` | Grid asset inventory and per-asset detail (`/assets/[id]`) |
| Forecasts | `/forecasts` | 24-hour demand and renewable forecast explorer |
| Optimization | `/optimization` | OR-Tools dispatch plan with before/after comparison |
| Recommendations | `/recommendations` | HITL recommendation approval queue |
| Simulation | `/simulation` | What-if scenario simulator |

---

## 5. API Reference

All endpoints are browsable at http://localhost:8000/docs

### Key Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/grid/snapshot` | Real-time grid snapshot |
| GET | `/api/grid/history?hours=48` | Historical telemetry |
| GET | `/api/forecast/demand` | 24h demand forecast |
| GET | `/api/forecast/renewable` | 24h solar + wind forecast |
| GET | `/api/anomalies/` | Detected anomalies + severity |
| GET | `/api/stress/` | Grid stress score + drivers |
| GET | `/api/optimization/` | OR-Tools dispatch plan |
| GET | `/api/financial/` | Financial impact breakdown |
| GET | `/api/brief/` | AI Operator Executive Brief |
| GET | `/api/nba/` | Next-best-action recommendations |
| GET/POST | `/api/hitl/` | HITL approval queue |
| POST | `/api/scenarios/` | What-if simulation |

### Versioned Analysis API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/gridpilot/golden-demo` | Pre-computed golden demo response |
| POST | `/api/gridpilot/analyze` | Full analysis on submitted telemetry payload |

---

## 6. Environment Variables

### Backend (`src/backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `sqlite:///./gridpilot.db` | Database connection string |
| `WATSONX_API_KEY` | — | IBM watsonx.ai API key (optional) |
| `WATSONX_PROJECT_ID` | — | IBM watsonx.ai project ID (optional) |
| `WATSONX_URL` | `https://us-south.ml.cloud.ibm.com` | watsonx.ai region URL |
| `WATSONX_MODEL_ID` | `ibm/granite-13b-instruct-v2` | IBM Granite model ID |

### Frontend (`src/frontend/.env.local`)

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend API base URL |

---

## 7. Optional: watsonx.ai Integration

To enable IBM Granite LLM-powered Operator Executive Brief narrative:

1. Register at https://dataplatform.cloud.ibm.com/
2. Create a watsonx.ai project and generate an API key
3. Edit `src/backend/.env`:

```env
WATSONX_API_KEY=your-api-key-here
WATSONX_PROJECT_ID=your-project-id-here
WATSONX_URL=https://us-south.ml.cloud.ibm.com
WATSONX_MODEL_ID=ibm/granite-13b-instruct-v2
```

4. Restart the backend. The `GET /api/brief/` endpoint will use IBM Granite for narrative generation instead of the rule-based fallback.

See [`docs/architecture.md`](architecture.md#watsonxai-integration-path) for the full integration code snippet.

---

## 8. Optional: Use PostgreSQL

By default, the app uses SQLite. To switch to PostgreSQL:

1. Provision a PostgreSQL database
2. Set the connection string in `src/backend/.env`:

```env
DATABASE_URL=postgresql://user:password@host:5432/gridpilot
```

3. Restart the backend. SQLAlchemy will create tables automatically on startup.

---

## 9. Running Tests

```bash
cd src/backend

# Activate virtualenv if not already active
.venv\Scripts\activate   # Windows
# source .venv/bin/activate  # macOS/Linux

# Run test suite
pytest tests/ -v
```

---

## Troubleshooting

| Issue | Fix |
|---|---|
| `ModuleNotFoundError` on backend start | Activate the virtual environment before running uvicorn |
| `Cannot reach API` in dashboard | Ensure backend is running on port 8000 and CORS is not blocked |
| `npm install` fails | Make sure Node.js 18+ is installed (`node --version`) |
| Frontend shows no data | Check browser console — if API calls fail, verify backend is running |
| `gridpilot.db` not created | Backend creates it automatically on first startup in `src/backend/` |
| Slow first API response | ML models load on startup — first request may take a few seconds |
| `CORS error` in browser | Backend is configured with `allow_origins=["*"]` — check the backend is running |
| Models missing / inference errors | Run `python -m app.ml_engine.train_models` from `src/backend/` to regenerate |

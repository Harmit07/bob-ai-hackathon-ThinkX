# Setup Guide: Grid Load Optimization & Renewable Energy Performance Advisor

## Prerequisites

| Requirement | Version |
|---|---|
| Python | 3.10+ |
| Node.js | 18+ |
| npm | 9+ |

---

## 1. Clone the Repository

```bash
git clone <your-repo-url>
cd bob-ai-hackathon-ThinkX
```

---

## 2. Backend Setup (FastAPI)

```bash
cd src/backend

# Create virtual environment (recommended)
python -m venv .venv

# Activate virtual environment
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
# Edit .env if needed (optional — app runs without watsonx.ai credentials)

# Start the backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at: http://localhost:8000

Interactive API docs: http://localhost:8000/docs

> **Note:** On first startup, the ML models (XGBoost + Isolation Forest) train on startup.
> This takes ~20–30 seconds. Subsequent requests are fast.

---

## 3. Frontend Setup (Next.js)

Open a **new terminal**:

```bash
cd src/frontend

# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local
# Default: NEXT_PUBLIC_API_URL=http://localhost:8000 — no changes needed

# Start the frontend development server
npm run dev
```

The dashboard will be available at: http://localhost:3000

---

## 4. View the Dashboard

Open your browser to **http://localhost:3000**

The dashboard will:
1. Load real-time grid telemetry (simulated)
2. Show anomaly alerts if detected
3. Display 48h historical + 24h forecast charts
4. Provide AI-generated optimization recommendations and root cause analysis
5. Auto-refresh every 30 seconds

---

## 5. API Reference

All endpoints accessible at http://localhost:8000/docs

| Endpoint | Description |
|---|---|
| `GET /api/advisor/` | Full advisory (primary endpoint used by dashboard) |
| `GET /api/grid/snapshot` | Real-time grid snapshot |
| `GET /api/grid/history?hours=48` | Historical grid data |
| `GET /api/forecast/?hours=24` | 24h forecast |
| `GET /api/anomaly/` | Anomaly detection |
| `GET /api/optimization/` | Dispatch optimization |

---

## 6. Optional: watsonx.ai Integration

To enable IBM Granite LLM-powered narrative generation:

1. Register at https://dataplatform.cloud.ibm.com/
2. Create a watsonx.ai project and get your API key
3. Edit `src/backend/.env`:

```env
WATSONX_API_KEY=your-api-key
WATSONX_PROJECT_ID=your-project-id
WATSONX_URL=https://us-south.ml.cloud.ibm.com
WATSONX_MODEL_ID=ibm/granite-13b-instruct-v2
```

4. See `docs/architecture.md` for the integration code snippet

---

## Troubleshooting

| Issue | Fix |
|---|---|
| `ModuleNotFoundError` | Make sure you activated the virtual environment |
| `Cannot reach API` error in dashboard | Ensure backend is running on port 8000 |
| Frontend won't start | Run `npm install` first |
| Slow first API response | ML models train on startup — wait 30s |
| CORS error | Backend already has `allow_origins=["*"]` configured |

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

# Copy environment file (PowerShell: Copy-Item .env.example .env)
cp .env.example .env
# Leave DATABASE_URL unset for local SQLite, or set a PostgreSQL URL explicitly.

# Start the backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at: http://localhost:8000

Interactive API docs: http://localhost:8000/docs

For Render, set the service root directory to `src/backend`, build with
`pip install -r requirements.txt`, and start with
`uvicorn app.main:app --host 0.0.0.0 --port $PORT`. Set `DATABASE_URL` to the
Render PostgreSQL internal URL and `CORS_ORIGINS` to the Vercel URL plus any
local origins needed for development.
Include the exact deployed frontend origin
`https://bob-ai-hackathon-think-x.vercel.app` in `CORS_ORIGINS`.

### Render Secret File

For plaintext secrets that should be mounted as a file, open the Render
backend service's **Environment** settings and add a **Secret File** named
`backend.env`. Render makes it available during builds and runtime at
`/etc/secrets/backend.env`; the backend loads that file automatically. Use
dotenv syntax and store only private values there, for example:

```dotenv
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/gridpilot_db
EIA_API_KEY=your_private_key
WATSONX_API_KEY=your_private_key
WATSONX_PROJECT_ID=your_project_id
```

Do not commit `backend.env`, `.env`, or any private key. Render environment
variables take precedence over values in the Secret File, so use the Render
Environment settings for values that should be managed there instead.

> **Note:** On first startup, the ML models (XGBoost + Isolation Forest) train on startup.
> This takes ~20–30 seconds. Subsequent requests are fast.

---

## 3. Frontend Setup (Next.js)

Open a **new terminal**:

```bash
cd src/frontend

# Install dependencies
npm install

# Copy environment file (PowerShell: Copy-Item .env.example .env.local)
cp .env.example .env.local
# Local defaults use SQLite-backed FastAPI and explicit mock mode.

# Start the frontend development server
npm run dev
```

The dashboard will be available at: http://localhost:3000

For Vercel, set the root directory to `src/frontend`, use the Next.js preset,
and set `NEXT_PUBLIC_API_URL=https://bob-ai-hackathon-thinkx.onrender.com` and
`NEXT_PUBLIC_USE_MOCK_DATA=false`.
After changing Vercel environment variables, redeploy so Next.js rebuilds the
browser bundle. Do not leave `NEXT_PUBLIC_API_URL=http://localhost:8000` in
Vercel; that address points to the visitor's own computer, not Render.

## SQLite to PostgreSQL migration

The local SQLite file is `src/backend/gridpilot.db`. After creating the Render
PostgreSQL service, run this from `src/backend` with the destination URL in
the environment. The script creates missing tables, preserves primary keys,
skips existing primary keys on repeat runs, and never truncates PostgreSQL:

When running the command on your own computer, use Render's **External
Database URL**. Render's **Internal Database URL** uses a private hostname
such as `dpg-...` and only resolves from another Render service or Render
Shell.

```bash
set DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/gridpilot_db
python scripts/migrate_sqlite_to_postgres.py --sqlite-path gridpilot.db
```

On PowerShell, use `$env:DATABASE_URL="..."` instead of `set` and do not put
the real URL in Git.

Alternatively, run the same command from a Render Shell attached to the
backend service; there the Internal Database URL is reachable. Never commit
either database URL because both contain credentials.

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
| CORS error | Check `CORS_ORIGINS` includes the exact frontend origin |

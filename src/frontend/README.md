# ⚡ GridPilot AI — Operator Control Center Frontend

GridPilot AI is an AI-powered Grid Operations Copilot built with Next.js App Router, TypeScript, Tailwind CSS, Recharts, and Lucide React.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router)
- **UI Components**: React 19, Tailwind CSS v4, Lucide React
- **Charts**: Recharts
- **State & Data Fetching**: TanStack React Query
- **Types**: Full TypeScript definitions

---

## 🚀 Quickstart & Running Locally

### 1. Install Dependencies
```bash
cd frontend
npm install --legacy-peer-deps
```

### 2. Environment Setup
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Default settings:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_USE_MOCK_DATA=true
```

To switch to the live FastAPI backend, set:
```env
NEXT_PUBLIC_USE_MOCK_DATA=false
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 Available Routes

- `/` → Redirects to `/dashboard`
- `/dashboard` — Main Control Room Hero, KPI cards, Forecast charts, Stress drivers, Critical Alerts, Critical Asset card, Root Cause Analysis, AI Operator Brief, and Next-Best Actions with Human-in-the-loop Approval.
- `/forecasts` — 24-hour Demand, Solar, and Wind ML forecast charts with confidence bands and model metrics (MAE, RMSE, MAPE).
- `/assets` — Searchable & filterable inventory table of all 31 grid assets across 5 regions.
- `/assets/SOLAR_B17` — Asset diagnostic details, telemetry parameters, and RCA cause breakdown.
- `/anomalies` — Real-time telemetry anomaly log with severity filters.
- `/optimization` — Curtailment Avoidance Optimization comparing dispatch Scenarios A, B, C, and D with Before/After operational impact.
- `/simulation` — Interactive What-If Scenario Simulator with real-time sliders and impact analysis.
- `/recommendations` — Decision approval portal with Operator Safety Confirmation modal.
- `/demo` — 30-Second Hackathon Executive Presentation Mode.

---

## ⚡ Build & Verification

To verify production build:
```bash
npm run build
```

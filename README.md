# Team ThinkX — Grid Advisor

> AI-Powered Grid Load Optimization & Renewable Energy Performance Advisor

---

## 👥 Team

| Field | Value |
|---|---|
| **Team Name** | ThinkX |
| **Track** | Sustainability |
| **Team Lead** | ThinkX Lead |

---

## 🎯 Problem Statement

Modern power grids are becoming increasingly difficult to operate due to the rapid growth of variable renewable energy (solar & wind), rising electricity demand, sudden demand spikes, and transmission constraints. Grid operators lack real-time AI-powered decision support to determine when, where, and how to dispatch renewable energy — resulting in curtailment of clean energy and grid instability.

---

## 💡 Solution

We built an **AI-Powered Grid Load Optimization & Renewable Energy Performance Advisor** — a full-stack real-time dashboard that combines ML-based load forecasting (XGBoost), anomaly detection (Isolation Forest), and a greedy optimization engine with LLM-ready Root Cause Analysis. The system continuously monitors grid conditions, predicts the next 24 hours, detects anomalies, and delivers actionable natural-language recommendations to grid operators.

**Tagline:** *Predict the problem. Explain the cause. Optimize the response.*

---

## ✨ Key Features

- **Real-time Grid Monitoring:** Live snapshot of demand, solar, wind, frequency, reserve margin, congestion, and curtailment
- **24h Load & Renewable Forecasting:** XGBoost model predicting demand, solar, wind, and curtailment risk for the next 24 hours
- **Anomaly Detection:** Isolation Forest + rule-based engine detecting demand spikes, frequency deviations, low reserves, and high curtailment
- **Optimization Engine:** Greedy dispatch optimizer that recommends storage charging, load shifting, and conventional generation reduction
- **AI Root Cause Analysis Advisor:** Structured RCA (symptom → cause → contributing factors → immediate action) with natural language narrative (watsonx.ai-ready)

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| **Languages** | Python 3.11, TypeScript |
| **Frameworks** | FastAPI, Next.js 14, React 18 |
| **ML / AI** | XGBoost, scikit-learn (Isolation Forest), rule-based RCA |
| **Visualization** | ECharts, echarts-for-react, Tailwind CSS |
| **IBM Technologies** | IBM Bob (development), watsonx.ai (integration-ready) |
| **Other** | uvicorn, axios, pandas, numpy |

---

## 📁 Repository Structure

```
├── src/
│   ├── backend/              # FastAPI Python backend
│   │   ├── app/
│   │   │   ├── main.py       # FastAPI app entry point
│   │   │   ├── routers/      # API route handlers
│   │   │   └── services/     # ML, simulation, optimization, advisor
│   │   └── requirements.txt
│   └── frontend/             # Next.js + React dashboard
│       ├── pages/            # Dashboard page
│       ├── components/       # UI components
│       └── lib/              # API client + utilities
├── docs/                     # Documentation
├── demo/                     # Demo artifacts
├── presentation/             # Slide deck
└── submission.yaml           # Submission metadata
```

---

## ⚡ How to Run

> **See [`docs/setup-guide.md`](docs/setup-guide.md) for full instructions.**

```bash
# Backend
cd src/backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend (new terminal)
cd src/frontend
npm install
npm run dev
```

Open http://localhost:3000

---

## 🖥️ Demo

| Artifact | Link |
|---|---|
| 📹 Demo Video | [See demo/demo-video-link.txt](demo/demo-video-link.txt) |
| 🖼️ Screenshots | [See demo/screenshots/](demo/screenshots/) |
| 📊 Presentation | [See presentation/](presentation/) |

---

## ⚠️ Known Limitations

- Grid data is simulated — not connected to live EIA/NOAA/NREL APIs (integration path is documented)
- LLM narrative uses rule-based RCA — watsonx.ai API is stubbed and ready for connection
- No authentication layer — designed for hackathon demo purposes
- Optimization uses greedy dispatch — production would use Pyomo/OR-Tools LP solver

---

## 🏅 What We're Most Proud Of

The end-to-end advisory pipeline: from raw sensor-level grid data → ML anomaly detection → optimization recommendations → human-readable Root Cause Analysis narrative — all in a single API call (`GET /api/advisor/`). The architecture is production-realistic and directly extensible with real data sources and watsonx.ai LLM.

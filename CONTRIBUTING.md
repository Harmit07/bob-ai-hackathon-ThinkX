# Contributing & Submission Guide

This repository is the hackathon submission for **Team ThinkX — GridPilot AI**.

---

## Repository Layout

```
bob-ai-hackathon-ThinkX/
├── src/
│   ├── backend/          # FastAPI Python backend (GridPilot AI API)
│   └── frontend/         # Next.js 16 + React 19 operator dashboard
├── docs/
│   ├── problem-statement.md
│   ├── solution-overview.md
│   ├── architecture.md
│   └── setup-guide.md
├── demo/                 # Video link, live demo URL, screenshots
├── presentation/         # Slide deck
├── submission.yaml       # Submission metadata (judges read this first)
└── README.md
```

---

## For Judges

Everything you need to evaluate this submission:

| What | Where |
|---|---|
| **Project summary** | [`submission.yaml`](submission.yaml) |
| **Problem & solution** | [`docs/problem-statement.md`](docs/problem-statement.md) · [`docs/solution-overview.md`](docs/solution-overview.md) |
| **Architecture** | [`docs/architecture.md`](docs/architecture.md) |
| **How to run** | [`docs/setup-guide.md`](docs/setup-guide.md) |
| **Demo video** | [`demo/demo-video-link.txt`](demo/demo-video-link.txt) |
| **Live demo** | [`demo/live-demo-url.txt`](demo/live-demo-url.txt) |
| **Screenshots** | [`demo/screenshots/`](demo/screenshots/) |
| **Presentation** | [`presentation/`](presentation/) |
| **Source code** | [`src/`](src/) |

---

## Running the Project

See [`docs/setup-guide.md`](docs/setup-guide.md) for full instructions. Quick start:

```bash
# Backend
cd src/backend
python -m venv .venv && .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd src/frontend
npm install && npm run dev
```

Open http://localhost:3000 for the dashboard · http://localhost:8000/docs for the API.

---

## For Contributors (Team ThinkX)

### Branch & PR conventions

- Work on feature branches: `feature/<short-description>`
- Keep PRs focused — one feature or fix per PR
- Run `pytest tests/ -v` (backend) before pushing
- Run `npm run lint` (frontend) before pushing
- Never commit `.env` files — they are in `.gitignore`
- Never commit `node_modules/` or `.venv/`

### Environment setup

```bash
# Backend
cd src/backend
cp .env.example .env
# fill in WATSONX_* keys if testing watsonx.ai integration

# Frontend
cd src/frontend
cp .env.local.example .env.local
# NEXT_PUBLIC_API_URL defaults to http://localhost:8000
```

### Adding a new backend feature

1. Create a service in `src/backend/app/services/` (business logic)
2. Create a router in `src/backend/app/routers/` (HTTP layer)
3. Register the router in `src/backend/app/main.py`
4. Add corresponding API client function in `src/frontend/lib/api.ts`
5. Create a React component in `src/frontend/components/`
6. Wire it into the appropriate page in `src/frontend/app/`

### ML model changes

To retrain all models:

```bash
cd src/backend
python -m app.ml_engine.train_models
```

Saved model artefacts are in `src/backend/app/ml_engine/saved_models/` and are committed to the repo so the app runs without retraining on first clone.

---

## Submission Checklist

- [x] `submission.yaml` — all fields filled
- [x] `README.md` — no placeholder text
- [x] `docs/problem-statement.md` — completed
- [x] `docs/solution-overview.md` — completed
- [x] `docs/architecture.md` — completed
- [x] `docs/setup-guide.md` — completed
- [x] `src/` — full source code committed (no `node_modules`, no `.env`)
- [ ] `demo/demo-video-link.txt` — add real video URL (3–5 min demo)
- [x] `demo/live-demo-url.txt` — add deployed URL or write "NOT DEPLOYED"
- [x] `demo/screenshots/` — add 3+ screenshots of the running app
- [x] `presentation/slides.pdf` — add slide deck
- [ ] GitHub Actions **✅ Validate Submission** is green
- [x] Repository is **Public**
- [ ] Entry form submitted before the deadline

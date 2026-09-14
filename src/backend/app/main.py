from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import (
    grid, forecast, anomaly, optimization, advisor,
    events, underperformance, nba, scenarios, stress, brief, financial, hitl,
    india,
)

app = FastAPI(
    title="Grid Load Optimization & Renewable Energy Performance Advisor",
    description="AI-Powered Grid Load Optimization & Renewable Energy Performance Advisor API",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Core endpoints
app.include_router(grid.router,           prefix="/api/grid",           tags=["Grid"])
app.include_router(forecast.router,       prefix="/api/forecast",       tags=["Forecast"])
app.include_router(anomaly.router,        prefix="/api/anomaly",        tags=["Anomaly"])
app.include_router(optimization.router,   prefix="/api/optimization",   tags=["Optimization"])
app.include_router(advisor.router,        prefix="/api/advisor",        tags=["Advisor"])

# New feature endpoints
app.include_router(events.router,         prefix="/api/events",         tags=["Event Predictor"])
app.include_router(underperformance.router, prefix="/api/underperformance", tags=["Underperformance"])
app.include_router(nba.router,            prefix="/api/nba",            tags=["Next Best Action"])
app.include_router(scenarios.router,      prefix="/api/scenarios",      tags=["Scenario Simulator"])
app.include_router(stress.router,         prefix="/api/stress",         tags=["Grid Stress Score"])
app.include_router(brief.router,          prefix="/api/brief",          tags=["Operator Brief"])
app.include_router(financial.router,      prefix="/api/financial",      tags=["Financial Impact"])
app.include_router(hitl.router,           prefix="/api/hitl",           tags=["Human-in-the-Loop"])
app.include_router(india.router,          prefix="/api/india",          tags=["India Grid"])


@app.get("/")
def health():
    return {
        "status": "ok",
        "service": "Grid Advisor API v2.0",
        "india_endpoints": "/api/india/snapshot, /api/india/all-regions, /api/india/advisory, /api/india/capacity, /api/india/weather, /api/india/pricing, /api/india/open-datasets, /api/india/data-sources",
    }

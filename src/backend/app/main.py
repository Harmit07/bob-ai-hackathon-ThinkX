from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.db.database import Base, engine, SessionLocal
from app.db.seed import init_db, seed_database
from app.api.router import api_router
from app.api.endpoints.rest_contract import router as rest_router
from app.routers import (
    advisor, anomaly, brief, events, financial, forecast as grid_forecast,
    grid, hitl, india, nba, optimization as opt_router, scenarios,
    stress, underperformance, curtailment,
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables and seed default grid benchmark
    init_db()
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="GridPilot AI - Renewable Integration, ML Forecasting, Anomaly Detection, & Google OR-Tools Unit Commitment Backend",
    openapi_url="/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Router
app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(rest_router, prefix="/api")

# Domain routers
app.include_router(advisor.router,          prefix="/api/advisor",          tags=["Advisor"])
app.include_router(anomaly.router,          prefix="/api/anomalies",        tags=["Anomaly"])
app.include_router(brief.router,            prefix="/api/brief",            tags=["Brief"])
app.include_router(events.router,           prefix="/api/events",           tags=["Events"])
app.include_router(financial.router,        prefix="/api/financial",        tags=["Financial"])
app.include_router(grid_forecast.router,    prefix="/api/forecast",         tags=["Forecast"])
app.include_router(grid.router,             prefix="/api/grid",             tags=["Grid"])
app.include_router(hitl.router,             prefix="/api/hitl",             tags=["HITL"])
app.include_router(india.router,            prefix="/api/india",            tags=["India"])
app.include_router(nba.router,              prefix="/api/nba",              tags=["NBA"])
app.include_router(opt_router.router,       prefix="/api/optimization",     tags=["Optimization"])
app.include_router(scenarios.router,        prefix="/api/scenarios",        tags=["Scenarios"])
app.include_router(stress.router,           prefix="/api/stress",           tags=["Stress"])
app.include_router(underperformance.router, prefix="/api/underperformance", tags=["Underperformance"])
app.include_router(curtailment.router,      prefix="/api/curtailment",      tags=["Curtailment"])


@app.get("/")
def root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "documentation": "/docs",
        "golden_demo_endpoint": f"{settings.API_V1_STR}/golden-demo",
        "analyze_endpoint": f"{settings.API_V1_STR}/analyze"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

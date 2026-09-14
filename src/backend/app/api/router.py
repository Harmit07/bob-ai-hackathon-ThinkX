from fastapi import APIRouter
from app.api.endpoints import data, forecast, optimization, golden_demo, analyze, rest_contract

api_router = APIRouter()

api_router.include_router(data.router)
api_router.include_router(forecast.router)
api_router.include_router(optimization.router)
api_router.include_router(golden_demo.router)
api_router.include_router(analyze.router)
api_router.include_router(rest_contract.router, prefix="")


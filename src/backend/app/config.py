import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "GridPilot AI - Smart Grid Energy Management Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/gridpilot"
    
    # Database configuration (defaults to local SQLite if Postgres is not set)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", "sqlite:///./gridpilot.db"
    )
    
    CORS_ORIGINS: list[str] = [
        "http://localhost",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8000",
        "*"
    ]
    
    # Model parameters
    FORECAST_HORIZON_HOURS: int = 24
    DEFAULT_CARBON_TAX_PER_TON: float = 50.0 # $ per ton CO2
    
    class Config:
        case_sensitive = True

settings = Settings()

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "GridPilot AI - Smart Grid Energy Management Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/gridpilot"
    
    model_config = SettingsConfigDict(
        env_file=(".env", "/etc/secrets/backend.env"),
        case_sensitive=True,
        extra="ignore",
    )

    # DATABASE_URL selects PostgreSQL in production and SQLite locally.
    DATABASE_URL: str = "sqlite:///./gridpilot.db"
    CORS_ORIGINS: str = Field(
        default=(
            "http://localhost,http://localhost:3000,http://localhost:5173,"
            "http://localhost:8000,"
            "https://bob-ai-hackathon-think-6o8u7folu.vercel.app,"
            "https://bob-ai-hackathon-think-cs5rhl40v.vercel.app,"
            "https://bob-ai-hackathon-think-x.vercel.app"
        )
    )
    
    # Model parameters
    FORECAST_HORIZON_HOURS: int = 24
    DEFAULT_CARBON_TAX_PER_TON: float = 50.0 # $ per ton CO2
    
    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

settings = Settings()

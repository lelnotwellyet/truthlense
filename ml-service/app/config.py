from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables and .env file."""

    MODEL_NAME: str = "hamzab/roberta-fake-news-classification"
    GOOGLE_FACT_CHECK_API_KEY: Optional[str] = None
    GNEWS_API_KEY: Optional[str] = None
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    CORS_ORIGINS: str = "*"
    LOG_LEVEL: str = "info"

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


settings = Settings()

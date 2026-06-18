"""TruthLens ML Service — FastAPI application entry-point."""

import logging
import sys
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.models.classifier import FakeNewsClassifier
from app.routes.health import router as health_router
from app.routes.predict import router as predict_router
from app.routes.verify import router as verify_router


# --------------- Structured Logging ---------------

def _setup_logging() -> None:
    """Configure structured logging for the application."""
    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)

    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(log_level)

    formatter = logging.Formatter(
        fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%dT%H:%M:%S",
    )
    handler.setFormatter(formatter)

    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    # Avoid duplicate handlers on reload
    root_logger.handlers.clear()
    root_logger.addHandler(handler)


# --------------- Lifespan ---------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load the ML model on startup and clean up on shutdown."""
    _setup_logging()
    logger = logging.getLogger(__name__)

    logger.info("Starting TruthLens ML Service …")
    logger.info("Loading classifier model: %s", settings.MODEL_NAME)

    try:
        classifier = FakeNewsClassifier(model_name=settings.MODEL_NAME)
        app.state.classifier = classifier
        app.state.settings = settings
        logger.info("Classifier loaded successfully.")
    except Exception as exc:
        logger.error("Failed to load classifier: %s", exc)
        app.state.classifier = None
        app.state.settings = settings

    yield  # application is running

    logger.info("Shutting down TruthLens ML Service …")


# --------------- App Factory ---------------

app = FastAPI(
    title="TruthLens ML Service",
    description="AI-powered news verification API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
origins = [
    origin.strip()
    for origin in settings.CORS_ORIGINS.split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(health_router)
app.include_router(predict_router)
app.include_router(verify_router)


# --------------- Root Endpoint ---------------

@app.get("/")
async def root():
    """Return basic API information."""
    return {
        "service": "TruthLens ML Service",
        "version": "1.0.0",
        "description": "AI-powered news verification API",
        "endpoints": {
            "health": "/health",
            "predict": "/predict",
            "verify_text": "/verify-text",
            "verify_url": "/verify-url",
            "verify_image": "/verify-image",
        },
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

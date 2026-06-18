"""Health-check endpoint."""

from datetime import datetime, timezone

from fastapi import APIRouter, Request

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check(request: Request):
    """Return service health status."""
    model_loaded = (
        hasattr(request.app.state, "classifier")
        and request.app.state.classifier is not None
    )
    return {
        "status": "healthy",
        "model_loaded": model_loaded,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

"""Raw ML prediction endpoint."""

from pydantic import BaseModel, Field
from fastapi import APIRouter, Request, HTTPException

router = APIRouter(tags=["predict"])


# --------------- Pydantic schemas ---------------

class PredictRequest(BaseModel):
    """Request body for the /predict endpoint."""

    text: str = Field(..., min_length=1, description="Text to classify")


class ProbabilityDetail(BaseModel):
    """Per-label probability."""

    REAL: float = 0.0
    FAKE: float = 0.0


class PredictResponse(BaseModel):
    """Response from the /predict endpoint."""

    prediction: str
    confidence: float
    probabilities: ProbabilityDetail


# --------------- Route ---------------

@router.post("/predict", response_model=PredictResponse)
async def predict(payload: PredictRequest, request: Request):
    """Return raw ML classification for the given text."""
    classifier = getattr(request.app.state, "classifier", None)
    if classifier is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    text = payload.text.strip()
    if not text:
        raise HTTPException(status_code=422, detail="Text must not be empty")

    result = classifier.predict(text)
    return result

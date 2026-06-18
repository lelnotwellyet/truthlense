"""Full verification endpoints: text, URL, and image."""

from typing import Optional

from fastapi import APIRouter, File, HTTPException, Request, UploadFile
from pydantic import BaseModel, Field

from app.services.image_analyzer import analyze_image
from app.services.text_analyzer import analyze_text
from app.services.url_analyzer import analyze_url

router = APIRouter(tags=["verify"])


# --------------- Pydantic schemas ---------------

class VerifyTextRequest(BaseModel):
    """Request body for /verify-text."""

    text: str = Field(..., min_length=1, description="Text to verify")
    source_name: Optional[str] = Field(
        None, description="Source domain (e.g. reuters.com)"
    )


class VerifyUrlRequest(BaseModel):
    """Request body for /verify-url."""

    url: str = Field(..., min_length=1, description="Article URL to verify")


# --------------- Helpers ---------------

def _get_classifier(request: Request):
    """Retrieve the classifier from app state or raise 503."""
    classifier = getattr(request.app.state, "classifier", None)
    if classifier is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    return classifier


def _get_api_key(request: Request) -> Optional[str]:
    """Retrieve the fact-check API key from settings."""
    settings = getattr(request.app.state, "settings", None)
    if settings:
        return settings.GOOGLE_FACT_CHECK_API_KEY
    return None


def _get_gnews_api_key(request: Request) -> Optional[str]:
    """Retrieve the GNews API key from settings."""
    settings = getattr(request.app.state, "settings", None)
    if settings:
        return settings.GNEWS_API_KEY
    return None


# --------------- Routes ---------------

@router.post("/verify-text")
async def verify_text(payload: VerifyTextRequest, request: Request):
    """Run full verification pipeline on raw text."""
    classifier = _get_classifier(request)
    api_key = _get_api_key(request)
    gnews_key = _get_gnews_api_key(request)

    result = analyze_text(
        text=payload.text,
        classifier=classifier,
        source_name=payload.source_name,
        fact_check_api_key=api_key,
        gnews_api_key=gnews_key,
    )
    return result


@router.post("/verify-url")
async def verify_url(payload: VerifyUrlRequest, request: Request):
    """Extract article from URL and run full verification pipeline."""
    classifier = _get_classifier(request)
    api_key = _get_api_key(request)
    gnews_key = _get_gnews_api_key(request)

    result = analyze_url(
        url=payload.url,
        classifier=classifier,
        fact_check_api_key=api_key,
        gnews_api_key=gnews_key,
    )
    return result


@router.post("/verify-image")
async def verify_image(
    request: Request,
    file: UploadFile = File(..., description="Image file to OCR and verify"),
):
    """Extract text from an image via OCR and run full verification."""
    classifier = _get_classifier(request)
    api_key = _get_api_key(request)
    gnews_key = _get_gnews_api_key(request)

    # Validate content type
    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=422,
            detail=f"Expected an image file, got {file.content_type}",
        )

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=422, detail="Uploaded file is empty")

    result = analyze_image(
        image_bytes=image_bytes,
        classifier=classifier,
        fact_check_api_key=api_key,
        gnews_api_key=gnews_key,
    )
    return result

import io
import logging
from datetime import datetime, timezone
from typing import Dict, Optional

import pytesseract
from PIL import Image

from app.models.classifier import FakeNewsClassifier
from app.services.text_analyzer import analyze_text

logger = logging.getLogger(__name__)


def analyze_image(
    image_bytes: bytes,
    classifier: FakeNewsClassifier,
    fact_check_api_key: Optional[str] = None,
    gnews_api_key: Optional[str] = None,
) -> Dict:
    """Extract text from an image via OCR and run verification.

    Args:
        image_bytes: Raw bytes of the uploaded image.
        classifier: The ML classifier instance.
        fact_check_api_key: Optional Google API key.
        gnews_api_key: Optional GNews API key.

    Returns:
        Verification response with OCR'd text.
    """
    try:
        image = Image.open(io.BytesIO(image_bytes))

        # Convert to RGB if necessary (e.g., RGBA PNGs)
        if image.mode not in ("L", "RGB"):
            image = image.convert("RGB")

        extracted_text = pytesseract.image_to_string(image)
    except Exception as exc:
        logger.error("OCR processing failed: %s", exc)
        return {
            "status": "error",
            "message": f"Failed to process image: {str(exc)}",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    extracted_text = extracted_text.strip()

    if not extracted_text:
        return {
            "status": "error",
            "message": "No text could be extracted from the image.",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    # Run text analysis on the OCR output
    result = analyze_text(
        text=extracted_text,
        classifier=classifier,
        fact_check_api_key=fact_check_api_key,
        gnews_api_key=gnews_api_key,
    )

    result["input_type"] = "image"
    result["ocr_text"] = extracted_text

    return result

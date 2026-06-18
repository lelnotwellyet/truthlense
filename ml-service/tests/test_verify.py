"""Tests for the /verify-text, /verify-url, and /verify-image endpoints."""

from io import BytesIO
from unittest.mock import MagicMock, patch

import pytest


# --------------- /verify-text ---------------


@pytest.mark.asyncio
async def test_verify_text_basic(test_client, mock_classifier):
    """POST /verify-text with valid text should return full verification."""
    with patch("app.services.text_analyzer.check_facts") as mock_facts:
        mock_facts.return_value = {
            "claims_found": 0,
            "claims": [],
            "average_score": 50,
            "evidence": [],
            "note": "No matching fact-checks found",
        }

        response = await test_client.post(
            "/verify-text",
            json={"text": "Scientists have discovered water on Mars."},
        )

    assert response.status_code == 200
    data = response.json()
    assert data.get("status") == "success"
    assert "ml_prediction" in data
    assert "composite" in data
    assert "timestamp" in data


@pytest.mark.asyncio
async def test_verify_text_with_source(test_client, mock_classifier):
    """POST /verify-text with an optional source_name should succeed."""
    with patch("app.services.text_analyzer.check_facts") as mock_facts:
        mock_facts.return_value = {
            "claims_found": 0,
            "claims": [],
            "average_score": 50,
            "evidence": [],
        }

        response = await test_client.post(
            "/verify-text",
            json={
                "text": "Breaking news from trusted source.",
                "source_name": "reuters.com",
            },
        )

    assert response.status_code == 200
    data = response.json()
    assert data["source"]["name"] == "reuters.com"


@pytest.mark.asyncio
async def test_verify_text_empty(test_client):
    """POST /verify-text with empty text should be rejected."""
    response = await test_client.post("/verify-text", json={"text": ""})
    assert response.status_code == 422


# --------------- /verify-url ---------------


@pytest.mark.asyncio
async def test_verify_url_success(test_client, mock_classifier):
    """POST /verify-url should extract content and return verification."""
    with (
        patch("app.services.url_analyzer._extract_with_trafilatura") as mock_traf,
        patch("app.services.text_analyzer.check_facts") as mock_facts,
    ):
        mock_traf.return_value = {
            "title": "Test Article",
            "text": "This is a test article about important news events.",
            "author": "Test Author",
        }
        mock_facts.return_value = {
            "claims_found": 0,
            "claims": [],
            "average_score": 50,
            "evidence": [],
        }

        response = await test_client.post(
            "/verify-url", json={"url": "https://example.com/article"}
        )

    assert response.status_code == 200
    data = response.json()
    assert data.get("status") == "success"
    assert data.get("input_type") == "url"
    assert "extracted_metadata" in data


@pytest.mark.asyncio
async def test_verify_url_extraction_failure(test_client, mock_classifier):
    """POST /verify-url when extraction fails should return error status."""
    with (
        patch("app.services.url_analyzer._extract_with_trafilatura") as mock_traf,
        patch("app.services.url_analyzer._extract_with_bs4") as mock_bs4,
    ):
        mock_traf.return_value = None
        mock_bs4.return_value = None

        response = await test_client.post(
            "/verify-url", json={"url": "https://nonexistent.example.com"}
        )

    assert response.status_code == 200
    data = response.json()
    assert data.get("status") == "error"
    assert "message" in data


# --------------- /verify-image ---------------


@pytest.mark.asyncio
async def test_verify_image_success(test_client, mock_classifier):
    """POST /verify-image with a valid image should return OCR + verification."""
    with (
        patch("app.services.image_analyzer.pytesseract") as mock_tess,
        patch("app.services.text_analyzer.check_facts") as mock_facts,
    ):
        mock_tess.image_to_string.return_value = (
            "Breaking news headline about some important event."
        )
        mock_facts.return_value = {
            "claims_found": 0,
            "claims": [],
            "average_score": 50,
            "evidence": [],
        }

        # Create a minimal valid PNG (1x1 pixel)
        from PIL import Image

        img = Image.new("RGB", (10, 10), color="white")
        buf = BytesIO()
        img.save(buf, format="PNG")
        buf.seek(0)

        response = await test_client.post(
            "/verify-image",
            files={"file": ("test.png", buf, "image/png")},
        )

    assert response.status_code == 200
    data = response.json()
    assert data.get("status") == "success"
    assert data.get("input_type") == "image"
    assert "ocr_text" in data


@pytest.mark.asyncio
async def test_verify_image_no_text_extracted(test_client, mock_classifier):
    """POST /verify-image when OCR finds no text should return error."""
    with patch("app.services.image_analyzer.pytesseract") as mock_tess:
        mock_tess.image_to_string.return_value = ""

        from PIL import Image

        img = Image.new("RGB", (10, 10), color="white")
        buf = BytesIO()
        img.save(buf, format="PNG")
        buf.seek(0)

        response = await test_client.post(
            "/verify-image",
            files={"file": ("blank.png", buf, "image/png")},
        )

    assert response.status_code == 200
    data = response.json()
    assert data.get("status") == "error"
    assert "No text" in data.get("message", "")


@pytest.mark.asyncio
async def test_verify_text_gnews_fallback(test_client, mock_classifier):
    """POST /verify-text with fallback to GNews when fact-check returns 0 claims."""
    from app.main import app
    app.state.settings.GOOGLE_FACT_CHECK_API_KEY = "dummy_google_key"
    app.state.settings.GNEWS_API_KEY = "dummy_gnews_key"

    with patch("app.services.fact_checker.requests.get") as mock_get:
        # Mock Google Fact Check response with 0 claims
        mock_response_factcheck = MagicMock()
        mock_response_factcheck.json.return_value = {"claims": []}
        mock_response_factcheck.raise_for_status = MagicMock()

        # Mock GNews search response
        mock_response_gnews = MagicMock()
        mock_response_gnews.json.return_value = {
            "totalArticles": 2,
            "articles": [
                {
                    "title": "Messi is playing in the 2026 World Cup",
                    "url": "https://bbc.com/sport/football/123",
                    "source": {"name": "BBC News", "url": "https://bbc.com"},
                },
                {
                    "title": "Argentina squad for 2026 WC contains Messi",
                    "url": "https://reuters.com/sports/456",
                    "source": {"name": "Reuters", "url": "https://reuters.com"},
                }
            ]
        }
        mock_response_gnews.raise_for_status = MagicMock()

        # First request is Google Fact Check, second is GNews
        mock_get.side_effect = [mock_response_factcheck, mock_response_gnews]

        response = await test_client.post(
            "/verify-text",
            json={"text": "Messi playing in 2026 WC"},
        )

    assert response.status_code == 200
    data = response.json()
    assert data.get("status") == "success"
    fact_check = data.get("fact_check", {})
    assert fact_check.get("claims_found") == 2
    assert len(fact_check.get("evidence", [])) == 2
    assert fact_check.get("average_score") == 95.0  # bbc (95) + reuters (95) average + bonus (10) capped at 95


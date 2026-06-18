"""Tests for the /predict endpoint."""

import pytest


@pytest.mark.asyncio
async def test_predict_valid_text(test_client, mock_classifier):
    """POST /predict with valid text should return a prediction."""
    response = await test_client.post(
        "/predict", json={"text": "Breaking news: scientists discover new planet."}
    )
    assert response.status_code == 200

    data = response.json()
    assert "prediction" in data
    assert data["prediction"] in ("REAL", "FAKE")
    assert "confidence" in data
    assert "probabilities" in data

    # The mock classifier should have been called once
    mock_classifier.predict.assert_called_once()


@pytest.mark.asyncio
async def test_predict_empty_text(test_client):
    """POST /predict with empty text should be rejected (422)."""
    response = await test_client.post("/predict", json={"text": ""})
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_predict_missing_text(test_client):
    """POST /predict without a text field should be rejected (422)."""
    response = await test_client.post("/predict", json={})
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_predict_response_format(test_client):
    """Response should contain exactly the expected keys."""
    response = await test_client.post(
        "/predict", json={"text": "The earth revolves around the sun."}
    )
    assert response.status_code == 200

    data = response.json()
    assert set(data.keys()) == {"prediction", "confidence", "probabilities"}
    assert isinstance(data["confidence"], (int, float))
    assert isinstance(data["probabilities"], dict)


@pytest.mark.asyncio
async def test_predict_whitespace_only(test_client):
    """POST /predict with whitespace-only text should be rejected."""
    response = await test_client.post("/predict", json={"text": "   "})
    assert response.status_code == 422

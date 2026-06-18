"""Shared test fixtures for TruthLens ML Service tests."""

from unittest.mock import MagicMock

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from app.config import Settings
from app.main import app


# --------------- Mock classifier ---------------

@pytest.fixture()
def mock_classifier():
    """Return a mock FakeNewsClassifier that returns predictable results
    without loading any real ML model."""
    classifier = MagicMock()
    classifier.predict.return_value = {
        "prediction": "FAKE",
        "confidence": 92.5,
        "probabilities": {"REAL": 7.5, "FAKE": 92.5},
    }
    return classifier


# --------------- Test client ---------------

@pytest_asyncio.fixture()
async def test_client(mock_classifier):
    """Provide an httpx AsyncClient wired to the FastAPI app with a mocked
    classifier so tests don't need the real model."""
    # Inject mock classifier and settings into app state
    app.state.classifier = mock_classifier
    app.state.settings = Settings(
        MODEL_NAME="test-model",
        GOOGLE_FACT_CHECK_API_KEY=None,
        CORS_ORIGINS="*",
        LOG_LEVEL="debug",
    )

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

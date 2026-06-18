"""Tests for app.utils.scoring module."""

import pytest

from app.utils.scoring import (
    SOURCE_CREDIBILITY,
    compute_composite_score,
    get_source_score,
)


# ---- compute_composite_score ----


class TestCompositeScoreRealPrediction:
    """When the model predicts REAL with high confidence the composite
    should be high (assuming neutral source and fact-check scores)."""

    def test_real_high_confidence(self):
        result = compute_composite_score(
            ml_confidence=95.0,
            ml_prediction="REAL",
            source_score=50,
            fact_check_score=50,
        )
        # ml_score = 95, composite = 0.4*95 + 0.4*50 + 0.2*50 = 38+20+10 = 68
        assert result["composite_score"] == 68
        assert result["verdict"] == "Likely Credible"

    def test_real_perfect_confidence(self):
        result = compute_composite_score(
            ml_confidence=100.0,
            ml_prediction="REAL",
            source_score=95,
            fact_check_score=90,
        )
        # ml_score=100 (dampened to 80), composite = 32+38+18 = 88
        assert result["composite_score"] == 88
        assert result["verdict"] == "Highly Credible"


class TestCompositeScoreFakePrediction:
    """When the model predicts FAKE with high confidence the composite
    should be low (credibility is inverted)."""

    def test_fake_high_confidence(self):
        result = compute_composite_score(
            ml_confidence=95.0,
            ml_prediction="FAKE",
            source_score=50,
            fact_check_score=50,
        )
        # ml_score = 100 - 95 = 5, composite = 0.4*5 + 0.4*50 + 0.2*50 = 2+20+10 = 32
        assert result["composite_score"] == 32
        assert result["verdict"] == "Potentially Misleading"

    def test_fake_low_confidence(self):
        result = compute_composite_score(
            ml_confidence=55.0,
            ml_prediction="FAKE",
            source_score=50,
            fact_check_score=50,
        )
        # ml_score = 45, composite = 18+20+10 = 48
        assert result["composite_score"] == 48
        assert result["verdict"] == "Uncertain"


class TestVerdictThresholds:
    """Verify that all four verdict levels are reachable."""

    def test_highly_credible(self):
        result = compute_composite_score(
            ml_confidence=100.0,
            ml_prediction="REAL",
            source_score=95,
            fact_check_score=90,
        )
        assert result["verdict"] == "Highly Credible"
        assert result["composite_score"] >= 80

    def test_likely_credible(self):
        result = compute_composite_score(
            ml_confidence=80.0,
            ml_prediction="REAL",
            source_score=50,
            fact_check_score=50,
        )
        # ml_score=80, composite = 32+20+10 = 62
        assert result["verdict"] == "Likely Credible"
        assert 60 <= result["composite_score"] < 80

    def test_uncertain(self):
        result = compute_composite_score(
            ml_confidence=55.0,
            ml_prediction="FAKE",
            source_score=50,
            fact_check_score=50,
        )
        # ml_score=45, composite = 18+20+10 = 48
        assert result["verdict"] == "Uncertain"
        assert 40 <= result["composite_score"] < 60

    def test_potentially_misleading(self):
        result = compute_composite_score(
            ml_confidence=95.0,
            ml_prediction="FAKE",
            source_score=20,
            fact_check_score=10,
        )
        # ml_score=5, composite = 2+8+2 = 12
        assert result["verdict"] == "Potentially Misleading"
        assert result["composite_score"] < 40


class TestBreakdownKeys:
    """Ensure the response dict includes the expected breakdown."""

    def test_breakdown_present(self):
        result = compute_composite_score(
            ml_confidence=70.0,
            ml_prediction="REAL",
            source_score=50,
            fact_check_score=50,
        )
        assert "breakdown" in result
        assert "ml_score" in result["breakdown"]
        assert "source_score" in result["breakdown"]
        assert "fact_check_score" in result["breakdown"]

    def test_composite_score_clamped(self):
        """Score should never exceed 100 or go below 0."""
        result = compute_composite_score(
            ml_confidence=100.0,
            ml_prediction="REAL",
            source_score=100,
            fact_check_score=100,
        )
        assert result["composite_score"] <= 100

        result_low = compute_composite_score(
            ml_confidence=100.0,
            ml_prediction="FAKE",
            source_score=0,
            fact_check_score=0,
        )
        assert result_low["composite_score"] >= 0


# ---- get_source_score ----


class TestGetSourceScore:
    """Tests for the source score look-up utility."""

    def test_known_domain(self):
        assert get_source_score("reuters.com") == 95

    def test_known_domain_with_www(self):
        assert get_source_score("www.bbc.com") == 95

    def test_unknown_domain(self):
        assert get_source_score("randomsite.xyz") == 50

    def test_empty_domain(self):
        assert get_source_score("") == 50

    def test_none_domain(self):
        assert get_source_score(None) == 50

    def test_case_insensitive(self):
        assert get_source_score("REUTERS.COM") == 95

    def test_all_known_sources_are_positive(self):
        for domain, score in SOURCE_CREDIBILITY.items():
            assert score > 0
            assert score <= 100

from typing import Dict
from urllib.parse import urlparse

SOURCE_CREDIBILITY: Dict[str, int] = {
    "reuters.com": 95,
    "bbc.com": 95,
    "bbc.co.uk": 95,
    "apnews.com": 97,
    "cnn.com": 85,
    "foxnews.com": 70,
    "theguardian.com": 90,
    "nytimes.com": 92,
    "washingtonpost.com": 90,
    "aljazeera.com": 82,
    # Indian news sources
    "thehindu.com": 90,
    "indianexpress.com": 88,
    "timesofindia.indiatimes.com": 80,
    "indiatimes.com": 80,
    "ndtv.com": 82,
    "ndtv.in": 82,
    "hindustantimes.com": 82,
    "livemint.com": 88,
    "economictimes.indiatimes.com": 88,
    "ptinews.com": 95,
    "pib.gov.in": 97,
    "aninews.in": 85,
    "altnews.in": 90,
    "boomlive.in": 90,
    "factly.in": 90,
    "news18.com": 78,
    "indiatoday.in": 82,
    "dainikbhaskar.com": 80,
    "jagran.com": 80,
    "amarujala.com": 80,
    "onmanorama.com": 85,
    "manoramaonline.com": 85,
    "mathrubhumi.com": 85,
    "eenadu.net": 85,
    "anandabazar.com": 85,
    "deccanherald.com": 85,
    "tribuneindia.com": 85,
}


def get_source_score(domain: str) -> int:
    """Look up credibility score for a domain.

    Returns the known score or 50 (neutral) for unknown sources.
    """
    if not domain:
        return 50

    domain = domain.lower().strip()
    # Strip www. prefix if present
    if domain.startswith("www."):
        domain = domain[4:]

    return SOURCE_CREDIBILITY.get(domain, 50)


def get_source_score_from_url(url: str) -> int:
    """Extract domain from a URL and return its credibility score."""
    try:
        parsed = urlparse(url)
        domain = parsed.netloc or parsed.path
        return get_source_score(domain)
    except Exception:
        return 50


def compute_composite_score(
    ml_confidence: float,
    ml_prediction: str,
    source_score: int = 50,
    fact_check_score: int = 50,
) -> Dict:
    """Compute a composite credibility score from multiple signals.

    The base formula is:
        Final = w_ml * ml_score + w_src * source_score + w_fc * fact_check_score

    Default weights: 0.4 ML, 0.4 Source, 0.2 Fact-Check.

    However, we apply two corrections for known ML model biases:

    1. **Confidence dampening**: When ML confidence exceeds 95%, we dampen
       the ml_score towards 50 (neutral). This prevents a single overconfident
       signal from overwhelming the composite. The hamzab/roberta model often
       outputs 99%+ confidence even on ambiguous text.

    2. **Dynamic reweighting**: When the ML says FAKE but the source is a
       known credible outlet (score > 70), we shift weight from ML to Source
       because the model has a documented bias against short snippets and
       non-Western news.

    Args:
        ml_confidence: Model confidence as a percentage (0-100).
        ml_prediction: "REAL" or "FAKE".
        source_score: Source credibility (0-100). Default 50 (unknown).
        fact_check_score: Fact-check API score (0-100). Default 50.

    Returns:
        Dict with composite_score, verdict, and breakdown.
    """
    # Convert ML confidence to a credibility-oriented score
    if ml_prediction.upper() == "REAL":
        ml_score = ml_confidence
    else:
        ml_score = 100.0 - ml_confidence

    # --- Correction 1: Dampen extreme confidence ---
    # If the model is > 95% confident, pull the score toward 50 (neutral)
    # This reflects the reality that no model should be 99.9% certain
    if ml_confidence > 95:
        dampening = 0.6  # blend 60% model, 40% neutral
        ml_score = dampening * ml_score + (1 - dampening) * 50.0

    # --- Correction 2: Dynamic weight adjustment ---
    w_ml = 0.4
    w_src = 0.4
    w_fc = 0.2

    if ml_prediction.upper() == "FAKE" and source_score > 70:
        # Credible source contradicts ML — trust source more
        w_ml = 0.25
        w_src = 0.55
        w_fc = 0.20

    # Weighted combination
    composite = w_ml * ml_score + w_src * source_score + w_fc * fact_check_score
    composite = round(composite)

    # Clamp to 0-100
    composite = max(0, min(100, composite))

    # Determine verdict
    if composite >= 80:
        verdict = "Highly Credible"
    elif composite >= 60:
        verdict = "Likely Credible"
    elif composite >= 40:
        verdict = "Uncertain"
    else:
        verdict = "Potentially Misleading"

    return {
        "composite_score": composite,
        "verdict": verdict,
        "breakdown": {
            "ml_score": round(ml_score, 2),
            "source_score": source_score,
            "fact_check_score": fact_check_score,
        },
    }


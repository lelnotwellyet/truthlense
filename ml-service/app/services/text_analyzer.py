import logging
from datetime import datetime, timezone
from typing import Dict, Optional

from app.models.classifier import FakeNewsClassifier
from app.services.fact_checker import check_facts
from app.utils.scoring import compute_composite_score, get_source_score
from app.utils.text_cleaner import clean_text, extract_claims

logger = logging.getLogger(__name__)


def analyze_text(
    text: str,
    classifier: FakeNewsClassifier,
    source_name: Optional[str] = None,
    fact_check_api_key: Optional[str] = None,
    gnews_api_key: Optional[str] = None,
) -> Dict:
    """Run full verification pipeline on a piece of text.

    Steps:
        1. Clean the text
        2. Run ML classifier
        3. Look up source credibility (if source provided)
        4. Query fact-check API (if API key provided)
        5. Compute composite score

    Returns:
        Full verification response dictionary.
    """
    cleaned = clean_text(text)

    if not cleaned:
        return {
            "status": "error",
            "message": "No text provided or text was empty after cleaning.",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    # Step 1 – ML prediction
    prediction = classifier.predict(cleaned)

    # Step 2 – Source credibility
    source_score = get_source_score(source_name) if source_name else 50

    # Step 3 – Fact checking
    claims = extract_claims(cleaned)
    query = claims[0] if claims else cleaned[:200]
    fact_result = check_facts(query, fact_check_api_key, gnews_api_key)
    fact_check_score = int(fact_result.get("average_score", 50))

    # Step 4 – Composite score
    composite = compute_composite_score(
        ml_confidence=prediction["confidence"],
        ml_prediction=prediction["prediction"],
        source_score=source_score,
        fact_check_score=fact_check_score,
    )

    return {
        "status": "success",
        "input_type": "text",
        "text_preview": cleaned[:300],
        "ml_prediction": prediction,
        "source": {
            "name": source_name,
            "credibility_score": source_score,
        },
        "fact_check": fact_result,
        "composite": composite,
        "claims_extracted": claims[:5],
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

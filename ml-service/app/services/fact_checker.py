import logging
from typing import Dict, List, Optional
from urllib.parse import urlparse

import requests

from app.utils.scoring import get_source_score

logger = logging.getLogger(__name__)

_FACT_CHECK_API_URL = (
    "https://factchecktools.googleapis.com/v1alpha1/claims:search"
)


def check_news_coverage(query: str, api_key: str) -> Dict:
    """Query GNews Search API for active news coverage.

    Args:
        query: Search query (typically the claim or headline).
        api_key: GNews API key.

    Returns:
        Dict with claims_found, claims list, average_score, and evidence.
    """
    query = query.replace('\\', '').strip()
    if not api_key:
        return {
            "claims_found": 0,
            "claims": [],
            "average_score": 20,
            "evidence": [],
            "note": "GNews API key not provided",
        }

    try:
        url = "https://gnews.io/api/v4/search"
        params = {"q": query[:200], "lang": "en", "apikey": api_key}
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        articles = data.get("articles", [])
        total_articles = data.get("totalArticles", 0)

        if not articles:
            if total_articles > 0:
                scores = [70.0]
                parsed_claims = [
                    {
                        "text": f"GNews index shows {total_articles} matching articles",
                        "claimant": "GNews Search",
                        "rating": "News Coverage",
                        "rating_score": 70,
                        "publisher": "GNews Search",
                    }
                ]
                import urllib.parse
                search_url = f"https://news.google.com/search?q={urllib.parse.quote(query)}"
                evidence = [
                    {
                        "publisher": "Google News",
                        "url": search_url,
                        "rating": f"News Coverage ({total_articles} articles found)",
                    }
                ]
                bonus = min(total_articles * 5, 15)
                average_score = 70.0 + bonus
                average_score = min(average_score, 95.0)

                return {
                    "claims_found": 1,
                    "claims": parsed_claims,
                    "average_score": round(average_score, 1),
                    "evidence": evidence,
                }
            else:
                return {
                    "claims_found": 0,
                    "claims": [],
                    "average_score": 20,
                    "evidence": [],
                    "note": "No news coverage found",
                }

        scores: List[float] = []
        parsed_claims: List[Dict] = []
        evidence: List[Dict] = []

        for article in articles:
            title = article.get("title", "")
            article_url = article.get("url", "")
            source_name = article.get("source", {}).get("name", "Unknown Source")
            source_url = article.get("source", {}).get("url", "")

            # Get domain from article URL or source URL
            url_to_parse = article_url or source_url
            domain = ""
            if url_to_parse:
                try:
                    parsed = urlparse(url_to_parse)
                    domain = parsed.netloc or parsed.path
                    if domain.startswith("www."):
                        domain = domain[4:]
                except Exception:
                    pass

            # Calculate source credibility score
            src_score = get_source_score(domain) if domain else 50
            scores.append(src_score)

            # Map GNews results to parsed_claims and evidence format
            parsed_claims.append(
                {
                    "text": title,
                    "claimant": source_name,
                    "rating": "News Coverage",
                    "rating_score": src_score,
                    "publisher": source_name,
                }
            )

            evidence.append(
                {
                    "publisher": source_name,
                    "url": article_url,
                    "rating": f"News Coverage (Credibility: {src_score}%)",
                }
            )

        # Average of source credibility scores
        avg_src_score = sum(scores) / len(scores) if scores else 50.0

        # Add bonus: +5 per article found, max +15
        bonus = min(len(articles) * 5, 15)
        average_score = avg_src_score + bonus

        # Cap the average score at 95
        average_score = min(average_score, 95.0)
        average_score = round(average_score, 1)

        return {
            "claims_found": len(parsed_claims),
            "claims": parsed_claims,
            "average_score": average_score,
            "evidence": evidence,
        }

    except requests.RequestException as exc:
        logger.warning("GNews API request failed: %s", exc)
        return {
            "claims_found": 0,
            "claims": [],
            "average_score": 20,
            "evidence": [],
            "note": f"GNews API request error: {str(exc)}",
        }
    except Exception as exc:
        logger.error("Unexpected error in GNews check: %s", exc)
        return {
            "claims_found": 0,
            "claims": [],
            "average_score": 20,
            "evidence": [],
            "note": f"Unexpected error in GNews coverage: {str(exc)}",
        }


def check_facts(
    query: str,
    api_key: Optional[str] = None,
    gnews_api_key: Optional[str] = None,
) -> Dict:
    """Query Google Fact Check Tools API for existing fact-checks with GNews fallback.

    Args:
        query: Search query (typically the claim or headline).
        api_key: Google API key. If None, falls back to GNews or returns a neutral score.
        gnews_api_key: GNews API key for fallback real-time news coverage checks.

    Returns:
        Dict with claims_found, claims list, average_score, and evidence.
    """
    query = query.replace('\\', '').strip()
    if not api_key:
        if gnews_api_key:
            return check_news_coverage(query, gnews_api_key)
        return {
            "claims_found": 0,
            "claims": [],
            "average_score": 50,
            "evidence": [],
            "note": "Fact-check API not configured",
        }

    try:
        params = {"query": query[:200], "key": api_key}
        response = requests.get(_FACT_CHECK_API_URL, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        raw_claims = data.get("claims", [])
        if not raw_claims:
            if gnews_api_key:
                return check_news_coverage(query, gnews_api_key)
            return {
                "claims_found": 0,
                "claims": [],
                "average_score": 50,
                "evidence": [],
                "note": "No matching fact-checks found",
            }

        parsed_claims: List[Dict] = []
        scores: List[float] = []
        evidence: List[Dict] = []

        for claim in raw_claims:
            claim_text = claim.get("text", "")
            claimant = claim.get("claimant", "Unknown")

            reviews = claim.get("claimReview", [])
            for review in reviews:
                rating = review.get("textualRating", "")
                publisher = review.get("publisher", {}).get("name", "Unknown")
                review_url = review.get("url", "")

                # Map textual ratings to numeric scores
                score = _rating_to_score(rating)
                scores.append(score)

                parsed_claims.append(
                    {
                        "text": claim_text,
                        "claimant": claimant,
                        "rating": rating,
                        "rating_score": score,
                        "publisher": publisher,
                    }
                )

                evidence.append(
                    {
                        "publisher": publisher,
                        "url": review_url,
                        "rating": rating,
                    }
                )

        average_score = round(sum(scores) / len(scores), 1) if scores else 50

        return {
            "claims_found": len(parsed_claims),
            "claims": parsed_claims,
            "average_score": average_score,
            "evidence": evidence,
        }

    except requests.RequestException as exc:
        logger.warning("Fact-check API request failed: %s", exc)
        if gnews_api_key:
            return check_news_coverage(query, gnews_api_key)
        return {
            "claims_found": 0,
            "claims": [],
            "average_score": 50,
            "evidence": [],
            "note": f"Fact-check API error: {str(exc)}",
        }
    except Exception as exc:
        logger.error("Unexpected error in fact checker: %s", exc)
        if gnews_api_key:
            return check_news_coverage(query, gnews_api_key)
        return {
            "claims_found": 0,
            "claims": [],
            "average_score": 50,
            "evidence": [],
            "note": f"Unexpected error: {str(exc)}",
        }


def _rating_to_score(rating: str) -> float:
    """Map a textual fact-check rating to a 0-100 credibility score."""
    rating_lower = rating.lower().strip()

    # True / confirmed ratings
    if any(
        w in rating_lower
        for w in ["true", "correct", "accurate", "confirmed", "सही", "सत्य", "सच", "तथ्य", "ठीक"]
    ):
        # Check it's not "mostly true" or "half true" first
        if any(
            w in rating_lower
            for w in ["mostly", "half", "partly", "partially", "ज्यादातर", "मुख्य रूप से", "आधा"]
        ):
            pass  # Fall through to more specific checks below
        else:
            return 90.0

    # Mostly true
    if any(
        w in rating_lower
        for w in ["mostly true", "mostly correct", "mostly accurate", "ज्यादातर सही", "मुख्य रूप से सही"]
    ):
        return 75.0

    # Mixed / half true
    if any(
        w in rating_lower
        for w in ["half true", "mixed", "partly", "partially", "आधा सच", "अर्धसत्य", "मिश्रित"]
    ):
        return 50.0

    # Mostly false
    if any(
        w in rating_lower for w in ["mostly false", "mostly incorrect", "ज्यादातर गलत", "मुख्य रूप से गलत"]
    ):
        return 25.0

    # False / debunked
    if any(
        w in rating_lower
        for w in [
            "false",
            "incorrect",
            "wrong",
            "debunked",
            "pants on fire",
            "गलत",
            "झूठ",
            "फेक",
            "भ्रामक",
            "मनगढ़ंत",
            "छेड़छाड़",
            "फेक न्यूज",
            "दावा गलत है"
        ]
    ):
        return 10.0

    # Default if rating text is unrecognised
    return 50.0

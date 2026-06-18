import json
import logging
from datetime import datetime, timezone
from typing import Dict, Optional
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup

from app.models.classifier import FakeNewsClassifier
from app.services.text_analyzer import analyze_text
from app.utils.scoring import get_source_score_from_url

logger = logging.getLogger(__name__)


def _extract_with_trafilatura(url: str) -> Optional[Dict]:
    """Attempt article extraction using trafilatura."""
    try:
        import trafilatura

        downloaded = trafilatura.fetch_url(url)
        if not downloaded:
            return None

        text = trafilatura.extract(
            downloaded,
            include_comments=False,
            include_tables=False,
        )
        if not text:
            return None

        metadata_json = trafilatura.extract(
            downloaded,
            include_comments=False,
            output_format="json",
            with_metadata=True,
        )

        title = ""
        author = ""
        if metadata_json:
            try:
                meta_dict = json.loads(metadata_json)
                title = meta_dict.get("title", "")
                author = meta_dict.get("author", "")
            except (json.JSONDecodeError, TypeError):
                pass

        return {
            "title": title,
            "text": text,
            "author": author,
        }
    except Exception as exc:
        logger.warning("trafilatura extraction failed: %s", exc)
        return None


def _extract_with_bs4(url: str) -> Optional[Dict]:
    """Fallback article extraction using requests + BeautifulSoup."""
    try:
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            )
        }
        resp = requests.get(url, headers=headers, timeout=15)
        resp.raise_for_status()

        soup = BeautifulSoup(resp.text, "html.parser")

        # Title
        title_tag = soup.find("title")
        title = title_tag.get_text(strip=True) if title_tag else ""

        # Author
        author_meta = soup.find("meta", attrs={"name": "author"})
        author = (
            author_meta["content"]
            if author_meta and author_meta.get("content")
            else ""
        )

        # Article body — try common selectors
        article_body = soup.find("article")
        if not article_body:
            article_body = soup.find("div", class_="article-body")
        if not article_body:
            article_body = soup.find("div", id="content")
        if not article_body:
            article_body = soup.body

        if article_body:
            for tag in article_body.find_all(
                ["script", "style", "nav", "footer", "header"]
            ):
                tag.decompose()
            text = article_body.get_text(separator=" ", strip=True)
        else:
            text = ""

        if not text:
            return None

        return {
            "title": title,
            "text": text,
            "author": author,
        }
    except Exception as exc:
        logger.warning("BS4 extraction failed: %s", exc)
        return None


def analyze_url(
    url: str,
    classifier: FakeNewsClassifier,
    fact_check_api_key: Optional[str] = None,
    gnews_api_key: Optional[str] = None,
) -> Dict:
    """Extract an article from a URL and run full verification."""
    # Extract domain
    try:
        parsed = urlparse(url)
        domain = parsed.netloc
        if domain.startswith("www."):
            domain = domain[4:]
    except Exception:
        domain = ""

    # Try trafilatura first, fall back to BS4
    extracted = _extract_with_trafilatura(url)
    if not extracted:
        extracted = _extract_with_bs4(url)

    if not extracted or not extracted.get("text"):
        return {
            "status": "error",
            "message": "Failed to extract article content from the URL.",
            "url": url,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    # Run text analysis with source domain
    result = analyze_text(
        text=extracted["text"],
        classifier=classifier,
        source_name=domain,
        fact_check_api_key=fact_check_api_key,
        gnews_api_key=gnews_api_key,
    )

    # Enrich with URL-specific metadata
    result["input_type"] = "url"
    result["url"] = url
    result["extracted_metadata"] = {
        "title": extracted.get("title", ""),
        "author": extracted.get("author", ""),
        "domain": domain,
        "source_credibility": get_source_score_from_url(url),
    }

    return result

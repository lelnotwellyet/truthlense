import re
import unicodedata
from typing import List

# Verbs that often introduce factual claims
_CLAIM_VERBS = re.compile(
    r"\b(is|are|was|were|has|have|had|will|would|could|should|must|shall|"
    r"said|stated|claimed|reported|announced|confirmed|denied|revealed|"
    r"showed|found|discovered|proved|demonstrated|caused|resulted|led to|"
    r"according to|studies show|research indicates|data suggests|experts say|"
    r"increased|decreased|rose|fell|dropped|surged|declined)\b",
    re.IGNORECASE,
)

_HTML_TAG_RE = re.compile(r"<[^>]+>")
_URL_RE = re.compile(r"https?://\S+|www\.\S+")
_SPECIAL_CHAR_RE = re.compile(r"[^\w\s.,!?;:'\"\-]")
_WHITESPACE_RE = re.compile(r"\s+")


def clean_text(text: str) -> str:
    """Clean raw text for analysis.

    Removes HTML tags, URLs, excessive whitespace, and special characters.
    Normalises unicode to NFC form.
    """
    if not text:
        return ""

    # Normalize unicode
    text = unicodedata.normalize("NFC", text)

    # Strip HTML tags
    text = _HTML_TAG_RE.sub(" ", text)

    # Strip URLs
    text = _URL_RE.sub("", text)

    # Keep letters, numbers, spaces (including newlines/tabs), marks (combining vowels), and punctuation.
    # This prevents non-Latin characters and sentence markers from being stripped.
    filtered_chars = []
    for char in text:
        cat = unicodedata.category(char)
        if cat[0] in ("L", "N", "Z", "M", "P") or char.isspace():
            filtered_chars.append(char)

    text = "".join(filtered_chars)

    # Collapse whitespace
    text = _WHITESPACE_RE.sub(" ", text).strip()

    return text


def extract_claims(text: str) -> List[str]:
    """Extract sentences that appear to make factual claims.

    Uses a simple heuristic: a sentence is considered a claim if it
    contains one of the common factual / assertion verbs.
    """
    if not text:
        return []

    # Split into sentences (simple rule-based splitter)
    sentences = re.split(r"(?<=[.!?])\s+", text)
    claims: List[str] = []

    for sentence in sentences:
        sentence = sentence.strip()
        if len(sentence) < 15:
            continue
        if _CLAIM_VERBS.search(sentence):
            claims.append(sentence)

    return claims

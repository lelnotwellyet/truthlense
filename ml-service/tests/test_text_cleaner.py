"""Tests for app.utils.text_cleaner module."""

import pytest

from app.utils.text_cleaner import clean_text, extract_claims


# ---- clean_text ----


class TestCleanTextHTML:
    """HTML tag removal."""

    def test_simple_html_tags(self):
        raw = "<p>Hello <b>world</b></p>"
        assert clean_text(raw) == "Hello world"

    def test_nested_html(self):
        raw = "<div><span>Some <em>text</em></span></div>"
        result = clean_text(raw)
        assert "<" not in result
        assert "Some" in result
        assert "text" in result

    def test_html_with_attributes(self):
        raw = '<a href="http://example.com">link text</a>'
        result = clean_text(raw)
        assert "link text" in result
        assert "<a" not in result


class TestCleanTextURLs:
    """URL removal."""

    def test_http_url(self):
        raw = "Visit https://example.com for more."
        result = clean_text(raw)
        assert "https://example.com" not in result
        assert "Visit" in result
        assert "for more." in result

    def test_www_url(self):
        raw = "See www.example.com/page for details."
        result = clean_text(raw)
        assert "www.example.com" not in result

    def test_multiple_urls(self):
        raw = "Check https://a.com and https://b.com today."
        result = clean_text(raw)
        assert "https://a.com" not in result
        assert "https://b.com" not in result


class TestCleanTextWhitespace:
    """Excessive whitespace normalization."""

    def test_multiple_spaces(self):
        raw = "Hello    world"
        assert clean_text(raw) == "Hello world"

    def test_newlines_and_tabs(self):
        raw = "Hello\n\n\tworld"
        assert clean_text(raw) == "Hello world"

    def test_leading_trailing(self):
        raw = "   Hello world   "
        assert clean_text(raw) == "Hello world"


class TestCleanTextEdgeCases:
    """Edge cases."""

    def test_empty_string(self):
        assert clean_text("") == ""

    def test_none_value(self):
        assert clean_text(None) == ""

    def test_only_html(self):
        raw = "<div><br/></div>"
        result = clean_text(raw)
        assert result == ""


# ---- extract_claims ----


class TestExtractClaims:
    """Claim extraction heuristic tests."""

    def test_claim_sentence(self):
        text = "The vaccine is safe and effective. The weather is nice today."
        claims = extract_claims(text)
        # "is" appears in the first sentence – should be extracted
        assert any("vaccine" in c for c in claims)

    def test_no_claims(self):
        text = "Hello. Wow."
        claims = extract_claims(text)
        # Both sentences are < 15 chars, so nothing qualifies
        assert claims == []

    def test_empty_input(self):
        assert extract_claims("") == []

    def test_multiple_claims(self):
        text = (
            "Studies show that exercise improves health. "
            "The CEO announced record profits. "
            "The color blue exists."
        )
        claims = extract_claims(text)
        assert len(claims) >= 2

    def test_short_sentences_ignored(self):
        text = "It is hot. That was bad."
        claims = extract_claims(text)
        assert claims == []

"""Unit tests for string truncation utilities."""

import pytest

from src.app.helpers.truncate import truncate


def test_truncate_string_shorter_than_limit():
    """Test that strings shorter than limit are returned unchanged."""
    assert truncate("hello", 10) == "hello"


def test_truncate_string_equal_to_limit():
    """Test that strings equal to limit are returned unchanged."""
    assert truncate("hello", 5) == "hello"


def test_truncate_string_longer_than_limit():
    """Test that strings longer than limit are truncated with ellipsis."""
    assert truncate("hello world", 5) == "hell…"


def test_truncate_empty_string():
    """Test that empty strings are handled correctly."""
    assert truncate("", 10) == ""


def test_truncate_single_character():
    """Test that single character strings are handled correctly."""
    assert truncate("a", 1) == "a"


def test_truncate_with_limit_one():
    """Test truncation with n=1 results in just an ellipsis."""
    assert truncate("hello", 1) == "…"


def test_truncate_with_limit_two():
    """Test truncation with n=2 results in one character plus ellipsis."""
    assert truncate("hello", 2) == "h…"


def test_truncate_long_string():
    """Test truncation of a long string."""
    long_string = "The quick brown fox jumps over the lazy dog"
    assert truncate(long_string, 10) == "The quick…"


def test_truncate_preserves_original_for_exact_length():
    """Test that original string is preserved when length equals limit."""
    test_string = "exact"
    assert truncate(test_string, len(test_string)) == test_string


def test_truncate_with_special_characters():
    """Test truncation with special characters in the string."""
    assert truncate("hello@world!test", 8) == "hello@w…"


def test_truncate_with_spaces():
    """Test truncation handles spaces correctly."""
    assert truncate("hello   world", 7) == "hello …"


def test_truncate_with_unicode_characters():
    """Test truncation with unicode characters."""
    assert truncate("café résumé", 5) == "café…"


def test_truncate_large_limit():
    """Test truncation with limit much larger than string."""
    test_string = "short"
    assert truncate(test_string, 1000) == test_string


def test_truncate_ellipsis_included_in_limit():
    """Test that ellipsis is included in the total length limit."""
    result = truncate("hello world", 6)
    assert len(result) == 6
    assert result == "hello…"

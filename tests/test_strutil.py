"""Tests for the strutil module."""

from src.app.strutil import to_upper


def test_to_upper_with_lowercase_string():
    """Test that to_upper converts lowercase letters to uppercase."""
    assert to_upper("abc") == "ABC"


def test_to_upper_with_empty_string():
    """Test that to_upper returns empty string for empty input."""
    assert to_upper("") == ""


def test_to_upper_with_mixed_case():
    """Test that to_upper converts mixed case strings correctly."""
    assert to_upper("Hello World") == "HELLO WORLD"


def test_to_upper_with_uppercase():
    """Test that to_upper handles already uppercase strings."""
    assert to_upper("ABC") == "ABC"


def test_to_upper_with_numbers_and_special_chars():
    """Test that to_upper handles numbers and special characters."""
    assert to_upper("abc123!@#") == "ABC123!@#"

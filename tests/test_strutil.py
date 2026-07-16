"""Tests for the strutil module."""

from src.app.strutil import to_title


def test_to_title_capitalizes_words():
    """Test that to_title capitalizes the first letter of each word."""
    assert to_title("hello world") == "Hello World"


def test_to_title_empty_string():
    """Test that to_title returns empty string for empty input."""
    assert to_title("") == ""

"""Unit tests for strutil module."""

from src.app.strutil import to_title


def test_to_title_with_normal_string():
    """Test to_title with a normal string."""
    result = to_title("hello world")
    assert result == "Hello World"


def test_to_title_with_empty_string():
    """Test to_title with an empty string."""
    result = to_title("")
    assert result == ""

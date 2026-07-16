"""Unit tests for the strutil module."""

from src.app.strutil import to_snake


def test_camel_case_conversion():
    """Test that to_snake() converts camelCase to snake_case."""
    assert to_snake("HelloWorld") == "hello_world"


def test_space_separated_conversion():
    """Test that to_snake() converts space-separated words to snake_case."""
    assert to_snake("hello world") == "hello_world"


def test_empty_string():
    """Test that to_snake() returns empty string for empty input."""
    assert to_snake("") == ""


def test_already_snake_case():
    """Test that to_snake() preserves already snake_case strings."""
    assert to_snake("hello_world") == "hello_world"


def test_single_word():
    """Test that to_snake() handles single word input."""
    assert to_snake("hello") == "hello"

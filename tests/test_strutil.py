"""Tests for the strutil module."""

from src.app.strutil import to_lower, to_upper


class TestToUpper:
    """Tests for the to_upper function."""

    def test_to_upper_converts_lowercase_to_uppercase(self):
        """Test that to_upper converts lowercase letters to uppercase."""
        assert to_upper("abc") == "ABC"

    def test_to_upper_empty_string(self):
        """Test that to_upper returns empty string for empty input."""
        assert to_upper("") == ""

    def test_to_upper_mixed_case(self):
        """Test that to_upper converts all letters to uppercase."""
        assert to_upper("Hello World") == "HELLO WORLD"

    def test_to_upper_already_uppercase(self):
        """Test that to_upper handles already uppercase input."""
        assert to_upper("ABC") == "ABC"


class TestToLower:
    """Tests for the to_lower function."""

    def test_to_lower_converts_uppercase_to_lowercase(self):
        """Test that to_lower converts uppercase letters to lowercase."""
        assert to_lower("ABC") == "abc"

    def test_to_lower_empty_string(self):
        """Test that to_lower returns empty string for empty input."""
        assert to_lower("") == ""

    def test_to_lower_mixed_case(self):
        """Test that to_lower converts all letters to lowercase."""
        assert to_lower("Hello World") == "hello world"

    def test_to_lower_already_lowercase(self):
        """Test that to_lower handles already lowercase input."""
        assert to_lower("abc") == "abc"

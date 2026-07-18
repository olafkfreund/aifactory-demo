"""Unit tests for the slugify helper function."""

import pytest

from src.app.helpers.slugify import slugify


class TestSlugify:
    """Tests for the slugify function."""

    def test_slugify_basic_case(self):
        """Test basic slugify with uppercase and spaces."""
        result = slugify("  Hello   World  ")
        assert result == "hello-world"

    def test_slugify_lowercase(self):
        """Test that slugify correctly lowercases input."""
        result = slugify("HELLO")
        assert result == "hello"

    def test_slugify_with_special_characters(self):
        """Test that slugify replaces special characters with hyphens."""
        result = slugify("Hello-World!")
        assert result == "hello-world"

    def test_slugify_multiple_special_characters(self):
        """Test that runs of special characters are replaced with single hyphen."""
        result = slugify("Hello!!!World")
        assert result == "hello-world"

    def test_slugify_with_underscores(self):
        """Test that underscores are replaced with hyphens."""
        result = slugify("Hello_World")
        assert result == "hello-world"

    def test_slugify_with_numbers(self):
        """Test that numbers are preserved."""
        result = slugify("Hello123World")
        assert result == "hello123world"

    def test_slugify_leading_trailing_spaces(self):
        """Test that leading and trailing spaces are trimmed."""
        result = slugify("   hello world   ")
        assert result == "hello-world"

    def test_slugify_leading_trailing_special_chars(self):
        """Test that leading and trailing hyphens are removed."""
        result = slugify("-hello-world-")
        assert result == "hello-world"

    def test_slugify_empty_string(self):
        """Test that empty string returns empty string."""
        result = slugify("")
        assert result == ""

    def test_slugify_only_spaces(self):
        """Test that string with only spaces returns empty."""
        result = slugify("   ")
        assert result == ""

    def test_slugify_only_special_chars(self):
        """Test that string with only special chars returns empty."""
        result = slugify("!!!")
        assert result == ""

    def test_slugify_mixed_case_with_numbers(self):
        """Test mixed case with numbers."""
        result = slugify("Hello World 123 Test")
        assert result == "hello-world-123-test"

    def test_slugify_with_dots(self):
        """Test that dots are replaced."""
        result = slugify("Hello.World.Test")
        assert result == "hello-world-test"

    def test_slugify_with_multiple_hyphens(self):
        """Test that multiple hyphens are collapsed to single hyphen."""
        result = slugify("Hello---World")
        assert result == "hello-world"

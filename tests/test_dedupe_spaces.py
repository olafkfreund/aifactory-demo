"""Tests for dedupe_spaces module."""

import pytest

from src.app.dedupe_spaces import dedupe_spaces


class TestDedupeSpaces:
    """Test suite for dedupe_spaces function."""

    def test_basic_collapse(self) -> None:
        """Test basic whitespace collapsing and stripping."""
        assert dedupe_spaces("  hello   world  ") == "hello world"

    def test_single_word(self) -> None:
        """Test single word without extra spaces."""
        assert dedupe_spaces("hello") == "hello"

    def test_empty_string(self) -> None:
        """Test empty string returns empty."""
        assert dedupe_spaces("") == ""

    def test_only_spaces(self) -> None:
        """Test string with only spaces returns empty."""
        assert dedupe_spaces("     ") == ""

    def test_leading_spaces(self) -> None:
        """Test that leading spaces are stripped."""
        assert dedupe_spaces("   hello") == "hello"

    def test_trailing_spaces(self) -> None:
        """Test that trailing spaces are stripped."""
        assert dedupe_spaces("hello   ") == "hello"

    def test_leading_and_trailing_spaces(self) -> None:
        """Test that both leading and trailing spaces are stripped."""
        assert dedupe_spaces("   hello   ") == "hello"

    def test_multiple_words(self) -> None:
        """Test multiple words with varied spacing."""
        assert dedupe_spaces("hello    world    foo") == "hello world foo"

    def test_tabs_collapsed(self) -> None:
        """Test that tabs are collapsed to single space."""
        assert dedupe_spaces("hello\t\t\tworld") == "hello world"

    def test_newlines_collapsed(self) -> None:
        """Test that newlines are collapsed to single space."""
        assert dedupe_spaces("hello\n\nworld") == "hello world"

    def test_mixed_whitespace(self) -> None:
        """Test mixed whitespace types are collapsed."""
        assert dedupe_spaces("hello \t\n world") == "hello world"

    def test_preserved_internal_structure(self) -> None:
        """Test that word order and content are preserved."""
        assert dedupe_spaces("  one  two  three  ") == "one two three"

    def test_special_characters_preserved(self) -> None:
        """Test that special characters are preserved."""
        assert dedupe_spaces("  hello,  world!  ") == "hello, world!"

    def test_numbers_preserved(self) -> None:
        """Test that numbers are preserved."""
        assert dedupe_spaces("  123  456  ") == "123 456"

    def test_single_space_unchanged(self) -> None:
        """Test that proper spacing is unchanged."""
        assert dedupe_spaces("hello world") == "hello world"

    def test_very_long_text(self) -> None:
        """Test with longer text with varied spacing."""
        text = "   The   quick   brown   fox   jumps   "
        assert dedupe_spaces(text) == "The quick brown fox jumps"

    def test_windows_line_endings(self) -> None:
        """Test Windows line endings (\\r\\n) are handled."""
        assert dedupe_spaces("hello\r\nworld") == "hello world"

    def test_unicode_spaces(self) -> None:
        """Test that standard unicode spaces work."""
        assert dedupe_spaces("hello   world") == "hello world"

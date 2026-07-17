"""Tests for word_reverse module."""

import pytest

from src.app.word_reverse import word_reverse


class TestWordReverse:
    """Test suite for word_reverse function."""

    def test_basic_two_words(self) -> None:
        """Test basic case with two words."""
        assert word_reverse("abc def") == "cba fed"

    def test_single_word(self) -> None:
        """Test single word reversal."""
        assert word_reverse("hello") == "olleh"

    def test_empty_string(self) -> None:
        """Test empty string returns empty."""
        assert word_reverse("") == ""

    def test_single_character(self) -> None:
        """Test single character."""
        assert word_reverse("a") == "a"

    def test_multiple_words(self) -> None:
        """Test multiple words."""
        assert word_reverse("one two three") == "eno owt eerht"

    def test_words_with_special_characters(self) -> None:
        """Test words containing special characters."""
        assert word_reverse("hello! world?") == "!olleh ?dlrow"

    def test_words_with_numbers(self) -> None:
        """Test words containing numbers."""
        assert word_reverse("abc123 def456") == "321cba 654fed"

    def test_multiple_spaces_between_words(self) -> None:
        """Test that multiple spaces are normalized to single space."""
        assert word_reverse("hello    world") == "olleh dlrow"

    def test_leading_trailing_spaces(self) -> None:
        """Test that leading/trailing spaces are stripped."""
        assert word_reverse("  hello world  ") == "olleh dlrow"

    def test_tabs_and_newlines(self) -> None:
        """Test that tabs and newlines act as word separators."""
        assert word_reverse("hello\tworld") == "olleh dlrow"
        assert word_reverse("hello\nworld") == "olleh dlrow"

    def test_palindrome(self) -> None:
        """Test palindromic words."""
        assert word_reverse("radar") == "radar"

    def test_case_sensitivity(self) -> None:
        """Test that case is preserved."""
        assert word_reverse("ABC def") == "CBA fed"

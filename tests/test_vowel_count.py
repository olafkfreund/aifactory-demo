"""Tests for vowel_count module."""

import pytest

from src.app.vowel_count import vowel_count


class TestVowelCount:
    """Test suite for vowel_count function."""

    def test_basic_count(self) -> None:
        """Test basic vowel counting."""
        assert vowel_count("hello") == 2

    def test_all_vowels_lowercase(self) -> None:
        """Test string with all vowels lowercase."""
        assert vowel_count("aeiou") == 5

    def test_empty_string(self) -> None:
        """Test empty string returns 0."""
        assert vowel_count("") == 0

    def test_no_vowels(self) -> None:
        """Test string with no vowels."""
        assert vowel_count("bcdfg") == 0
        assert vowel_count("xyz") == 0

    def test_all_vowels_uppercase(self) -> None:
        """Test string with all vowels uppercase."""
        assert vowel_count("AEIOU") == 5

    def test_mixed_case_vowels(self) -> None:
        """Test mixed case vowels are counted."""
        assert vowel_count("AeIoU") == 5
        assert vowel_count("Hello World") == 3

    def test_vowels_with_special_characters(self) -> None:
        """Test vowels among special characters."""
        assert vowel_count("h3llo!") == 1  # 'o' is the only vowel
        assert vowel_count("a!e@i#o$u%") == 5

    def test_vowels_with_numbers(self) -> None:
        """Test vowels among numbers."""
        assert vowel_count("a1e2i3o4u5") == 5
        assert vowel_count("123456") == 0

    def test_single_vowel(self) -> None:
        """Test single vowel."""
        assert vowel_count("a") == 1
        assert vowel_count("E") == 1

    def test_single_consonant(self) -> None:
        """Test single consonant."""
        assert vowel_count("b") == 0

    def test_whitespace_handling(self) -> None:
        """Test that whitespace doesn't count as vowels."""
        assert vowel_count("   ") == 0
        assert vowel_count("a e i") == 3

    def test_newlines_and_tabs(self) -> None:
        """Test that newlines and tabs don't count as vowels."""
        assert vowel_count("a\ne\ti") == 3

    def test_long_text(self) -> None:
        """Test with longer text."""
        text = "The quick brown fox jumps over the lazy dog"
        # Count: e, u, i, o, o, e, a, o
        assert vowel_count(text) == 11

    def test_repeated_vowels(self) -> None:
        """Test repeated vowels are all counted."""
        assert vowel_count("aaa") == 3
        assert vowel_count("aaabbbccc") == 3

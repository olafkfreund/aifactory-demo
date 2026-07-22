"""Tests for the reverse_string helper function."""

import pytest

from app.helpers.reverse_string import reverse_string


class TestReverseStringBasic:
    """Test basic reverse_string functionality."""

    def test_empty_string(self):
        """Test that empty string returns empty string."""
        assert reverse_string("") == ""

    def test_single_character(self):
        """Test that single character returns itself."""
        assert reverse_string("a") == "a"

    def test_simple_string(self):
        """Test reversing a simple string."""
        assert reverse_string("abc") == "cba"

    def test_hello_world(self):
        """Test reversing 'hello'."""
        assert reverse_string("hello") == "olleh"


class TestReverseStringEdgeCases:
    """Test edge cases for reverse_string."""

    def test_two_characters(self):
        """Test reversing two characters."""
        assert reverse_string("ab") == "ba"

    def test_spaces_preserved(self):
        """Test that spaces are preserved and reversed."""
        assert reverse_string("hello world") == "dlrow olleh"

    def test_multiple_spaces(self):
        """Test multiple spaces are preserved."""
        assert reverse_string("a  b") == "b  a"

    def test_leading_spaces(self):
        """Test leading spaces are moved to end."""
        assert reverse_string("  hello") == "olleh  "

    def test_trailing_spaces(self):
        """Test trailing spaces are moved to start."""
        assert reverse_string("hello  ") == "  olleh"


class TestReverseStringSpecialCharacters:
    """Test reverse_string with special characters."""

    def test_punctuation(self):
        """Test string with punctuation."""
        assert reverse_string("hello!") == "!olleh"

    def test_numbers(self):
        """Test string with numbers."""
        assert reverse_string("abc123") == "321cba"

    def test_mixed_special_chars(self):
        """Test string with mixed special characters."""
        assert reverse_string("a@b#c$") == "$c#b@a"

    def test_newline_character(self):
        """Test string with newline character."""
        assert reverse_string("hello\nworld") == "dlrow\nolleh"

    def test_tab_character(self):
        """Test string with tab character."""
        assert reverse_string("hello\tworld") == "dlrow\tolleh"


class TestReverseStringUnicode:
    """Test reverse_string with unicode characters."""

    def test_unicode_emoji(self):
        """Test string with emoji."""
        assert reverse_string("hello😀") == "😀olleh"

    def test_unicode_accented_characters(self):
        """Test string with accented characters."""
        assert reverse_string("café") == "éfac"

    def test_unicode_chinese_characters(self):
        """Test string with Chinese characters."""
        assert reverse_string("你好") == "好你"

    def test_unicode_mixed(self):
        """Test string with mixed ASCII and unicode."""
        assert reverse_string("hello你好") == "好你olleh"

    def test_unicode_symbols(self):
        """Test string with unicode symbols."""
        assert reverse_string("€¥£") == "£¥€"


class TestReverseStringLongStrings:
    """Test reverse_string with longer strings."""

    def test_longer_string(self):
        """Test reversing a longer string."""
        original = "The quick brown fox jumps over the lazy dog"
        expected = "god yzal eht revo spmuj xof nworb kciuq ehT"
        assert reverse_string(original) == expected

    def test_repeated_pattern(self):
        """Test reversing a string with repeated pattern."""
        assert reverse_string("ababab") == "bababa"

    def test_palindrome_returns_same(self):
        """Test that palindromes reverse to themselves."""
        assert reverse_string("racecar") == "racecar"

    def test_very_long_string(self):
        """Test reversing a very long string."""
        long_string = "a" * 1000
        assert reverse_string(long_string) == long_string

    def test_long_string_with_pattern(self):
        """Test reversing a long string with pattern."""
        original = "abc" * 100
        expected = "cba" * 100
        assert reverse_string(original) == expected


class TestReverseStringProperties:
    """Test mathematical properties of reverse_string."""

    def test_reverse_twice_returns_original(self):
        """Test that reversing twice returns original."""
        original = "hello"
        assert reverse_string(reverse_string(original)) == original

    def test_reverse_twice_empty_string(self):
        """Test that reversing empty string twice returns empty."""
        assert reverse_string(reverse_string("")) == ""

    def test_reverse_twice_single_char(self):
        """Test that reversing single char twice returns original."""
        assert reverse_string(reverse_string("a")) == "a"

    def test_reverse_with_unicode_symmetry(self):
        """Test reversing unicode strings maintains symmetry."""
        original = "你好世界"
        reversed_str = reverse_string(original)
        assert reverse_string(reversed_str) == original

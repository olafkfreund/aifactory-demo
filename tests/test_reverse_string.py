"""Comprehensive tests for the reverse_string helper function."""

from app.helpers import reverse_string


class TestReverseStringBasic:
    """Basic acceptance criteria tests for reverse_string."""

    def test_reverse_empty_string(self):
        """Test that empty string returns empty string."""
        assert reverse_string("") == ""

    def test_reverse_single_character(self):
        """Test that single character returns itself."""
        assert reverse_string("a") == "a"

    def test_reverse_three_characters(self):
        """Test reversal of three-character string."""
        assert reverse_string("abc") == "cba"

    def test_reverse_hello_world(self):
        """Test reversal of 'hello' to 'olleh'."""
        assert reverse_string("hello") == "olleh"


class TestReverseStringExtended:
    """Extended tests for edge cases and additional scenarios."""

    def test_reverse_palindrome(self):
        """Test that palindromes return themselves."""
        assert reverse_string("racecar") == "racecar"
        assert reverse_string("level") == "level"

    def test_reverse_spaces(self):
        """Test that spaces are correctly preserved."""
        assert reverse_string("hello world") == "dlrow olleh"
        assert reverse_string("a b c") == "c b a"

    def test_reverse_special_characters(self):
        """Test that special characters are correctly reversed."""
        assert reverse_string("hello!") == "!olleh"
        assert reverse_string("a-b-c") == "c-b-a"
        assert reverse_string("(hello)") == ")olleh("

    def test_reverse_numbers(self):
        """Test that numbers are correctly reversed."""
        assert reverse_string("12345") == "54321"
        assert reverse_string("abc123") == "321cba"

    def test_reverse_mixed_case(self):
        """Test that case is preserved during reversal."""
        assert reverse_string("Hello") == "olleH"
        assert reverse_string("HeLLo") == "oLLeH"

    def test_reverse_unicode_characters(self):
        """Test that unicode characters are correctly handled."""
        assert reverse_string("café") == "éfac"
        assert reverse_string("日本語") == "語本日"
        assert reverse_string("🎉😀") == "😀🎉"
        assert reverse_string("hello👋world") == "dlrow👋olleh"

    def test_reverse_multiple_spaces(self):
        """Test strings with multiple consecutive spaces."""
        assert reverse_string("a  b") == "b  a"
        assert reverse_string("  test  ") == "  tset  "

    def test_reverse_very_long_string(self):
        """Test reversal of a very long string."""
        long_string = "a" * 1000
        assert reverse_string(long_string) == long_string

    def test_reverse_long_string_with_variation(self):
        """Test reversal of a longer string with different content."""
        test_string = "The quick brown fox jumps over the lazy dog"
        expected = "god yzal eht revo spmuj xof nworb kciuq ehT"
        assert reverse_string(test_string) == expected


class TestReverseStringProperties:
    """Test mathematical properties of the reverse_string function."""

    def test_double_reversal_returns_original(self):
        """Test that reversing twice returns the original string."""
        test_strings = ["", "a", "hello", "hello world!", "😀🎉"]
        for test_string in test_strings:
            assert reverse_string(reverse_string(test_string)) == test_string

    def test_length_preserved(self):
        """Test that string length is preserved after reversal."""
        test_strings = ["", "a", "hello", "hello world!", "café"]
        for test_string in test_strings:
            assert len(reverse_string(test_string)) == len(test_string)

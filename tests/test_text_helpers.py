"""Comprehensive test suite for text_helpers module."""

from src.app.text_helpers import word_count


class TestWordCountBasic:
    """Test basic word counting functionality."""

    def test_single_word(self) -> None:
        """Test counting a single word."""
        assert word_count("hello") == 1

    def test_multiple_words(self) -> None:
        """Test counting multiple words separated by spaces."""
        assert word_count("hello world") == 2

    def test_three_words(self) -> None:
        """Test counting three words."""
        assert word_count("hello world python") == 3

    def test_many_words(self) -> None:
        """Test counting many words."""
        text = "the quick brown fox jumps over the lazy dog"
        assert word_count(text) == 9


class TestWordCountEmptyAndWhitespace:
    """Test edge cases with empty strings and whitespace."""

    def test_empty_string(self) -> None:
        """Test that empty string returns 0."""
        assert word_count("") == 0

    def test_single_space(self) -> None:
        """Test that single space returns 0."""
        assert word_count(" ") == 0

    def test_multiple_spaces(self) -> None:
        """Test that multiple spaces return 0."""
        assert word_count("   ") == 0

    def test_many_spaces(self) -> None:
        """Test that many spaces return 0."""
        assert word_count("          ") == 0

    def test_whitespace_only_with_tabs(self) -> None:
        """Test that tabs-only string returns 0."""
        assert word_count("\t") == 0

    def test_whitespace_only_with_newlines(self) -> None:
        """Test that newlines-only string returns 0."""
        assert word_count("\n") == 0

    def test_mixed_whitespace_only(self) -> None:
        """Test that mixed whitespace-only string returns 0."""
        assert word_count(" \t\n ") == 0


class TestWordCountLeadingTrailingWhitespace:
    """Test handling of leading and trailing whitespace."""

    def test_leading_whitespace(self) -> None:
        """Test that leading whitespace is handled correctly."""
        assert word_count("  hello world") == 2

    def test_trailing_whitespace(self) -> None:
        """Test that trailing whitespace is handled correctly."""
        assert word_count("hello world  ") == 2

    def test_leading_and_trailing_whitespace(self) -> None:
        """Test that both leading and trailing whitespace are handled."""
        assert word_count("  hello world  ") == 2

    def test_leading_trailing_multiple_spaces(self) -> None:
        """Test multiple leading and trailing spaces."""
        assert word_count("    hello  world    ") == 2

    def test_leading_trailing_mixed_whitespace(self) -> None:
        """Test mixed whitespace at boundaries."""
        assert word_count(" \t hello \n world \t ") == 2


class TestWordCountMultipleWhitespaceTypes:
    """Test handling of different whitespace characters."""

    def test_space_separated_words(self) -> None:
        """Test words separated by spaces."""
        assert word_count("a b c") == 3

    def test_tab_separated_words(self) -> None:
        """Test words separated by tabs."""
        assert word_count("a\tb\tc") == 3

    def test_newline_separated_words(self) -> None:
        """Test words separated by newlines."""
        assert word_count("a\nb\nc") == 3

    def test_mixed_separator_whitespace(self) -> None:
        """Test words separated by different types of whitespace."""
        assert word_count("a b\tc\nd") == 4

    def test_multiple_consecutive_spaces(self) -> None:
        """Test multiple consecutive spaces between words."""
        assert word_count("hello   world") == 2

    def test_multiple_consecutive_tabs(self) -> None:
        """Test multiple consecutive tabs between words."""
        assert word_count("hello\t\t\tworld") == 2

    def test_multiple_consecutive_newlines(self) -> None:
        """Test multiple consecutive newlines between words."""
        assert word_count("hello\n\n\nworld") == 2

    def test_multiple_consecutive_mixed_whitespace(self) -> None:
        """Test multiple consecutive mixed whitespace characters."""
        assert word_count("hello \t\n world") == 2


class TestWordCountSpecialCases:
    """Test special and edge cases."""

    def test_single_character_word(self) -> None:
        """Test single character words."""
        assert word_count("a") == 1

    def test_multiple_single_characters(self) -> None:
        """Test multiple single character words."""
        assert word_count("a b c d e") == 5

    def test_long_word(self) -> None:
        """Test a long word."""
        long_word = "a" * 1000
        assert word_count(long_word) == 1

    def test_long_word_multiple(self) -> None:
        """Test multiple long words."""
        long_word = "a" * 1000
        assert word_count(f"{long_word} {long_word}") == 2

    def test_unicode_words(self) -> None:
        """Test Unicode characters are handled correctly."""
        assert word_count("hello 世界") == 2

    def test_unicode_multiple_words(self) -> None:
        """Test multiple Unicode words."""
        assert word_count("café naïve résumé") == 3

    def test_punctuation_attached_to_word(self) -> None:
        """Test punctuation attached to words is part of the word."""
        # Note: word_count doesn't strip punctuation, just counts split()
        assert word_count("hello, world!") == 2

    def test_words_with_apostrophe(self) -> None:
        """Test words with apostrophes."""
        assert word_count("don't can't won't") == 3

    def test_words_with_hyphens(self) -> None:
        """Test hyphenated words are counted as one word."""
        assert word_count("well-known state-of-the-art") == 2


class TestWordCountRealWorldExamples:
    """Test realistic text examples."""

    def test_sentence(self) -> None:
        """Test a simple sentence."""
        assert word_count("The quick brown fox jumps over the lazy dog") == 9

    def test_paragraph(self) -> None:
        """Test a paragraph with multiple sentences."""
        text = "This is a test. This has multiple words."
        assert word_count(text) == 8

    def test_multiline_text(self) -> None:
        """Test text with multiple lines."""
        text = """Line one has words
        Line two has more words
        Line three"""
        # "Line" (1) + "one" (2) + "has" (3) + "words" (4) +
        # "Line" (5) + "two" (6) + "has" (7) + "more" (8) + "words" (9) +
        # "Line" (10) + "three" (11)
        assert word_count(text) == 11

    def test_text_with_extra_spacing(self) -> None:
        """Test text with irregular spacing."""
        text = "Word1    Word2      Word3"
        assert word_count(text) == 3


class TestWordCountTypeHints:
    """Test that function handles expected input types correctly."""

    def test_accepts_string(self) -> None:
        """Test that function accepts string input."""
        result = word_count("hello")
        assert isinstance(result, int)

    def test_returns_integer(self) -> None:
        """Test that function returns an integer."""
        result = word_count("hello world")
        assert isinstance(result, int)
        assert result == 2


class TestWordCountCountAccuracy:
    """Test accuracy of word counts across various scenarios."""

    def test_count_matches_split_length(self) -> None:
        """Test word_count matches len(text.split()) for inputs."""
        test_cases = [
            "",
            "   ",
            "hello",
            "hello world",
            "a b c d e f g h i j",
            "  leading",
            "trailing  ",
            "  both  ",
            "\t\ttabs\t\t",
            "multi\n\nline",
            "mixed \t\n whitespace",
        ]
        for text in test_cases:
            assert word_count(text) == len(text.split())

    def test_non_zero_counts(self) -> None:
        """Test various non-zero counts."""
        test_cases = [
            ("a", 1),
            ("a b", 2),
            ("a b c", 3),
            ("a b c d", 4),
            ("a b c d e f g h i j", 10),
        ]
        for text, expected_count in test_cases:
            assert word_count(text) == expected_count

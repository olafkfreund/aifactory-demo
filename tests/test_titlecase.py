"""Comprehensive tests for the titlecase helper function."""

import pytest

from src.app.helpers.titlecase import titlecase


class TestTitlecaseBasicFunctionality:
    """Test basic titlecase functionality."""

    def test_empty_string_returns_empty(self):
        """Empty string should return empty string."""
        assert titlecase("") == ""

    def test_single_word(self):
        """Single word should be titlecased."""
        assert titlecase("hello") == "Hello"

    def test_single_word_already_titlecased(self):
        """Single word already titlecased should remain unchanged."""
        assert titlecase("Hello") == "Hello"

    def test_multiple_words(self):
        """Multiple words should each be titlecased."""
        assert titlecase("hello world") == "Hello World"

    def test_multiple_words_mixed_case(self):
        """Multiple mixed case words should be titlecased."""
        assert titlecase("hELLO wORLD tEST") == "Hello World Test"


class TestTitlecaseMixedCase:
    """Test titlecase with various mixed case inputs."""

    def test_all_uppercase_single_word(self):
        """All uppercase word should become titlecase."""
        assert titlecase("HELLO") == "Hello"

    def test_all_uppercase_multiple_words(self):
        """All uppercase words should become titlecase."""
        assert titlecase("HELLO WORLD") == "Hello World"

    def test_all_lowercase_single_word(self):
        """All lowercase word should become titlecase."""
        assert titlecase("hello") == "Hello"

    def test_all_lowercase_multiple_words(self):
        """All lowercase words should become titlecase."""
        assert titlecase("hello world") == "Hello World"

    def test_alternating_case(self):
        """Alternating case should be normalized to titlecase."""
        assert titlecase("HeLLo WoRLd") == "Hello World"


class TestTitlecaseEdgeCases:
    """Test edge cases and special scenarios."""

    def test_single_letter_words(self):
        """Single letter words should be uppercased."""
        assert titlecase("a b c") == "A B C"

    def test_mixed_single_and_multi_letter_words(self):
        """Mix of single and multi-letter words should work."""
        assert titlecase("i love python") == "I Love Python"

    def test_words_with_only_uppercase_letters(self):
        """Words with only uppercase letters should work."""
        assert titlecase("PYTHON JAVA GO") == "Python Java Go"

    def test_numeric_content(self):
        """Strings with numbers should work correctly."""
        assert titlecase("python3 is great") == "Python3 Is Great"

    def test_single_space_separated_words(self):
        """Standard single space separation should work."""
        assert titlecase("the quick brown fox") == "The Quick Brown Fox"

    def test_multiple_spaces_between_words(self):
        """Multiple spaces between words should be normalized to single space."""
        assert titlecase("hello  world") == "Hello World"

    def test_leading_spaces(self):
        """Leading spaces should be stripped by split()."""
        assert titlecase("  hello world") == "Hello World"

    def test_trailing_spaces(self):
        """Trailing spaces should be stripped by split()."""
        assert titlecase("hello world  ") == "Hello World"

    def test_tabs_as_whitespace(self):
        """Tabs should work as word separators."""
        assert titlecase("hello\tworld") == "Hello World"

    def test_newlines_as_whitespace(self):
        """Newlines should work as word separators."""
        assert titlecase("hello\nworld") == "Hello World"

    def test_mixed_whitespace(self):
        """Mixed whitespace characters should work."""
        assert titlecase("hello \t world\n test") == "Hello World Test"


class TestTitlecaseRealWorldExamples:
    """Test real-world use cases."""

    def test_book_title(self):
        """Test titlecasing a book title-like string."""
        assert titlecase("the lord of the rings") == "The Lord Of The Rings"

    def test_product_name(self):
        """Test titlecasing a product name."""
        assert titlecase("artificial intelligence factory") == "Artificial Intelligence Factory"

    def test_company_name(self):
        """Test titlecasing a company name."""
        assert titlecase("openai research labs") == "Openai Research Labs"

    def test_sentence_fragment(self):
        """Test titlecasing a sentence fragment."""
        assert titlecase("create a new project") == "Create A New Project"

    def test_already_titlecased_sentence(self):
        """Test that already titlecased text remains correct."""
        assert titlecase("Hello World From Python") == "Hello World From Python"

    def test_abbreviations(self):
        """Test titlecasing strings with abbreviation-like patterns."""
        assert titlecase("usa uk eu") == "Usa Uk Eu"


class TestTitlecaseSpecialCharacters:
    """Test titlecase with special characters."""

    def test_hyphenated_words(self):
        """Hyphenated words are treated as single units."""
        assert titlecase("well-known author") == "Well-known Author"

    def test_words_with_apostrophes(self):
        """Words with apostrophes should work."""
        assert titlecase("it's a beautiful day") == "It's A Beautiful Day"

    def test_punctuation_attached_to_words(self):
        """Punctuation attached to words should work."""
        assert titlecase("hello, world!") == "Hello, World!"

    def test_numbers_at_word_start(self):
        """Numbers at word start should work."""
        assert titlecase("123abc def456") == "123abc Def456"


class TestTitlecaseReturnType:
    """Test return type and immutability."""

    def test_returns_string(self):
        """titlecase should return a string."""
        result = titlecase("hello")
        assert isinstance(result, str)

    def test_original_string_unchanged(self):
        """Original string should not be modified."""
        original = "hello world"
        titlecase(original)
        assert original == "hello world"

    def test_returns_new_string(self):
        """Should return a new string object."""
        original = "hello"
        result = titlecase(original)
        assert result is not original


class TestTitlecaseConsistency:
    """Test consistency and idempotence properties."""

    def test_titlecase_idempotent(self):
        """Titlecasing a titlecased string should return the same result."""
        first_pass = titlecase("hello world")
        second_pass = titlecase(first_pass)
        assert first_pass == second_pass

    def test_long_string_consistency(self):
        """Consistency with longer strings."""
        long_string = "the quick brown fox jumps over the lazy dog"
        expected = "The Quick Brown Fox Jumps Over The Lazy Dog"
        assert titlecase(long_string) == expected

    def test_multiple_single_letters(self):
        """Consistency with multiple single letters."""
        assert titlecase("a b c d e f g") == "A B C D E F G"

"""Comprehensive tests for the titlecase function."""

import pytest
from src.app.titlecase import titlecase


class TestTitlecaseBasic:
    """Test basic titlecase functionality."""

    def test_single_word(self):
        """Test titlecase with a single word."""
        assert titlecase("hello") == "Hello"

    def test_single_word_already_capitalized(self):
        """Test titlecase with a single already-capitalized word."""
        assert titlecase("Hello") == "Hello"

    def test_multiple_words(self):
        """Test titlecase with multiple words."""
        assert titlecase("hello world") == "Hello World"

    def test_three_words(self):
        """Test titlecase with three words."""
        assert titlecase("hello world from python") == "Hello World From Python"

    def test_two_word_sentence(self):
        """Test basic two-word titlecasing."""
        assert titlecase("the quick") == "The Quick"


class TestTitlecaseMixedCase:
    """Test mixed case handling."""

    def test_mixed_case_preserved(self):
        """Test that non-first letters preserve their case."""
        assert titlecase("hello WORLD") == "Hello WORLD"

    def test_uppercase_word_with_lowercase(self):
        """Test uppercase word mixed with lowercase."""
        assert titlecase("HELLO world") == "HELLO World"

    def test_all_uppercase(self):
        """Test all uppercase text."""
        assert titlecase("HELLO WORLD") == "HELLO WORLD"

    def test_mixed_case_with_numbers(self):
        """Test mixed case with numbers."""
        assert titlecase("hELLo WoRLD 123") == "HELLo WoRLD 123"

    def test_camel_case_words(self):
        """Test camelCase words are handled correctly."""
        assert titlecase("myVariable anotherVar") == "MyVariable AnotherVar"

    def test_lowercase_except_first(self):
        """Test words with only first letter capitalized."""
        assert titlecase("Hello World") == "Hello World"


class TestTitlecaseSpaces:
    """Test space handling."""

    def test_single_space_between_words(self):
        """Test single space between words."""
        assert titlecase("hello world") == "Hello World"

    def test_multiple_spaces_preserved(self):
        """Test that multiple spaces are preserved."""
        assert titlecase("hello  world") == "Hello  World"

    def test_three_spaces(self):
        """Test three spaces are preserved."""
        assert titlecase("hello   world") == "Hello   World"

    def test_leading_spaces_preserved(self):
        """Test leading spaces are preserved."""
        assert titlecase("  hello world") == "  Hello World"

    def test_trailing_spaces_preserved(self):
        """Test trailing spaces are preserved."""
        assert titlecase("hello world  ") == "Hello World  "

    def test_leading_and_trailing_spaces(self):
        """Test both leading and trailing spaces are preserved."""
        assert titlecase("  hello world  ") == "  Hello World  "

    def test_spaces_only(self):
        """Test string with only spaces returns the spaces."""
        assert titlecase("   ") == "   "

    def test_space_before_word(self):
        """Test space before first word is preserved."""
        assert titlecase(" hello") == " Hello"

    def test_space_after_word(self):
        """Test space after word is preserved."""
        assert titlecase("hello ") == "Hello "


class TestTitlecaseWhitespaceTypes:
    """Test different types of whitespace characters."""

    def test_tab_separator(self):
        """Test tabs as word separators."""
        assert titlecase("hello\tworld") == "Hello\tWorld"

    def test_newline_separator(self):
        """Test newlines as word separators."""
        assert titlecase("hello\nworld") == "Hello\nWorld"

    def test_multiple_tabs(self):
        """Test multiple tabs are preserved."""
        assert titlecase("hello\t\tworld") == "Hello\t\tWorld"

    def test_mixed_whitespace(self):
        """Test mixed space, tab, and newline."""
        assert titlecase("hello \t\n world") == "Hello \t\n World"

    def test_tab_and_space(self):
        """Test tab and space together."""
        assert titlecase("hello \t world") == "Hello \t World"

    def test_newline_in_middle(self):
        """Test newline in middle of words."""
        assert titlecase("hello\nworld\nfrom") == "Hello\nWorld\nFrom"

    def test_multiple_newlines(self):
        """Test multiple consecutive newlines."""
        assert titlecase("hello\n\nworld") == "Hello\n\nWorld"

    def test_carriage_return(self):
        """Test carriage return character."""
        assert titlecase("hello\rworld") == "Hello\rWorld"

    def test_form_feed_character(self):
        """Test form feed character (vertical tab)."""
        assert titlecase("hello\fworld") == "Hello\fWorld"


class TestTitlecaseEmptyString:
    """Test empty string handling."""

    def test_empty_string_returns_empty(self):
        """Test that empty string returns empty string."""
        assert titlecase("") == ""

    def test_empty_vs_space_only(self):
        """Test empty string vs space-only string."""
        assert titlecase("") == ""
        assert titlecase(" ") == " "


class TestTitlecaseNonAlphabeticFirstChars:
    """Test handling of non-alphabetic first characters in words."""

    def test_number_at_start(self):
        """Test word starting with number capitalizes first letter after number."""
        assert titlecase("123hello") == "123Hello"

    def test_special_char_before_letter(self):
        """Test special character before letter capitalizes the letter."""
        assert titlecase("@hello world") == "@Hello World"

    def test_numbers_and_words(self):
        """Test words with numbers."""
        assert titlecase("hello 123 world") == "Hello 123 World"

    def test_punctuation_followed_by_word(self):
        """Test punctuation followed by word (no space)."""
        assert titlecase("hello.world") == "Hello.world"

    def test_mixed_non_alpha_characters(self):
        """Test mixed non-alphabetic characters capitalizes letters after them."""
        assert titlecase("$hello #world @python") == "$Hello #World @Python"


class TestTitlecaseRealWorldExamples:
    """Test real-world examples."""

    def test_proper_title(self):
        """Test proper title case."""
        assert titlecase("the quick brown fox") == "The Quick Brown Fox"

    def test_sentence_style(self):
        """Test sentence-style text."""
        assert titlecase("how are you doing") == "How Are You Doing"

    def test_product_name(self):
        """Test product name."""
        assert titlecase("my awesome product") == "My Awesome Product"

    def test_file_name_words(self):
        """Test words from file name."""
        assert titlecase("index page template") == "Index Page Template"

    def test_username_words(self):
        """Test words that could be from username."""
        assert titlecase("john doe") == "John Doe"

    def test_location_name(self):
        """Test location name."""
        assert titlecase("new york city") == "New York City"


class TestTitlecaseEdgeCases:
    """Test edge cases."""

    def test_single_character(self):
        """Test single character."""
        assert titlecase("a") == "A"

    def test_single_character_already_capitalized(self):
        """Test single capitalized character."""
        assert titlecase("A") == "A"

    def test_single_non_alphabetic_character(self):
        """Test single non-alphabetic character."""
        assert titlecase("1") == "1"
        assert titlecase("#") == "#"

    def test_only_numbers(self):
        """Test string with only numbers."""
        assert titlecase("123") == "123"
        assert titlecase("456 789") == "456 789"

    def test_only_special_characters(self):
        """Test string with only special characters."""
        assert titlecase("!!!") == "!!!"
        assert titlecase("@#$") == "@#$"

    def test_word_with_apostrophe(self):
        """Test words with apostrophes."""
        assert titlecase("don't worry") == "Don't Worry"

    def test_word_with_hyphen(self):
        """Test hyphenated words."""
        assert titlecase("self-aware system") == "Self-aware System"

    def test_very_long_word(self):
        """Test very long word."""
        long_word = "a" * 100
        assert titlecase(long_word) == "A" + "a" * 99

    def test_many_words(self):
        """Test many words."""
        words = " ".join(["word"] * 50)
        expected = " ".join(["Word"] * 50)
        assert titlecase(words) == expected


class TestTitlecasePreservation:
    """Test that non-modified parts are preserved exactly."""

    def test_inner_case_preserved_all_lowercase(self):
        """Test inner case is preserved for lowercase letters."""
        assert titlecase("hELLO wORLD") == "HELLO WORLD"

    def test_inner_case_preserved_mixed(self):
        """Test inner case preservation with mixed patterns."""
        assert titlecase("hElLo WoRlD") == "HElLo WoRlD"

    def test_symbol_position_preserved(self):
        """Test symbols keep their position."""
        assert titlecase("he.llo wo.rld") == "He.llo Wo.rld"

    def test_numbers_in_word_preserved(self):
        """Test numbers within words are preserved."""
        assert titlecase("hello2world test3code") == "Hello2world Test3code"

    def test_very_long_text_with_spaces(self):
        """Test very long text preserves spacing."""
        text = " ".join(["hello"] * 100)
        result = titlecase(text)
        expected = " ".join(["Hello"] * 100)
        assert result == expected


class TestTitlecaseConsistency:
    """Test consistency and idempotence."""

    def test_idempotence_single_word(self):
        """Test that applying twice gives same result."""
        result1 = titlecase("hello")
        result2 = titlecase(result1)
        # Note: Not necessarily idempotent since it capitalizes first letter
        # "Hello" -> "Hello" (should be idempotent)
        assert result2 == "Hello"

    def test_idempotence_multiple_words(self):
        """Test idempotence with multiple words."""
        text = "hello world"
        result1 = titlecase(text)
        result2 = titlecase(result1)
        # result1 is "Hello World"
        # result2 should also be "Hello World"
        assert result2 == "Hello World"

    def test_already_titlecased_unchanged(self):
        """Test already titlecased text remains unchanged."""
        text = "Hello World"
        assert titlecase(text) == "Hello World"

    def test_already_titlecased_multiple_words(self):
        """Test already titlecased multiple words."""
        text = "Hello World From Python"
        assert titlecase(text) == "Hello World From Python"


class TestTitlecaseWordDefinition:
    """Test definition of 'word' (whitespace-separated)."""

    def test_words_separated_by_space(self):
        """Test words separated by space."""
        assert titlecase("one two three") == "One Two Three"

    def test_words_not_separated_by_hyphen(self):
        """Test hyphen does not separate words for titlecasing."""
        # "self-aware" is one unit; hyphen doesn't start a new word
        assert titlecase("self-aware") == "Self-aware"

    def test_words_not_separated_by_apostrophe(self):
        """Test apostrophe does not separate words."""
        assert titlecase("it's okay") == "It's Okay"

    def test_only_whitespace_separates_words(self):
        """Test that only whitespace truly separates words."""
        assert titlecase("hello-world_test.code") == "Hello-world_test.code"

    def test_unicode_whitespace(self):
        """Test that standard whitespace characters separate words."""
        # Testing with basic whitespace; Unicode whitespace would need separate handling
        assert titlecase("hello world") == "Hello World"

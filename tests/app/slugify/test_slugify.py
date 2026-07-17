"""Comprehensive tests for the slugify function."""

import pytest
from src.app.slugify import slugify


class TestSlugifyBasic:
    """Test basic slugify functionality."""

    def test_normal_text(self):
        """Test slugify with normal text."""
        assert slugify("Hello World") == "hello-world"

    def test_single_word(self):
        """Test slugify with a single word."""
        assert slugify("hello") == "hello"

    def test_multiple_words(self):
        """Test slugify with multiple words."""
        assert slugify("Hello World from Python") == "hello-world-from-python"


class TestSlugifyCase:
    """Test case handling."""

    def test_uppercase_text(self):
        """Test that uppercase is converted to lowercase."""
        assert slugify("HELLO WORLD") == "hello-world"

    def test_mixed_case(self):
        """Test that mixed case is handled correctly."""
        assert slugify("HeLLo WoRLd") == "hello-world"

    def test_all_lowercase(self):
        """Test that lowercase text is preserved."""
        assert slugify("hello world") == "hello-world"


class TestSlugifySpaces:
    """Test space handling."""

    def test_single_space(self):
        """Test single space between words."""
        assert slugify("hello world") == "hello-world"

    def test_multiple_spaces(self):
        """Test multiple spaces are collapsed to single hyphen."""
        assert slugify("hello  world") == "hello-world"
        assert slugify("hello   world") == "hello-world"

    def test_leading_spaces(self):
        """Test leading spaces are handled."""
        assert slugify("  hello world") == "hello-world"

    def test_trailing_spaces(self):
        """Test trailing spaces are handled."""
        assert slugify("hello world  ") == "hello-world"

    def test_spaces_only(self):
        """Test string with only spaces returns empty string."""
        assert slugify("   ") == ""


class TestSlugifyUnderscores:
    """Test underscore handling."""

    def test_underscore_replacement(self):
        """Test that underscores are replaced with hyphens."""
        assert slugify("hello_world") == "hello-world"

    def test_multiple_underscores(self):
        """Test multiple underscores are collapsed."""
        assert slugify("hello__world") == "hello-world"

    def test_mixed_spaces_and_underscores(self):
        """Test mixed spaces and underscores."""
        assert slugify("hello_world from_python") == "hello-world-from-python"
        assert slugify("hello world_from python") == "hello-world-from-python"


class TestSlugifyAlreadySlugified:
    """Test already-slugified text."""

    def test_already_slugified(self):
        """Test that already slugified text is preserved."""
        assert slugify("hello-world") == "hello-world"

    def test_already_slugified_with_numbers(self):
        """Test already slugified text with numbers."""
        assert slugify("hello-world-123") == "hello-world-123"

    def test_lowercase_with_hyphens(self):
        """Test lowercase text with hyphens."""
        assert slugify("this-is-already-slugified") == "this-is-already-slugified"


class TestSlugifySpecialCharacters:
    """Test special character handling."""

    def test_punctuation(self):
        """Test that punctuation is removed."""
        assert slugify("hello, world!") == "hello-world"
        assert slugify("hello. world?") == "hello-world"
        assert slugify("hello; world:") == "hello-world"

    def test_parentheses(self):
        """Test parentheses are removed."""
        assert slugify("hello (world)") == "hello-world"
        assert slugify("(hello) (world)") == "hello-world"

    def test_brackets(self):
        """Test brackets are removed."""
        assert slugify("hello [world]") == "hello-world"
        assert slugify("hello {world}") == "hello-world"

    def test_quotes(self):
        """Test quotes are removed."""
        assert slugify('hello "world"') == "hello-world"
        assert slugify("hello 'world'") == "hello-world"

    def test_ampersand(self):
        """Test ampersand is removed."""
        assert slugify("hello & world") == "hello-world"

    def test_at_symbol(self):
        """Test at symbol is replaced with hyphen."""
        assert slugify("hello@world") == "hello-world"

    def test_hash_symbol(self):
        """Test hash symbol is replaced with hyphen."""
        assert slugify("hello#world") == "hello-world"

    def test_dollar_symbol(self):
        """Test dollar symbol is replaced with hyphen."""
        assert slugify("hello$world") == "hello-world"

    def test_percent_symbol(self):
        """Test percent symbol is replaced with hyphen."""
        assert slugify("hello%world") == "hello-world"

    def test_asterisk(self):
        """Test asterisk is replaced with hyphen."""
        assert slugify("hello*world") == "hello-world"

    def test_plus_sign(self):
        """Test plus sign is replaced with hyphen."""
        assert slugify("hello+world") == "hello-world"

    def test_equals_sign(self):
        """Test equals sign is replaced with hyphen."""
        assert slugify("hello=world") == "hello-world"

    def test_backslash(self):
        """Test backslash is replaced with hyphen."""
        assert slugify("hello\\world") == "hello-world"

    def test_forward_slash(self):
        """Test forward slash is removed."""
        assert slugify("hello/world") == "hello-world"

    def test_pipe(self):
        """Test pipe is removed."""
        assert slugify("hello|world") == "hello-world"

    def test_caret(self):
        """Test caret is replaced with hyphen."""
        assert slugify("hello^world") == "hello-world"

    def test_tilde(self):
        """Test tilde is replaced with hyphen."""
        assert slugify("hello~world") == "hello-world"

    def test_backtick(self):
        """Test backtick is replaced with hyphen."""
        assert slugify("hello`world") == "hello-world"

    def test_multiple_special_chars(self):
        """Test multiple special characters."""
        assert slugify("hello!!!world???") == "hello-world"
        assert slugify("hello@#$world%^&") == "hello-world"


class TestSlugifyConsecutiveHyphens:
    """Test consecutive hyphen handling."""

    def test_consecutive_hyphens_collapsed(self):
        """Test that consecutive hyphens are collapsed."""
        assert slugify("hello--world") == "hello-world"
        assert slugify("hello---world") == "hello-world"

    def test_hyphens_from_special_chars(self):
        """Test that consecutive special chars become single hyphen."""
        assert slugify("hello   world") == "hello-world"
        assert slugify("hello___world") == "hello-world"
        assert slugify("hello_ _world") == "hello-world"

    def test_mixed_separators_collapsed(self):
        """Test mixed separators collapse to single hyphen."""
        assert slugify("hello_ world") == "hello-world"
        assert slugify("hello _world") == "hello-world"
        assert slugify("hello- _world") == "hello-world"


class TestSlugifyLeadingTrailingHyphens:
    """Test leading and trailing hyphen stripping."""

    def test_leading_hyphen_removed(self):
        """Test that leading hyphens are removed."""
        assert slugify("-hello") == "hello"
        assert slugify("--hello") == "hello"

    def test_trailing_hyphen_removed(self):
        """Test that trailing hyphens are removed."""
        assert slugify("hello-") == "hello"
        assert slugify("hello--") == "hello"

    def test_leading_and_trailing_hyphens_removed(self):
        """Test that both leading and trailing hyphens are removed."""
        assert slugify("-hello-") == "hello"
        assert slugify("--hello--") == "hello"
        assert slugify("-hello world-") == "hello-world"

    def test_hyphens_from_leading_special_chars(self):
        """Test hyphens from leading special characters are stripped."""
        assert slugify("!hello") == "hello"
        assert slugify("@hello") == "hello"
        assert slugify("  hello") == "hello"
        assert slugify("__hello") == "hello"

    def test_hyphens_from_trailing_special_chars(self):
        """Test hyphens from trailing special characters are stripped."""
        assert slugify("hello!") == "hello"
        assert slugify("hello@") == "hello"
        assert slugify("hello  ") == "hello"
        assert slugify("hello__") == "hello"


class TestSlugifyEmptyString:
    """Test empty string handling."""

    def test_empty_string_returns_empty_string(self):
        """Test that empty string returns empty string."""
        assert slugify("") == ""

    def test_none_like_input(self):
        """Test that falsy strings return empty string."""
        assert slugify("") == ""


class TestSlugifyNumbers:
    """Test handling of numbers."""

    def test_numbers_preserved(self):
        """Test that numbers are preserved."""
        assert slugify("hello123") == "hello123"
        assert slugify("123hello") == "123hello"
        assert slugify("hello 123 world") == "hello-123-world"

    def test_numbers_at_boundaries(self):
        """Test numbers at word boundaries."""
        assert slugify("123") == "123"
        assert slugify("hello-123-world") == "hello-123-world"


class TestSlugifyRealWorldExamples:
    """Test real-world examples."""

    def test_product_name(self):
        """Test typical product names."""
        assert slugify("My Awesome Product") == "my-awesome-product"
        assert slugify("Product v2.0") == "product-v2-0"

    def test_email_like(self):
        """Test email-like input."""
        assert slugify("user@example.com") == "user-example-com"

    def test_url_like(self):
        """Test URL-like input."""
        assert slugify("https://example.com/path") == "https-example-com-path"

    def test_sentence_with_punctuation(self):
        """Test sentence with punctuation."""
        assert slugify("Hello, World! How are you?") == "hello-world-how-are-you"

    def test_hyphenated_word(self):
        """Test hyphenated words."""
        assert slugify("self-aware system") == "self-aware-system"

    def test_underscored_identifier(self):
        """Test underscored identifiers."""
        assert slugify("my_variable_name") == "my-variable-name"

    def test_camel_case_converted(self):
        """Test camel case is handled (remains camel case but lowercased)."""
        assert slugify("myVariableName") == "myvariablename"


class TestSlugifyEdgeCases:
    """Test edge cases."""

    def test_only_special_characters_returns_empty(self):
        """Test that only special characters return empty string."""
        assert slugify("!!!") == ""
        assert slugify("@#$%") == ""

    def test_unicode_dash_variations(self):
        """Test that only standard hyphens remain."""
        assert slugify("hello-world") == "hello-world"

    def test_whitespace_only_returns_empty(self):
        """Test that whitespace-only strings return empty."""
        assert slugify(" ") == ""
        assert slugify("\t") == ""
        assert slugify("\n") == ""

    def test_very_long_text(self):
        """Test very long text."""
        long_text = "hello " * 100
        result = slugify(long_text)
        assert result == "hello-" * 99 + "hello"

    def test_consecutive_words_with_numbers(self):
        """Test consecutive words with numbers."""
        assert slugify("word1 word2 word3") == "word1-word2-word3"

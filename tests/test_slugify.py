"""Unit tests for the slugify helper function."""

from app.helpers.slugify import slugify


class TestSlugifyBasics:
    """Test basic slugify functionality."""

    def test_simple_string(self):
        """Test simple string conversion."""
        assert slugify("hello") == "hello"

    def test_uppercase_to_lowercase(self):
        """Test uppercase input is lowercased."""
        assert slugify("HELLO") == "hello"

    def test_mixed_case_to_lowercase(self):
        """Test mixed case input is lowercased."""
        assert slugify("HeLLo WoRLd") == "hello-world"

    def test_single_word(self):
        """Test single word with no special characters."""
        assert slugify("example") == "example"

    def test_two_words_with_space(self):
        """Test two words separated by space."""
        assert slugify("hello world") == "hello-world"


class TestSlugifyWhitespace:
    """Test whitespace handling."""

    def test_leading_whitespace_stripped(self):
        """Test leading whitespace is trimmed."""
        assert slugify("  hello") == "hello"

    def test_trailing_whitespace_stripped(self):
        """Test trailing whitespace is trimmed."""
        assert slugify("hello  ") == "hello"

    def test_leading_and_trailing_whitespace(self):
        """Test both leading and trailing whitespace are trimmed."""
        assert slugify("  hello world  ") == "hello-world"

    def test_internal_spaces_become_hyphens(self):
        """Test internal spaces are converted to hyphens."""
        assert slugify("hello world example") == "hello-world-example"

    def test_multiple_internal_spaces_collapse(self):
        """Test multiple internal spaces collapse to single hyphen."""
        assert slugify("hello    world") == "hello-world"

    def test_tabs_and_spaces_collapse(self):
        """Test tabs and spaces collapse to single hyphen."""
        assert slugify("hello\t\t  world") == "hello-world"


class TestSlugifyPunctuation:
    """Test punctuation handling."""

    def test_hyphens_in_input(self):
        """Test hyphens in input are preserved appropriately."""
        assert slugify("hello-world") == "hello-world"

    def test_multiple_hyphens_collapse(self):
        """Test multiple hyphens collapse to single hyphen."""
        assert slugify("hello---world") == "hello-world"

    def test_punctuation_becomes_hyphen(self):
        """Test punctuation is converted to hyphen."""
        assert slugify("hello!world") == "hello-world"

    def test_mixed_punctuation_collapses(self):
        """Test mixed punctuation runs collapse to single hyphen."""
        assert slugify("hello!@#$world") == "hello-world"

    def test_dots_and_commas(self):
        """Test dots and commas are handled."""
        assert slugify("hello.world,example") == "hello-world-example"

    def test_apostrophes(self):
        """Test apostrophes are handled."""
        assert slugify("don't") == "don-t"

    def test_underscores(self):
        """Test underscores are treated as non-alphanumeric."""
        assert slugify("hello_world") == "hello-world"

    def test_parentheses(self):
        """Test parentheses are handled."""
        assert slugify("hello(world)") == "hello-world"

    def test_brackets(self):
        """Test brackets are handled."""
        assert slugify("hello[world]") == "hello-world"


class TestSlugifyHyphenStripping:
    """Test leading/trailing hyphen stripping."""

    def test_leading_hyphens_stripped(self):
        """Test leading hyphens are removed."""
        assert slugify("-hello") == "hello"

    def test_trailing_hyphens_stripped(self):
        """Test trailing hyphens are removed."""
        assert slugify("hello-") == "hello"

    def test_leading_and_trailing_hyphens_stripped(self):
        """Test both leading and trailing hyphens are removed."""
        assert slugify("-hello-") == "hello"

    def test_multiple_leading_hyphens_stripped(self):
        """Test multiple leading hyphens are removed."""
        assert slugify("---hello") == "hello"

    def test_multiple_trailing_hyphens_stripped(self):
        """Test multiple trailing hyphens are removed."""
        assert slugify("hello---") == "hello"

    def test_hyphen_from_punctuation_at_edges_stripped(self):
        """Test hyphens created from punctuation at edges are stripped."""
        assert slugify("!hello!") == "hello"

    def test_hyphen_from_spaces_at_edges_stripped(self):
        """Test hyphens created from spaces at edges are stripped."""
        assert slugify("  hello  ") == "hello"


class TestSlugifyUnicode:
    """Test Unicode handling."""

    def test_latin_accented_characters(self):
        """Test Latin characters with accents are normalized."""
        assert slugify("café") == "cafe"

    def test_french_accents(self):
        """Test French accented characters."""
        assert slugify("Élève") == "eleve"

    def test_spanish_characters(self):
        """Test Spanish characters."""
        assert slugify("niño") == "nino"

    def test_german_umlauts(self):
        """Test German umlauts."""
        assert slugify("schöne") == "schone"

    def test_mixed_unicode_and_ascii(self):
        """Test mix of Unicode and ASCII characters."""
        assert slugify("café world") == "cafe-world"

    def test_combining_marks_removed(self):
        """Test combining diacritical marks are removed."""
        # Using explicit combining marks
        text = "é"  # e + combining acute accent
        assert slugify(text) == "e"

    def test_chinese_characters(self):
        """Test non-Latin Unicode doesn't crash."""
        # Chinese characters should be handled without crashing
        result = slugify("你好世界")
        assert isinstance(result, str)

    def test_emoji(self):
        """Test emoji are handled without crashing."""
        result = slugify("hello 😀 world")
        assert isinstance(result, str)

    def test_hebrew_characters(self):
        """Test Hebrew characters are handled without crashing."""
        result = slugify("שלום עולם")
        assert isinstance(result, str)

    def test_arabic_characters(self):
        """Test Arabic characters are handled without crashing."""
        result = slugify("مرحبا بالعالم")
        assert isinstance(result, str)


class TestSlugifyEdgeCases:
    """Test edge cases and special scenarios."""

    def test_empty_string(self):
        """Test empty string returns empty string."""
        assert slugify("") == ""

    def test_only_whitespace(self):
        """Test string with only whitespace returns empty string."""
        assert slugify("   ") == ""

    def test_only_punctuation(self):
        """Test string with only punctuation returns empty string."""
        assert slugify("!!!") == ""

    def test_only_hyphens(self):
        """Test string with only hyphens returns empty string."""
        assert slugify("---") == ""

    def test_only_spaces_and_punctuation(self):
        """Test string with only spaces and punctuation returns empty string."""
        assert slugify("  !@# !  ") == ""

    def test_numbers_preserved(self):
        """Test numbers are preserved."""
        assert slugify("hello123world") == "hello123world"

    def test_leading_numbers(self):
        """Test leading numbers are preserved."""
        assert slugify("123hello") == "123hello"

    def test_trailing_numbers(self):
        """Test trailing numbers are preserved."""
        assert slugify("hello123") == "hello123"

    def test_numbers_and_spaces(self):
        """Test numbers with spaces."""
        assert slugify("hello 123 world") == "hello-123-world"

    def test_complex_real_world_example(self):
        """Test complex real-world example."""
        assert slugify("The Quick, Brown Fox!!! Jumps Over...") == "the-quick-brown-fox-jumps-over"

    def test_url_like_input(self):
        """Test URL-like input."""
        assert slugify("https://example.com") == "https-example-com"

    def test_email_like_input(self):
        """Test email-like input."""
        assert slugify("user@example.com") == "user-example-com"

    def test_filename_like_input(self):
        """Test filename-like input."""
        assert slugify("my_document-final_v2.txt") == "my-document-final-v2-txt"


class TestSlugifyConsistency:
    """Test consistency and determinism."""

    def test_idempotent_on_result(self):
        """Test slugify is idempotent on its own output."""
        input_text = "Hello World!"
        first_pass = slugify(input_text)
        second_pass = slugify(first_pass)
        assert first_pass == second_pass

    def test_consistent_output(self):
        """Test consistent output for same input."""
        input_text = "Example Text!"
        assert slugify(input_text) == slugify(input_text)

    def test_deterministic_unicode(self):
        """Test deterministic output with Unicode input."""
        input_text = "Café Français"
        assert slugify(input_text) == slugify(input_text)


class TestSlugifyReturnType:
    """Test return type is always string."""

    def test_returns_string(self):
        """Test function always returns a string."""
        result = slugify("hello")
        assert isinstance(result, str)

    def test_returns_string_empty(self):
        """Test function returns string even for empty input."""
        result = slugify("")
        assert isinstance(result, str)

    def test_returns_string_unicode(self):
        """Test function returns string for Unicode input."""
        result = slugify("café")
        assert isinstance(result, str)

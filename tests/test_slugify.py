"""Unit tests for the slugify helper function."""

import pytest

from src.app.helpers.slugify import slugify


class TestSlugifyBasic:
    """Test basic slugification behavior."""

    def test_basic_slugification(self):
        """Test: 'Hello World' → 'hello-world'."""
        assert slugify("Hello World") == "hello-world"

    def test_lowercase_conversion(self):
        """Test that uppercase letters are converted to lowercase."""
        assert slugify("UPPERCASE") == "uppercase"
        assert slugify("MixedCase") == "mixedcase"

    def test_whitespace_trimming(self):
        """Test that surrounding whitespace is trimmed."""
        assert slugify("  hello  ") == "hello"
        assert slugify("\thello\t") == "hello"
        assert slugify("\nhello\n") == "hello"

    def test_multiple_spaces_collapse(self):
        """Test that multiple spaces collapse to single hyphen."""
        assert slugify("hello   world") == "hello-world"
        assert slugify("a  b  c") == "a-b-c"


class TestSlugifyPunctuation:
    """Test punctuation handling."""

    def test_single_punctuation_removal(self):
        """Test that single punctuation marks are converted to hyphens."""
        assert slugify("hello-world") == "hello-world"
        assert slugify("hello_world") == "hello-world"
        assert slugify("hello.world") == "hello-world"
        assert slugify("hello,world") == "hello-world"

    def test_multiple_punctuation_collapse(self):
        """Test: runs of non-alphanumeric chars collapse to single hyphen."""
        assert slugify("test---value") == "test-value"
        assert slugify("hello!!!world") == "hello-world"
        assert slugify("test---!!!---value") == "test-value"
        assert slugify("a...b...c") == "a-b-c"

    def test_hyphen_stripping(self):
        """Test that leading and trailing hyphens are stripped."""
        assert slugify("-leading-hyphen") == "leading-hyphen"
        assert slugify("trailing-hyphen-") == "trailing-hyphen"
        assert slugify("--multiple--leading--") == "multiple-leading"
        assert slugify("-a-") == "a"

    def test_all_punctuation_empty_string(self):
        """Test that all-punctuation input returns empty string."""
        assert slugify("!!!") == ""
        assert slugify("---") == ""
        assert slugify("!!!---!!!") == ""
        assert slugify(".,;:?!") == ""


class TestSlugifyEdgeCases:
    """Test edge cases and special scenarios."""

    def test_empty_string(self):
        """Test that empty input returns empty string."""
        assert slugify("") == ""

    def test_whitespace_only(self):
        """Test that whitespace-only input returns empty string."""
        assert slugify("   ") == ""
        assert slugify("\t\t") == ""
        assert slugify("\n\n") == ""

    def test_numbers_preserved(self):
        """Test that numbers are preserved in the slug."""
        assert slugify("hello123world") == "hello123world"
        assert slugify("123") == "123"
        assert slugify("test-123-value") == "test-123-value"

    def test_mixed_alphanumeric_punctuation(self):
        """Test mixed alphanumeric and punctuation."""
        assert slugify("hello-123-world") == "hello-123-world"
        assert slugify("test_123_value") == "test-123-value"
        assert slugify("a1b2c3") == "a1b2c3"


class TestSlugifyUnicode:
    """Test Unicode handling."""

    def test_unicode_letters_handled(self):
        """Test that Unicode letters are handled gracefully."""
        # These tests verify Unicode handling doesn't crash
        result = slugify("Café")
        assert isinstance(result, str)
        assert result == "cafe"

    def test_accented_characters(self):
        """Test that accented characters are handled."""
        assert slugify("Café") == "cafe"
        assert slugify("naïve") == "naive"
        assert slugify("résumé") == "resume"

    def test_unicode_never_crashes(self):
        """Test that various Unicode inputs never crash."""
        test_cases = [
            "你好世界",  # Chinese
            "مرحبا",    # Arabic
            "Привет",   # Cyrillic
            "Ελληνικά", # Greek
            "日本語",    # Japanese
            "한글",     # Korean
        ]
        for case in test_cases:
            # Should not raise any exception
            result = slugify(case)
            assert isinstance(result, str)


class TestSlugifyComplexCases:
    """Test complex combinations."""

    def test_complex_string(self):
        """Test a complex real-world example."""
        assert slugify("Hello World!!!") == "hello-world"
        assert slugify("  Test---Multiple   Spaces  ") == "test-multiple-spaces"

    def test_consecutive_punctuation_and_spaces(self):
        """Test consecutive punctuation and spaces."""
        assert slugify("hello---!!!---world") == "hello-world"
        assert slugify("test   !!!   value") == "test-value"

    def test_special_characters_and_numbers(self):
        """Test special characters with numbers."""
        assert slugify("file.name.v2.0") == "file-name-v2-0"
        assert slugify("test-case_2023") == "test-case-2023"

    def test_camelcase_conversion(self):
        """Test that CamelCase is converted to lowercase."""
        assert slugify("CamelCaseText") == "camelcasetext"
        assert slugify("thisIsCamelCase") == "thisiscamelcase"

    def test_snake_case_to_slug(self):
        """Test conversion from snake_case."""
        assert slugify("hello_world_test") == "hello-world-test"
        assert slugify("_leading_underscore") == "leading-underscore"

    def test_multiple_hyphen_handling(self):
        """Test various hyphen patterns."""
        assert slugify("---test---") == "test"
        assert slugify("-a-b-c-") == "a-b-c"
        assert slugify("a--b--c") == "a-b-c"

"""Tests for the slugify helper function."""

import pytest

from helpers.slugify import slugify


class TestSlugifyBasic:
    """Test basic slugify functionality."""

    def test_lowercase_conversion(self):
        """Test that text is converted to lowercase."""
        assert slugify("Hello") == "hello"
        assert slugify("HELLO") == "hello"
        assert slugify("HeLLo") == "hello"

    def test_space_to_hyphen(self):
        """Test that spaces are replaced with hyphens."""
        assert slugify("Hello World") == "hello-world"
        assert slugify("A B C") == "a-b-c"

    def test_underscore_to_hyphen(self):
        """Test that underscores are replaced with hyphens."""
        assert slugify("hello_world") == "hello-world"
        assert slugify("test_case_123") == "test-case-123"

    def test_mixed_spaces_and_underscores(self):
        """Test that both spaces and underscores become hyphens."""
        assert slugify("Test-Case_123") == "test-case-123"
        assert slugify("hello world_test") == "hello-world-test"
        assert slugify("a_b c") == "a-b-c"


class TestSlugifySpecialCharacters:
    """Test removal of special characters."""

    def test_remove_special_characters(self):
        """Test that special characters are removed."""
        assert slugify("hello@world") == "helloworld"
        assert slugify("test#case") == "testcase"
        assert slugify("foo&bar") == "foobar"

    def test_remove_punctuation(self):
        """Test that punctuation is removed."""
        assert slugify("hello.world") == "helloworld"
        assert slugify("test,case") == "testcase"
        assert slugify("foo!bar") == "foobar"
        assert slugify("hello-world") == "hello-world"

    def test_preserve_hyphens(self):
        """Test that hyphens are preserved."""
        assert slugify("hello-world") == "hello-world"
        assert slugify("my-test-slug") == "my-test-slug"

    def test_consecutive_hyphens_collapsed(self):
        """Test that consecutive hyphens are collapsed into one."""
        assert slugify("hello--world") == "hello-world"
        assert slugify("test___case") == "test-case"
        assert slugify("a___b   c") == "a-b-c"


class TestSlugifyNumbers:
    """Test handling of numbers."""

    def test_preserve_numbers(self):
        """Test that numbers are preserved."""
        assert slugify("test123") == "test123"
        assert slugify("123test") == "123test"
        assert slugify("test 123") == "test-123"

    def test_complex_with_numbers(self):
        """Test complex strings with numbers."""
        assert slugify("Hello123World456") == "hello123world456"
        assert slugify("Test 2024 Case") == "test-2024-case"


class TestSlugifyEdgeCases:
    """Test edge cases."""

    def test_empty_string(self):
        """Test empty string."""
        assert slugify("") == ""

    def test_only_spaces(self):
        """Test string with only spaces."""
        assert slugify("   ") == ""

    def test_only_special_characters(self):
        """Test string with only special characters."""
        assert slugify("@#$%") == ""
        assert slugify("!!!") == ""

    def test_leading_trailing_spaces(self):
        """Test leading and trailing spaces are handled."""
        assert slugify("  hello world  ") == "hello-world"

    def test_leading_trailing_hyphens_removed(self):
        """Test that leading and trailing hyphens are removed."""
        assert slugify("-hello-world-") == "hello-world"
        assert slugify("---test---") == "test"

    def test_single_character(self):
        """Test single character input."""
        assert slugify("a") == "a"
        assert slugify("A") == "a"
        assert slugify("1") == "1"

    def test_whitespace_variants(self):
        """Test various whitespace characters."""
        assert slugify("hello\tworld") == "hello-world"
        assert slugify("hello\nworld") == "hello-world"


class TestSlugifyRealWorld:
    """Test real-world use cases."""

    def test_blog_title(self):
        """Test blog post title slugification."""
        assert slugify("My First Blog Post!") == "my-first-blog-post"
        assert slugify("Python 3.10 - What's New?") == "python-310-whats-new"

    def test_product_names(self):
        """Test product name slugification."""
        assert slugify("Product Name & Description") == "product-name-description"
        assert slugify("Widget 2024 (Premium)") == "widget-2024-premium"

    def test_url_paths(self):
        """Test URL path generation."""
        assert slugify("User Profile Settings") == "user-profile-settings"
        assert slugify("API Documentation v2.0") == "api-documentation-v20"

    def test_social_media_handles(self):
        """Test social media handle format."""
        assert slugify("John_Smith-2024") == "john-smith-2024"
        assert slugify("Test__User---Name") == "test-user-name"

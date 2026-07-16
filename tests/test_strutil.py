"""Tests for strutil module."""

import pytest

from src.app.strutil import to_kebab


class TestToKebab:
    """Test cases for the to_kebab function."""

    def test_camelcase_conversion(self):
        """Test conversion of camelCase to kebab-case."""
        assert to_kebab("HelloWorld") == "hello-world"

    def test_space_separated(self):
        """Test conversion of space-separated words to kebab-case."""
        assert to_kebab("hello world") == "hello-world"

    def test_empty_string(self):
        """Test that empty string returns empty string."""
        assert to_kebab("") == ""

    def test_already_kebab(self):
        """Test that already kebab-cased string is unchanged."""
        assert to_kebab("hello-world") == "hello-world"

    def test_mixed_case(self):
        """Test conversion of mixed case with multiple words."""
        assert to_kebab("HelloWorldTest") == "hello-world-test"

    def test_single_word(self):
        """Test single lowercase word."""
        assert to_kebab("hello") == "hello"

    def test_single_word_uppercase(self):
        """Test single uppercase word."""
        assert to_kebab("HELLO") == "hello"

    def test_multiple_spaces(self):
        """Test handling of multiple spaces."""
        assert to_kebab("hello  world") == "hello--world"

    def test_mixed_spaces_and_camelcase(self):
        """Test mixed spaces and camelCase."""
        assert to_kebab("Hello World Test") == "hello-world-test"

    def test_leading_uppercase(self):
        """Test string starting with uppercase letter."""
        assert to_kebab("HelloWorldExample") == "hello-world-example"

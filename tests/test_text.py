"""Tests for text utility functions."""

import pytest

from src.app.text import truncate


class TestTruncateFunction:
    """Test suite for the truncate function."""

    def test_text_shorter_than_limit_returns_unchanged(self):
        """Text shorter than limit should return unchanged."""
        result = truncate("hello", 10)
        assert result == "hello"
        assert len(result) == 5

    def test_text_equal_to_limit_returns_unchanged(self):
        """Text equal to limit should return unchanged."""
        result = truncate("hello", 5)
        assert result == "hello"
        assert len(result) == 5

    def test_text_longer_than_limit_truncates_with_ellipsis(self):
        """Text longer than limit should truncate with ellipsis."""
        result = truncate("hello world", 8)
        assert result == "hello..."
        assert len(result) == 8

    def test_empty_string_returns_unchanged(self):
        """Empty string should return unchanged."""
        result = truncate("", 5)
        assert result == ""
        assert len(result) == 0

    def test_empty_string_equals_limit_returns_unchanged(self):
        """Empty string with limit 0 should return unchanged."""
        # Empty string is always <= limit, so it should return unchanged
        result = truncate("", 3)
        assert result == ""
        assert len(result) == 0

    def test_limit_exactly_3_with_longer_text(self):
        """Limit of 3 should return exactly '...' for longer text."""
        result = truncate("hello", 3)
        assert result == "..."
        assert len(result) == 3

    def test_limit_less_than_3_raises_value_error(self):
        """Limit less than 3 should raise ValueError."""
        with pytest.raises(ValueError, match="limit must be at least 3"):
            truncate("hello", 2)

    def test_limit_of_2_raises_value_error(self):
        """Limit of 2 should raise ValueError."""
        with pytest.raises(ValueError, match="limit must be at least 3"):
            truncate("test", 2)

    def test_limit_of_1_raises_value_error(self):
        """Limit of 1 should raise ValueError."""
        with pytest.raises(ValueError, match="limit must be at least 3"):
            truncate("test", 1)

    def test_limit_of_0_raises_value_error(self):
        """Limit of 0 should raise ValueError."""
        with pytest.raises(ValueError, match="limit must be at least 3"):
            truncate("test", 0)

    def test_negative_limit_raises_value_error(self):
        """Negative limit should raise ValueError."""
        with pytest.raises(ValueError, match="limit must be at least 3"):
            truncate("test", -5)

    def test_unicode_characters_shorter_than_limit(self):
        """Unicode characters shorter than limit should return unchanged."""
        text = "café ☕"
        result = truncate(text, 20)
        assert result == text
        assert len(result) == len(text)

    def test_unicode_characters_longer_than_limit(self):
        """Unicode characters longer than limit should truncate properly."""
        text = "café ☕ world"
        result = truncate(text, 10)
        assert result == "café ☕ ..."
        assert len(result) == 10

    def test_emoji_characters_shorter_than_limit(self):
        """Emoji characters shorter than limit should return unchanged."""
        text = "hello 👋 world"
        result = truncate(text, 20)
        assert result == text

    def test_emoji_characters_longer_than_limit(self):
        """Emoji characters longer than limit should truncate properly."""
        text = "hello 👋 world of emojis"
        result = truncate(text, 15)
        assert result == "hello 👋 worl..."
        assert len(result) == 15

    def test_special_characters_shorter_than_limit(self):
        """Special characters shorter than limit should return unchanged."""
        text = "test@#$%^&*()"
        result = truncate(text, 20)
        assert result == text

    def test_special_characters_longer_than_limit(self):
        """Special characters longer than limit should truncate with ellipsis."""
        text = "test@#$%^&*()special"
        result = truncate(text, 10)
        assert result == "test@#$..."
        assert len(result) == 10

    def test_single_character_shorter_than_limit(self):
        """Single character shorter than limit should return unchanged."""
        result = truncate("a", 5)
        assert result == "a"
        assert len(result) == 1

    def test_single_character_equal_to_limit(self):
        """Single character equal to limit should return unchanged."""
        result = truncate("a", 3)
        assert result == "a"
        assert len(result) == 1

    def test_very_long_text_truncates_correctly(self):
        """Very long text should truncate to exact limit."""
        text = "a" * 1000
        limit = 50
        result = truncate(text, limit)
        assert result == "a" * 47 + "..."
        assert len(result) == limit

    def test_limit_equals_text_plus_ellipsis(self):
        """Limit matching text length should not truncate."""
        text = "hello"
        result = truncate(text, 5)
        assert result == "hello"
        assert result != "he..."

    def test_text_at_limit_minus_1(self):
        """Text one character less than limit should return unchanged."""
        result = truncate("hello", 6)
        assert result == "hello"
        assert len(result) == 5

    def test_result_always_exact_length_when_truncated(self):
        """Truncated result should always be exactly the limit length."""
        text = "this is a test string"
        for limit in range(3, 15):
            result = truncate(text, limit)
            assert len(result) == limit, f"Expected length {limit}, got {len(result)}"

    def test_whitespace_handling_shorter_than_limit(self):
        """Whitespace in text shorter than limit should be preserved."""
        text = "  hello  world  "
        result = truncate(text, 20)
        assert result == text

    def test_whitespace_handling_longer_than_limit(self):
        """Whitespace in text longer than limit should be truncated."""
        text = "  hello  world  test  "
        result = truncate(text, 10)
        assert result == "  hello..."
        assert len(result) == 10

    def test_newline_characters(self):
        """Newline characters should be handled correctly."""
        text = "hello\nworld\ntest"
        result = truncate(text, 12)
        assert result == "hello\nwor..."
        assert len(result) == 12

    def test_tab_characters(self):
        """Tab characters should be handled correctly."""
        text = "hello\tworld\ttest"
        result = truncate(text, 12)
        assert result == "hello\twor..."
        assert len(result) == 12

    def test_limit_3_exact_behavior(self):
        """Limit of 3 should return exactly '...' regardless of text."""
        assert truncate("a", 3) == "a"
        assert truncate("ab", 3) == "ab"
        assert truncate("abc", 3) == "abc"
        assert truncate("abcd", 3) == "..."
        assert len(truncate("abcd", 3)) == 3

    def test_large_limit_no_truncation(self):
        """Large limit should not truncate reasonably sized text."""
        text = "hello world"
        result = truncate(text, 1000)
        assert result == text

    def test_consistent_output_format(self):
        """Output should always end with '...' when truncated."""
        text = "test string that needs truncation"
        result = truncate(text, 15)
        assert result.endswith("...")
        assert len(result) == 15

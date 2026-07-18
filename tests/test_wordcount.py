"""Unit tests for word_count function."""

from src.app.helpers.wordcount import word_count


def test_word_count_normal_sentence():
    """Test word_count with a normal sentence."""
    result = word_count("hello world foo bar")
    assert result == 4


def test_word_count_single_word():
    """Test word_count with a single word."""
    result = word_count("hello")
    assert result == 1


def test_word_count_empty_string():
    """Test word_count with an empty string."""
    result = word_count("")
    assert result == 0


def test_word_count_whitespace_only():
    """Test word_count with whitespace-only string."""
    result = word_count("   ")
    assert result == 0


def test_word_count_tabs_and_newlines():
    """Test word_count with tabs and newlines."""
    result = word_count("hello\tworld\nfoo")
    assert result == 3


def test_word_count_multiple_spaces_between_words():
    """Test word_count with multiple spaces between words."""
    result = word_count("hello    world    foo")
    assert result == 3


def test_word_count_leading_and_trailing_spaces():
    """Test word_count with leading and trailing spaces."""
    result = word_count("   hello world   ")
    assert result == 2


def test_word_count_mixed_whitespace():
    """Test word_count with mixed whitespace characters."""
    result = word_count("  hello \t world  \n foo  ")
    assert result == 3

"""Comprehensive tests for the word_count utility function."""

from app.helpers.wordcount import word_count


def test_normal_sentence():
    """Test word_count with a normal sentence."""
    assert word_count("Hello world") == 2
    assert word_count("The quick brown fox") == 4


def test_single_word():
    """Test word_count with a single word."""
    assert word_count("hello") == 1


def test_empty_string():
    """Test word_count with an empty string."""
    assert word_count("") == 0


def test_whitespace_only():
    """Test word_count with whitespace-only strings."""
    assert word_count(" ") == 0
    assert word_count("   ") == 0
    assert word_count("\t") == 0
    assert word_count("\n") == 0


def test_multiple_spaces_between_words():
    """Test word_count with multiple spaces between words."""
    assert word_count("hello  world") == 2
    assert word_count("one   two   three") == 3
    assert word_count("a     b     c") == 3


def test_leading_and_trailing_whitespace():
    """Test word_count with leading and trailing whitespace."""
    assert word_count("  hello world  ") == 2
    assert word_count("\n\ntest\n\n") == 1
    assert word_count("   multiple   words   ") == 2


def test_mixed_whitespace():
    """Test word_count with mixed whitespace characters."""
    assert word_count("hello\tworld") == 2
    assert word_count("one\n\ntwo") == 2
    assert word_count("a\tb\nc") == 3
    assert word_count("word1  \t  word2") == 2


def test_long_sentence():
    """Test word_count with longer text."""
    text = "The quick brown fox jumps over the lazy dog"
    assert word_count(text) == 9


def test_special_characters_in_words():
    """Test word_count with words containing special characters."""
    assert word_count("hello-world test") == 2
    assert word_count("it's working") == 2
    assert word_count("email@example.com contact") == 2
    assert word_count("code123 var_name func()") == 3


def test_numbers_as_words():
    """Test word_count with numeric words."""
    assert word_count("123 456 789") == 3
    assert word_count("1 2 3 4 5") == 5

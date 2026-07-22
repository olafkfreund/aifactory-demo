from app.helpers.wordcount import word_count


def test_word_count_normal_sentence():
    """Test word_count with a normal sentence."""
    assert word_count("hello world") == 2


def test_word_count_multiple_words():
    """Test word_count with multiple words."""
    assert word_count("the quick brown fox jumps over the lazy dog") == 9


def test_word_count_single_word():
    """Test word_count with a single word."""
    assert word_count("hello") == 1


def test_word_count_empty_string():
    """Test word_count with an empty string."""
    assert word_count("") == 0


def test_word_count_whitespace_only():
    """Test word_count with whitespace-only strings."""
    assert word_count("   ") == 0
    assert word_count("\t") == 0
    assert word_count("\n") == 0


def test_word_count_multiple_spaces():
    """Test word_count with multiple spaces between words."""
    assert word_count("hello    world") == 2
    assert word_count("one  two   three") == 3


def test_word_count_leading_trailing_whitespace():
    """Test word_count with leading and trailing whitespace."""
    assert word_count("  hello world  ") == 2
    assert word_count("\thello world\t") == 2
    assert word_count("\n\nhello world\n\n") == 2


def test_word_count_mixed_whitespace():
    """Test word_count with mixed whitespace characters."""
    assert word_count("hello\tworld") == 2
    assert word_count("one  two\tthree\nfour") == 4
    assert word_count("  \t\n  hello  \t\n  world  ") == 2

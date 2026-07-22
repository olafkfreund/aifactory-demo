from app.helpers.reverse_string import reverse_string


def test_reverse_string_empty():
    """Test reversing an empty string."""
    assert reverse_string("") == ""


def test_reverse_string_single_char():
    """Test reversing a single character string."""
    assert reverse_string("a") == "a"


def test_reverse_string_multiple_chars():
    """Test reversing a string with multiple characters."""
    assert reverse_string("abc") == "cba"


def test_reverse_string_word():
    """Test reversing a word."""
    assert reverse_string("hello") == "olleh"

# AC#1: The feature works as described: Add a reverse_string(s) helper
# (docstring states empty strings are handled).
#
# This module covers the degenerate-length boundaries of reverse_string:
#   - an empty string reverses to an empty string
#   - a one-character string reverses to itself (any single character)
import pytest

from app.helpers.reverse_string import reverse_string


def test_reverse_string_empty_input_returns_empty_string():
    """AC#1: reverse_string('') returns '' rather than raising or returning None."""
    assert reverse_string("") == ""


@pytest.mark.parametrize(
    "char",
    ["a", "Z", "7", " ", "!", "é"],
    ids=["lower", "upper", "digit", "space", "punctuation", "unicode"],
)
def test_reverse_string_single_character_returns_same_character(char):
    """AC#1: a one-character string is its own reverse, whatever the character."""
    assert reverse_string(char) == char


def test_reverse_string_empty_input_returns_str_type():
    """AC#1: the empty-string result is still a str, so callers can chain on it."""
    result = reverse_string("")

    assert isinstance(result, str)
    assert len(result) == 0

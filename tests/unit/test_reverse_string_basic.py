"""AC#1: The feature works as described: Add a reverse_string(s) helper.

This module verifies that ``reverse_string`` returns the character-reversed
value for ordinary ASCII words, e.g. 'hello' -> 'olleh', plus the
single-character and empty-string boundaries.
"""

import pytest

from app.helpers.reverse_string import reverse_string


@pytest.mark.parametrize(
    "value,expected",
    [
        ("hello", "olleh"),
        ("abc", "cba"),
        ("Python", "nohtyP"),
        ("ab cd", "dc ba"),
    ],
    ids=["hello-word", "three-letters", "mixed-case", "with-space"],
)
def test_reverse_string_ascii_word_returns_reversed_characters(
    value: str, expected: str
) -> None:
    """reverse_string reverses the character order of an ASCII string."""
    assert reverse_string(value) == expected


def test_reverse_string_single_character_returns_same_character() -> None:
    """Boundary: a one-character string is its own reversal."""
    assert reverse_string("a") == "a"


def test_reverse_string_empty_string_returns_empty_string() -> None:
    """Boundary: reversing the empty string yields the empty string."""
    assert reverse_string("") == ""


def test_reverse_string_applied_twice_returns_original() -> None:
    """Reversing twice is the identity for ASCII input."""
    assert reverse_string(reverse_string("hello")) == "hello"

"""AC#1: The feature works as described: Add a reverse_string(s) helper.

Subtask: reverse-string-whitespace-and-symbols — verify reverse_string preserves
and reorders spaces, digits and punctuation, e.g. 'hello world' -> 'dlrow olleh'
and 'a!b@c#' -> '#c@b!a'.
"""

import pytest

from app.helpers.reverse_string import reverse_string


@pytest.mark.parametrize(
    "value,expected",
    [
        ("hello world", "dlrow olleh"),
        ("a!b@c#", "#c@b!a"),
        ("ab 12", "21 ba"),
        ("  ab", "ba  "),
        ("a\tb\nc", "c\nb\ta"),
        ("!@#$%^&*()", ")(*&^%$#@!"),
        ("0123456789", "9876543210"),
        (" ", " "),
    ],
    ids=[
        "space-separated-words",
        "interleaved-punctuation",
        "letters-and-digits",
        "leading-spaces-become-trailing",
        "tab-and-newline-whitespace",
        "punctuation-only",
        "digits-only",
        "single-space",
    ],
)
def test_reverse_string_with_whitespace_and_symbols_returns_reversed_sequence(
    value: str, expected: str
) -> None:
    """Spaces, digits and punctuation are preserved and reordered, not stripped."""
    assert reverse_string(value) == expected


def test_reverse_string_preserves_character_multiset_for_symbol_input() -> None:
    """Reversal changes order only — no character is dropped, added or altered."""
    value = "a!b @c# 1 2"

    result = reverse_string(value)

    assert sorted(result) == sorted(value)
    assert len(result) == len(value)


def test_reverse_string_applied_twice_to_symbol_input_returns_original() -> None:
    """reverse_string is an involution, including for whitespace/punctuation."""
    value = "hello world! 42 #tag"

    assert reverse_string(reverse_string(value)) == value

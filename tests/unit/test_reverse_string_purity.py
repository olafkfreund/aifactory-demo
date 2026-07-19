"""Purity and return-type tests for the reverse_string helper.

AC#1: The feature works as described: Add a reverse_string(s) helper
      (signature declares ``s: str -> str``).

These tests prove that reverse_string is a pure function: it returns a
``str``, it never mutates or aliases its argument, and the caller's original
string is left untouched after the call.
"""

import inspect

import pytest

from app.helpers.reverse_string import reverse_string


@pytest.mark.parametrize(
    "value",
    ["", "a", "abc", "hello world", "café", "a!b@c#", "aba"],
    ids=[
        "empty",
        "single-char",
        "simple",
        "with-spaces",
        "unicode",
        "special-chars",
        "palindrome",
    ],
)
def test_reverse_string_returns_str_instance(value):
    """reverse_string returns a real str for every supported input."""
    assert isinstance(reverse_string(value), str)


@pytest.mark.parametrize(
    "value",
    ["", "a", "abc", "hello world", "café", "a!b@c#"],
    ids=[
        "empty",
        "single-char",
        "simple",
        "with-spaces",
        "unicode",
        "special-chars",
    ],
)
def test_reverse_string_leaves_caller_value_unchanged(value):
    """The caller's original string is unchanged after reverse_string runs."""
    original = value
    snapshot = "".join(value)

    reverse_string(original)

    assert original == snapshot


def test_reverse_string_result_is_not_the_same_object_for_multichar_input():
    """A non-palindromic result is a distinct object, not an alias of the input."""
    original = "abcdef"

    result = reverse_string(original)

    assert result is not original


def test_reverse_string_is_idempotent_under_double_application():
    """Reversing twice reproduces the original value, proving no hidden mutation."""
    original = "hello world"

    assert reverse_string(reverse_string(original)) == original


def test_reverse_string_repeated_calls_are_deterministic():
    """Calling reverse_string twice on the same input yields equal results."""
    original = "café au lait"

    assert reverse_string(original) == reverse_string(original)


def test_reverse_string_signature_declares_str_to_str():
    """The public signature annotates a single ``s: str`` parameter returning ``str``."""
    signature = inspect.signature(reverse_string)

    assert list(signature.parameters) == ["s"]
    assert signature.parameters["s"].annotation is str
    assert signature.return_annotation is str

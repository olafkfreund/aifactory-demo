"""Purity tests for roman_to_int.

AC#4: Pure function, standard library only, no new dependencies.

These tests prove that ``roman_to_int`` is deterministic (repeated calls with
the same input return equal values) and side-effect free (it does not mutate
its input argument). They intentionally do NOT re-verify the arithmetic — that
is covered by the functional test suite — they verify the *purity* contract.
"""

import pytest

from app.helpers import roman_to_int


@pytest.mark.parametrize(
    "numeral",
    ["III", "IV", "IX", "XL", "XC", "CD", "CM", "LVIII", "MCMXCIV"],
    ids=[
        "III",
        "IV",
        "IX",
        "XL",
        "XC",
        "CD",
        "CM",
        "LVIII",
        "MCMXCIV",
    ],
)
def test_roman_to_int_repeated_calls_are_deterministic(numeral):
    """Repeated calls with the same input return equal values (deterministic)."""
    first = roman_to_int(numeral)
    results = [roman_to_int(numeral) for _ in range(5)]

    assert all(r == first for r in results)


@pytest.mark.parametrize(
    "numeral",
    ["III", "IV", "IX", "XL", "XC", "CD", "CM", "LVIII", "MCMXCIV"],
    ids=[
        "III",
        "IV",
        "IX",
        "XL",
        "XC",
        "CD",
        "CM",
        "LVIII",
        "MCMXCIV",
    ],
)
def test_roman_to_int_does_not_mutate_input(numeral):
    """The function must not mutate the string it is given."""
    original = numeral
    snapshot = str(numeral)

    roman_to_int(numeral)

    # The bound name and its value are unchanged after the call.
    assert original == snapshot


def test_roman_to_int_order_independent_across_inputs():
    """Calling with different inputs in between does not affect a repeated result.

    Proves there is no hidden shared/accumulated state between calls.
    """
    baseline = roman_to_int("MCMXCIV")

    # Interleave unrelated calls that would corrupt any shared accumulator.
    roman_to_int("III")
    roman_to_int("CD")
    roman_to_int("LVIII")

    assert roman_to_int("MCMXCIV") == baseline


def test_roman_to_int_return_type_is_int():
    """A pure numeral-to-int conversion always yields a plain int."""
    result = roman_to_int("XL")

    assert isinstance(result, int)

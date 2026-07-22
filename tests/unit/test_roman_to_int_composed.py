"""Unit tests for roman_to_int on composed numerals.

AC#5: Include unit tests covering the examples above and each subtractive pair.

This module focuses on composed numerals that combine additive and subtractive
notation in a single string (e.g. XIV=14, XLII=42, CDXLIV=444, MMXXIV=2024),
proving the running scan correctly mixes both forms.
"""

import pytest

from app.helpers import roman_to_int


@pytest.mark.parametrize(
    "numeral,expected",
    [
        ("XIV", 14),
        ("XLII", 42),
        ("CDXLIV", 444),
        ("MMXXIV", 2024),
        ("MCMXCIV", 1994),
        ("LVIII", 58),
    ],
    ids=[
        "XIV=14",
        "XLII=42",
        "CDXLIV=444",
        "MMXXIV=2024",
        "MCMXCIV=1994",
        "LVIII=58",
    ],
)
def test_roman_to_int_composed_numeral_returns_expected(numeral, expected):
    """Composed additive+subtractive numerals convert to their integer value (AC#5)."""
    assert roman_to_int(numeral) == expected


@pytest.mark.parametrize(
    "numeral,expected",
    [
        ("IV", 4),
        ("IX", 9),
        ("XL", 40),
        ("XC", 90),
        ("CD", 400),
        ("CM", 900),
    ],
    ids=["IV=4", "IX=9", "XL=40", "XC=90", "CD=400", "CM=900"],
)
def test_roman_to_int_subtractive_pair_within_composed_context_returns_expected(
    numeral, expected
):
    """Each subtractive pair, embedded after an additive prefix, still resolves (AC#5)."""
    # Prefix "MM" (2000) exercises the pair inside a larger composed numeral.
    assert roman_to_int("MM" + numeral) == 2000 + expected


def test_roman_to_int_composed_all_subtractive_pairs_chained_returns_combined():
    """A numeral chaining several subtractive pairs sums correctly (CDXLIV == 444) (AC#5)."""
    assert roman_to_int("CDXLIV") == 444

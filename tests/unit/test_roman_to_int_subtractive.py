"""Unit tests for roman_to_int subtractive notation.

AC#2: Handles subtractive notation:
    IV = 4, IX = 9, XL = 40, XC = 90, CD = 400, CM = 900.
"""

import pytest

from app.helpers import roman_to_int


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
def test_roman_to_int_subtractive_pair_returns_expected(numeral, expected):
    """Each subtractive pair converts to its documented integer value (AC#2)."""
    assert roman_to_int(numeral) == expected


def test_roman_to_int_subtractive_pairs_chained_returns_combined_value():
    """Chained subtractive pairs combine correctly (CM+XC+IX == 999) (AC#2)."""
    assert roman_to_int("CMXCIX") == 999

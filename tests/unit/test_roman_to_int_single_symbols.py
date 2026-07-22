"""Unit tests for roman_to_int single-symbol conversion.

AC#1: A function roman_to_int(s: str) -> int that converts a valid Roman
numeral (uppercase, I V X L C D M) to its integer value.

This module proves that each single Roman symbol maps to its correct
integer value, which is the foundation the full conversion builds on.
"""

import pytest

from app.helpers import roman_to_int


@pytest.mark.parametrize(
    "symbol,expected",
    [
        ("I", 1),
        ("V", 5),
        ("X", 10),
        ("L", 50),
        ("C", 100),
        ("D", 500),
        ("M", 1000),
    ],
    ids=["I=1", "V=5", "X=10", "L=50", "C=100", "D=500", "M=1000"],
)
def test_roman_to_int_single_symbol_returns_its_value(symbol, expected):
    """Each single Roman symbol converts to its integer value (AC#1)."""
    assert roman_to_int(symbol) == expected

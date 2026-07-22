"""Tests for the clamp helper's documented int/float examples.

AC#3: Works for ints and floats. Examples:
    clamp(5, 0, 10) == 5
    clamp(-3, 0, 10) == 0
    clamp(99, 0, 10) == 10
    clamp(7.5, 0, 10) == 7.5
"""

import pytest

from app.math import clamp


@pytest.mark.parametrize(
    "value,low,high,expected",
    [
        (5, 0, 10, 5),
        (-3, 0, 10, 0),
        (99, 0, 10, 10),
        (7.5, 0, 10, 7.5),
    ],
    ids=[
        "in_range_int_returns_value",
        "below_range_int_returns_low",
        "above_range_int_returns_high",
        "in_range_float_returns_value",
    ],
)
def test_clamp_documented_examples_return_expected(value, low, high, expected):
    """Each documented AC#3 example clamps to the expected result."""
    assert clamp(value, low, high) == expected


def test_clamp_float_in_range_preserves_float_value():
    """A float within range is returned unchanged (AC#3 float example)."""
    result = clamp(7.5, 0, 10)
    assert result == 7.5

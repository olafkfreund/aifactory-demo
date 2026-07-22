# AC#2: If value < low it returns low; if value > high it returns high;
# otherwise it returns value unchanged (the in-range case, low <= value <= high).
# This module verifies clamp returns value unchanged when it lies within
# the inclusive range, including the boundary values equal to low and high.

import pytest

from app.math import clamp


@pytest.mark.parametrize(
    "value,low,high,expected",
    [
        (5, 0, 10, 5),
        (1, 0, 10, 1),
        (9, 0, 10, 9),
        (7.5, 0, 10, 7.5),
        (-2, -5, 5, -2),
        (0, 0, 10, 0),
    ],
    ids=[
        "mid-range-int",
        "just-above-low",
        "just-below-high",
        "mid-range-float",
        "negative-in-range",
        "value-at-low-boundary",
    ],
)
def test_clamp_value_within_range_returns_value_unchanged(value, low, high, expected):
    assert clamp(value, low, high) == expected


def test_clamp_value_equal_to_low_returns_value_unchanged():
    assert clamp(3, 3, 10) == 3


def test_clamp_value_equal_to_high_returns_value_unchanged():
    assert clamp(10, 0, 10) == 10


def test_clamp_value_equal_to_both_bounds_returns_value_unchanged():
    assert clamp(4, 4, 4) == 4

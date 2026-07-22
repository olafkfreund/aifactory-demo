"""AC#5: boundary values (equal to low and high).

Verify clamp returns the boundary value unchanged when value equals low
and when value equals high — the inclusive [low, high] range endpoints.
"""

import pytest

from app.math import clamp


@pytest.mark.parametrize(
    "value,low,high,expected",
    [
        (0, 0, 10, 0),
        (10, 0, 10, 10),
        (-5, -5, 5, -5),
        (5, -5, 5, 5),
        (0.0, 0.0, 1.0, 0.0),
        (1.0, 0.0, 1.0, 1.0),
    ],
    ids=[
        "value-equals-low-int",
        "value-equals-high-int",
        "value-equals-low-negative",
        "value-equals-high-positive",
        "value-equals-low-float",
        "value-equals-high-float",
    ],
)
def test_clamp_value_equals_boundary_returns_value(value, low, high, expected):
    """clamp returns the boundary value unchanged when value == low or == high."""
    assert clamp(value, low, high) == expected


def test_clamp_value_equals_low_is_inclusive():
    """The lower bound is inclusive: clamp(low, low, high) returns low."""
    assert clamp(3, 3, 8) == 3


def test_clamp_value_equals_high_is_inclusive():
    """The upper bound is inclusive: clamp(high, low, high) returns high."""
    assert clamp(8, 3, 8) == 8

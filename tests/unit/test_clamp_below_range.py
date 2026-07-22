"""Tests for clamp() below-range behaviour.

AC#2: If ``value < low`` it returns ``low``.
Proves that ``clamp(value, low, high)`` constrains any value below the lower
bound up to ``low``, for both int and float inputs.
"""

import pytest

from app.math import clamp


@pytest.mark.parametrize(
    "value,low,high,expected",
    [
        (-3, 0, 10, 0),
        (-1, 0, 10, 0),
        (-100, -10, 10, -10),
        (5, 6, 10, 6),
        (0.5, 1.0, 10.0, 1.0),
        (-2.5, 0.0, 10.0, 0.0),
    ],
    ids=[
        "neg-int-below-zero-low",
        "just-below-low",
        "far-below-negative-low",
        "positive-below-positive-low",
        "float-below-float-low",
        "negative-float-below-low",
    ],
)
def test_clamp_value_below_low_returns_low(value, low, high, expected):
    """When value < low, clamp returns low unchanged."""
    assert clamp(value, low, high) == expected

"""Tests for the clamp helper — above-range behaviour.

AC#2: If ``value > high`` it returns ``high``.
(Target: ``src/app/math.py::clamp``; imported as ``app.math.clamp``.)
"""

import pytest

from app.math import clamp


class TestClampAboveRange:
    """value > high must be pulled down to high (AC#2)."""

    def test_clamp_int_above_high_returns_high(self):
        """An int above the range returns high, not the input."""
        assert clamp(99, 0, 10) == 10

    def test_clamp_float_above_high_returns_high(self):
        """A float above the range returns high."""
        assert clamp(12.5, 0, 10) == 10

    def test_clamp_at_high_boundary_returns_high(self):
        """The inclusive upper boundary returns the value unchanged."""
        assert clamp(10, 0, 10) == 10

    @pytest.mark.parametrize(
        "value,low,high,expected",
        [
            (11, 0, 10, 10),
            (10.0001, 0, 10, 10),
            (5, -5, 4, 4),
            (100, 0, 1, 1),
        ],
        ids=[
            "int-just-above",
            "float-just-above",
            "negative-range",
            "large-overshoot",
        ],
    )
    def test_clamp_various_above_high_returns_high(self, value, low, high, expected):
        """Any value strictly greater than high clamps to high."""
        assert clamp(value, low, high) == expected

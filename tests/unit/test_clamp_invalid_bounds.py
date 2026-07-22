"""Tests for clamp() invalid-bounds handling.

AC#4: If ``low > high``, ``clamp(value, low, high)`` must raise ``ValueError``.
"""

import pytest

from app.math import clamp


class TestClampInvalidBounds:
    """clamp() must reject inverted bounds (low > high) with ValueError."""

    def test_low_greater_than_high_raises_value_error(self):
        """low strictly greater than high raises ValueError."""
        with pytest.raises(ValueError):
            clamp(5, 10, 0)

    @pytest.mark.parametrize(
        "value,low,high",
        [
            (5, 10, 0),
            (-3, 1, -1),
            (0, 100, 99),
            (7.5, 10.0, 0.0),
            (50, 1, -1000),
        ],
        ids=[
            "int-wide-gap",
            "negative-high",
            "adjacent-inverted",
            "float-inverted",
            "large-inverted",
        ],
    )
    def test_inverted_bounds_raise_value_error(self, value, low, high):
        """Any low > high raises ValueError regardless of value/type."""
        with pytest.raises(ValueError):
            clamp(value, low, high)

    def test_equal_bounds_do_not_raise(self):
        """low == high is a valid (degenerate) range and must not raise."""
        assert clamp(5, 3, 3) == 3

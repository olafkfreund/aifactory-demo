# AC#3: Handles negative inputs by using absolute values: gcd(-12, 8) == 4.
#
# These tests prove that gcd normalizes negative operands via abs() before
# running the Euclidean algorithm, so the sign of either argument never
# affects the (always non-negative) result.

import pytest

from app.utils import gcd


def test_gcd_negative_first_operand_returns_absolute_gcd():
    """gcd(-12, 8) == 4 — the canonical AC#3 example."""
    assert gcd(-12, 8) == 4


@pytest.mark.parametrize(
    "a,b,expected",
    [
        (-12, 8, 4),
        (12, -8, 4),
        (-12, -8, 4),
        (-17, 5, 1),
        (17, -5, 1),
        (-5, 0, 5),
        (0, -5, 5),
    ],
    ids=[
        "neg_first",
        "neg_second",
        "both_neg",
        "neg_coprime",
        "neg_second_coprime",
        "neg_with_zero",
        "zero_with_neg",
    ],
)
def test_gcd_negative_operands_use_absolute_values(a, b, expected):
    """Negative operands yield the same non-negative gcd as their absolutes."""
    assert gcd(a, b) == expected


def test_gcd_negative_result_is_never_negative():
    """The result is always non-negative regardless of operand signs."""
    assert gcd(-12, -8) >= 0

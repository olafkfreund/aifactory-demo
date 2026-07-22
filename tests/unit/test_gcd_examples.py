"""AC#2: gcd(12, 8) == 4, gcd(17, 5) == 1, gcd(0, 5) == 5, gcd(5, 0) == 5.

Verifies the documented example values of the Euclidean-algorithm gcd helper,
including the coprime case and both single-zero boundary cases.
"""

import pytest

from app.utils import gcd


@pytest.mark.parametrize(
    "a,b,expected",
    [
        (12, 8, 4),
        (17, 5, 1),
        (0, 5, 5),
        (5, 0, 5),
    ],
    ids=[
        "gcd(12,8)==4",
        "gcd(17,5)==1-coprime",
        "gcd(0,5)==5-first-zero",
        "gcd(5,0)==5-second-zero",
    ],
)
def test_gcd_example_values_return_expected(a, b, expected):
    """Each documented example pair returns its expected greatest common divisor."""
    assert gcd(a, b) == expected

# AC#4: gcd(0, 0) == 0.
#
# Proves that gcd returns 0 when both operands are zero — the degenerate
# case of the Euclidean algorithm where there is no positive common divisor.
from app.utils import gcd


def test_gcd_zero_and_zero_returns_zero():
    assert gcd(0, 0) == 0

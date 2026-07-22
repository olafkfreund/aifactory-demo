"""Unit tests for utility functions."""

from app.utils import gcd


def test_gcd_basic_case():
    """Test gcd with basic case: gcd(12, 8) == 4."""
    assert gcd(12, 8) == 4


def test_gcd_coprime_numbers():
    """Test gcd with coprime numbers: gcd(17, 5) == 1."""
    assert gcd(17, 5) == 1


def test_gcd_first_zero():
    """Test gcd when first argument is zero: gcd(0, 5) == 5."""
    assert gcd(0, 5) == 5


def test_gcd_second_zero():
    """Test gcd when second argument is zero: gcd(5, 0) == 5."""
    assert gcd(5, 0) == 5


def test_gcd_both_zero():
    """Test gcd when both arguments are zero: gcd(0, 0) == 0."""
    assert gcd(0, 0) == 0


def test_gcd_negative_first():
    """Test gcd with negative first argument: gcd(-12, 8) == 4."""
    assert gcd(-12, 8) == 4


def test_gcd_both_negative():
    """Test gcd with both arguments negative: gcd(-12, -8) == 4."""
    assert gcd(-12, -8) == 4

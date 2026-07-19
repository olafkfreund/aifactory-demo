"""Unit tests for the gcd() function."""

from src.app.utils import gcd


def test_gcd_basic_example_1():
    """Test basic example: gcd(12, 8) == 4."""
    assert gcd(12, 8) == 4


def test_gcd_basic_example_2():
    """Test basic example: gcd(17, 5) == 1."""
    assert gcd(17, 5) == 1


def test_gcd_zero_second_argument():
    """Test zero as second argument: gcd(0, 5) == 5."""
    assert gcd(0, 5) == 5


def test_gcd_zero_first_argument():
    """Test zero as first argument: gcd(5, 0) == 5."""
    assert gcd(5, 0) == 5


def test_gcd_both_zero():
    """Test both arguments zero: gcd(0, 0) == 0."""
    assert gcd(0, 0) == 0


def test_gcd_negative_first_argument():
    """Test negative first argument: gcd(-12, 8) == 4."""
    assert gcd(-12, 8) == 4


def test_gcd_negative_second_argument():
    """Test negative second argument: gcd(12, -8) == 4."""
    assert gcd(12, -8) == 4


def test_gcd_both_negative():
    """Test both arguments negative: gcd(-12, -8) == 4."""
    assert gcd(-12, -8) == 4


def test_gcd_commutative_property():
    """Test that gcd(a, b) == gcd(b, a)."""
    assert gcd(12, 8) == gcd(8, 12)
    assert gcd(17, 5) == gcd(5, 17)
    assert gcd(100, 50) == gcd(50, 100)


def test_gcd_identical_numbers():
    """Test gcd of identical numbers returns the number itself."""
    assert gcd(5, 5) == 5
    assert gcd(100, 100) == 100
    assert gcd(1, 1) == 1


def test_gcd_coprime_numbers():
    """Test gcd of coprime numbers (gcd == 1)."""
    assert gcd(7, 11) == 1
    assert gcd(13, 17) == 1
    assert gcd(1, 100) == 1
    assert gcd(9, 16) == 1


def test_gcd_one_divides_other():
    """Test when one number divides the other."""
    assert gcd(10, 5) == 5
    assert gcd(20, 5) == 5
    assert gcd(100, 10) == 10


def test_gcd_large_numbers():
    """Test with larger numbers."""
    assert gcd(1071, 462) == 21
    assert gcd(2520, 1890) == 630


def test_gcd_with_one():
    """Test gcd with 1 (gcd of any number and 1 is 1)."""
    assert gcd(1, 5) == 1
    assert gcd(100, 1) == 1
    assert gcd(1, 1) == 1


def test_gcd_negative_with_zero():
    """Test negative numbers with zero."""
    assert gcd(-5, 0) == 5
    assert gcd(0, -5) == 5
    assert gcd(-5, -5) == 5

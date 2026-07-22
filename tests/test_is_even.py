"""Comprehensive test cases for the is_even helper function."""

import pytest

from app.helpers.is_even import is_even


class TestIsEvenBasicCases:
    """Test basic even and odd number cases."""

    def test_zero_is_even(self):
        """Test that zero is considered even."""
        assert is_even(0) is True

    def test_positive_even_number(self):
        """Test that positive even numbers return True."""
        assert is_even(4) is True

    def test_positive_odd_number(self):
        """Test that positive odd numbers return False."""
        assert is_even(3) is False

    def test_negative_even_number(self):
        """Test that negative even numbers return True."""
        assert is_even(-2) is True

    def test_negative_odd_number(self):
        """Test that negative odd numbers return False."""
        assert is_even(-7) is False


class TestIsEvenEdgeCases:
    """Test edge cases and boundary conditions."""

    def test_one_is_odd(self):
        """Test that one is odd."""
        assert is_even(1) is False

    def test_negative_one_is_odd(self):
        """Test that negative one is odd."""
        assert is_even(-1) is False

    def test_two_is_even(self):
        """Test that two is even."""
        assert is_even(2) is True

    def test_negative_two_is_even(self):
        """Test that negative two is even."""
        assert is_even(-2) is True

    def test_large_positive_even_number(self):
        """Test that large positive even numbers return True."""
        assert is_even(1000000) is True

    def test_large_positive_odd_number(self):
        """Test that large positive odd numbers return False."""
        assert is_even(999999) is False

    def test_large_negative_even_number(self):
        """Test that large negative even numbers return True."""
        assert is_even(-1000000) is True

    def test_large_negative_odd_number(self):
        """Test that large negative odd numbers return False."""
        assert is_even(-999999) is False


class TestIsEvenConsistency:
    """Test consistency of the function behavior."""

    def test_multiple_even_numbers(self):
        """Test multiple even numbers return True consistently."""
        even_numbers = [0, 2, 4, 6, 8, 10, -2, -4, -6, -8, -10]
        for num in even_numbers:
            assert is_even(num) is True, f"Expected {num} to be even"

    def test_multiple_odd_numbers(self):
        """Test multiple odd numbers return False consistently."""
        odd_numbers = [1, 3, 5, 7, 9, 11, -1, -3, -5, -7, -9, -11]
        for num in odd_numbers:
            assert is_even(num) is False, f"Expected {num} to be odd"

    def test_return_type_is_boolean_true(self):
        """Test that the return value is actually a boolean True."""
        result = is_even(4)
        assert result is True
        assert type(result) is bool

    def test_return_type_is_boolean_false(self):
        """Test that the return value is actually a boolean False."""
        result = is_even(3)
        assert result is False
        assert type(result) is bool

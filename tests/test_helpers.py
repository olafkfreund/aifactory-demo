"""Tests for the helpers module."""

import pytest

from src.app.helpers import factorial


class TestFactorial:
    """Test suite for the factorial function."""

    def test_factorial_zero_equals_one(self) -> None:
        """AC#1: factorial(0) == 1"""
        assert factorial(0) == 1

    def test_factorial_five_equals_one_hundred_twenty(self) -> None:
        """AC#2: factorial(5) == 120"""
        assert factorial(5) == 120

    def test_factorial_negative_raises_value_error(self) -> None:
        """AC#3: factorial(-1) raises ValueError"""
        with pytest.raises(ValueError):
            factorial(-1)

    def test_factorial_one(self) -> None:
        """Test factorial(1) == 1"""
        assert factorial(1) == 1

    def test_factorial_two(self) -> None:
        """Test factorial(2) == 2"""
        assert factorial(2) == 2

    def test_factorial_three(self) -> None:
        """Test factorial(3) == 6"""
        assert factorial(3) == 6

    def test_factorial_four(self) -> None:
        """Test factorial(4) == 24"""
        assert factorial(4) == 24

    def test_factorial_ten(self) -> None:
        """Test factorial(10) == 3628800"""
        assert factorial(10) == 3628800

    def test_factorial_negative_one_raises_value_error(self) -> None:
        """Test that negative values raise ValueError"""
        with pytest.raises(ValueError):
            factorial(-1)

    def test_factorial_negative_five_raises_value_error(self) -> None:
        """Test that negative values raise ValueError"""
        with pytest.raises(ValueError):
            factorial(-5)

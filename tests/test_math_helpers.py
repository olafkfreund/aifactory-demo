"""Comprehensive tests for math_helpers module.

This test module provides thorough coverage of the factorial function,
including edge cases, normal cases, and error conditions.
"""

import pytest

from src.app.math_helpers import factorial


class TestFactorialEdgeCases:
    """Test factorial edge cases."""

    def test_factorial_zero(self):
        """Test that factorial(0) returns 1."""
        assert factorial(0) == 1

    def test_factorial_one(self):
        """Test that factorial(1) returns 1."""
        assert factorial(1) == 1


class TestFactorialNormalCases:
    """Test factorial with normal positive integers."""

    def test_factorial_two(self):
        """Test that factorial(2) returns 2."""
        assert factorial(2) == 2

    def test_factorial_three(self):
        """Test that factorial(3) returns 6."""
        assert factorial(3) == 6

    def test_factorial_four(self):
        """Test that factorial(4) returns 24."""
        assert factorial(4) == 24

    def test_factorial_five(self):
        """Test that factorial(5) returns 120."""
        assert factorial(5) == 120

    def test_factorial_ten(self):
        """Test that factorial(10) returns 3628800."""
        assert factorial(10) == 3628800

    def test_factorial_large_number(self):
        """Test factorial with a larger number."""
        # 20! = 2432902008176640000
        assert factorial(20) == 2432902008176640000

    def test_factorial_sequential_values(self):
        """Test that factorial values follow expected mathematical relationship."""
        # factorial(n) should equal n * factorial(n-1)
        for n in range(1, 11):
            expected = n * factorial(n - 1)
            assert factorial(n) == expected


class TestFactorialErrorCases:
    """Test factorial error handling for invalid inputs."""

    def test_factorial_negative_one(self):
        """Test that factorial(-1) raises ValueError."""
        with pytest.raises(ValueError) as exc_info:
            factorial(-1)
        assert "negative" in str(exc_info.value).lower()

    def test_factorial_negative_five(self):
        """Test that factorial(-5) raises ValueError."""
        with pytest.raises(ValueError) as exc_info:
            factorial(-5)
        assert "negative" in str(exc_info.value).lower()

    def test_factorial_large_negative(self):
        """Test that factorial with large negative number raises ValueError."""
        with pytest.raises(ValueError) as exc_info:
            factorial(-1000)
        assert "negative" in str(exc_info.value).lower()

    def test_factorial_negative_error_message_content(self):
        """Test that ValueError for negative n contains the actual value."""
        n = -7
        with pytest.raises(ValueError) as exc_info:
            factorial(n)
        error_message = str(exc_info.value)
        assert "n=" in error_message or str(abs(n)) in error_message


class TestFactorialReturnType:
    """Test that factorial returns correct type."""

    def test_factorial_returns_int(self):
        """Test that factorial returns an integer."""
        result = factorial(5)
        assert isinstance(result, int)

    def test_factorial_zero_is_int(self):
        """Test that factorial(0) returns an integer."""
        result = factorial(0)
        assert isinstance(result, int)
        assert result == 1

    def test_factorial_large_result_is_int(self):
        """Test that large factorial results are still integers."""
        result = factorial(100)
        assert isinstance(result, int)


class TestFactorialMathematicalProperties:
    """Test mathematical properties of the factorial function."""

    def test_factorial_is_increasing(self):
        """Test that factorial is monotonically increasing (non-decreasing for n>=0)."""
        prev = factorial(0)
        for n in range(1, 15):
            current = factorial(n)
            assert current >= prev, f"factorial({n}) should be >= factorial({n-1})"
            prev = current
        # Additionally verify strict increase for n >= 2
        for n in range(2, 15):
            assert factorial(n) > factorial(n - 1), f"factorial({n}) should be > factorial({n-1})"

    def test_factorial_multiplicative_property(self):
        """Test the multiplicative property: n! = n * (n-1)!."""
        for n in range(2, 12):
            assert factorial(n) == n * factorial(n - 1)

    def test_factorial_specific_known_values(self):
        """Test against known factorial values."""
        known_values = {
            0: 1,
            1: 1,
            2: 2,
            3: 6,
            4: 24,
            5: 120,
            6: 720,
            7: 5040,
            8: 40320,
            9: 362880,
            10: 3628800,
            11: 39916800,
            12: 479001600,
            13: 6227020800,
            14: 87178291200,
            15: 1307674368000,
        }
        for n, expected in known_values.items():
            assert factorial(n) == expected, f"factorial({n}) should equal {expected}"


class TestFactorialBoundaryConditions:
    """Test factorial at boundary conditions."""

    def test_factorial_boundary_negative_to_zero(self):
        """Test behavior at the boundary between negative and non-negative."""
        # Just before the boundary
        with pytest.raises(ValueError):
            factorial(-1)
        # At the boundary
        assert factorial(0) == 1

    def test_factorial_very_large_input(self):
        """Test factorial with very large valid input."""
        # factorial(50) should be a large number
        result = factorial(50)
        assert result > 0
        assert isinstance(result, int)
        # Verify it's actually a large number
        assert result > 10**60


class TestFactorialInputValidation:
    """Test input validation for factorial function."""

    def test_factorial_with_negative_boundary_values(self):
        """Test factorial with various negative values."""
        negative_values = [-1, -2, -10, -100, -999]
        for n in negative_values:
            with pytest.raises(ValueError):
                factorial(n)

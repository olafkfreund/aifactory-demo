"""Unit tests for the clamp() function."""

import pytest

from app.math import clamp


class TestClampInRange:
    """Tests for values within the clamping range."""

    def test_clamp_value_in_range(self):
        """Test that values within range are returned unchanged."""
        assert clamp(5, 0, 10) == 5
        assert clamp(3, 0, 10) == 3
        assert clamp(7, 0, 10) == 7

    def test_clamp_at_low_boundary(self):
        """Test that value equal to low boundary returns low."""
        assert clamp(0, 0, 10) == 0
        assert clamp(5.0, 5.0, 10.0) == 5.0

    def test_clamp_at_high_boundary(self):
        """Test that value equal to high boundary returns high."""
        assert clamp(10, 0, 10) == 10
        assert clamp(10.0, 0.0, 10.0) == 10.0


class TestClampBelowRange:
    """Tests for values below the clamping range."""

    def test_clamp_below_range_integer(self):
        """Test that values below range are clamped to low."""
        assert clamp(-3, 0, 10) == 0
        assert clamp(-100, 0, 10) == 0

    def test_clamp_below_range_float(self):
        """Test that float values below range are clamped to low."""
        assert clamp(-3.5, 0.0, 10.0) == 0.0
        assert clamp(-0.1, 0.0, 10.0) == 0.0


class TestClampAboveRange:
    """Tests for values above the clamping range."""

    def test_clamp_above_range_integer(self):
        """Test that values above range are clamped to high."""
        assert clamp(99, 0, 10) == 10
        assert clamp(200, 0, 10) == 10

    def test_clamp_above_range_float(self):
        """Test that float values above range are clamped to high."""
        assert clamp(15.5, 0.0, 10.0) == 10.0
        assert clamp(10.1, 0.0, 10.0) == 10.0


class TestClampWithFloats:
    """Tests specifically for float inputs."""

    def test_clamp_float_in_range(self):
        """Test float values within range."""
        assert clamp(7.5, 0.0, 10.0) == 7.5
        assert clamp(0.5, 0.0, 1.0) == 0.5

    def test_clamp_float_boundaries(self):
        """Test float values at boundaries."""
        assert clamp(0.0, 0.0, 1.0) == 0.0
        assert clamp(1.0, 0.0, 1.0) == 1.0

    def test_clamp_float_negative_range(self):
        """Test float values with negative range."""
        assert clamp(-5.5, -10.0, -1.0) == -5.5
        assert clamp(-15.0, -10.0, -1.0) == -10.0
        assert clamp(0.0, -10.0, -1.0) == -1.0


class TestClampWithIntegers:
    """Tests specifically for integer inputs."""

    def test_clamp_integer_in_range(self):
        """Test integer values within range."""
        assert clamp(5, 0, 10) == 5
        assert clamp(1, 0, 10) == 1

    def test_clamp_integer_negative(self):
        """Test integer values with negative range."""
        assert clamp(-5, -10, 0) == -5
        assert clamp(-15, -10, 0) == -10
        assert clamp(5, -10, 0) == 0


class TestClampErrorHandling:
    """Tests for error conditions."""

    def test_clamp_raises_when_low_greater_than_high(self):
        """Test that ValueError is raised when low > high."""
        with pytest.raises(ValueError) as exc_info:
            clamp(5, 10, 0)
        assert "low" in str(exc_info.value)
        assert "high" in str(exc_info.value)

    def test_clamp_raises_with_float_invalid_range(self):
        """Test ValueError with float invalid range."""
        with pytest.raises(ValueError):
            clamp(5.0, 10.0, 0.0)

    def test_clamp_raises_with_negative_invalid_range(self):
        """Test ValueError with negative invalid range."""
        with pytest.raises(ValueError):
            clamp(-5, 0, -10)


class TestClampEdgeCases:
    """Tests for edge cases and special scenarios."""

    def test_clamp_zero_width_range(self):
        """Test clamping when low == high."""
        assert clamp(5, 5, 5) == 5
        assert clamp(0, 5, 5) == 5
        assert clamp(10, 5, 5) == 5

    def test_clamp_large_numbers(self):
        """Test with large numeric values."""
        assert clamp(1e6, 0, 1e6) == 1e6
        assert clamp(1e10, 0, 1e6) == 1e6

    def test_clamp_very_small_numbers(self):
        """Test with very small numeric values."""
        assert clamp(1e-10, 0.0, 1.0) == 1e-10
        assert clamp(-1e-10, 0.0, 1.0) == 0.0

    def test_clamp_mixed_int_float(self):
        """Test with mixed integer and float arguments."""
        assert clamp(5, 0.0, 10) == 5
        assert clamp(5.5, 0, 10.0) == 5.5

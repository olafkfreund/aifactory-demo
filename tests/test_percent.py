"""Tests for the percent formatter."""

import pytest

from src.app.fmt.percent import percent


class TestPercentFormatter:
    """Test suite for the percent formatter."""

    def test_zero(self):
        """Test formatting zero."""
        assert percent(0) == "0.0%"

    def test_one_hundred_percent(self):
        """Test formatting 100% (value of 1.0)."""
        assert percent(1) == "100.0%"

    def test_twelve_point_three_percent(self):
        """Test formatting 12.3%."""
        assert percent(0.123) == "12.3%"

    def test_fifty_percent(self):
        """Test formatting 50%."""
        assert percent(0.5) == "50.0%"

    def test_one_percent(self):
        """Test formatting 1%."""
        assert percent(0.01) == "1.0%"

    def test_small_fraction(self):
        """Test formatting a small fraction like 0.1%."""
        assert percent(0.001) == "0.1%"

    def test_very_small_fraction(self):
        """Test formatting a very small fraction that rounds."""
        assert percent(0.0001) == "0.0%"

    def test_large_percentage(self):
        """Test formatting a large percentage."""
        assert percent(10) == "1000.0%"

    def test_negative_percentage(self):
        """Test formatting a negative percentage."""
        assert percent(-0.05) == "-5.0%"

    def test_negative_one_hundred_percent(self):
        """Test formatting -100%."""
        assert percent(-1) == "-100.0%"

    def test_fractional_with_rounding(self):
        """Test formatting with rounding."""
        assert percent(0.12345) == "12.3%"

    def test_fractional_rounding_down(self):
        """Test rounding down."""
        assert percent(0.1234) == "12.3%"

    def test_fractional_rounding_up(self):
        """Test rounding up."""
        assert percent(0.126) == "12.6%"

    def test_decimal_precision(self):
        """Test that output always has exactly one decimal place."""
        for value in [0, 0.5, 0.123, 1, 10, -0.5]:
            formatted = percent(value)
            assert formatted.endswith("%")
            assert formatted.count(".") == 1
            number_part = formatted.replace("%", "").replace("-", "")
            assert len(number_part.split(".")[1]) == 1

    def test_format_includes_percentage_sign(self):
        """Test that all formatted values include the % sign."""
        assert "%" in percent(0)
        assert "%" in percent(0.5)
        assert "%" in percent(1)
        assert "%" in percent(-0.5)

    def test_zero_point_zero_percent(self):
        """Test formatting values that should result in 0.0%."""
        assert percent(0) == "0.0%"
        assert percent(0.0) == "0.0%"

    def test_negative_zero(self):
        """Test formatting negative zero."""
        assert percent(-0.0) == "0.0%"

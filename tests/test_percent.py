"""Tests for the percent formatting module."""

from helpers.percent import format_percent


def test_format_percent_basic():
    """Test basic percentage formatting with default digits."""
    assert format_percent(0.5) == "50.0%"


def test_format_percent_with_digits():
    """Test percentage formatting with custom decimal places."""
    assert format_percent(0.123, digits=2) == "12.30%"


def test_format_percent_with_more_digits():
    """Test percentage formatting with more decimal places."""
    assert format_percent(0.5555, digits=3) == "55.550%"


def test_format_percent_zero():
    """Test formatting zero as percentage."""
    assert format_percent(0) == "0.0%"


def test_format_percent_one():
    """Test formatting one (100%) as percentage."""
    assert format_percent(1) == "100.0%"


def test_format_percent_no_digits():
    """Test percentage formatting with zero decimal places."""
    assert format_percent(0.5555, digits=0) == "56%"


def test_format_percent_small_number():
    """Test formatting a very small number."""
    assert format_percent(0.001, digits=3) == "0.100%"


def test_format_percent_large_decimal():
    """Test formatting numbers greater than 1."""
    assert format_percent(1.5, digits=1) == "150.0%"

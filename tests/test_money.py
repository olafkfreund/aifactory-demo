"""Tests for the money formatter."""

import pytest

from src.app.fmt import money


class TestMoneyFormatter:
    """Test suite for the money formatter."""

    def test_zero_cents(self):
        """Test formatting zero cents."""
        assert money(0) == "$0.00"

    def test_one_dollar(self):
        """Test formatting exactly one dollar (100 cents)."""
        assert money(100) == "$1.00"

    def test_twelve_dollars_thirty_four_cents(self):
        """Test formatting $12.34."""
        assert money(1234) == "$12.34"

    def test_large_amount(self):
        """Test formatting a large amount."""
        assert money(999999) == "$9999.99"

    def test_cents_only(self):
        """Test formatting less than a dollar."""
        assert money(50) == "$0.50"

    def test_single_cent(self):
        """Test formatting a single cent."""
        assert money(1) == "$0.01"

    def test_ninety_nine_cents(self):
        """Test formatting 99 cents."""
        assert money(99) == "$0.99"

    def test_negative_amount(self):
        """Test formatting a negative amount."""
        assert money(-1234) == "-$12.34"

    def test_negative_cents_only(self):
        """Test formatting a negative amount less than a dollar."""
        assert money(-50) == "-$0.50"

    def test_negative_single_cent(self):
        """Test formatting negative single cent."""
        assert money(-1) == "-$0.01"

    def test_negative_zero(self):
        """Test formatting negative zero."""
        assert money(-0) == "$0.00"

    def test_leading_zero_cents(self):
        """Test that cents are always zero-padded."""
        assert money(101) == "$1.01"
        assert money(105) == "$1.05"

    def test_format_precision(self):
        """Test that formatting always has exactly two decimal places."""
        for amount in [10, 100, 1000, 99, 9, 0]:
            formatted = money(amount)
            assert formatted.count(".") == 1
            dollars_and_cents = formatted.replace("$", "").replace("-", "")
            assert len(dollars_and_cents.split(".")[1]) == 2

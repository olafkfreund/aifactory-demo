"""Tests for the compact number formatter utility."""

from helpers.compactnum import compact


class TestCompactBasics:
    """Test basic compact number formatting."""

    def test_compact_returns_string(self):
        """compact() should return a string."""
        assert isinstance(compact(1000), str)

    def test_compact_small_numbers_unchanged(self):
        """Numbers less than 1000 should be returned as strings."""
        assert compact(0) == "0"
        assert compact(1) == "1"
        assert compact(100) == "100"
        assert compact(999) == "999"

    def test_compact_negative_small_numbers(self):
        """Negative numbers less than 1000 should be handled."""
        assert compact(-1) == "-1"
        assert compact(-100) == "-100"
        assert compact(-999) == "-999"


class TestCompactThousands:
    """Test formatting for thousands (k suffix)."""

    def test_compact_exactly_1000(self):
        """1000 should be formatted as 1k."""
        assert compact(1000) == "1k"

    def test_compact_1500_as_1_5k(self):
        """1500 should be formatted as 1.5k."""
        assert compact(1500) == "1.5k"

    def test_compact_2000_as_2k(self):
        """2000 should be formatted as 2k."""
        assert compact(2000) == "2k"

    def test_compact_999999_as_1000k(self):
        """999999 should be formatted as 1000k (rounds up from 999.999k)."""
        assert compact(999999) == "1000k"

    def test_compact_negative_thousands(self):
        """Negative thousands should be formatted correctly."""
        assert compact(-1000) == "-1k"
        assert compact(-1500) == "-1.5k"
        assert compact(-2000) == "-2k"


class TestCompactMillions:
    """Test formatting for millions (M suffix)."""

    def test_compact_exactly_1_million(self):
        """1000000 should be formatted as 1M."""
        assert compact(1000000) == "1M"

    def test_compact_1_5_million(self):
        """1500000 should be formatted as 1.5M."""
        assert compact(1500000) == "1.5M"

    def test_compact_2_million(self):
        """2000000 should be formatted as 2M."""
        assert compact(2000000) == "2M"

    def test_compact_999_million(self):
        """999000000 should be formatted as 999M."""
        assert compact(999000000) == "999M"

    def test_compact_negative_millions(self):
        """Negative millions should be formatted correctly."""
        assert compact(-1000000) == "-1M"
        assert compact(-1500000) == "-1.5M"
        assert compact(-2000000) == "-2M"


class TestCompactBillions:
    """Test formatting for billions (B suffix)."""

    def test_compact_exactly_1_billion(self):
        """1000000000 should be formatted as 1B."""
        assert compact(1000000000) == "1B"

    def test_compact_1_5_billion(self):
        """1500000000 should be formatted as 1.5B."""
        assert compact(1500000000) == "1.5B"

    def test_compact_2_billion(self):
        """2000000000 should be formatted as 2B."""
        assert compact(2000000000) == "2B"

    def test_compact_999_billion(self):
        """999000000000 should be formatted as 999B."""
        assert compact(999000000000) == "999B"

    def test_compact_negative_billions(self):
        """Negative billions should be formatted correctly."""
        assert compact(-1000000000) == "-1B"
        assert compact(-1500000000) == "-1.5B"
        assert compact(-2000000000) == "-2B"


class TestCompactTrillions:
    """Test formatting for trillions (T suffix)."""

    def test_compact_exactly_1_trillion(self):
        """1000000000000 should be formatted as 1T."""
        assert compact(1000000000000) == "1T"

    def test_compact_1_5_trillion(self):
        """1500000000000 should be formatted as 1.5T."""
        assert compact(1500000000000) == "1.5T"

    def test_compact_2_trillion(self):
        """2000000000000 should be formatted as 2T."""
        assert compact(2000000000000) == "2T"

    def test_compact_999_trillion(self):
        """999000000000000 should be formatted as 999T."""
        assert compact(999000000000000) == "999T"

    def test_compact_negative_trillions(self):
        """Negative trillions should be formatted correctly."""
        assert compact(-1000000000000) == "-1T"
        assert compact(-1500000000000) == "-1.5T"
        assert compact(-2000000000000) == "-2T"


class TestCompactFloats:
    """Test formatting with float inputs."""

    def test_compact_float_small(self):
        """Small float numbers should work."""
        assert compact(999.5) == "999.5"

    def test_compact_float_thousands(self):
        """Float numbers in thousands should be formatted."""
        assert compact(1500.5) == "1.5k"

    def test_compact_float_millions(self):
        """Float numbers in millions should be formatted."""
        assert compact(1500000.5) == "1.5M"


class TestCompactEdgeCases:
    """Test edge cases and boundary conditions."""

    def test_compact_999(self):
        """999 should remain as is."""
        assert compact(999) == "999"

    def test_compact_1000(self):
        """1000 is the boundary for k suffix."""
        assert compact(1000) == "1k"

    def test_compact_zero(self):
        """Zero should be handled."""
        assert compact(0) == "0"

    def test_compact_very_large_number(self):
        """Very large numbers should be formatted."""
        assert compact(1234567890123) == "1.2T"

    def test_compact_removes_trailing_zeros(self):
        """Trailing zeros should be removed from decimal part."""
        assert compact(1000000) == "1M"  # Not "1.0M"
        assert compact(2000000) == "2M"  # Not "2.0M"
        assert compact(1500000) == "1.5M"  # Keeps meaningful decimal

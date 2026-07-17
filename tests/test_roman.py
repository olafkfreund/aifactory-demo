"""Tests for the Roman numeral converter."""
import pytest

from helpers.roman import to_roman


class TestToRoman:
    """Test suite for to_roman function."""

    def test_single_digits(self):
        """Test conversion of single digit numbers."""
        assert to_roman(1) == "I"
        assert to_roman(2) == "II"
        assert to_roman(3) == "III"
        assert to_roman(4) == "IV"
        assert to_roman(5) == "V"
        assert to_roman(6) == "VI"
        assert to_roman(7) == "VII"
        assert to_roman(8) == "VIII"
        assert to_roman(9) == "IX"

    def test_tens(self):
        """Test conversion of tens."""
        assert to_roman(10) == "X"
        assert to_roman(11) == "XI"
        assert to_roman(20) == "XX"
        assert to_roman(30) == "XXX"
        assert to_roman(40) == "XL"
        assert to_roman(50) == "L"
        assert to_roman(60) == "LX"
        assert to_roman(90) == "XC"

    def test_hundreds(self):
        """Test conversion of hundreds."""
        assert to_roman(100) == "C"
        assert to_roman(200) == "CC"
        assert to_roman(300) == "CCC"
        assert to_roman(400) == "CD"
        assert to_roman(500) == "D"
        assert to_roman(600) == "DC"
        assert to_roman(900) == "CM"

    def test_thousands(self):
        """Test conversion of thousands."""
        assert to_roman(1000) == "M"
        assert to_roman(2000) == "MM"
        assert to_roman(3000) == "MMM"
        assert to_roman(3999) == "MMMCMXCIX"

    def test_examples_from_spec(self):
        """Test specific examples from the specification."""
        assert to_roman(1) == "I"
        assert to_roman(4) == "IV"
        assert to_roman(9) == "IX"
        assert to_roman(58) == "LVIII"
        assert to_roman(3999) == "MMMCMXCIX"

    def test_combined_values(self):
        """Test various combined values."""
        assert to_roman(27) == "XXVII"
        assert to_roman(48) == "XLVIII"
        assert to_roman(59) == "LIX"
        assert to_roman(93) == "XCIII"
        assert to_roman(141) == "CXLI"
        assert to_roman(163) == "CLXIII"
        assert to_roman(402) == "CDII"
        assert to_roman(575) == "DLXXV"
        assert to_roman(1994) == "MCMXCIV"

    def test_boundary_values(self):
        """Test boundary values."""
        assert to_roman(1) == "I"  # Minimum
        assert to_roman(3999) == "MMMCMXCIX"  # Maximum

    def test_invalid_input_too_small(self):
        """Test that values below 1 raise ValueError."""
        with pytest.raises(ValueError, match="between 1 and 3999"):
            to_roman(0)
        with pytest.raises(ValueError, match="between 1 and 3999"):
            to_roman(-1)

    def test_invalid_input_too_large(self):
        """Test that values above 3999 raise ValueError."""
        with pytest.raises(ValueError, match="between 1 and 3999"):
            to_roman(4000)
        with pytest.raises(ValueError, match="between 1 and 3999"):
            to_roman(5000)

    def test_invalid_input_non_integer(self):
        """Test that non-integer inputs raise ValueError."""
        with pytest.raises(ValueError, match="must be an integer"):
            to_roman(1.5)
        with pytest.raises(ValueError, match="must be an integer"):
            to_roman("10")
        with pytest.raises(ValueError, match="must be an integer"):
            to_roman(None)

    def test_invalid_input_boolean(self):
        """Test that boolean inputs raise ValueError."""
        with pytest.raises(ValueError, match="must be an integer"):
            to_roman(True)
        with pytest.raises(ValueError, match="must be an integer"):
            to_roman(False)
